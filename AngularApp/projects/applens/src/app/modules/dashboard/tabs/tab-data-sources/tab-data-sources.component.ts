import { Component, OnInit, Input } from '@angular/core';
import { DataProviderMetadata, DetectorResponse } from 'diagnostic-data';
import { ActivatedRoute, Params } from '@angular/router';
import { ApplensDiagnosticService } from '../../services/applens-diagnostic.service';
import { DetectorControlService } from 'diagnostic-data';

@Component({
  selector: 'tab-data-sources',
  templateUrl: './tab-data-sources.component.html',
  styleUrls: ['./tab-data-sources.component.scss']
})
export class TabDataSourcesComponent {

  constructor(private _route: ActivatedRoute, private _diagnosticApiService: ApplensDiagnosticService, private _detectorControlService: DetectorControlService) {
  }

  @Input() onboardingMode: boolean = false;
  @Input () detectorResponse: DetectorResponse;

  detector: string;
  error: any;
  loadingDetector: boolean = true;

  ngOnInit() {

    if (!this.onboardingMode) {
      this._route.params.subscribe((params: Params) => {
        this.getDetectorResponse();
      });

      this._route.queryParams.subscribe((queryParams: Params) => {
        this.getDetectorResponse();
      });
    }
    else{
      this.loadingDetector = false;
    }
  }

  getDetectorResponse() {
    this.detectorResponse = null;

    if (this._route.snapshot.params['detector']) {
      this.detector = this._route.snapshot.params['detector'];
    }
    else {
      this.detector = this._route.parent.snapshot.params['detector'];
    }
    let allRouteQueryParams = this._route.snapshot.queryParams;
    let additionalQueryString = '';
    let knownQueryParams = ['startTime', 'endTime'];
    Object.keys(allRouteQueryParams).forEach(key => {
      if(knownQueryParams.indexOf(key) < 0) {
          additionalQueryString += `&${key}=${encodeURIComponent(allRouteQueryParams[key])}`;
      }
    });
    this._diagnosticApiService.getDetector(this.detector, this._detectorControlService.startTimeString, this._detectorControlService.endTimeString, this._detectorControlService.shouldRefresh, this._detectorControlService.isInternalView, additionalQueryString)
      .subscribe((response: DetectorResponse) => {
        this.loadingDetector = false;
        this.detectorResponse = response;
      }, (error: any) => {
        this.error = error;
      });
  }
}
