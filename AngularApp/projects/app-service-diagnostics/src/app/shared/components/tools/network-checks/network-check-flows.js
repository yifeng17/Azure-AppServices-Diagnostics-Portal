"use strict"

export var networkCheckFlows =  {
    vnetConfigurationFlow: {
        title: "I'm unable to connect to a resource, such as SQL or Redis or on-prem, in my Virtual Network",
        async func(siteInfo, diagProvider, flowMgr) {
            var isKuduAccessible = true;


            var kudoAvailabilityCheckPromise = (async () => {
                isKuduAccessible = await diagProvider.checkKudoReachable();
                var views = [];
                if (isKuduAccessible == false) {
                    views.push(new CheckStepView({
                        title: "kudo is not reachable",
                        level: 1
                    }));

                    views.push(new InfoStepView({
                        infoType: 0,
                        title: "Recommendations",
                        markdown: "[Kudo](https://techcommunity.microsoft.com/t5/educator-developer-blog/using-kudu-and-deploying-apps-into-azure/ba-p/378585) is not accessible " +
                            "because of IP restriction or Private Endpoint is turned for this app.\r\n\r\n" + 
                            "The check diagnostic will be incomplete without kudu access, please consider temporarily allow the traffic in IP restriction or turn of the Private Endpoint " +
                            "for running the network checks"
                    }));
                }
                return views;
            })();
            flowMgr.addViews(kudoAvailabilityCheckPromise, "Checking kudo availability...");

            var kudoReachablePromise = kudoAvailabilityCheckPromise.then(r => isKuduAccessible);
            var promise = checkVnetIntegrationAsync(siteInfo, diagProvider, kudoReachablePromise);
            flowMgr.addViews(promise.then(d => d.views), "Checking Vnet integration status...");
            var data = { subnetDataPromise: promise.then(d => d.subnetData), serverFarmId: siteInfo["serverFarmId"], kudoReachablePromise, isContinuedPromise: promise.then(d => d.isContinue) };
            checkNetworkConfigAndConnectivity(siteInfo, diagProvider, flowMgr, data);
        }
    },

    configurationCheckFlow: {
        title: "I tried to configure VNet integration via Azure Portal or ARM template, but failed with errors",
        async func(siteInfo, diagProvider, flowMgr) {
            var vnets = null, subnets = null, subscriptions = null;
            var dropdownView = new DropdownStepView({
                dropdowns: [],
                width: "60%",
                bordered: true,
                description: "Please select the subnet you want to integrate",
                async callback(dropdownIdx, selectedIdx) {
                    if (dropdownIdx == 0) {
                        dropdownView.dropdowns.length = 1;
                        var subscription = subscriptions[selectedIdx];
                        var vnetDropdown = vnetDropdown = {
                            description: "Virtual Network",
                            options: [],
                            placeholder: "Loading..."
                        };
                        dropdownView.dropdowns.push(vnetDropdown);
                        vnets = await diagProvider.getArmResourceAsync(`/subscriptions/${subscription.subscriptionId}/providers/Microsoft.Network/virtualNetworks`, "2018-07-01");
                        dropdownView.dropdowns.length = 1;
                        vnets = vnets.value.sort((s1, s2) => s1.name.toLowerCase() > s2.name.toLowerCase() ? 1 : -1);

                        if (vnets.length > 0) {
                            vnetDropdown = {
                                description: "Virtual Network",
                                options: vnets.map(s => s.name),
                                placeholder: "Please select..."
                            };
                        } else {
                            vnetDropdown = {
                                description: "Virtual Network",
                                options: [],
                                placeholder: "No VNet found in this subscription"
                            }
                        }
                        dropdownView.dropdowns.push(vnetDropdown);
                    } else if (dropdownIdx == 1) {
                        dropdownView.dropdowns.length = 2;
                        var vnet = vnets[selectedIdx];
                        subnets = vnet.properties.subnets.sort((s1, s2) => s1.name.toLowerCase() > s2.name.toLowerCase() ? 1 : -1);
                        var subnetDropdown = null;
                        if (subnets.length > 0) {
                            subnetDropdown = {
                                description: "Subnet",
                                options: subnets.map(s => s.name),
                                placeholder: "Please select..."
                            };
                        } else {
                            subnetDropdown = {
                                description: "Subnet",
                                options: [],
                                placeholder: "No subnet found in this VNet"
                            }
                        }
                        dropdownView.dropdowns.push(subnetDropdown);
                    } else {
                        flowMgr.reset(state);
                        var subnet = subnets[selectedIdx];
                        var promise = checkSubnetAvailabilityAsync(siteInfo, diagProvider, subnet);
                        flowMgr.addViews(promise, "Checking subnet...");
                    }
                }
            });


            var subscriptionDropdown = {
                description: "Subscription",
                options: [],
                placeholder: "Loading..."
            };
            dropdownView.dropdowns.push(subscriptionDropdown);
            var state = flowMgr.addView(dropdownView);

            diagProvider.getArmResourceAsync("subscriptions")
                .then(s => {
                    subscriptions = s.value.sort((s1, s2) => s1.displayName.toLowerCase() > s2.displayName.toLowerCase() ? 1 : -1);
                    subscriptionDropdown.options = subscriptions.map(s => s.displayName);
                    subscriptionDropdown.placeholder = "Please select...";
                    dropdownView.dropdowns.length = 0;
                    dropdownView.dropdowns.push(subscriptionDropdown);
                });
        }
    }
}

async function GetArmData(resourceId, diagProvider) {
    var apiVersion = "2018-07-01";//"2020-11-01"
    var armData = null;
    if (resourceId.includes("/subnets/")) {
        armData = await diagProvider.getArmResourceAsync(resourceId, apiVersion);
    }
    else if (resourceId.includes("Microsoft.Network/virtualNetworks/")) {
        //armData = await GetVirtualNetwork(resourceId, armService);
        armData = await diagProvider.getArmResourceAsync(resourceId, apiVersion);
    }

    else if (resourceId.includes("Microsoft.Network/networkSecurityGroups")) {
        armData = await diagProvider.getArmResourceAsync(resourceId, apiVersion);
    }
    else if (resourceId.includes("Microsoft.Network/routeTables")) {
        armData = await diagProvider.getArmResourceAsync(resourceId, apiVersion);
    }
    else if (resourceId.includes("config/virtualNetwork")) {
        armData = await diagProvider.getArmResourceAsync(resourceId);
    }
    else if (resourceId.includes("/virtualNetworkConnections")) {
        armData = await diagProvider.getArmResourceAsync(resourceId);
    }
    else {
        armData = await diagProvider.getArmResourceAsync(resourceId);
    }
    return armData;
}

function parseSubnetUri(subnetUri) {
    var subnetName;
    if (subnetUri.includes("/subnets/")) {
        subnetName = subnetUri.split("/subnets/")[1];
    }
    var subnetLink = `[${subnetName}](https://portal.azure.com/#resource${subnetUri})`
    return subnetLink;
}

async function GetWebAppVnetInfo(siteArmId, armService) {
    //This is the regional VNet Integration endpoint
    var swiftUrl = siteArmId + "/config/virtualNetwork";
    var siteVnetInfo = await armService.getArmResourceAsync(swiftUrl);

    return siteVnetInfo;
}

async function checkVnetIntegrationAsync(siteInfo, diagProvider, isKuduAccessiblePromise) {
    var views = [];

    var siteArmId = siteInfo["id"];
    var thisSite = siteArmId.split("/sites/")[1];
    var serverFarmId = siteInfo["serverFarmId"];
    var serverFarmName = serverFarmId.split("/serverfarms/")[1];

    //Get All apps from the server farm(ASP)
    var aspSitesObjPromise = diagProvider.getArmResourceAsync(serverFarmId + "/sites");

    //var aspData = await GetArmData(serverFarmId, diagProvider);
    //var aspSku = aspData["sku"].hasOwnProperty("name")?aspData["sku"]["name"]:undefined;
    var aspDataPromise = diagProvider.getArmResourceAsync(serverFarmId);

    //Get Instance details async
    var instancesPromise = diagProvider.getArmResourceAsync(siteArmId + "/instances");

    //get Vnet Integration Details for the Web App
    //For Regional Integration path is sitearmId + /config/virtualNetwork
    //For Gateway Integration path is sitearmId + /virtualNetworkConnections
    var siteVnetInfo = await GetWebAppVnetInfo(siteArmId, diagProvider);

    if (siteVnetInfo != null) {
        var vnetInfo = siteVnetInfo["properties"];
        var subnetData = null;

        //We fetch Subnet resource Id here to validate if app is using regional Vnet integration
        //If subnetResourceId is null, it means Regional Vnet integration is not configured for the app
        var subnetResourceId = vnetInfo["subnetResourceId"];
        var vnetResourceId;
        if (subnetResourceId == null) {
            //Lets check if GW VNET is configured for the app                                    
            var siteGWVnetInfo = await diagProvider.getArmResourceAsync(siteArmId + "/virtualNetworkConnections");

            if (siteGWVnetInfo.length > 0) {
                //Gateway Vnet integration is present
                var viewShowGatewayVnetStatus = showGatewayVnetStatus(thisSite, siteGWVnetInfo);
                views = views.concat(viewShowGatewayVnetStatus);
                var isContinue = true;
                return { views, isContinue, subnetData };
            }
            else {
                //VNET integration is not configured
                var aspSitesObj = await aspSitesObjPromise.catch(e => e);
                var viewVnetNotIntegrated = await showVnetIntegrationNotConfiguredStatus(diagProvider, aspSitesObj, serverFarmId, serverFarmName);
                views = views.concat(viewVnetNotIntegrated);
                var isContinue = false;
                return { views, isContinue, subnetData };
            }
        }
        else {
            var viewSubnetResourceIdFormatIncorrect = checkSubnetResourceIdFormat(subnetResourceId);

            if (viewSubnetResourceIdFormatIncorrect.isContinue == false) {
                views = views.concat(viewSubnetResourceIdFormatIncorrect.views);
                var isContinue = false;
                return { views, isContinue, subnetData };
            }

            var subnetName = subnetResourceId.split("/")[10];
            var swiftSupported = vnetInfo["swiftSupported"];

            //If swiftSupported is false, show message
            var viewSwiftSupported = showSwiftNotSupportedStatus(swiftSupported);
            if (viewSwiftSupported.isContinue == false) {
                views = views.concat(viewSwiftSupported.views);
                var isContinue = false;
                return { views, isContinue, subnetData };
            }

            //subnetRelativeURl = "~" + subnetResourceId;
            if (swiftSupported == true && subnetResourceId.includes("/subnets/")) {
                //Show step that Regional Vnet integration has been configured
                //showVnetIntegrationSuccessStatus(diagProvider, flowMgr, thisSite);                       

                //Get Virtual Network
                vnetResourceId = subnetResourceId.split("/subnets/")[0];
                var vnetData = await diagProvider.getArmResourceAsync(vnetResourceId, "2020-11-01");
                var vnetProperties = vnetData["properties"]
                var subnets = vnetProperties["subnets"];

                //Search for the subnet
                subnets.forEach(subnet => {
                    if (subnet["name"].toLowerCase() == subnetName.toLowerCase()) {
                        subnetData = subnet;
                    }
                });

                //Check if SAL is initialized or not                        
                var subnetProperties = subnetData["properties"];
                var viewSalInitialized = checkSALInitialized(diagProvider, subnetProperties, subnetName);
                if (viewSalInitialized.isContinue == false) {
                    views = views.concat(viewSalInitialized.views);
                    var isContinue = false;
                    return { views, isContinue, subnetData };
                }

                //Check subnet delegation                        
                var viewSubnetDelegation = checkSubnetDelegationStatus(subnetProperties, subnetName);
                if (viewSubnetDelegation.isContinue == false) {
                    views = views.concat(viewSubnetDelegation.views);
                    var isContinue = false;
                    return { views, isContinue, subnetData };
                }

                //Check if SAL is owned by the current ASP
                var viewSalOwner = checkSALOwner(diagProvider, subnetData, subnetName, serverFarmId, serverFarmName);
                if (viewSalOwner.isContinue == false) {
                    views = views.concat(viewSalOwner.views);
                    var isContinue = false;
                    return { views, isContinue, subnetData };
                }

                //Check if App Service plan is connected to 2 subnets
                var aspSitesObj = await aspSitesObjPromise.catch(e => e);
                var viewAspMultipleSubnet = await checkASPConnectedToMultipleSubnets(diagProvider, aspSitesObj, thisSite, serverFarmName, serverFarmId);
                if (viewAspMultipleSubnet.isContinue == false) {
                    views = views.concat(viewAspMultipleSubnet.views);
                    var isContinue = false;
                    return { views, isContinue, subnetData };
                }

                //Check if Private IP is assigned
                //First we need to get the list of instances 
                var instancesObj = await instancesPromise.catch(e => e);
                var viewPrivateIP = await checkPrivateIPAsync(diagProvider, instancesObj, isKuduAccessiblePromise);
                views = views.concat(viewPrivateIP.views);

                if (viewPrivateIP.isContinue == false) {
                    var isContinue = false;
                    return { views, isContinue, subnetData };
                }
                else {
                    var isContinue = true;
                    return { views, isContinue, subnetData };
                }

            }
        }
    }
}

function parseSecurityRules(securityRules) {
    var str;
    var inboundSecurityRules = '', outboundSecurityRules = '';
    str = securityRules[0]["id"].includes("/securityRules/") ? "\r\n<h2> Security Rule</h2>\r\n" : "\r\n<h2> Default Security Rule</h2>\r\n";
    //var securiteRules = nsgData["properties"]["securityRules"];
    var inboundRuleCount = 0, outboundRuleCount = 0;
    var rule;
    for (var i in securityRules) {
        rule = securityRules[i]["properties"];
        if (rule["direction"].toLowerCase() == "Inbound".toLowerCase()) {
            ++inboundRuleCount;
            inboundSecurityRules = inboundSecurityRules.concat(`<tr><td>${rule["priority"]}</td><td>${securityRules[i]["name"]}</td><td>${rule["access"]}</td><td>${rule["protocol"]}</td><td>${rule["sourceAddressPrefix"]}</td><td>${rule["sourcePortRange"]}</td><td>${rule["destinationAddressPrefix"]}</td><td>${rule["destinationPortRanges"]}</td></tr>`);
        }
        else {
            ++outboundRuleCount;
            outboundSecurityRules = outboundSecurityRules.concat(`<tr><td>${rule["priority"]}</td><td>${securityRules[i]["name"]}</td><td>${rule["access"]}</td><td>${rule["protocol"]}</td><td>${rule["sourceAddressPrefix"]}</td><td>${rule["sourcePortRange"]}</td><td>${rule["destinationAddressPrefix"]}</td><td>${rule["destinationPortRanges"]}</td></tr>`);
        }
    }
    str = str.concat("<table>");
    if (outboundRuleCount > 0) {
        str = str.concat("<tr><th>Outbound Security Rules</th></tr>");
        str = str.concat("<tr><td><table>");
        str = str.concat("<tr><th>Priority</th><th>Name</th><th>Action</th><th>Protocol</th><th>Source Address</th><th>Source Port</th><th>Destination</th><th>Destination Port</th></tr>");
        str = str.concat(outboundSecurityRules);
        str = str.concat("</table></td></tr>");
    }
    if (inboundRuleCount > 0) {
        str = str.concat("<tr><th>Inbound Security Rules</th></tr>");
        str = str.concat("<tr><td><table>");
        str = str.concat("<tr><th>Priority</th><th>Name</th><th>Action</th><th>Protocol</th><th>Source Address</th><th>Source Port</th><th>Destination</th><th>Destination Port</th></tr>");
        str = str.concat(inboundSecurityRules);
        str = str.concat("</table></td></tr>");
    }
    str = str.concat("</table>");

    return str;
}

function parseRouteTable(routes) {
    var str = '', route;
    str = str.concat("<table>");
    str = str.concat("<tr><th>Name</th><th>Address Prefix</th><th>Next Hop Type</th><th>Provisioning State</th></tr>");
    for (var i in routes) {
        r = routes[i];
        str = str.concat(`<tr><td>${r["name"]}</td><td>${r["properties"]["addressPrefix"]}</td><td>${r["properties"]["nextHopType"]}</td><td><span style="color:${(r["properties"]["provisioningState"] != "Succeeded") ? "red" : "green"}">${r["properties"]["provisioningState"]}</span></td></tr>`);
    }

    str = str.concat("</table>");

    return str;
}

var armDataDictionary = {};
async function GetSubnet(armService, subnetResourceId) {
    var subnetData;
    var subnetName = subnetResourceId.split("/subnets/")[1];
    var vnetResourceId = subnetResourceId.split("/subnets/")[0];
    //Search for the subnet
    if (!(subnetResourceId in armDataDictionary)) {
        var vnetData = await GetArmData(vnetResourceId, armService);
        var subnets = vnetData["properties"]["subnets"];
        subnets.forEach(subnet => {
            if (subnet["name"].toLowerCase() == subnetName.toLowerCase()) {
                subnetData = subnet;
            }
        });
    }
    else if ((subnetResourceId in armDataDictionary)) {
        subnetData = armDataDictionary[subnetResourceId];
    }
    return subnetData;
}

function GetSubnetDelegation(subnetData) {
    var delegation = null;
    var delegations = subnetData["properties"]["delegations"];
    for (var i in delegations) {
        delegation = delegations[i]["properties"]["serviceName"].toString();
    }
    return delegation;

}

async function GetVirtualNetwork(vnetArmId, armService) {
    var vnetData = await armService.getArmResourceAsync(vnetArmId, "2020-11-01");
    return vnetData;
}

function CheckSalAspLink(subnetData, serverFarmId) {
    var str = '', sal, subnetName, subnetProperties, salProperties, linkedAsp, level;

    subnetName = subnetData["name"];
    subnetProperties = subnetData["properties"];
    if (subnetProperties["serviceAssociationLinks"] != null) {
        sal = subnetProperties["serviceAssociationLinks"];
    }
    if (sal != null) {
        salProperties = sal[0]["properties"];
        linkedAsp = salProperties["link"];
        // console.log("Linked ASP: "+ linkedAsp);
        // console.log("ServerFarmID: "+ serverFarmId);
        //compares link (points to ASP) on the SAL to the ServerFarmID of the Web App
        if (linkedAsp.toLowerCase() != serverFarmId.toLowerCase()) {
            str = "Resource URI of Web App's App Service Plan is different from the linked URI resource on the subnets serviceAssociationLink."
            level = 1;
        }
        str += "<br/><br/>  Subnet  **" + subnetName + "** has a valid serviceAssociationLink.  ";
        if (salProperties["provisioningState"] != "Succeeded") {
            level = 1;
            str += "<br/> : **" + salProperties["provisioningState"] + "**  ";
        }
        str += "<br/>  The linked resource is " + linkedAsp + "  ";
    }

    return str;
}

function checkNetworkConfigAndConnectivity(siteInfo, diagProvider, flowMgr, data) {
    var subnetDataPromise = data.subnetDataPromise;
    var isContinuedPromise = data.isContinuedPromise;
    var serverFarmId = data.serverFarmId;
    var kudoReachablePromise = data.kudoReachablePromise;
    var kudoReachable = null;
    var dnsServer = null;
    var configCheckViewsPromise = (async () => {
        var views = [];
        var configCheckView = new CheckStepView({
            title: "Network Configuration is healthy",
            level: 0
        });
        views.push(configCheckView);
        var subnetSizeViewsPromise = checkSubnetSizeAsync(diagProvider, subnetDataPromise, serverFarmId);
        var dnsCheckResultPromise = checkDnsSetting(siteInfo, diagProvider);

        var subnetSizeViews = await subnetSizeViewsPromise;
        if (subnetSizeViews.length > 0) {
            configCheckView.title = "Network Configuration is suboptimal";
            configCheckView.level = 1;
            views = views.concat(subnetSizeViews);
        }

        kudoReachable = await kudoReachablePromise;
        if (kudoReachable) {
            var dnsCheckResult = await dnsCheckResultPromise;
            dnsServer = dnsCheckResult.dnsServer;
            views = views.concat(dnsCheckResult.views);
            if (dnsServer == null) {
                configCheckView.title = "Network Configuration is unhealthy";
                configCheckView.length = 2;
            }
        } else {
            configCheckView.title = "Network Configuration is healthy - incomplete check result";
            configCheckView.length = 1;
        }
        return views;
    })();

    flowMgr.addViews(isContinuedPromise.then(c => c ? configCheckViewsPromise : null), "Checking Network Configuration...");

    var state = null;
    var connectivityCheckViewPromise = (async () => {
        var isContinued = await isContinuedPromise;
        await configCheckViewsPromise;
        if (dnsServer == null || !isContinued) {
            return [];
        }

        return [new InputStepView({
            title: "Specify a server endpoint you want to test",
            placeholder: "hostname:port or ip:port",
            buttonText: "Continue",
            entry: "Endpoint",
            tooltip: "e.g. microsoft.com:443 or 8.8.8.8:53\r\ncommon service ports: http - 80; https - 443; sql server - 1433; dns - 53",
            error: null,
            async callback(userInput) {
                flowMgr.reset(state);

                var splitted = userInput.split(":");
                var hostname, port;

                if (splitted.length != 2 || isNaN(port = parseInt(splitted[1]))) {
                    this.error = "invalid endpoint";
                } else {
                    this.error = null;
                    hostname = splitted[0];
                    flowMgr.addViews(runConnectivityCheck(hostname, port, dnsServer, diagProvider), `Testing ${userInput}...`);
                }
            }
        })];
    })();
    state = flowMgr.addViews(connectivityCheckViewPromise);
}

function ParseWebAppUri(siteResourceId) {
    var siteName;
    if (siteResourceId.includes("/Microsoft.Web/sites/")) {
        siteName = siteResourceId.split("/sites/")[1];
    }
    var siteUrl = `[${siteName}](https://portal.azure.com/#resource${siteResourceId})`
    return siteUrl;
}

async function checkSubnetSizeAsync(diagProvider, subnetDataPromise, serverFarmId) {
    var msg;
    var aspData = await diagProvider.getArmResourceAsync(serverFarmId);
    var subnetData = await subnetDataPromise;
    if (subnetData == null) {
        return [];
    }
    //Show subnet size recommendations but don't return 
    var subnetAddressPrefix = subnetData["properties"]["addressPrefix"];
    var subnetSize = subnetAddressPrefix.split("/")[1];
    var aspSku = aspData["sku"].hasOwnProperty("name") ? aspData["sku"]["name"] : undefined;
    var views = [];

    if (subnetSize > 26 & aspSku[0] == "P") {
        msg = `<li>Subnet is not using the recommended address prefix of /26. Please increase size of the subnet.<br/>`;
        msg += `<br/><table><tr><th>Subnet Size</th><th>App Service Plan SKU</th><th>Recommended Subnet Size</th><th>Available Addresses</th></tr>`;
        msg += `<tr><td>${subnetSize}</td><td>${aspSku}</td><td><b>/26</b></td><td>64-5 = <b>59</b> Addresses</td></tr>`;
        msg += `<tr><td colspan='4'><i>Note: Azure reserves 5 IP addresses within each subnet.</i></td></tr></table>`;
        msg += `<u>Steps to increase the subnet size:</u>`;
        msg += `<li>In this App Service Plan, disconnect all the Web Apps that are currently using Regional VNET integration.</li>`;
        msg += `<li>Increase the subnet size as per the recommendations.</li>`;
        msg += `<li>Reconnect the webapps to the same subnet.</li>`;

        views.push(new InfoStepView({
            infoType: 1,
            title: "Subnet Size Recommendations",
            markdown: msg
        }));
    }
    else if (subnetSize > 27) {
        msg = `<li>Subnet is not using the recommended address prefix of /27. Please increase size of the subnet.<br/>`;
        msg += `<br/><table><tr><th>Subnet Size</th><th>App Service Plan SKU</th><th>Recommended Subnet Size</th><th>Available Addresses</th></tr>`;
        msg += `<tr><td>${subnetSize}</td><td>${aspSku}</td><td><b>/27</b></td><td>32-5 = <b>27</b> Addresses</td></tr>`;
        msg += `<tr><td colspan='4'><i>Note: Azure reserves 5 IP addresses within each subnet.</i></td></tr></table>`;
        msg += `<u>Steps to increase the subnet size:</u>`;
        msg += `<li>In this App Service Plan, disconnect all the Web Apps that are currently using Regional VNET integration.</li>`;
        msg += `<li>Increase the subnet size as per the recommendations.</li>`;
        msg += `<li>Reconnect the webapps to the same subnet.</li>`;

        views.push(new InfoStepView({
            infoType: 1,
            title: "Subnet Size Recommendations",
            markdown: msg
        }));
    }

    /*
    else
    {
        flowMgr.addView(new CheckStepView({
            title: "Subnet Size",
            level: 0
        }));
        
    }*/

    return views;
}

function showGatewayVnetStatus(thisSite, siteGWVnetInfo) {

    var views = [];
    var msg = "<table>";
    msg += "<tr><td><b>Check Status</b></td><td>Pass</td></tr>";
    msg += `<tr><td><b>Description</b></td><td>App <b>${thisSite}</b> is configured to use Gateway VNET integration and connected to Virtual network <b>${siteGWVnetInfo[0]["name"]}</b>.</td></tr>`;
    msg += "</table>";
    //steps.push({level:0, title:"Gateway VNET Integration", markdown: msg});
    //return {level: 0, steps:steps};                        

    views.push(new InfoStepView({
        infoType: 0,
        title: "Gateway VNET Integration",
        markdown: msg
    }));

    return views;
}

function showSwiftNotSupportedStatus(swiftSupported) {

    var views = [];
    var msg;
    var isContinue = true;

    if (swiftSupported == false) {
        msg = "<table>";
        msg += "<tr><td><b>VNET Integration Status</b></td><td>Failed</td></tr>";
        msg += "<tr><td><b>Cause</b></td><td>isSwift property is set to False.</td></tr>";
        msg += "<tr><td><b>Recommended Action</b></td><td>Please review the ARM template and set swiftSupported property to True.</td></tr>";
        msg += "</table>";
        //steps.push({level:2, title:"IsSwift set to True", markdown: msg});
        //return {level: 2, steps:steps};

        views.push(new CheckStepView({
            title: "IsSwift property is set to False",
            level: 2
        }));

        views.push(new InfoStepView({
            infoType: 1,
            title: "IsSwift property is set to False",
            markdown: msg
        }));

        isContinue = false;
    }

    return { views, isContinue };
}

function showVnetIntegrationSuccessStatus(diagProvider, flowMgr, thisSite) {

    var msg = "<table>";
    msg += "<tr><td><b>Check Status</b></td><td>Pass</td></tr>";
    msg += `<tr><td><b>Description</b></td><td>App <b>${thisSite}</b> is configured to <br/>use regional VNET integration.</td></tr>`;
    msg += "</table>";
    //steps.push({level:0, title:"Regional VNET Integration", markdown: msg});
    flowMgr.addView(new CheckStepView({
        title: `App (${thisSite}) is configured to use Regional VNET Integration`,
        level: 0
    }));
}

async function showVnetIntegrationNotConfiguredStatus(diagProvider, aspSitesObj, serverFarmId, serverFarmName) {

    var views = [];
    var msg = `App is not configured for VNet Integration.`;
    msg += `<br/><br/><b>Recommendations: </b>`;
    msg += `<li>For setting up VNET integration, please see [Integrate your app with an Azure virtual network](https://docs.microsoft.com/en-us/azure/app-service/web-sites-integrate-with-vnet).</li>`;


    var aspSites = (aspSitesObj.hasOwnProperty("value")) ? aspSitesObj["value"] : aspSitesObj;

    if (aspSites != null) {
        for (var site in aspSites) {
            var siteResourceUri = aspSites[site]["id"];
            var siteName = aspSites[site]["name"];
            var siteVnetInfo = await GetWebAppVnetInfo(siteResourceUri, diagProvider);
            var subnetName = "-";
            var sal, hasSAL = "-", linkedAsp = "-";

            if (siteVnetInfo != null) {
                var subnetResourceId = siteVnetInfo["properties"]["subnetResourceId"];
                if (subnetResourceId != null) {
                    if (subnetResourceId.includes("/subnets/")) {
                        subnetName = subnetResourceId.split("/subnets/")[1];
                        var subnetData = await GetSubnet(diagProvider, subnetResourceId);

                        if (subnetData["properties"]["serviceAssociationLinks"] != null) {
                            sal = subnetData["properties"]["serviceAssociationLinks"];
                            linkedAsp = sal[0]["properties"]["link"];
                            if (linkedAsp.toLowerCase() == serverFarmId.toLowerCase()) {
                                msg += `<li>This App is hosted on App Service Plan <b>${serverFarmName}</b> that is already connected to subnet <b>${subnetName}</b>. You can integrate your app to the same subnet.`;
                            }
                            else {
                                msg += `<li>This App is hosted on App Service Plan <b>${serverFarmName}</b> that is connected to subnet <b>${subnetName}</b>, but owner of this subnet is <b>${linkedAsp.split("/serverfarms/")[1]}</b>. Please disconnect this subnet <b>${subnetName}</b> from Apps in <b>${linkedAsp.split("/serverfarms/")[1]}</b> or else create a new subnet and connect Apps in <b>${serverFarmName}</b> to it.`;
                            }
                        }
                        else {
                            msg += `<li>This App is hosted on App Service Plan <b>${serverFarmName}</b> that is already connected to subnet <b>${subnetName}</b>. But Service Association Link is not initialized on this subnet. Please disconnect all the apps that are connected to subnet <b>${subnetName}</b> and connect again to generate Service Association Link.`;
                        }
                    }
                }
            }

            var slotsObj = await diagProvider.getArmResourceAsync(siteResourceUri + "/slots");
            var slots = (slotsObj.hasOwnProperty("value")) ? slotsObj["value"] : slotsObj;

            for (var slot in slots) {
                var slotResourceUri = slots[slot]["id"];
                var slotName = slots[slot]["name"];
                var slotserverfarmId = slots[slot]["properties"]["serverFarmId"];
                var slotserverfarm = slotserverfarmId.split("/serverfarms/")[1];
                var slotVnetInfo = await GetWebAppVnetInfo(slotResourceUri, diagProvider);

                var subnetName = "-";
                var sal, hasSAL = "-", linkedAsp = "-";

                if (slotVnetInfo != null) {
                    var subnetResourceId = slotVnetInfo["properties"]["subnetResourceId"];
                    if (subnetResourceId != null) {
                        if (subnetResourceId.includes("/subnets/")) {
                            subnetName = subnetResourceId.split("/subnets/")[1];
                            var subnetData = await GetSubnet(diagProvider, subnetResourceId);

                            if (subnetData["properties"]["serviceAssociationLinks"] != null) {
                                sal = subnetData["properties"]["serviceAssociationLinks"];
                                linkedAsp = sal[0]["properties"]["link"];

                                if (slotserverfarm.toLowerCase() == serverFarmName.toLowerCase()) {
                                    if (linkedAsp.toLowerCase() == slotserverfarmId.toLowerCase()) {
                                        msg += `<li>There is slot <b>${slotName}</b> that is hosted on App Service Plan <b>${slotserverfarm}</b> and it is already connected to subnet <b>${subnetName}</b>. You can integrate your app to the same subnet.`;
                                    }
                                    else {
                                        msg += `<li>There is slot <b>${slotName}</b> that is hosted on App Service Plan <b>${slotserverfarm}</b> and it is connected to subnet <b>${subnetName}</b>, but owner of this subnet is <b>${linkedAsp.split("/serverfarms/")[1]}</b>. Please disconnect this subnet <b>${subnetName}</b> from Apps in <b>${linkedAsp.split("/serverfarms/")[1]}</b> or else create a new subnet and connect Apps in <b>${serverFarmName}</b> to it.`;
                                    }
                                }
                                else {
                                    if (linkedAsp.toLowerCase() == slotserverfarmId.toLowerCase()) {
                                        msg += `<li>There is slot <b>${slotName}</b> that is hosted on App Service Plan <b>${slotserverfarm}</b> and it is already connected to subnet <b>${subnetName}</b>. You can change app service plan of this app if you wish to integrate your app to the same subnet.`;
                                    }
                                    else {
                                        msg += `<li>There is slot <b>${slotName}</b> that is hosted on App Service Plan <b>${slotserverfarm}</b> and it is connected to subnet <b>${subnetName}</b>, but owner of this subnet is <b>${linkedAsp.split("/serverfarms/")[1]}</b>. Please disconnect this subnet <b>${subnetName}</b> from Apps in <b>${linkedAsp.split("/serverfarms/")[1]}</b> or else create a new subnet and connect Apps in <b>${serverFarmName}</b> to it.`;
                                    }
                                }

                            }
                        }
                    }
                }
            }

        }
    }

    //msg += "<li>If you see other Apps in this App Service Plan are connected to subnet that is owned by any other App Service Plan, then please disconnect all the Apps in this App Service Plan and connect again to the intended subnet.</li>";
    //return {level: 1, steps:steps, markdown:msg};  

    views.push(new CheckStepView({
        title: "VNET Integration is not configured",
        level: 2
    }));

    views.push(new InfoStepView({
        infoType: 1,
        title: "VNET Integration Recommendation",
        markdown: msg
    }));

    return views;
}

function checkSubnetResourceIdFormat(subnetResourceId) {
    var views = [];
    var msg;
    var isContinue = true;
    if (subnetResourceId.includes("/subnets/")) {
        //vnetResourceId = subnetResourceId.split("/subnets/")[0]; 
    }
    else {
        //SubnetResourceId not in correct format
        msg = "<table>";
        msg += "<tr><td><b>VNET Integration Status</b></td><td>Failed</td></tr>";
        msg += "<tr><td><b>Cause</b></td><td>SubnetResourceId is not in right format.</td></tr>";
        msg += "<tr><td><b>Recommended Action</b></td><td>Please review the ARM template and make sure SubnetResourceId should be in this format: <b>/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}<br/>/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}</b>.</td></tr>";
        msg += "</table>";
        //steps.push({level:2, title:"SubnetResourceId format", markdown: msg});
        //return {level: 2, steps:steps};

        views.push(new CheckStepView({
            title: "SubnetResourceId format",
            level: 2
        }));

        views.push(new InfoStepView({
            infoType: 1,
            title: "SubnetResourceId format",
            markdown: msg
        }));

        isContinue = false;
    }

    return { views, isContinue };
}

function checkSubnetDelegationStatus(subnetProperties, subnetName) {

    var msg;
    var views = [];
    var isContinue = true;
    if (subnetProperties["delegations"] == null) {
        msg = `<table>`;
        msg += "<tr><td><b>VNET Integration Status</b></td><td>Failed</td></tr>";
        msg += `<tr><td><b>Cause</b></td><td>Subnet <b>${subnetName}</b> is not delegated to <b>Microsoft.Web/serverFarms</b> service.</td></tr>`;
        msg += `<tr><td><b>Recommended Action</b></td><td>Please enable subnet delegation to <b>Microsoft.Web/serverFarms</b> service.</td></tr>`;
        msg += `</table>`;

        views.push(new CheckStepView({
            title: "Subnet Delegation",
            level: 2
        }));

        views.push(new InfoStepView({
            infoType: 1,
            title: "Subnet Delegation",
            markdown: msg
        }));

        isContinue = false;
    }
    else {
        if (subnetProperties["delegations"][0]["properties"]["serviceName"].toLowerCase() != ("Microsoft.Web/serverFarms").toLowerCase()) {
            msg = `<table>`;
            msg += `<tr><td><b>VNET Integration Status</b></td><td>Failed</td></tr>`;
            msg += `<tr><td><b>Cause</b></td><td>Subnet <b>${subnetName}</b> is not delegated to <b>Microsoft.Web/serverFarms</b> service.</td></tr>`;
            msg += `<tr><td><b>Recommended Action</b></td><td>Please enable subnet delegation to <b>Microsoft.Web/serverFarms</b> service.</td></tr>`;
            msg += `</table>`;
            //steps.push({level:2, title:"Subnet Delegation", markdown: msg});
            //return {level: 2, steps:steps};
            views.push(new CheckStepView({
                title: "Subnet Delegation",
                level: 2
            }));

            views.push(new InfoStepView({
                infoType: 1,
                title: "Subnet Delegation",
                markdown: msg
            }));

            isContinue = false;
        }
    }

    return { views, isContinue };

    //If we are here means Subnet is delgated to Microsoft.Web/serverFarms
    /*
    msg= `<table>`;
    msg+= `<tr><td><b>Check Status</b></td><td>Pass</td></tr>`;
    msg+= `<tr><td><b>Description</b></td><td>Subnet <b>${subnetName}</b> is correctly delegated <br/>to Microsoft.Web/ServerFarms service.</td></tr>`;
    msg+= `</table>`; 
    //steps.push({level:0, title:"Subnet Delegation", markdown: msg});   
    flowMgr.addView(new CheckStepView({
        title: "Subnet Delegation status is healthy",
        level: 0
    }));  
    */

}

function checkSALInitialized(diagProvider, subnetProperties, subnetName) {
    var views = [];
    var isContinue = true;
    var msg;
    if (subnetProperties["serviceAssociationLinks"] == null) {
        msg = `<table>`;
        msg += `<tr><td><b>VNET Integration Status</b></td><td>Failed</td></tr>`;
        msg += `<tr><td><b>Cause</b></td><td>Service Association Link is missing on the subnet <b>${subnetName}</b> </td></tr>`;
        msg += `<tr><td><b>Recommended Action</b></td><td>Please disconnect all the apps that are connected to subnet <b>${subnetName}</b> and connect again to generate service association link.</td></tr>`;
        msg += `</table>`;

        views.push(new CheckStepView({
            title: "Service Association Link not initialized",
            level: 2
        }));

        views.push(new InfoStepView({
            infoType: 1,
            title: "Service Association Link not initialized",
            markdown: msg
        }));

        isContinue = false;
    }

    return { views, isContinue };

    //If we are here means SAL is initialized
    /*
    msg= `<table>`;
    msg+= "<tr><td><b>Check Status</b></td><td>Pass</td></tr>";
    msg+= `<tr><td><b>Description</b></td><td>Service Association Link has been initialized <br/>successfully on subnet <b>${subnetName}</b>.</td></tr>`;
    msg+= `</table>`; 
    //steps.push({level:0, title:"Service Association Link Initialized", markdown: msg});
    flowMgr.addView(new CheckStepView({
        title: "Service Association Link Initialized",
        level: 0
    }));
    */
}

function checkSALOwner(diagProvider, subnetData, subnetName, serverFarmId, serverFarmName) {
    var views = [];
    var msg;
    var isContinue = true;
    var sal = subnetData["properties"]["serviceAssociationLinks"];
    var linkedAsp = sal[0]["properties"]["link"];

    if (linkedAsp.toLowerCase() != serverFarmId.toLowerCase()) {
        msg = `<table>`;
        msg += `<tr><td><b>VNET Integration Status</b></td><td>Failed</td></tr>`;
        msg += `<tr><td><b>Cause</b></td><td>Service Association Link on subnet <b>${subnetName}</b> is owned by App Service Plan <b>${linkedAsp.split("/serverfarms/")[1]}</b> but the App is hosted on App Service Plan <b>${serverFarmName}</b>.</td></tr>`;
        msg += `<tr><td><b>Recommended Action</b></td><td><li>Either disconnect all the Apps in App Service Plan <b>${linkedAsp.split("/serverfarms/")[1]}</b> that are connected to subnet <b>${subnetName}</b> and reconnect this App again to the subnet.<li>Or, disconnect this App from subnet <b>${subnetName}</b> and connect to another subnet.</td></tr>`;
        msg += `</table>`;

        views.push(new CheckStepView({
            title: "Service Association Link Owner",
            level: 2
        }));

        views.push(new InfoStepView({
            infoType: 1,
            title: "Service Association Link Owner",
            markdown: msg
        }));

        isContinue = false;
    }

    return { views, isContinue };

    //If we are here means SAL is owned by right ASP
    /*
    msg= `<table>`;
    msg+= `<tr><td><b>Check Status</b></td><td>Pass</td></tr>`;
    msg+= `<tr><td><b>Description</b></td><td><li>Service Association Link is owned by <br/>App Service Plan: <b>${serverFarmName}</b>.<li>This App is hosted on same App Service Plan.</td></tr>`;
    msg+= `</table>`; 
    //steps.push({level:0, title:"Service Association Link Owner", markdown: msg});   
    flowMgr.addView(new CheckStepView({
        title: "Service Association Link status is healthy",
        level: 0
    })); 
    */

}

async function checkASPConnectedToMultipleSubnets(diagProvider, aspSitesObj, thisSite, serverFarmName, serverFarmId) {

    var views = [];
    var msg;
    var isContinue = true;
    var aspSubnetArray = [];
    var aspSites = (aspSitesObj.hasOwnProperty("value")) ? aspSitesObj["value"] : aspSitesObj;

    if (!(aspSites == undefined)) {
        for (var i = 0; i < aspSites.length; i++) {
            var siteResourceUri = aspSites[i]["id"];
            var siteVnetInfo = await GetArmData(siteResourceUri + "/config/virtualNetwork", diagProvider);

            if (siteVnetInfo["properties"]["subnetResourceId"] != null) {
                subnetResourceId = siteVnetInfo["properties"]["subnetResourceId"];

                if (!(subnetResourceId in aspSubnetArray)) {
                    aspSubnetArray.push(subnetResourceId);
                }
            }
        }
    }

    if (aspSubnetArray.length > 0) {
        var uniqueAspSubnets = aspSubnetArray.filter((e, i) => aspSubnetArray.indexOf(e) == i)

        msg = `App: <b>${thisSite}</b> is hosted on App Service Plan: <b>${serverFarmName}</b>. `;
        msg += `This App Service Plan is connected to <b>${uniqueAspSubnets.length}</b> subnet(s).<br/>`;

        if (uniqueAspSubnets.length > 1) {
            subnetValidationTable = "<table><tr><th>Subnet</th><th>Subnet delegated App Service Plan</th><th>Is valid delegation?</th></tr>";
            for (var index in uniqueAspSubnets) {
                var subnetResourceId = uniqueAspSubnets[index];
                var vnetResourceId, subnetName;
                if (subnetResourceId != null) {
                    subnetRelativeURl = "~" + subnetResourceId;

                    if (subnetResourceId.includes("/subnets/")) {
                        vnetResourceId = subnetResourceId.split("/subnets/")[0];
                        subnetName = subnetResourceId.split("/subnets/")[1];

                        //Get Subnet Data
                        var subnetData = await GetSubnet(diagProvider, subnetResourceId);
                        var sal, linkedAsp = '';

                        if (subnetData["properties"]["serviceAssociationLinks"] != null) {
                            sal = subnetData["properties"]["serviceAssociationLinks"];
                            linkedAsp = sal[0]["properties"]["link"];
                        }

                        subnetValidationTable = subnetValidationTable.concat("<tr>");
                        subnetValidationTable = subnetValidationTable.concat(`<td>${subnetName}</td>`);
                        subnetValidationTable = subnetValidationTable.concat(`<td>${linkedAsp.split("/serverfarms/")[1]}</td>`);
                        subnetValidationTable = subnetValidationTable.concat(`<td><b><span style="color:${(linkedAsp.toLowerCase() == serverFarmId.toLowerCase()) ? "green" : "red"};">${linkedAsp.toLowerCase() == serverFarmId.toLowerCase()}</span></b></td>`);
                        subnetValidationTable = subnetValidationTable.concat("</tr>");
                    }
                }
            }
            subnetValidationTable += `</table>`;
            msg += `\n` + subnetValidationTable;

            msg += `<b>Recommendations: </b>`;
            msg += `<li>One App Service Plan must be connected to one subnet only.</li>`;
            msg += `<li>Please disconnect all the Apps in App Service Plan ${serverFarmName} and connect again to the intended subnet.</li>`;
            msg += `<li>If there are few Apps in this App Service Plan, that need to connect to different subnets, then move them to separate App Service Plans.</li>`;
            msg += `<br/>`;

            views.push(new CheckStepView({
                title: "App Service Plan connected to multiple subnets",
                level: 2
            }));

            views.push(new InfoStepView({
                infoType: 1,
                title: "App Service Plan connected to multiple subnets",
                markdown: msg
            }));

            isContinue = false;
        }
    }

    return { views, isContinue };
}

async function checkPrivateIPAsync(diagProvider, instancesObj, isKuduAccessiblePromise) {

    var instances = (instancesObj.hasOwnProperty("value")) ? instancesObj["value"] : instancesObj;
    var privateIpPromiseArray = [];
    var instanceCount = 0;
    var instanceAllocated = 0;
    var views = [];
    var isContinue = true;

    if (!(await isKuduAccessiblePromise)) {
        views.push(new CheckStepView({
            title: `Vnet integration is healthy (incomplete result)`,
            level: 1
        }));

        return { views, isContinue };
    }

    //msg= `<table>`;
    //msg+= `<tr><td><b>Instance Name</b></td><td><b>Private IP</b></td></tr>`;

    for (var instance in instances) {
        var instanceName = instances[instance]["name"];
        instanceCount++;
        //var privateIp = (await diagProvider.getEnvironmentVariablesAsync(["WEBSITE_PRIVATE_IP"],instanceName))[0];                            
        var privateIpPromise = diagProvider.getEnvironmentVariablesAsync(["WEBSITE_PRIVATE_IP"], instanceName);
        privateIpPromiseArray.push(privateIpPromise.catch(e => null));
    }

    await Promise.all(privateIpPromiseArray);

    for (var promise in privateIpPromiseArray) {
        var privateIp = await privateIpPromiseArray[promise];
        if (privateIp == null) {
            //msg+= `<tr><td>${instances[promise]["name"]}</td><td>Not Assigned</td></tr>`;
        }
        else {
            //msg+= `<tr><td>${instances[promise]["name"]}</td><td>${privateIp}</td></tr>`;
            instanceAllocated++;
        }
    }

    //msg+= `</table>`; 

    if (instanceCount == instanceAllocated) {
        /*
        views.push(new CheckStepView({
            title: `Private IP is allocated for all instances (${instanceAllocated} out of ${instanceCount} allocated)`,
            level: 0
        }));
        */
        views.push(new CheckStepView({
            title: `Vnet integration is healthy`,
            level: 0
        }));

    }
    else if (instanceAllocated == 0) {
        views.push(new CheckStepView({
            title: `Private IP is not allocated for any instances (${instanceAllocated} out of ${instanceCount} allocated)`,
            level: 2
        }));

        isContinue = false;
    }
    else if (instanceCount > instanceAllocated) {
        views.push(new CheckStepView({
            title: `Private IP is not allocated for few instances (${instanceAllocated} out of ${instanceCount} allocated)`,
            level: 2
        }));

        isContinue = false;
    }
    /* Commenting this code to avoid showing the list of IPs
    flowMgr.addView(new InfoStepView({
        infoType: 0,
        title: "Private IP",
        markdown: msg
    }));
    */
    return { views, isContinue };
}

function checkSubnetSize(diagProvider, flowMgr, subnetData, subnetName, aspData) {

    //Show subnet size recommendations but don't return 
    var msg;
    var subnetAddressPrefix = subnetData["properties"]["addressPrefix"];
    var subnetSize = subnetAddressPrefix.split("/")[1];
    var aspSku = aspData["sku"].hasOwnProperty("name") ? aspData["sku"]["name"] : undefined;

    if (subnetSize > 26 & aspSku[0] == "P") {
        msg = `<li>Subnet is not using the recommended address prefix of /26. Please increase size of the subnet.<br/>`;
        msg += `<br/><table><tr><th>Subnet Size</th><th>App Service Plan SKU</th><th>Recommended Subnet Size</th><th>Available Addresses</th></tr>`;
        msg += `<tr><td>${subnetSize}</td><td>${aspSku}</td><td><b>/26</b></td><td>64-5 = <b>59</b> Addresses</td></tr>`;
        msg += `<tr><td colspan='4'><i>Note: Azure reserves 5 IP addresses within each subnet.</i></td></tr></table>`;
        msg += `<u>Steps to increase the subnet size:</u>`;
        msg += `<li>In this App Service Plan, disconnect all the Web Apps that are currently using Regional VNET integration.</li>`;
        msg += `<li>Increase the subnet size as per the recommendations.</li>`;
        msg += `<li>Reconnect the webapps to the same subnet.</li>`;

        flowMgr.addView(new InfoStepView({
            infoType: 1,
            title: "Subnet Size Recommendations",
            markdown: msg
        }));
    }
    else if (subnetSize > 27) {
        msg = `<li>Subnet is not using the recommended address prefix of /27. Please increase size of the subnet.<br/>`;
        msg += `<br/><table><tr><th>Subnet Size</th><th>App Service Plan SKU</th><th>Recommended Subnet Size</th><th>Available Addresses</th></tr>`;
        msg += `<tr><td>${subnetSize}</td><td>${aspSku}</td><td><b>/27</b></td><td>32-5 = <b>27</b> Addresses</td></tr>`;
        msg += `<tr><td colspan='4'><i>Note: Azure reserves 5 IP addresses within each subnet.</i></td></tr></table>`;
        msg += `<u>Steps to increase the subnet size:</u>`;
        msg += `<li>In this App Service Plan, disconnect all the Web Apps that are currently using Regional VNET integration.</li>`;
        msg += `<li>Increase the subnet size as per the recommendations.</li>`;
        msg += `<li>Reconnect the webapps to the same subnet.</li>`;

        flowMgr.addView(new InfoStepView({
            infoType: 1,
            title: "Subnet Size Recommendations",
            markdown: msg
        }));
    }

    /*
    else
    {
        flowMgr.addView(new CheckStepView({
            title: "Subnet Size",
            level: 0
        }));
        
    }*/


}

async function checkSubnetAvailabilityAsync(siteInfo, diagProvider, subnetData) {

    var isSubnetAvailable = true;
    var msg;
    var successMsg = `<li>For setting up VNET integration, please see [Integrate your app with an Azure virtual network](https://docs.microsoft.com/en-us/azure/app-service/web-sites-integrate-with-vnet).</li>`;

    //Get Site data
    var siteArmId = siteInfo["id"];
    var thisSite = siteArmId.split("/sites/")[1];

    //Get Vnet data
    var selectedSubnet = subnetData.id;
    var vnetResourceId = selectedSubnet.split("/subnets/")[0];
    var selectedVnetName = vnetResourceId.split("/virtualNetworks/")[1];
    var selectedSubnetName = selectedSubnet.split("/subnets/")[1];


    //Get Serverfarm data
    var serverFarmId = siteInfo["serverFarmId"];
    var serverFarmName = serverFarmId.split("/serverfarms/")[1];

    //Fifth check to see if the current ASP already is integrated to a subnet and if that subnet is missing SAL
    //Get All apps from the server farm(ASP)
    var aspSitesObj = await diagProvider.getArmResourceAsync(serverFarmId + "/sites");
    var aspSites = (aspSitesObj.hasOwnProperty("value")) ? aspSitesObj["value"] : aspSitesObj;

    var views = [];
    if (aspSites != null) {
        for (var site in aspSites) {
            var siteResourceUri = aspSites[site]["id"];
            var siteName = aspSites[site]["name"];
            var siteVnetInfo = await GetWebAppVnetInfo(siteResourceUri, diagProvider);
            var subnetName = "-";
            var vnetName = "-";
            var sal, hasSAL = "-", linkedAsp = "-";

            if (siteVnetInfo != null) {
                var subnetResourceId = siteVnetInfo["properties"]["subnetResourceId"];
                if (subnetResourceId != null) {
                    if (subnetResourceId.includes("/subnets/")) {
                        subnetName = subnetResourceId.split("/subnets/")[1];
                        vnetName = subnetResourceId.split("/subnets/")[0].split("/virtualNetworks/")[1];

                        if (subnetResourceId == selectedSubnet) {
                            let subnetData = await GetSubnet(diagProvider, subnetResourceId);

                            if (subnetData["properties"]["serviceAssociationLinks"] != null) {
                                sal = subnetData["properties"]["serviceAssociationLinks"];
                                linkedAsp = sal[0]["properties"]["link"];
                                if (siteResourceUri.toLowerCase() == siteArmId.toLowerCase()) {
                                    successMsg += `<li>App <b>${thisSite}</b> is already connected to subnet <b>${subnetName}</b>. If you are facing connectivity issues, please select <b>I'm unable to connect to a resource, such as SQL or Redis or on-prem, in my Virtual Network</b> option.`;
                                }
                                else {
                                    if (linkedAsp.toLowerCase() == serverFarmId.toLowerCase()) {
                                        successMsg += `<li>App <b>${thisSite}</b> is hosted on App Service Plan <b>${serverFarmName}</b> that is already connected to subnet <b>${subnetName}</b>. You can integrate your app to the same subnet.`;
                                    }
                                    else {
                                        isSubnetAvailable = false;
                                        msg = `This App is hosted on App Service Plan <b>${serverFarmName}</b> that is connected to subnet <b>${subnetName}</b>, but owner of this subnet is <b>${linkedAsp.split("/serverfarms/")[1]}</b>. Please disconnect this subnet <b>${subnetName}</b> from Apps in <b>${linkedAsp.split("/serverfarms/")[1]}</b> or else create a new subnet and connect Apps in <b>${serverFarmName}</b> to it.`;

                                        views.push(new InfoStepView({
                                            infoType: 1,
                                            title: "App Service Plan has Regional Vnet integration",
                                            markdown: msg
                                        }));
                                    }
                                }

                            }
                            else {
                                isSubnetAvailable = false;
                                msg = `This App is hosted on App Service Plan <b>${serverFarmName}</b> that is connected to subnet <b>${subnetName}</b>, but Service Association Link is not initialized on this subnet. For Regional Vnet integration to work on this subnet, please disconnect all the apps from this subnet and reconnect.`;

                                views.push(new InfoStepView({
                                    infoType: 1,
                                    title: `SAL is not initialized on subnet ${subnetName}`,
                                    markdown: msg
                                }));
                            }

                        }
                        else {
                            isSubnetAvailable = false;
                            msg = `This App is hosted on App Service Plan <b>${serverFarmName}</b> that is already connected to subnet <b>${subnetName}</b> [Vnet : <b>${vnetName}</b>]. One App Service Plan could be connected to one subnet only and hence you could not integrate this App to <b>${selectedSubnetName}</b> subnet [Vnet : <b>${selectedVnetName}</b>].`;

                            views.push(new InfoStepView({
                                infoType: 1,
                                title: "App Service Plan has Regional Vnet integration",
                                markdown: msg
                            }));

                        }
                    }
                }
            }
        }
    }

    //Second check is for comparing app region with subnet region
    var vnetData = await diagProvider.getArmResourceAsync(vnetResourceId, "2020-11-01");
    var siteRegion = siteInfo["location"].replaceAll(" ", "").toLowerCase();
    var vnetRegion = vnetData["location"];

    if (vnetRegion != siteRegion) {
        isSubnetAvailable = false;

        views.push(new InfoStepView({
            infoType: 1,
            title: "Subnet Region",
            markdown: `Subnet is located in <b>${vnetRegion}</b> region but the app is in <b>${siteRegion}</b> region. This is not valid for Regional VNet integration. You must choose a subnet in <b>${siteRegion}</b> region.`
        }));
    } else {

        //Third check is for subnet size
        var aspData = await GetArmData(serverFarmId, diagProvider);
        var subnetAddressPrefix = subnetData["properties"]["addressPrefix"];
        var subnetSize = subnetAddressPrefix.split("/")[1];
        var aspSku = aspData["sku"].hasOwnProperty("name") ? aspData["sku"]["name"] : undefined;

        if (subnetSize > 26 & aspSku[0] == "P") {
            successMsg += `<li>Subnet is not using the recommended address prefix of /26. Please increase size of the subnet.<br/>`;
            successMsg += `<br/><table><tr><th>Subnet Size</th><th>App Service Plan SKU</th><th>Recommended Subnet Size</th><th>Available Addresses</th></tr>`;
            successMsg += `<tr><td>${subnetSize}</td><td>${aspSku}</td><td><b>/26</b></td><td>64-5 = <b>59</b> Addresses</td></tr>`;
            successMsg += `<tr><td colspan='4'><i>Note: Azure reserves 5 IP addresses within each subnet.</i></td></tr></table>`;
            successMsg += `<u>Steps to increase the subnet size:</u>`;
            successMsg += `<li>In this App Service Plan, disconnect all the Web Apps that are currently using Regional VNET integration.</li>`;
            successMsg += `<li>Increase the subnet size as per the recommendations.</li>`;
            successMsg += `<li>Reconnect the webapps to the same subnet.</li>`;
            successMsg += `<br/>`;
        }
        else if (subnetSize > 27) {
            successMsg += `<li>Subnet is not using the recommended address prefix of /27. Please increase size of the subnet.<br/>`;
            successMsg += `<br/><table><tr><th>Subnet Size</th><th>App Service Plan SKU</th><th>Recommended Subnet Size</th><th>Available Addresses</th></tr>`;
            successMsg += `<tr><td>${subnetSize}</td><td>${aspSku}</td><td><b>/27</b></td><td>32-5 = <b>27</b> Addresses</td></tr>`;
            successMsg += `<tr><td colspan='4'><i>Note: Azure reserves 5 IP addresses within each subnet.</i></td></tr></table>`;
            successMsg += `<u>Steps to increase the subnet size:</u>`;
            successMsg += `<li>In this App Service Plan, disconnect all the Web Apps that are currently using Regional VNET integration.</li>`;
            successMsg += `<li>Increase the subnet size as per the recommendations.</li>`;
            successMsg += `<li>Reconnect the webapps to the same subnet.</li>`;
            successMsg += `<br/>`;
        }

        //Fourth check if subnet is unused
        if (subnetData["properties"]["ipConfigurations"] != null) {
            isSubnetAvailable = false;

            var resourceId = `/resourceGroups/${subnetData["properties"]["ipConfigurations"][0]["id"].split("/resourceGroups/")[1]}`;
            var resourceIdLength = resourceId.toString().length;

            views.push(new InfoStepView({
                infoType: 1,
                title: "Subnet is already in use",
                markdown: `Subnet is already in use by resource <b>${resourceId.substring(0, 53)}<br/>${resourceId.substring(53, resourceIdLength - 1)}</b>. <br/><br/>Please select an unused subnet.`
            }));
        }

        //Fifth check if subnet is owned by server farm where this app is hosted
        var subnetProperties = subnetData["properties"];

        if (subnetProperties["serviceAssociationLinks"] != null) {
            var sal = subnetProperties["serviceAssociationLinks"];
            var linkedAsp = sal[0]["properties"]["link"];
            if (linkedAsp.toLowerCase() == serverFarmId.toLowerCase()) {
                successMsg += `<li>Subnet <b>${selectedSubnetName}</b> is owned by <b>${linkedAsp}</b> App Service Plan and hence could be used for Regional Vnet integration on <b>${thisSite}</b> app.`;
            }
            else {
                isSubnetAvailable = false;

                views.push(new InfoStepView({
                    infoType: 1,
                    title: "Subnet Owner",
                    markdown: `Subnet <b>${selectedSubnetName}</b> is owned by <b>${linkedAsp}</b> App Service Plan and hence could not be used for Regional Vnet integration on <b>${thisSite}</b> app.`
                }));
            }
        }
    }

    if (isSubnetAvailable) {
        views.push(new CheckStepView({
            title: `Subnet [${selectedSubnetName}] is valid for integration with App [${thisSite}]`,
            level: 0
        }));

        successMsg += `<br/>`;
        views.push(new InfoStepView({
            infoType: 0,
            title: "Recommendations",
            markdown: successMsg
        }));
    } else {
        views = [new CheckStepView({
            title: `Subnet [${selectedSubnetName}] is not valid for integration with App [${thisSite}]`,
            level: 2
        })].concat(views);
    }
    return views;
}

async function checkDnsSetting(siteInfo, diagProvider) {
    var views = [];
    var dnsServer = null;
    var vnetDns = [];
    var siteVnetInfo = await GetWebAppVnetInfo(siteInfo["id"], diagProvider);
    if (siteVnetInfo != null) {
        var vnetInfo = siteVnetInfo["properties"];
        var subnetResourceId = vnetInfo["subnetResourceId"];

        if (subnetResourceId != null) {
            if (subnetResourceId.includes("/subnets/")) {
                var vnetResourceId = subnetResourceId.split("/subnets/")[0];
                var vnetMetaData = await diagProvider.getArmResourceAsync(vnetResourceId, "2020-11-01");

                if ((vnetMetaData["properties"]).hasOwnProperty("dhcpOptions")) {
                    vnetDns = vnetMetaData["properties"]["dhcpOptions"]["dnsServers"];
                }
            }
        }
    }
    var appSettings = await diagProvider.getAppSettings();
    var dnsAppSettings = [appSettings["WEBSITE_DNS_SERVER"], appSettings["WEBSITE_DNS_ALT_SERVER"]].filter(i => i != null);

    if (dnsAppSettings.length > 0 || vnetDns.length > 0) {
        var dnsSettings = null;
        var dnsSettingSource = null;
        if (dnsAppSettings.length > 0) {
            /* TODO: show expandable sub-checks
            views.push(new CheckStepView({
                title: `DNS app setting ${dnsAppSettings.join(";")} is detected!`,
                level: 0
            }));*/
            dnsSettings = dnsAppSettings;
            dnsSettingSource = "AppSettings";
        } else {
            if (vnetDns.length > 2) {
                vnetDns.sort();
                dnsSettings = vnetDns.slice(0, 2);
                /* TODO: show expandable sub-checks
                views.push(new CheckStepView({
                    title: `${vnetDns.length} VNet DNS settings are detected!`,
                    level: 1
                }));*/
                markdown = `You have ${vnetDns.length} custom DNS set in VNet, but only first two ${dnsSettings.join(";")} will be used in Windows AppService`;

                views.push(new InfoStepView({
                    infoType: 0,
                    title: "About DNS settings limitation",
                    markdown: markdown
                }));
            } else {
                dnsSettings = vnetDns;
                /* TODO: show expandable sub-checks
                views.push(new CheckStepView({
                    title: `VNet DNS setting ${vnetDns.join(";")} is detected.`,
                    level: 0
                }));*/
            }
            dnsSettingSource = "VNet";
        }

        // verify if custom dns is reachable
        var p1 = diagProvider.tcpPingAsync(dnsSettings[0], 53);
        var p2 = dnsSettings.length >= 2 ? diagProvider.tcpPingAsync(dnsSettings[1], 53) : Promise.resolve(null);
        await Promise.all([p1, p2]);
        var r1 = await p1;
        var r2 = await p2;
        if (r1.status == 0) {
            dnsServer = dnsSettings[0];
        } else if (r2 && r2.status == 0) {
            dnsServer = dnsSettings[1];
        }
        
        if (dnsServer == null) {
            /* TODO: show expandable sub-checks
            views.push(new CheckStepView({
                title: `Custom DNS server ${dnsSettings.slice(0, 2).join(" or ")} is not reachable!`,
                level: 2
            }));*/
            views.push(new InfoStepView({
                infoType: 1,
                title: "Please check your DNS configurations",
                markdown: `You have custom DNS server ${dnsSettings.slice(0, 2).join(";")} configured in ${dnsSettingSource} but they are not reachable from this app, please double check if the DNS server is working properly. `
            }));
        }
        else {
            /* TODO: show expandable sub-checks
            views.push(new CheckStepView({
                title: `Verified custom DNS ${dnsServer} is reachable. It will be used to resolve hostnames.`,
                level: 0
            }));*/
        }
    }
    else {
        dnsServer = "168.63.129.16";
        /* TODO: show expandable sub-checks
        views.push(new CheckStepView({
            title: `No custom DNS is set, default DNS 168.63.129.16 will be applied`,
            level: 0
        }));*/
    }
    return { views, dnsServer };
}


async function runConnectivityCheck(hostname, port, dnsServer, diagProvider) {
    var result = await diagProvider.checkConnectionAsync(hostname, port, undefined, dnsServer);
    var status = result.status;
    var ip = result.ip;
    var markdown = null;
    var views = [];
    var resolvedIp = "";
    if (ip != hostname) {
        if (ip == null) {
            markdown = `DNS server cannot resolve the hostname ${hostname}, possible reasons can be:\r\n` + 
                `1. hostname ${hostname} does not exist, please double check if the hostname is correct\r\n\r\n` +
                (dnsServer == "168.63.129.16" ? "": `1. Your custom DNS server ${dnsServer} was used for resolving hostname, but there is no DNS entry on the server for ${hostname}, please check your DNS server.\r\n\r\n` )+ 
                "1. If your target endpoint is an Azure service with Private Endpoint enabled, please check its Private Endpoint DNS Zone settings.\r\n\r\n"
            views.push(new CheckStepView({
                title: `failed to resolve the IP of ${hostname}`,
                level: 2
            }));
            views.push(new InfoStepView({
                infoType: 1,
                title: "Result explanation and action to take",
                markdown: markdown
            }));
            return views;
        }
        resolvedIp = "Endpoint hostname resolved IP: " + ip;
    }
    if (status == 0) {
        markdown = "Connectivity test was succeeded at tcp level. " +
            "This means Transportation Layer connection was successfully established between this app and target endpoint. \r\n\r\n" +
            "If your app is still having runtime connection failure with this endpoint, the possible reasons can be: \r\n\r\n" +
            "1. Endpoint is not available, please check the status of your endpoint server.\r\n\r\n" +
            "2. Endpoint firewall blocks Webapp or Function app's IP address, please check the IP restriction or application level firewall.\r\n\r\n" +
            "3. The traffic was blocked by Network Security Group or Firewall, please check your NSG or/and Firewall configuration if there is any.\r\n\r\n" +
            "4. The traffic was routed to a wrong destination, please check your User Defined Route Table if there is any.\r\n\r\n" +
            resolvedIp;
        views.push(new CheckStepView({
            title: `${hostname}:${port} - OK (tcp level only)`,
            level: 0
        }));
        views.push(new InfoStepView({
            infoType: 1,
            title: "Result explanation and action to take",
            markdown: markdown
        }));
    } else if (status == 1) {
        markdown = "Connectivity test was failed at tcp level. " + 
            "This means the endpoint is not reachable in Transportation Layer. Possible reasons can be: \r\n\r\n" + 
            "1. The endpoint does not exist, please double check the hostname:port or ip:port was correctly set. \r\n\r\n" + 
            "2. The endpoint is not reachable from the VNet, please double check if the endpoint server is correctly configured. \r\n\r\n" +
            "3. There are TCP level firewall or Network Security Rule blocking the traffic from this app, please check your firewall or NSG rule configurations if there is any. \r\n\r\n" + 
            resolvedIp;
        views.push(new CheckStepView({
            title: `${hostname}:${port} - failed, timeout because target unreachable`,
            level: 2
        }));
        views.push(new InfoStepView({
            infoType: 1,
            title: "Result explanation and action to take",
            markdown: markdown
        }));
        //return { level: 2, title: `${hostname}:${port} - failed, timeout because target unreachable`, resolvedIp };
    } else {
        views.push(new CheckStepView({
            title: `${hostname}:${port} - failed, errorcode:${status}`,
            level: 2
        }));
        views.push(new InfoStepView({
            infoType: 1,
            title: "Result explanation and action to take",
            markdown: "Unknown problem, please send a feedback to let us know and consider creating a support ticket for this."
        }));
        //return { level: 2, title: `${hostname}:${port} - failed, errorcode:${status}`, resolvedIp };
    }
    return views;
}