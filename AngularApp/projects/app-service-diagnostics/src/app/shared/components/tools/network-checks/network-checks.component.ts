import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { SiteDaasInfo } from '../../../models/solution-metadata';
import { Session } from '../../../models/daas';
import { SiteInfoMetaData } from '../../../models/site';
import { SiteService } from '../../../services/site.service';
import { DaasService } from '../../../services/daas.service';
import { WindowService } from '../../../../startup/services/window.service';
import { AvailabilityLoggingService } from '../../../services/logging/availability.logging.service';
import { ArmService } from '../../../services/arm.service';
import {sampleJsCheck} from './test-check.js'

function Delay(x: number): Promise<void>{
    return new Promise(resolve => 
        setTimeout(resolve, x));
}

async function sampleCheck(appSettings: Map<string, string>, armService: ArmService): Promise<[number, string]>{
    console.log("appSettings", appSettings);
    var s = Object.keys(appSettings).map(key => key + ":" + appSettings[key]);
    return [0, s.join(";")];
}

@Component({
    templateUrl: 'network-checks.component.html',
    styleUrls: ['../styles/daasstyles.scss']
})
export class NetworkCheckComponent implements OnInit {

    title: string = 'Run Network Checks';
    description: string = 'Run network checks';

    thingsToKnowBefore: string[] = [
        'Once the profiler trace is started, reproduce the issue by browsing to the web app.',
        'The profiler trace will automatically stop after 60 seconds.',
        'If thread report option is enabled, then raw stack traces of threads inside the process will be collected as well.',
        'With thread report option, your App may be paused for a few seconds till all the threads are dumped.',
        'Your web app will not be restarted as a result of running the profiler.',
        'A profiler trace will help to identify issues in an ASP.NET or ASP.NET Core application.',
    ];

    checkResults: {name:string, level:number, info:string}[] = [];

    siteToBeDiagnosed: SiteDaasInfo;
    scmPath: string;
    couldNotFindSite: boolean = false;

    refreshSessions: boolean = false;
    checks: any[];

    constructor(private _siteService: SiteService,private _armService: ArmService, private _windowService: WindowService, private _logger: AvailabilityLoggingService) {

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
        this.checks = [sampleCheck, sampleJsCheck];
        var castedWindow:any = window;
        debugger;
        if(castedWindow.hasOwnProperty("checks") && castedWindow.checks!=null){
            this.checks = this.checks.concat(castedWindow.checks);
        }
    }

    async runChecksAsync():Promise<void>{
        var siteInfo = this._siteService.currentSiteMetaData.value;
        var appSettings = (await this._siteService.getSiteAppSettings(siteInfo.subscriptionId, siteInfo.resourceGroupName, siteInfo.siteName, siteInfo.slot).toPromise()).properties;
        debugger;
        var i = 0;
        await Promise.all(this.checks.map(async check => {
            try{
                var result = await check(appSettings, this._armService);
                this.thingsToKnowBefore[i++] = result[1];
                this.checkResults.push({name: check.name, level:result[0], info:result[1]});
            }
            catch(error){
                console.log("error:", error);
                debugger;
            }
        }));
        console.log("check results" ,this.checkResults);
    }
}
