import { AdalService } from 'adal-angular4';
import { DiagnosticDataModule, UnhandledExceptionHandlerService } from 'diagnostic-data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { Http } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    ActivatedRouteSnapshot, Resolve, Router, RouterModule, UrlSerializer
} from '@angular/router';
import { AppComponent } from './app.component';
import { AadAuthGuard } from './shared/auth/aad-auth-guard.service';
import { LoginComponent } from './shared/components/login/login.component';
import { ArmResource, ResourceServiceInputs } from './shared/models/resources';
import { CustomUrlSerializerService } from './shared/services/custom-url-serializer.service';
import { StartupService } from './shared/services/startup.service';
import { SharedModule } from './shared/shared.module';

@Injectable()
export class ValidResourceResolver implements Resolve<void>{

  constructor(private _startupService: StartupService, private _http: Http, private _router: Router) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this._http.get('assets/enabledResourceTypes.json').pipe(map(response => {
      let resource = <ArmResource>route.params;
      let type = `${resource.provider}/${resource.resourceTypeName}`

      if (response && response.json().enabledResourceTypes) {

        let enabledResourceTypes = <ResourceServiceInputs[]>response.json().enabledResourceTypes;
        let matchingResourceInputs = enabledResourceTypes.find(t => t.resourceType == type);

        if (matchingResourceInputs) {
          matchingResourceInputs.armResource = resource;
          this._startupService.setResource(matchingResourceInputs);
          return matchingResourceInputs;
        }
      }

      //TODO: below does not seem to work
      this._router.navigate(['/']);
      return `Resource Type '${type}' not enabled in Applens`;
    }));
  }
}

export const Routes = RouterModule.forRoot([
  {
    path: '',
    canActivate: [AadAuthGuard],
    children: [
      {
        path: '',
        children: [
          {
            path: '',
            loadChildren: './modules/main/main.module#MainModule'
          },
          {
            path: 'admin',
            loadChildren: './modules/admin/admin.module#AdminModule'
          },
          {
            path: 'sites/:site',
            loadChildren: './modules/site/site.module#SiteModule'
          },
          {
            path: 'hostingEnvironments/:hostingEnvironment',
            loadChildren: './modules/ase/ase.module#AseModule'
          },
          {
            path: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/:resourceTypeName/:resourceName',
            redirectTo: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/providers/Microsoft.Web/:resourceTypeName/:resourceName'
          },
          {
            path: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/providers/:provider/:resourceTypeName/:resourceName',
            loadChildren: './modules/dashboard/dashboard.module#DashboardModule',
            resolve: { validResources: ValidResourceResolver }
          },
          {
            path: 'caseCleansing',
            loadChildren: './modules/casecleansing/casecleansing.module#CasecleansingModule'
          }
        ]
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
]);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    DiagnosticDataModule.forRoot(),
    Routes,
    SharedModule.forRoot()
  ],
  providers: [
    ValidResourceResolver,
    AdalService,
    {
      provide: UrlSerializer,
      useClass: CustomUrlSerializerService
    },
    {
      provide: ErrorHandler,
      useClass: UnhandledExceptionHandlerService
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
