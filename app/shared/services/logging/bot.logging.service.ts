import { Injectable } from '@angular/core';
import { LoggingService, PortalService, AuthService, ArmService } from '../';
import { BotEventType } from './events.enumerations';

@Injectable()
export class BotLoggingService extends LoggingService {

    constructor(private _portalService: PortalService, private _authService: AuthService, private _armService: ArmService) {
        super(_portalService, _authService, _armService);
    }

    LogHealthCheckInvoked(): void {
        this._log(BotEventType[BotEventType.HealthCheckInvoked], 'Support Home');
    }
}