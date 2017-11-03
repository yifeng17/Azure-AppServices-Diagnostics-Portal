import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService, AppInsightsService, AppAnalysisService } from '../../services';
import { StartupInfo } from '../../models/portal';

@Component({
    selector: 'app-insights-tile',
    templateUrl: 'app-insights-tile.component.html',
    styleUrls: ['app-insights-tile.component.css']
})
export class AppInsightsTileComponent implements OnInit {

    subscriptionId: string;
    resourceGroup: string;
    siteName: string;
    slotName: string;

    showTile: boolean;

    loadingAppInsights: boolean;
    loadingAppInsightsConnectionWithSupportCenter: boolean;

    appInsightsPresent: boolean;
    appInsightsPresentText: string;
    appInsightsPresentLink: string;

    appInsightsConnected: boolean;
    appInsightsConnectedText: string;

    constructor(private _route: ActivatedRoute, private authService: AuthService, public appInsightsService: AppInsightsService, private _appAnalysisService: AppAnalysisService) {

        // TODO: This needs to be set as False.
        this.showTile = true;
    }

    ngOnInit(): void {

        this.subscriptionId = this._route.snapshot.params['subscriptionid'];
        this.resourceGroup = this._route.snapshot.params['resourcegroup'];
        this.siteName = this._route.snapshot.params['sitename'];
        this.slotName = this._route.snapshot.params['slot'] ? this._route.snapshot.params['slot'] : '';

        //this.checkForAppStack();
        //this.checkForAppInsightsResource();
        this.authService.getStartupInfo().subscribe((startupInfo: StartupInfo) => {
            this.appInsightsService.LoadAppInsightsSettings(startupInfo.resourceId, this.subscriptionId, this.resourceGroup, this.siteName, this.slotName);
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
                    this.appInsightsPresentText = "Enabled";
                    this.appInsightsPresentLink = "open";
                }
                else {
                    this.appInsightsPresent = false;
                    this.appInsightsPresentText = "Not Enabled";
                    this.appInsightsPresentLink = "create";
                }
            });
        });
    }

    checkForAppStack(): void {

        this._appAnalysisService.getDiagnosticProperties(this.subscriptionId, this.resourceGroup, this.siteName, this.slotName).subscribe(data => {

            if (data && data.appStack && data.appStack.toLowerCase().indexOf('asp.net') > -1) {
                this.showTile = true;
            }
        });
    }

    checkForAppInsightsConnectionWithSupportCenter(): void {
    }
}
