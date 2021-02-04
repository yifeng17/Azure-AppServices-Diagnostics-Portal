var sampleJsCheck = {
    title: "JS Sample Check",
    func:async function sampleJsCheck(siteInfo, appSettings, armService){
        var s = Object.keys(appSettings).map(key => key + ":" + appSettings[key]);
        return {level: 0, markdown: s.join(";")};
    }
}

var sampleJsCheck2 = {
    title: "JS Sample Check2",
    func:async function sampleJsCheck2(siteInfo, appSettings, armService){
        console.log(appSettings);
        console.log(siteInfo);
        var armResource = await armService.postResourceAsync("/subscriptions/6ae79ddd-3eea-4ceb-8460-a86a469c69db/resourceGroups/NetworkingRG/providers/Microsoft.Web/sites/winswift/config/appsettings/list");
        console.log(armResource);
        
        return {level: 0, markdown: "```\r\n"+ JSON.stringify(armResource) +"\r\n```"};
    }
}

var kuduApiTestCheck = {
    title: "kudu api check",
    func:async function kuduApiTestCheck(siteInfo, appSettings, armService){
        var command = "nameresolver www.microsoft.com";
        var a = await armService.postKudoApiAsync(siteInfo.siteName, "command", {
        "command": command
    });
        console.log(a);
        return {level: 0, markdown: "command is: "+command+"\r\n```\r\n"+a.Output+"\r\n```"};
    }
}


var connectionCheck = {
    title: "connectionCheck",
    func: async function connectionCheck(siteInfo, appSettings, diagProvider){
        var hostName = "www.microsoft.com";
        var port = 443;
        var result = await diagProvider.checkConnectionAsync(hostName, port);
        return {level: 0, markdown: `check connection to ${hostName}:${port}\r\nresult:${JSON.stringify(result)}`};
    }
}


var checkVnetRouteAllConfig = {
    title: "Checking WEBSITE_VNET_ROUTE_ALL configuration",
    func:async function checkVnetRouteAllConfig(siteInfo, appSettings, armService){
        var msg, level;
        if("WEBSITE_VNET_ROUTE_ALL" in appSettings){
            if(appSettings["WEBSITE_VNET_ROUTE_ALL"] == "0"){
                msg = "**WEBSITE_VNET_ROUTE_ALL** is set to 0, only **private outbound traffic** will be routed to VNet! Click [here](https://www.microsoft.com) to set **WEBSITE_VNET_ROUTE_ALL** to 1 to route all traffic to VNet";
                level = 1; // warning
            }else{
                msg = "WEBSITE_VNET_ROUTE_ALL is set to 1, all traffic will be routed to VNet. Change to 0 if this behavior is not expected.";
                level = 0;
            }
        }
        else{
            msg = "**WEBSITE_VNET_ROUTE_ALL** is not set, only **private outbound traffic** will be routed to VNet! Click [here](https://www.microsoft.com) to set **WEBSITE_VNET_ROUTE_ALL** to 1 to **route all traffic** to VNet";
            level = 1;
        }
    
        return { level: level, markdown: msg};
    }
}

export var jsTestChecks = [sampleJsCheck, checkVnetRouteAllConfig, sampleJsCheck2, kuduApiTestCheck, connectionCheck];