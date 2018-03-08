import { Injectable } from '@angular/core';
import { AppAnalysisService } from './appanalysis.service';
import { SiteService } from './site.service';
import { IncidentNotification, IncidentStatus } from '../models/icm-incident';
import { Observable } from 'rxjs';

@Injectable()
export class ServiceIncidentService {

  public incidents: IncidentNotification[] = [];
  public hasActiveIncidents: boolean = false;
  public notificationMessage: string;

  constructor(private _appAnalysisService: AppAnalysisService, private _siteService: SiteService) {
    console.log("service incident service");
    this._siteService.currentSiteMetaData.subscribe(site => {
      if (site) {
        let serviceHealth = this._appAnalysisService.getDetectorResource(site.subscriptionId, site.resourceGroupName, site.siteName, site.slot, 'availability', 'servicehealth');
        let customerIncident = this._appAnalysisService.getDetectorResource(site.subscriptionId, site.resourceGroupName, site.siteName, site.slot, 'availability', 'customerincident');

        Observable.forkJoin(serviceHealth, customerIncident).subscribe(responses => {
          responses.forEach(response => {
            response.abnormalTimePeriods.forEach(period => {
              this.incidents.push(IncidentNotification.fromAbnormalTimePeriod(period));
            });
          });

          this.hasActiveIncidents = this.incidents.filter(i => i.status === IncidentStatus.Active).length > 0;

          this.notificationMessage = this.hasActiveIncidents ? 
            'There is an active service incident that may be affecting your app. Click here to learn more' :
            'There is a service incident that may have affected your app. Click here to learn more';
        });
      }
    });
  }
}