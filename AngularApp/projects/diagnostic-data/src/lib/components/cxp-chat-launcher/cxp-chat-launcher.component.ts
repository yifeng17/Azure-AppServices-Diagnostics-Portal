import { Component, OnInit, Input, ViewChild, Renderer2 } from '@angular/core';
import { CXPChatService } from '../../services/cxp-chat.service';

@Component({
  selector: 'cxp-chat-launcher',
  templateUrl: './cxp-chat-launcher.component.html',
  styleUrls: ['./cxp-chat-launcher.component.scss']
})
export class CxpChatLauncherComponent implements OnInit {

  @Input() trackingId: string;
  @Input() chatUrl: string;
  public showChatConfDialog: boolean = false;

  @ViewChild('chatComponentContainer') chatComponentContainer;

  constructor(private _cxpChatService: CXPChatService, private renderer: Renderer2) {
  }

  ngOnInit() {
    this.renderer.listen('window', 'click', (e: Event) => {
      /**
       * Only run when the current chat component is not clicked
       * If we don't check this, all clicks (even on the chat component div) gets into this section.
       * As a  result we will never see the confirmation box open       
       */

      if (!this.chatComponentContainer.nativeElement.contains(e.target)) {
        this.showChatConfDialog = false;
      }
    });
  }

  public isComponentInitialized(): boolean {
    return this.chatUrl && this.chatUrl != '' && this.trackingId && this.trackingId != '';
  }

  public toggleChatBubble(): void {

    if (this.showChatConfDialog) {
      this._cxpChatService.logUserActionOnChat('ChatBubbleShown', this.trackingId, this.chatUrl);
    }
    else {
      this._cxpChatService.logUserActionOnChat('ChatBubbleDismissed', this.trackingId, this.chatUrl);
    }

    this.showChatConfDialog = !this.showChatConfDialog;
  }

  public hideChatBubble(isUserInitiated: boolean): void {
    if (isUserInitiated) {
      this._cxpChatService.logUserActionOnChat('ChatBubbleCancel', this.trackingId, this.chatUrl);
    }
    this.showChatConfDialog = false;
  }

  public openChatPopup(): void {
    if (this.chatUrl != '') {
      const windowFeatures: string = 'menubar=no,location=no,resizable=no,scrollbars=no,status=no,height=550,width=450';
      window.open(this.chatUrl, '_blank', windowFeatures, false);

      this._cxpChatService.logUserActionOnChat('ChatUrlOpened', this.trackingId, this.chatUrl);

      this.hideChatBubble(false);
    }
  }


}
