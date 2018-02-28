import { Component, Input, OnInit } from '@angular/core';
import { SiteDaasInfo } from '../../../models/solution-metadata';
import { Session } from '../../../models/daas';
import { SiteService, DaasService, WindowService, AvailabilityLoggingService } from '../../../services';
import { SiteInfoMetaData } from '../../../models/site';
import { DaasBaseComponent } from '../daas-base/daas-base.component';

@Component({
    templateUrl: 'php-logsanalyzer-tool.component.html',
    styleUrls: ['../styles/daasstyles.css']
})
export class PhpLogsAnalyzerToolComponent extends DaasBaseComponent implements OnInit {

    title: string = "Collect and Analyze PHP error logs";
    description: string = "This tool analyzes PHP logs for your App and generates a report filtering out errors and warnings.";
    
    thingsToKnowBefore: string[] = [        
        "It will only work if PHP Logging is enabled for your Web App.",
        "Your Web App will not be restarted while running this tool."

    ]
    
    constructor(private _siteServiceLocal: SiteService, private _daasServiceLocal: DaasService, private _windowServiceLocal: WindowService, private _loggerLocal: AvailabilityLoggingService)
    {
        super(_siteServiceLocal, _daasServiceLocal, _windowServiceLocal, _loggerLocal);
    }
    ngOnInit(): void {

        this.DiagnoserName = "PHP Error Logs";
        this.scmPath = this._siteServiceLocal.currentSiteStatic.enabledHostNames.find(hostname => hostname.indexOf('.scm.') > 0);

    }

    
}