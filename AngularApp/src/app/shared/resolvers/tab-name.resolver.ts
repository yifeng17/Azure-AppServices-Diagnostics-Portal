import { Injectable } from "@angular/core";
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";
import { GenericApiService } from "../services/generic-api.service";

@Injectable()
export class TabTitleResolver implements Resolve<string>{
  constructor(private _genericApiService: GenericApiService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): string {
    if (!route.data['navigationTitle']) {
        let detectorId = route.params['detectorName'];
        return this._genericApiService.getDetectorById(detectorId).name;
    }
    
    return '';
  }
}