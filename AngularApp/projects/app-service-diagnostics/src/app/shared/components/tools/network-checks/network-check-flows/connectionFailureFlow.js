import { DropdownStepView, InfoStepView, StepFlow, StepFlowManager, CheckStepView, StepViewContainer, InputStepView, ButtonStepView, PromiseCompletionSource, TelemetryService } from 'diagnostic-data';
import { checkKuduAvailabilityAsync, checkVnetIntegrationV2Async, checkDnsSettingAsync, checkSubnetSizeAsync, checkDnsSettingV2Async} from './flowMisc.js';
import {CommonWordings} from './commonWordings.js'
import {VnetIntegrationConfigChecker} from './vnetIntegrationConfigChecker.js'
export var connectionFailureFlow = {
    title: "Connection issues",
    async func(siteInfo, diagProvider, flowMgr) {
        var isKuduAccessiblePromise = checkKuduAvailabilityAsync(diagProvider, flowMgr);

        var isContinue = await checkVnetIntegrationV2Async(siteInfo, diagProvider, flowMgr, isKuduAccessiblePromise);
        if(!isContinue){
            return;
        }

        var dnsSettings = [];
        isContinue = await checkDnsSettingV2Async(siteInfo, diagProvider, flowMgr, isKuduAccessiblePromise, dnsSettings);
        if(!isContinue){
            return;
        }
        checkNetworkConfigAndConnectivity(siteInfo, diagProvider, flowMgr, isKuduAccessiblePromise, dnsSettings);

    }
}

async function runConnectivityCheck(hostname, port, dnsServers, diagProvider, lengthLimit) {
    var subChecks = [];
    var fellbackToPublicDns = false;
    var nameResolvePromise = (async function checkNameResolve() {
        var ip = null;
        var subChecks = [];
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
                    subChecks.push({ title: `Successfully resolved hostname '${hostname}' with ${dns}`, level: 0 });
                    break;
                } else {
                    subChecks.push({ title: `Failed to resolve hostname '${hostname}' with ${dns}`, level: 1 });
                }
            }
        }
        return { ip, subChecks };
    })();
    var tcpPingPromise = diagProvider.tcpPingAsync(hostname, port).catch(e => {
        logDebugMessage(e);
        return {};
    });

    await Promise.all([nameResolvePromise, tcpPingPromise]);

    var nameResolveResult = await nameResolvePromise;
    var ip = nameResolveResult.ip;
    subChecks = nameResolveResult.subChecks;

    var tcpPingResult = await tcpPingPromise;
    var status = tcpPingResult.status;

    var markdown = null;
    var views = [];
    var resolvedIp = "";
    if (ip != hostname) {
        hostname = hostname.length > lengthLimit ? hostname.substr(0, lengthLimit) + "..." : hostname;
        if (ip == null) {
            markdown = `DNS server cannot resolve the hostname **${hostname}**, possible reasons can be:\r\n` +
                `-  hostname **${hostname}** does not exist, please double check if the hostname is correct\r\n\r\n` +
                (dnsServers.filter(s => s != "").length == 0 ? "" : `-  Your custom DNS server was used for resolving hostname, but there is no DNS entry on the server for **${hostname}**, please check your DNS server.\r\n\r\n`) +
                "-  If your target endpoint is an Azure service with Private Endpoint enabled, please check its Private Endpoint DNS Zone settings.\r\n\r\n"
            views.push(new CheckStepView({
                title: `failed to resolve the IP of ${hostname}`,
                subChecks: subChecks,
                level: 2
            }));
            views.push(new InfoStepView({
                infoType: 1,
                title: "Explanation of the result and recommended next steps",
                markdown: markdown
            }));
            return views;
        }
        resolvedIp = `hostname **${hostname}** was resolved to IP: ` + ip;
    }
    var msg = `Connecting to ${hostname}:${port} from your App instance`;
    if (status == 0) {
        markdown = "Connectivity test succeeded at TCP level. " +
            "This means Transportation Layer connection was successfully established between this app and the target endpoint. \r\n\r\n" +
            "If your app is still having runtime connection failures with this endpoint, the possible reasons can be: \r\n\r\n" +
            "-  Service is not available, please check the status of your endpoint server.\r\n\r\n" +
            "-  Endpoint firewall blocks Web App or Function App's IP address, please check the IP restriction or application level firewall.\r\n\r\n" +
            "-  The traffic was blocked by Network Security Group or Firewall, please check your NSG or/and Firewall configuration if there is any.\r\n\r\n" +
            "-  The traffic was routed to a wrong destination, please check your User Defined Route Table if there is any.\r\n\r\n" +
            "-  The endpoint is an Azure Resource in a VNet in a different region. "
        resolvedIp;
        subChecks.push({ title: `TCP ping to ${hostname} was succeeded`, level: 0 });
        views.push(new CheckStepView({
            title: msg + " - OK (TCP level)",
            subChecks: subChecks,
            level: 0
        }));
        views.push(new InfoStepView({
            infoType: 1,
            title: "Explanation of the result and recommended next steps",
            markdown: markdown
        }));
    } else if (status == 1) {
        markdown = "Connectivity test failed at TCP level. " +
            "This means the endpoint was not reachable in Transportation Layer. Possible reasons can be: \r\n\r\n" +
            "-  The endpoint does not exist, please double check the hostname:port or ip:port was correctly set. \r\n\r\n" +
            "-  If the IP address resolved from hostname is no expected, then please check your DNS record configured in your DNS server or private DNS zone. \r\n\r\n" +
            "-  The endpoint is not reachable from the VNet, please double check if the endpoint server is correctly configured. \r\n\r\n" +
            "-  There is a TCP level firewall or a Network Security Group Rule blocking the traffic from this app. Please check your firewall or NSG rules if there are any. \r\n\r\n" +
            "-  WEBSITE_ALWAYS_FALLBACK_TO_PUBLIC_DNS setting is not supported by this connectivity check yet, if custom DNS server fails to resolve the hostname, the check will fail.\r\n\r\n" +
            resolvedIp;

        subChecks.push({ title: `TCP ping to ${hostname} failed, timeout because target is unreachable`, level: 2 });
        views.push(new CheckStepView({
            title: msg + " - failed, timeout because target is unreachable",
            subChecks: subChecks,
            level: 2
        }));
        views.push(new InfoStepView({
            infoType: 1,
            title: "Explanation of the result and recommended next steps",
            markdown: markdown
        }));

    } else {
        subChecks.push({ title: `TCP ping to ${hostname} failed, errorcode:${status}`, level: 2 });
        views.push(new CheckStepView({
            title: msg + ` - failed, errorcode:${status}`,
            subChecks: subChecks,
            level: 2
        }));
        views.push(new InfoStepView({
            infoType: 1,
            title: "Explanation of the result and recommended next steps",
            markdown: "Unknown problem, please send a feedback to let us know."
        }));

    }
    return views;
}

async function checkNetworkConfigAndConnectivity(siteInfo, diagProvider, flowMgr, isKuduAccessiblePromise, dnsServers) {
    var state = null;
    var isKuduAccessible = await isKuduAccessiblePromise;
    var connectivityCheckViews = (function generateConnectivityCheckViews() {
        if (!isKuduAccessible) {
            return [new CheckStepView({ title: "Connectivity check (tcpping and nameresolver) is not available due to Kudu is inaccessible.", level: 3 })];
        }

        if (dnsServers.length === 0) {
            return [];
        }

        return [new InputStepView({
            title: "Specify an endpoint you want to test connectivity to",
            placeholder: "hostname:port or ip:port",
            buttonText: "Continue",
            entry: "Endpoint",
            text: "",
            tooltip: "e.g. microsoft.com:443 or 8.8.8.8:53\r\ncommon service ports: http - 80; https - 443; sql server - 1433; dns - 53",
            error: null,
            collapsed: false,
            async callback(userInput) {
                userInput = userInput.trim();
                flowMgr.reset(state);
                flowMgr.logEvent("ConnectivityTestTriggered", {});
                const userInputLimitInUI = 50; // only applies to the UI, will show ... if more than 50 chars
                const userInputLimit = 300;
                var splitted = userInput.split(":");
                var hostname, port;

                if (userInput.length > userInputLimit) {
                    this.error = "invalid endpoint";
                    return;
                }

                if (userInput.startsWith("http")) {
                    port = userInput.startsWith("https") ? 443 : 80;
                    var m = userInput.match(/\/\/(.*?)(\/.*|$)/);
                    hostname = (m == null ? null : m[1]);
                    if (hostname == null) {
                        this.error = "invalid endpoint";
                        return;
                    } else {
                        this.text = `${hostname}:${port}`;
                        userInput = this.text;
                        userInput = userInput.length > userInputLimitInUI ? userInput.substr(0, userInputLimitInUI) + "..." : userInput;
                    }
                } else {
                    if (splitted.length != 2 || isNaN(port = parseInt(splitted[1]))) {
                        this.error = "invalid endpoint";
                        return;
                    } else {
                        this.error = null;
                        hostname = splitted[0];
                        userInput = userInput.length > userInputLimitInUI ? userInput.substr(0, userInputLimitInUI) + "..." : userInput;
                    }
                }
                flowMgr.addViews(runConnectivityCheck(hostname, port, dnsServers, diagProvider, userInputLimitInUI), `Connecting to ${userInput}...`);
                this.collapsed = true;
            }
        })];
    })();
    state = flowMgr.addViews(connectivityCheckViews);
}