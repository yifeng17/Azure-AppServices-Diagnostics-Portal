import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {StartupInfo} from '../models/portal';
import { PortalService } from './portal.service';

@Injectable()
export class AuthService {
    public inIFrame: boolean;
    private currentToken: string;

    constructor(private _http: Http, private _portalService: PortalService) {
        this.inIFrame = window.parent !== window;
        this.getStartupInfo().subscribe(info => this.currentToken = info.token);
    }

    getAuthToken(): string {
        return this.currentToken;
    }

    setAuthToken(value: string): void {
        this.currentToken = value;
    }

    getStartupInfo(){
        if (this.inIFrame) {
            return this._portalService.getStartupInfo();
        } else {
            return Observable.of<StartupInfo>(
                <StartupInfo>{
                    sessionId : null,
                    token : "<TOKEN>",
                    subscriptions : null,
                    resourceId: ""
                }
            )
        }
    }
}