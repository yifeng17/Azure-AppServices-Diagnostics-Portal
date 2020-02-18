import {
    CommsService, DiagnosticDataModule, DiagnosticService, DiagnosticSiteService,
    PUBLIC_DEV_CONFIGURATION, PUBLIC_PROD_CONFIGURATION, SolutionService, SettingsService, GenieGlobals
} from 'diagnostic-data';
import { SiteService } from 'projects/app-service-diagnostics/src/app/shared/services/site.service';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import {
    KustoTelemetryService
} from '../../../diagnostic-data/src/lib/services/telemetry/kusto-telemetry.service';
// import {
//     GenieGlobals
// } from '../../../diagnostic-data/src/lib/services/genie.service';
import {
    UnhandledExceptionHandlerService
} from '../../../diagnostic-data/src/lib/services/unhandled-exception-handler.service';
import { environment } from '../environments/environment';
import { CustomReuseStrategy } from './app-route-reusestrategy.service';
import { AppComponent } from './app.component';
import {
    ResourceRedirectComponent
} from './shared/components/resource-redirect/resource-redirect.component';
import { TestInputComponent } from './shared/components/test-input/test-input.component';
import { GenericApiService } from './shared/services/generic-api.service';
import { GenericCommsService } from './shared/services/generic-comms.service';
import { GenericSolutionService } from './shared/services/generic-solution.service';
import { LocalBackendService } from './shared/services/local-backend.service';
import { PortalKustoTelemetryService } from './shared/services/portal-kusto-telemetry.service';
import { SharedModule } from './shared/shared.module';
import { ResourceService } from './shared-v2/services/resource.service';
import { WebSitesService } from './resources/web-sites/services/web-sites.service';
import { ContentService } from './shared-v2/services/content.service';
import { CategoryChatStateService } from './shared-v2/services/category-chat-state.service';
// import { HomeModule } from './home/home.module';
import { StartupModule } from './startup/startup.module';
import {CustomMaterialModule} from './material-module';
import { PortalSettingsService } from './shared/services/settings.service';
import { AppInsightsService } from './shared/services/appinsights/appinsights.service';
import { AppInsightsQueryService } from './../../../diagnostic-data/src/lib/services/appinsights.service';
import { HighchartsChartModule } from 'highcharts-angular';
import { AngularReactBrowserModule } from '@angular-react/core';
import { Globals } from './globals';
// import { FabNavModule } from 'diagnostic-data';
// import { FabricFeedbackComponent } from './fabric-ui/components/fabric-feedback/fabric-feedback.component';
// import { FabricFeedbackContainerComponent } from './fabric-ui/components/fabric-feedback-container/fabric-feedback-container.component';
import { CategoryService } from './shared-v2/services/category.service';
import { FeatureService } from './shared-v2/services/feature.service';
import { LoggingV2Service } from './shared-v2/services/logging-v2.service';
import { LiveChatService } from './shared-v2/services/livechat.service';
import { SupportTopicService } from './shared-v2/services/support-topic.service';
import { ResourceResolver } from './home/resolvers/resource.resolver';
import { ResourcesModule } from './resources/resources.module';
import { WebSitesModule } from './resources/web-sites/web-sites.module';
// import {
//   FabBreadcrumbModule,
//   FabButtonModule,
//   FabCalendarModule,
//   FabCalloutModule,
//   FabCheckboxModule,
//   FabChoiceGroupModule,
//   FabComboBoxModule,
//   FabCommandBarModule,
//   FabDatePickerModule,
//   FabDetailsListModule,
//   FabDialogModule,
//   FabDividerModule,
//   FabFabricModule,
//   FabDropdownModule,
//   FabGroupModule,
//   FabGroupedListModule,
//   FabHoverCardModule,
//   FabIconModule,
//   FabImageModule,
//   FabLinkModule,
//   FabMarqueeSelectionModule,
//   FabMessageBarModule,
//   FabModalModule,
//   FabPanelModule,
//   FabPersonaModule,
//   FabPivotModule,
//   FabSearchBoxModule,
//   FabShimmerModule,
//   FabSliderModule,
//   FabSpinnerModule,
//   FabToggleModule,
//   FabTooltipModule,
//   FabSpinButtonModule,
//   FabTextFieldModule,
//   FabPeoplePickerModule,
//   FabTagPickerModule,
//   FabProgressIndicatorModule,
//   FabContextualMenuModule
// } from '@angular-react/fabric';

@NgModule({
  imports: [
    AngularReactBrowserModule,
    HttpClientModule,
    ResourcesModule,
    WebSitesModule,
    SharedModule.forRoot(),
    // HomeModule,
    // FabFabricModule,
    // FabIconModule,
    // FabButtonModule,
    // FabDialogModule,
    // FabImageModule,
    // FabDropdownModule,
    // FabPanelModule,
    // FabCommandBarModule,
    // FabBreadcrumbModule,
    // FabCalloutModule,
    // FabCheckboxModule,
    // FabChoiceGroupModule,
    // FabComboBoxModule,
    // FabGroupedListModule,
    // FabDatePickerModule,
    // FabDividerModule,
    // FabSpinnerModule,
    // FabToggleModule,
    // FabPersonaModule,
    // FabPivotModule,
    // FabLinkModule,
    // FabMessageBarModule,
    // FabHoverCardModule,
    // FabModalModule,
    // FabTooltipModule,
    // FabShimmerModule,
    // FabSliderModule,
    // FabSearchBoxModule,
    // FabCalendarModule,
    // FabDetailsListModule,
    // FabGroupModule,
    // FabMarqueeSelectionModule,
    // FabSpinButtonModule,
    // FabTextFieldModule,
    // FabPeoplePickerModule,
    // FabTagPickerModule,
    // FabProgressIndicatorModule,
    // FabNavModule,
    // FabContextualMenuModule,
    StartupModule.forRoot(),
    DiagnosticDataModule.forRoot(environment.production ? PUBLIC_PROD_CONFIGURATION : PUBLIC_DEV_CONFIGURATION),
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: 'test',
        component: TestInputComponent,
        // resolve: { data: ResourceResolver }
      },
      {
        path: 'resourceRedirect',
        component: ResourceRedirectComponent,
        // resolve: { data: ResourceResolver }
      },
    //   {
    //     path: 'subscriptions/:subscriptionid/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:resourcename',
    //     loadChildren: './web-sites/web-sites.module#WebSitesModule'
    //   },
      {
        path: 'resource',
         loadChildren: './resources/resources.module#ResourcesModule',
       // loadChildren: () => ResourcesModule,
        // resolve: { data: ResourceResolver }
      }
    ],
    // { enableTracing: true }
    ),
    CustomMaterialModule,
    HighchartsChartModule,
  ],
  declarations: [
    AppComponent,
    // FabricFeedbackComponent,
    // FabricFeedbackContainerComponent
  ],
//   exports: [
//     FabricFeedbackComponent,
//     FabricFeedbackContainerComponent
//   ],
  providers: [
    CustomReuseStrategy,
    { provide: KustoTelemetryService, useExisting: PortalKustoTelemetryService },
    { provide: RouteReuseStrategy, useExisting: CustomReuseStrategy },
    { provide: DiagnosticService,
      useFactory: (_localBackendService: LocalBackendService, _genericApiService: GenericApiService) => environment.useApplensBackend ? _localBackendService : _genericApiService,
      deps: [LocalBackendService, GenericApiService] },
    { provide: CommsService, useExisting: GenericCommsService },
    { provide: AppInsightsQueryService, useExisting: AppInsightsService },
    { provide: DiagnosticSiteService, useExisting: SiteService },
    {
      provide: ErrorHandler,
      useClass: UnhandledExceptionHandlerService
    },
    { provide: SolutionService, useExisting: GenericSolutionService },
    { provide: SettingsService, useExisting: PortalSettingsService},
     {provide: GenieGlobals, useExisting: Globals},
    // GenieGlobals,
    // Globals,
    { provide: ResourceService, useExisting: WebSitesService},
    CategoryChatStateService,
    ContentService,
    CategoryService,
    FeatureService,
    LoggingV2Service,
    LiveChatService,
    SupportTopicService,
    ResourceResolver
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
