import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Site, SiteInfoMetaData } from '../../../models/site';
import { SiteService } from '../../../services/site.service';
import { ArmService } from '../../../services/arm.service';
import { jsSampleChecks } from './sample-check.js'
import { ResponseMessageEnvelope } from '../../../models/responsemessageenvelope';
import { HealthStatus, LoadingStatus, TelemetryService } from 'diagnostic-data';
import { CheckerListComponent } from 'projects/diagnostic-data/src/lib/components/checker-list/checker-list.component';
//import { MarkdownTextComponent } from 'projects/diagnostic-data/src/lib/components/markdown-text/markdown-text.component';
declare var jsDynamicImportChecks: any;

function delay(second: number): Promise<void> {
    return new Promise(resolve =>
        setTimeout(resolve, second * 1000));
}

class PromiseCompletionSource<T> extends Promise<T>{
    private _resolve: (value: T | PromiseLike<T>) => void;
    private _reject: (reason?: any) => void;

    constructor(timeoutInSec?: number) {
        var _resolve: (value: T | PromiseLike<T>) => void;
        var _reject: (reason?: any) => void;
        super((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
        });

        this._resolve = _resolve;
        this._reject = _reject;

        if (timeoutInSec != null) {
            delay(timeoutInSec).then(() => {
                this._reject(`Timeout after ${timeoutInSec} seconds!`);
            });
        }
    }

    resolve(val: T) {
        this._resolve(val);
    }
}

class InteractiveCheckPayload {
    public type: number;
    public data: any;
    public callBack: (userInput: any) => Promise<CheckResult & { title: string }>;
}



class Check {
    public id?: string;
    public title: string;
    public description?: string;
    public func: (siteInfo: SiteInfoMetaData & Site, appSettings: any, diagProvider: DiagProvider) => Promise<CheckResult>;
    public tryGetSharedObject?: (key: string) => any;
    public shareObject?: (key: string, value: any) => void;
    public waitSharedObjectAsync?: (key: string) => Promise<any>;
}

class CheckResult {
    public id?: string;
    public title?: string;
    public level: number;
    public markdown?: string;
    
    public interactivePayload?: InteractiveCheckPayload;
    public expanded?: boolean;
    public steps?: CheckResult[];
    public promise?: Promise<CheckResult>;
}

export class ResultView {
    public id: string;
    public title: string;
    public level: string;
    public markdown: string;
    public status: HealthStatus;
    public loadingStatus: LoadingStatus;
    public expanded: boolean;
    public interactivePayload?: InteractiveCheckPayload;
    public expandable: boolean;
    public stepResultViews?: ResultView[];

    constructor(data?: {
        id: string;
        title: string;
        level: string;
        markdown: string;
        status: HealthStatus;
        loadingStatus: LoadingStatus;
        expanded: boolean;
        interactivePayload?: InteractiveCheckPayload;
    }) {
        if (data != null) {
            this.id = data.id;
            this.title = data.title;
            this.level = data.level;
            this.markdown = data.markdown;
            this.status = data.status;
            this.loadingStatus = data.loadingStatus;
            this.expanded = data.expanded;
            this.interactivePayload = data.interactivePayload;
            this.expandable = (this.markdown!=null || this.interactiveCallBack!=null);
        }
    }

    async interactiveCallBack(userInput: any) {
        try {
            var result = await this.interactivePayload.callBack(userInput);
            this.fill(this.id + "CallBack", result);
        }
        catch (error) {
            console.log("error:", error);
            debugger;
        }

    }

    fill(id: string, result: CheckResult) {
        console.log(new Error().stack);
        this.id = id;
        this.title = result.title;
        this.level = checkResultLevel[result.level];
        this.status = convertLevelToHealthStatus(result.level);
        this.markdown = markdownPreprocess(result.markdown, id);
        this.loadingStatus = LoadingStatus.Success;
        this.interactivePayload = result.interactivePayload;
        this.expanded = result.expanded;
        this.loadingStatus = LoadingStatus.Success;
        this.expandable = (this.markdown!=null || this.interactivePayload!=null);

        if (result.promise != null) {
            this.loadingStatus = LoadingStatus.Loading;
            Promise.race([result.promise, delay(10).then((): CheckResult => null)]).then(t => {
                this.loadingStatus = LoadingStatus.Success;
                if (t == null) {
                    this.status = convertLevelToHealthStatus(3);
                    this.title = "timeout: " + this.title;
                } else {
                    this.fill(id, t);
                }
            });
        }
        if(result.steps!=null){
            this.stepResultViews = result.steps.map((step, idx) => {
                var resultView = new ResultView();
                resultView.fill(`${id}-${idx}`, step);
                return resultView;
            });
        }
    }
}


enum ConnectionCheckStatus { success, timeout, hostNotFound, blocked, refused }

class DiagProvider {
    private _siteInfo: SiteInfoMetaData & Site & { fullSiteName: string };
    private _armService: ArmService;
    constructor(siteInfo: SiteInfoMetaData & Site & { fullSiteName: string }, armService: ArmService) {
        this._siteInfo = siteInfo;
        this._armService = armService;
    }

    public getArmResourceAsync<T>(resourceUri: string, apiVersion?: string, invalidateCache: boolean = false): Promise<T> {
        var stack = new Error("replace_placeholder").stack;
        return this._armService.getArmResource<T>(resourceUri, apiVersion, invalidateCache)
            .toPromise()
            .catch(e => {
                var err = new Error(e);
                err.stack = stack.replace("replace_placeholder", e);
                throw err;
            });
    }

    public postResourceAsync<T, S>(resourceUri: string, body?: S, apiVersion?: string, invalidateCache: boolean = false, appendBodyToCacheKey: boolean = false): Promise<boolean | {} | ResponseMessageEnvelope<T>> {
        return this.postArmResourceAsync(resourceUri, body, apiVersion, invalidateCache, appendBodyToCacheKey);
    }

    public postArmResourceAsync<T, S>(resourceUri: string, body?: S, apiVersion?: string, invalidateCache: boolean = false, appendBodyToCacheKey: boolean = false): Promise<boolean | {} | ResponseMessageEnvelope<T>> {
        var stack = new Error("replace_placeholder").stack;
        return this._armService.postResource<T, S>(resourceUri, body, apiVersion, invalidateCache, appendBodyToCacheKey)
            .toPromise()
            .catch(e => {
                var err = new Error(e);
                err.stack = stack.replace("replace_placeholder", e);
                throw err;
            });
    }

    public getKudoApiAsync<T>(siteName: string, uri: string): Promise<T> {
        var stack = new Error("replace_placeholder").stack;
        return this._armService.get<T>(`https://${siteName}.scm.azurewebsites.net/api/${uri}`)
            .toPromise()
            .catch(e => {
                var err = new Error(e);
                err.stack = stack.replace("replace_placeholder", e);
                throw err;
            });
    }

    public postKudoApiAsync<T, S>(siteName: string, uri: string, body?: S, instance?: string): Promise<boolean | {} | ResponseMessageEnvelope<T>> {
        var postfix = (instance == null ? "" : `?instance=${instance}`);
        var stack = new Error("replace_placeholder").stack;
        return this._armService.post<T, S>(`https://${siteName}.scm.azurewebsites.net/api/${uri}${postfix}`, body)
            .toPromise()
            .catch(e => {
                var err = new Error(e);
                err.stack = stack.replace("replace_placeholder", e);
                throw err;
            });
    }

    public async runKudoCommand(siteName: string, command: string, dir?: string, instance?: string): Promise<any> {
        var result: any = await this.postKudoApiAsync(siteName, "command", { "command": command, "dir": dir }, instance);
        return result.Output.slice(0, -2);
    }

    public getEnvironmentVariablesAsync(names: string[], instance?: string) {
        var stack = new Error("replace_placeholder").stack;
        var promise = (async () => {
            names = names.map(n => `%${n}%`);
            var echoPromise = this.runKudoCommand(this._siteInfo.fullSiteName, `echo ${names.join(";")}`, undefined, instance).catch(e => {
                console.log("getEnvironmentVariables failed", e);
                e.message = "getEnvironmentVariablesAsync failed:" + e.message;
                throw e;
            });
            var result = await echoPromise;
            result = result.split(";").map((r, i) => r == names[i] ? null : r);
            return result;
        })();

        return promise.catch(e => {
            var err = new Error(e);
            err.stack = stack.replace("replace_placeholder", e.message || e);
            throw err;
        });
    }

    public async tcpPingAsync(hostname: string, port: number, count: number = 1, instance?: string): Promise<{ status: ConnectionCheckStatus, statuses: ConnectionCheckStatus[] }> {
        var stack = new Error("replace_placeholder").stack;
        var promise = (async () => {
            var pingPromise = this.runKudoCommand(this._siteInfo.fullSiteName, `tcpping -n ${count} ${hostname}:${port}`, undefined, instance).catch(e => {
                console.log("tcpping failed", e);
                return null;
            });
            var pingResult = await pingPromise;

            var statuses: ConnectionCheckStatus[] = [];
            if (pingResult != null) {
                var splited = pingResult.split("\r\n");
                for (var i in splited) {
                    var line = splited[i];
                    if (line.startsWith("Connected to ")) {
                        statuses.push(ConnectionCheckStatus.success);
                    } else if (line.includes("No such host is known")) {
                        statuses.push(ConnectionCheckStatus.hostNotFound);
                    } else if (line.includes("Connection timed out")) {
                        statuses.push(ConnectionCheckStatus.timeout);
                    } else if (line.startsWith("Connection attempt failed: An attempt was made to access a socket")) {
                        statuses.push(ConnectionCheckStatus.blocked);
                    } else if (line.startsWith("Complete")) {
                        break;
                    } else {
                        throw new Error(`checkConnectionAsync: unknown status ${pingResult}`);
                    }
                }
            }
            var status: ConnectionCheckStatus = statuses.some(s => s == ConnectionCheckStatus.success) ? ConnectionCheckStatus.success : statuses[0];
            return { status, statuses };
        })();

        return promise.catch(e => {
            var err = new Error(e);
            err.stack = stack.replace("replace_placeholder", e.message || e);
            throw err;
        });
    }

    //TODO need to read DNS setting of VNet
    public async checkConnectionAsync(hostname: string, port: number, count: number = 1, dns: string = "", instance?: string): Promise<{ status: ConnectionCheckStatus, ip: string, aliases: string, statuses: ConnectionCheckStatus[] }> {
        var stack = new Error("replace_placeholder").stack;
        var promise = (async () => {
            var nameResolverPromise = this.runKudoCommand(this._siteInfo.fullSiteName, `nameresolver ${hostname} ${dns}`, undefined, instance).catch(e => {
                console.log("nameresolver failed", e);
                return null;
            });
            var pingPromise = this.tcpPingAsync(hostname, port, count, instance);
            await Promise.all([nameResolverPromise.catch(e => e), pingPromise.catch(e => e)]);
            var nameResovlerResult = await (nameResolverPromise.catch(e => null));
            var pingResult = await (pingPromise.catch(e => null));
            console.log(nameResovlerResult, pingResult);
            var ip: string = null, aliases: string = null;
            if (nameResovlerResult != null) {
                if(nameResovlerResult.includes("Aliases")){
                    var match = nameResovlerResult.match(/Addresses:\s*([\S\s]*)Aliases:\s*([\S\s]*)$/);
                    if (match != null) {
                        ip = match[1].split("\r\n").filter(i => i.length > 0).join(";");
                        aliases = match[2].split("\r\n").filter(i => i.length > 0).join(";");
                    }
                }else{
                    var match = nameResovlerResult.match(/Addresses:\s*([\S\s]*)$/);
                    if (match != null) {
                        ip = match[1].split("\r\n").filter(i => i.length > 0).join(";");
                    }
                }
            }

            return { status: pingResult && pingResult.status, ip, aliases, statuses: pingResult && pingResult.statuses };
        })();

        return promise.catch(e => {
            var err = new Error(e);
            err.stack = stack.replace("replace_placeholder", e.message || e);
            throw err;
        });
    }
}

var sampleCheck: Check = {
    title: "Sample TS check",
    func: async function sampleCheck(siteInfo: SiteInfoMetaData, appSettings: Map<string, string>, diagProvider: DiagProvider): Promise<CheckResult> {
        console.log("appSettings", appSettings);
        var s = `
        # Markdown test
        Test [hyperlink](https://ms.portal.azure.com)
        ## Subtitle
        abcabcabc 
        `
        return { level: 0, markdown: s };
    }
}

enum checkResultLevel {
    pass,
    warning,
    fail,
    pending,
    loading,
    error,
    unav
}

enum interactiveCheckType {
    textbox,
    dropdown
}

@Component({
    templateUrl: 'network-checks.component.html',
    styleUrls: ['../styles/daasstyles.scss', './network-checks.component.scss'],
    encapsulation: ViewEncapsulation.None,
    entryComponents: [CheckerListComponent]
})

export class NetworkCheckComponent implements OnInit {

    private _objectMap: Map<string, any> = new Map<string, any>();

    title: string = 'Run Network Checks';
    description: string = 'Run network checks';

    diagProvider: DiagProvider;
    checkResultViews: ResultView[] = [];
    siteInfo: SiteInfoMetaData & Site & { fullSiteName: string }
    feedbackReady = false;
    openFeedback = false;
    isFeedbacktoggled = false;
    //checks: any[];

    constructor(private _siteService: SiteService, private _armService: ArmService, private _telemetryService: TelemetryService) {
        var castedWindow: any = window;
        var telemetryService = this._telemetryService;
        castedWindow.networkCheckLinkClickEventLogger = (checkId: string, url: string, text: string) => {
            telemetryService.logEvent("NetworkCheck.LinkClick", { checkId: checkId, url: url, text: text });
        }


        var siteInfo = this._siteService.currentSiteMetaData.value;
        var fullSiteName = siteInfo.siteName + (siteInfo.slot == "" ? "" : "-" + siteInfo.slot);
        this.siteInfo = { ...this._siteService.currentSiteMetaData.value, ...this._siteService.currentSite.value, fullSiteName };
        this.diagProvider = new DiagProvider(this.siteInfo, _armService);
        this.loadChecksAsync();
        delay(10).then(() => this.feedbackReady = true);
    }

    ngOnInit(): void {
        this._telemetryService.logEvent("NetworkCheck.PageLoad");
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

    async loadChecksAsync(): Promise<void> {
        var siteInfo = this.siteInfo;
        var appSettings = (await this._siteService.getSiteAppSettings(siteInfo.subscriptionId, siteInfo.resourceGroupName, siteInfo.siteName, siteInfo.slot).toPromise()).properties;
        var sampleChecks = [sampleCheck];

        var taskList: Promise<void>[] = [];
        //taskList.push(this.runChecksAsync(sampleChecks, appSettings));

        if (jsSampleChecks != null) {
            //this.checks = this.checks.concat(jsTestChecks);
            //taskList.push(this.runChecksAsync(jsSampleChecks, appSettings));
        }
        var castedWindow: any = window;

        console.log("use window.diagNetworkChecks array to debug your check, e.g. window.diagNetworkChecks = [testCheck]");
        if (castedWindow.hasOwnProperty("diagNetworkChecks") && castedWindow.diagNetworkChecks != null) {
            //this.checks = this.checks.concat(castedWindow.diagNetworkChecks);
            taskList.push(this.runChecksAsync(castedWindow.diagNetworkChecks, appSettings));
        }

        taskList.push(this.loadRemoteCheckAsync().then(remoteChecks => {
            console.log(remoteChecks);
            remoteChecks = Object.keys(remoteChecks).map(key => {
                var check = remoteChecks[key];
                check.id = check.id || key;
                return check;
            });
            //debugger;
            //this.checks = this.checks.concat(remoteChecks);
            taskList.push(this.runChecksAsync(remoteChecks, appSettings));
        }));

        await Promise.all(taskList);
    }

    loadRemoteCheckAsync(): Promise<any[]> {
        var promise = new Promise<any[]>((resolve, reject) => {
            var existedScript = document.getElementById("remoteChecks");
            if (existedScript != null) {
                document.head.removeChild(existedScript);
            }
            var script = document.createElement("script");
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', 'http://127.0.0.1:8000/test-check.js');
            script.setAttribute('id', 'remoteChecks');
            script.onload = () => {
                console.log("remote script loaded!");
                console.log(script);
                if (typeof jsDynamicImportChecks != 'undefined') {
                    resolve(jsDynamicImportChecks);
                }
                else {
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

    async runChecksAsync(checks: Check[], appSettings: any): Promise<void> {
        var siteInfo = this.siteInfo;
        checks.forEach(check => {
            check.tryGetSharedObject = ((key) => this.tryGetObject(check.id, key));
            check.shareObject = ((key, value) => this.setObject(check.id, key, value));
            check.waitSharedObjectAsync = ((key) => this.waitObjectAsync(check.id, key));
        });
        checks.forEach(check => {
            try {
                var checkResult = this.pushCheckResult(check.id, check.title);

                check.func(siteInfo, appSettings, this.diagProvider)
                    .then(result => {
                        result.title = check.title;
                        checkResult.fill(check.id, result);
                    })
                    .catch(error => {
                        checkResult.level = checkResultLevel[checkResultLevel.error];
                        checkResult.loadingStatus = LoadingStatus.Success;
                        checkResult.status = convertLevelToHealthStatus(checkResultLevel.error)
                        checkResult.title = "faulted: " + checkResult.title;
                        checkResult.markdown = "```\r\n" + `message: ${error}\r\nstacktrace: ` + (error.stack || "none") + "\r\n```";
                        console.log(error);
                    });
            }
            catch (error) {
                console.log("error:", error);
                debugger;
            }
        });
        console.log("check results", this.checkResultViews);
    }

    pushCheckResult(id: string, title: string) {
        this.checkResultViews.push(new ResultView({
            id: id,
            title: title,
            level: checkResultLevel.loading.toString(),
            markdown: null,
            interactivePayload: null,
            status: convertLevelToHealthStatus(checkResultLevel.loading),
            loadingStatus: LoadingStatus.Loading,
            expanded: false
        }))
        return this.checkResultViews[this.checkResultViews.length - 1];
    }



    tryGetObject(checkId: string, key: string) {
        var objectMap = this._objectMap;
        if (objectMap.has(key)) {
            var val = objectMap.get(key);
            if (val instanceof PromiseCompletionSource) {
                return null;
            }
            return val;
        }
        return null;
    }

    waitObjectAsync(checkId: string, key: string): Promise<any> {
        var stack = new Error("replace_placeholder").stack;
        var promise: Promise<any> = null;
        var result = this.tryGetObject(checkId, key);
        if (result != null) {
            if (result instanceof PromiseCompletionSource) {
                promise = result;
            } else {
                promise = Promise.resolve(result);
            }
        } else {
            var promiseCompletion = new PromiseCompletionSource(10);
            this.setObject(checkId, key, promiseCompletion);
            promise = promiseCompletion;
        }

        return promise.catch(e => {
            var err = new Error(e);
            err.stack = stack.replace("replace_placeholder", e.message || e);
            throw err;
        });
    }

    setObject(checkId: string, key: string, value: any) {
        if (checkId == null) {
            throw new Error("Check Id is not set! Cannot use share an object without a check id!");
        }
        var objectMap = this._objectMap;

        if (objectMap.has(key)) {
            var val = objectMap.get(key);
            if (val instanceof PromiseCompletionSource) {
                val.resolve(value);
            }
        }
        objectMap.set(key, value);
    }

    toggleFeedbackOnce() {
        if (this.feedbackReady && !this.isFeedbacktoggled) {
            this.isFeedbacktoggled = true;
            this.openFeedback = true;
        }
    }
}


function convertLevelToHealthStatus(level: checkResultLevel): HealthStatus {
    switch (level) {
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

function markdownPreprocess(markdown: string, id: string): string {
    if (markdown == null) {
        return null;
    }
    // parse markdown links to html <a> tag
    var result = markdown.replace(/(?<!\!)\[(.*?)]\((.*?)( +\"(.*?)\")?\)/g, `<a target="_blank" href="$2" title="$4" onclick="window.networkCheckLinkClickEventLogger('${id}','$2', '$1')">$1</a>`);
    return result;
}