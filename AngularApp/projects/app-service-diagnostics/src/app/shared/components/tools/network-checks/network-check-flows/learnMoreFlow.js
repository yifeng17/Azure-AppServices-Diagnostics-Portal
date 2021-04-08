export var learnMoreFlow = {
    title: "I want to learn more about VNet integration",
    async func(siteInfo, diagProvider, flowMgr) {
        flowMgr.addView(new InfoStepView({
            infoType: 1,
            title: "Learn more about VNet integration",
            markdown: `<div style="margin-left: -25px;">\r\n\r\n` +
                "- To learn about the basic concepts of Azure Virtual Networks, please visit [What is Azure Virtual Network](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview) \r\n\r\n" +
                "- Visit [Integrate your app with an Azure virtual network](https://docs.microsoft.com/en-us/azure/app-service/web-sites-integrate-with-vnet)" +
                " to learn about the App Service VNet Integration feature\r\n\r\n" +
                `- Click [here](${diagProvider.portalDomain}/#@/resource${siteInfo.resourceUri}/networking) to configure VNet integration for your app` +
                "</div>"
        }));
    }
}