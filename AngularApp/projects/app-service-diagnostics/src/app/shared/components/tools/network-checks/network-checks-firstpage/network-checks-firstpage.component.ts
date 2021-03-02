import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Site, SiteInfoMetaData } from '../../../../models/site';
import { SiteService } from '../../../../services/site.service';
import { ArmService } from '../../../../services/arm.service';

import { HealthStatus, LoadingStatus, TelemetryService } from 'diagnostic-data';

import { DiagProvider, OutboundType } from '../diag-provider';
import { Globals } from 'projects/app-service-diagnostics/src/app/globals';
import { CheckManager } from '../check-manager';
//import { MarkdownTextComponent } from 'projects/diagnostic-data/src/lib/components/markdown-text/markdown-text.component';


function delay(second: number): Promise<void> {
    return new Promise(resolve =>
        setTimeout(resolve, second * 1000));
}



@Component({
    templateUrl: 'network-checks-firstpage.component.html',
    styleUrls: ['../../styles/daasstyles.scss', './network-checks-firstpage.component.scss'],
    encapsulation: ViewEncapsulation.None,
    entryComponents: []
})

export class NetworkCheckFirstPageComponent implements OnInit {

    title: string = 'Network Checking Tool';
    description: string = 'Checking VNet integration status...';

    vnetIntegrationDetected = null;
    openFeedback = false;
    //checks: any[];

    constructor(private _siteService: SiteService, private _armService: ArmService, private _telemetryService: TelemetryService, private _globals:Globals) {

        var siteInfo = this._siteService.currentSiteMetaData.value;
        var fullSiteName = siteInfo.siteName + (siteInfo.slot == "" ? "" : "-" + siteInfo.slot);
        var siteInfoPlus = { ...this._siteService.currentSiteMetaData.value, ...this._siteService.currentSite.value, fullSiteName, siteVnetInfo:null };
        var diagProvider = new DiagProvider(siteInfoPlus, _armService);
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
            });
        CheckManager.loadRemoteCheckAsync(true);
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
}


