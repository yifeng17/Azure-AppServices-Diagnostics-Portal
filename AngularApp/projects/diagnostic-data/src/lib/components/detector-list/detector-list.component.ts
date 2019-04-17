import { forkJoin as observableForkJoin, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { catchError } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Pipe, PipeTransform, Output, EventEmitter } from '@angular/core';
import {
  DetectorListRendering, DetectorMetaData, DetectorResponse, DiagnosticData, HealthStatus, RenderingType
} from '../../models/detector';
import { LoadingStatus } from '../../models/loading';
import { StatusStyles } from '../../models/styles';
import { DetectorControlService } from '../../services/detector-control.service';
import { DiagnosticService } from '../../services/diagnostic.service';
import { TelemetryEventNames } from '../../services/telemetry/telemetry.common';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';

@Component({
  selector: 'detector-list',
  templateUrl: './detector-list.component.html',
  styleUrls: ['./detector-list.component.scss'],
  animations: [
    trigger('expand', [
      state('shown', style({ height: '*' })),
      state('hidden', style({ height: '0px' })),
      transition('* => *', animate('.25s'))
    ])
  ]
})
export class DetectorListComponent extends DataRenderBaseComponent {
  @Output() onLoadingComplete = new EventEmitter<boolean>();

  LoadingStatus = LoadingStatus;
  renderingProperties: DetectorListRendering;
  detectorMetaData: DetectorMetaData[];
  detectorViewModels: any[];
  childDetectorCount: any = 0;
  detectorListStatus: any = HealthStatus.None;
  DetectorStatus = HealthStatus;
  errorDetectors: any[] = [];
  private childDetectorsEventProperties = {};

  constructor(private _diagnosticService: DiagnosticService, protected telemetryService: TelemetryService,
    private _detectorControl: DetectorControlService) {
    super(telemetryService);
  }

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = <DetectorListRendering>data.renderingProperties;
    this.getDetectorResponses();
  }

  private getDetectorResponses() {

    this._diagnosticService.getDetectors().subscribe(detectors => {
      this.detectorMetaData = detectors.filter(detector => this.renderingProperties.detectorIds.indexOf(detector.id) >= 0);
      this.detectorViewModels = this.detectorMetaData.map(detector => this.getDetectorViewModel(detector));

      const requests: Observable<any>[] = [];
      this.detectorViewModels.forEach((metaData, index) => {
        requests.push((<Observable<DetectorResponse>>metaData.request).pipe(
          map((response: DetectorResponse) => {
            this.detectorViewModels[index] = this.updateDetectorViewModelSuccess(metaData, response);
            return {
              'ChildDetectorName': this.detectorViewModels[index].title,
              'ChildDetectorId': this.detectorViewModels[index].metadata.id,
              'ChildDetectorStatus': this.detectorViewModels[index].status,
              'ChildDetectorLoadingStatus': this.detectorViewModels[index].loadingStatus
            };
          })
          , catchError(err => {
            this.detectorViewModels[index].loadingStatus = LoadingStatus.Failed;
            return throwError(err);
          })
        ));
      });

      // Log all the children detectors
      observableForkJoin(requests).subscribe(childDetectorData => {
        // console.log("***** Child detectors forkjoin***********");
        // console.log(childDetectorData);

        // for (var childDetector in childDetectorData) {
        //   console.log("hhhh Tried to update parent detector status");
        //   // this.status = childDetector.ChildDetectorStatus < this.status ? childDetector.ChildDetectorStatus : this.status;
        //   // console.log(childDetector);
        //   // console.log(childDetector.ChildDetectorStatus);
        //   // console.log(this.status);
        //   console.log("hhhh Finished");
        // }

        this.childDetectorsEventProperties['ChildDetectorsList'] = JSON.stringify(childDetectorData);
        this.logEvent(TelemetryEventNames.ChildDetectorsSummary, this.childDetectorsEventProperties);
      });
    });
  }

  public retryRequest(metaData: any) {
    metaData.loadingStatus = LoadingStatus.Loading;
    metaData.request.subscribe(
      (response: DetectorResponse) => {
        metaData = this.updateDetectorViewModelSuccess(metaData, response);
      },
      (error) => {
        metaData.loadingStatus = LoadingStatus.Failed;
      });
  }

  private getDetectorViewModel(detector: DetectorMetaData) {
    return {
      title: detector.name,
      metadata: detector,
      loadingStatus: LoadingStatus.Loading,
      status: null,
      statusColor: null,
      statusIcon: null,
      isParentDetector: true,
      expanded: false,
      response: null,
      request: this._diagnosticService.getDetector(detector.id, this._detectorControl.startTimeString, this._detectorControl.endTimeString)
    };
  }

  // private getNestedDetectorListStatus(status: any, res: DetectorResponse)
  // {
  //   status = res.status.statusId < status ? res.status.statusId: status;
  //   if (res.dataset && status > 1)
  //   {
  //     res.dataset.forEach(dataset => {
  //       if (dataset.renderingProperties && dataset.renderingProperties.type === RenderingType.DetectorList) {
  //         let rendering : DetectorListRendering = <DetectorListRendering>dataset.renderingProperties;
  //         let parentStatus: any = 4;

  //         for (var detectorId in rendering.detectorIds)
  //         {
  //           const requests: Observable<any>[] = [];
  //           rendering.detectorIds.forEach((detectorId) => {
  //             let request = this._diagnosticService.getDetector(detectorId, this._detectorControl.startTimeString, this._detectorControl.endTimeString);
  //             requests.push((<Observable<DetectorResponse>>request).pipe(
  //               map((response: DetectorResponse) => {
  //                 let responseStatus = response.status.statusId;
  //                 status = responseStatus < status ? responseStatus: status;
  //                 if (status == 1)
  //                 {
  //                   return;
  //                 }
  //                 else if (response.dataset)       
  //               })
  //               , catchError(err => {
  //                 return throwError(err);
  //               })
  //             ));
  //           });
  //         }
  //       }
  //       return;
  //     });
  //   }
  // }

  private setStatus(detectorId: any, status: any) {
    this.detectorListStatus = status < this.detectorListStatus ? status : this.detectorListStatus;
    this.childDetectorCount++;
    if (this.childDetectorCount == this.renderingProperties.detectorIds.length) {
      this.dataStatus.emit(this.detectorListStatus);
      console.log(`${detectorId} emit status: ${status}`);
      console.log(`Child detector count: ${this.childDetectorCount}`);
    }
  }

  private updateDetectorViewModelSuccess(viewModel: any, res: DetectorResponse) {
    const status = res.status.statusId;

    viewModel.loadingStatus = LoadingStatus.Success;

    if (!res.dataset.find(dataset => dataset.renderingProperties.type === RenderingType.DetectorList)) {
      viewModel.isParentDetector = false;
      viewModel.status = status;
      viewModel.statusColor = StatusStyles.getColorByStatus(status);
      viewModel.statusIcon = StatusStyles.getIconByStatus(status);
      viewModel.response = res;
      return viewModel;
    }
    else
    {
      viewModel.status = this.dataStatus;
      viewModel.statusColor = StatusStyles.getColorByStatus(status);
      viewModel.statusIcon = StatusStyles.getIconByStatus(status);
      viewModel.response = res;
      console.log(`As a parent, set status to be sum of child status: ${this.dataStatus}`);
      console.log(this.dataStatus);
      return viewModel;
    }

    if (res.dataset && res.status.statusId > 0) {

      if (res.status.statusId > 0)
      {
        console.log(`Get Status for detectorlist: ${res.metadata.id}`);
        res.dataset.forEach(dataset => {
          if (dataset.renderingProperties && dataset.renderingProperties.type === RenderingType.DetectorList) {
            let rendering: DetectorListRendering = <DetectorListRendering>dataset.renderingProperties;
            let parentStatus: any = 4;
            viewModel.loadingStatus = LoadingStatus.Loading;
  
            for (var detectorId in rendering.detectorIds) {
              const requests: Observable<any>[] = [];
              rendering.detectorIds.forEach((detectorId) => {
                let request = this._diagnosticService.getDetector(detectorId, this._detectorControl.startTimeString, this._detectorControl.endTimeString);
                requests.push((<Observable<DetectorResponse>>request).pipe(
                  map((response: DetectorResponse) => {
                    let status = response.status.statusId;
                    if (status < parentStatus)
                    {
                      console.log(`update Parent: ${res.metadata.id} status, from child ${detectorId}: from ${parentStatus} to ${status}`);
                    }
                    parentStatus = status < parentStatus ? status : parentStatus;
                    if (parentStatus < 1) {
                      viewModel.status = parentStatus;
                      viewModel.loadingStatus = LoadingStatus.Success;
                      console.log(`Parent status reached 0: ${parentStatus}`)
                    }
                  })
                  , catchError(err => {
                    viewModel.loadingStatus = LoadingStatus.Failed;
                    return throwError(err);
                  })
                ));
              });
  
              // Log all the children detectors
              observableForkJoin(requests).subscribe(childDetectorData => {
                this.childDetectorsEventProperties['ChildDetectorsList'] = JSON.stringify(childDetectorData);
                this.logEvent(TelemetryEventNames.ChildDetectorsSummary, this.childDetectorsEventProperties);
              });
            }  
          }});
      }
    }
    else
    {
      viewModel.loadingStatus = LoadingStatus.Success;
      viewModel.status = res.status.statusId;
    }

    viewModel.statusColor = StatusStyles.getColorByStatus(status);
    viewModel.statusIcon = StatusStyles.getIconByStatus(status);
    viewModel.response = res;

    return viewModel;
  }

  toggleDetectorHeaderStatus(viewModel: any) {
    viewModel.expanded = viewModel.loadingStatus === LoadingStatus.Success && !viewModel.expanded;
    const clickDetectorEventProperties = {
      'ChildDetectorName': viewModel.title,
      'ChildDetectorId': viewModel.metadata.id,
      'IsExpanded': viewModel.expanded,
      'Status': viewModel.status
    };

    // Log children detectors click
    this.logEvent(TelemetryEventNames.ChildDetectorClicked, clickDetectorEventProperties);
  }
}

@Pipe({
  name: 'detectorOrder',
  pure: false
})
export class DetectorOrderPipe implements PipeTransform {
  transform(items: any[]) {
    return items.sort((a, b) => {
      return a.status > b.status ? 1 : -1;
    });
  }
}
