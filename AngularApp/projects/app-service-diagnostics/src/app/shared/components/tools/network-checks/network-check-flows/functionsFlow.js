import {ResourcePermissionCheckManager, runKuduAccessibleCheck, checkVnetIntegrationHealth, checkDnsSettingAsync, extractHostPortFromConnectionString, checkSubnetSizeAsync, extractHostPortFromKeyVaultReference} from './flowMisc.js';

export var functionsFlow = {
    title: "My Function App is not starting or executing or I see connection errors in logs",
    async func(siteInfo, diagProvider, flowMgr) {
        // Check that Kudu is accessible
        var isKuduAccessible = true;
        var kuduAvailabilityCheckPromise = runKuduAccessibleCheck(diagProvider);
        flowMgr.addViews(kuduAvailabilityCheckPromise, "Checking kudu availability...");
        var permMgr = new ResourcePermissionCheckManager();
        flowMgr.addView(permMgr.checkView);

        var kuduReachablePromise = kuduAvailabilityCheckPromise.then(r => isKuduAccessible);

        var promise = checkVnetIntegrationHealth(siteInfo, diagProvider, kuduReachablePromise, permMgr);
        flowMgr.addViews(promise.then(d => d.views), "Checking VNet integration status...");
        var data = { 
            subnetDataPromise: promise.then(d => d.subnetData), 
            serverFarmId: siteInfo["serverFarmId"], 
            kuduReachablePromise, 
            isContinuedPromise: promise.then(d => d.isContinue) 
        };

        // TODO: separate common code between this and connectionFailureFlow.js
        await flowMgr.addViews(data.isContinuedPromise.then(c => c ? checkNetworkConfigAndConnectivityAsync(siteInfo, diagProvider, flowMgr, data, permMgr) : null), "Checking Network Configuration...");
        
        var dnsCheckResultPromise = checkDnsSettingAsync(siteInfo, diagProvider);
        var dnsCheckResult = await dnsCheckResultPromise;
        var dnsServers = dnsCheckResult.dnsServers;

        /**
         * Functions specific checks
         **/
            var appSettings = await diagProvider.getAppSettings();

        flowMgr.addView(new InfoStepView({
            infoType: 0,
            title: "Validating Function App connectivity",
            markdown: "Checking connectivity to all configured storage accounts, Key Vaults and Application Insights"
        }));
        
        // Validate AzureWebJobs connection string
        var appSettingsToValidate = ["AzureWebJobsStorage", "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING"];
        var runFromPackageProperty = appSettings["WEBSITE_RUN_FROM_PACKAGE"];
        if(runFromPackageProperty != undefined && runFromPackageProperty != "0" && runFromPackageProperty != "1")
        {
            // Points to a URL where package to run is available
            appSettingsToValidate.push("WEBSITE_RUN_FROM_PACKAGE");
        }

        if(appSettings["APPLICATIONINSIGHTS_CONNECTION_STRING"] != undefined)
        {
            appSettingsToValidate.push("APPLICATIONINSIGHTS_CONNECTION_STRING");
        }

        var subChecks = [];
        var failureInfoViews = [];
        var promises = appSettingsToValidate.map(async (propertyName) => {
            var connectionString = appSettings[propertyName];
            if(!isKeyVaultReference(connectionString)) {
                var hostPort = extractHostPortFromConnectionString(connectionString);

                if (hostPort.HostName != undefined && hostPort.Port != undefined) {
                    var connectivityCheckResult = await runConnectivityCheckAsync(hostPort.HostName, hostPort.Port, dnsServers, diagProvider, hostPort.HostName.length);
                    if(connectivityCheckResult.failureInfoViews.length == 0) {
                        subChecks.push({
                            title: `Application setting "${propertyName}" - successfully accessed the endpoint "${hostPort.HostName}:${hostPort.Port}"`,
                            level: 0});
                    } else { // Some checks failed
                        subChecks.push({
                            title: `Application setting "${propertyName}" - could not access the endpoint "${hostPort.HostName}:${hostPort.Port}". See information below for details`,
                            level: 2});
                        failureInfoViews.push(...connectivityCheckResult.failureInfoViews);
                    }
                } else { // Unsupported / invalid connection string format
                    subChecks.push({
                        title: `Application setting "${propertyName}" - This detector does not support the configured connection string format.`,
                        level: 2});
                    failureInfoViews.push(new InfoStepView({
                        infoType: 1,
                        title: "Failed check details and recommended next steps",
                        markdown: `Application setting "${propertyName}" - This detector does not support the configured connection string format.`}));
                }
            } else {
                var hostPort = extractHostPortFromKeyVaultReference(connectionString);
                if (hostPort.HostName != undefined && hostPort.Port != undefined) {
                    var connectivityCheckResult = await runConnectivityCheckAsync(hostPort.HostName, hostPort.Port, dnsServers, diagProvider, hostPort.HostName.length);
                    if(connectivityCheckResult.failureInfoViews.length == 0) {
                        subChecks.push({
                            title: `Application setting "${propertyName}" - Network access validation of connection strings configured as key vault references is currently not supported.  Network access to the Key Vault service itself was verified`,
                            level: 1});
                    } else {
                        subChecks.push({
                            title: `Application setting "${propertyName}" - Network access validation of connection strings configured as key vault references is currently not supported.  The Key Vault endpoint itself "${hostPort.HostName}:${hostPort.Port} could not be reached". See information below for details`,
                            level: 2});
                        failureInfoViews.push(...connectivityCheckResult.failureInfoViews);
                    }
                } else {
                    subChecks.push({
                        title: `Application setting "${propertyName}" - Network access validation of connection strings configured as key vault references is currently not supported.  The Key Vault reference itself could not be parsed`,
                        level: 2});
                }
            }
        });
        await Promise.all(promises);
        var someChecksFailed = false;
        subChecks.forEach(check => someChecksFailed = (someChecksFailed || check.level != 0) ? true : false);
        if(!someChecksFailed) {
            await flowMgr.addView(new CheckStepView({
                title: `Network access checks of Function application settings were successful`,
                subChecks: subChecks,
                level: 0
            }));
        } else {
            await flowMgr.addViews([
                new CheckStepView({
                    title: `Some network access checks of Function application settings failed.  See details below.`,
                    subChecks: subChecks,
                    level: 2}), 
                ...failureInfoViews
            ]);
        }

        flowMgr.addView(new InfoStepView({
            infoType: 0,
            title: "Validating Function binding connectivity",
            markdown: "Checking network connectivity to all input and output bindings of all functions"
        }));
        // Explore the binding information of all functions in this function app to determine connection string
        var functionsInfo = [];  // array of maps containing information about functions
        var functionAppResourceId = siteInfo["resourceUri"];
        var functionsList = await diagProvider.getArmResourceAsync(functionAppResourceId + "/functions");
        functionsList.value.forEach(func => {
            var functionInfo = { name: func.name, connectionStringProperties: [] };
            func.properties.config.bindings.forEach(binding => {
                if( binding.connection != undefined) {
                    functionInfo.connectionStringProperties.push(binding.connection);
                } else if( binding.connectionStringSetting != undefined) { // CosmosDB
                    functionInfo.connectionStringProperties.push(binding.connectionStringSetting);
                }
            });
            if(functionInfo.connectionStringProperties.length > 0) {
                functionsInfo.push(functionInfo);
            }
        });

        var promises = functionsInfo.map(async (functionInfo) => {
            var subChecks = [];
            var failureInfoViews = [];
            var promises = functionInfo.connectionStringProperties.map(async (propertyName) => {
                var connectionString = appSettings[propertyName];
                if(!isKeyVaultReference(connectionString)) {
                    var hostPort = extractHostPortFromConnectionString(connectionString);
                    var connectivityCheckResult = await runConnectivityCheckAsync(hostPort.HostName, hostPort.Port, dnsServers, diagProvider, hostPort.HostName.length);
                    // TODO: Add connectivityCheckResult.subChecks as 3rd level subcheck when supported
                    if(connectivityCheckResult.failureInfoViews.length == 0) { //Some checks failed
                        subChecks.push({
                            title: `Successfully accessed the endpoint "${hostPort.HostName}:${hostPort.Port}" configured in App Setting "${propertyName}"`,
                            level: 0});
                    } else {
                        subChecks.push({
                            title: `Could not access the endpoint "${hostPort.HostName}:${hostPort.Port}" configured in App Setting "${propertyName}". See information below for details`,
                            level: 2});
                        failureInfoViews.push(...connectivityCheckResult.failureInfoViews);
                    }
                } else {
                    subChecks.push({
                        title: "Network access validation of binding endpoints configured as key vault references is currently not supported",
                        level: 1});
                    failureInfoViews.push(new InfoStepView({
                        infoType: 1,
                        title: "Failed check details and recommended next steps",
                        markdown: `This validator is unable to lookup connection strings configured as key vault references. Recommend checking application logs to determine if the function code was unable to connect to service configured in the application setting "${propertyName}.`
                    }));
                }
            });
            await Promise.all(promises);
            var functionName = functionInfo.name.split("/").length < 2 ? functionInfo.name : functionInfo.name.split("/")[1];
            var someChecksFailed = false;
            subChecks.forEach(check => someChecksFailed = (someChecksFailed || check.level != 0) ? true : false);
            if(!someChecksFailed) {
                await flowMgr.addView(new CheckStepView({
                    title: `Function "${functionName}" - successfully checked network access to endpoints configured in bindings.`,
                    subChecks: subChecks,
                    level: 0
                }));
            } else {
                await flowMgr.addViews([
                    new CheckStepView({
                        title: `Function "${functionName}" - some network access checks to endpoints configured in bindings failed.  See details below.`,
                        subChecks: subChecks,
                        level: 2}), 
                    ...failureInfoViews
                ]);
            }
        });

        await Promise.all(promises);

        // Show this at the end if there are any positive results?
        var markdown = "Positive checks above indicate a network layer connection was successfully established between this app and remote service. \r\n\r\n" +
        "If your app is still having runtime connection failures with this endpoint, the possible reasons can be: \r\n\r\n" +
        "-  Service is not available, please check the status of your endpoint server.\r\n\r\n" +
        "-  Endpoint firewall blocks Web App or Function App's IP address, please check the IP restriction or application level firewall.\r\n\r\n" +
        "-  The traffic was blocked by Network Security Group or Firewall, please check your NSG or/and Firewall configuration if there is any.\r\n\r\n" +
        "-  The traffic was routed to a wrong destination, please check your User Defined Route Table if there is any.\r\n\r\n" +
        "-  The endpoint is an Azure Resource in a VNet in a different region. ";
        flowMgr.addView(new InfoStepView({
            infoType: 0,
            title: "Explanation of the results and recommended next steps",
            markdown: markdown
        }));
    }
};

function isKeyVaultReference(appSetting) {
    return appSetting.includes("@Microsoft.KeyVault");
}

async function checkNetworkConfigAndConnectivityAsync(siteInfo, diagProvider, flowMgr, data, permMgr) {
    var subnetDataPromise = data.subnetDataPromise;
    var serverFarmId = data.serverFarmId;
    var kuduReachablePromise = data.kuduReachablePromise;
    var kuduReachable = null;
    var dnsServers = [];

    //return (async function generateConfigCheckViews() {
        var views = [], subChecks = [];
        var level = 0, skipReason = null;
        var titlePostfix = "";
        var configCheckView = new CheckStepView({
            title: "Network Configuration is healthy",
            level: 0
        });
        views.push(configCheckView);
        var subnetSizeCheckPromise = checkSubnetSizeAsync(diagProvider, subnetDataPromise, serverFarmId, permMgr);
        var dnsCheckResultPromise = checkDnsSettingAsync(siteInfo, diagProvider);
        var appSettings = await diagProvider.getAppSettings();
        var vnetRouteAll = (appSettings["WEBSITE_VNET_ROUTE_ALL"] === "1");

        if (vnetRouteAll) {
            subChecks.push({ title: "WEBSITE_VNET_ROUTE_ALL is set to 1, all traffic will be routed to VNet", level: 3 });
        } else {
            subChecks.push({ title: "WEBSITE_VNET_ROUTE_ALL is not set or set to 0, only private network traffic(RFC1918) will be routed to VNet", level: 3 });
        }

        var subnetSizeResult = await subnetSizeCheckPromise;
        if (subnetSizeResult != null) {
            if (subnetSizeResult.checkResult.level == 1) {
                level = 1;
            }
            views = views.concat(subnetSizeResult.views);
            subChecks.push(subnetSizeResult.checkResult);
        }

        kuduReachable = await kuduReachablePromise;
        if (kuduReachable) {
            var dnsCheckResult = await dnsCheckResultPromise;
            dnsServers = dnsCheckResult.dnsServers;
            views = views.concat(dnsCheckResult.views);
            subChecks = subChecks.concat(dnsCheckResult.subChecks);
            if (dnsServers.length === 0) {
                level = 2;
            } else if (dnsCheckResult.level == 1) {
                level = Math.max(level, 1);
            }
        } else {
            subChecks.push({ title: "DNS check was skipped due to having no access to Kudu", level: 3 });
            if (subnetSizeResult != null) {
                titlePostfix = " (incomplete result)";
            } else {
                // no check is done
                skipReason = "Kudu is inaccessible";
                level = 3;
            }
        }

        if (level == 1) {
            configCheckView.title = "Network Configuration is suboptimal";
            configCheckView.level = 1;
        } else if (level == 2) {
            configCheckView.title = "Network Configuration is unhealthy";
            configCheckView.level = 2;
        } else if (level == 3) {
            configCheckView.title = `Network Configuration checks are skipped due to ${skipReason}`;
            configCheckView.level = 3;
        }
        configCheckView.title += titlePostfix;
        configCheckView.subChecks = subChecks;
        return views;
    //})();
}

async function runConnectivityCheckAsync(hostname, port, dnsServers, diagProvider, lengthLimit) {
    var fellbackToPublicDns = false;
    var nameResolvePromise = (async function checkNameResolve() {
        var ip = null;
        var checkResultsMarkdown = [];
        if (diagProvider.isIp(hostname)) {
            ip = hostname;
        } else {
            for (var i = 0; i < dnsServers.length; ++i) {
                var result = await diagProvider.nameResolveAsync(hostname, dnsServers[i]).catch(e => {
                    logDebugMessage(e);
                    return {};
                });
                var dns = (dnsServers[i] == "" ? "Azure DNS server" : `DNS server ${dnsServers[i]}`);
                if (result.ip != null) {
                    if (dnsServers[i] == "") {
                        fellbackToPublicDns = true;
                    }
                    ip = result.ip;
                    checkResultsMarkdown.push(`Successfully resolved hostname **${hostname}** with ${dns}`);
                    break;
                } else {
                    checkResultsMarkdown.push(`Failed to resolve hostname **${hostname}** with ${dns}`);
                }
            }
        }
        return { ip, checkResultsMarkdown };
    })();

    var tcpPingPromise = diagProvider.tcpPingAsync(hostname, port).catch(e => {
        logDebugMessage(e);
        return {};
    });

    await Promise.all([nameResolvePromise, tcpPingPromise]);

    // DNS name resolution validation
    var nameResolveResult = await nameResolvePromise;
    var resolvedIp = nameResolveResult.ip;
    var resultsMarkdown = nameResolveResult.checkResultsMarkdown;

    var subChecks = [];
    var failureInfoViews = [];

    if (resolvedIp != hostname) {
        hostname = hostname.length > lengthLimit ? hostname.substr(0, lengthLimit) + "..." : hostname;
        if (resolvedIp == null) {
            subChecks.push({ title: `Failed to resolve the IP of ${hostname}`,
                             level: 2 });

            var markdown = "Results:"
            resultsMarkdown.forEach(element => markdown += "\r\n\r\n- " + element);

            markdown += `\r\n\r\nPossible reasons can be:\r\n` +
            `-  hostname **${hostname}** does not exist, please double check if the hostname is correct\r\n\r\n` +
            (dnsServers.filter(s => s != "").length == 0 ? "" : `-  Your custom DNS server was used for resolving hostname, but there is no DNS entry on the server for **${hostname}**, please check your DNS server.\r\n\r\n`) +
            "-  If your target endpoint is an Azure service with Private Endpoint enabled, please check its Private Endpoint DNS Zone settings.\r\n\r\n";
            failureInfoViews.push(new InfoStepView({
                infoType: 1,
                title: "Failed check details and recommended next steps",
                markdown: markdown
            }));
            return { subChecks: subChecks, failureInfoViews: failureInfoViews };
        }
    }

    // TCP Ping checks
    var tcpPingResult = await tcpPingPromise;
    var status = tcpPingResult.status;
    var msg = `Connecting to ${hostname}:${port} from your App instance`;
    if (status == 0) {
        subChecks.push({ title: `TCP ping to ${hostname} was successful`, level: 0 });
    } else if (status == 1) {
        var markdown = `Connectivity test failed at TCP level for hostname **${hostname}** via resolved IP address ${resolvedIp}` +
            "This means the endpoint was not reachable in Transportation Layer. Possible reasons can be: \r\n\r\n" +
            "-  The endpoint does not exist, please double check the hostname:port or ip:port was correctly set. \r\n\r\n" +
            "-  The endpoint is not reachable from the VNet, please double check if the endpoint server is correctly configured. \r\n\r\n" +
            "-  There is a TCP level firewall or a Network Security Group Rule blocking the traffic from this app. Please check your firewall or NSG rules if there are any. \r\n\r\n" +
            "-  WEBSITE_ALWAYS_FALLBACK_TO_PUBLIC_DNS setting is not supported by this connectivity check yet, if custom DNS server fails to resolve the hostname, the check will fail.\r\n\r\n";

        subChecks.push({ title: `TCP ping to ${hostname} via IP address ${resolvedIp} failed, timeout because target is unreachable`, level: 2 });
        failureInfoViews.push(new InfoStepView({
            infoType: 1,
            title: "Failed check details and recommended next steps",
            markdown: markdown
        }));

    } else {
        subChecks.push({ title: `TCP ping to ${hostname} failed, errorcode:${status}`, level: 2 });
        failureInfoViews.push(new InfoStepView({
            infoType: 1,
            title: "Failed check details and recommended next steps",
            markdown: `Unknown problem, please send us feedback via the ":) Feedback" button above.`
        }));
    }
    return { subChecks: subChecks, failureInfoViews: failureInfoViews };
}


