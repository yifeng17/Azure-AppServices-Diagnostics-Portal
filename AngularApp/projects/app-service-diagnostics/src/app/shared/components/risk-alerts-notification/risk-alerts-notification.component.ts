import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { HealthStatus, TelemetryEventNames, TelemetryService, TelemetrySource } from 'diagnostic-data';
import { MessageBarType, IMessageBarProps, IMessageBarStyles } from 'office-ui-fabric-react';
import { throwError } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { Globals } from '../../../globals';
import { WebSitesService } from '../../../resources/web-sites/services/web-sites.service';
import { NotificationService } from '../../../shared-v2/services/notification.service';
import { ResourceService } from '../../../shared-v2/services/resource.service';
import { RiskAlertService } from '../../../shared-v2/services/risk-alert.service';
import { AuthService } from '../../../startup/services/auth.service';


@Component({
    selector: 'risk-alerts-notification',
    templateUrl: './risk-alerts-notification.component.html',
    styleUrls: ['./risk-alerts-notification.component.scss']
})
export class RiskAlertsNotificationComponent implements OnInit {
    showRiskAlertsNotification: boolean = false;
    type: MessageBarType = MessageBarType.severeWarning;
    riskAlertChecksHealthy: boolean = false;
    reliabilityChecksResults: any = {};
    notificationMessage: string = "We detected missing configurations in your application that will increase risk of a downtime. Please check";
    styles: IMessageBarStyles = {
        root: {
            height: '49px',
            backgroundColor: '#FEF0F1',
            marginBottom: '13px'
        }
    }
    constructor(private _resourceService: ResourceService, private globals: Globals, private _authService: AuthService, public telemetryService: TelemetryService, public _activatedRoute: ActivatedRoute, protected _router: Router, private _riskAlertService: RiskAlertService) { }

    ngOnInit() {

        if (this._resourceService.armResourceConfig) {
            this._riskAlertService.initRiskAlertsForArmResource(this._resourceService.resource.id);
        }

        this._authService.getStartupInfo().subscribe((startupInfo) => {
            // Only show risk alert when:
            // 1. In case submission
            // 2. There is at least one risk check fails
            // 3. No keystone solution is presented

            this._router.events.subscribe(event => {
                if (event instanceof NavigationEnd) {
                    console.log("event");
                    let currentUrlPath = event.url;
                    let isTargetSolutionReady = (currentUrlPath.includes("/analysis/") || currentUrlPath.includes("/detectors/"));

                    this._riskAlertService.riskPanelContentsSub.subscribe((riskAlertContents) => {
                        console.log("get showing notificationId", this._riskAlertService.defaultNotificationId, this._riskAlertService.risksPanelContents);
                        this._riskAlertService.currentRiskPanelContentIdSub.next(this._riskAlertService.defaultNotificationId);
                        console.log("notification: isriskAlertchecksHealthy",  this.riskAlertChecksHealthy, this._riskAlertService.notificationStatus, this._riskAlertService.notificationStatus >= HealthStatus.Info);
                        this.riskAlertChecksHealthy = this._riskAlertService.notificationStatus >= HealthStatus.Info;
                        console.log("notification: isriskAlertchecksHealthy after",  this.riskAlertChecksHealthy);
                        this.notificationMessage = this._riskAlertService.riskAlertNotifications && this._riskAlertService.riskAlertNotifications.hasOwnProperty(this._riskAlertService.defaultNotificationId) ? this._riskAlertService.riskAlertNotifications[this._riskAlertService.defaultNotificationId].text : this.notificationMessage;
                        this.showRiskAlertsNotification = (startupInfo.supportTopicId && startupInfo.supportTopicId != '' && isTargetSolutionReady && !this.riskAlertChecksHealthy);
                        console.log("Show risk alert notification?", this.showRiskAlertsNotification, startupInfo.supportTopicId && startupInfo.supportTopicId != '', isTargetSolutionReady, !this.riskAlertChecksHealthy);

                    });
                }
            });

        }, e => {
            this.globals.reliabilityChecksDetailsBehaviorSubject.error(e);
        });



    }

    openRiskAlertsPanel() {
        this.globals.openRiskAlertsPanel = true;
        this.telemetryService.logEvent(TelemetryEventNames.OpenRiskAlertPanel, {
            'Location': TelemetrySource.CaseSubmissionFlow
        });
    }
}


