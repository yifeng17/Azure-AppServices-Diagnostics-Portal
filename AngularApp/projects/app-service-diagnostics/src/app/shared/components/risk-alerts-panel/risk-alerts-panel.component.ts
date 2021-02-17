import { Component, Input, OnInit } from '@angular/core';
import { DetectorControlService, TelemetryService } from 'diagnostic-data';
import { DetectorResponse } from 'dist/diagnostic-data/public_api';
import { Moment } from 'moment';
import { IPanelProps, IPanelStyles, MessageBarType, PanelType } from 'office-ui-fabric-react';
import { Globals } from '../../../globals';
import { NotificationService } from '../../../shared-v2/services/notification.service';
import { RiskAlertService } from '../../../shared-v2/services/risk-alert.service';
import { AuthService } from '../../../startup/services/auth.service';
import { PortalActionService } from '../../services/portal-action.service';
import { riskAlertDetail } from '../risk-alerts-notification/risk-alerts-notification.component';


@Component({
    selector: 'risk-alerts-panel',
    templateUrl: './risk-alerts-panel.component.html',
    styleUrls: ['./risk-alerts-panel.component.scss']
})
export class RiskAlertsPanelComponent implements OnInit {
    type: PanelType = PanelType.custom;
    width: string = "850px";
    styles: any = {
        root: {
            marginTop: '50px',
        }
    }
     riskPanelContents: any = {};
    @Input() riskAlertId: string = "";
    @Input() riskAlertTitle: string = "";
    error: string="";
    endTime: Moment = this.detectorControlService.endTime;
    startTime: Moment = this.detectorControlService.startTime;
    currentRiskPanelContentId: string;
    viewResponse: DetectorResponse;
    autoHealDetail: riskAlertDetail;
    healthCheckDetail: riskAlertDetail;
    workDistributionDetail: riskAlertDetail;
    appDensityCheckDetail: riskAlertDetail;
    summaryType: MessageBarType = MessageBarType.info;
    isInCaseSubmissionFlow: boolean = false;

    constructor(public globals: Globals, public notificationService: NotificationService, public telemetryService: TelemetryService,private portalActionService:PortalActionService,private authService: AuthService, private _riskAlertService: RiskAlertService,  public detectorControlService: DetectorControlService) {
        if(authService) {
            this.authService.getStartupInfo().subscribe(startupInfo => {
                this.isInCaseSubmissionFlow = startupInfo && startupInfo.source !== undefined && startupInfo.source.toLowerCase() === ("CaseSubmissionV2-NonContext").toLowerCase();

                if(!this.isInCaseSubmissionFlow) {
                    this.styles = {};
                }
            });
        }
    }

    ngOnInit() {
        // console.log("in risk panel, panel content", this.riskPanelContents, this.riskAlertId, this.viewResponse);
        // console.log("riskalertservice", this._riskAlertService);
        // for (const key of Object.keys(this.riskPanelContents))
        // {
        //     if (key === this.riskAlertId)
        //     {
        //         this.viewResponse = this.riskPanelContents[key];
        //         console.log("selected riskId and response", key, this.viewResponse);
        //         break;
        //     }
        // }

        this._riskAlertService.riskPanelContentsSub.subscribe((risksPanelContents)=>
        {
            this.riskPanelContents = risksPanelContents;
            this._riskAlertService.currentRiskPanelContentIdSub.subscribe((currentRiskAlertId) => {
                this.currentRiskPanelContentId = currentRiskAlertId;
                console.log("In panel, current riskId, and res", this.currentRiskPanelContentId, this.riskPanelContents, this.riskPanelContents[this.currentRiskPanelContentId]);
            });
            console.log("getrisks and get riskpanelcontents", this._riskAlertService.risks);
        });


        // this._riskAlertService.riskPanelContentSub.subscribe(res => {
        //     this.viewResponse = res;
        //     console.log("viewResponseRisk", this.viewResponse);

        //     console.log("in risk panel, panel content", this.riskPanelContents, this.riskAlertId, this.viewResponse);
        // });


        this.globals.reliabilityChecksDetailsBehaviorSubject.subscribe((reliabilityChecks) => {
            this.autoHealDetail = reliabilityChecks.autoHeal;
            this.healthCheckDetail = reliabilityChecks.healthCheck;
            this.workDistributionDetail = reliabilityChecks.workerDistribution;
            this.appDensityCheckDetail = reliabilityChecks.appDensity;
        })
    }

    dismissedHandler() {
        this.globals.openRiskAlertsPanel = false;
        this.telemetryService.logEvent("closeRiskAlertsPanel");
    }

    logOpenLinkEvent(linkDescription: string, linkAddress: string) {
        this.telemetryService.logEvent("openRiskAlertLink", {Description: linkDescription, link: linkAddress});
    }

    openRiskAlertDetector(event:Event) {
        event.preventDefault();
        this.telemetryService.logEvent("OpenRiskAlertDetector");
        this.portalActionService.openBladeDiagnoseDetectorId("RiskAssessments","ParentAvailabilityAndPerformance");
    }
}
