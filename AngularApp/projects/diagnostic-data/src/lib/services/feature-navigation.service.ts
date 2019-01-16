import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Injectable } from '@angular/core';

Injectable()
export class FeatureNavigationService {

  detectorParent: ActivatedRoute;

  constructor(private _router: Router) { }

  public set DetectorParent(route: ActivatedRoute) {
    this.detectorParent = route;
  }

  public NavigateToDetector(detector: string) {
    this._router.navigate([`./detectors/${detector}`], <NavigationExtras>{ relativeTo: this.detectorParent });
  }
}
