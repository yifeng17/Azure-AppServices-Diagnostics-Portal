import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { SiteDaasInfo } from '../../../models/solution-metadata';
import { SiteInfoMetaData } from '../../../models/site';
import { SiteService } from '../../../services/site.service';
import { WindowService } from '../../../../startup/services/window.service';
import { AvailabilityLoggingService } from '../../../services/logging/availability.logging.service';
import { ArmService } from '../../../services/arm.service';
import {jsTestChecks} from './test-check.js'
import { ResponseMessageEnvelope } from '../../../models/responsemessageenvelope';
import { HealthStatus, LoadingStatus } from 'diagnostic-data';
import { CheckerListComponent } from 'projects/diagnostic-data/src/lib/components/checker-list/checker-list.component';
//import { MarkdownTextComponent } from 'projects/diagnostic-data/src/lib/components/markdown-text/markdown-text.component';
declare var jsDynamicImportChecks: any;

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
    public title:string;
    public level:number;
    public markdown:string;
    public interactivePayload?:InteractiveCheckPayload;
}

export class CheckResultView{
    public name:string;
    public title:string; 
    public level:string; 
    public markdown:string;
    public interactivePayload?:InteractiveCheckPayload;
    public expanded:boolean;
    public status:HealthStatus;
    public loadingStatus:LoadingStatus;

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

async function sampleCheck(siteInfo: SiteInfoMetaData, appSettings: Map<string, string>, armService: ArmService): Promise<CheckResult>{
    console.log("appSettings", appSettings);
    var s = `
    # Markdown test
    Test [hyperlink](https://ms.portal.azure.com)
    ## Subtitle
    abcabcabc 
    `
    return {title: "TS sample check", level: 0, markdown: s};
}

async function interactiveSampleCheck(siteInfo: SiteInfoMetaData, appSettings: Map<string, string>, armService: ArmService): Promise<CheckResult>{
    var result: CheckResult = {title: "interactive sample check", level: 3, markdown: "please input"};
    result.interactivePayload = {type:0, data:"test", callBack: async (userInput:string) => { return {title: "your input is " + userInput, level: 0, markdown: userInput}}}
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
    styleUrls: ['../styles/daasstyles.scss', './network-checks.component.scss'],
    entryComponents: [CheckerListComponent]
})

export class NetworkCheckComponent implements OnInit {

    title: string = 'Run Network Checks';
    description: string = 'Run network checks';

    armServiceWrapper: ArmServiceWrapper;
    checkResultViews: CheckResultView[] = [];
    //checks: any[];

    constructor(private _siteService: SiteService,private _armService: ArmService, private _windowService: WindowService, private _logger: AvailabilityLoggingService) {

        this.armServiceWrapper = new ArmServiceWrapper(_armService);
        this.loadChecksAsync();

    }

    ngOnInit(): void {
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

    async loadChecksAsync():Promise<void>{
        var sampleChecks = [sampleCheck, interactiveSampleCheck];
        
        var taskList:Promise<void>[] = [];
        taskList.push(this.runChecksAsync(sampleChecks));

        if(jsTestChecks!=null){
            //this.checks = this.checks.concat(jsTestChecks);
            taskList.push(this.runChecksAsync(jsTestChecks));
        }
        var castedWindow:any = window;

        console.log("use window.diagNetworkChecks array to debug your check, e.g. window.diagNetworkChecks = [testCheck]");
        if(castedWindow.hasOwnProperty("diagNetworkChecks") && castedWindow.diagNetworkChecks!=null){
            //this.checks = this.checks.concat(castedWindow.diagNetworkChecks);
            taskList.push(this.runChecksAsync(castedWindow.diagNetworkChecks));
        }

        this.loadRemoteCheckAsync().then(remoteChecks => {
            console.log(remoteChecks);
            //debugger;
            //this.checks = this.checks.concat(remoteChecks);
            (this.runChecksAsync(remoteChecks));
        });

        await Promise.all(taskList);
    }

    loadRemoteCheckAsync(): Promise<any[]>{
        var promise = new Promise<any[]>((resolve, reject) => {
            var script = document.createElement("script");
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', 'http://127.0.0.1:8000/test-check.js');
            script.onload = () => {
                console.log("remote script loaded!");
                console.log(script);
                if (typeof jsDynamicImportChecks != 'undefined') {
                    resolve(jsDynamicImportChecks);
                }
                else{
                    resolve([]);
                }
            }
            script.onerror = () => {
                resolve([]);
            }
            document.head.appendChild(script);
        });
        return promise;
    }

    async runChecksAsync(checks: any[]):Promise<void>{
        var siteInfo = this._siteService.currentSiteMetaData.value;
        var appSettings = (await this._siteService.getSiteAppSettings(siteInfo.subscriptionId, siteInfo.resourceGroupName, siteInfo.siteName, siteInfo.slot).toPromise()).properties;

        await Promise.all(checks.map(async check => {
            try{
                var result = await check(siteInfo, appSettings, this.armServiceWrapper);
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
        this.checkResultViews.push({
            name: funcName, 
            title: result.title, 
            level:checkResultLevel[result.level], 
            markdown:this.markdownPreprocess(result.markdown), 
            interactivePayload: result.interactivePayload,
            status: this.convertLevelToHealthStatus(result.level),
            loadingStatus: LoadingStatus.Success,
            expanded:false
        })
    }

    markdownPreprocess(markdown:string):string{
        var result = markdown.replace(/(?<!\!)\[(.*?)]\((.*?)\)/g,`<a target="_blank"  href="$2">$1</a>`);
        return result;
    }

    async interactiveCallBack(userInput:any, callBack:(userInput: any) => Promise<CheckResult>, resultViewIdx: number){
        try{
            var result = await callBack(userInput);
            this.checkResultViews[resultViewIdx] = {
                name: callBack.name, 
                title: result.title, 
                level: checkResultLevel[result.level], 
                markdown:result.markdown, 
                interactivePayload: result.interactivePayload,
                status: this.convertLevelToHealthStatus(result.level),
                loadingStatus: LoadingStatus.Success,
                expanded:false
            };
        }
        catch(error){
            console.log("error:", error);
            debugger;
        }

    }

    convertLevelToHealthStatus(level:checkResultLevel):HealthStatus{
        switch(level){
            case checkResultLevel.pass:
                return HealthStatus.Success;
            case checkResultLevel.fail:
                return HealthStatus.Critical;
            case checkResultLevel.warning:
                return HealthStatus.Warning;
            case checkResultLevel.pending:
                return HealthStatus.Info;
        }
        return HealthStatus.None;
    }
}
