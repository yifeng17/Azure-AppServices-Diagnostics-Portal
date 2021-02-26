import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Site, SiteInfoMetaData } from '../../../models/site';
import { SiteService } from '../../../services/site.service';
import { ArmService } from '../../../services/arm.service';
import { jsSampleChecks } from './sample-check.js'
import { ResponseMessageEnvelope } from '../../../models/responsemessageenvelope';
import { HealthStatus, LoadingStatus, TelemetryService } from 'diagnostic-data';
import { CheckerListComponent } from 'projects/diagnostic-data/src/lib/components/checker-list/checker-list.component';
import { DiagProvider } from './diag-provider';
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
    public timeout?: number;
    public hidden?: boolean;
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
            this.expandable = (this.interactivePayload != null || (this.stepResultViews != null && this.stepResultViews.length > 0));
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
        this.id = id;
        this.title = result.title;
        this.level = checkResultLevel[result.level];
        this.status = convertLevelToHealthStatus(result.level);
        this.markdown = markdownPreprocess(result.markdown, id);
        this.loadingStatus = LoadingStatus.Success;
        this.interactivePayload = result.interactivePayload;
        this.expanded = result.expanded;
        this.loadingStatus = LoadingStatus.Success;
        this.expandable = (this.interactivePayload != null || (result.steps != null && result.steps.length > 0));

        if (result.promise != null) {
            var timeout = result.timeout || 10;
            this.loadingStatus = LoadingStatus.Loading;
            var status = null;
            var promise = result.promise.catch((e): CheckResult => {
                this.fillError(e, this.id, this.title);
                status = "faulted";
                return null;
            });
            var delayPromise = delay(timeout).then((): CheckResult => {
                status = "timeout";
                return null;
            })
            Promise.race([promise, delayPromise]).then(t => {
                this.loadingStatus = LoadingStatus.Success;
                if (t == null && status == "timeout") {
                    this.status = convertLevelToHealthStatus(3);
                    this.title = "timeout: " + this.title;
                } else {
                    this.fill(id, t);
                }
            });
        }
        if (result.steps != null) {
            this.stepResultViews = result.steps.map((step, idx) => {
                var resultView = new ResultView();
                resultView.fill(`${id}-${idx}`, step);
                return resultView;
            });
        }
    }

    fillError(error: Error, id: string, title: string) {
        this.level = checkResultLevel[checkResultLevel.error];
        this.loadingStatus = LoadingStatus.Success;
        this.status = convertLevelToHealthStatus(checkResultLevel.error)
        this.title = "faulted: " + title;
        this.markdown = "```\r\n" + `message: ${error}\r\nstacktrace: ` + (error.stack || "none") + "\r\n```";
        console.log(error);
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
    siteVnetInfoPromise: Promise<any>;
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
                        checkResult.fillError(error, check.id, check.title);
                        /*checkResult.level = checkResultLevel[checkResultLevel.error];
                        checkResult.loadingStatus = LoadingStatus.Success;
                        checkResult.status = convertLevelToHealthStatus(checkResultLevel.error)
                        checkResult.title = "faulted: " + checkResult.title;
                        checkResult.markdown = "```\r\n" + `message: ${error}\r\nstacktrace: ` + (error.stack || "none") + "\r\n```";
                        console.log(error);//*/
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

async function GetWebAppVnetInfo(siteArmId: string, armService) {
    //This is the regional VNet Integration endpoint
    var swiftUrl = siteArmId + "/config/virtualNetwork";
    var siteVnetInfo = await armService.getArmResourceAsync(swiftUrl);
    return siteVnetInfo;
}