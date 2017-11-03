import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { ArmService, AuthService, UriElementsService, ServerFarmDataService } from '../services';
import { Observable } from 'rxjs/Observable';
import { StartupInfo } from '../models/portal';
import { Site } from '../models/site'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class SiteService {

    public currentSite: Site;

    private siteBehaviorSubject: BehaviorSubject<Site> = new BehaviorSubject<Site>(null);

    constructor(private _armClient: ArmService, private _authService: AuthService, private _http: Http, private _uriElementsService: UriElementsService, private _serverFarmService: ServerFarmDataService) {
        this._authService.getStartupInfo().flatMap((startUpInfo: StartupInfo) => {
            return this._armClient.getArmResource(startUpInfo.resourceId);
        }).subscribe((site: Site) => {
            this.currentSite = site;
            this.siteBehaviorSubject.next(this.currentSite);
        });
    }

    public getCurrentSite(): BehaviorSubject<Site> {
        return this.siteBehaviorSubject;
    }

    // I am making the assumption that two sites on the same server farm must be in the same sub 
    // but they don't necessarily have to be in the same resource group
    private findTargetedSite(siteName: string): Site {
        if (this.currentSite.properties.name.toLowerCase() != siteName.toLowerCase()) {
            return this._serverFarmService.getSiteInServerFarm(siteName);
        }
        return this.currentSite;
    }

    restartSite(subscriptionId: string, resourceGroup: string, siteName: string): Observable<boolean> {
        let targetedSite = this.findTargetedSite(siteName);

        var slotName = '';
        var mainSiteName = targetedSite.properties.name;

        if (targetedSite.properties.name.indexOf('(') >= 0) {
            let parts = targetedSite.properties.name.split('(');
            mainSiteName = parts[0];
            slotName = parts[1].replace(')', '');
        }

        let resourceUri: string = this._uriElementsService.getSiteRestartUrl(subscriptionId, targetedSite.properties.resourceGroup, mainSiteName, slotName);
        return this._armClient.postResource(resourceUri, null);
    }

    killW3wpOnInstance(subscriptionId: string, resourceGroup: string, siteName: string, scmHostName: string, instanceId: string): Observable<boolean> {
        let targetedSite = this.findTargetedSite(siteName);
        if (targetedSite.properties.enabledHostNames.length > 0) {
            let scmHostNameFromSiteObject = targetedSite.properties.enabledHostNames.find(hostname => hostname.indexOf(".scm.") > 0);
            if (scmHostNameFromSiteObject !== null && scmHostNameFromSiteObject.length > 0) {
                scmHostName = scmHostNameFromSiteObject;
            }
        }

        let url: string = this._uriElementsService.getKillSiteProcessUrl(subscriptionId, targetedSite.properties.resourceGroup, targetedSite.properties.name);
        let body: any = {
            "InstanceId": instanceId,
            "ScmHostName": scmHostName
        };

        let requestHeaders: Headers = this._getHeaders();

        return this._http.post(url, body, { headers: requestHeaders })
            .map((response: Response) => response.ok);
    }

    private _getHeaders(): Headers {

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', `Bearer ${this._authService.getAuthToken()}`);

        return headers;
    }
}