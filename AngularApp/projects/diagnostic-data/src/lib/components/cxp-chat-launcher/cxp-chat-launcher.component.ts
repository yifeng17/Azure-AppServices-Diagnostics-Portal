import { Component, OnInit, Input } from '@angular/core';
import { CXPChatService } from 'projects/app-service-diagnostics/src/app/shared/services/cxp-chat.service';

@Component({
  selector: 'cxp-chat-launcher',
  templateUrl: './cxp-chat-launcher.component.html',
  styleUrls: ['./cxp-chat-launcher.component.scss']
})
export class CxpChatLauncherComponent implements OnInit {

  @Input() trackingId: string;
  @Input() chatUrl: string;
  public isChatBubbleVisible: boolean = false;

  constructor(private _cxpChatService:CXPChatService) {
  }

  ngOnInit() {    
  }

  public isComponentInitialized():boolean {
    return this.chatUrl && this.chatUrl != '' && this.trackingId && this.trackingId != '';
  }

  public toggleChatBubble():void {
    this.isChatBubbleVisible=!this.isChatBubbleVisible;
  }

  public showChatBubble(): void {
    this.isChatBubbleVisible=true;
  }

  public hideChatBubble():void {
    this.isChatBubbleVisible=false;
  }

  public openChatPopup():void {
    if(this.chatUrl != '') {      
      const windowFeatures:string = 'menubar=no,location=no,resizable=no,scrollbars=no,status=no,height=550,width=450';
      window.open(this.chatUrl, '_blank', windowFeatures, false);

      this._cxpChatService.logChatURLOpened(this.trackingId, this.chatUrl);

      this.hideChatBubble();
    }
  }


}
