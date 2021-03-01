import { Injectable } from "@angular/core";
import { DetectorResponse, HealthStatus, LoadingStatus, Rendering, RenderingType, TelemetryService, NotificationUtils } from "diagnostic-data";
import { DiagnosticService, DetectorControlService, TelemetryEventNames, TelemetrySource } from 'diagnostic-data';
import { BehaviorSubject, forkJoin, Observable, observable } from "rxjs";
import { NotificationMessageBar, RiskHelper, RiskInfo, RiskTile } from "../../home/models/risk";
import { ArmResourceConfig, RiskAlertConfig } from "../../shared/models/arm/armResourceConfig";
import { GenericArmConfigService } from "../../shared/services/generic-arm-config.service";
import { FeatureService } from "./feature.service";
import { delay, map } from 'rxjs/operators';
import { Globals } from "../../globals";



@Injectable({
    providedIn: 'root'
})

export class RiskAlertService {
    public riskAlertsSub: BehaviorSubject<RiskAlertConfig[]> = new BehaviorSubject<RiskAlertConfig[]>([]);
    public riskAlertPanelId: BehaviorSubject<String> = new BehaviorSubject<String>("");
    public riskPanelContentsSub: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    risks: {} = {};
    riskAlertNotifications: {} = {};
    risksPanelContents = {};
    currentRiskPanelContentId: string = "";
    currentRiskPanelContentIdSub: BehaviorSubject<string> = new BehaviorSubject<string>("");
    riskAlertConfigs: RiskAlertConfig[];
    riskNotificationConfig: RiskAlertConfig;
    notificationStatus: HealthStatus = HealthStatus.Info;
    caseSubmissionRiskNotificationId: string = "";
    emergingNotificationMessageBar: NotificationMessageBar = null;

    constructor(protected _featureService: FeatureService, protected _diagnosticService: DiagnosticService, protected _detectorControlService: DetectorControlService, protected _telemetryService: TelemetryService, protected globals: Globals, protected _genericArmConfigService?: GenericArmConfigService) { }

    public initRiskAlertsForArmResource(resourceUri: string) {
        if (this._genericArmConfigService) {
            let currConfig: ArmResourceConfig = this._genericArmConfigService.getArmResourceConfig(resourceUri);
            this._addRiskAlertDetectorIds(currConfig.riskAlertConfigs, currConfig.notificationConfig);
        }
    }

    public _addRiskAlertDetectorIds(riskAlertConfigs: RiskAlertConfig[], notificationConfig?: RiskAlertConfig) {

        if (riskAlertConfigs != null && riskAlertConfigs.length > 0) {
            //Filter out duplicate links
            const riskConfigSet = new Set<RiskAlertConfig>(this.riskAlertConfigs);
            for (let config of riskAlertConfigs) {
                riskConfigSet.add(config);
            }
            const riskAlertsArray = Array.from(riskConfigSet);
            this.riskAlertConfigs = riskAlertsArray;
            this.riskNotificationConfig = notificationConfig;

            this.riskAlertConfigs.forEach(riskAlertConfig => {
                let newRiskTile: RiskTile
                    =
                {
                    id: riskAlertConfig.riskAlertDetectorId,
                    title: riskAlertConfig.title,
                    linkText: "Click here to view more details",
                    riskInfo: null,
                    loadingStatus: LoadingStatus.Loading,
                    showTile: this._isRiskAlertEnabled()
                };

                if (!this.risks.hasOwnProperty(riskAlertConfig.riskAlertDetectorId)) {
                    this.risks[riskAlertConfig.riskAlertDetectorId] = newRiskTile;
                }
            });

            this.riskAlertConfigs.forEach(RiskAlertConfig => {
                if (RiskAlertConfig.enableForCaseSubmissionFlow != null && RiskAlertConfig.enableForCaseSubmissionFlow === true) {
                    // RiskAlertNotification
                    let notificationMessageDetail: any = {
                        id: RiskAlertConfig.riskAlertDetectorId,
                        riskInfo: null,
                        loadingStatus: LoadingStatus.Loading
                    };

                    if (!this.riskAlertNotifications.hasOwnProperty(RiskAlertConfig.riskAlertDetectorId)) {
                        this.riskAlertNotifications[RiskAlertConfig.riskAlertDetectorId] = notificationMessageDetail;
                    }
                }
            });
        }

        if (notificationConfig != null && !!notificationConfig.riskAlertDetectorId && !!notificationConfig.title) {
            this.emergingNotificationMessageBar
                =
                {
                    showEmergingIssue: false,
                    id: notificationConfig.riskAlertDetectorId,
                    title: notificationConfig.title,
                    status: notificationConfig.overrideStatus ? notificationConfig.overrideStatus : HealthStatus.Info,
                    linkText: "Click here to view more details",
                } as NotificationMessageBar;
        }
    }

    public getRiskAlertNotificationResponse(): Observable<any[]> {
        try {
            if (this.riskAlertConfigs == null || this.emergingNotificationMessageBar == null)
                return;

            let tasks = this.riskAlertConfigs.filter(config => config.enableForCaseSubmissionFlow != null && config.enableForCaseSubmissionFlow === true).map(riskAlertConfig => {
                let riskAlertObservable = this._diagnosticService.getDetector(riskAlertConfig.riskAlertDetectorId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(
                    res => {
                        const notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === RenderingType.Notification);
                        const statusColumnIndex = 0;
                        notificationList.sort((s1, s2) => HealthStatus[<string>s1.table.rows[0][statusColumnIndex]] - HealthStatus[<string>s2.table.rows[0][statusColumnIndex]]);

                        res.dataset = notificationList;
                        let currentStatus = HealthStatus.Info;
                        if (this.riskAlertNotifications.hasOwnProperty(riskAlertConfig.riskAlertDetectorId)) {
                            if (res.dataset && res.dataset.length > 0 && res.dataset[0].table != null && res.dataset[0].table.rows.length > 0) {
                                currentStatus = HealthStatus[<string>res.dataset[0].table.rows[0][0]];
                                if (currentStatus < this.notificationStatus) {
                                    this.notificationStatus = currentStatus;
                                    this.caseSubmissionRiskNotificationId = riskAlertConfig.riskAlertDetectorId;
                                }
                            }

                            this.riskAlertNotifications[riskAlertConfig.riskAlertDetectorId].notificationMessage = !!res && !!res.metadata && !!res.metadata.description ? res.metadata.description : "";
                            this.riskAlertNotifications[riskAlertConfig.riskAlertDetectorId].status = currentStatus;
                            this.riskAlertNotifications[riskAlertConfig.riskAlertDetectorId].riskInfo = RiskHelper.convertResponseToRiskInfo(res);
                            this.riskAlertNotifications[riskAlertConfig.riskAlertDetectorId].loadingStatus = LoadingStatus.Success;
                        }

                        this.risksPanelContents[riskAlertConfig.riskAlertDetectorId] = res;
                    }));

                return riskAlertObservable;
            });

            if (!!this.emergingNotificationMessageBar && !!this.emergingNotificationMessageBar.id) {

                let notificationObservable = this._diagnosticService.getDetector(this.emergingNotificationMessageBar.id, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(
                    res => {
                        if (res != null && res.metadata != null && res.dataset != null)
                        {
                            this.emergingNotificationMessageBar.title = res.metadata.description ? res.metadata.description : this.emergingNotificationMessageBar.title;
                            const notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === RenderingType.Notification);
                            notificationList.filter((notification) => NotificationUtils.isTimeRangeValidated(notification));
                            this.emergingNotificationMessageBar.showEmergingIssue = !(notificationList == null || notificationList.length === 0) ? true : false;
                            const statusColumnIndex = 0;
                            notificationList.sort((s1, s2) => HealthStatus[<string>s1.table.rows[0][statusColumnIndex]] - HealthStatus[<string>s2.table.rows[0][statusColumnIndex]]);
                            res.dataset = notificationList;
                            this.risksPanelContents[this.emergingNotificationMessageBar.id] = res;
                        }
                    }));

                tasks.push(notificationObservable);
            }

            return forkJoin(tasks);

        }
        catch (err) {
            this._telemetryService.logEvent("RiskAlertResponseFailed", { "error": JSON.stringify(err) });
        }
    }

    public getRiskAlertResponse(): Observable<any[]> {
        try {
            let tasks = this.riskAlertConfigs.map(riskAlertConfig => {
                let riskAlertObservable = this._diagnosticService.getDetector(riskAlertConfig.riskAlertDetectorId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(
                    res => {
                        const notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === RenderingType.Notification);

                        const statusColumnIndex = 0;
                        notificationList.sort((s1, s2) => HealthStatus[<string>s1.table.rows[0][statusColumnIndex]] - HealthStatus[<string>s2.table.rows[0][statusColumnIndex]]);

                        res.dataset = notificationList;
                        if (this.risks.hasOwnProperty(riskAlertConfig.riskAlertDetectorId)) {
                            this.risks[riskAlertConfig.riskAlertDetectorId].riskInfo = RiskHelper.convertResponseToRiskInfo(res);
                            this.risks[riskAlertConfig.riskAlertDetectorId].loadingStatus = LoadingStatus.Success;
                        }

                        this.risksPanelContents[riskAlertConfig.riskAlertDetectorId] = res;
                    }));

                return riskAlertObservable;

            });

            if (!!this.emergingNotificationMessageBar && !!this.emergingNotificationMessageBar.id) {

                let notificationObservable = this._diagnosticService.getDetector(this.emergingNotificationMessageBar.id, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(
                    res => {
                        const notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === RenderingType.Notification);
                        notificationList.filter((notification) => NotificationUtils.isTimeRangeValidated(notification));
                        const statusColumnIndex = 0;
                        notificationList.sort((s1, s2) => HealthStatus[<string>s1.table.rows[0][statusColumnIndex]] - HealthStatus[<string>s2.table.rows[0][statusColumnIndex]]);

                        res.dataset = notificationList;
                        this.risksPanelContents[this.emergingNotificationMessageBar.id] = res;
                    }));

                tasks.push(notificationObservable);
            }

            return forkJoin(tasks);
        }
        catch (err) {
            this._telemetryService.logEvent("RiskAlertResponseFailed", { "error": JSON.stringify(err) });
        }
    }

    protected _isRiskAlertEnabled(): boolean {
        return this.riskAlertConfigs != null && this.riskAlertConfigs.length > 0;
    }
}
