import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http"
import { Observable } from 'rxjs';
import { Query, Document , DocumentSearchConfiguration } from 'diagnostic-data';
import { BackendCtrlService } from '../../shared/services/backend-ctrl.service';


@Injectable({
  providedIn:"root"
})
export class DocumentSearchService {
  private authKey: string = "";
  private url : string = "";
  private _config : DocumentSearchConfiguration;
  private featureEnabledForProduct: boolean = false;

  httpOptions = {}

  constructor(  private http: HttpClient,
                private _backendApi :BackendCtrlService
              ) {

      this._config = new DocumentSearchConfiguration();;

      this._backendApi.get<string>(`api/appsettings/DeepSearch:Endpoint`).subscribe((value: string) =>{
        this.url = value;
      });

      this._backendApi.get<string>(`api/appsettings/DeepSearch:AuthKey`).subscribe((value: string) =>{
        this.authKey = value;
        this.httpOptions = {
          headers: new HttpHeaders({
            "Content-Type" : "application/json",
            "authKey" : this.authKey
          })
        };
      });

  }

  public IsEnabled(pesId : string, isPublic : boolean) : Observable<boolean> {
    // featureEnabledForProduct is disabled by default
    if ( pesId && pesId.length >0 && ( (isPublic && this._config.documentSearchEnabledPesIds.findIndex(x => x==pesId)>=0) ||
                              (!isPublic && this._config.documentSearchEnabledPesIdsInternal.findIndex(x => x==pesId)>=0)
                            )
        ){
          this.featureEnabledForProduct = true;
    }

    return this._backendApi.get<string>(`api/appsettings/DeepSearch:isEnabled`)
                            // Value in App Service Application Settings are returned as strings
                            // converting this to boolean
                            .map(status =>  ( status.toLowerCase() == "true" && this.featureEnabledForProduct) );


  }

  private constructUrl(query: Query) : string{
    let  queryString = Object.keys(query).map(key => {
      if(typeof (query[key] ) === "object" ){
        return query[key].map( value => {
          if (value != "")
            return key + "=" + value
          }).join("&");
      }
      else
        return key + '=' + query[key]
    }).join("&");

    return queryString;
  }

  public Search(query): Observable<Document[]> {
    let queryString = this.constructUrl(query);
    let url = this.url  + "?" +queryString;
    return this.http.get<Document[]>(url, this.httpOptions)

  }

}
