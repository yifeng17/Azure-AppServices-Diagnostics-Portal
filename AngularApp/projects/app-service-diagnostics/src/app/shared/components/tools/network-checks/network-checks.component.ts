import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { SiteDaasInfo } from '../../../models/solution-metadata';
import { Site, SiteInfoMetaData } from '../../../models/site';
import { SiteService } from '../../../services/site.service';
import { WindowService } from '../../../../startup/services/window.service';
import { AvailabilityLoggingService } from '../../../services/logging/availability.logging.service';
import { ArmService } from '../../../services/arm.service';
import {jsTestChecks} from './test-check.js'
import { ResponseMessageEnvelope } from '../../../models/responsemessageenvelope';
import { HealthStatus, LoadingStatus } from 'diagnostic-data';
import { CheckerListComponent } from 'projects/diagnostic-data/src/lib/components/checker-list/checker-list.component';
import { json } from 'd3';
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

class Check{
    public title:string;
    public description?:string;
    public func: (siteInfo: SiteInfoMetaData&Site, appSettings: Map<string, string>, diagProvider: DiagProvider) => Promise<CheckResult>;
}

class CheckResult{
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

enum ConnectionCheckStatus { success, timeout, hostNotFound, refused }

class DiagProvider{
    private _siteInfo:SiteInfoMetaData;
    private _armService: ArmService;
    constructor(siteInfo:SiteInfoMetaData, armService:ArmService){
        this._siteInfo=siteInfo;
        this._armService = armService;
    }

    public getArmResourceAsync<T>(resourceUri: string, apiVersion?: string, invalidateCache: boolean = false): Promise<T> {
        return this._armService.getArmResource<T>(resourceUri, apiVersion, invalidateCache).toPromise();
    }

    public postResourceAsync<T, S>(resourceUri: string, body?: S, apiVersion?: string, invalidateCache: boolean = false, appendBodyToCacheKey: boolean = false): Promise<boolean | {} | ResponseMessageEnvelope<T>>{
        return this._armService.postResource<T, S>(resourceUri, body, apiVersion, invalidateCache, appendBodyToCacheKey).toPromise();
    }

    public getKudoApiAsync<T>(siteName:string, uri: string): Promise<T> {
        return this._armService.get<T>(`https://${siteName}.scm.azurewebsites.net/api/${uri}`).toPromise();
    }

    public postKudoApiAsync<T, S>(siteName:string, uri: string, body?: S, instance?: string): Promise<boolean | {} | ResponseMessageEnvelope<T>>{
        var postfix = (instance == null ? "" : `?instance=${instance}`);
        return this._armService.post<T, S>(`https://${siteName}.scm.azurewebsites.net/api/${uri}${postfix}`, body).toPromise();
    }

    public async runKudoCommand(siteName: string, command: string, dir?: string, instance?:string): Promise<any>{
        var result: any = await this.postKudoApiAsync(siteName, "command", {"command": command, "dir": dir}, instance);
        return result.Output;
    }

    public async checkConnectionAsync(hostname:string, port:number, count:number = 1, instance?:string): Promise<{status: ConnectionCheckStatus, ip: string, statuses: ConnectionCheckStatus[]}>{
        var siteName = this._siteInfo.siteName;
        var nameResolverPromise = this.runKudoCommand(siteName, `nameresolver ${hostname}`, undefined, instance).catch(e=>{
            console.log("nameresolver failed", e);
            return null;
        });
        var pingPromise = this.runKudoCommand(siteName, `tcpping -n ${count} ${hostname}:${port}`, undefined, instance).catch(e=>{
            console.log("tcpping failed", e);
            return null;
        });
        await Promise.all([nameResolverPromise.catch(e=>e), pingPromise.catch(e=>e)]);
        var nameResovlerResult = await (nameResolverPromise.catch(e=>null));
        var pingResult = await (pingPromise.catch(e=>null));
        console.log(nameResovlerResult, pingResult);
        var ip:string = null;
        if(nameResovlerResult!=null){
            var match = nameResovlerResult.match(/Addresses:\s*(.*)\b/);
            if(match!=null){
                ip = match[1];
            }
        }
        var statuses:ConnectionCheckStatus[] = [];
        if(pingResult!=null){
            var splited = pingResult.split("\r\n");
            for(var i in splited){
                var line = splited[i];
                if(line.startsWith("Connected to ")){
                    statuses.push(ConnectionCheckStatus.success);
                }else if(line.includes("No such host is known")){
                    statuses.push(ConnectionCheckStatus.hostNotFound);
                }else if(line.includes("Connection timed out")){
                    statuses.push(ConnectionCheckStatus.timeout);
                }else if(line.startsWith("Complete")){
                    break;
                }else{
                    throw new Error(`checkConnectionAsync: unknown status ${pingResult}`);
                }
            }
        }
        var status:ConnectionCheckStatus = statuses.some(s=>s==ConnectionCheckStatus.success) ? ConnectionCheckStatus.success : statuses[0];
        return {status:status, ip:ip, statuses:statuses};
    }
}

var sampleCheck:Check = {
    title:"Sample TS check",
    func: async function sampleCheck(siteInfo: SiteInfoMetaData, appSettings: Map<string, string>, diagProvider: DiagProvider): Promise<CheckResult>{
        console.log("appSettings", appSettings);
        var s = `
        # Markdown test
        Test [hyperlink](https://ms.portal.azure.com)
        ## Subtitle
        abcabcabc 
        `
        return { level: 0, markdown: s};
    }
}

var interactiveSampleCheck:Check = {
    title:"interactive sample check",
    func:async function interactiveSampleCheck(siteInfo: SiteInfoMetaData, appSettings: Map<string, string>, diagProvider: DiagProvider): Promise<CheckResult>{
        var result: CheckResult = {level: 3, markdown: "please input"};
        result.interactivePayload = {type:0, data:"test", callBack: async (userInput:string) => { return {title: "your input is " + userInput, level: 0, markdown: userInput}}}
        return result;
    }
}

enum checkResultLevel{
    pass,
    warning,
    fail,
    pending,
    loading,
    error
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

    diagProvider: DiagProvider;
    checkResultViews: CheckResultView[] = [];
    //checks: any[];

    constructor(private _siteService: SiteService,private _armService: ArmService, private _windowService: WindowService, private _logger: AvailabilityLoggingService) {

        this.diagProvider = new DiagProvider(this._siteService.currentSiteMetaData.value, _armService);
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
        var siteInfo = this._siteService.currentSiteMetaData.value;
        var appSettings = (await this._siteService.getSiteAppSettings(siteInfo.subscriptionId, siteInfo.resourceGroupName, siteInfo.siteName, siteInfo.slot).toPromise()).properties;
        var sampleChecks = [sampleCheck, interactiveSampleCheck];
        
        var taskList:Promise<void>[] = [];
        taskList.push(this.runChecksAsync(sampleChecks, appSettings));
        console.log(jsTestChecks);

        if(jsTestChecks!=null){
            //this.checks = this.checks.concat(jsTestChecks);
            taskList.push(this.runChecksAsync(jsTestChecks, appSettings));
        }
        var castedWindow:any = window;

        console.log("use window.diagNetworkChecks array to debug your check, e.g. window.diagNetworkChecks = [testCheck]");
        if(castedWindow.hasOwnProperty("diagNetworkChecks") && castedWindow.diagNetworkChecks!=null){
            //this.checks = this.checks.concat(castedWindow.diagNetworkChecks);
            taskList.push(this.runChecksAsync(castedWindow.diagNetworkChecks, appSettings));
        }

        taskList.push(this.loadRemoteCheckAsync().then(remoteChecks => {
            console.log(remoteChecks);
            //debugger;
            //this.checks = this.checks.concat(remoteChecks);
            taskList.push(this.runChecksAsync(remoteChecks, appSettings));
        }));

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

    async runChecksAsync(checks: Check[], appSettings:any):Promise<void>{
        var siteInfo:SiteInfoMetaData&Site = {...this._siteService.currentSiteMetaData.value , ...this._siteService.currentSite.value};
        checks.map(check => {
            try{
                var checkResult = this.pushCheckResult(check.func.name, check.title);
                check.func(siteInfo, appSettings, this.diagProvider)
                    .then(result =>{
                        checkResult.level = checkResultLevel[result.level];
                        checkResult.status = this.convertLevelToHealthStatus(result.level);
                        checkResult.markdown = this.markdownPreprocess(result.markdown);
                        checkResult.loadingStatus = LoadingStatus.Success;
                        checkResult.interactivePayload = result.interactivePayload;
                    })
                    .catch(error => {
                        checkResult.level = checkResultLevel[checkResultLevel.error];
                        checkResult.loadingStatus = LoadingStatus.Success;
                        checkResult.status = this.convertLevelToHealthStatus(checkResultLevel.error)
                        checkResult.title ="faulted: " + checkResult.title;
                        checkResult.markdown = "```\r\n"+ (error.stack || error) +"\r\n```";
                        console.log(error)
                    });
            }
            catch(error){
                console.log("error:", error);
                debugger;
            }
        });
        console.log("check results" ,this.checkResultViews);
    }

    pushCheckResult(funcName:string, title:string){
        this.checkResultViews.push({
            name: funcName, 
            title: title, 
            level:checkResultLevel.loading.toString(), 
            markdown: null, 
            interactivePayload: null,
            status: this.convertLevelToHealthStatus(checkResultLevel.loading),
            loadingStatus: LoadingStatus.Loading,
            expanded:false
        })
        return this.checkResultViews[this.checkResultViews.length-1];
    }


    markdownPreprocess(markdown:string):string{
        var result = markdown.replace(/(?<!\!)\[(.*?)]\((.*?)\)/g,`<a target="_blank"  href="$2">$1</a>`);
        return result;
    }

    async interactiveCallBack(userInput:any, callBack:(userInput: any) => Promise<CheckResult>, resultViewIdx: number){
        try{
            var result = await callBack(userInput);
            var title = this.checkResultViews[resultViewIdx].title;
            this.checkResultViews[resultViewIdx] = {
                name: callBack.name, 
                title: title, 
                level: checkResultLevel[result.level], 
                markdown:this.markdownPreprocess(result.markdown), 
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
            case checkResultLevel.error:
                return HealthStatus.Info;
        }
        return HealthStatus.None;
    }
}
