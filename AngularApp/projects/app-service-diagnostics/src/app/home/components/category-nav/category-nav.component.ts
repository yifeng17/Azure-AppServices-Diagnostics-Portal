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
import { DiagnosticService, DetectorMetaData, DetectorType, DetectorResponse } from 'diagnostic-data';
import { filter } from 'rxjs/operators';
import { CollapsibleMenuItem, CategoryMenuItemComponent } from '../category-menu-item/category-menu-item.component';
import { DetectorCategorizationService } from '../../../shared/services/detector-categorized.service';
import { SiteFeatureService } from '../../../resources/web-sites/services/site-feature.service';

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
    isDiagnosticTools: boolean = false;
    categoryId: string="";

    initialSelectedKey: INavProps["initialSelectedKey"] = "overview";
    selectedKey: INavProps["initialSelectedKey"];

    styles: any;
    collapsible: any = false;
    hasUncategorizedDetectors: boolean = false;

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
        var pathSegments = path.split('/');
        let segments: string[] = [path];
        this._route.navigate(segments, navigationExtras).then(() => {
            console.log("navigated");
        });
        console.log("this._route", this._route.url);
        console.log("activatedRoute", this._activatedRoute);
    }


    constructor(public siteFeatureService: SiteFeatureService, protected _diagnosticApiService: DiagnosticService, private _route: Router, private _injector: Injector, private _activatedRoute: ActivatedRoute, private categoryService: CategoryService,
        private _chatState: CategoryChatStateService, private _genericApiService: GenericApiService
        , private _featureService: FeatureService, protected _authService: AuthService, public _detectorCategorization: DetectorCategorizationService) { }

    detectorDataLocalCopy: DetectorMetaData[] = [];
    detectorList: CollapsibleMenuItem[] = [];
    orphanDetectorList: CollapsibleMenuItem[] = [];
    orphanDetectorList1: CollapsibleMenuItem[] = [];
    proactiveTools: CollapsibleMenuItem[] = [];
    dignosticTools: CollapsibleMenuItem[] = [];
    supportTools: CollapsibleMenuItem[] = [];
    premiumTools: CollapsibleMenuItem[] = [];
    // [
    //     {
    //       label: 'Diagnostic Report',
    //       onClick: () => { window.open('https://app-service-diagnostics-docs.azurewebsites.net/api/Diagnostics.ModelsAndUtils.Models.Response.html#extensionmethods', '_blank') },
    //       expanded: false,
    //       subItems: [],
    //       isSelected: null,
    //       icon: null
    //     }];


    private getCurrentRoutePath() {
        this.currentRoutePath = this._activatedRoute.firstChild.snapshot.url.map(urlSegment => urlSegment.path);
    }
    ngOnInit() {
    //    this.orphanDetectorList1 = this._detectorCategorization.getlist(this.category.id);
        this.hasUncategorizedDetectors = false;
        console.log("init category-nav");
        this._route.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
            this.getCurrentRoutePath();
        });

        this.categoryService.categories.subscribe(categories => {
            //  let decodedCategoryName = decodeURIComponent(this._activatedRoute.snapshot.params.category);
            let decodedCategoryName = this._activatedRoute.snapshot.params.category.toLowerCase();
            this.category = categories.find(category => category.id.toLowerCase() === this._activatedRoute.snapshot.params.category.toLowerCase() || category.name.replace(/\s/g, '').toLowerCase() == decodedCategoryName);
            this._chatState.category = this.category;
            this.categoryName = this.category.name;
            this.categoryId = this.category.id;
            this.isDiagnosticTools = this.category.id === "DiagnosticTools";
            if (this.isDiagnosticTools)
            {
                this.siteFeatureService.proactiveTools.forEach((tool)=>{
                    let routePath: any = "detectors";
                    // if (detector.type === DetectorType.Analysis) {
                    //     routePath = "analysis";
                    // }
                    // let onClick = () => {
                    //                       this.navigateTo(`${routePath}/${detector.id}`);
                    // };
                    let onClick1 = tool.item.clickAction;
                    let itemName = tool.item.name;

                    let isSelected = () => {
                        return this._route.url.includes("proactive");
                    };

                    //   let icon = `${this.imageRootPath}/${detector.name}.svg`;
                    let imageIndex = 0;
                    let icon = `${this.imageRootPath}/${imageIndex}.png`;
                    let menuItem = new CollapsibleMenuItem(itemName, onClick1, isSelected, icon);

                    this.proactiveTools.push(menuItem);
                });

                this.siteFeatureService.diagnosticTools.forEach((tool)=>{
                    let routePath: any = "detectors";
                    let onClick1 = tool.item.clickAction;
                    let itemName = tool.item.name;

                    let isSelected = () => {
                        return this._route.url.includes("diagnostic");
                    };

                    //   let icon = `${this.imageRootPath}/${detector.name}.svg`;
                    let imageIndex = 1;
                    let icon = `${this.imageRootPath}/${imageIndex}.png`;
                    let menuItem = new CollapsibleMenuItem(itemName, onClick1, isSelected, icon);

                    this.dignosticTools.push(menuItem);
                });

                this.siteFeatureService.supportTools.forEach((tool)=>{
                    let routePath: any = "detectors";
                    let onClick1 = tool.item.clickAction;
                    let itemName = tool.item.name;

                    let isSelected = () => {
                        return this._route.url.includes("support");
                    };

                    //   let icon = `${this.imageRootPath}/${detector.name}.svg`;
                    let imageIndex = 2;
                    let icon = `${this.imageRootPath}/${imageIndex}.png`;
                    let menuItem = new CollapsibleMenuItem(itemName, onClick1, isSelected, icon);

                    this.supportTools.push(menuItem);
                });


                this.siteFeatureService.premiumTools.forEach((tool)=>{
                    let routePath: any = "detectors";
                    let onClick1 = tool.item.clickAction;
                    let itemName = tool.item.name;

                    let isSelected = () => {
                        return this._route.url.includes("premium");
                    };

                    //   let icon = `${this.imageRootPath}/${detector.name}.svg`;
                    let imageIndex = 3;
                    let icon = `${this.imageRootPath}/${imageIndex}.png`;
                    let menuItem = new CollapsibleMenuItem(itemName, onClick1, isSelected, icon);

                    this.premiumTools.push(menuItem);
                });

            }

            this.orphanDetectorList = this._detectorCategorization.detectorlistCategories[this.category.id];

            this._authService.getStartupInfo().subscribe(startupInfo => {
                this.resourceId = startupInfo.resourceId;
                this.baseUrl = `resource${this.resourceId}/categories/${this.category.id}/`;
                this.groups = [{
                    links: [{
                        name: 'Overview',
                        key: 'overview',
                        icon: 'globe',
                        onClick: (e) => {
                            // e.preventDefault();
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
                this.detectorDataLocalCopy = detectors;
                detectors.forEach((detector, index) => {
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
                            let imageIndex = index % 4;
                            let icon = `${this.imageRootPath}/${imageIndex}.png`;
                            let menuItem = new CollapsibleMenuItem(detector.name, onClick, isSelected, icon);

                            this.detectorList.push(menuItem);
                        }
                    }
                });
            });


            this._route.events.subscribe((evt) => {
                if (evt instanceof NavigationEnd) {

                    let itemId = "";
                    let routePath: any = "detectors";
                    if (evt.url.includes("detectors/")) {
                        itemId = evt.url.split("detectors/")[1].split("?")[0];
                    }
                    else if (evt.url.includes("analysis/")) {
                        itemId = evt.url.split("analysis/")[1].split("?")[0];
                        routePath = "analysis";
                    }

                    let item = this.detectorDataLocalCopy.find(metadata => metadata.id.toLowerCase() === itemId.toLowerCase());

                    if (item && (item.category == undefined || item.category == "") && !this.detectorList.find((detector) => detector.label === item.id)) {
                        if (!this.orphanDetectorList.find((orphan) => (orphan.label) === item.name)) {

                            let isSelected = () => {
                                return this._route.url.includes(item.id);
                            };
                            let imageIndex = 2;
                            let icon = `${this.imageRootPath}/${imageIndex}.png`;
                            let onClick = () => {
                                //   this._telemetryService.logEvent(TelemetryEventNames.SideNavigationItemClicked, { "elementId": element.id });
                                this.navigateTo(`${routePath}/${item.id}`);
                            };
                            let orphanMenuItem = new CollapsibleMenuItem(item.name, onClick, isSelected, icon);
                            //this.orphanDetectorList.push(orphanMenuItem);
                            if(!this.orphanDetectorList.find((item1=>item1.label === orphanMenuItem.label)))
                            {
                                this._detectorCategorization.detectorlistCategories[this.category.id].push(orphanMenuItem);
                            }
                            console.log("orphanlist", this.orphanDetectorList, this._detectorCategorization.detectorlistCategories);
                            this.orphanDetectorList = this._detectorCategorization.detectorlistCategories[this.category.id];
                            console.log("orphanlist", this._detectorCategorization.detectorlistCategories);
                           // this._detectorCategorization.pushDetectorToCategory(orphanMenuItem, this.category.id);
                        }

                //        this.orphanDetectorList1 = this._detectorCategorization.getlist(this.category.id);
                    }

                    console.log("evt and list", evt, itemId, this.orphanDetectorList);
                }

                // let url=evt.url.split("/detectors/");

                // this.detectorDataLocalCopy.forEach((detector, index) => {
                //    if (detector.category == undefined || detector.category == "")
                //    {
                //     let orphanDetectors: string[] = this._detectorCategorization.getOrphanDetectors(this.category.id);
                //     orphanDetectors.forEach((orphanDetector) => {
                //         if (!this.orphanDetectorList.find((item) => (item.label) === orphanDetector))
                //         {
                //             let routePath: any = "detectors";
                //         if (detector.type === DetectorType.Analysis) {
                //             routePath = "analysis";
                //         }
                //         let isSelected = () => {
                //             return this._route.url.includes(detector.id);
                //         };
                //         let imageIndex = index%4;
                //         let icon = `${this.imageRootPath}/${imageIndex}.png`;
                //             let onClick = () => {
                //                 //   this._telemetryService.logEvent(TelemetryEventNames.SideNavigationItemClicked, { "elementId": element.id });
                //                 this.navigateTo(`${routePath}/${detector.id}`);
                //             };
                //             let orphanMenuItem = new CollapsibleMenuItem(orphanDetector, onClick, isSelected, icon);
                //             this.orphanDetectorList.push(orphanMenuItem);
                //         }
                //     })
                //    }
                // });
            }
            );

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
