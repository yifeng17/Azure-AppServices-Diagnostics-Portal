import { Injectable } from '@angular/core';
import { Site } from '../../shared/models/site';
import { ServerFarm } from '../../shared/models/server-farm';
import { StartupInfo } from '../../shared/models/portal';
import { UriElementsService, PortalService, ArmService, RBACService } from '../../shared/services';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class ServerFarmDataService {
    private token: string;
    private siteResourceId: string;

    private currentSite: Site;
    private currentServerFarm: ServerFarm;
    public hasReadAccessToServerFarm: boolean;
    private sitesInServerFarm: Site[];

    constructor(private _armService: ArmService, private _uriElementsService: UriElementsService, private _portalService: PortalService,
                private _rbacService: RBACService) {
        this._portalService.getStartupInfo()
        .flatMap((startUpInfo: StartupInfo) => {
            this.token = startUpInfo.token;
            this.siteResourceId = startUpInfo.resourceId;
            return this._armService.getArmResource(this.siteResourceId);
        })
        .flatMap((site: Site) => {
            this.currentSite = site;
            return this._rbacService.hasPermission(this.currentSite.properties.serverFarmId, [this._rbacService.readScope]);
        })
        .flatMap((hasPermission: boolean) => {
            this.hasReadAccessToServerFarm = hasPermission;
            return this._armService.getArmResource(this.currentSite.properties.serverFarmId);
        })
        .flatMap((serverFarm: ServerFarm) => {
            this.currentServerFarm = serverFarm;
            return this._armService.getArmResources(this.currentServerFarm.id + "/sites");
        })
        .subscribe((sites: Site[]) => {
            this.sitesInServerFarm = sites;
        });
    }

    public getSiteInServerFarm(siteName: string){
        return this.sitesInServerFarm.find(site => site.properties.name === siteName);
    }
}