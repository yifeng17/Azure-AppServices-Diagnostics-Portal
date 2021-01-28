import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { SiteDaasInfo } from '../../../models/solution-metadata';
import { Session } from '../../../models/daas';
import { SiteInfoMetaData } from '../../../models/site';
import { SiteService } from '../../../services/site.service';
import { DaasService } from '../../../services/daas.service';
import { WindowService } from '../../../../startup/services/window.service';
import { AvailabilityLoggingService } from '../../../services/logging/availability.logging.service';
import { ArmService } from '../../../services/arm.service';
import {jsTestChecks} from './test-check.js'
import { ResponseMessageEnvelope } from '../../../models/responsemessageenvelope';

function Delay(x: number): Promise<void>{
    return new Promise(resolve => 
        setTimeout(resolve, x));
}

class InteractiveCheckPayload{
    public type:number;
    public data:any;
    public callBack: (userInput: any) => Promise<CheckResult>;
}

class CheckResult{
    public description:string;
    public level:number;
    public info:string;
    public interactivePayload?:InteractiveCheckPayload;
}

class CheckResultView{
    public name:string;
    public description:string; 
    public level:string; 
    public info:string;
    public interactivePayload?:InteractiveCheckPayload;
}

class ArmServiceWrapper{
    private _armService: ArmService;
    constructor(armService:ArmService){
        this._armService = armService;
    }

    public getArmResourceAsync<T>(resourceUri: string, apiVersion?: string, invalidateCache: boolean = false): Promise<T> {
        return this._armService.getArmResource<T>(resourceUri, apiVersion, invalidateCache).toPromise();
    }

    public postResourceAsync<T, S>(resourceUri: string, body?: S, apiVersion?: string, invalidateCache: boolean = false, appendBodyToCacheKey: boolean = false): Promise<boolean | {} | ResponseMessageEnvelope<T>>{
        return this._armService.postResource<T, S>(resourceUri, body, apiVersion, invalidateCache, appendBodyToCacheKey).toPromise();
    }
}

async function sampleCheck(appSettings: Map<string, string>, armService: ArmService): Promise<CheckResult>{
    console.log("appSettings", appSettings);
    var s = Object.keys(appSettings).map(key => key + ":" + appSettings[key]);
    return {description: "TS sample check", level: 0, info: s.join(";")};
}

async function interactiveSampleCheck(appSettings: Map<string, string>, armService: ArmService): Promise<CheckResult>{
    var result: CheckResult = {description: "interactive sample check", level: 4, info: "please input"};
    result.interactivePayload = {type:0, data:"test", callBack: async (userInput:string) => { return {description: "your input is", level: 0, info: userInput}}}
    return result;
}

enum checkResultLevel{
    pass,
    warning,
    fail,
    pending
}

enum interactiveCheckType{
    textbox,
    dropdown
}

@Component({
    templateUrl: 'network-checks.component.html',
    styleUrls: ['../styles/daasstyles.scss']
})

export class NetworkCheckComponent implements OnInit {

    title: string = 'Run Network Checks';
    description: string = 'Run network checks';

    armServiceWrapper: ArmServiceWrapper;
    checkResultViews: CheckResultView[] = [];

    siteToBeDiagnosed: SiteDaasInfo;
    scmPath: string;
    couldNotFindSite: boolean = false;

    refreshSessions: boolean = false;
    checks: any[];

    constructor(private _siteService: SiteService,private _armService: ArmService, private _windowService: WindowService, private _logger: AvailabilityLoggingService) {

        this.armServiceWrapper = new ArmServiceWrapper(_armService);
        this._siteService.getSiteDaasInfoFromSiteMetadata().subscribe(site => {
            this.siteToBeDiagnosed = site;
        });
        this.loadChecksAsync()
            .then(()=> this.runChecksAsync());
    }

    ngOnInit(): void {
        /*var siteInfo = this._siteService.currentSiteMetaData.value;
        this.scmPath = this._siteService.currentSiteStatic.enabledHostNames.find(hostname => hostname.indexOf('.scm.') > 0);
        this._siteService.getSiteAppSettings(siteInfo.subscriptionId, siteInfo.resourceGroupName, siteInfo.siteName, siteInfo.slot).toPromise().then(val=>{
            debugger;
            this.thingsToKnowBefore = Object.keys(val.properties).map(key => key + ":" + val.properties[key]);
        });
        debugger;
        this._armService.postResourceAsync(siteInfo.resourceUri + "/config/appsettings/list")
            .then(val => console.log("getArmResource", val));//*/
    }

    updateSessions(event) {
        this.refreshSessions = event;
    }

    async loadChecksAsync():Promise<void>{
        this.checks = [sampleCheck, interactiveSampleCheck];
        if(jsTestChecks!=null){
            this.checks = this.checks.concat(jsTestChecks);
        }
        var castedWindow:any = window;

        console.log("use window.diagNetworkChecks array to debug your check, e.g. window.diagNetworkChecks = [testCheck]");
        if(castedWindow.hasOwnProperty("diagNetworkChecks") && castedWindow.diagNetworkChecks!=null){
            this.checks = this.checks.concat(castedWindow.diagNetworkChecks);
        }
    }

    async runChecksAsync():Promise<void>{
        var siteInfo = this._siteService.currentSiteMetaData.value;
        var appSettings = (await this._siteService.getSiteAppSettings(siteInfo.subscriptionId, siteInfo.resourceGroupName, siteInfo.siteName, siteInfo.slot).toPromise()).properties;

        await Promise.all(this.checks.map(async check => {
            try{
                var result = await check(appSettings, this.armServiceWrapper);
                this.pushCheckResult(check.name, result);
            }
            catch(error){
                console.log("error:", error);
                debugger;
            }
        }));
        console.log("check results" ,this.checkResultViews);
    }

    pushCheckResult(funcName:string, result: CheckResult){
        this.checkResultViews.push({name: funcName, description: result.description, level:checkResultLevel[result.level], info:result.info, interactivePayload: result.interactivePayload})
    }

    async interactiveCallBack(userInput:any, callBack:(userInput: any) => Promise<CheckResult>, resultViewIdx: number){
        try{
            var result = await callBack(userInput)
            this.checkResultViews[resultViewIdx] = {name: callBack.name, description: result.description, level:checkResultLevel[result.level], info:result.info, interactivePayload: result.interactivePayload};
        }
        catch(error){
            console.log("error:", error);
            debugger;
        }

    }
}
