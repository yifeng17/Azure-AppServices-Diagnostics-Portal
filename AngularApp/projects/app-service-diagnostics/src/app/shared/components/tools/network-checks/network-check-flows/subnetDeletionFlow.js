import { DropdownStepView, InfoStepView, StepFlow, StepFlowManager, CheckStepView, StepViewContainer, InputStepView, PromiseCompletionSource, TelemetryService } from 'diagnostic-data';
import { SubnetDeletionRecommendations } from './subnetDeletionRecommendations.js';
import { addSubnetSelectionDropDownView, getWebAppVnetInfo } from './flowMisc.js';
import { CommonRecommendations } from './commonRecommendations.js';

export var subnetDeletionFlow = {
    title: "I'm unable to delete a subnet or VNet with error: Subnet is in use by serviceAssociationLinks/AppServiceLink",
    async func(siteInfo, diagProvider, flowMgr) {
        var commonRec = new CommonRecommendations();
        addSubnetSelectionDropDownView(siteInfo, diagProvider, flowMgr, "Please select the subnet you want to delete", async subnet => {
            console.log(subnet);
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
                var deleteSalPromise = deleteSalAsync(orphanedSal, subnet, diagProvider, flowMgr);
                flowMgr.addViews(deleteSalPromise, "Try deleting the SAL, please DO NOT close the browser...");
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
    var recommendations = new SubnetDeletionRecommendations();
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
                views.push(recommendations.SubnetIsLocked.Get(subnetLocks, diagProvider.generateResourcePortalLink(`/subscriptions/${siteInfo.subscriptionId}/locks`)));
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
    var recommendations = new SubnetDeletionRecommendations();
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

                        var result = await diagProvider.getArmResourceAsync(aspSites[i].id + "/slots");
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
                    views.push(new CheckStepView({
                        title: `Orphaned SAL detected: ${sal.id.replace("/virtualNetworks/", "\r\n/virtualNetworks/")}`,
                        level: 1
                    }));
                } else {
                    views.push(new CheckStepView({
                        title: `Subnet is used by ${appsConnected.length} app(s)`,
                        level: 1
                    }));
                    views.push(recommendations.SubnetIsInUse.Get(appsConnected));
                }

            } else if (aspSitesResult.status == 401) {
                views.push(new CheckStepView({
                    title: `You don't have permission to read serverfarm ${asp}`,
                    level: 1
                }));
                views.push(recommendations.NoPermission.Get(asp));

            } else if (aspSitesResult.status == 404) {
                orphanedSal = sal;
                views.push(new CheckStepView({
                    title: `Orphaned SAL detected: ${sal.id.replace("/virtualNetworks/", "\r\n/virtualNetworks/")}`,
                    level: 1
                }));
            } else {
                flowMgr.logException(result.message, "checkSalAsync");
            }
        } else {
            views.push(new CheckStepView({
                title: "Subnet is not used by AppService",
                level: 0
            }));
            views.push(recommendations.SubnetIsNotUsedByAppService.Get());
        }
    } else {
        views.push(new CheckStepView({
            title: "Subnet is not used by any Azure Service",
            level: 0
        }));
        views.push(recommendations.SubnetIsNotUsed.Get());
    }
    return { views, orphanedSal };
}

async function deleteSalAsync(sal, subnet, diagProvider, flowMgr) {
    var asp = sal.properties.link;
    var aspResult = await diagProvider.getArmResourceAsync(asp);
    var views = [];
    if (aspResult != null && aspResult.status == 200) {
        var success = false;
        try {
            await tryCreateApp(aspResult, diagProvider, flowMgr);
            await tryConnectAndDisconnectSubnet(aspResult, subnet, diagProvider, flowMgr);
            success = true;
        } catch (e) {
            console.log(e);
        } finally {
            await tryDeleteApp(aspResult, diagProvider, flowMgr);
        }

        if (success) {
            views.push(new CheckStepView({
                title: "Successfully removed orphaned SAL, please hit refresh button and run the checks again.",
                level: 0
            }));
        } else {
            views.push(new CheckStepView({
                title: "Failed to remove orphaned SAL, please consider for creating a support request.",
                level: 2
            }));
        }
    } else {
        views.push(new CheckStepView({
            title: "App Service plan does not exist, please consider asking for support.",
            level: 2
        }));
    }

    return views;
}

async function tryCreateApp(asp, diagProvider, flowMgr) {
    var siteName = asp.name + "SalDeletion";
    var uri = `/subscriptions/${asp.properties.subscription}/resourceGroups/${asp.properties.resourceGroup}` +
        `/providers/Microsoft.Resources/deployments/NetworkTroubleshooter-SalDeletion`
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
                "resources": [
                    {
                        "apiVersion": "2018-11-01",
                        "name": siteName,
                        "type": "Microsoft.Web/sites",
                        "location": asp.location,
                        "tags": null,
                        "dependsOn": [],
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
                        }
                    }
                ]
            },
            "validationLevel": "Template"
        },
        "tags": {
            "marketplaceItemId": "Microsoft.WebSite",
            "provisioningHash": "customize-post-provisioning-steps-webapp-deployment"
        }
    };
    var result = await diagProvider.requestResourceAsync("PUT", uri, template, "2020-06-01");
    if (result.status != 200) {
        throw new Error(`Unexpected status ${result.status} ${result.statusText}`);
    }
    var completed = false;
    while (!completed) {
        await delay(1);
        result = await diagProvider.requestResourceAsync("GET", uri, null, "2020-06-01");
        completed = (result.body.properties.provisioningState == "Succeeded");
        if (!["Succeeded", "Accepted", "Running"].includes(result.body.properties.provisioningState)) {
            throw new Error(`Unexpected provisioningState ${result.body.properties.provisioningState}`);
        }
    }
}

async function tryDeleteApp(asp, diagProvider, flowMgr) {
    var siteName = asp.name + "SalDeletion";
    var uri = `/subscriptions/${asp.properties.subscription}/resourceGroups/${asp.properties.resourceGroup}` +
        `/providers/Microsoft.Web/sites/${siteName}`
    var result = await diagProvider.requestResourceAsync("DELETE", uri, null, "2018-11-01");
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