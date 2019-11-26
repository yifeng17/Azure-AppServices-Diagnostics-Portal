import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InputRendererOptions, JsxRenderFunc, ReactWrapperComponent } from '@angular-react/core';
import { IPanelHeaderRenderer, IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { Message } from '../../../supportbot/models/message';
import { MessageProcessor } from '../../../supportbot/message-processor.service';
import { DynamicComponent } from '../../../supportbot/dynamic-component/dynamic.component';

//  createInputJsxRenderer, createRenderPropHandler


@Component({
    selector: 'category-overview',
    templateUrl: './category-overview.component.html',
    styleUrls: ['./category-overview.component.scss']
})
//extends Renderable
export class CategoryOverviewComponent implements OnInit {

    @ViewChild('scrollMe', { static: false }) myScrollContainer: ElementRef;

    messages: Message[] = [];
    showTypingMessage: boolean;
    chatContainerHeight: number;
    categoryId: string = "";
    isOpen: boolean = true;
    // navigationContent: InputRendererOptions<IPanelProps>;
    //  navigationContent: RenderPropContext<IPanelProps>;
    navigationContent: (() => HTMLElement);
    renderFooter: (() => HTMLElement);
    isLightDismiss: boolean = true;
    @ViewChild('panelTitle', { static: true }) navigationContentTemplate: TemplateRef<any>;
    @ViewChild("headerTemplate", { static: true }) headerTemplate: TemplateRef<any>;
    @ViewChild('tpl', { static: true }) tpl: TemplateRef<any>;

    constructor(private _activatedRoute: ActivatedRoute, private _messageProcessor: MessageProcessor) {
        // this._activatedRoute.paramMap.subscribe(params => {
        //     console.log("category params", params);
        //     this.categoryId = params.get('category');
        //   });
    }

    scrollToBottom(event?: any): void {

        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    getMessage(event?: any): void {
        const self = this;
        const message = this._messageProcessor.getNextMessage(event);

        console.log("message in support bot", message);
        if (message) {
            this.messages.push(message);
            console.log("message not empty", message);
            if (message.messageDelayInMs >= 2000) {
                console.log("1st settimeout");
                this.showTypingMessage = true;

                // To show the typing message icon, we need to scroll the page to the bottom.
                setTimeout(() => {
                    this.scrollToBottom();
                }, 200);
            }

            setTimeout(function () {
                self.showTypingMessage = false;
                //    self.messages.push(message);
                this.messages.push(message);
                console.log("2nd settimeout");
            }, message.messageDelayInMs);
        }
    }

    closePanel(){
      this.isOpen = false;
    }
    ngOnInit() {
        this.categoryId = this._activatedRoute.parent.snapshot.params.category;
        // let elem = document.createElement('div') as HTMLElement
        // this.messages.push(new Message {

        // });
        this.getMessage();

        console.log("this.messages after init", this.messages);
        // this.navigationContent = useConstCallback((props, defaultRender) => (
        //     <>
        //       <SearchBox placeholder="Search here..." styles={searchboxStyles} ariaLabel="Sample search box. Does not actually search anything." />
        //       {// This custom navigation still renders the close button (defaultRender).
        //       // If you don't use defaultRender, be sure to provide some other way to close the panel.
        //       defaultRender!(props)}
        //     </>
        //   ));

        // This custom navigation still renders the close button (defaultRender).
        // If you don't use defaultRender, be sure to provide some other way to close the panel.


        // export interface IRenderFunction<P> {
        //     (props?: P, defaultRender?: (props?: P) => JSX.Element | null): JSX.Element | null;
        // }


        // this.navigationContent = {
        //     render: defaultProps => {
        //         (<h1>Hello World</h1>)
        //         // {
        //         // ${defaultRender!(props)}
        //             // <>
        //     //   </>)
        //    //   label: defaultProps.label,
        //     //  onRenderNavigationContent: createInputJsxRenderer()
        //     },
        //   };

        // this.navigationContent = {
        //     getProps: defaultProps => ({
        //       ...defaultProps,
        //    //   label: defaultProps.label,
        //       onRenderNavigationContent: ()=>{
        //           document.createElement('div') as HTMLElement;
        //         // (props?: P, defaultRender?: (props?: P) => JSX.Element | null): JSX.Element | null;
        //       }
        //     }),
        //   };

        this.navigationContent = () => {
          let panelTitleContainer = document.createElement('DIV') as HTMLElement;
          let closeButton = document.createElement('BUTTON') as HTMLElement;
            let panelTitle = document.createElement('SPAN') as HTMLElement;
            closeButton.innerHTML="close";
            closeButton.id = "close";
            // closeButton.addEventListener("click", function(e) {
              
            // })
            // closeButton.onclick = this.closePanel();
            closeButton.style.position='absolute';
            closeButton.style.right = '10px';
            panelTitle.style.position = 'absolute';
            panelTitle.style.left = '25px';
            panelTitle.style.right = '32px';
            panelTitle.style.top = '0px';
            panelTitle.style.height = '27px';
            panelTitle.style.fontFamily = "Segoe UI";
            panelTitle.style.fontSize = "18px";
            panelTitle.style.lineHeight = "24px";
            panelTitle.style.display = "flex";
            panelTitle.style.alignItems = "flex-end";
            panelTitle.innerHTML = "Hi my name is Genie"
            panelTitleContainer.appendChild(panelTitle);
             panelTitleContainer.appendChild(closeButton);
            return panelTitleContainer;
            // (props?: P, defaultRender?: (props?: P) => JSX.Element | null): JSX.Element | null;
        };

        document.getElementById('close').onclick = () => {
          this.isOpen = false;
          console.log("this.isOpen", this.isOpen);
        }


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
            panelTitle.innerHTML = "Hi my name is Genie"
            return panelTitle;
            // (props?: P, defaultRender?: (props?: P) => JSX.Element | null): JSX.Element | null;
        };



        // this.navigationContent =  {
        //     render: defaultProps => ({
        //       ...defaultProps,
        //       onRenderNavigationContent: (props, defaultRender) => return (
        //         <>
        //     <SearchBox placeholder="Search here..." styles={searchboxStyles} ariaLabel="Sample search box. Does not actually search anything." />
        //     {
        //     ${defaultRender!(props)}
        //   </>)
        //     }),
        //   };

        //     this.navigationContent =   (props, defaultRender) => {
        //         `<>
        //     <SearchBox placeholder="Search here..." styles={searchboxStyles} ariaLabel="Sample search box. Does not actually search anything." />
        //     {// This custom navigation still renders the close button (defaultRender).
        //     // If you don't use defaultRender, be sure to provide some other way to close the panel.
        //     ${defaultRender!(props)}
        //   </>`;
        // };
        console.log("routes", this._activatedRoute.parent);
        console.log("categoryId", this.categoryId);
    }

}
