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
                    token : "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkZTaW11RnJGTm9DMHNKWEdtdjEzbk5aY2VEYyIsImtpZCI6IkZTaW11RnJGTm9DMHNKWEdtdjEzbk5aY2VEYyJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNTIzOTE5OTA1LCJuYmYiOjE1MjM5MTk5MDUsImV4cCI6MTUyMzkyMzgwNSwiX2NsYWltX25hbWVzIjp7Imdyb3VwcyI6InNyYzEifSwiX2NsYWltX3NvdXJjZXMiOnsic3JjMSI6eyJlbmRwb2ludCI6Imh0dHBzOi8vZ3JhcGgud2luZG93cy5uZXQvNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3L3VzZXJzL2NmZmYwMjIwLTgzYTEtNGIyOC1iODZhLTBkZjViZTY3OTdiZi9nZXRNZW1iZXJPYmplY3RzIn19LCJhY3IiOiIxIiwiYWlvIjoiQVZRQXEvOEhBQUFBRHhUcDNZV0xQUjM2dVM1bXkwWDlJeUM4OFNuUGR6K05PbVJIRkd2WHBHLzRFMVVremdpNTV4REVHWkQzb0EwazVRVEI2VFVUbGp3eVpNdW94Qzd2NndqZHVyVnBUbzc2Y29ld0VlU3BJZU09IiwiYW1yIjpbInB3ZCIsInJzYSIsIm1mYSJdLCJhcHBpZCI6ImFiZmEwYTdjLWE2YjYtNDczNi04MzEwLTU4NTU1MDg3ODdjZCIsImFwcGlkYWNyIjoiMiIsImRldmljZWlkIjoiZmJmZTcyMzEtOGI3OS00MDJmLTlkNjgtZmU5NTI4OWYxYzYyIiwiZmFtaWx5X25hbWUiOiJHdXB0YSIsImdpdmVuX25hbWUiOiJTaGVraGFyIiwiaW5fY29ycCI6InRydWUiLCJpcGFkZHIiOiIxMzEuMTA3LjE2MC4xMSIsIm5hbWUiOiJTaGVraGFyIEd1cHRhIiwib2lkIjoiY2ZmZjAyMjAtODNhMS00YjI4LWI4NmEtMGRmNWJlNjc5N2JmIiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTIxMjc1MjExODQtMTYwNDAxMjkyMC0xODg3OTI3NTI3LTEwNzQ0MDA1IiwicHVpZCI6IjEwMDNCRkZEODAxQkM0NDciLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzdWIiOiJ4N2J1N0ZQNi1lcXZLaUFnWXJhRG9XR2R4VW9UUlpybzZJQmEzVXFyODY0IiwidGlkIjoiNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3IiwidW5pcXVlX25hbWUiOiJzaGd1cEBtaWNyb3NvZnQuY29tIiwidXBuIjoic2hndXBAbWljcm9zb2Z0LmNvbSIsInV0aSI6Ilp1VE5lckVYRlV1VUlZOXFIWHRUQUEiLCJ2ZXIiOiIxLjAifQ.QsZS-MOg61xHE6S6XitAJdmgCCFtm6jqRVLaLjRqaNoI7vy2tPmh8Rp8bBzQpi_cexT5PxFkXZxbxJYXRjeWr-srqVuCZi3OiDmouaKrePDVUHJUKXjdT80bPrw8KzdVjOgeyBrugKzcbhf-U79f9nApSEocqW04PNyJTTW4TLb51oeg55WmtSUJOqhwUH3he86jHvOqFAWn_pZisw1zf6Q9xxvT7_YpL1d3ahZqmZRw3eOLrQw-CtJcWiE0wsSOoaE66zc0YA_iRyH7b3wpdrUgbjj-w5gDsLCkcl5FKjmASG5D_ANLFqpclTnE3ppGxcEehQSOu9t2oNiHtsSSYg",
                    subscriptions : null,
                    resourceId: "/subscriptions/ef90e930-9d7f-4a60-8a99-748e0eea69de/resourceGroups/Build2015DemoRG/providers/Microsoft.Web/sites/BuggyBakery"
                }
            )
        }
    }
}