import { Injectable } from "@angular/core";
import { DetectorResponse, LoadingStatus, Rendering, TelemetryService } from "diagnostic-data";
import { DiagnosticService, DetectorControlService, TelemetryEventNames, TelemetrySource } from 'diagnostic-data';
//import { TelemetryEventNames, TelemetrySource } from "dist/diagnostic-data/diagnostic-data";
import { BehaviorSubject, forkJoin, Observable, observable } from "rxjs";
import { RiskHelper, RiskInfo, RiskTile } from "../../../home/models/risk";
import { ArmResourceConfig, RiskAlertConfig } from "../../../shared/models/arm/armResourceConfig";
import { GenericArmConfigService } from "../../../shared/services/generic-arm-config.service";
import { FeatureService } from "../../../shared-v2/services/feature.service";
import { delay, map } from 'rxjs/operators';
import { mergeMap } from "rxjs-compat/operator/mergeMap";
import { Globals } from "../../../globals";
import { RiskAlertService } from "../../../shared-v2/services/risk-alert.service";


@Injectable({
    providedIn:'root'
})

export class SiteRiskAlertService extends  RiskAlertService{
    public riskAlertsSub: BehaviorSubject<RiskAlertConfig[]> = new BehaviorSubject<RiskAlertConfig[]>([]);
    public riskAlertPanelId: BehaviorSubject<String> = new BehaviorSubject<String>("");
    public riskPanelContentSub: BehaviorSubject<DetectorResponse> = new BehaviorSubject<DetectorResponse>(null);
    risks: RiskTile[] = [];
    riskResponses: DetectorResponse[] = [];
    risksDictionary = {};
    risksPanelContents = {};
    currentRiskPanelContentId: string = null;
    riskPanelContent: DetectorResponse = null;
    riskAlertConfigs: RiskAlertConfig[];


    public set _riskAlertConfigs(riskAlertConfigs: RiskAlertConfig[]) {
        this.riskAlertsSub.next(riskAlertConfigs);
    }

    public  setRiskAlertPanelId(riskAlertId: string) {
        this.riskAlertPanelId.next(riskAlertId);
        const curRes = this.risksPanelContents[riskAlertId];
        this.riskPanelContentSub.next(this.risksPanelContents[riskAlertId]);

        console.log("release new id and res", riskAlertId, curRes);
    }


    private _siteRiskAlertConfigs = [
        {
            title: "Configuration",
            riskAlertId: "backupFailures",
            enableForCaseSubmissionFlow: true,
            notificationMessage: "We detected missing configuraions in your application that will increase risk of a downtime."
        },
        {
            title: "Availability",
            riskAlertId: "availablityriskalert",
            enableForCaseSubmissionFlow: true,
            notificationMessage: "We detected you are not following best practices configuration that will increase risk of a downtime."
        }
    ];

 //   this._riskAlertService._riskAlertConfigs = this.riskAlertConfigs;


    constructor(protected _featureService: FeatureService, protected _diagnosticService: DiagnosticService, protected _detectorControlService: DetectorControlService, protected _telemetryService: TelemetryService, protected globals: Globals, protected _genericArmConfigService?: GenericArmConfigService)
    {
        super(_featureService, _diagnosticService, _detectorControlService, _telemetryService, globals, _genericArmConfigService);
        console.log("For siteriskalert, get config", this._siteRiskAlertConfigs);
        this._addRiskAlertIds(this._siteRiskAlertConfigs);
      //  this.getRiskTileResponse();
    }

    // public _addRiskAlertIds(riskAlertConfigs: RiskAlertConfig[]) {
    //     //Filter out duplicate links
    //     const riskConfigSet = new Set<RiskAlertConfig>(this._riskAlertConfigs);
    //     for (let config of riskAlertConfigs) {
    //         riskConfigSet.add(config);
    //     }
    //     const riskAlertsArray = Array.from(riskConfigSet);
    //     this._riskAlertConfigs = riskAlertsArray;
    //     this.riskAlertConfigs = riskAlertsArray;
    //     console.log("iamsolostbefore", riskAlertsArray, this._riskAlertConfigs, this.riskAlertConfigs);

    // }

    protected _isRiskAlertEnabled(): boolean {
        return this.riskAlertConfigs != null && this.riskAlertConfigs.length > 0;
    }
}
