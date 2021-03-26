import { Component, Input, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { Site, SiteInfoMetaData } from '../../../models/site';
import { SiteService } from '../../../services/site.service';
import { ArmService } from '../../../services/arm.service';

import { HealthStatus, LoadingStatus, TelemetryService } from 'diagnostic-data';

import { DiagProvider, OutboundType } from './diag-provider';
import { Globals } from 'projects/app-service-diagnostics/src/app/globals';
import { CheckManager } from './check-manager';
import { CheckStepView, DropdownStepView, InfoStepView, StepFlow, StepFlowManager, StepView, StepViewContainer, StepViewType } from '../../step-views/step-view-lib';
import { networkCheckFlows } from './network-check-flows.js'
import { ActivatedRoute } from '@angular/router';


function delay(second: number): Promise<void> {
    return new Promise(resolve =>
        setTimeout(resolve, second * 1000));
}


abstract class NetworkCheckFlow {
    public id: string;
    public title: string;
    public description?: string;
    abstract func(siteInfo: SiteInfoMetaData & Site & { fullSiteName: string }, diagProvider: DiagProvider, flowMgr: StepFlowManager): Promise<null>;
}

@Component({
    templateUrl: 'network-checks.component.html',
    styleUrls: ['../styles/daasstyles.scss', './network-checks.component.scss'],
    encapsulation: ViewEncapsulation.None,
    entryComponents: []
})


export class NetworkCheckComponent implements OnInit, AfterViewInit {

    @ViewChild('networkCheckingTool', { static: false }) networkCheckingToolDiv: any;
    title: string = 'Network Checking Tool';
    description: string = '';
    stepFlowManager: StepFlowManager;
    stepViews: StepViewContainer[] = [];

    diagProvider: DiagProvider;
    siteInfo: SiteInfoMetaData & Site & { fullSiteName: string };
    vnetIntegrationDetected = null;
    openFeedback = false;
    debugMode = false;
    isSupportCenter: boolean;
    //checks: any[];

    constructor(private _siteService: SiteService, private _armService: ArmService, private _telemetryService: TelemetryService, private _globals: Globals, private _route: ActivatedRoute) {
        try {
            this.isSupportCenter = (_route.snapshot.queryParams["isSupportCenter"] == "true");
            window["networkCheckLinkClickEventLogger"] = (viewId: string, url: string, text: string) => {
                _telemetryService.logEvent("NetworkCheck.LinkClick", { viewId, url, text });
            }
            if (window["debugMode"]) {
                this.debugMode = window["debugMode"];
            }

            var siteInfo = this._siteService.currentSiteMetaData.value;
            var fullSiteName = siteInfo.siteName + (siteInfo.slot == "" ? "" : "-" + siteInfo.slot);
            this.stepFlowManager = new StepFlowManager(this.stepViews, _telemetryService);
            this.siteInfo = { ...this._siteService.currentSiteMetaData.value, ...this._siteService.currentSite.value, fullSiteName };

            this.diagProvider = new DiagProvider(this.siteInfo, _armService, _siteService);
            this.loadFlowsAsync().catch(e => {
                throw e;
            });
        } catch (error) {
            _telemetryService.logException(error, "NetworkCheck.Initialization");
            console.log(error);
        }
    }

    ngAfterViewInit() {
        this.stepFlowManager.setDom(this.networkCheckingToolDiv.nativeElement);
    }

    async loadFlowsAsync(): Promise<void> {
        var telemetryService = this._telemetryService;
        var flows = this.processFlows(networkCheckFlows);
        if (this.debugMode) {
            var remoteFlows: any = await CheckManager.loadRemoteCheckAsync(true);
            remoteFlows = this.processFlows(remoteFlows, "(debug)");
            flows = flows.concat(remoteFlows);
        }
        var mgr = this.stepFlowManager;
        var dropDownView = new DropdownStepView({
            id: "InitialDropDown",
            description: "Tell us more about the problem you are experiencing?",
            dropdowns: [{
                options: flows.map(f => f.title),
                placeholder: "Please select..."
            }],
            expandByDefault: false,
            async callback(dropdownIdx: number, selectedIdx: number): Promise<void> {
                mgr.reset(state);
                var flow = flows[selectedIdx];
                telemetryService.logEvent("NetworkCheck.FlowSelected", {flowId: flow.id});
                mgr.setFlow(flow);
            }
        });
        var state = mgr.addView(dropDownView);
    }

    processFlows(flows: any, postfix?: string): StepFlow[] {
        return Object.keys(flows).map(key => {
            var flow = flows[key];
            if (postfix != null) {
                flow.title += " " + postfix;
            }
            flow.id = flow.id || key;
            var siteInfo = this.siteInfo;
            var diagProvider = this.diagProvider;
            var stepFlow: StepFlow = {
                id: flow.id,
                title: flow.title,
                description: flow.description || null,
                async run(flowMgr: StepFlowManager): Promise<void> {
                    return flow.func(siteInfo, diagProvider, flowMgr);
                }
            };
            return stepFlow;
        });
    }

    ngOnInit(): void {
        this._telemetryService.logEvent("NetworkCheck.FirstPageLoad");
    }

    convertFromNetworkCheckFlow(flow: NetworkCheckFlow): StepFlow {
        var siteInfo = this.siteInfo;
        var diagProvider = this.diagProvider;
        var stepFlow: StepFlow = {
            id: flow.id,
            title: flow.title,
            description: flow.description || null,
            async run(flowMgr: StepFlowManager): Promise<void> {
                return flow.func(siteInfo, diagProvider, flowMgr);
            }
        };

        return stepFlow;
    }
}


