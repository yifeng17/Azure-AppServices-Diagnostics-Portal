import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService, AppInsightsService, AppAnalysisService, SiteService } from '../../services';
import { StartupInfo } from '../../models/portal';
import { ArmObj } from '../../models/armObj';

@Component({
    selector: 'app-insights-settings',
    templateUrl: 'app-insights-settings.component.html',
    styleUrls: ['app-insights-tile.component.css']
})
export class AppInsightsSettingsComponent implements OnInit {

    subscriptionId: string;
    resourceGroup: string;
    siteName: string;
    slotName: string;

    loadingAppInsights: boolean;
    loadingAppInsightsConnectionWithSupportCenter: boolean;

    appInsightsPresent: boolean;
    appInsightsPresentText: string;

    appInsightsConnected: boolean;
    appInsightsConnectedText: string;

    constructor(private _route: ActivatedRoute, private siteService: SiteService, private authService: AuthService, private appInsightsService: AppInsightsService) {
    }

    ngOnInit(): void {

        this.subscriptionId = this._route.snapshot.params['subscriptionid'];
        this.resourceGroup = this._route.snapshot.params['resourcegroup'];
        this.siteName = this._route.snapshot.params['sitename'];
        this.slotName = this._route.snapshot.params['slot'] ? this._route.snapshot.params['slot'] : '';

        this.checkForAppInsightsResource();

        this.siteService.getSiteAppSettings(this.subscriptionId, this.resourceGroup, this.siteName, this.slotName)
            .subscribe(data => {
                let armResponse: ArmObj = data;
                console.log(armResponse);

                armResponse.properties['SUPPORTCNTR_APPINSIGHTS_APPID'] = '1234567890';
                this.siteService.updateSiteAppSettings(this.subscriptionId, this.resourceGroup, this.siteName, this.slotName, armResponse)
                .subscribe(data =>{});
            });
    }

    checkForAppInsightsResource(): void {

        this.loadingAppInsights = true;
        this.appInsightsPresentText = "checking for resource";
        this.authService.getStartupInfo().subscribe((startupInfo: StartupInfo) => {

            this.appInsightsService.GetAIResourceForResource(startupInfo.resourceId).subscribe((aiResource: string) => {

                this.loadingAppInsights = false;

                if (aiResource && aiResource !== '') {
                    this.appInsightsPresent = true;
                    this.appInsightsPresentText = "Application Insights Enabled";
                }
                else {
                    this.appInsightsPresent = false;
                    this.appInsightsPresentText = "No Application Insights Resource Found";
                }
            });
        });
    }
}
