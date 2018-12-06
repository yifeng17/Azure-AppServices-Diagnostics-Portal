import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouteReuseStrategy } from '@angular/router';

import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { CustomReuseStrategy } from './app-route-reusestrategy.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StartupModule } from './startup/startup.module';
import { TestInputComponent } from './shared/components/test-input/test-input.component';
import { ResourceRedirectComponent } from './shared/components/resource-redirect/resource-redirect.component';
import { PUBLIC_CONFIGURATION, DiagnosticDataModule, DiagnosticService, CommsService } from 'applens-diagnostics';
import { GenericApiService } from './shared/services/generic-api.service';
import { GenericCommsService } from './shared/services/generic-comms.service';

@NgModule({
  imports: [
    BrowserModule,
    StartupModule.forRoot(),
    DiagnosticDataModule.forRoot(PUBLIC_CONFIGURATION),
    SharedModule.forRoot(),
    
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: 'test',
        component: TestInputComponent
      },
      {
        path: 'resourceRedirect',
        component: ResourceRedirectComponent
      },
      {
        path: 'resource',
        loadChildren: 'app/resources/resources.module#ResourcesModule'
      }
    ])
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    CustomReuseStrategy,
    { provide: RouteReuseStrategy, useExisting: CustomReuseStrategy },
    { provide: DiagnosticService, useExisting: GenericApiService },
    { provide: CommsService, useExisting: GenericCommsService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }