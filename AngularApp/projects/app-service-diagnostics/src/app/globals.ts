import { Injectable, Injector } from '@angular/core';
import { Message } from './supportbot/models/message';
import { TextMessageComponent } from './supportbot/common/text-message/text-message.component';
import { DynamicAnalysisComponent } from './supportbot/message-flow/dynamic-analysis/dynamic-analysis.component';
import { ButtonMessageComponent } from './supportbot/common/button-message/button-message.component';
import { GraphMessageComponent } from './supportbot/common/graph-message/graph-message.component';
import { LoadingMessageComponent } from './supportbot/common/loading-message/loading-message.component';
import { ProblemStatementMessageComponent } from './supportbot/common/problem-statement-message/problem-statement-message.component';
import { SolutionsMessageComponent } from './supportbot/common/solutions-message/solutions-message.component';
import { CategoryMenuComponent } from './supportbot/message-flow/category-menu/category-menu.component';
import { DetectorSummaryComponent } from './supportbot/message-flow/detector-summary/detector-summary.component';
import { DocumentSearchResultsComponent } from './supportbot/message-flow/document-search-results/document-search-results.component';
import { HealthCheckV3Component } from './supportbot/message-flow/health-check-v3/health-check-v3.component';
import { HealthCheckComponent } from './supportbot/message-flow/health-check/health-check.component';
import { MainMenuComponent } from './supportbot/message-flow/main-menu/main-menu.component';
import { TalkToAgentMessageComponent } from './supportbot/message-flow/talk-to-agent/talk-to-agent-message.component';
import { ActivatedRoute } from '@angular/router';



@Injectable()
export class Globals {
  messages: Message[] = [];
  messagesData: { [id: string]: any } = {};
  set openGeniePanel(value: boolean) {
    //if set openFeedback to true,update messages and open genie 
    if (value) {
      // this.updateMsgFromLocalStorage();
    }
    //if set openFeedback to false,save messages and close genie 
    else {
      this.saveMsgToLocalStorage();
    }
    this._openGeniePanel = value;
    console.log("open genie panel",value);
  };
  get openGeniePanel() {
    return this._openGeniePanel;
  }
  private _openGeniePanel:boolean = false;
  openFeedback: boolean = false;
  private localStorageKey: string = "genieChat";

  constructor(private activatedRoute: ActivatedRoute){
    this.updateMsgFromLocalStorage();
  }

  saveMsgToLocalStorage() {
    const savedMsg = this.messages.map(msg => {
      const copiedMsg = {...msg};
      if (typeof copiedMsg.component === "function") {
        copiedMsg.component = copiedMsg.component.name;
      }
      return copiedMsg;
    });
    localStorage.setItem(this.localStorageKey, JSON.stringify(savedMsg));
    console.log(savedMsg);
    console.log("globals message",this.messages);
    console.log("save Messages");
  }

  updateMsgFromLocalStorage() {
    console.log("Update Messages");
    if (localStorage.getItem(this.localStorageKey) !== null) {
      const retrieveMsg = <Message[]>JSON.parse(localStorage.getItem(this.localStorageKey));
       this.messages = retrieveMsg.map(msg => {
        const copiedMsg = {...msg};
        this.processMessage(copiedMsg);
        return copiedMsg;
      });
      console.log(retrieveMsg);
      console.log("globals message",this.messages);
    }
  }

  removeMsgFromLocalStorage() {
    localStorage.removeItem(this.localStorageKey);
  }

  processMessage(message:Message) {
    if (message.component && typeof message.component === "string") {
      switch(message.component) {
        //list all components are implements IChatMessageComponent
        case "ButtonMessageComponent":
          message.component = ButtonMessageComponent;
          break;
        case "GraphMessageComponent":
          message.component = GraphMessageComponent;
          break;
        case "LoadingMessageComponent":
          message.component = LoadingMessageComponent;
          break;
        case "ProblemStatementMessageComponent":
          message.component = ProblemStatementMessageComponent;
          break;
        case "SolutionsMessageComponent":
          message.component = SolutionsMessageComponent;
          break;
        case  "TextMessageComponent":
          message.component = TextMessageComponent;
          break;
        case "CategoryMenuComponent":
          message.component = CategoryMenuComponent;
          break;
        case "DetectorSummaryComponent":
          message.component = DetectorSummaryComponent;
          break;
        case "DocumentSearchResultsComponent":
          message.component = DocumentSearchResultsComponent;
          break;
        case "DynamicAnalysisComponent":
          message.component = DynamicAnalysisComponent;
          break;
        case "HealthCheckV3Component":
          message.component = HealthCheckV3Component;
          break;
        case "HealthCheckComponent":
          message.component = HealthCheckComponent;
          break;
        case "MainMenuComponent":
          message.component = MainMenuComponent;
        case "TalkToAgentMessageComponent":
          message.component = TalkToAgentMessageComponent;
        default:
          break;
      }
    }
  }

  //get detector or category(for categoryoverview) name for feedback
  getDetectorName():string{
    const childRoute = this.activatedRoute.firstChild.firstChild.firstChild.firstChild;
    let detectorName = "";

    if (childRoute.firstChild.snapshot.params["detectorName"]) {
      detectorName = childRoute.firstChild.snapshot.params["detectorName"];
    } else {
      detectorName = childRoute.snapshot.params["category"];
    }
    return detectorName;
  }
  
}
