import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { SharedV2Module } from '../shared-v2/shared-v2.module';
import { GenericSupportTopicService } from 'diagnostic-data';
import { HomeComponent } from './components/home/home.component';
import { CategoryChatComponent } from './components/category-chat/category-chat.component';
import { CategoryTileComponent } from './components/category-tile/category-tile.component';
import { CategoryTabResolver, CategoryChatResolver } from './resolvers/category-tab.resolver';
import { SupportBotModule } from '../supportbot/supportbot.module';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { FormsModule } from '@angular/forms';
import { GenericDetectorComponent } from '../shared/components/generic-detector/generic-detector.component';
import { TabTitleResolver } from '../shared/resolvers/tab-name.resolver';
import { SupportTopicRedirectComponent } from './components/support-topic-redirect/support-topic-redirect.component';
import { TimeControlResolver } from './resolvers/time-control.resolver';
import { ContentService } from '../shared-v2/services/content.service';
import { FabNavModule, DiagnosticDataModule } from 'diagnostic-data';
import { GenericAnalysisComponent } from '../shared/components/generic-analysis/generic-analysis.component';
import { CategorySummaryComponent } from '../fabric-ui/components/category-summary/category-summary.component';
import { CategoryOverviewComponent } from '../fabric-ui/components/category-overview/category-overview.component';
import { DetectorCommandBarComponent } from '../fabric-ui/components/detector-command-bar/detector-command-bar.component';
import { GeniePanelComponent } from '../fabric-ui/components/genie-panel/genie-panel.component';
import { DiagnosticsSettingsComponent } from './components/diagnostics-settings/diagnostics-settings.component';
import { SupportTopicService } from '../shared-v2/services/support-topic.service';
import { MarkdownModule } from 'ngx-markdown';
import { PortalReferrerResolverComponent } from '../shared/components/portal-referrer-resolver/portal-referrer-resolver.component';
import { SearchPipe, SearchMatchPipe } from './components/pipes/search.pipe';

import {
  FabBreadcrumbModule,
  FabButtonModule,
  FabCalendarModule,
  FabCalloutModule,
  FabCheckboxModule,
  FabChoiceGroupModule,
  FabComboBoxModule,
  FabCommandBarModule,
  FabDatePickerModule,
  FabDetailsListModule,
  FabDialogModule,
  FabDividerModule,
  FabFabricModule,
  FabDropdownModule,
  FabGroupModule,
  FabGroupedListModule,
  FabHoverCardModule,
  FabIconModule,
  FabImageModule,
  FabLinkModule,
  FabMarqueeSelectionModule,
  FabMessageBarModule,
  FabModalModule,
  FabPanelModule,
  FabPersonaModule,
  FabPivotModule,
  FabSearchBoxModule,
  FabShimmerModule,
  FabSliderModule,
  FabSpinnerModule,
  FabToggleModule,
  FabTooltipModule,
  FabSpinButtonModule,
  FabTextFieldModule,
  FabPeoplePickerModule,
  FabTagPickerModule,
  FabProgressIndicatorModule,
  FabContextualMenuModule
} from '@angular-react/fabric';
import { CategoryNavComponent } from './components/category-nav/category-nav.component';
import { CategoryMenuItemComponent } from './components/category-menu-item/category-menu-item.component';
import { SectionDividerComponent } from './components/section-divider/section-divider.component';
import { FabricSearchResultsComponent } from '../fabric-ui/components/fabric-search-results/fabric-search-results.component';


export const HomeRoutes = RouterModule.forChild([
  {
    path: '',
    component: HomeComponent,
    data: {
      navigationTitle: 'Home',
      cacheComponent: true
    },
    pathMatch: 'full',
  },
  {
    path: 'categories/:category',
    component: CategorySummaryComponent,
    data: {
      cacheComponent: true
    },
    children: [
      {
        path: 'overview',
        component: CategoryOverviewComponent,
        data: {
          cacheComponent: true,
          navigationTitle: CategoryTabResolver,
          messageList: CategoryChatResolver
        },
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: {
          cacheComponent: true
        },
      },
      {
        path: 'analysis/:analysisId',
        component: GenericAnalysisComponent,
        data: {
          cacheComponent: true
        },
        children: [
          {
            path: '',
            component: GenericDetectorComponent,
            data: {
              analysisMode: true,
              cacheComponent: true
            }
          }
        ],
        resolve: {
          time: TimeControlResolver,
          navigationTitle: TabTitleResolver,
        }
      },
      {
        path: 'analysis/:analysisId/search',
        component: GenericAnalysisComponent,
        data: {
          cacheComponent: true
        },
        children: [
          {
            path: '',
            component: GenericDetectorComponent,
            data: {
              analysisMode: true,
              cacheComponent: true
            }
          }
        ],
        resolve: {
          time: TimeControlResolver,
          navigationTitle: TabTitleResolver,
        }
      },
      {
        path: 'detectors/:detectorName',
        component: GenericDetectorComponent,
        data: {
          cacheComponent: true
        },
        resolve: {
          time: TimeControlResolver,
          navigationTitle: TabTitleResolver,
        }
      },
      {
        path: 'analysis/:analysisId/search/detectors/:detectorName',
        component: GenericAnalysisComponent,
        data: {
          cacheComponent: true
        },
        children: [
          {
            path: '',
            component: GenericDetectorComponent,
            data: {
              analysisMode: true,
              cacheComponent: true
            }
          }
        ],
        resolve: {
          time: TimeControlResolver,
          navigationTitle: TabTitleResolver,
        }
      },
      {
        path: 'analysis/:analysisId/detectors/:detectorName',
        component: GenericAnalysisComponent,
        data: {
          cacheComponent: true
        },
        children: [
          {
            path: '',
            component: GenericDetectorComponent,
            data: {
              analysisMode: true,
              cacheComponent: true
            }
          }
        ],
        resolve: {
          time: TimeControlResolver,
          navigationTitle: TabTitleResolver,
        }
      }
    ],
    resolve: {
      navigationTitle: CategoryTabResolver,
      messageList: CategoryChatResolver
    }
  },
  {
    path: 'detectors/:detectorName',
    component: GenericDetectorComponent,
    data: {
      cacheComponent: true
    },
    resolve: {
      time: TimeControlResolver,
      navigationTitle: TabTitleResolver,
    }
  },
  {
    path: 'analysis/:analysisId/detectors/:detectorName',
    component: GenericAnalysisComponent,
    data: {
      cacheComponent: true
    },
    children: [
      {
        path: '',
        component: GenericDetectorComponent,
        data: {
          analysisMode: true,
          cacheComponent: true
        }
      }
    ],
    resolve: {
      time: TimeControlResolver,
      navigationTitle: TabTitleResolver,
    }
  },
  {
    path: 'analysis/:analysisId',
    component: GenericAnalysisComponent,
    data: {
      cacheComponent: true
    },
    children: [
      {
        path: '',
        component: GenericDetectorComponent,
        data: {
          analysisMode: true,
          cacheComponent: true
        }
      }
    ],
    resolve: {
      time: TimeControlResolver,
      navigationTitle: TabTitleResolver,
    }
  },
  {
    path: 'analysis/:analysisId/search',
    component: GenericAnalysisComponent,
    data: {
      cacheComponent: true
    },
    children: [
      {
        path: '',
        component: GenericDetectorComponent,
        data: {
          analysisMode: true,
          cacheComponent: true
        }
      }
    ],
    resolve: {
      time: TimeControlResolver,
      navigationTitle: TabTitleResolver,
    }
  },
  {
    path: 'analysis/:analysisId/search/detectors/:detectorName',
    component: GenericAnalysisComponent,
    data: {
      cacheComponent: true
    },
    children: [
      {
        path: '',
        component: GenericDetectorComponent,
        data: {
          analysisMode: true,
          cacheComponent: true
        }
      }
    ],
    resolve: {
      time: TimeControlResolver,
      navigationTitle: TabTitleResolver,
    }
  },
  {
    path: 'analysis/:analysisId/detectors',
    component: GenericAnalysisComponent,
    data: {
      cacheComponent: true
    },
    children: [
      {
        path: '',
        component: GenericDetectorComponent,
        data: {
          analysisMode: true,
          cacheComponent: true
        }
      }
    ],
    resolve: {
      time: TimeControlResolver,
      navigationTitle: TabTitleResolver,
    }
  },
  {
    path: 'supportTopicId',
    component: SupportTopicRedirectComponent
  },
  {
    path: 'settings',
    component: DiagnosticsSettingsComponent,
    data: {
      navigationTitle: 'App Service Diagnostics Settings'
    }
  },
  {
    path: 'portalReferrerResolver',
    component: PortalReferrerResolverComponent,
    data: {
      cacheComponent: true
    },
    resolve: {
      time: TimeControlResolver
    }
  }
]);

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DiagnosticDataModule,
    HomeRoutes,
    SupportBotModule,
    FormsModule,
    FabFabricModule,
    FabIconModule,
    FabButtonModule,
    FabDialogModule,
    FabImageModule,
    FabDropdownModule,
    FabPanelModule,
    FabCommandBarModule,
    FabBreadcrumbModule,
    FabCalloutModule,
    FabCheckboxModule,
    FabChoiceGroupModule,
    FabComboBoxModule,
    FabGroupedListModule,
    FabDatePickerModule,
    FabDividerModule,
    FabSpinnerModule,
    FabToggleModule,
    FabPersonaModule,
    FabPivotModule,
    FabLinkModule,
    FabMessageBarModule,
    FabHoverCardModule,
    FabModalModule,
    FabTooltipModule,
    FabShimmerModule,
    FabSliderModule,
    FabSearchBoxModule,
    FabCalendarModule,
    FabDetailsListModule,
    FabGroupModule,
    FabMarqueeSelectionModule,
    FabSpinButtonModule,
    FabTextFieldModule,
    FabPeoplePickerModule,
    FabTagPickerModule,
    FabProgressIndicatorModule,
    FabNavModule,
    FabContextualMenuModule,
    MarkdownModule.forRoot()
  ],
  declarations: [HomeComponent, CategoryChatComponent, CategoryTileComponent, SearchResultsComponent, SupportTopicRedirectComponent, DiagnosticsSettingsComponent, CategorySummaryComponent, CategoryOverviewComponent, DetectorCommandBarComponent, GeniePanelComponent, CategoryNavComponent, CategoryMenuItemComponent, SearchPipe, SearchMatchPipe, SectionDividerComponent, FabricSearchResultsComponent],
  providers: [CategoryTabResolver, CategoryChatResolver, TimeControlResolver,
    { provide: GenericSupportTopicService, useExisting: SupportTopicService }
  ]
})
export class HomeModule { }
