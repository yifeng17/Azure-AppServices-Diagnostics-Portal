import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { GenieChatFlow } from '../../../supportbot/message-flow/v2-flows/genie-chat.flow';
import { Message, TextMessage } from '../../../supportbot/models/message';
import { MessageSender, ButtonActionType } from '../../../supportbot/models/message-enums';
import { MessageProcessor } from '../../../supportbot/message-processor.service';
import { mergeStyleSets, hiddenContentStyle, MessageBarType, FontSizes } from 'office-ui-fabric-react';
import { DynamicComponent } from '../../../supportbot/dynamic-component/dynamic.component';
import { TextMessageComponent } from '../../../supportbot/common/text-message/text-message.component';

import {
    PanelType,
    IPanelStyles,
    ICalendarStrings,
    IContextualMenuProps,
    ISelection,
    Selection,
    DropdownMenuItemType,
    IDropdownOption,
    ICheckboxProps,
    IPersonaProps,
    IPeoplePickerProps
  } from 'office-ui-fabric-react';
import { Globals } from '../../../globals';


@Component({
  selector: 'genie-panel',
  templateUrl: './genie-panel.component.html',
  styleUrls: ['./genie-panel.component.scss']
})
export class GeniePanelComponent implements OnInit {
  @ViewChild('scrollMe', { static: true }) myScrollContainer: any;
  @Input() openPanel: boolean = false;
  @Output() openPanelChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Genie panel
  type: PanelType = PanelType.custom;
  messages: Message[] = [];
  showTypingMessage: boolean;
  chatContainerHeight: number;
  // navigationContent: InputRendererOptions<IPanelProps>;
  //  navigationContent: RenderPropContext<IPanelProps>;
  navigationContent: (() => HTMLElement);
  renderFooter: (() => HTMLElement);
  isLightDismiss: boolean = true;
  welcomeMessage: string = "Welcome to App Service Diagnostics. My name is Genie and I am here to help you answer any questions you may have about diagnosing and solving your problems with your app. Please describe the issue of your app.";
  panelStyles: any;
  width: string = "1200px";

 // messageBarType: MessageBarType = MessageBarType.warning;
  constructor(private _genieChatFlow: GenieChatFlow, private _messageProcessor: MessageProcessor, public globals: Globals) {
    this.panelStyles = {
        // type: PanelType.smallFixedNear,
        root: {
            // position: 'fixed',
            width: 585,
            // boxSizing: 'border-box',
            // overflowY: 'auto',
            // overflowX: 'hiden',
        },
        //   customWidth: "585",
    };
    this.chatContainerHeight = 0;
  }

  ngOnInit() {
    console.log("init genie with openPanel", this.globals.openGeniePanel);
    this.messages.push(new TextMessage(this.welcomeMessage, MessageSender.System, 200));
    this.chatContainerHeight = window.innerHeight - 170;

    this.renderFooter = () => {
        // let panelTitle =  document.createElement('fab-search-box') as HTMLElement;
        let panelTitle = document.createElement('div') as HTMLElement;
        //  panelTitle.placeholder = 'Type your question';
        // panelTitle.style.left = '25px';
        // panelTitle.style.right = '32px';
        // panelTitle.style.top = '0px';
        // panelTitle.style.height = '27px';
        // panelTitle.style.fontFamily = "Segoe UI";
        // panelTitle.style.fontSize = "18px";
        // panelTitle.style.lineHeight = "24px";
        // panelTitle.style.display = "flex";
        // panelTitle.style.alignItems = "flex-end";
        panelTitle.innerHTML = "Hi my name is Genie";
        return panelTitle;
        // (props?: P, defaultRender?: (props?: P) => JSX.Element | null): JSX.Element | null;
    };
  }

  closeGeniePanel() {
    this.globals.openGeniePanel = false;
    this.openPanelChange.emit(this.openPanel);
    console.log("close panel, isOpen:", this.globals.openGeniePanel);
}

  onSearchEnter(event: any): void {
    this._genieChatFlow.createMessageFlowForAnaysis(event.newValue).subscribe((analysisMessages: Message[]) => {
        analysisMessages.forEach(message => {
            this.messages.push(message);
        });

        console.log("constructing messages onsearch", this.messages);
    });
}


scrollToBottom(event?: any): void {

    try {
        //this.myScrollContainer.elementRef.nativeElement.childNodes[0].scrollTop = this.myScrollContainer.elementRef.nativeElement.childNodes[0].scrollHeight;
        var height = this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight;
        this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop = height;

        // if ( this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop <  this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight)
        // {
        //     this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop = this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight;
        // }

        console.log("3. scrolltop after scrollTop", this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop, this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight);
    } catch (err) {
        console.log("status scrollToBottom", err);
    }
}


getMessage(event?: any): void {
    console.log("status oncomplete: event", event);
    const self = this;
    const message = this._messageProcessor.getNextMessage(event);

    if (message) {
        this.messages.push(message);
        if (message.messageDelayInMs >= 2000) {
            this.showTypingMessage = true;

            // To show the typing message icon, we need to scroll the page to the bottom.
            setTimeout(() => {
                //  this.scrollToBottom();
            }, 200);
        }
    }
}

}
