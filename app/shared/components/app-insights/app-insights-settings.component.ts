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

    constructor(private _route: ActivatedRoute, private siteService: SiteService, private authService: AuthService, public appInsightsService: AppInsightsService) {
    }

    ngOnInit(): void {

        this.subscriptionId = this._route.snapshot.params['subscriptionid'];
        this.resourceGroup = this._route.snapshot.params['resourcegroup'];
        this.siteName = this._route.snapshot.params['sitename'];
        this.slotName = this._route.snapshot.params['slot'] ? this._route.snapshot.params['slot'] : '';
    }

    connectAppInsightsWithSupportCenter(): void {

        this.appInsightsService.GenerateAppInsightsAccessKey().subscribe(data => {
            if (data && data.apiKey && data.apiKey !== '') {

                this.siteService.getSiteAppSettings(this.subscriptionId, this.resourceGroup, this.siteName, this.slotName).subscribe(settingsResponse => {

                    if (settingsResponse && settingsResponse.properties) {
                        settingsResponse.properties[this.appInsightsService.appId_AppSettingStr] = this.appInsightsService.appInsightsSettings.appId;
                        settingsResponse.properties[this.appInsightsService.appKey_AppSettingStr] = data.apiKey;
                        settingsResponse.properties[this.appInsightsService.resourceUri_AppSettingStr] = this.appInsightsService.appInsightsSettings.resourceUri;

                        this.siteService.updateSiteAppSettings(this.subscriptionId, this.resourceGroup, this.siteName, this.slotName, settingsResponse).subscribe(updateResponse=>{
                            console.log(updateResponse);
                            this.appInsightsService.appInsightsSettings.connectedWithSupportCenter = true;
                        });

                    }
                });

            }
        })
    }
}
