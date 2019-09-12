import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DiagnosticService } from '../../services/diagnostic.service';
import { DetectorControlService } from '../../services/detector-control.service';
import { ActivatedRoute } from '@angular/router';
import { DetectorResponse, RenderingType, DownTime } from '../../models/detector';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'detector-container',
  templateUrl: './detector-container.component.html',
  styleUrls: ['./detector-container.component.scss']
})
export class DetectorContainerComponent implements OnInit {

  detectorResponse: DetectorResponse = null;
  error: any;
  hideDetectorControl: boolean = false;

  detectorName: string;

  @Input() detectorSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  @Input() set detector(detector: string) {
    this.detectorSubject.next(detector);
  }

  @Input() analysisMode: boolean = false;
  @Input() isAnalysisView: boolean = false;
  @Output() downTimeChanged: EventEmitter<DownTime> = new EventEmitter<DownTime>();

  constructor(private _route: ActivatedRoute, private _diagnosticService: DiagnosticService,
    public detectorControlService: DetectorControlService) { }

  ngOnInit() {
    this.detectorControlService.update.subscribe(isValidUpdate => {
      if (isValidUpdate && this.detectorName) {
        this.refresh();
      }
    });

    this.detectorSubject.subscribe(detector => {
      if (detector) {
        this.detectorName = detector;
        this.refresh();
      }
    });
  }

  refresh() {
    this.error = null;
    this.detectorResponse = null;
    this.getDetectorResponse();
  }

  getDetectorResponse() {
    let startTime = this.detectorControlService.startTimeString;
    let endTime = this.detectorControlService.endTimeString;

    if (this.analysisMode) {

      this._route.queryParams.subscribe(params => {
        var startTimeChildDetector: string = params['startTimeChildDetector'];
        var endTimeChildDetector: string = params['endTimeChildDetector'];

        this._diagnosticService.getDetector(this.detectorName, startTimeChildDetector, endTimeChildDetector,
          this.detectorControlService.shouldRefresh, this.detectorControlService.isInternalView)
          .subscribe((response: DetectorResponse) => {
            this.shouldHideTimePicker(response);
            this.detectorResponse = response;
          }, (error: any) => {
            this.error = error;
          });
      });

    } else {
      this._diagnosticService.getDetector(this.detectorName, startTime, endTime,
        this.detectorControlService.shouldRefresh, this.detectorControlService.isInternalView)
        .subscribe((response: DetectorResponse) => {
          this.shouldHideTimePicker(response);
          this.detectorResponse = response;
        }, (error: any) => {
          this.error = error;
        });
    }

  }
  // TODO: Right now this is hardcoded to hide for cards, but make this configurable from backend
  shouldHideTimePicker(response: DetectorResponse) {
    if (response && response.dataset && response.dataset.length > 0) {
      const cardRenderingIndex = response.dataset.findIndex(data => data.renderingProperties.type == RenderingType.Cards);
      this.hideDetectorControl = cardRenderingIndex >= 0;
    }
  }

  ondownTimeChanged(event: DownTime) {
    this.downTimeChanged.emit(event);
  }

}
