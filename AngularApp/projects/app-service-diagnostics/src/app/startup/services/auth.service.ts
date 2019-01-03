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
        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5iQ3dXMTF3M1hrQi14VWFYd0tSU0xqTUhHUSIsImtpZCI6Im5iQ3dXMTF3M1hrQi14VWFYd0tSU0xqTUhHUSJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNTQ2NDU3MDI5LCJuYmYiOjE1NDY0NTcwMjksImV4cCI6MTU0NjQ2MDkyOSwiX2NsYWltX25hbWVzIjp7Imdyb3VwcyI6InNyYzEifSwiX2NsYWltX3NvdXJjZXMiOnsic3JjMSI6eyJlbmRwb2ludCI6Imh0dHBzOi8vZ3JhcGgud2luZG93cy5uZXQvNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3L3VzZXJzLzM4MjBjZWE1LWEzYWQtNDU4MC1iZjg0LTkxNTJiOTNiYzY4Ni9nZXRNZW1iZXJPYmplY3RzIn19LCJhY3IiOiIxIiwiYWlvIjoiQVVRQXUvOEpBQUFBYlNqQnNXTzcvQmhpTkg4MmZ0YXdxdXdJbDVzQm9ybzA4Q1V1VEhOUG03TG9Ra3p2YmhHcXBUNWVZekpQZWJ5MkRmUWhaRUJJNUpIVEgwdjRBRGN3UHc9PSIsImFtciI6WyJyc2EiLCJtZmEiXSwiYXBwaWQiOiJjNDRiNDA4My0zYmIwLTQ5YzEtYjQ3ZC05NzRlNTNjYmRmM2MiLCJhcHBpZGFjciI6IjIiLCJkZXZpY2VpZCI6ImY3MjY2OTU4LTRlYWUtNGJkNy05NjJkLWEyYWFiMzg5N2ZkYSIsImZhbWlseV9uYW1lIjoiUGVuZyIsImdpdmVuX25hbWUiOiJDaW5keSIsImlwYWRkciI6IjE2Ny4yMjAuMi4xODAiLCJuYW1lIjoiQ2luZHkgUGVuZyIsIm9pZCI6IjM4MjBjZWE1LWEzYWQtNDU4MC1iZjg0LTkxNTJiOTNiYzY4NiIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS0yMTI3NTIxMTg0LTE2MDQwMTI5MjAtMTg4NzkyNzUyNy0zMjQ4NTQzNyIsInB1aWQiOiIxMDAzQkZGRDk4NzMzMkREIiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiWmNOU0pXVDNYd0tOLUE0cjd0cUUxZG1fRXdZbjZmMmxEYzlLamMtVXhOOCIsInRpZCI6IjcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyIsInVuaXF1ZV9uYW1lIjoieGlwZW5nQG1pY3Jvc29mdC5jb20iLCJ1cG4iOiJ4aXBlbmdAbWljcm9zb2Z0LmNvbSIsInV0aSI6Im9NTFJsWDRHY0VHQkJHbzNxMUFmQUEiLCJ2ZXIiOiIxLjAifQ.kyq5gNbf8gqvswnuH_61M3nriTCMFpMjh1uaUyz05nY3HZkFy51ggfzleBlvXZyhR9hlUmq8xTpaLzj49z1PIFHW2LPyoaZ1mbfZsu5JdblD_IIsLpQeow_YTmXTSzfmb4Q04BbsbWEOQ24-SxzBg6TjmYcGGWg3Ria3O1Hv8jnR0tGQaU-XNxaHIrZORzuAECjP8W-nvd767_e4Zc8RJJY98VsnTS_kAJTvwaQ7mcS3nxv44WUqSvNI0BV60bTI_2ks2Ck7X0sHm0LvlmsCQ55B8m8Hm2AP4atHVH621J9G5KL3xK12GQ-a77A6PbwwL_kQhS8eIPXyuT13jfSetg',
        subscriptions: null,
        resourceId: '/subscriptions/1402be24-4f35-4ab7-a212-2cd496ebdf14/resourceGroups/badsites/providers/Microsoft.Web/sites/highcpuscenario/',
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
