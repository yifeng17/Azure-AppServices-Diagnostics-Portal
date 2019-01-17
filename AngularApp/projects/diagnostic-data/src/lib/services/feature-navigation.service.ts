import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Injectable } from '@angular/core';

Injectable()
export class FeatureNavigationService {

  detectorParent: ActivatedRoute;

  constructor() { }

  public set DetectorParent(route: ActivatedRoute) {
    this.detectorParent = route;
  }

  public NavigateToDetector(router: Router, detector: string) {
    router.navigate([`./detectors/${detector}`], <NavigationExtras>{ relativeTo: this.detectorParent });
  }
}
