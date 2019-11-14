import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, flatMap } from 'rxjs/operators';
import { Observable, of, forkJoin, ReplaySubject } from 'rxjs';
import { PortalService } from '../../startup/services/portal.service';
import { ResourceService } from '../../shared-v2/services/resource.service';
import { WebSitesService } from '../../resources/web-sites/services/web-sites.service';
import { AppType, Verbs, LogEntryLevel } from '../models/portal';
import { Guid } from '../utilities/guid';
import { ObservationsAvailabilityComponent } from '../../availability/observations/observations-availability.component';
import { TelemetryService, TelemetryEventNames } from 'diagnostic-data';

@Injectable()
export class CXPChatService {
  public isChatSupported:boolean;
  private supportedSupportTopics:string[];
  public pesId: string = '';
  public readonly cxpChatTagName: string = 'webapps';
  public readonly applensUserAgentForCXPChat: string = 'applensDiagnostics';
  public readonly supportPlanType:string = 'Basic';
  public chatLanguage: string = 'en';

  constructor(private _resourceService: ResourceService, private _portalService: PortalService, private _telemetryService: TelemetryService) {

    if(this._resourceService && this._resourceService instanceof WebSitesService && (this._resourceService as WebSitesService).appType === AppType.WebApp) {
      //Chat supported for webapps only at the moment
      this.isChatSupported = true;
    }
    else
    {
      if(_resourceService.armResourceConfig && _resourceService.armResourceConfig.liveChatConfig && typeof _resourceService.armResourceConfig.liveChatConfig.isApplicableForLiveChat == 'boolean') {
        this.isChatSupported = _resourceService.armResourceConfig.liveChatConfig.isApplicableForLiveChat;
      }
      else {
        if(this._resourceService && this._resourceService instanceof WebSitesService && (this._resourceService as WebSitesService).appType === AppType.FunctionApp) {
          //This is for function apps
          this.isChatSupported = false;
        }
        else {
          //This is for function  ASE
          this.isChatSupported = false;
        }        
      }
    }

    this._resourceService.getPesId().subscribe(pesId => {
      this.pesId = pesId;
      if(this.pesId == '16333') {
        //Web app for containers. Disable chat. 
        this.isChatSupported = false;
      }
      
      if(this.isChatSupported) {
        if(this._resourceService && this._resourceService instanceof WebSitesService) {
          this.initSupportTopicsForSites((this._resourceService as WebSitesService).appType, this.pesId);
        }
        else {
          if(this._resourceService.resource.type === 'Microsoft.Web/hostingEnvironments') {
            this.initSupportTopicsForASE();
          }
          else {
            if(this._resourceService && 
              this._resourceService.armResourceConfig && 
              this._resourceService.armResourceConfig.liveChatConfig && 
              this._resourceService.armResourceConfig.liveChatConfig.supportTopics && 
              this._resourceService.armResourceConfig.liveChatConfig.supportTopics.length > 0 ) {
                this.supportedSupportTopics = this._resourceService.armResourceConfig.liveChatConfig.supportTopics;
           }
          }
        }
      }
    });
  }


  private initSupportTopicsForSites(currAppType : AppType, pesId : string) {
    if(currAppType === AppType.WebApp) {
      if(pesId === '14748') {
        //Web app Windows
        this.supportedSupportTopics = [
          '32583701', //Availability and Performance/Web App experiencing High CPU
          '32542218', //Availability and Performance/Web App Down
          '32581616', //Availability and Performance/Web App experiencing High Memory Usage
          '32457411', //Availability and Performance/Web App Slow
          '32570954', //Availability and Performance/Web App Restarted
          '32440123', //Configuration and Management/Configuring SSL
          '32440122', //Configuration and Management/Configuring custom domain names
          '32542210', //Configuration and Management/IP Configuration
          '32581615', //Configuration and Management/Deployment Slots
          '32542208', //Configuration and Management/Backup and Restore
          '32589277', //How Do I/Configure domains and certificates,
          '32589281', //How Do I/IP Configuration
          '32588774', // Deployment/Visual Studio
          '32589276' //How Do I/Backup and Restore
        ];
      } else if(pesId === '16170') {
        //Web app Linux
        this.supportedSupportTopics = [
          '32440123', //Configuration and Management/Configuring SSL
          '32440122', //Configuration and Management/Configuring custom domain names
          '32542208', //Configuration and Management/Backup and Restore
          '32542210' //Configuration and Management/IP Configuration
        ];        
      } else if(pesId === '16333') {
        //Web app for containers
        this.supportedSupportTopics = [];
      }
    } 
    else {
      if(currAppType === AppType.FunctionApp) {        
        this.supportedSupportTopics = [];
      }
    }   
  }

  private initSupportTopicsForASE() {
    this.supportedSupportTopics = [];
  }  
  
  public isSupportTopicEnabledForLiveChat(supportTopicIdToCheck:string): boolean  {
    if(!this.isChatSupported) {
      return false;
    }

    if(this.supportedSupportTopics.length === 1 && this.supportedSupportTopics[0] === '*') {
      return true;
    }
    else {
      supportTopicIdToCheck = supportTopicIdToCheck.toLowerCase();
      let returnValue:boolean = false;

      this.supportedSupportTopics.some((currValue : string) => {
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

      if(chatUrl && chatUrl != '') {
        this._telemetryService.logEvent(TelemetryEventNames.BuildCXPChatUrl, {
          "trackingId": trackingIdGuid,
          "passedInput" : JSON.stringify(input),          
          "returnValue": chatUrl
        });

        return Observable.of(chatUrl);
      }
      else {
        if(chatUrl === '') {
          this._telemetryService.logEvent(TelemetryEventNames.BuildCXPChatUrl, {
            "trackingId": trackingIdGuid,
            "passedInput" : JSON.stringify(input),          
            "returnValue": 'Empty URL returned. Likely cause, no engineer available.'
          });
        }
        else {
          this._telemetryService.logEvent(TelemetryEventNames.BuildCXPChatUrl, {
            "trackingId": trackingIdGuid,
            "passedInput" : JSON.stringify(input),          
            "returnValue": 'NULL object returned. Likely cause, unknown. Followup with CXP team with trackingId.'
          });
        }
        return Observable.of('');
      }
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

      if(chatUrl && chatUrl != '') {
        this._telemetryService.logEvent(TelemetryEventNames.GetCXPChatURL, {
          "trackingId": trackingIdGuid,
          "passedInput" : JSON.stringify(input),          
          "returnValue": chatUrl
        });

        return Observable.of(chatUrl);
      }
      else {
        if(chatUrl === '') {
          this._telemetryService.logEvent(TelemetryEventNames.GetCXPChatURL, {
            "trackingId": trackingIdGuid,
            "passedInput" : JSON.stringify(input),
            "returnValue": 'Empty URL returned. Likely cause, no engineer available.'
          });
        }
        else {
          this._telemetryService.logEvent(TelemetryEventNames.GetCXPChatURL, {
            "trackingId": trackingIdGuid,
            "passedInput" : JSON.stringify(input),          
            "returnValue": 'NULL object returned. Likely cause, unknown. Followup with CXP team with trackingId.'
          });
        }

        return Observable.of('');
      }
    } ));

  }

  /**
 * @param trackingIdGuid  Guid used for tracking. This is the trackingId for which the Chat was initiated.
 * @param chatUrl  The chat URL that is being opened.
 */
  public logChatURLOpened(trackingIdGuid:string, chatUrl:string):void {
    let notificationMessage = {
      "trackingId": trackingIdGuid,
      "chatUrl": chatUrl
    };

    this._telemetryService.logEvent(TelemetryEventNames.CXPChatURLOpened, notificationMessage);

    //When CXP API is ready to receive a message from us on chat opened, uncomment this line and call their API in the Ibiza project SCIFrameBlade _notifyChatOpened method
    //this._portalService.postMessage(Verbs.notifyChatOpened, JSON.stringify(notificationMessage) );
  }

}
