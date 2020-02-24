import { Component, OnInit, Injector } from '@angular/core';
import { MessageProcessor } from '../../../supportbot/message-processor.service';
import { ActivatedRoute, Router, NavigationExtras, NavigationEnd, Scroll } from '@angular/router';
import { CategoryService } from '../../../shared-v2/services/category.service';
import { Category } from '../../../shared-v2/models/category';
import { CategoryChatStateService } from '../../../shared-v2/services/category-chat-state.service';
import { INavProps, INavLink, INav, autobind, INavStyles } from 'office-ui-fabric-react';
import { GenericApiService } from '../../../shared/services/generic-api.service';
import { CategoriesService } from '../../../shared/services/categories.service';
import { FeatureService } from '../../../shared-v2/services/feature.service';
import { Tile } from '../../../shared/components/tile-list/tile-list.component';
import { Feature } from '../../../shared-v2/models/features';
import { AuthService } from '../../../startup/services/auth.service';
import { DiagnosticService, DetectorMetaData, DetectorType } from 'diagnostic-data';
import { filter } from 'rxjs/operators';
import { PortalActionService } from '../../../shared/services/portal-action.service';

@Component({
  selector: 'category-chat-v4',
  templateUrl: './category-chat-v4.component.html',
  styleUrls: ['./category-chat-v4.component.scss']
})
export class CategoryChatV4Component implements OnInit {

  showChoiceGroup: boolean = true;
  currentRoutePath: string[];
  allProblemCategories: Category[] = [];
  features: Feature[];
  tiles: Tile[];

  startingKey: string;

  category: Category;
  categoryName: string;
  resourceId = "";
  baseUrl = "";
  resourceName = "";

  groups: any;
  counter: number = 0;

  initialSelectedKey: INavProps["initialSelectedKey"] = "overview";
  selectedKey: INavProps["initialSelectedKey"];

  styles: any;

  selectedCategoryIndex = "1";
  setCategoryIndex(event: any) {
    const categoryIndex = event.option.key;
    this.selectedCategoryIndex = categoryIndex;
  }
  constructor(protected _diagnosticApiService: DiagnosticService, private _route: Router, private _injector: Injector, private _activatedRoute: ActivatedRoute, private categoryService: CategoryService,
    private _chatState: CategoryChatStateService, private _genericApiService: GenericApiService
    , private _featureService: FeatureService, protected _authService: AuthService, private _portalActionService: PortalActionService) {
    // this._route.routeReuseStrategy.shouldReuseRoute = function(){
    //     return true;
    //  }

    //  this._route.events.subscribe((evt) => {
    //     if (evt instanceof NavigationEnd) {
    //        // trick the Router into believing it's last link wasn't previously loaded
    //        this._route.navigated = false;
    //        // if you need to scroll back to top, here is the right place
    //        window.scrollTo(0, 0);
    //     }
    // });
  }

  ngOnInit() {
    this.categoryService.categories.subscribe(categories => {
      this.category = categories.find(category => category.id === this._activatedRoute.snapshot.params.category);
      this._chatState.category = this.category;
      this.categoryName = this.category.name;

      this.resourceName = this._activatedRoute.snapshot.params.resourcename;
      this._portalActionService.updateDiagnoseCategoryBladeTitle(`${this.resourceName} - ` + this.categoryName);
    });


    //     this._authService.getStartupInfo().subscribe(startupInfo => {
    //         this.resourceId = startupInfo.resourceId;
    //         console.log("****** resourceId");
    //         this.baseUrl = `resource${this.resourceId}/categories/${this.category.id}/`;
    //         this.groups = [{
    //             links: [{
    //                 name: 'Overview',
    //                 key: 'overview',
    //                 icon: 'globe',
    //                 onClick: (e) => {
    //                     e.preventDefault();
    //                  //   this._route.navigateByUrl(`resource${this.resourceId}/categories/${this.category.id}/`);
    //                 //    this._route.navigate([`resource${this.resourceId}/categories/${this.category.id}/`]);
    //                     this._route.navigate([`./overview`], { relativeTo: this._activatedRoute, queryParamsHandling: 'merge' });
    //                 },
    //             }]
    //         },
    //         {
    //             name: 'Diagnostic Reports',
    //             key: 'diagnosticreport',
    //             isExpanded: true,
    //             // onClick: (e) => {
    //             //     e.preventDefault();
    //             //    // this._route.navigateByUrl(`resource${this.resourceId}/categories/${this.category.id}/`);
    //             //     this._route.navigate([`resource${this.resourceId}/categories/${this.category.id}/`]);
    //             // },
    //             links: []
    //         },
    //         ];
    //     });

    //     this.features = this._featureService.getFeaturesForCategory(this._chatState.category);
    //     this._diagnosticApiService.getDetectors().subscribe(detectors => {
    //         detectors.forEach(detector => {
    //             if (detector.category === this.category.name) {
    //                 if ((detector.category && detector.category.length > 0) ||
    //                     (detector.description && detector.description.length > 0)) {
    //                     if (detector.type === DetectorType.Detector) {
    //                         this.groups[1].links.push({
    //                             name: detector.name,
    //                             key: detector.id,
    //                             icon: 'stackedlinechart',
    //                             //   url: `resource${this.resourceId}/categories/${this.category.id}/detectors/${detector.id}`,
    //                             //   forceAnchor: true,
    //                             onClick: (e) => {
    //                                 console.log("clicked event", detector.name);
    //                                 e.preventDefault();
    //                                 console.log("Route before", this._route);
    //                                       this.navigateTo(`detectors/${detector.id}`);
    //                                       console.log("Route After", this._route);
    //                                 // this._route.navigateByUrl(`resource${this.resourceId}/categories/${this.category.id}/detectors/${detector.id}`);
    //                                 //    this.navigateTo('analysis/tcpconnections');
    //                             },
    //                             expandAriaLabel: detector.name,
    //                             collapseAriaLabel: detector.name,
    //                         });
    //                     } else {
    //                         this.groups[1].links.push({
    //                             name: detector.name,
    //                             key: detector.id,
    //                             icon: 'reportadd',
    //                             //   url: `resource${this.resourceId}/categories/${this.category.id}/analysis/${detector.id}`,
    //                             //   forceAnchor: true,
    //                             onClick: (e) => {
    //                                 e.preventDefault();
    //                                 this.selectedKey = detector.id;
    //                                 //     feature.clickAction();
    //                              //  this._route.navigateByUrl(`resource${this.resourceId}/analysis/${detector.id}`);
    //                                 this._route.navigateByUrl(`resource${this.resourceId}/categories/${this.category.id}/analysis/${detector.id}`);
    //                                 //   this.navigateTo(`analysis/${detector.id}`);
    //                                 //    this.navigateTo('analysis/tcpconnections');
    //                             },
    //                             expandAriaLabel: detector.name,
    //                             collapseAriaLabel: detector.name,
    //                         });
    //                     }
    //                 }
    //             }
    //         });
    //     });

    //     this.styles = {
    //         root: {
    //             position: 'fixed',
    //             width: 264,
    //             boxSizing: 'border-box',
    //             overflowY: 'auto',
    //             overflowX: 'hiden',
    //         },

    //         link: {
    //             fontSize: 13,
    //             color: "#000"
    //         },
    //         chevronIcon: {
    //         display: 'none'
    //         },
    //         chevronButton: {
    //             marginTop: -20,
    //             paddingLeft: 10,
    //             fontSize: 12,
    //             fontWeight: 600
    //         },
    //         navItem: {

    //         }
    //     };
    // });
  }

  private getCurrentRoutePath() {
    this.currentRoutePath = this._activatedRoute.firstChild.snapshot.url.map(urlSegment => urlSegment.path);
  }

  navigateTo(path: string) {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
      relativeTo: this._activatedRoute
    };
    this._route.navigate(path.split('/'), navigationExtras);
    console.log("this._route", this._route);
  }

}
