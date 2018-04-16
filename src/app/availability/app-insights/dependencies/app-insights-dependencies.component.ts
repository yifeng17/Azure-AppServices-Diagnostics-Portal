import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../../shared/services/auth.service';
import { AppInsightsService } from '../../../shared/services/appinsights/appinsights.service';
import { AppInsightsQueryService } from '../../../shared/services/appinsights/appinsights-query.service';
import { PortalActionService } from '../../../shared/services/portal-action.service';
import { AvailabilityLoggingService } from '../../../shared/services/logging/availability.logging.service';

@Component({
    selector: 'app-insights-dependencies',
    templateUrl: 'app-insights-dependencies.component.html'
})
export class AppInsightsDependenciesComponent implements OnInit, OnChanges {

    subscriptionId: string;
    resourceGroup: string;
    siteName: string;
    slotName: string;

    @Input() startTime: string;
    @Input() endTime: string;

    loading: boolean;
    dependencies: any = [];

    constructor(private _route: ActivatedRoute, private authService: AuthService, public appInsightsService: AppInsightsService, private appInsightsQueryService: AppInsightsQueryService, private portalActionService: PortalActionService, private logger: AvailabilityLoggingService) {
        this.dependencies = [];
    }

    ngOnInit(): void {

        this.subscriptionId = this._route.snapshot.params['subscriptionid'];
        this.resourceGroup = this._route.snapshot.params['resourcegroup'];
        this.siteName = this._route.snapshot.params['sitename'];
        this.slotName = this._route.snapshot.params['slot'] ? this._route.snapshot.params['slot'] : '';
    }

    ngOnChanges(changes: SimpleChanges): void {

        this.appInsightsService.loadAppDiagnosticPropertiesObservable.subscribe(propertiesLoadStatus => {

            if (changes['startTime'] && this.appInsightsService.appInsightsSettings.validForStack) {
                this.dependencies = [];
                this.loading = true;
                this.appInsightsService.loadAppInsightsResourceObservable.subscribe(loadStatus => {
                    this.appInsightsQueryService.GetTopSlowestDependencies(this.startTime, this.endTime).subscribe((data: any) => {
                        let rows = data["Tables"][0]["Rows"];
                        this.parseRowsIntoDependencies(rows);
                        this.loading = false;
                    });
                });
            }
        });
    }

    parseRowsIntoDependencies(rows: any) {
        if (!rows || rows.length === 0) {
            return;
        }

        rows.forEach(element => {
            this.dependencies.push({
                endpoint: element[0],
                type: element[1],
                duration_50: element[2],
                requests: element[3]
            });
        });
    }

    OpenAppInsights() {
        this.portalActionService.openAppInsightsBlade();
        this.logger.LogClickEvent('Application Insights Blade', 'App Performance Analysis');
    }
}
