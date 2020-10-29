import { Component, OnInit } from '@angular/core';
import { IPanelProps, IPanelStyles, MessageBarType, PanelType } from 'office-ui-fabric-react';
import { Globals } from '../../../globals';
import { NotificationService } from '../../../shared-v2/services/notification.service';
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

    autoHealDetail: riskAlertDetail;
    healthCheckDetail: riskAlertDetail;
    workDistributionDetail: riskAlertDetail;
    appDensityCheckDetail: riskAlertDetail;

    constructor(public globals: Globals, public notificationService: NotificationService) { }

    ngOnInit() {
        this.globals.reliabilityChecksDetailsBehaviorSubject.subscribe((reliabilityChecks) => {
            this.autoHealDetail = reliabilityChecks.autoHeal;
            this.healthCheckDetail = reliabilityChecks.healthCheck;
            this.workDistributionDetail = reliabilityChecks.workerDistribution;
            this.appDensityCheckDetail = reliabilityChecks.appDensity;
        })
    }

    dismissedHandler() {
        this.globals.openRiskAlertsPanel = false;
    }
}
