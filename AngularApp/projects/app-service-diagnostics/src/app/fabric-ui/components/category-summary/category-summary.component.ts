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
import { Globals } from '../../../globals';

@Component({
    selector: 'category-summary',
    templateUrl: './category-summary.component.html',
    styleUrls: ['./category-summary.component.scss'],
    providers: [CategoryChatStateService]
})
export class CategorySummaryComponent implements OnInit {
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

    openPanel: boolean = false;

    setFocusOnCallpsibleButton() {
        console.log("collapse-genie-button", document.getElementById("collapse-genie-button"));
        document.getElementById("collapse-genie-button").focus();
    }
    closeGeniePanel() {
        this.globals.openGeniePanel = false;
        this.openPanel = false;
        console.log("close panel, isOpen:", this.globals.openGeniePanel);
    }

    openGeniePanel() {
        this.globals.openGeniePanel  = true;
        console.log("open panel, isOpen:", this.globals.openGeniePanel);
    }

    setCategoryIndex(event:any) {
        const categoryIndex = event.option.key;
        this.selectedCategoryIndex = categoryIndex;
      }
    constructor(protected _diagnosticApiService: DiagnosticService, private _route: Router, private _injector: Injector, private _activatedRoute: ActivatedRoute, private categoryService: CategoryService,
        private _chatState: CategoryChatStateService, private _genericApiService: GenericApiService
        , private _featureService: FeatureService, protected _authService: AuthService, private _portalActionService: PortalActionService, private globals: Globals) {
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
            console.log("init ngsummary in constructor");
    }

    ngOnInit() {
        console.log("init ngsummary");
        this.globals.openGeniePanel = false;
        this.categoryService.categories.subscribe(categories => {
         //   let decodedCategoryName = decodeURIComponent(this._activatedRoute.snapshot.params.category);
         let decodedCategoryName = this._activatedRoute.snapshot.params.category.toLowerCase();
            console.log("categoryName before decode and after", this._activatedRoute.snapshot.params.category, decodedCategoryName);
            if (categories)
            {
                console.log("all the categories", categories);
            }
            //|| category.name.replace(/\s/g, '') === categoryName
            this.category = categories.find(category => category.id.toLowerCase() === this._activatedRoute.snapshot.params.category.toLowerCase() ||  category.name.replace(/\s/g, '').toLowerCase() === decodedCategoryName);
            console.log("finding category in category summary", this.category);
            this._chatState.category = this.category;
            this.categoryName = this.category.name;

            this.resourceName = this._activatedRoute.snapshot.params.resourcename;
            this._portalActionService.updateDiagnoseCategoryBladeTitle(`${this.resourceName} - ` + this.categoryName);
        });
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
