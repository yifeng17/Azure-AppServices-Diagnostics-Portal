import { Component, OnInit, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplensDiagnosticService } from '../../services/applens-diagnostic.service';
import { DetectorListAnalysisComponent } from 'diagnostic-data';
import { DownTime } from 'diagnostic-data';

@Component({
  selector: 'tab-analysis',
  templateUrl: './tab-analysis.component.html',
  styleUrls: ['./tab-analysis.component.scss']
})

export class TabAnalysisComponent implements OnInit {

  analysisId: string;
  detectorId: string;
  detectorName: string;
  downTime: DownTime;

  @ViewChild('detectorListAnalysis') detectorListAnalysis: DetectorListAnalysisComponent

  constructor(private _activatedRoute: ActivatedRoute, private _diagnosticService: ApplensDiagnosticService) {
    this._activatedRoute.paramMap.subscribe(params => {
      this.analysisId = params.get('analysisId');
      this.detectorId = params.get('detector') === null ? "" : params.get('detector');
    });

  }

  ngOnInit() {
    this._diagnosticService.getDetectors().subscribe(detectorList => {
      if (detectorList) {
        if (this.detectorId !== "") {
          let currentDetector = detectorList.find(detector => detector.id == this.detectorId)
          this.detectorName = currentDetector.name;
        }
      }
    });
  }
  onActivate(event) {
    window.scroll(0, 0);
  }

  ondownTimeChanged(event: DownTime) {
    this.detectorListAnalysis.downTime = event;
  }
}
