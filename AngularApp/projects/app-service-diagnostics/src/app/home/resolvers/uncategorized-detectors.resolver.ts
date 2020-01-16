import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { DetectorControlService } from 'diagnostic-data';
import { Observable, of } from 'rxjs';
import { DetectorCategorizationService } from '../../shared/services/detector-categorized.service';

@Injectable()
export class UncategorizedDetectorsResolver implements Resolve<Observable<boolean>> {
    constructor(private _detectorCategorization: DetectorCategorizationService) { }


    resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<boolean>{

        console.log("resolve url", activatedRouteSnapshot, activatedRouteSnapshot.parent);
        console.log("resolve url1", activatedRouteSnapshot.parent.url.filter(x => x.path !== 'new' && x.path !== 'categories').join('/'));
     //   return this._resourceService.registerResource(activatedRouteSnapshot.parent.url.filter(x => x.path !== 'new' && x.path !== 'categories').join('/'));
        return of(true);
    }
}
