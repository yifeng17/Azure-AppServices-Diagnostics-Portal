import { Injectable } from '@angular/core';
import { MessageGroup } from '../../models/message-group';
import { Message, TextMessage, ButtonListMessage, FeedbackButtonListMessage } from '../../models/message';
import { Category } from '../../../shared-v2/models/category';
import { Observable, of } from 'rxjs';
import { DetectorMetaData, DiagnosticService } from 'diagnostic-data';
import { IMessageFlowProvider } from '../../interfaces/imessageflowprovider';
import { RegisterMessageFlowWithFactory } from '../message-flow.factory';
import { MessageSender, ButtonActionType, MessageType } from '../../models/message-enums';
import { CategoryMenuMessage } from '../category-menu/category-menu.component';
import { DetectorSummaryMessage } from '../detector-summary/detector-summary.component';
import { DynamicAnalysisMessage } from '../dynamic-analysis/dynamic-analysis.component';
import { DocumentSearchMessage } from '../document-search/document-search.component';
import { GenieFeedbackMessage } from '../genie-feedback/geniefeedbackmessageflow'
import { map } from 'rxjs/operators';
import { GenericArmConfigService } from '../../../shared/services/generic-arm-config.service';
import { ResourceService } from '../../../shared-v2/services/resource.service';
import { Globals } from '../../../globals';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../startup/services/auth.service';
import { StartupInfo } from '../../../shared/models/portal';

@Injectable()
@RegisterMessageFlowWithFactory()
export class GenieChatFlow extends IMessageFlowProvider {
  messageFlowList: MessageGroup[] = [];
  resourceId: string="";
  categoriesCreated: Category[] = [];

  targetedScore: number = 0.5;

  constructor(private _router: Router, private _authService: AuthService, private _activatedRoute: ActivatedRoute, private _diagnosticApiService: DiagnosticService, private _resourceService: ResourceService, public globals: Globals, private _genericArmConfigService?: GenericArmConfigService) {
    super();
    let welcomeMessage: string = "Hello, Welcome to App Service Diagnostics. My name is Genie and I am here to help you answer any questions you may have about diagnosing and solving your problems with your app. Please describe the issue of your app.";

    const welcomeMessageGroup: MessageGroup = new MessageGroup('welcome', [], () => '');
    welcomeMessageGroup.messages.push(new TextMessage(welcomeMessage, MessageSender.System, 200));
 
    const feedbackMessageGroup: MessageGroup = new MessageGroup('feedback', [], () => '');
    feedbackMessageGroup.messages.push(new FeedbackButtonListMessage('Did this information help you solve the issue?',this._getButtonListDidYouFindHelpfulinNewGenie('more-help', 'I need further assistance'), 'Availability and Performance'));
   const helpfulGroup: MessageGroup = new MessageGroup('feedback-helpful', [], () => 'feedback-textbox');
   helpfulGroup.messages.push(new TextMessage('Yes', MessageSender.User, 200));
   helpfulGroup.messages.push(new TextMessage('Good to hear! Could you let us know how helpful was this?', MessageSender.System, 500));
   helpfulGroup.messages.push(new GenieFeedbackMessage([], 'Submit', 'Feedback', 'Support Home'));
   helpfulGroup.messages.push(new TextMessage('Thank you for your feedback! What else can I help you with today? Type in your question below.'));

   const notHelpfulGroup: MessageGroup = new MessageGroup('feedback-not-helpful', [], () => 'feedback-textbox');
   notHelpfulGroup.messages.push(new TextMessage('No', MessageSender.User, 200));
   notHelpfulGroup.messages.push(new TextMessage('Sorry to hear! Could you let us know how we can improve?', MessageSender.System, 500));
   notHelpfulGroup.messages.push(new GenieFeedbackMessage([], 'Submit', 'Feedback', 'Support Home'));
   notHelpfulGroup.messages.push(new TextMessage('Thank you for your feedback! Could you help describe your issue again so we can further assist you?'));
   const feedbackText: MessageGroup = new MessageGroup('feedback-textbox', [], () => '');

    this.messageFlowList.push(welcomeMessageGroup);
    this.messageFlowList.push(feedbackMessageGroup);
    this.messageFlowList.push(helpfulGroup);
    this.messageFlowList.push(notHelpfulGroup);
    this.messageFlowList.push(feedbackText);
  }

  GetMessageFlowList(): MessageGroup[] {
    return this.messageFlowList;
  }

  createMessageFlowForAnaysisResult(data: any, noSearchResult: boolean = false): any {
     const moreHelpId: string = `more-help-WindowsAvailabilityAndPerformance`;
     const showTiles: string = `show-all-tiles-WindowsAvailabilityAndPerformance`;
     const feedback: string = `feedback-WindowsAvailabilityAndPerformance`;
  }

  createMessageFlowForAnaysis(keyword: string, messageGroupId: string, resourceId: string=""): Observable<Message[]> {
    this._authService.getStartupInfo().subscribe((startupInfo: StartupInfo) => {
        this.resourceId = startupInfo.resourceId;
      });
    let analysisMessages: Message[]  = [];
    let keywordTextMessage = new TextMessage(keyword, MessageSender.User, 500);
    let systemResponseTextMessage = new TextMessage('Okay give me a moment while I analyze your app for any issues related to this.', MessageSender.System, 500);
    resourceId = this.resourceId;
    let dynamicAnalysisMessage = new DynamicAnalysisMessage(keyword, resourceId);

    const analysisMessageGroup: MessageGroup = new MessageGroup(`${messageGroupId}`, [], () => '');
    analysisMessageGroup.messages.push(keywordTextMessage);
    analysisMessageGroup.messages.push(systemResponseTextMessage);
    analysisMessageGroup.messages.push(dynamicAnalysisMessage);
    let additionalMessageGroup: MessageGroup[] = [];
    additionalMessageGroup.push(analysisMessageGroup);
    this.additionalMessageFlows.next(additionalMessageGroup);
    return of(analysisMessages);
  }

  createMessageFlowForCategory(category: Category): Observable<MessageGroup[]> {
    if (!category.createFlowForCategory || this.categoriesCreated.indexOf(category) >= 0) { return of([]); }

    this.categoriesCreated.push(category);

    return this._diagnosticApiService.getDetectors().pipe(map((detectors: DetectorMetaData[]) => {
      const messageGroupList: MessageGroup[] = [];

      const mainMenuId: string = `main-menu-${category.id}`;
      const docSearch: string = `in-chat-search-${category.id}`;
      const moreHelpId: string = `more-help-${category.id}`;
      const showTiles: string = `show-all-tiles-${category.id}`;
      const feedback: string = `feedback-${category.id}`;

      let serviceName: string = 'App Service Diagnostics';
      let welcomeMessage = "genie-Welcome to App Service Diagnostics. My name is Genie and I am here to help you answer any questions you may have about diagnosing and solving your problems with your app. Please describe the issue of your app.";

      if (this._resourceService.armResourceConfig
        && this._resourceService.armResourceConfig.homePageText
        && this._resourceService.armResourceConfig.homePageText.title
        && this._resourceService.armResourceConfig.homePageText.title.length > 0) {
        serviceName = this._resourceService.armResourceConfig.homePageText.title;
      }

      const welcomeCategory: MessageGroup = new MessageGroup(`welcome`, [], () => mainMenuId);
      welcomeCategory.messages.push(new TextMessage(welcomeMessage, MessageSender.System, 200));
 
      const categoryMainMenu: MessageGroup = new MessageGroup(mainMenuId, [], () => feedback);
      categoryMainMenu.messages.push(new CategoryMenuMessage());
      categoryMainMenu.messages.push(new TextMessage('genie-Okay give me a moment while I analyze your app for any issues related to this tile. Once the detectors load, feel free to click to investigate each topic further.', MessageSender.System, 500));
      categoryMainMenu.messages.push(new DetectorSummaryMessage());
      categoryMainMenu.messages.push(new TextMessage('genie-Did you find what you were looking for?', MessageSender.System, 3000));
      categoryMainMenu.messages.push(new ButtonListMessage(this._getButtonListDidYouFindHelpful(docSearch, 'Search Documentation', showTiles), 'feature', category.name));
      categoryMainMenu.messages.push(new TextMessage('genie-Yes I found the right information.', MessageSender.User));
      categoryMainMenu.messages.push(new TextMessage('genie-Great I\'m glad I could be of help!', MessageSender.System));

      const documentSearch: MessageGroup = new MessageGroup(docSearch, [], () => feedback);
      documentSearch.messages.push(new TextMessage('genie-Search Documentation.', MessageSender.User));
      documentSearch.messages.push(new TextMessage('genie-Please describe your problem below, so I can search relevant documentation and tools that may help you.', MessageSender.System));
      documentSearch.messages.push(new DocumentSearchMessage());
      documentSearch.messages.push(new TextMessage('genie-Was this helpful to finding what you were looking for?', MessageSender.System, 2000));
      documentSearch.messages.push(new ButtonListMessage(this._getButtonListDidYouFindHelpful(moreHelpId, 'I need further assistance', showTiles), 'Was this helpful to finding what you were looking for?', category.name));
      documentSearch.messages.push(new TextMessage('genie-Yes I found the right information.', MessageSender.User));
      documentSearch.messages.push(new TextMessage('genie-Great I\'m glad I could be of help!', MessageSender.System));

      const needMoreHelp: MessageGroup = new MessageGroup(moreHelpId, [], () => feedback);
      needMoreHelp.messages.push(new TextMessage('genie-I need further assistance', MessageSender.User));
      needMoreHelp.messages.push(new TextMessage('genie-Sorry to hear I could not help you solve your problem', MessageSender.System));

      const feedbackGroup: MessageGroup = new MessageGroup(feedback, [], () => mainMenuId);
      feedbackGroup.messages.push(new TextMessage('genie-Please help me improve by providing some feedback. What was my most/least helpful feature? What features would you like to see?', MessageSender.System, 500));
     feedbackGroup.messages.push(new TextMessage('genie-Thank you!'));
      feedbackGroup.messages.push(new TextMessage(`genie-Feel free to continue to explore the tools within ${category.name}`));

      const showAllTiles: MessageGroup = new MessageGroup(showTiles, [], () => mainMenuId);
      showAllTiles.messages.push(new TextMessage('genie-Show Tile Menu.', MessageSender.User));
      showAllTiles.messages.push(new TextMessage(`genie-Here are all the tiles related to ${category.name}:`, MessageSender.System));

      this.messageFlowList.push(welcomeCategory);
      this.messageFlowList.push(categoryMainMenu);
      this.messageFlowList.push(feedbackGroup);
      this.messageFlowList.push(documentSearch);
      this.messageFlowList.push(needMoreHelp);
      this.messageFlowList.push(showAllTiles);

      return messageGroupList;
    }, this));
  }

  private _getButtonListForMoreHelpSearchResponse(mainMenuId: string): any {
    return [{
      title: 'Search',
      type: ButtonActionType.Continue,
      next_key: ''
    },
    {
      title: 'Show Tile Menu',
      type: ButtonActionType.SwitchToOtherMessageGroup,
      next_key: mainMenuId
    }];
  }

  private _getButtonListDidYouFindHelpful(furtherAssistance: string, furtherAssistanceString: string, mainMenuId?: string): any {
    const buttons = [{
      title: 'Yes I found the right information',
      type: ButtonActionType.Continue,
      next_key: ''
    },
    {
      title: furtherAssistanceString,
      type: ButtonActionType.SwitchToOtherMessageGroup,
      next_key: furtherAssistance
    }];

    if (mainMenuId) {
      buttons.push({
        title: 'Show Tile Menu',
        type: ButtonActionType.SwitchToOtherMessageGroup,
        next_key: mainMenuId
      });
    }

    return buttons;
  }

  private _getButtonListDidYouFindHelpfulinNewGenie(furtherAssistance: string, furtherAssistanceString: string, mainMenuId?: string): any {
    const buttons = [{
      title: 'Yes',
      type: ButtonActionType.GetFeedback,
      next_key: 'feedbackhelpful'
    },
    {
      title: 'No',
      type: ButtonActionType.GetFeedback,
      next_key: 'feedbacknothelpful'
    }];

    return buttons;
  }
}
