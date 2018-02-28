import { Component, Input, OnInit } from '@angular/core';
import { Session } from '../../models/daas';
import { WindowService, ServerFarmDataService } from '../../services/index';

@Component({
    selector: 'daas-sessions',
    templateUrl: 'daas-sessions.component.html',
    styleUrls: ['daas-sessions.component.css']
})

export class DaasSessionsComponent {

    @Input() public checkingExistingSessions: boolean;
    @Input() public Sessions: Session[];
    @Input() public SessionType: string;

    @Input() public scmPath: string;

    DiagnoserHeading:string;
    supportedTier:boolean = false;

    constructor(private _windowService: WindowService, private _serverFarmService: ServerFarmDataService) {
        this._serverFarmService.siteServerFarm.subscribe(serverFarm => {
            if (serverFarm) {
                if (serverFarm.sku.tier === "Standard" || serverFarm.sku.tier === "Basic"  || serverFarm.sku.tier === "Premium")
                {
                    this.supportedTier = true;
                }
            }
        }, error => {
        //TODO: handle error
        })
        
    }

    ngOnInit(): void {

        if (this.SessionType.startsWith("CLR Profiler"))
        {
            this.DiagnoserHeading = "profiling sessions";
        }
        else if (this.SessionType === "Memory Dump")
        {
            this.DiagnoserHeading = "dumps collected";
        }
        else
        {
            this.DiagnoserHeading = "diagnostic sessions";
        }
    }

    getInstanceNameFromReport(reportName: string): string {

        if (!this.SessionType.startsWith("CLR Profiler"))
        {
            return reportName;
        }

        var reportNameArray = reportName.split("_");
        if (reportNameArray.length > 0) {
            return reportNameArray[0];
        }
        else {
            return reportName;
        }
    }

    openReport(url: string) {
        this._windowService.open(`https://${this.scmPath}/api/vfs/data/DaaS/${url}`);
    }
}