import { JsonPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
    @Input() isKeystoneSolutionView: boolean = false;
    showRiskAlertsNotification: boolean = false;
    showNotification: boolean = false;
    type: MessageBarType = MessageBarType.severeWarning;
    riskAlertChecksHealthy: boolean = false;
    reliabilityChecksResults: any = {};
    riskAlertDetectorId: string = "";
    riskAlertMessage: string = "We detected missing configurations in your application that will increase risk of a downtime.";
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
            this._riskAlertService.riskPanelContentsSub.subscribe((riskAlertContents) => {
                // Only show risk alert when:
                // 1. In case submission
                // 2. There is at least one risk check fails
                // 3. No keystone solution is presented

                this.riskAlertChecksHealthy = this._riskAlertService.notificationStatus >= HealthStatus.Info;
                this.riskAlertDetectorId = this._riskAlertService.caseSubmissionRiskNotificationId;
                this.riskAlertMessage = this._riskAlertService.riskAlertNotifications && this._riskAlertService.riskAlertNotifications.hasOwnProperty(this._riskAlertService.caseSubmissionRiskNotificationId) ? this._riskAlertService.riskAlertNotifications[this._riskAlertService.caseSubmissionRiskNotificationId].notificationMessage : this.riskAlertMessage;
                this.showRiskAlertsNotification = (startupInfo.supportTopicId && startupInfo.supportTopicId != '' && !this.riskAlertChecksHealthy && !this.isKeystoneSolutionView);

                // This is to determine whether we want to show emerging issue notification bar.
                this.showNotification = !!this._riskAlertService.notificationMessageBar && !!this._riskAlertService.notificationMessageBar.id && this._riskAlertService.notificationMessageBar.showNotification;
            });
        }, e => {
            this.telemetryService.logEvent("RiskNotificationLoadingFailure", { "error": JSON.stringify(e) });
        });
    }


    ngAfterViewInit() {
        if (this.showRiskAlertsNotification) {
            this.telemetryService.logPageView(TelemetryEventNames.RiskAlertNotificationLoaded,
                {
                    "ShowNotification": this.showNotification.toString(),
                    "NotificationDetectorId": this.showNotification ? this._riskAlertService.notificationMessageBar.id : "",
                    "ShowRiskAlertsNotification": this.showRiskAlertsNotification.toString(),
                    "riskAlertDetectorId": this.riskAlertDetectorId,
                    "RiskAlertMessage": this.riskAlertMessage,
                });
        }
    }

    openRiskAlertsPanel(id: string) {
        this.globals.openRiskAlertsPanel = true;
        this._riskAlertService.currentRiskPanelContentIdSub.next(id);
        this.telemetryService.logEvent(TelemetryEventNames.OpenRiskAlertPanel, {
            'Location': TelemetrySource.CaseSubmissionFlow,
            "notificationDetectorId": id
        });
    }
}


