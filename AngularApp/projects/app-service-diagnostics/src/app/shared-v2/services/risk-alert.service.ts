import { Injectable } from "@angular/core";
import { DetectorResponse, LoadingStatus, Rendering, TelemetryService } from "diagnostic-data";
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
    providedIn:'root'
})

export class RiskAlertService {
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


    constructor(protected _featureService: FeatureService, private _diagnosticService: DiagnosticService, private _detectorControlService: DetectorControlService, private _telemetryService: TelemetryService, private globals: Globals, private _genericArmConfigService?: GenericArmConfigService) { }

    public initRiskAlertsForArmResource(resourceUri: string) {
        if (this._genericArmConfigService) {
            let currConfig: ArmResourceConfig = this._genericArmConfigService.getArmResourceConfig(resourceUri);
            if (currConfig.riskAlertConfigs && currConfig.riskAlertConfigs.length > 0) {
                this._addRiskAlertIds(currConfig.riskAlertConfigs);
                this.getRiskTileResponse();
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
        console.log("iamsolostbefore", riskAlertsArray, this._riskAlertConfigs, this.riskAlertConfigs);

    }

    public getRiskTileResponse(): Observable<void[]> {


        // const tasks = this.detectorSummaryViewModels.map(detector => {
        //     return this._diagnosticService.getDetector(detector.id, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(
        //       map(response => {
        //         detector.status = response.status.statusId;
        //         detector.loading = LoadingStatus.Success;
        //     }));
        //   });

        //   return forkJoin(tasks);

        const tasks = this.riskAlertConfigs.map(riskAlertConfig => {
            return this._diagnosticService.getDetector(riskAlertConfig.riskAlertId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).
                pipe(map(res => {
                    let notificationsResponse = res;
                    const notificationRenderingDataset = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === 7);
                    notificationsResponse.dataset = notificationRenderingDataset;
                    console.log("Getriskres", notificationsResponse);
                    let newRiskTile: RiskTile
                        =
                    {
                        title: riskAlertConfig.title,
                        action: () => {
                        },
                        linkText: "Click here to view more details",
                        riskInfo: null,
                        loadingStatus: LoadingStatus.Success,
                        infoObserverable: this._diagnosticService.getDetector(riskAlertConfig.riskAlertId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(res => RiskHelper.convertResponseToRiskInfo(res))),
                        //this.globals.reliabilityChecksDetailsBehaviorSubject.pipe(map(info => RiskHelper.convertToRiskInfo(info))),
                        showTile: this._isRiskAlertEnabled(),
                        riskAlertResponse: null
                    };

                    console.log("res", notificationsResponse);
                    //return res;
                    this.risksPanelContents[riskAlertConfig.riskAlertId] = notificationsResponse;
                    console.log("risksPanelContents", this.risksPanelContents);
                    newRiskTile.riskInfo = RiskHelper.convertResponseToRiskInfo(notificationsResponse);

                    newRiskTile.action = () => {
                        this.currentRiskPanelContentId = riskAlertConfig.riskAlertId;
                        this.riskPanelContent = this.risksPanelContents[this.currentRiskPanelContentId];
                        this.riskPanelContentSub.next(notificationsResponse);
                        this.setRiskAlertPanelId(riskAlertConfig.riskAlertId);
                        console.log("current risk panel content", notificationsResponse, this.riskPanelContent);
                        this.globals.openRiskAlertsPanel = true;
                        this._telemetryService.logEvent(TelemetryEventNames.OpenRiskAlertPanel, {
                            "Location": TelemetrySource.LandingPage
                        });
                    };
                    newRiskTile.riskAlertResponse = notificationsResponse;

                    if (this.risks.findIndex(risk => risk.title === newRiskTile.title) === -1)
                    {
                        this.risks.push(newRiskTile);
                    }

                 //   return newRiskTile;
                }));});
                return forkJoin(tasks);
           // console.log("Iamsolost", a);
          //  return a;


        //       forkJoin(requests).subscribe(()=> {return this.risks;});
        //    this.riskAlertConfigs = riskAlertConfigs;
        // risks.forEach(riskAlertConfig => {

        // });

        //  ));
        // this._riskAlertConfigs.map(risks =>  Observable.of(risks));

        // let newRiskTile: RiskTile
        //     =
        // {
        //     title: riskAlertConfig.title,
        //     action: () => {
        //     },
        //     linkText: "Click here to view more details",
        //     riskInfo: null,
        //     loadingStatus: LoadingStatus.Success,
        //     infoObserverable: this._diagnosticService.getDetector(riskAlertConfig.riskAlertId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(res => RiskHelper.convertResponseToRiskInfo(res))),
        //     //this.globals.reliabilityChecksDetailsBehaviorSubject.pipe(map(info => RiskHelper.convertToRiskInfo(info))),
        //     showTile: this._isRiskAlertEnabled()
        // };

        // this._diagnosticService.getDetector(riskAlertConfig.riskAlertId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString)
        //     .pipe(map(res => {
        //         console.log("get risk panel content", riskAlertConfig, res);
        // this.risksPanelContents[riskAlertConfig.riskAlertId] = res;
        // console.log("risksPanelContents", this.risksPanelContents);
        // newRiskTile.riskInfo = RiskHelper.convertResponseToRiskInfo(res);
        // newRiskTile.action = () => {
        //     this.currentRiskPanelContentId = riskAlertConfig.riskAlertId;
        //     this.riskPanelContent = this.risksPanelContents[this.currentRiskPanelContentId];
        //     console.log("current risk panel content", this.riskPanelContent);
        //     this.globals.openRiskAlertsPanel = true;
        //     this._telemetryService.logEvent(TelemetryEventNames.OpenRiskAlertPanel, {
        //         "Location": TelemetrySource.LandingPage
        //     });
        // };
        //         this.risks.push(newRiskTile);

        //     },
        //         e => {
        //             newRiskTile.riskInfo = null;
        //             newRiskTile.loadingStatus = LoadingStatus.Failed;
        //             this.risks.push(newRiskTile);
        //         }
        //     ));

        //   console.log("this risks,", this.risks);

        //     });
        // })
        // );
    }

    private _isRiskAlertEnabled(): boolean {
        return this.riskAlertConfigs != null && this.riskAlertConfigs.length > 0;
    }

    // private processRiskResponse(riskAlertConfig: RiskAlertConfig) {
    //     let newRiskTile: RiskTile
    //         =
    //     {
    //         title: riskAlertConfig.title,
    //         action: () => {
    //         },
    //         linkText: "Click here to view more details",
    //         riskInfo: null,
    //         loadingStatus: LoadingStatus.Success,
    //         infoObserverable: this._diagnosticService.getDetector(riskAlertConfig.riskAlertId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString).pipe(map(res => RiskHelper.convertResponseToRiskInfo(res))),
    //         //this.globals.reliabilityChecksDetailsBehaviorSubject.pipe(map(info => RiskHelper.convertToRiskInfo(info))),
    //         showTile: this._isRiskAlertEnabled(),
    //         riskAlertResponse: null;
    //     };

    //     this._diagnosticService.getDetector(riskAlertConfig.riskAlertId, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString)
    //         .subscribe(res => {
    //             console.log("get risk panel content", riskAlertConfig, res);
    //             this.risksPanelContents[riskAlertConfig.riskAlertId] = res;
    //             console.log("risksPanelContents", this.risksPanelContents);
    //             newRiskTile.riskInfo = RiskHelper.convertResponseToRiskInfo(res);
    //             newRiskTile.action = () => {
    //                 this.currentRiskPanelContentId = riskAlertConfig.riskAlertId;
    //                 this.riskPanelContent = this.risksPanelContents[this.currentRiskPanelContentId];
    //                 this.riskPanelContentSub.next(res);
    //                 this.setRiskAlertPanelId(riskAlertConfig.riskAlertId);
    //                 console.log("current risk panel content", res, this.riskPanelContent);
    //                 this.globals.openRiskAlertsPanel = true;
    //                 this._telemetryService.logEvent(TelemetryEventNames.OpenRiskAlertPanel, {
    //                     "Location": TelemetrySource.LandingPage
    //                 });
    //             newRiskTile.riskAlertResponse = res;
    //             };
    //             this.risks.push(newRiskTile);
    //         },
    //             e => {
    //                 newRiskTile.riskInfo = null;
    //                 newRiskTile.loadingStatus = LoadingStatus.Failed;
    //                 this.risks.push(newRiskTile);
    //             }
    //         );

    //     console.log("this risks,", this.risks);
    //     return newRiskTile;

    //     //  let title = riskResponse.metadata.name;

    //     // this.risks = [
    //     //     {
    //     //    //     title: riskResponse.metadata.name,
    //     //         action: () => {
    //     //             this.globals.openRiskAlertsPanel = true;
    //     //             this._telemetryService.logEvent(TelemetryEventNames.OpenRiskAlertPanel,{
    //     //                 "Location" : TelemetrySource.LandingPage
    //     //             });
    //     //         },
    //     //         linkText: "Click here to view more details",
    //     //         infoObserverable: this.globals.reliabilityChecksDetailsBehaviorSubject.pipe(map(info => RiskHelper.convertToRiskInfo(info))),
    //     //         showTile: this._checkIsWindowsWebApp()
    //     //     }
    //     // ];

    //     //Only show risk section if at least one tile will display
    //     //this.showRiskSection = this.risks.findIndex(risk => risk.showTile === true) > -1;

    // }
}
