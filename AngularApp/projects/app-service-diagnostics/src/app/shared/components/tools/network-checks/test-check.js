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
    func:async function kuduApiTestCheck(siteInfo, appSettings, diagProvider){
        var markdown = "";
        var a = await diagProvider.runKudoCommand(siteInfo.siteName,  "nameresolver www.microsoft.com"); // runKudoCommand(siteName: string, command: string, dir?: string, instance?:string)
        console.log(a);
        markdown+= `nameresolver www.microsoft.com\r\n${a}\r\n`;
        var task1 = diagProvider.runKudoCommand(siteInfo.siteName, "hostname", null, "c928c594b76bcadc7aed310ccf07d9bf9e9cceaa720c7166e8c8b2ff6aecb2fa");
        var task2 = diagProvider.runKudoCommand(siteInfo.siteName, "hostname", null, "ea583f4b41400bd1135d0ee050604b634f37be5c0fd221c3214cb855b06bc1ea");
        var [x,y] = await Promise.all([task1, task2]);
        markdown += `hostname (on two instance)\r\ninstance1: ${x}instance2: ${y}\r\n`;
        return {level: 0, markdown: "```\r\n"+markdown+"\r\n```"};
    }
}


var connectionCheck = {
    title: "connectionCheck",
    func: async function connectionCheck(siteInfo, appSettings, diagProvider){
        var hostName = "www.microsoft.com";
        var port = 443;
        var output =`check connection to ${hostName}:${port}\r\n`;
        var result = await diagProvider.checkConnectionAsync(hostName, port);
        output += `on one instance count = 1: result = ${JSON.stringify(result)}\r\n`;

        result = await diagProvider.checkConnectionAsync(hostName, port, 4);
        output += `on one instance count = 4: result = ${JSON.stringify(result)}\r\n`;

        var p1 = diagProvider.checkConnectionAsync(hostName, port, 1, "c928c594b76bcadc7aed310ccf07d9bf9e9cceaa720c7166e8c8b2ff6aecb2fa");
        var p2 = diagProvider.checkConnectionAsync(hostName, port, 1, "ea583f4b41400bd1135d0ee050604b634f37be5c0fd221c3214cb855b06bc1ea");
        result = await Promise.all([p1, p2]);
        output += `on two instances count = 4: result = ${JSON.stringify(result)}\r\n`;

        return {level: 0, markdown: "```\r\n"+output+"\r\n```"};
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