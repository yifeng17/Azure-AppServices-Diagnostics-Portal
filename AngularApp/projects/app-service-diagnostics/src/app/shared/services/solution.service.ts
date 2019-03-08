import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SiteService } from './site.service';
import { PortalActionService } from './portal-action.service';
import { PortalService } from '../../startup/services/portal.service';

@Injectable({
    providedIn: 'root'
})
export class SolutionService {

    constructor(private siteService: SiteService, private portalNavService: PortalActionService,
        private portalService: PortalService) { }

    openScaleOutBlade() {
        return this.portalNavService.openBladeScaleOutBlade();
    }

    openScaleUpBlade() {
        return this.portalNavService.openBladeScaleUpBlade();
    }

    restartSiteFromUri(resourceUri: string): Observable<HttpResponse<any>> {
        return this.siteService.restartSiteFromUri(resourceUri);
    }

    updateSettingsFromUri(resourceUri: string, body: any): Observable<any> {
        return this.siteService.updateSettingsFromUri(resourceUri, body);
    }

}
