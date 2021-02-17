import { Injectable } from "@angular/core";
import { DetectorResponse, HealthStatus, LoadingStatus, Rendering, TelemetryService } from "diagnostic-data";
import { DiagnosticService, DetectorControlService, TelemetryEventNames, TelemetrySource } from 'diagnostic-data';
//import { TelemetryEventNames, TelemetrySource } from "dist/diagnostic-data/diagnostic-data";
import { BehaviorSubject, forkJoin, Observable, observable } from "rxjs";
import { RiskHelper, RiskInfo, RiskTile } from "../../home/models/risk";
import { ArmResourceConfig, RiskAlertConfig } from "../../shared/models/arm/armResourceConfig";
import { GenericArmConfigService } from "../../shared/services/generic-arm-config.service";
import { FeatureService } from "./feature.service";
import { delay, map } from 'rxjs/operators';
import { mergeMap } from "rxjs-compat/operator/mergeMap";
import { Globals } from "../../globals";


@Injectable({
    providedIn: 'root'
})

export class RiskAlertService {
    public riskAlertsSub: BehaviorSubject<RiskAlertConfig[]> = new BehaviorSubject<RiskAlertConfig[]>([]);
    public riskAlertPanelId: BehaviorSubject<String> = new BehaviorSubject<String>("");
    public riskPanelContentsSub: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    risks: {} = {}; //RiskTile[] = []
    riskAlertNotifications: {} = {};
    riskResponses: DetectorResponse[] = [];
    risksDictionary = {};
    risksPanelContents = {};
    currentRiskPanelContentId: string = "";
    currentRiskPanelContentIdSub: BehaviorSubject<string> = new BehaviorSubject<string>("");
    riskPanelContent: DetectorResponse = null;
    riskAlertConfigs: RiskAlertConfig[];
    notificationStatus: HealthStatus = HealthStatus.Info;
    defaultNotificationId: string = "";


    public set _riskAlertConfigs(riskAlertConfigs: RiskAlertConfig[]) {
        this.riskAlertsSub.next(riskAlertConfigs);
    }

    public setRiskAlertPanelId(riskAlertId: string) {
        this.riskAlertPanelId.next(riskAlertId);
        const curRes = this.risksPanelContents[riskAlertId];
   //     this.riskPanelContentSub.next(this.risksPanelContents[riskAlertId]);

        console.log("release new id and res", riskAlertId, curRes);
    }


    constructor(protected _featureService: FeatureService, protected _diagnosticService: DiagnosticService, protected _detectorControlService: DetectorControlService, protected _telemetryService: TelemetryService, protected globals: Globals, protected _genericArmConfigService?: GenericArmConfigService) { }

    public initRiskAlertsForArmResource(resourceUri: string) {
        console.log("init risk alert from generic arm");
        if (this._genericArmConfigService) {
            let currConfig: ArmResourceConfig = this._genericArmConfigService.getArmResourceConfig(resourceUri);
            if (currConfig.riskAlertConfigs && currConfig.riskAlertConfigs.length > 0) {
                this._addRiskAlertIds(currConfig.riskAlertConfigs);
            }
        }
    }

    public _addRiskAlertIds(riskAlertConfigs: RiskAlertConfig[]) {
        //Filter out duplicate links
        const riskConfigSet = new Set<RiskAlertConfig>(this._riskAlertConfigs);
        for (let config of riskAlertConfigs) {
            riskConfigSet.add(config);
        }
        const riskAlertsArray = Array.from(riskConfigSet);
        this._riskAlertConfigs = riskAlertsArray;
        this.riskAlertConfigs = riskAlertsArray;

        this.riskAlertConfigs.forEach(riskAlertConfig => {
            let newRiskTile: RiskTile
                =
            {
                id: riskAlertConfig.riskAlertId,
                title: riskAlertConfig.title,
                action: () => () => {
                    console.log("genie openRiskPanel");
                    // this.globals.openRiskAlertsPanel = true;
                    // this._telemetryService.logEvent(TelemetryEventNames.OpenRiskAlertPanel, {
                    //     "Location": TelemetrySource.LandingPage
                    // });
                },
                linkText: "Click here to view more details",
                riskInfo: null,
                loadingStatus: LoadingStatus.Loading,
                infoObserverable: null,
                //this.globals.reliabilityChecksDetailsBehaviorSubject.pipe(map(info => RiskHelper.convertToRiskInfo(info))),
                showTile: this._isRiskAlertEnabled(),
                riskAlertResponse: null
            };

            if (!this.risks.hasOwnProperty(riskAlertConfig.riskAlertId)) {
                this.risks[riskAlertConfig.riskAlertId] = newRiskTile;
            }

            console.log("iamsolostbefore", riskAlertsArray, this._riskAlertConfigs, this.riskAlertConfigs);
        });

        this.riskAlertConfigs.forEach(RiskAlertConfig => {
            if (RiskAlertConfig.enableForCaseSubmissionFlow != null  && RiskAlertConfig.enableForCaseSubmissionFlow === true)
            {
                // RiskAlertNotification
                let notificationMessage: any = {
                    id: RiskAlertConfig.riskAlertId,
                    text: RiskAlertConfig.notificationMessage,
                    riskInfo: null,
                    loadingStatus: LoadingStatus.Loading
                };

                if (!this.riskAlertNotifications.hasOwnProperty(RiskAlertConfig.riskAlertId))
                {
                    this.riskAlertNotifications[RiskAlertConfig.riskAlertId] = notificationMessage;
                }
            }
        });
    }

    public getRiskAlertNotificationResponse() : Observable<any[]> {
        if (this.riskAlertConfigs == null)
            return;

        const tasks = this.riskAlertConfigs.filter(config => config.enableForCaseSubmissionFlow != null && config.enableForCaseSubmissionFlow === true).map(riskAlertConfig => {
            let riskAlertObservable = this._diagnosticService.getDetector(riskAlertConfig.riskAlertId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(
                res => {

                    console.log("Risk notification componnent", riskAlertConfig.riskAlertId, this.risks[riskAlertConfig.riskAlertId]);

                    const notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === 7);

                    const statusColumnIndex = 0;
                    notificationList.sort((s1, s2) => HealthStatus[<string>s1.table.rows[0][statusColumnIndex]] - HealthStatus[<string>s2.table.rows[0][statusColumnIndex]]);
              //      console.log("NotificationList after sorted", notificationList1);

                    res.dataset = notificationList;
                    if (this.riskAlertNotifications.hasOwnProperty(riskAlertConfig.riskAlertId))
                    {
                        this.riskAlertNotifications[riskAlertConfig.riskAlertId].riskAlertResponse = res;
                        if (res.dataset && res.dataset.length > 0 && res.dataset[0].table != null && res.dataset[0].table.rows.length > 0)
                        {
                            let currentStatus = HealthStatus[<string>res.dataset[0].table.rows[0][0]];
                            if (currentStatus < this.notificationStatus)
                            {
                                this.notificationStatus = currentStatus;
                                this.defaultNotificationId = riskAlertConfig.riskAlertId;
                            }
                        }
                        this.riskAlertNotifications[riskAlertConfig.riskAlertId].status = status;
                        this.riskAlertNotifications[riskAlertConfig.riskAlertId].riskInfo = RiskHelper.convertResponseToRiskInfo(res);
                        this.riskAlertNotifications[riskAlertConfig.riskAlertId].loadingStatus = LoadingStatus.Success;
                        console.log("Risk componnent after", riskAlertConfig.riskAlertId, this.riskAlertNotifications[riskAlertConfig.riskAlertId]);
                    }

                    this.risksPanelContents[riskAlertConfig.riskAlertId] = res;
                }));

            return riskAlertObservable;
        }
        );
        return forkJoin(tasks);
    }

    public getRiskAlertResponse(): Observable<any[]> {
        const tasks = this.riskAlertConfigs.map(riskAlertConfig => {
            let riskAlertObservable = this._diagnosticService.getDetector(riskAlertConfig.riskAlertId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(
                res => {

                    console.log("Risk alert componnent", riskAlertConfig.riskAlertId, this.risks[riskAlertConfig.riskAlertId]);

                    const notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === 7);

                    const statusColumnIndex = 0;
                    notificationList.sort((s1, s2) => HealthStatus[<string>s1.table.rows[0][statusColumnIndex]] - HealthStatus[<string>s2.table.rows[0][statusColumnIndex]]);
              //      console.log("NotificationList after sorted", notificationList1);

                    res.dataset = notificationList;
                    if (this.risks.hasOwnProperty(riskAlertConfig.riskAlertId))
                    {
                        this.risks[riskAlertConfig.riskAlertId].riskAlertResponse = res;
                        this.risks[riskAlertConfig.riskAlertId].riskInfo = RiskHelper.convertResponseToRiskInfo(res);
                        this.risks[riskAlertConfig.riskAlertId].loadingStatus = LoadingStatus.Success;
                        console.log("Risk componnent after", riskAlertConfig.riskAlertId, this.risks[riskAlertConfig.riskAlertId]);
                    }

                    this.risksPanelContents[riskAlertConfig.riskAlertId] = res;
                }));

            return riskAlertObservable;

        }
        );
        return forkJoin(tasks);
    }

    protected _isRiskAlertEnabled(): boolean {
        return this.riskAlertConfigs != null && this.riskAlertConfigs.length > 0;
    }
}
