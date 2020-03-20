import { Component } from '@angular/core';
import { Globals } from '../../../globals';
import { DetectorControlService } from 'projects/diagnostic-data/src/lib/services/detector-control.service';

@Component({
  selector: 'detector-command-bar',
  templateUrl: './detector-command-bar.component.html',
  styleUrls: ['./detector-command-bar.component.scss']
})
export class DetectorCommandBarComponent {
  dropdownStyles = {
    openPanel: false
  };

  time: string;

  constructor(private globals: Globals, private detectorControlService: DetectorControlService) { }

  toggleOpenState() {
    this.globals.openGeniePanel = !this.globals.openGeniePanel;
  }

  sendFeedback() {
    this.globals.openFeedback = !this.globals.openFeedback;
  }

  refreshPage() {
    this.detectorControlService.refresh();
  }

  toggleOpenTimePicker() {
    this.globals.openTimePicker = !this.globals.openTimePicker;
  }

  updateMessage(timeStr: string) {
    this.time = timeStr;
  }

  onCopyClicked() {
  }
}
