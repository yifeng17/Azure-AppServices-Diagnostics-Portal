
import {map,  mergeMap, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResourceService } from './resource.service';
import { BackendCtrlService } from '../../shared/services/backend-ctrl.service';

@Injectable()
export class ContentService {

  content: any[] = [
    // {
    //   title: 'Tutorial: Bind an existing custom SSL certificate to Azure W
    //   description: 'Azure Web Apps provides a highly scalable, self-patching web hosting service. This tutorial shows you how to bind a custom SSL certificate that you purchased from a trusted certificate authority to Azure Web Apps. When you\'re finished, you\'ll be able to access your web app at the HTTPS endpoint of your custom DNS domain.',
    //   link: 'https://docs.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-ssl'
    // },
    // {
    //   title: 'Buy and Configure an SSL Certificate for your Azure App Service',
    //   description: 'This tutorial shows you how to secure your web app by purchasing an SSL certificate for your Azure App Service, securely storing it in Azure Key Vault, and associating it with a custom domain.',
    //   link: 'https://docs.microsoft.com/en-us/azure/app-service/web-sites-purchase-ssl-web-site'
    // }
  ];

  private ocpApimKeyBehaviorSubject: BehaviorSubject<string> = new BehaviorSubject<string>('225eeab6c54e469189e3b6a1b5d00c1a');
  private ocpApimKey: string = '225eeab6c54e469189e3b6a1b5d00c1a';

  constructor(private _http: HttpClient, private _resourceService: ResourceService, private _backendApi: BackendCtrlService) {

    // this._backendApi.get<string>(`api/appsettings/ContentSearch:Ocp-Apim-Subscription-Key`).subscribe((value: string) =>{
    //   this.ocpApimKeyBehaviorSubject.next(value);
    //   this.ocpApimKey = value;
    // });

  }

  getContent(searchString?: string): Observable<any[]> {
    const searchResults = searchString ? this.content.filter(article => {
      return article.title.indexOf(searchString) != -1
        || article.description.indexOf(searchString) != -1;
    }) : this.content;

    return of(searchResults);
  }

  searchWeb(questionString: string, resultsCount: string = '3'): Observable<any> {
    const searchSuffix = this._resourceService.searchSuffix;
    console.log("search suffix", searchSuffix);
    const query = encodeURIComponent(`${questionString} AND ${searchSuffix}`);
    const url = `https://api.cognitive.microsoft.com/bing/v7.0/search?q='${query}'&count=${resultsCount}`;

    return this._http.get(url, { headers: {'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': this.ocpApimKey}});

    // return this.ocpApimKeyBehaviorSubject.pipe(
    //   mergeMap((key:string)=>{
    //     return this._http.get(url, { headers: this.getWebSearchHeaders() }).pipe(map(response => response));
    //   })
    // );
  }

  private getWebSearchHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    headers.set('Ocp-Apim-Subscription-Key', this.ocpApimKey);
    console.log("apiheaders", this.ocpApimKey, headers);
    console.log("headersvalue", headers.keys);
    return headers;
  }

}

export interface SearchResults {
  queryContext: { originalQuery: string };

}


