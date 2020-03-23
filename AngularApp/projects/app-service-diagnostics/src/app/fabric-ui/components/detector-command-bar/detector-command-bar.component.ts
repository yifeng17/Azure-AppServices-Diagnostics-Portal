import { Component, OnInit } from '@angular/core';
import { Globals } from '../../../globals';
import { DetectorControlService } from 'projects/diagnostic-data/src/lib/services/detector-control.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'detector-command-bar',
  templateUrl: './detector-command-bar.component.html',
  styleUrls: ['./detector-command-bar.component.scss']
})
export class DetectorCommandBarComponent implements OnInit {
  time: string;

  constructor(private globals: Globals, private detectorControlService: DetectorControlService, private _router: Router, private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.detectorControlService.update.subscribe(validUpdate => {
      const routeParams = {
        'startTime': this.detectorControlService.startTime.format('YYYY-MM-DDTHH:mm'),
        'endTime': this.detectorControlService.endTime.format('YYYY-MM-DDTHH:mm')
      };
      if(this.detectorControlService.detectorQueryParamsString != "") {
        routeParams['detectorQueryParams'] = this.detectorControlService.detectorQueryParamsString;
      }
      if (!this._activatedRoute.queryParams['searchTerm']){
        routeParams['searchTerm'] = this._activatedRoute.snapshot.queryParams['searchTerm'];
      }

      this._router.navigate([], { queryParams: routeParams, queryParamsHandling: 'merge', relativeTo: this._activatedRoute });
    });
  }

  toggleOpenState() {
    this.globals.openGeniePanel = !this.globals.openGeniePanel;
  }

  sendFeedback() {
    this.globals.openFeedback = !this.globals.openFeedback;
  }

  refreshPage() {
    console.log("Gonna call refresh in detector control");
    this.detectorControlService.refresh();
  }

  toggleOpenTimePicker() {
    // setTimeout(() => {this.globals.openTimePicker = !this.globals.openTimePicker},0);
    this.globals.openTimePicker = !this.globals.openTimePicker
  }

  updateMessage(s: string) {
    this.time = s;
  }

  closeTimePicker() {
    this.globals.openTimePicker = false;
  }
}
