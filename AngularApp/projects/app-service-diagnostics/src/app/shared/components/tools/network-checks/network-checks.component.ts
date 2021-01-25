import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { SiteDaasInfo } from '../../../models/solution-metadata';
import { Session } from '../../../models/daas';
import { SiteInfoMetaData } from '../../../models/site';
import { SiteService } from '../../../services/site.service';
import { DaasService } from '../../../services/daas.service';
import { WindowService } from '../../../../startup/services/window.service';
import { AvailabilityLoggingService } from '../../../services/logging/availability.logging.service';
import { ArmService } from '../../../services/arm.service';

function Delay(x: number): Promise<void>{
    return new Promise(resolve => 
        setTimeout(resolve, x));
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

    siteToBeDiagnosed: SiteDaasInfo;
    scmPath: string;
    couldNotFindSite: boolean = false;

    refreshSessions: boolean = false;

    constructor(private _siteService: SiteService,private _armService: ArmService, private _windowService: WindowService, private _logger: AvailabilityLoggingService) {

        this._siteService.getSiteDaasInfoFromSiteMetadata().subscribe(site => {
            this.siteToBeDiagnosed = site;
        });
    }

    ngOnInit(): void {

        this.scmPath = this._siteService.currentSiteStatic.enabledHostNames.find(hostname => hostname.indexOf('.scm.') > 0);
        this._siteService.getSiteAppSettings("8ee49137-b1a2-4c6f-9e7f-6fe62eaa238a", "jmvg", "jmvg", "").toPromise().then(val=>{
            debugger;
            this.thingsToKnowBefore = Object.keys(val.properties).map(key => key + ":" + val.properties[key]);
        });
        debugger;
        this._armService.postResource("/subscriptions/8ee49137-b1a2-4c6f-9e7f-6fe62eaa238a/resourceGroups/JMVG/providers/Microsoft.Web/sites/JMVG/config/appsettings/list")
            .toPromise().then(val => console.log("getArmResource", val));
    }

    updateSessions(event) {
        this.refreshSessions = event;
    }
}
