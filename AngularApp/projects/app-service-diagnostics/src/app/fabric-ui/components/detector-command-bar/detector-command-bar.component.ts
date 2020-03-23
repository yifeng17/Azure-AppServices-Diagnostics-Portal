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

  constructor(private globals: Globals, public detectorControlService: DetectorControlService, private _router: Router, private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.detectorControlService.update.subscribe(validUpdate => {
      try {
        const routeParams = {
          'startTime': this.detectorControlService.startTime.format('YYYY-MM-DDTHH:mm'),
          'endTime': this.detectorControlService.endTime.format('YYYY-MM-DDTHH:mm')
        };
        if(this.detectorControlService.detectorQueryParamsString != "") {
          console.log("query string in detector command bar", this.detectorControlService.detectorQueryParamsString);
          routeParams['detectorQueryParams'] = this.detectorControlService.detectorQueryParamsString;
        }
        if (!this._activatedRoute.queryParams['searchTerm']){
          console.log("searchTerm in detector command bar",  this._activatedRoute.snapshot.queryParams['searchTerm']);
          routeParams['searchTerm'] = this._activatedRoute.snapshot.queryParams['searchTerm'];
        }

        console.log("routeParams", routeParams);
  
        this._router.navigate([], { queryParams: routeParams, queryParamsHandling: 'merge', relativeTo: this._activatedRoute });
      }
      catch(e){
        console.log("exception in detector command bar", e);
      }
      }
);
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
