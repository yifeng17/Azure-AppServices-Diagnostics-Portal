export class CommonRecommendations
{
    constructor(){
        this.KuduNotAccessible = {
            Get(){
                return new InfoStepView({
                    infoType: 1,
                    title: "Recommendations",
                    markdown: "[Kudu](https://techcommunity.microsoft.com/t5/educator-developer-blog/using-kudu-and-deploying-apps-into-azure/ba-p/378585) is not accessible. Possible reason can be:\r\n\r\n" +
                        "- Timeout, please click refresh button and retry\r\n\r\n" +
                        "- The Kudu extension is not working properly due to invalid App Settings, e.g. invalid WEBSITE_CONTENTAZUREFILECONNECTIONSTRING. In this case, " + 
                        "your app may not be working properly as well. Please fix the problem to enable the check that depends on Kudu.  \r\n\r\n" +
                        "The diagnostic will be incomplete without Kudu access."
                });
            }
        }
    }
}