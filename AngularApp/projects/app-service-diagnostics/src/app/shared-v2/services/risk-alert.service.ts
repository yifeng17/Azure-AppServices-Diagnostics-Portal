import { Injectable } from "@angular/core";
import { DetectorResponse, HealthStatus, LoadingStatus, Rendering, TelemetryService } from "diagnostic-data";
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
            this._addRiskAlertIds(currConfig.riskAlertConfigs, currConfig.notificationConfig);
        }
    }

    public _addRiskAlertIds(riskAlertConfigs: RiskAlertConfig[], notificationConfig?: RiskAlertConfig) {

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
                    id: riskAlertConfig.riskAlertId,
                    title: riskAlertConfig.title,
                    linkText: "Click here to view more details",
                    riskInfo: null,
                    loadingStatus: LoadingStatus.Loading,
                    showTile: this._isRiskAlertEnabled()
                };

                if (!this.risks.hasOwnProperty(riskAlertConfig.riskAlertId)) {
                    this.risks[riskAlertConfig.riskAlertId] = newRiskTile;
                }
            });

            this.riskAlertConfigs.forEach(RiskAlertConfig => {
                if (RiskAlertConfig.enableForCaseSubmissionFlow != null && RiskAlertConfig.enableForCaseSubmissionFlow === true) {
                    // RiskAlertNotification
                    let notificationMessage: any = {
                        id: RiskAlertConfig.riskAlertId,
                        text: RiskAlertConfig.notificationMessage,
                        riskInfo: null,
                        loadingStatus: LoadingStatus.Loading
                    };

                    if (!this.riskAlertNotifications.hasOwnProperty(RiskAlertConfig.riskAlertId)) {
                        this.riskAlertNotifications[RiskAlertConfig.riskAlertId] = notificationMessage;
                    }
                }
            });
        }

        if (notificationConfig != null && !!notificationConfig.riskAlertId && !!notificationConfig.title) {
            this.emergingNotificationMessageBar
                =
                {
                    id: notificationConfig.riskAlertId,
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
                let riskAlertObservable = this._diagnosticService.getDetector(riskAlertConfig.riskAlertId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(
                    res => {
                        const notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === 7);
                        const statusColumnIndex = 0;
                        notificationList.sort((s1, s2) => HealthStatus[<string>s1.table.rows[0][statusColumnIndex]] - HealthStatus[<string>s2.table.rows[0][statusColumnIndex]]);

                        res.dataset = notificationList;
                        if (this.riskAlertNotifications.hasOwnProperty(riskAlertConfig.riskAlertId)) {
                            if (res.dataset && res.dataset.length > 0 && res.dataset[0].table != null && res.dataset[0].table.rows.length > 0) {
                                let currentStatus = HealthStatus[<string>res.dataset[0].table.rows[0][0]];
                                if (currentStatus < this.notificationStatus) {
                                    this.notificationStatus = currentStatus;
                                    this.caseSubmissionRiskNotificationId = riskAlertConfig.riskAlertId;
                                }
                            }
                            this.riskAlertNotifications[riskAlertConfig.riskAlertId].status = status;
                            this.riskAlertNotifications[riskAlertConfig.riskAlertId].riskInfo = RiskHelper.convertResponseToRiskInfo(res);
                            this.riskAlertNotifications[riskAlertConfig.riskAlertId].loadingStatus = LoadingStatus.Success;
                        }

                        this.risksPanelContents[riskAlertConfig.riskAlertId] = res;
                    }));

                return riskAlertObservable;
            });

            if (!!this.emergingNotificationMessageBar && !!this.emergingNotificationMessageBar.id) {

                let notificationObservable = this._diagnosticService.getDetector(this.emergingNotificationMessageBar.id, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(
                    res => {
                        const notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === 7);
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

    public getRiskAlertResponse(): Observable<any[]> {
        try {
            let tasks = this.riskAlertConfigs.map(riskAlertConfig => {
                let riskAlertObservable = this._diagnosticService.getDetector(riskAlertConfig.riskAlertId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(
                    res => {
                        const notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === 7);

                        const statusColumnIndex = 0;
                        notificationList.sort((s1, s2) => HealthStatus[<string>s1.table.rows[0][statusColumnIndex]] - HealthStatus[<string>s2.table.rows[0][statusColumnIndex]]);

                        res.dataset = notificationList;
                        if (this.risks.hasOwnProperty(riskAlertConfig.riskAlertId)) {
                            this.risks[riskAlertConfig.riskAlertId].riskInfo = RiskHelper.convertResponseToRiskInfo(res);
                            this.risks[riskAlertConfig.riskAlertId].loadingStatus = LoadingStatus.Success;
                        }

                        this.risksPanelContents[riskAlertConfig.riskAlertId] = res;
                    }));

                return riskAlertObservable;

            });

            if (!!this.emergingNotificationMessageBar && !!this.emergingNotificationMessageBar.id) {

                let notificationObservable = this._diagnosticService.getDetector(this.emergingNotificationMessageBar.id, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(
                    res => {
                        const notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === 7);
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
