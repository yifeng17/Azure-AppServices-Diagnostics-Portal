import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticSiteService {

    parseResourceUri(resourceUri: string): any {
        return null;
    }

    restartSite(subscriptionId: string, resourceGroup: string,
            siteName: string): Observable<boolean> {
        return null;
    }

    restartSiteFromUri(resourceUri: string): Observable<boolean> {
        console.log("Fake site restart called")
        return null;
    }

    killW3wpOnInstance(subscriptionId: string, resourceGroup: string, siteName: string,
            scmHostName: string, instanceId: string): Observable<boolean> {
        return null;
    }

    getSiteAppSettings(subscriptionId: string, resourceGroup: string, siteName: string,
            slot: string = ''): Observable<any> {
        return null;
    }

    getVirtualNetworkConnectionsInformation(subscriptionId: string, resourceGroup: string,
            siteName: string, slot: string = ''): Observable<any> {
        return null;
    }

    updateSiteAppSettings(subscriptionId: string, resourceGroup: string, siteName: string,
            slot: string = '', body: any): Observable<any> {
        return null;
    }

}
