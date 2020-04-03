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

  constructor(private globals: Globals, private detectorControlService: DetectorControlService, private detectorCommandService: DetectorCommandService) { }

  toggleOpenState() {
    this.globals.openGeniePanel = !this.globals.openGeniePanel;
  }

  sendFeedback() {
    this.globals.openFeedback = !this.globals.openFeedback;
  }

  refreshPage() {
    this.detectorCommandService.refesh();
  }

  toggleOpenTimePicker() {
    this.globals.openTimePicker = !this.globals.openTimePicker
  }

  updateMessage(s: string) {
    this.time = s;
  }

  closeTimePicker() {
    this.globals.openTimePicker = false;
  }
}
