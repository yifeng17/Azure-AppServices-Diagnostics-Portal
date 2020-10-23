import { Component, OnInit } from '@angular/core';
import { IMessageBarStyles, MessageBarType, PanelType } from 'office-ui-fabric-react';
import { Globals } from '../../../globals';


@Component({
  selector: 'blade-closing-notification',
  templateUrl: './blade-closing-notification.component.html',
  styleUrls: ['./blade-closing-notification.component.scss']
})
export class BladeClosingNotificationComponent implements OnInit {
  type: MessageBarType = MessageBarType.info;
  styles: IMessageBarStyles = {
    root: {
        height: '49px',
        backgroundColor: '#F0F6FF',
        marginLeft: '20px',
        marginRight: '20px',
        marginBottom: '13px'
    }
}
  constructor() { }

  ngOnInit() {
  }

}
