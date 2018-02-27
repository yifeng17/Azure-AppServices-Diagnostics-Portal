import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppAnalysisService } from '../../services/appanalysis.service';
import { SiteService } from '../../services/site.service';


@Component({
    selector: 'incident-notification',
    templateUrl: 'incident-notification.component.html',
    styleUrls: ['incident-notification.component.css']
})
export class IncidentNotificationComponent {

    lsiIncidents: IncidentNotification[];

    constructor(private _appAnalysisService: AppAnalysisService, private _siteService: SiteService) {
        this._siteService.currentSiteMetaData.subscribe(site => {
            if (site) {
                 this._appAnalysisService.getDetectorResource(site.subscriptionId, site.resourceGroupName, site.siteName, site.slot, 'availability', 'servicehealth').subscribe(response => {
                    this.lsiIncidents = response.abnormalTimePeriods.map(period => {
                        return <IncidentNotification>{ message: period.message };
                    });
                });
            }
        })
    }

}

class IncidentNotification {
    message: string;
}