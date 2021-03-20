import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Site, SiteInfoMetaData } from '../../../../models/site';
import { SiteService } from '../../../../services/site.service';
import { ArmService } from '../../../../services/arm.service';

import { HealthStatus, LoadingStatus, TelemetryService } from 'diagnostic-data';

import { DiagProvider, OutboundType } from '../diag-provider';
import { Globals } from 'projects/app-service-diagnostics/src/app/globals';
import { CheckManager } from '../check-manager';
import { CheckStepView, DropdownStepView, InfoStepView, StepFlow, StepFlowManager, StepView, StepViewContainer, StepViewType } from '../step-view-lib';
//import { MarkdownTextComponent } from 'projects/diagnostic-data/src/lib/components/markdown-text/markdown-text.component';


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

var testFlow:NetworkCheckFlow = {
    id: "testFlow1",
    title: "test1",
    async func(siteInfo: SiteInfoMetaData & Site & { fullSiteName: string }, diagProvider: DiagProvider, flowMgr: StepFlowManager): Promise<null>{
        flowMgr.addView(new CheckStepView({
            id: "Test",
            type: StepViewType.check,
            title: "test123",
            level: 0
        }));
        return;
    }
}

var testFlow2:NetworkCheckFlow = {
    id: "testFlow2",
    title: "test2",
    async func(siteInfo: SiteInfoMetaData & Site & { fullSiteName: string }, diagProvider: DiagProvider, flowMgr: StepFlowManager): Promise<null>{
        flowMgr.addView(new InfoStepView({
            id: "Test",
            infoType: 0,
            type: StepViewType.info,
            title: "test234",
            markdown: "# Test\r\n\r\n123123"
        }));

        flowMgr.addView(new InfoStepView({
            id: "Test",
            infoType: 1,
            type: StepViewType.info,
            title: "test1111",
            markdown: "# Test\r\n\r\n123123"
        }));
        return;
    }
}

@Component({
    templateUrl: 'network-checks-firstpage.component.html',
    styleUrls: ['../../styles/daasstyles.scss', './network-checks-firstpage.component.scss'],
    encapsulation: ViewEncapsulation.None,
    entryComponents: []
})


export class NetworkCheckFirstPageComponent implements OnInit {

    title: string = 'Network Checking Tool';
    description: string = '';
    stepFlowManager:StepFlowManager;
    stepViews: StepViewContainer[] = [];

    diagProvider: DiagProvider;
    siteInfo: SiteInfoMetaData & Site & { fullSiteName: string };
    vnetIntegrationDetected = null;
    openFeedback = false;
    //checks: any[];

    constructor(private _siteService: SiteService, private _armService: ArmService, private _telemetryService: TelemetryService, private _globals:Globals) {
        try
        {
        var siteInfo = this._siteService.currentSiteMetaData.value;
        var fullSiteName = siteInfo.siteName + (siteInfo.slot == "" ? "" : "-" + siteInfo.slot);
        this.stepFlowManager = new StepFlowManager(this.stepViews);
        this.siteInfo = { ...this._siteService.currentSiteMetaData.value, ...this._siteService.currentSite.value, fullSiteName };

        this.diagProvider = new DiagProvider(this.siteInfo, _armService, _siteService);
         /*var siteInfo = this._siteService.currentSiteMetaData.value;
        var fullSiteName = siteInfo.siteName + (siteInfo.slot == "" ? "" : "-" + siteInfo.slot);
        var siteInfoPlus = { ...this._siteService.currentSiteMetaData.value, ...this._siteService.currentSite.value, fullSiteName, siteVnetInfo:null };
        var diagProvider = new DiagProvider(siteInfoPlus, _armService, _siteService);
        this._globals.messagesData["NetworkCheckDiagProvider"] = diagProvider;
        diagProvider.getVNetIntegrationStatusAsync()
            .then(result => {
                if(result.isVnetIntegrated){
                    siteInfoPlus.siteVnetInfo = result.siteVnetInfo;
                    this._globals.messagesData["SiteInfoWithVNetInfo"] = siteInfoPlus;
                    this.vnetIntegrationDetected = true;
                    if(result.outboundType == OutboundType.SWIFT){
                        this.description = "Detected Regional VNet integration configured."
                    }else if(result.outboundType == OutboundType.gateway){
                        this.description = "Detected Gateway required VNet integration configured."
                    }
                }else{
                    this.vnetIntegrationDetected = false;
                    this.description = "No VNet integration detected."
                }
            });//*/
        this.loadFlowsAsync();
        }catch(error){
            debugger;
            console.log(error);
        }
    }

    async loadFlowsAsync(): Promise<void> {
        var remoteFlows:any = await CheckManager.loadRemoteCheckAsync(true);
        remoteFlows = Object.keys(remoteFlows).map(key=> {
            var flow = remoteFlows[key];
            flow.id = flow.id || key;
            return flow;
        });
        var flows =  [testFlow, testFlow2].concat(remoteFlows).map(f => this.convertFromNetworkCheckFlow(f));
        var mgr = this.stepFlowManager;
        var dropDownView = new DropdownStepView({
            id: "InitialDropDown",
            description: "Tell us more about the problem you are experiencing?",
            dropdowns: [{
                options: flows.map(f => f.title),
                placeholder: "Please select..."}],
            async callback(dropdownIdx: number, selectedIdx: number): Promise<void> {
                mgr.reset(state);
                var flow = flows[selectedIdx];
                mgr.setFlow(flow);
            }
        });
        var state = mgr.addView(dropDownView);
    }

    ngOnInit(): void {
        this._telemetryService.logEvent("NetworkCheck.FirstPageLoad");
        /*
        this.scmPath = this._siteService.currentSiteStatic.enabledHostNames.find(hostname => hostname.indexOf('.scm.') > 0);
        this._siteService.getSiteAppSettings(siteInfo.subscriptionId, siteInfo.resourceGroupName, siteInfo.siteName, siteInfo.slot).toPromise().then(val=>{
            debugger;
            this.thingsToKnowBefore = Object.keys(val.properties).map(key => key + ":" + val.properties[key]);
        });
        debugger;
        this._armService.postResourceAsync(siteInfo.resourceUri + "/config/appsettings/list")
            .then(val => console.log("getArmResource", val));//*/
    }

    convertFromNetworkCheckFlow(flow: NetworkCheckFlow): StepFlow{
        var siteInfo = this.siteInfo;
        var diagProvider = this.diagProvider;
        var stepFlow:StepFlow ={
            id: flow.id,
            title: flow.title,
            description: flow.description || null,
            async run(flowMgr: StepFlowManager):Promise<void>{
                return flow.func(siteInfo, diagProvider, flowMgr);
            }
        };

        return stepFlow;
    }
}


