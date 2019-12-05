import { Component, OnInit, Input } from '@angular/core';
import { GenericDetectorComponent } from '../generic-detector/generic-detector.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceService } from '../../../shared-v2/services/resource.service';
import { FeatureNavigationService, TelemetryService, DiagnosticService } from 'diagnostic-data';
import { AuthService } from '../../../startup/services/auth.service';
import { SearchAnalysisMode } from 'projects/diagnostic-data/src/lib/models/search-mode';

@Component({
  selector: 'generic-analysis',
  templateUrl: './generic-analysis.component.html',
  styleUrls: ['./generic-analysis.component.scss']
})
export class GenericAnalysisComponent extends GenericDetectorComponent implements OnInit {
  @Input() analysisId: string = "";
  @Input() searchTerm: string = "";
  @Input() searchMode: SearchAnalysisMode = SearchAnalysisMode.CaseSubmission;
  detectorId: string = "";
  detectorName: string = "";
  @Input() showSearchBar: boolean = undefined;
  displayDetectorContainer: boolean = true;
  searchBarFocus: boolean = false;

  constructor(private _activatedRouteLocal: ActivatedRoute, private _diagnosticServiceLocal: DiagnosticService, _resourceService: ResourceService, _authServiceInstance: AuthService, _telemetryService: TelemetryService,
    _navigator: FeatureNavigationService, private _routerLocal: Router) {
    super(_activatedRouteLocal, _diagnosticServiceLocal, _resourceService, _authServiceInstance, _telemetryService, _navigator, _routerLocal);
  }

  ngOnInit() {
    this._activatedRouteLocal.paramMap.subscribe(params => {
      this.analysisId = this.analysisId === "" ? params.get('analysisId'): this.analysisId;
      this.detectorId = params.get('detectorName') === null ? "" : params.get('detectorName');
      this._activatedRouteLocal.queryParamMap.subscribe(qParams => {
        this.searchTerm = qParams.get('searchTerm') === null ? this.searchTerm : qParams.get('searchTerm');
        if (this.analysisId=== "searchResultsAnalysis" && this.searchTerm && this.searchTerm.length>0){
            this.showSearchBar = this.searchMode === SearchAnalysisMode.CaseSubmission ? true : this.showSearchBar;
            this.displayDetectorContainer = false;
        }
        else
        {
            this.showSearchBar = false;
        }

        console.log("In general Analysis, analysisId and searchTerm", this.analysisId, this.searchTerm);

        this._diagnosticServiceLocal.getDetectors().subscribe(detectorList => {
          if (detectorList) {
            console.log("In general Analysis, detectorlist and detectorid", detectorList, this.detectorId);
            if (this.detectorId !== "") {
              let currentDetector = detectorList.find(detector => detector.id == this.detectorId)
              this.detectorName = currentDetector.name;
            }
          }
        });
      });
    });
  }

  triggerSearch(){
    if (this.searchTerm && this.searchTerm.length>1) {
      this.searchBarFocus = false;
      var searchBar = document.getElementById('caseSubmissionFlowSearchBar');
      searchBar.blur();
      this._routerLocal.navigate([`../../${this.analysisId}/search`], { relativeTo: this._activatedRouteLocal, queryParamsHandling: 'merge', queryParams: {searchTerm: this.searchTerm} });
    }
  }

  focusSearch(){
    var searchBar = document.getElementById('caseSubmissionFlowSearchBar');
    searchBar.focus();
    this.searchBarFocus = true;
  }

  goBackToAnalysis() {
    if (this.analysisId=== "searchResultsAnalysis" && this.searchTerm){
      this._routerLocal.navigate([`../../../../${this.analysisId}/search`], { relativeTo: this._activatedRouteLocal, queryParamsHandling: 'merge', queryParams: {searchTerm: this.searchTerm} });
    }
    else{
      this._routerLocal.navigate([`../../../${this.analysisId}`], { relativeTo: this._activatedRouteLocal, queryParamsHandling: 'merge' });
    }
  }
}
