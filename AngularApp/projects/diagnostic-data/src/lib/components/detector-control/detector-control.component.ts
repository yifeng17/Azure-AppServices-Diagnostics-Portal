import { Component, Inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../../config/diagnostic-data-config';
import { DetectorControlService, DurationSelector } from '../../services/detector-control.service';
@Component({
  selector: 'detector-control',
  templateUrl: './detector-control.component.html',
  styleUrls: ['./detector-control.component.scss']
})
export class DetectorControlComponent implements OnInit {

  startTime: string;
  endTime: string;

  isInternal: boolean;
  timeDiffError: string;

  constructor(public _router: Router, private _activatedRoute: ActivatedRoute, public detectorControlService: DetectorControlService,
    @Inject(DIAGNOSTIC_DATA_CONFIG) config: DiagnosticDataConfig) {
    this.isInternal = !config.isPublic;
  }

  ngOnInit() {
    this.timeDiffError = '';
    if(this.detectorControlService.timeRangeDefaulted){
      this.timeDiffError = 'Defaulting to last 24 hrs. Start and End date time must not be more than 24 hrs apart and Start date must be within the past 30 days.';
    } 
    this.detectorControlService.update.subscribe(validUpdate => {
      if (validUpdate) {
        this.startTime = this.detectorControlService.startTimeString;
        this.endTime = this.detectorControlService.endTimeString;
      }

      const routeParams = {
        'startTime': this.detectorControlService.startTime.format('YYYY-MM-DDTHH:mm'),
        'endTime': this.detectorControlService.endTime.format('YYYY-MM-DDTHH:mm')
      };
      if(this.detectorControlService.detectorQueryParamsString != "") {
        routeParams['detectorQueryParams'] = this.detectorControlService.detectorQueryParamsString;
      }
      this._router.navigate([], { queryParams: routeParams, relativeTo: this._activatedRoute });

    });
  }

  setManualDate() {
    this.timeDiffError = this.detectorControlService.getTimeDurationError(this.startTime, this.endTime);
    if(this.timeDiffError === ''){
      this.detectorControlService.setCustomStartEnd(this.startTime, this.endTime);     
    }
  }
}

@Pipe({
  name: 'internal',
  pure: false
})
export class InternalPipe implements PipeTransform {
  transform(items: DurationSelector[], internalClient: boolean) {
    return items ? items.filter(item => !item.internalOnly || internalClient) : items;
  }
}

