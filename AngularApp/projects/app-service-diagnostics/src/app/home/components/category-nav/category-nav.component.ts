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
import { CollapsibleMenuItem, CategoryMenuItemComponent } from '../category-menu-item/category-menu-item.component';

@Component({
    selector: 'category-nav',
    templateUrl: './category-nav.component.html',
    styleUrls: ['./category-nav.component.scss']
})
export class CategoryNavComponent implements OnInit {
    imageRootPath = '../../../../assets/img/detectors';
    currentRoutePath: string[];
    allProblemCategories: Category[] = [];
    features: Feature[];
    tiles: Tile[];

    startingKey: string;

    category: Category;
    categoryName: string;
    resourceId = "";
    baseUrl = "";
    selectedId = "";

    groups: any;

    initialSelectedKey: INavProps["initialSelectedKey"] = "overview";
    selectedKey: INavProps["initialSelectedKey"];

    styles: any;
    collapsible: any = false;

    isSelected(detectorId: string) {
        console.log("router url", this._route.url, detectorId);
        var s = this._route.url.includes(detectorId);
        console.log("Is selected", s);
        return this._route.url.includes(detectorId);
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


    constructor(protected _diagnosticApiService: DiagnosticService, private _route: Router, private _injector: Injector, private _activatedRoute: ActivatedRoute, private categoryService: CategoryService,
        private _chatState: CategoryChatStateService, private _genericApiService: GenericApiService
        , private _featureService: FeatureService, protected _authService: AuthService) { }


    detectorList: CollapsibleMenuItem[] = [];
    // [
    //     {
    //       label: 'Diagnostic Report',
    //       onClick: () => { window.open('https://app-service-diagnostics-docs.azurewebsites.net/api/Diagnostics.ModelsAndUtils.Models.Response.html#extensionmethods', '_blank') },
    //       expanded: false,
    //       subItems: [],
    //       isSelected: null,
    //       icon: null
    //     }];
    createNew: CollapsibleMenuItem[] = [
        {
            label: 'Your Detectors',
            onClick: () => {
                this.navigateTo('create');
            },
            expanded: false,
            subItems: null,
            isSelected: null,
            icon: null
        },
        {
            label: 'New Detector',
            onClick: () => {
                this.navigateTo('create');
            },
            expanded: false,
            subItems: null,
            isSelected: null,
            icon: null
        },
        {
            label: 'New Gist',
            onClick: () => {
                this.navigateTo('createGist');
            },
            expanded: false,
            subItems: null,
            isSelected: null,
            icon: null
        }
    ];


    private getCurrentRoutePath() {
        this.currentRoutePath = this._activatedRoute.firstChild.snapshot.url.map(urlSegment => urlSegment.path);
      }
    ngOnInit() {

    this._route.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
        this.getCurrentRoutePath();
      });



        this.categoryService.categories.subscribe(categories => {
            this.category = categories.find(category => category.id === this._activatedRoute.snapshot.params.category);
            this._chatState.category = this.category;
            this.categoryName = this.category.name;

            this._authService.getStartupInfo().subscribe(startupInfo => {
                this.resourceId = startupInfo.resourceId;
                this.baseUrl = `resource${this.resourceId}/categories/${this.category.id}/`;
                this.groups = [{
                    links: [{
                        name: 'Overview',
                        key: 'overview',
                        icon: 'globe',
                        onClick: (e) => {
                            e.preventDefault();
                            //   this._route.navigateByUrl(`resource${this.resourceId}/categories/${this.category.id}/`);
                            //    this._route.navigate([`resource${this.resourceId}/categories/${this.category.id}/`]);
                            this._route.navigate([`./overview`], { relativeTo: this._activatedRoute, queryParamsHandling: 'merge' });
                        },
                    }]
                },
                {
                    name: 'Diagnostic Reports',
                    key: 'diagnosticreport',
                    isExpanded: true,
                    // onClick: (e) => {
                    //     e.preventDefault();
                    //    // this._route.navigateByUrl(`resource${this.resourceId}/categories/${this.category.id}/`);
                    //     this._route.navigate([`resource${this.resourceId}/categories/${this.category.id}/`]);
                    // },
                    links: []
                },
                ];
            });

            this._diagnosticApiService.getDetectors().subscribe(detectors => {
                detectors.forEach(detector => {
                    if (detector.category === this.category.name) {
                        if ((detector.category && detector.category.length > 0) ||
                            (detector.description && detector.description.length > 0)) {
                            let routePath: any = "detectors";
                            if (detector.type === DetectorType.Analysis) {
                                routePath = "analysis";
                            }
                            let onClick = () => {
                                //   this._telemetryService.logEvent(TelemetryEventNames.SideNavigationItemClicked, { "elementId": element.id });
                                this.navigateTo(`${routePath}/${detector.id}`);
                            };

                            let isSelected = () => {
                                //return this.currentRoutePath && this.currentRoutePath.join('/') === `detectors/${detector.id}`;

                                // return this.currentRoutePath && this.currentRoutePath.join('/').includes(detector.id);
                                return this._route.url.includes(detector.id);
                            };

                         //   let icon = `${this.imageRootPath}/${detector.name}.svg`;
                           let icon = `${this.imageRootPath}/${detector.name}.png`;
                            let menuItem = new CollapsibleMenuItem(detector.name, onClick, isSelected, icon);

                            this.detectorList.push(menuItem);
                        }
                    }
                });
            });

         //   console.log("*****detectors", this.detectorList);

            this.styles = {
                root: {
                    position: 'fixed',
                    width: 264,
                    boxSizing: 'border-box',
                    overflowY: 'auto',
                    overflowX: 'hiden',
                },

                link: {
                    fontSize: 13,
                    color: "#000"
                },
                chevronIcon: {
                    display: 'none'
                },
                chevronButton: {
                    marginTop: -20,
                    paddingLeft: 10,
                    fontSize: 12,
                    fontWeight: 600
                }
            };
        });
    }

}
