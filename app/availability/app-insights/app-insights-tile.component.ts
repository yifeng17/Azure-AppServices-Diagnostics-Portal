import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AppInsightsService, PortalActionService, LoggingService } from '../../shared/services';
import { StartupInfo } from '../../shared/models/portal';

@Component({
    selector: 'app-insights-tile',
    templateUrl: 'app-insights-tile.component.html',
    styleUrls: ['app-insights-tile.component.css']
})
export class AppInsightsTileComponent {

    subscriptionId: string;
    resourceGroup: string;
    siteName: string;
    slotName: string;

    constructor(public appInsightsService: AppInsightsService, public portalActionService: PortalActionService, private logger: LoggingService) {
    }

    OpenAppInsights() {
        this.portalActionService.openAppInsightsBlade();
        this.logger.LogClickEvent('Application Insights Blade', 'Support Home');
    }
}
