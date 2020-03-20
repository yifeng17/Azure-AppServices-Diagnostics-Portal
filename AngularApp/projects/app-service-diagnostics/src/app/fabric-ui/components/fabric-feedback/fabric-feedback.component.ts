import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PanelType } from 'office-ui-fabric-react';
import { TelemetryService, TelemetryEventNames } from 'diagnostic-data';
import { Globals } from '../../../globals';
import { Subject } from 'rxjs';

@Component({
  selector: 'fabric-feedback',
  templateUrl: './fabric-feedback.component.html',
  styleUrls: ['./fabric-feedback.component.scss']
})
export class FabricFeedbackComponent {
  type: PanelType = PanelType.custom;
  dismissSubject: Subject<void> = new Subject<void>();


  constructor(public globals:Globals){}



  dismissedHandler() {
    this.globals.openFeedback = false;
    this.dismissSubject.next();
  }
}
