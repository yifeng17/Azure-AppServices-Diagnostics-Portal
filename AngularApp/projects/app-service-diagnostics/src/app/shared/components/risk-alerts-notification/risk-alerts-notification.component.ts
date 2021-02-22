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
    showEmergingNotification: boolean = false;
    type: MessageBarType = MessageBarType.severeWarning;
    riskAlertChecksHealthy: boolean = false;
    reliabilityChecksResults: any = {};
    notificationId: string = "";
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
            this._riskAlertService.riskPanelContentsSub.subscribe((riskAlertContents) => {
                // Only show risk alert when:
                // 1. In case submission
                // 2. There is at least one risk check fails
                // 3. No keystone solution is presented

                this.riskAlertChecksHealthy = this._riskAlertService.notificationStatus >= HealthStatus.Info;
                this.notificationId = this._riskAlertService.caseSubmissionRiskNotificationId;
                this.notificationMessage = this._riskAlertService.riskAlertNotifications && this._riskAlertService.riskAlertNotifications.hasOwnProperty(this._riskAlertService.caseSubmissionRiskNotificationId) ? this._riskAlertService.riskAlertNotifications[this._riskAlertService.caseSubmissionRiskNotificationId].text : this.notificationMessage;
                this.showRiskAlertsNotification = (startupInfo.supportTopicId && startupInfo.supportTopicId != '' && !this.riskAlertChecksHealthy && !this.isKeystoneSolutionView);

                // This is to determine whether we want to show emerging issue notification bar.
                this.showEmergingNotification = !!this._riskAlertService.emergingNotificationMessageBar && !!this._riskAlertService.emergingNotificationMessageBar.id;
            });
            //  }
            //  });
            //}

        }, e => {
            this.telemetryService.logEvent("RiskNotificationLoadingFailure", { "error": JSON.stringify(e) });
        });
    }


    ngAfterViewInit() {
        if (this.showRiskAlertsNotification) {
            this.telemetryService.logPageView(TelemetryEventNames.RiskAlertNotificationLoaded,
                {
                    "showEmergingNotification": this.showEmergingNotification.toString(),
                    "emergingNotificationId": !!this._riskAlertService.emergingNotificationMessageBar && !!this._riskAlertService.emergingNotificationMessageBar.id ? this._riskAlertService.emergingNotificationMessageBar.id : "",
                    "showRiskAlertsNotification": this.showRiskAlertsNotification.toString(),
                    "RiskNotificationId": this.notificationId,
                    "RiskNotificationMessage": this.notificationMessage,
                });
        }
    }

    openRiskAlertsPanel(id: string) {
        this.globals.openRiskAlertsPanel = true;
        this._riskAlertService.currentRiskPanelContentIdSub.next(id);
        this.telemetryService.logEvent(TelemetryEventNames.OpenRiskAlertPanel, {
            'Location': TelemetrySource.CaseSubmissionFlow,
            "NotificationId": id
        });
    }
}


