import { Injectable } from '@angular/core';
import { flatMap } from 'rxjs/operators';
import { Observable, ReplaySubject } from 'rxjs';
import { PortalService } from '../../startup/services/portal.service';
import { ResourceService } from '../../shared-v2/services/resource.service';
import { Verbs } from '../models/portal';
import { Guid } from '../utilities/guid';
import { TelemetryService, TelemetryEventNames } from 'diagnostic-data';

@Injectable( {
  providedIn: 'root'
})
export class CXPChatCallerService {
  public isChatSupported: boolean;
  private supportedSupportTopicIds: string[];
  public pesId: string = '';
  public readonly cxpChatTagName: string = 'webapps';
  public readonly applensUserAgentForCXPChat: string = 'applensDiagnostics';
  public readonly supportPlanType: string = 'Basic';
  public chatLanguage: string = 'en';

  constructor(private _resourceService: ResourceService, private _portalService: PortalService, private _telemetryService: TelemetryService) {
console.log('----------------------------------');
console.log('ChatCaller instantiated.');
    this.isChatSupported = this._resourceService.isApplicableForLiveChat;
    if (this.isChatSupported) {
      this.supportedSupportTopicIds = this._resourceService.liveChatEnabledSupportTopicIds;
    }


    this._resourceService.getPesId().subscribe(pesId => {
      this.pesId = pesId;
    });
  }
  public testMe(): string {
    return 'Hello world.';
  }
}
