import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {PortalService} from './portal.service';
import {StartupInfo} from '../models/portal';

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
                    token : "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjJLVmN1enFBaWRPTHFXU2FvbDd3Z0ZSR0NZbyIsImtpZCI6IjJLVmN1enFBaWRPTHFXU2FvbDd3Z0ZSR0NZbyJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNTA5NTkzNjYxLCJuYmYiOjE1MDk1OTM2NjEsImV4cCI6MTUwOTU5NzU2MSwiX2NsYWltX25hbWVzIjp7Imdyb3VwcyI6InNyYzEifSwiX2NsYWltX3NvdXJjZXMiOnsic3JjMSI6eyJlbmRwb2ludCI6Imh0dHBzOi8vZ3JhcGgud2luZG93cy5uZXQvNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3L3VzZXJzL2IwY2Q2OTExLWRmNTAtNGQyZS05MGQ0LThiMzQ0ZjRmOGQyZC9nZXRNZW1iZXJPYmplY3RzIn19LCJhY3IiOiIxIiwiYWlvIjoiWTJOZ1lLaGF5Qk5rVWxQMk0yUkN5M0orVnl0LzI3bTczZ1MxZkxyTGMrUGhKODNNaER3QSIsImFtciI6WyJ3aWEiLCJtZmEiXSwiYXBwaWQiOiIxOTUwYTI1OC0yMjdiLTRlMzEtYTljZi03MTc0OTU5NDVmYzIiLCJhcHBpZGFjciI6IjAiLCJlX2V4cCI6MjYyODAwLCJmYW1pbHlfbmFtZSI6IkVybnN0IiwiZ2l2ZW5fbmFtZSI6IlN0ZXZlIiwiaW5fY29ycCI6InRydWUiLCJpcGFkZHIiOiIxMzEuMTA3LjE0Ny44NSIsIm5hbWUiOiJTdGV2ZSBFcm5zdCIsIm9pZCI6ImIwY2Q2OTExLWRmNTAtNGQyZS05MGQ0LThiMzQ0ZjRmOGQyZCIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS0yMTI3NTIxMTg0LTE2MDQwMTI5MjAtMTg4NzkyNzUyNy0xNjQ0NzgyMyIsInB1aWQiOiIxMDAzQkZGRDhFMTU5QTUxIiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiWGpvU3c4N2Fqa01TdjBseE8wUjBTTGtPYXNGaU8zUEN5VGptQl9rOWpGZyIsInRpZCI6IjcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyIsInVuaXF1ZV9uYW1lIjoic3Rlcm5zQG1pY3Jvc29mdC5jb20iLCJ1cG4iOiJzdGVybnNAbWljcm9zb2Z0LmNvbSIsInV0aSI6InFUNFY3V3ZjWVU2eHlHcDJFMm9MQUEiLCJ2ZXIiOiIxLjAifQ.bQLNjH1iagQO7ep66L-pWiR1PBcd-PN02yXjjz1N2CSh3UmPLm5D-sqyvShdFZdpzRRPUIFSnFOhHthhhu3V8r95CAhJv_wCQZQSF16g2WuLIubvFu31iXiRNFtKIiGhyn5Dqjz-fSR3KiG5W_fpW7GmCsJMn8ScloOFCviKXYOcWpcIU7XdRj_vRUIA0fnmm1ryEMOj-C444VMBLiK4uxKi-sUZzpuFuNcZL5zqkHG2xdRRdmwhlafq6lniTBySurNXUANO9LJucyOFbtEXP9n_jmRDuVvOqI0QyXUvGs5HUGrgyV4fHJ18qABE4jLWNtD6iRQyaD7hkRoPeImdiw",
                    subscriptions : null,
                    resourceId: "/subscriptions/ef90e930-9d7f-4a60-8a99-748e0eea69de/resourceGroups/Build2015DemoRG/providers/Microsoft.Web/sites/BuggyBakery"
                }
            )
        }
    }
}