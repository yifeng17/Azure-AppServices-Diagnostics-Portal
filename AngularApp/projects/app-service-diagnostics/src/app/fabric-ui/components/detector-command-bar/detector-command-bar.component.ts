import { Component } from '@angular/core';
import { Globals } from '../../../globals';
import { DetectorControlService, DetectorCommandService } from 'diagnostic-data';

@Component({
  selector: 'detector-command-bar',
  templateUrl: './detector-command-bar.component.html',
  styleUrls: ['./detector-command-bar.component.scss']
})
export class DetectorCommandBarComponent {
  time: string;

  constructor(private globals: Globals, private detectorControlService: DetectorControlService, private detectorCommandService:DetectorCommandService) { }

  toggleOpenState() {
    this.globals.openGeniePanel = !this.globals.openGeniePanel;
  }

  sendFeedback() {
    this.globals.openFeedback = !this.globals.openFeedback;
  }

  refresh() {
    
  }

  refreshPage() {
    console.log("1. Refresh clicked in detector commandbar");
this.detectorCommandService.refesh(); 
//  this.detectorControlService.refresh();
//   const routeParams = {
//     'startTime': this.detectorControlService.startTime.format('YYYY-MM-DDTHH:mm'),
//     'endTime': this.detectorControlService.endTime.format('YYYY-MM-DDTHH:mm')
//   };

 
//     let detector = this._activatedRoute.snapshot.params['detectorName'];
  

//   if(this.detectorControlService.detectorQueryParamsString != "") {
//     console.log("query string in detector command bar", this.detectorControlService.detectorQueryParamsString);
//     routeParams['detectorQueryParams'] = this.detectorControlService.detectorQueryParamsString;
//   }
//   if (!this._activatedRoute.queryParams['searchTerm']){
//     console.log("searchTerm in detector command bar",  this._activatedRoute.snapshot.queryParams['searchTerm']);
//     routeParams['searchTerm'] = this._activatedRoute.snapshot.queryParams['searchTerm'];
//   }
//   this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
//     this._router.navigate(['../detectors/appcrashes'], { queryParams: routeParams, queryParamsHandling: 'merge', relativeTo: this._activatedRoute });
// }); 
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
