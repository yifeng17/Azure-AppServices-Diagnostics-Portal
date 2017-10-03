// import { SiteRestartData } from './../models/scfixit-solutions';
import { Injectable } from '@angular/core';
import { ArmService, PortalService, AuthService, WindowService } from './';
import { Site, SiteRestartData } from '../models/site';
import { Verbs } from '../models/portal';
import {Observable, Subscription as RxSubscription, Subject, ReplaySubject} from 'rxjs/Rx';
import { LogEntryLevel, StartupInfo, SupportBladeDefinition } from '../models/portal';
import { SiteConfig } from '../models/site-config';

@Injectable()
export class PortalActionService {
    public apiVersion = "2016-08-01";

    public currentSite: Site;

    constructor(private _windowService: WindowService, private _portalService: PortalService, private _armService: ArmService,
         private _authService: AuthService) {
            this._authService.getStartupInfo().flatMap((startUpInfo: StartupInfo) => {
            return this._armService.getArmResource(startUpInfo.resourceId);
        }).subscribe((site: Site) => {
            this.currentSite = site; 
        });
    }

    public openBladeScaleUpBlade(site?: Site) {
        site = site ? site : this.currentSite;
        
        let bladeInfo = {
            detailBlade: "scaleup",
            detailBladeInputs: {}
        };
        this._portalService.postMessage(Verbs.openScaleUpBlade, JSON.stringify(bladeInfo));
    }

    public openBladeScaleOutBlade(site?: Site) {
        site = site ? site : this.currentSite;

        var scaleOutInputs = {
            WebHostingPlanId: site.properties.serverFarmId,
            resourceId: site.properties.serverFarmId,
            apiVersion: "2015-08-01",
            options: <any>null
        };

        let bladeInfo = {
            detailBlade: "ScaleSettingBlade",
            extension: "Microsoft_Azure_Insights",
            detailBladeInputs: scaleOutInputs
        };

        this._portalService.openBlade(bladeInfo, "troubleshoot");
    }

    public openAppInsightsBlade(site?: Site) {
        site = site ? site : this.currentSite;
        
        let bladeInfo = {
            detailBlade: "AppServicesEnablementBlade",
            extension: "AppInsightsExtension",
            detailBladeInputs: {
                resourceUri: site.id,
                linkedComponent: <any>null
            }
        };

        this._portalService.openBlade(bladeInfo, "troubleshoot");
    }

    public openSupportIFrame(supportBlade: SupportBladeDefinition, site?: Site) {
        site = site ? site : this.currentSite;
        
        let bladeInfo = {
            detailBlade: "SupportIFrame",
            detailBladeInputs: this._getSupportSiteInput(site, supportBlade.Identifier, supportBlade.Title)
        };

        this._portalService.openBlade(bladeInfo, "troubleshoot");
    }

    public openPHPDebuggingBlade() {
        let resourceUriSplit = this.currentSite.id.split("/");
        
        let bladeInfo = {
            detailBlade: "ZendZRayBlade",
            detailBladeInputs: {
                WebsiteId: this.getWebsiteId(resourceUriSplit[2], resourceUriSplit[4], resourceUriSplit[8]),
            }
        };

        this._portalService.openBlade(bladeInfo, "troubleshoot");
    }

    public openTifoilSecurityBlade() {
        let resourceUriSplit = this.currentSite.id.split("/");
        
        let bladeInfo = {
            detailBlade: "TinfoilSecurityBlade",
            detailBladeInputs: {
                WebsiteId: this.getWebsiteId(resourceUriSplit[2], resourceUriSplit[4], resourceUriSplit[8]),
            }
        };

        this._portalService.openBlade(bladeInfo, "troubleshoot");
    }

    public openBladeAdvancedAppRestartBladeForCurrentSite() {
        this.openBladeAdvancedAppRestartBlade([{ resourceUri: this.currentSite.id, siteName: this.currentSite.name }], []);
    }

    public openBladeAdvancedAppRestartBlade(sitesToGet: SiteRestartData[], instancesToRestart: string[], site?: Site) {
        site = site ? site : this.currentSite;
        
        let resourceUris = [];
        for (var i = 0; i < sitesToGet.length; i++) {
            resourceUris.push(sitesToGet[i].resourceUri);;
        }

        let bladeInfo = {
            detailBlade: "AdvancedAppRestartBlade",
            detailBladeInputs: {
                resourceUri: site.id,
                resourceUris: resourceUris,
                preselectedInstances: instancesToRestart
            }
        };

        this._portalService.openBlade(bladeInfo, "troubleshoot");
    }

    private getWebsiteId(subscriptionId: string, resourceGroup: string, siteName: string): any{
        return {
            Name : siteName,
            SubscriptionId : subscriptionId,
            ResourceGroup : resourceGroup
        }
    }

    // TODO: This is probably not the correct home for this
    public openAutoHealSite(site?: Site) {
        site = site ? site : this.currentSite;
        let url = "https://mawssupport.trafficmanager.net/?sitename=" + site.name + "&tab=mitigate&source=ibiza";
        this._windowService.window.open(url);
    }

    private _getSupportSiteInput(site: Site, feature: string, title: string) {
        return {
            ResourceId: site.id,
            source: "troubleshoot",
            title: title,
            feature: feature
        };
    }
}