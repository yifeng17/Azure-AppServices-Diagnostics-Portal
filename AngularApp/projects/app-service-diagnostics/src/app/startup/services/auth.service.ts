import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable ,  of } from 'rxjs';
import { StartupInfo, ResourceType } from '../../shared/models/portal';
import { PortalService } from './portal.service';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthService {
    public inIFrame: boolean;
    private currentToken: string;

    public resourceType: ResourceType;

    private localStartUpInfo: StartupInfo = <StartupInfo>{
        sessionId: '',
        token: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5iQ3dXMTF3M1hrQi14VWFYd0tSU0xqTUhHUSIsImtpZCI6Im5iQ3dXMTF3M1hrQi14VWFYd0tSU0xqTUhHUSJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNTQ3NzY1OTg3LCJuYmYiOjE1NDc3NjU5ODcsImV4cCI6MTU0Nzc2OTg4NywiX2NsYWltX25hbWVzIjp7Imdyb3VwcyI6InNyYzEifSwiX2NsYWltX3NvdXJjZXMiOnsic3JjMSI6eyJlbmRwb2ludCI6Imh0dHBzOi8vZ3JhcGgud2luZG93cy5uZXQvNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3L3VzZXJzL2IwY2Q2OTExLWRmNTAtNGQyZS05MGQ0LThiMzQ0ZjRmOGQyZC9nZXRNZW1iZXJPYmplY3RzIn19LCJhY3IiOiIxIiwiYWlvIjoiQVZRQXEvOEtBQUFBYW5kYUVUZC9BZ2xZNTFxYkg5cEFjczhVeTJzZUxHZVU2ZXE0K0NjS2p0ZkRzcTZlYVl2Qm1kUGp6VEljWVF3c0JPQzBBM0pQaWRtYml3cUVGQWtmUUorei9ORTk1RkZwTGQ1S054TGU0aUk9IiwiYW1yIjpbInJzYSIsIm1mYSJdLCJhcHBpZCI6IjE5NTBhMjU4LTIyN2ItNGUzMS1hOWNmLTcxNzQ5NTk0NWZjMiIsImFwcGlkYWNyIjoiMCIsImRldmljZWlkIjoiMDE4MzBkZjEtZTczYy00ODllLTg0OWEtN2U5OWU3NGFmMjZjIiwiZmFtaWx5X25hbWUiOiJFcm5zdCIsImdpdmVuX25hbWUiOiJTdGV2ZSIsImlwYWRkciI6IjE2Ny4yMjAuMi4yNDgiLCJuYW1lIjoiU3RldmUgRXJuc3QiLCJvaWQiOiJiMGNkNjkxMS1kZjUwLTRkMmUtOTBkNC04YjM0NGY0ZjhkMmQiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtMjEyNzUyMTE4NC0xNjA0MDEyOTIwLTE4ODc5Mjc1MjctMTY0NDc4MjMiLCJwdWlkIjoiMTAwM0JGRkQ4RTE1OUE1MSIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6Ilhqb1N3ODdhamtNU3YwbHhPMFIwU0xrT2FzRmlPM1BDeVRqbUJfazlqRmciLCJ0aWQiOiI3MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDciLCJ1bmlxdWVfbmFtZSI6InN0ZXJuc0BtaWNyb3NvZnQuY29tIiwidXBuIjoic3Rlcm5zQG1pY3Jvc29mdC5jb20iLCJ1dGkiOiIwQlVFNU55VlgwNjgxWnB5UnlRa0FBIiwidmVyIjoiMS4wIn0.QkUU5yy5Nky_Y84YHOvX-5uHQXRVym2vgOC9FpfZb0ep0OkVkMPL1H9UBFCNYdgsort77l1OxexAEQDF-bjB3WlVrPaaPsJaTjRP1GVBFoGEEU2fJRW5QdQizrkHuT3Yh67-WMA6qb9t35_2hV2PnGsfRWT7YGgS1BFDfEp0rvBHIRv1OhqUQJ7GTAlo5hLdAaI7nMOPNS847BFPS6rdKgbbJbtM4IJOj66TaIbEeZmlGQTUvBGfQ_BkkTghrW67thJvW6uS-IS4UM-2qiMLJtSZzrkxFIzl0qEYjZ6fdJYWb7IRQMoPXh_YSk0boNarGfnYc7EnV_gG31bGDzFjDw',
        subscriptions: null,
        resourceId: '/subscriptions/ef90e930-9d7f-4a60-8a99-748e0eea69de/resourceGroups/build2015demorg/providers/Microsoft.Web/sites/BuggyBakery',
        workflowId: '',
        supportTopicId: ''
    };

    public get hasLocalStartupInfo() {
        return this.localStartUpInfo && this.localStartUpInfo.token && this.localStartUpInfo.resourceId;
    }

    constructor(private _http: Http, private _portalService: PortalService) {
        this.inIFrame = window.parent !== window;
    }

    getAuthToken(): string {
        return this.currentToken;
    }

    setAuthToken(value: string): void {
        this.currentToken = value;
    }

    setStartupInfo(token: string, resourceId: string) {
        this.localStartUpInfo.token = token;
        this.localStartUpInfo.resourceId = resourceId;
        this.currentToken = token;
    }

    getStartupInfo(): Observable<StartupInfo> {
        let startupInfo: Observable<StartupInfo>;
        if (this.inIFrame) {
            startupInfo = this._portalService.getStartupInfo();
        } else {
            if (this.localStartUpInfo.token.startsWith('Bearer ')) {
                this.localStartUpInfo.token = this.localStartUpInfo.token.replace('Bearer ', '');
            }
            startupInfo = of<StartupInfo>(this.localStartUpInfo);
        }

        return startupInfo.pipe(
            map((info: StartupInfo) => {
                if (info && info.resourceId) {
                    info.resourceId = info.resourceId.toLowerCase();

                    this.currentToken = info.token;

                    if (!this.resourceType) {
                        this.resourceType = info.resourceId.toLowerCase().indexOf('hostingenvironments') > 0 ? ResourceType.HostingEnvironment : ResourceType.Site;
                    }

                    info.resourceType = this.resourceType;
                    return info;
                }
            }));
    }
}
