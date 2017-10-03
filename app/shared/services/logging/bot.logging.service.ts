import { Injectable } from '@angular/core';
import { LoggingService, PortalService, AuthService } from '../';
import { BotEventType } from './events.enumerations';

@Injectable()
export class BotLoggingService extends LoggingService {

    constructor(private _portalService: PortalService, private _authService: AuthService) {
        super(_portalService, _authService);
    }

    LogHealthCheckInvoked(): void {
        this._log(BotEventType[BotEventType.HealthCheckInvoked], 'Support Home');
    }
}