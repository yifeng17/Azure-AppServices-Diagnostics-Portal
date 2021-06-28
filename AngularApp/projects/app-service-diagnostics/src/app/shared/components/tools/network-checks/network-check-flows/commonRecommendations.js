export class CommonRecommendations{
    constructor(){
        this.KuduNotAccessible = {
            Get(kuduUrl){
                return new InfoStepView({
                    infoType: 1,
                    title: "Recommendations",
                    markdown: "[Kudu](https://docs.microsoft.com/en-us/azure/app-service/resources-kudu) is not accessible. Possible reasons can be:\r\n\r\n" +
                        "- Timeout, please click refresh button and retry\r\n\r\n" +
                        "- Kudu extension is not working properly due to invalid App Settings, e.g. invalid WEBSITE_CONTENTAZUREFILECONNECTIONSTRING. In this case, " + 
                        "your app may not be working properly as well. Please fix the problem to enable the check that depends on Kudu.  \r\n\r\n" +
                        `- Kudu extension is not working properly for unknown reason, please check if you can access Kudu by [${kuduUrl}](${kuduUrl}). \r\n\r\n`+
                        "The diagnostic results will be incomplete without Kudu access."
                });
            }
        }
    }
}