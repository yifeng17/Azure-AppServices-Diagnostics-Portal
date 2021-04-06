export class ResourcePermissionCheckManager{
    constructor(){
        this.hidden = true;
        this.checkView = new CheckStepView({
            title: "Access was restricted to some resources, check results will be incomplete",
            level: 3,
            hidden: true,
            subChecks: []
        });
    }

    addResource(uri){
        if(this.hidden){
            this.hidden = false;
            this.checkView.hidden = false;
        }
        this.checkView.subChecks.push({title:`Have no access to ${uri}`, level:3});
    }
}

export async function GetArmData(resourceId, diagProvider) {
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

export async function GetWebAppVnetInfo(siteArmId, armService) {
    //This is the regional VNet Integration endpoint
    var swiftUrl = siteArmId + "/config/virtualNetwork";
    var siteVnetInfo = await armService.getArmResourceAsync(swiftUrl, "2018-02-01");

    return siteVnetInfo;
}

var armDataDictionary = {};
export async function GetSubnet(armService, subnetResourceId) {
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
