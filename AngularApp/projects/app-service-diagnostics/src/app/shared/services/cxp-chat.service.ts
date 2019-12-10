import { Injectable } from '@angular/core';
import { flatMap } from 'rxjs/operators';
import { Observable, of, forkJoin, ReplaySubject } from 'rxjs';
import { PortalService } from '../../startup/services/portal.service';
import { ResourceService } from '../../shared-v2/services/resource.service';
import { Verbs, StartupInfo } from '../models/portal';
import { Guid } from '../utilities/guid';
import { TelemetryService, TelemetryEventNames } from 'diagnostic-data';

@Injectable()
export class CXPChatService {
  public isChatSupported:boolean;
  private supportedSupportTopicIds:string[];
  public pesId: string = '';
  public readonly cxpChatTagName: string = 'webapps';
  public readonly applensUserAgentForCXPChat: string = 'applensDiagnostics';
  public readonly supportPlanType:string = 'Basic';
  public chatLanguage: string = 'en';

  constructor(private _resourceService: ResourceService, private _portalService: PortalService, private _telemetryService: TelemetryService) {

    this.isChatSupported = this._resourceService.isApplicableForLiveChat;
    if(this.isChatSupported) {
      this.supportedSupportTopicIds = this._resourceService.liveChatEnabledSupportTopicIds;
    }
    

    this._resourceService.getPesId().subscribe(pesId => {
      this.pesId = pesId;            
    });
  }

  public isSupportTopicEnabledForLiveChat(supportTopicIdToCheck:string): boolean  {
    if(!this.isChatSupported) {
      return false;
    }

    if(this.supportedSupportTopicIds.length === 1 && this.supportedSupportTopicIds[0] === '*') {
      return true;
    }
    else {
      supportTopicIdToCheck = supportTopicIdToCheck.toLowerCase();
      let returnValue:boolean = false;

      this.supportedSupportTopicIds.some((currValue : string) => {
        returnValue = (supportTopicIdToCheck === currValue || currValue === '*' );
        return returnValue;
      });
            
      return returnValue;
    }    
  };

  public generateTrackingId() : string {
    return Guid.newGuid();    
  }


  /**
 * @param supportTopicId  Support Topic id for which the chat is being initiated for.
 * @param trackingIdGuid  Guid used for tracking. Get this by calling generateTrackingId().
 * @returns CXP Chat type. If no engineer is available, it will return None, else it will return the type of chat that can be initiated for this support topic.
 */
  public getChatAvailability(supportTopicId:string, trackingIdGuid:string):ReplaySubject<any> {

    
    let input = {
      tagName: this.cxpChatTagName,
      eligibilityParams: {
        productId: this.pesId,
        supportPlanType: this.supportPlanType,
        supportTopicId: supportTopicId,
        language: this.chatLanguage,
        subscriptionId: this._resourceService.subscriptionId
      },
      additionalInfo: {
        resourceId: this._resourceService.resource.id,
        subscriptionId: this._resourceService.subscriptionId
      },
      callerName: this.applensUserAgentForCXPChat,
      trackingId: trackingIdGuid,
      params: {}
    };

    this._portalService.postMessage(Verbs.getChatAvailability, JSON.stringify(input));


    //Wait for the response from the CXP chat API call.
    return this._portalService.getChatAvailability();

  }

  /**
 * @param cxpChatType  Get this from the output of cxpChatService.getChatAvailability call.
 * @param queueForSupportTopic This is the output of getChatAvailability call.
 * @param trackingIdGuid  Guid used for tracking. Get this by calling generateTrackingId().
 * @returns Chat URL string. This can be an empty string if no agents are available or if the queue is not found. Always handle for empty string.
 */
  public buildChatUrl(cxpChatType:string, queueForSupportTopic:any, trackingIdGuid:string ):Observable<string> {

    let input = {
      chatAvailability: {
        chatType: cxpChatType,
        queue: queueForSupportTopic
      },
      trackingId: trackingIdGuid,
      callerName: this.applensUserAgentForCXPChat,
      additionalInfo: {}
    };

    this._portalService.postMessage(Verbs.buildChatUrl, JSON.stringify(input));


    //Wait for the response from the CXP chat API call.
    return this._portalService.buildChatUrl().pipe(flatMap( (chatUrl) =>{
      let stringToLog = '';
      let returnValue = '';
      if(chatUrl && chatUrl != '') {
        stringToLog = chatUrl;
        returnValue = chatUrl;
      }
      else {
        if(chatUrl === '') {
          stringToLog = 'Empty URL returned. Likely cause, no engineer available.';          
        }
        else {
          stringToLog = 'NULL object returned. Likely cause, unknown. Followup with CXP team with trackingId.';
        }      
      }

      this._telemetryService.logEvent(TelemetryEventNames.BuildCXPChatUrl, {
        "trackingId": trackingIdGuid,
        "passedInput" : JSON.stringify(input),          
        "returnValue": stringToLog
      });
      return Observable.of(returnValue);

    } ));

  }

  
/**
 * @param supportTopicId  Support Topic id for which the chat is being initiated for.
 * @param trackingIdGuid  Guid used for tracking. Get this by calling generateTrackingId().
 * @returns Chat URL string. This can be an empty string if no agents are available or if the queue is not found. Always handle for empty string.
 */
    public getChatURL( supportTopicId:string, trackingIdGuid:string):Observable<string> {
      let input = {
        tagName: this.cxpChatTagName,
        eligibilityParams: {
        productId: this.pesId,
        supportTopicId: supportTopicId,
        language: this.chatLanguage,
        subscriptionId: this._resourceService.subscriptionId
      },
      additionalInfo: {
        resourceId: this._resourceService.resource.id,
        subscriptionId: this._resourceService.subscriptionId
      },
      callerName: this.applensUserAgentForCXPChat,
      trackingId: trackingIdGuid
    };

    //Make a call to the CXP Chat API to get the URL, the call is piped via SCI Frame blade in the portal.
    this._portalService.postMessage(Verbs.getChatUrl, JSON.stringify(input));


    //Wait for the response from the CXP chat API call.
    return this._portalService.getChatUrl().pipe(flatMap( (chatUrl) =>{
      let stringToLog = '';
      let returnValue = '';
      if(chatUrl && chatUrl != '') {
        stringToLog = chatUrl;
        returnValue = chatUrl;
      }
      else {
        if(chatUrl === '') {
          stringToLog = 'Empty URL returned. Likely cause, no engineer available.';
        }
        else {
          stringToLog = 'NULL object returned. Likely cause, unknown. Followup with CXP team with trackingId.';          
        }        
      }

      this._telemetryService.logEvent(TelemetryEventNames.GetCXPChatURL, {
        "trackingId": trackingIdGuid,
        "passedInput" : JSON.stringify(input),          
        "returnValue": stringToLog
      });

      return Observable.of(returnValue);
    } ));

  }

  /**
 * @param userAction Which button did the user click on
 * @param trackingIdGuid  Guid used for tracking. This is the trackingId for which the Chat was initiated.
 * @param chatUrl  The chat URL that is being opened.
 */
  public logUserActionOnChat(userAction:string, trackingIdGuid:string, chatUrl:string):void {
    let notificationMessage = {
      "trackingId": trackingIdGuid,
      "userAction": userAction,
      "chatUrl": chatUrl
    };

    this._telemetryService.logEvent(TelemetryEventNames.CXPChatURLOpened, notificationMessage);

    //When CXP API is ready to receive a message from us on chat opened, uncomment this line and call their API in the Ibiza project SCIFrameBlade _notifyChatOpened method
    //this._portalService.postMessage(Verbs.notifyChatOpened, JSON.stringify(notificationMessage) );
  }  
}
