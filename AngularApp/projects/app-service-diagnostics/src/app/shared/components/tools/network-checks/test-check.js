export const jsTestChecks = [sampleJsCheck, checkVnetRouteAllConfig];

async function sampleJsCheck(siteInfo, appSettings, armService){
    var s = Object.keys(appSettings).map(key => key + ":" + appSettings[key]);
    return {title: "JS Sample Check",level: 0, markdown: s.join(";")};
}

async function sampleJsCheck2(siteInfo, appSettings, armService){
    console.log(appSettings);
    console.log(siteInfo);
    var armResource = await armService.postResourceAsync("/subscriptions/6ae79ddd-3eea-4ceb-8460-a86a469c69db/resourceGroups/NetworkingRG/providers/Microsoft.Web/sites/winswift/config/appsettings/list");
    console.log(armResource);
    
    return {title: "JS Sample Check",level: 0, markdown: "ok"};
}


async function checkVnetRouteAllConfig(siteInfo, appSettings, armService){
    var desc = "Checking WEBSITE_VNET_ROUTE_ALL configuration";
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

    return {title:desc, level: level, markdown: msg};
}