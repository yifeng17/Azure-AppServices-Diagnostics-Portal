import { DropdownStepView, InfoStepView, StepFlow, StepFlowManager, CheckStepView, StepViewContainer, InputStepView, PromiseCompletionSource, TelemetryService } from 'diagnostic-data';
import { SubnetDeletionWordings } from './subnetDeletionWordings.js';
import { addSubnetSelectionDropDownView, getWebAppVnetInfo } from './flowMisc.js';
import { CommonRecommendations } from './commonRecommendations.js';

export var subnetDeletionFlow = {
    title: "Subnet/VNet deletion issue",
    async func(siteInfo, diagProvider, flowMgr) {
        var commonRec = new CommonRecommendations();
        addSubnetSelectionDropDownView(siteInfo, diagProvider, flowMgr, "Please select the subnet you want to delete", async (subnet, vnet) => {
            var lockPromise = checkSubnetLocksAsync(subnet, siteInfo, diagProvider, flowMgr);
            flowMgr.addViews(lockPromise.then(r => r.views), "Checking locks...");
            var isContinue = (await lockPromise).isContinue;
            if (!isContinue) {
                return;
            }
            var salPromise = checkSalAsync(subnet, siteInfo, diagProvider, flowMgr);
            flowMgr.addViews(salPromise.then(r => r.views), "Checking subnet usage...");
            var orphanedSal = (await salPromise).orphanedSal;
            if (orphanedSal != null) {
                var asp = null;
                try {
                    asp = tryParseAspId(orphanedSal.properties.link);
                } catch (e) {
                    flowMgr.addView(new CheckStepView({
                        title: `Failed to delete SAL because SAL object is invalid, please consider creating a support request.`,
                        level: 2
                    }));
                }
                if (asp != null) {
                    var resourceGroupUri = `/subscriptions/${asp.subscription}/resourceGroups/${asp.resourceGroup}`;
                    var writeDeletePermCheckResult = checkWriteDeletePermissionAsync(resourceGroupUri, diagProvider, flowMgr);
                    flowMgr.addViews(writeDeletePermCheckResult.then(r => r.views), "Checking write and delete permission...");
                    isContinue = await writeDeletePermCheckResult.then(r => r.isContinue);
                    if (!isContinue) {
                        return;
                    }

                    var resourceCreationPromise = getResourceCreationListAsync(asp, diagProvider, flowMgr);
                    flowMgr.addViews(resourceCreationPromise.then(r => r.views), "Checking resources...");
                    var result = await resourceCreationPromise;
                    isContinue = result.isContinue;
                    if (!isContinue) {
                        return;
                    }

                    flowMgr.addView(new ButtonStepView({
                        callback: () => {
                            var deleteSalPromise = deleteSalAsync(orphanedSal, subnet, vnet, result.creationList, diagProvider, flowMgr);
                            flowMgr.addViews(deleteSalPromise);
                        },
                        text: "Continue"
                    }));
                }
            }
        })
    }
}

function delay(second) {
    return new Promise(resolve =>
        setTimeout(resolve, second * 1000));
}

async function getSubnetLocksAsync(siteInfo, diagProvider, flowMgr) {
    try {
        var result = await diagProvider.getArmResourceAsync(`/subscriptions/${siteInfo.subscriptionId}/providers/Microsoft.Authorization/locks`, "2016-09-01");
        return result;
    } catch (e) {
        flowMgr.logException(e, "checkSubnetLocks");
        return null;
    }
}

async function checkSubnetLocksAsync(subnet, siteInfo, diagProvider, flowMgr) {
    var result = await getSubnetLocksAsync(siteInfo, diagProvider, flowMgr);
    var recommendations = new SubnetDeletionWordings();
    var views = [];
    var isContinue = true;
    if (result != null) {
        if (result.status == 200) {
            var locks = result.value;
            var regex = /\/providers\/Microsoft\.Authorization\/locks\/.*/;
            var subnetLocks = locks.filter(l => subnet.id.includes(l.id.replace(regex, "")));
            if (subnetLocks.length > 0) {
                views.push(new CheckStepView({
                    title: "Subnet is locked",
                    level: 2
                }));
                views.push(recommendations.subnetIsLocked.get(subnetLocks, diagProvider.generateResourcePortalLink(`/subscriptions/${siteInfo.subscriptionId}/locks`)));
                isContinue = false;
            } else {
                views.push(new CheckStepView({
                    title: "Subnet is not locked",
                    level: 0
                }));
            }
        }
    }
    return { views, isContinue };
}

async function checkSalAsync(subnet, siteInfo, diagProvider, flowMgr) {
    var sals = subnet.properties.serviceAssociationLinks;
    var wordings = new SubnetDeletionWordings();
    var views = [];
    var orphanedSal = null;
    var appsConnected = [];
    if (sals != null) {
        var appServiceSals = sals.filter(sal => sal.properties.linkedResourceType == "Microsoft.Web/serverfarms");
        if (appServiceSals.length > 0) {
            // for now, one subnet only can be integrated by apps in one app service plan
            if (appServiceSals.length > 1) {
                flowMgr.logException(new Error("unexpected multiple App Service SAL"), "checkSalAsync");
            }
            var sal = appServiceSals[0];
            var asp = sal.properties.link;
            var aspSitesResult = await diagProvider.getArmResourceAsync(asp + "/sites", "2018-11-01");
            if (aspSitesResult.status == 200) {
                var aspSites = aspSitesResult.value;
                if (aspSites != null) {
                    for (var i = 0; i < aspSites.length; ++i) {
                        let vnetInfo = await getWebAppVnetInfo(aspSites[i].id, diagProvider);
                        let subnetId = vnetInfo.properties.subnetResourceId;
                        if (subnet.id == subnetId) {
                            appsConnected.push(aspSites[i]);
                        }
                        var result = await diagProvider.getArmResourceAsync(aspSites[i].id + "/slots", "2018-11-01");
                        if (result.status == 200) {
                            var slots = result.value;
                            for (var j = 0; j < slots.length; ++j) {
                                let vnetInfo = await getWebAppVnetInfo(slots[j].id, diagProvider);
                                let subnetId = vnetInfo.properties.subnetResourceId;
                                if (subnet.id == subnetId) {
                                    appsConnected.push(slots[j]);
                                }
                            }
                        }

                    }
                }
                if (appsConnected.length == 0) {
                    orphanedSal = sal;
                    views = views.concat(wordings.orphanSalDetected.get(sal.id));
                } else {
                    views.push(new CheckStepView({
                        title: `Subnet is used by ${appsConnected.length} app(s)`,
                        level: 1
                    }));
                    views.push(wordings.subnetIsInUse.get(appsConnected));
                }

            } else if (aspSitesResult.status == 401) {
                views = views.concat(wordings.noPermission.get(asp));
            } else if (aspSitesResult.status == 404) {
                orphanedSal = sal;
                views = views.concat(wordings.orphanSalDetected.get(sal.id));
            } else {
                logDebugMessage(aspSitesResult.message);
                flowMgr.logException(aspSitesResult.message, "checkSalAsync");
                views.push(new CheckStepView({
                    title: `Failed to check App Service plan, unknown result ${aspSitesResult.message}`,
                    level: 3
                }));
            }
        } else {
            views.push(new CheckStepView({
                title: "Subnet is not used by AppService",
                level: 0
            }));
            views.push(wordings.subnetIsNotUsedByAppService.get());
        }
    } else {
        views.push(new CheckStepView({
            title: "Subnet is not used by any Azure Service",
            level: 0
        }));
        views.push(wordings.subnetIsNotUsed.get());
    }
    return { views, orphanedSal };
}

async function deleteSalAsync(sal, subnet, vnet, creationList, diagProvider, flowMgr) {
    var deletionPromise = new PromiseCompletionSource();
    flowMgr.addViews(deletionPromise, "Try deleting the SAL, this process can take up to 5 mins, please DO NOT close the browser...");
    var cleanUpPromise = new PromiseCompletionSource();
    var state = flowMgr.addViews(cleanUpPromise, "Try cleaning up temporal resources, this process can take up to 5 mins, please DO NOT close the browser...");
    var retryView = null;
    var asp = sal.properties.link;
    var aspResult = await diagProvider.getArmResourceAsync(asp);
    var wordings = new SubnetDeletionWordings();
    var views = [];
    var deletionResult = null;
    if (aspResult != null && (aspResult.status == 200 || aspResult.status == 404)) {
        var success = false;
        try {
            await tryCreateApp(asp, subnet, vnet, creationList, diagProvider, flowMgr);
            // await tryConnectAndDisconnectSubnet(aspResult, subnet, diagProvider, flowMgr);
        } catch (e) {
            logDebugMessage(e);
        } finally {
            deletionPromise.resolve([]);
            try {
                deletionResult = await tryDeleteApp(asp, creationList, diagProvider, flowMgr);
                var deletionSuccess = Object.values(deletionResult).every(i => i == true);
                if (!deletionSuccess) {
                    retryView = new ButtonStepView({
                        callback: async () => {
                            flowMgr.reset(state);
                            var cleanUpPromise = new PromiseCompletionSource();
                            flowMgr.addViews(cleanUpPromise, "Try cleaning up temporal resources, this process can take up to 5 mins, please DO NOT close the browser...");
                            var deletionResult = await tryDeleteApp(asp, creationList, diagProvider, flowMgr);
                            var salResult = await checkResourceStatusAsync(sal.id, "GET", diagProvider);
                            success = (salResult.status == 404);
                            cleanUpPromise.resolve(wordings.salDeletionResult.get(success, deletionResult));
                            var deletionSuccess = Object.values(deletionResult).every(i => i == true);
                            if (!deletionSuccess) {
                                retryView.hidden = false;
                                flowMgr.addView(retryView);
                            }
                        },
                        text: "Retry"
                    });
                }
            } finally {
                cleanUpPromise.resolve([]);
            }
        }
        var salResult = await checkResourceStatusAsync(sal.id, "GET", diagProvider);
        success = (salResult.status == 404);
        views = wordings.salDeletionResult.get(success, deletionResult);

    } else {
        views.push(new CheckStepView({
            title: "Failed to delete SAL, please consider asking for support.",
            level: 2
        }));
    }

    views.push(retryView);
    return views;
}

async function tryCreateApp(aspId, subnet, vnet, creationList, diagProvider, flowMgr) {
    var createAsp = creationList.asp;
    var createRg = creationList.resourceGroup;
    var asp = tryParseAspId(aspId);
    var siteName = asp.name + "SalDeletion";
    var uri = `/subscriptions/${asp.subscription}` +
        `/providers/Microsoft.Resources/deployments/NetworkTroubleshooter-SalDeletion`;
    var vnetConfigUri = `/subscriptions/${asp.subscription}/resourceGroups/${asp.resourceGroup}` +
        `/providers/Microsoft.Web/sites/${siteName}/networkconfig/virtualNetwork`; //2018-11-01

    var template = {
        "properties": {
            "mode": "incremental",
            "debugSetting": {
                "detailLevel": "none"
            },
            "parameters": {
            },
            "template": {
                "$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
                "contentVersion": "1.0.0.0",
                "parameters": {
                },
                "resources": []
            },
            "validationLevel": "Template"
        },
        "location": vnet.location,
        "tags": {
            "marketplaceItemId": "Microsoft.Template"
        }
    };

    if (createRg) {
        var rgResource = {
            "type": "Microsoft.Resources/resourceGroups",
            "apiVersion": "2020-10-01",
            "name": asp.resourceGroup,
            "location": vnet.location,
            "properties": {},
        };

        var rgDeploymentResource = {
            "type": "Microsoft.Resources/deployments",
            "apiVersion": "2020-10-01",
            "name": "RgDeployment",
            "location": vnet.location,
            "dependsOn": [],
            "properties": {
                "mode": "Incremental",
                "template": {
                    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
                    "contentVersion": "1.0.0.0",
                    "parameters": {},
                    "variables": {},
                    "resources": [rgResource],
                    "outputs": {}
                }
            }
        };

        template.properties.template.resources.push(rgResource);
    }

    var aspDeploymentResource = {
        "type": "Microsoft.Resources/deployments",
        "apiVersion": "2020-10-01",
        "name": "AppServiceDeployment",
        "resourceGroup": asp.resourceGroup,
        "dependsOn": createRg ? ["Microsoft.Resources/resourceGroups/" + asp.resourceGroup] : [], //createRg ? ["Microsoft.Resources/deployments/RgDeployment"] : [],
        "properties": {
            "mode": "Incremental",
            "template": {
                "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
                "contentVersion": "1.0.0.0",
                "parameters": {},
                "variables": {},
                "resources": [],
                "outputs": {}
            }
        }
    };

    var websiteResource = {
        "apiVersion": "2018-11-01",
        "name": siteName,
        "type": "Microsoft.Web/sites",
        "location": vnet.location,
        "tags": {
            "CreatedByNetworkTroubleshooter": "If you see this tag, this means this resource failed to be cleaned up, please delete it manually"
        },
        "dependsOn": createAsp ? ["Microsoft.Web/serverfarms/" + asp.name] : [], // createRg ? ["Microsoft.Resources/resourceGroups/" + asp.resourceGroup, "Microsoft.Web/serverfarms/" + asp.name] : (
        "properties": {
            "name": siteName,
            "siteConfig": {
                "appSettings": [
                    {
                        "name": "ANCM_ADDITIONAL_ERROR_PAGE_LINK",
                        "value": ""
                    }
                ],
                "metadata": [
                    {
                        "name": "CURRENT_STACK",
                        "value": "dotnetcore"
                    }
                ],
                "phpVersion": "OFF",
                "alwaysOn": "false"
            },
            "serverFarmId": asp.id,
            "clientAffinityEnabled": true
        },
        "resources": [
            {
                "name": "virtualNetwork",
                "type": "config",
                "apiVersion": "2018-11-01",
                "location": vnet.location,
                "dependsOn": ["Microsoft.Web/sites/" + siteName],
                "properties": {
                    "subnetResourceId": subnet.id, //"/subscriptions/8ee49137-b1a2-4c6f-9e7f-6fe62eaa238a/resourceGroups/VNetStuff/providers/Microsoft.Network/virtualNetworks/JeffTestVNet/subnets/SalTest",//subnet.id,
                    "swiftSupported": true
                }
            }//*/
        ],
    };

    aspDeploymentResource.properties.template.resources.push(websiteResource);

    if (createAsp) {
        var aspResource = {
            "apiVersion": "2018-11-01",
            "name": asp.name,
            "type": "Microsoft.Web/serverfarms",
            "location": vnet.location,
            "kind": "",
            "tags": {
                "CreatedByNetworkTroubleshooter": "If you see this tag, this means this resource failed to be cleaned up, please delete it manually"
            },
            "dependsOn": [],
            "properties": {
                "name": asp.name,
                "workerSize": "3",
                "workerSizeId": "3",
                "numberOfWorkers": "1"
            },
            "sku": {
                "Tier": "PremiumV2",
                "Name": "P1v2"
            }
        };
        aspDeploymentResource.properties.template.resources.push(aspResource);
    }
    template.properties.template.resources.push(aspDeploymentResource);

    var result = await diagProvider.requestResourceAsync("PUT", uri, template, "2020-10-01");
    if (!(result.status >= 200 && result.status < 300)) {
        throw new Error(`Unexpected status ${result.status} ${result.statusText}`);
    }
    var completed = false;
    while (!completed) {
        await delay(3);
        result = await diagProvider.requestResourceAsync("GET", uri, null, "2020-10-01");
        completed = (result.body.properties.provisioningState == "Succeeded");
        if (!["Succeeded", "Accepted", "Running"].includes(result.body.properties.provisioningState)) {
            throw new Error(`Unexpected provisioningState ${result.body.properties.provisioningState}`);
        }
    }
}

async function tryDeleteApp(aspId, creationList, diagProvider, flowMgr) {
    var asp = tryParseAspId(aspId);
    var resourceGroupUri = `/subscriptions/${asp.subscription}/resourceGroups/${asp.resourceGroup}`;
    var result = {};
    var siteId = `/subscriptions/${asp.subscription}/resourceGroups/${asp.resourceGroup}/providers/Microsoft.Web/sites/${asp.name}SalDeletion`;
    if (creationList.resourceGroup) {
        result[resourceGroupUri] = false;
        result[asp.id] = false;
        result[siteId] = false;
        var succeeded = await tryDeleteResource(resourceGroupUri, diagProvider);
        if (succeeded) {
            result[resourceGroupUri] = true;
            result[asp.id] = true;
            result[siteId] = true;
            return result;
        }
    }

    result[siteId] = false;
    if (creationList.asp) {
        result[asp.id] = false;
    }
    var succeeded = await tryDeleteResource(siteId, diagProvider);
    if (succeeded) {
        result[siteId] = true;
        await delay(1);

        if (creationList.asp) {
            succeeded = await tryDeleteResource(asp.id, diagProvider);
            if (succeeded) {
                result[asp.id] = true;
                return result;
            }
        }
    }



    return result;
}

async function tryDeleteResource(uri, diagProvider) {
    var result = await diagProvider.requestResourceAsync("DELETE", uri, null, "2020-10-01");
    if (!(result.status >= 200 && result.status < 300) && result.status != 404) {
        return false;
    }
    var completed = false;
    while (!completed) {
        await delay(3);
        result = await diagProvider.requestResourceAsync("GET", uri, null, "2020-10-01");
        if (result.status == 404) {
            return true;
        }
        else if (!(result.status >= 200 && result.status < 300)) {
            return false;
        }
        if (result.body.properties.provisioningState != "Deleting") {
            return false;
        }
    }
}

async function tryConnectAndDisconnectSubnet(asp, subnet, diagProvider, flowMgr) {
    var siteName = asp.name + "SalDeletion";
    var uri = `/subscriptions/${asp.properties.subscription}/resourceGroups/${asp.properties.resourceGroup}` +
        `/providers/Microsoft.Web/sites/${siteName}/networkconfig/virtualNetwork`; //2018-11-01
    var template = {
        "location": asp.location,
        "id": uri,
        "properties": {
            "subnetResourceId": subnet.id,
            "swiftSupported": true
        }
    };

    var result = await diagProvider.requestResourceAsync("PUT", uri, template, "2018-11-01");
    if (result.status != 200) {
        throw new Error(`Unexpected status ${result.status} ${result.statusText}`);
    }
    await delay(0.5);
    result = await diagProvider.requestResourceAsync("DELETE", uri, null, "2018-11-01");
}

function tryParseAspId(aspId) {
    var m = aspId.match("/subscriptions/(.*?)/resourceGroups/(.*?)/providers/Microsoft.Web/serverfarms/(.*)");
    return { id: aspId, subscription: m[1], resourceGroup: m[2], name: m[3] };
}

async function checkResourceStatusAsync(resourceId, method, diagProvider) {
    var result = await diagProvider.requestResourceAsync(method, resourceId, null, "2018-11-01");
    return result.status;
}

async function checkWriteDeletePermissionAsync(uri, diagProvider, flowMgr) {
    var isContinue = true;
    var views = [];
    var writePermission = true, deletePermission = true;
    var status = await checkResourceStatusAsync(`${uri}/test`, "PUT", diagProvider);
    if (status != 404) {
        writePermission = false;
    }

    status = await checkResourceStatusAsync(`${uri}/test`, "DELETE", diagProvider);
    if (status != 404) {
        deletePermission = false;
    }

    var wordings = new SubnetDeletionWordings();
    isContinue = writePermission && deletePermission;
    if (!isContinue) {
        views = views.concat(wordings.noWriteDeletePermissionOverScope.get(uri, writePermission, deletePermission));
    }
    return { views, isContinue };
}

async function getResourceCreationListAsync(asp, diagProvider, flowMgr) {
    var list = { asp: false, resourceGroup: false };
    var isContinue = true;
    var resourceGroupUri = `/subscriptions/${asp.subscription}/resourceGroups/${asp.resourceGroup}`;
    var siteId = `/subscriptions/${asp.subscription}/resourceGroups/${asp.resourceGroup}/providers/Microsoft.Web/sites/${asp.name}SalDeletion`;
    var subscriptionExisted = true;
    var wordings = new SubnetDeletionWordings();

    var status = await checkResourceStatusAsync(asp.id, "GET", diagProvider);
    var aspExisted = (status == 200);
    if (!aspExisted) {
        list.asp = true;
        status = await checkResourceStatusAsync(resourceGroupUri, "GET", diagProvider);
        var rgExisted = (status == 200);
        if (!rgExisted) {
            list.resourceGroup = true;
            status = await checkResourceStatusAsync(`/subscriptions/${asp.subscription}`, "GET", diagProvider);
            if (status != 200) {
                subscriptionExisted = false;
            }
        }
    }

    if (subscriptionExisted) {
        var resources = {
            Webapp: siteId
        };
        if (list.asp) {
            resources["AppService Plan"] = asp.id;
        }

        if (list.resourceGroup) {
            resources["Resource Group"] = resourceGroupUri;
        }


        views = wordings.resourcesGoingToCreate.get(resources);
    } else {
        isContinue = false;
        views = wordings.subscriptionNotExist.get(asp.subscription);
    }
    return { views, isContinue, creationList: list };
}