import { Injectable } from '@angular/core';
import { Site } from '../../shared/models/site';
import { ServerFarm } from '../../shared/models/server-farm';
import { StartupInfo } from '../../shared/models/portal';
import { UriElementsService, AuthService, ArmService, RBACService } from '../../shared/services';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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

    private serverFarmBehaviorSubject: BehaviorSubject<ServerFarm> = new BehaviorSubject<ServerFarm>(null);

    constructor(private _armService: ArmService, private _uriElementsService: UriElementsService, private _authService: AuthService,
        private _rbacService: RBACService) {
        console.log("constructor");
        this._authService.getStartupInfo()
            .flatMap((startUpInfo: StartupInfo) => {
                console.log(startUpInfo);
                this.token = startUpInfo.token;
                this.siteResourceId = startUpInfo.resourceId;
                return this._armService.getArmResource(this.siteResourceId);
            })
            .flatMap((site: Site) => {
                this.currentSite = site;
                console.log(site);
                return this._rbacService.hasPermission(this.currentSite.properties.serverFarmId, [this._rbacService.readScope]);
            })
            .flatMap((hasPermission: boolean) => {
                this.hasReadAccessToServerFarm = hasPermission;
                if(!hasPermission){
                    console.log("No permission to App Service Plan");
                }
                return this._armService.getArmResource(this.currentSite.properties.serverFarmId);
            })
            .flatMap((serverFarm: ServerFarm) => {
                serverFarm = this.addAdditionalProperties(serverFarm);
                this.currentServerFarm = serverFarm;
                this.serverFarmBehaviorSubject.next(this.currentServerFarm);
                return this._armService.getArmResources(this.currentServerFarm.id + "/sites");
            })
            .subscribe((sites: Site[]) => {
                this.sitesInServerFarm = sites;
                console.log(sites);
            });
    }

    public getSiteInServerFarm(siteName: string) {
        return this.sitesInServerFarm.find(site => site.properties.name.toLowerCase() === siteName.toLowerCase());
    }

    public getSiteServerFarm() {
        return this.serverFarmBehaviorSubject;
    }

    private addAdditionalProperties(serverFarm: ServerFarm): ServerFarm {
        if (serverFarm) {
            let sizeId = serverFarm.sku.name.replace(serverFarm.sku.family, '');
            switch (sizeId) {
                case '1':
                    serverFarm.additionalProperties = {
                        cores: 1,
                        ramInGB: 1.75
                    }
                    break;
                case '2':
                    serverFarm.additionalProperties = {
                        cores: 2,
                        ramInGB: 3.5
                    }
                    break;
                case '3':
                    serverFarm.additionalProperties = {
                        cores: 4,
                        ramInGB: 7
                    }
                    break;
            }

            if (serverFarm.sku.family.toLowerCase() === 'p1') {
                serverFarm.additionalProperties.cores *= 2;
                serverFarm.additionalProperties.ramInGB *=2;
            }
        }

        return serverFarm;
    }
}