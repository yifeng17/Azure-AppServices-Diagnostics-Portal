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
import { SiteFilteredItem } from "../models/site-filter";
import { AppType } from "../../../shared/models/portal";
import { HostingEnvironmentKind, OperatingSystem } from "../../../shared/models/site";
import { Sku } from "../../../shared/models/server-farm";
import { WebSiteFilter } from "../pipes/site-filter.pipe";


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

    private _webAppRiskAlertConfigs = [
        {
            title: "Availability",
            riskAlertId: "availablityriskalert",
            enableForCaseSubmissionFlow: true,
            notificationMessage: "We detected you are not following best practices configuration and that will increase risk of a downtime."
        },
        // {
        //     title: "Configuration",
        //     riskAlertId: "backupFailures",
        //     enableForCaseSubmissionFlow: true,
        //     notificationMessage: "We detected missing configurations in your application that will increase risk of a downtime."
        // }
    ];

    private _functionAppRiskAlertConfigs = [
        // {
        //     title: "Configuration",
        //     riskAlertId: "functionExecutionErrors",
        //     enableForCaseSubmissionFlow: true,
        //     notificationMessage: "We detected missing configurations in your application that will increase risk of a downtime."
        // },
        {
            title: "Availability risk alert",
            riskAlertId: "functionPerformance",
            enableForCaseSubmissionFlow: true,
            notificationMessage: "We detected you are not following best practices configuration that will increase risk of a downtime."
        }
    ];

    private _linuxAppRiskAlertConfigs = [
        {
            title: "Configuration",
            riskAlertId: "backupFailures",
            enableForCaseSubmissionFlow: true,
            notificationMessage: "We detected missing configuraions in your application that will increase risk of a downtime."
        },
        {
            title: "Availability",
            riskAlertId: "swap",
            enableForCaseSubmissionFlow: true,
            notificationMessage: "We detected you are not following best practices configuration that will increase risk of a downtime."
        }
    ];

    private _siteRiskAlertConfigs: SiteFilteredItem<RiskAlertConfig[]>[] = [
        {
            appType: AppType.WebApp,
            platform: OperatingSystem.windows,
            stack: '',
            sku: Sku.All,
            hostingEnvironmentKind: HostingEnvironmentKind.All,
            item: this._webAppRiskAlertConfigs,
        },
        {
            appType: AppType.FunctionApp,
            platform: OperatingSystem.windows | OperatingSystem.linux,
            stack: '',
            sku: Sku.All,
            hostingEnvironmentKind: HostingEnvironmentKind.All,
            item: this._functionAppRiskAlertConfigs
        },
        {
            appType: AppType.WebApp,
            platform: OperatingSystem.linux,
            stack: '',
            sku: Sku.All,
            hostingEnvironmentKind: HostingEnvironmentKind.All,
            item: this._linuxAppRiskAlertConfigs
        }
    ];


    constructor(private _websiteFilter: WebSiteFilter, protected _featureService: FeatureService, protected _diagnosticService: DiagnosticService, protected _detectorControlService: DetectorControlService, protected _telemetryService: TelemetryService, protected globals: Globals, protected _genericArmConfigService?: GenericArmConfigService)
    {
        super(_featureService, _diagnosticService, _detectorControlService, _telemetryService, globals, _genericArmConfigService);
        const riskAlertConfigs = this._websiteFilter.transform(this._siteRiskAlertConfigs);
        let siteRiskAlertConfigs: RiskAlertConfig[] = [];
        for (const riskAlertConfig of riskAlertConfigs) {
            siteRiskAlertConfigs = siteRiskAlertConfigs.concat(riskAlertConfig);
        }

        console.log("For siteriskalert, get config", siteRiskAlertConfigs);
        this._addRiskAlertIds(siteRiskAlertConfigs);
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
