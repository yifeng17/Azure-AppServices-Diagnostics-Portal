import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { GenieChatFlow } from '../../../supportbot/message-flow/v2-flows/genie-chat.flow';
import { Message, TextMessage } from '../../../supportbot/models/message';
import { MessageSender, ButtonActionType } from '../../../supportbot/models/message-enums';
import { MessageProcessor } from '../../../supportbot/message-processor.service';
import { mergeStyleSets, hiddenContentStyle, MessageBarType, FontSizes } from 'office-ui-fabric-react';
import { DynamicComponent } from '../../../supportbot/dynamic-component/dynamic.component';
import { TextMessageComponent } from '../../../supportbot/common/text-message/text-message.component';
import { LoadingMessageComponent } from '../../../supportbot/common/loading-message/loading-message.component';

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
    loading: boolean = true;
    // navigationContent: InputRendererOptions<IPanelProps>;
    //  navigationContent: RenderPropContext<IPanelProps>;
    navigationContent: (() => HTMLElement);
    renderFooter: (() => HTMLElement);
    isLightDismiss: boolean = true;
    welcomeMessage: string = "Welcome to App Service Diagnostics. My name is Genie and I am here to help you answer any questions you may have about diagnosing and solving your problems with your app. Please describe the issue of your app.";
    panelStyles: any;
    width: string = "1200px";
    scrollListener: any;

    // messageBarType: MessageBarType = MessageBarType.warning;
    constructor(private _genieChatFlow: GenieChatFlow, private _messageProcessor: MessageProcessor, public globals: Globals) {
        this.panelStyles = {
            // type: PanelType.smallFixedNear,
            root: {
                width: 585,
            },
        };
        this.chatContainerHeight = 0;
        this.messages = [];
        this.showTypingMessage = false;
        this.chatContainerHeight = 0;
    }

    ngOnInit() {
        this.globals.openGeniePanel = false;
        console.log("init genie with openPanel", this.globals);

        // Pop messages from globals messages:
        if (this.globals.messages.length === 0) {
            this.globals.messages.push(new TextMessage(this.welcomeMessage, MessageSender.System, 200));
        }

        this.getMessage();

        //  this.messages = this.globals.messages;

        // this.globals.messages.forEach((message) => {
        //     let m = message;
        //     this.messages.push(m);
        //     console.log("init genie with messages", this.messages);
        // })

        //this.messages = this.globals.messages;
        this.chatContainerHeight = window.innerHeight - 170;

        this.renderFooter = () => {
            // let panelTitle =  document.createElement('fab-search-box') as HTMLElement;
            let panelTitle = document.createElement('div') as HTMLElement;
            //  panelTitle.placeholder = 'Type your question';
            // panelTitle.style.left = '25px';f
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

    getHistoryMessage(): void {
        this.messages = JSON.parse(JSON.stringify(this.globals.messages))
      //  this.messages = {...this.globals.messages};
    }

    ngOnDestroy() {
        if (this.scrollListener) {
          clearInterval(this.scrollListener);
        }
      }

    closeGeniePanel() {
        this.globals.openGeniePanel = false;
        this.openPanelChange.emit(this.openPanel);
        console.log("close panel, isOpen:", this.globals.openGeniePanel);
    }

    updateView(event?: any):void {
        this.scrollToBottom();
    }

    updateStatus(event?: any): void {
       //    this.scrollToBottom();
        this.loading = false;
     //   clearInterval(this.scrollListener);
        this.scrollListener = undefined;
        this.getMessage(event);
    }

    scrollToBottom(event?: any): void {
        try {
            console.log("scrolltobottom", this.myScrollContainer.elementRef.nativeElement.childNodes[0]);
            console.log("height", height, this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop, this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].height);
            //this.myScrollContainer.elementRef.nativeElement.childNodes[0].scrollTop = this.myScrollContainer.elementRef.nativeElement.childNodes[0].scrollHeight;
            var height = this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight;
            this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop = height;
            //   this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop +=  this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].height;



            // if ( this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop <  this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight)
            // {
            //     this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop = this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight;
            // }

            //        console.log("3. scrolltop after scrollTop", this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop, this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight);
        } catch (err) {
            //   console.log("status scrollToBottom", err);
        }
    }

    onSearchEnter(event: any): void {
        // Push messages to the current object, also wait for the complete status, and push the object to globa message component
        let analysisMessageGroupId = event.newValue+ (new Date()).toUTCString();
        this._genieChatFlow.createMessageFlowForAnaysis(event.newValue, analysisMessageGroupId).subscribe((analysisMessages: Message[]) => {
            console.log("**** analysis messsages", analysisMessages);
            analysisMessages.forEach(message => {
                // message.component.oncomplete === true &&
                // if (this.globals.messages.indexOf(message) < 0) {
                //     this.globals.messages.push(message);
                // }
               // this.messages.push(message);
            });

            console.log("constructing messages onsearch", this.globals.messages, this.messages);
        });
        this._messageProcessor.setCurrentKey(analysisMessageGroupId);
        this.getMessage();
      //  this.scrollToBottom();
        //setTimeout(() => this.scrollToBottom(), 500);

      //  this.scrollListener = setInterval(() => this.scrollToBottom(), 1000);
        //  setInterval(()=> {
        //      if (this.loading)
        //      {
        //         this.scrollToBottom();
        //      }
        //      else
        //      {
        //         clearInterval(intervalId);
        //      }
        //  }, 1000);

        // setTimeout(() => {
        //     setInterval(()=>this.scrollToBottom(), 500);
        //   }, 6000);



        // try {
        //     //this.myScrollContainer.elementRef.nativeElement.childNodes[0].scrollTop = this.myScrollContainer.elementRef.nativeElement.childNodes[0].scrollHeight;
        //     var height = this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight;
        //     this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop = height;

        //     console.log("scrolltobottom", this.myScrollContainer.elementRef.nativeElement.childNodes[0]);
        // } catch (err) {
        // }
    }



    scrollToTop(event?: any): void {

        try {
            //this.myScrollContainer.elementRef.nativeElement.childNodes[0].scrollTop = this.myScrollContainer.elementRef.nativeElement.childNodes[0].scrollHeight;
            var height = this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight;
            this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop = height;

            // if ( this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop <  this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight)
            // {
            //     this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop = this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight;
            // }

            //        console.log("3. scrolltop after scrollTop", this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop, this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight);
        } catch (err) {
            //   console.log("status scrollToBottom", err);
        }
    }

    getMessage(event?: any): void {
        console.log("status oncomplete: event", event);
        const self = this;
        const message = this._messageProcessor.getNextMessage(event);

        if (message) {
            if (message.messageDelayInMs >= 2000) {
                this.showTypingMessage = true;

                // To show the typing message icon, we need to scroll the page to the bottom.
                setTimeout(() => {
                      this.scrollToBottom();
                }, 200);
            }

            setTimeout(function () {
                self.showTypingMessage = false;
                self.messages.push(message);
            }, message.messageDelayInMs);
        }
    }
}
