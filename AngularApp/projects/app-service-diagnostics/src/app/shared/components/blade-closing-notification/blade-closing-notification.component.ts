import { Component, OnInit } from '@angular/core';
import { MessageBarType, PanelType } from 'office-ui-fabric-react';
import { Globals } from '../../../globals';


@Component({
  selector: 'blade-closing-notification',
  templateUrl: './blade-closing-notification.component.html',
  styleUrls: ['./blade-closing-notification.component.scss']
})
export class BladeClosingNotificationComponent implements OnInit {
  type: MessageBarType = MessageBarType.info;
  constructor() { }

  ngOnInit() {
  }

}
