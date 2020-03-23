import { Component, OnInit, Input} from '@angular/core';
import { CXPChatService } from '../../services/cxp-chat.service';

@Component({
  selector: 'cxp-chat-launcher',
  templateUrl: './cxp-chat-launcher.component.html',
  styleUrls: ['./cxp-chat-launcher.component.scss']
})
export class CxpChatLauncherComponent implements OnInit {

  @Input() trackingId: string;
  @Input() chatUrl: string;
  public chatConfDialogOpenedAtleastOnce = false;
  public showChatConfDialog: boolean = false;
  public firstTimeCheck: boolean = true;

  constructor(private _cxpChatService: CXPChatService) {
  }

  
  ngOnInit() {
    window.setTimeout(()=> {
      if(!this.chatConfDialogOpenedAtleastOnce && !this.showChatConfDialog) {
        this.showChatConfDialog = true;
        this.chatConfDialogOpenedAtleastOnce = true;
        this._cxpChatService.logUserActionOnChat('ChatConfDialogShownBySystem', this.trackingId, this.chatUrl);
      }      
    }, 10000);
  }

  public isComponentInitialized(): boolean {
    let initializedTestResult:boolean = this.chatUrl && this.chatUrl != '' && this.trackingId && this.trackingId != '';

    //Have to check for first time due to the way our components are structured.
    //This gets called multiple times for each detector, specifically for child detectors that are collapsed and then expanded later.
    //This will also avoid telemetry noise.
    if(!initializedTestResult && this.firstTimeCheck) {      
      this._cxpChatService.logUserActionOnChat('ChatBubbleNotShown', this.trackingId, this.chatUrl);
    }
    else if(initializedTestResult && this.firstTimeCheck) {
      this._cxpChatService.logUserActionOnChat('ChatBubbleShown', this.trackingId, this.chatUrl);
    }
    this.firstTimeCheck = false;
    
    return  initializedTestResult;
  }

  public toggleChatConfDialog(): void {
    this.showChatConfDialog = !this.showChatConfDialog;
    if (this.showChatConfDialog) {
      this.chatConfDialogOpenedAtleastOnce = true;
      this._cxpChatService.logUserActionOnChat('ChatConfDialogShown', this.trackingId, this.chatUrl);
    }
    else {
      this._cxpChatService.logUserActionOnChat('ChatConfDialogDismissed', this.trackingId, this.chatUrl);
    }
  }

  public hideChatConfDialog(isUserInitiated: boolean, source:string): void {
    if (isUserInitiated) {
      this._cxpChatService.logUserActionOnChat(`ChatConfDialogCancelFrom${source.replace(' ','')}`, this.trackingId, this.chatUrl);
    }
    this.showChatConfDialog = false;
  }

  public openChatPopup(): void {
    if (this.chatUrl != '') {
      const windowFeatures: string = 'menubar=no,location=no,resizable=no,scrollbars=no,status=no,height=550,width=450';
      window.open(this.chatUrl, '_blank', windowFeatures, false);
      this._cxpChatService.logUserActionOnChat('ChatUrlOpened', this.trackingId, this.chatUrl);
      this.hideChatConfDialog(false,'AutohideAfterChatLaunch');
    }
  }
}
