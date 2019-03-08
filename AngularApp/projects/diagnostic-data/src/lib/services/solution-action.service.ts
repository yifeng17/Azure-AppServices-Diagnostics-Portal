import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SolutionActionService {

    constructor() { }

    openScaleOutBlade() {
        return null;
    }

    openBladeScaleUpBlade() {
        return null;
    }

    restartSiteFromUri(resourceUri: string): Observable<HttpResponse<any>> {
        return null;
    }

    updateSettingsFromUri(resourceUri: string, body: any): Observable<any> {
        return null;
    }

}
