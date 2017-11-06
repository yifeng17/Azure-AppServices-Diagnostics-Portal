import { Injectable } from '@angular/core';
import { Http, Headers, Response, Request } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { WindowService, AuthService, SiteService, AppAnalysisService, ArmService } from '../../../shared/services';
import { StartupInfo } from '../../../shared/models/portal';
import { ArmObj } from '../../../shared/models/armObj';

@Injectable()
export class AppInsightsService {

    private appInsightsExtension = "AppInsightsExtension";
    private appInsights_KeyStr: string = "WEBAPP_SUPPORTCNTR_READONLYKEY";
    private appInsightsApiEndpoint: string = "https://api.applicationinsights.io/v1/apps/";

    public appId_AppSettingStr: string = "SUPPORTCNTR_APPINSIGHTS_APPID";
    public appKey_AppSettingStr: string = "SUPPORTCNTR_APPINSIGHTS_APPKEY";
    public resourceUri_AppSettingStr: string = "SUPPORTCNTR_APPINSIGHTS_URI";

    public appInsightsSettings: any = {
        validForStack: undefined,
        enabledForWebApp: undefined,
        connectedWithSupportCenter: undefined,
        resourceUri: undefined,
        name: undefined,
        appId: undefined
    };

    constructor(private http: Http, private authService: AuthService, private armService: ArmService, private windowService: WindowService, private siteService: SiteService, private appAnalysisService: AppAnalysisService) {
    }

    LoadAppInsightsSettings(resourceUri: string, subscription: string, resourceGroup: string, siteName: string, slotName: string = ''): void {

        this.authService.getStartupInfo().subscribe((startupInfo: StartupInfo) => {

            // Check the stack of the web app to determine whether App Insights can be shown as an option
            this.appAnalysisService.getDiagnosticProperties(subscription, resourceGroup, siteName, slotName).subscribe(data => {

                if (data && data.appStack && data.appStack.toLowerCase().indexOf('asp.net') > -1) {
                    this.appInsightsSettings.validForStack = true;
                }
                else {
                    this.appInsightsSettings.validForStack = false;
                }
            });

            // Check if App insights is already enabled for the web app.
            this.GetAIResourceForResource(startupInfo.resourceId).subscribe((aiResource: string) => {
                if (aiResource && aiResource !== '') {
                    this.appInsightsSettings.enabledForWebApp = true;
                    this.appInsightsSettings.resourceUri = aiResource;

                    // Do a get on the resource to fill the app id and name.
                    this.armService.getArmResource(aiResource, '2015-05-01').subscribe((armResponse: ArmObj) => {
                        if (armResponse && armResponse.properties) {
                            if (this.isNotNullOrEmpty(armResponse.properties["AppId"])) {
                                this.appInsightsSettings.appId = armResponse.properties["AppId"];
                            }

                            if (this.isNotNullOrEmpty(armResponse.properties["Name"])) {
                                this.appInsightsSettings.name = armResponse.properties["Name"];
                            }
                        }
                    });
                }
                else {
                    this.appInsightsSettings.enabledForWebApp = false;
                }
            });

            // Check if App Insights is connected to Support Center.
            this.siteService.getSiteAppSettings(subscription, resourceGroup, siteName, slotName)
                .subscribe(data => {
                    if (data && data.properties && this.isNotNullOrEmpty(data.properties[this.appId_AppSettingStr]) && this.isNotNullOrEmpty(data.properties[this.appKey_AppSettingStr]) && this.isNotNullOrEmpty(data.properties[this.resourceUri_AppSettingStr])) {

                        this.appInsightsSettings.connectedWithSupportCenter = true;
                        // TODO : To make the check more robust, we can make a ping call to the resource to identify whether the key is valid or not.
                    }
                    else {
                        this.appInsightsSettings.connectedWithSupportCenter = false;
                    }
                });
        });
    }

    GetAIResourceForResource(resouceUri: string): Observable<string> {
        if (this.windowService.window.MsPortalFx) {
            return Observable.fromPromise(this.windowService.window.MsPortalFx.Services.Rpc.invokeCallback(this.appInsightsExtension, "GetAIResourceForResource", resouceUri));
        }

        //return Observable.from(['']);
        return Observable.from(['/subscriptions/1402be24-4f35-4ab7-a212-2cd496ebdf14/resourceGroups/shgup/providers/microsoft.insights/components/SupportCenteDeflectionMetrics']);
    }

    GetAIResourceByIkey(ikey: string, subscriptionId: string): Observable<string> {
        if (this.windowService.window.MsPortalFx) {
            return Observable.fromPromise(this.windowService.window.MsPortalFx.Services.Rpc.invokeCallback(this.appInsightsExtension, "GetAIResourceByIkey", ikey, subscriptionId));
        }

        return Observable.from(['']);
    }

    GenerateAppInsightsAccessKey(): Observable<any> {

        let url: string = `${this.appInsightsSettings.resourceUri}/ApiKeys`;
        let body: any = {
            name: this.appInsights_KeyStr,
            linkedReadProperties: [`${this.appInsightsSettings.resourceUri}/api`],
            linkedWriteProperties: []
        };

        // TODO: if the key already exists, then delete it first else the call the fail with 400
        return this.armService.postArmResource(url, body, '2015-05-01');
    }

    ExecuteQuery(query: string): Observable<any> {
        if (!this.isNotNullOrEmpty(query)) {
            return Observable.from([]);
        }

        let url: string = `${this.appInsightsApiEndpoint}${this.appInsightsSettings.appId}/query?query=${encodeURIComponent(query)}`;

        return this.http.get(url, {
            headers: this.armService.getHeaders()
        })
            .map((response: Response) => response.json());
    }

    private isNotNullOrEmpty(item: any): boolean {
        return (item && item != '');
    }
}