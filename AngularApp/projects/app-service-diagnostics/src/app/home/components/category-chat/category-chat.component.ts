import { Component, OnInit, Injector } from '@angular/core';
import { MessageProcessor } from '../../../supportbot/message-processor.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
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

@Component({
  selector: 'category-chat',
  templateUrl: './category-chat.component.html',
  styleUrls: ['./category-chat.component.scss'],
  providers: [CategoryChatStateService]
})
export class CategoryChatComponent implements OnInit {
  allProblemCategories: Category[] = [];
  features: Feature[];
  tiles: Tile[];

  startingKey: string;

  category: Category;
  categoryName: string;
  resourceId = "";

  groups: any = [{
    links: [
      {
        name: 'Overview',
        key: 'Overview',
        url: '',
        // onClick: (e) => {
        //   e.preventDefault();
        //   this.navigateTo('');
        // },
        expandAriaLabel: 'Overview',
        collapseAriaLabel: 'Overview',
        links: [],
        isExpanded: true
      }]
  }
  ];
  // links: any[] = [
  //   {
  //     name: 'Overview',
  //     key: 'Overview',
  //     onClick: (e) => {
  //       e.preventDefault();
  //       this.navigateTo('analysis/tcpconnections');
  //     },
  //     expandAriaLabel: 'Overview',
  //     collapseAriaLabel: 'Overview',
  //     links: []
  //   }];

  initialSelectedKey: INavProps["initialSelectedKey"];
  selectedKey: INavProps["initialSelectedKey"];

  styles: any;

  constructor(protected _diagnosticApiService: DiagnosticService, private _route: Router, private _injector: Injector, private _activatedRoute: ActivatedRoute, private categoryService: CategoryService,
    private _chatState: CategoryChatStateService, private _genericApiService: GenericApiService
    ,private _featureService: FeatureService,  protected _authService: AuthService) {
        this._authService.getStartupInfo().subscribe(startupInfo => {
          this.resourceId = startupInfo.resourceId;
          console.log("****** resourceId");
        });
  }

  ngOnInit() {
    console.log("***** start reconstruct nav");
    this.categoryService.categories.subscribe(categories => {
      this.category = categories.find(category => category.id === this._activatedRoute.snapshot.params.category);
      this._chatState.category = this.category;
      this.categoryName = this.category.name;
      this.features = this._featureService.getFeaturesForCategory(this._chatState.category);
        this._diagnosticApiService.getDetectors().subscribe(detectors => {
          detectors.forEach(detector => {
            if (detector.category === this.category.name)
            {
                if ((detector.category && detector.category.length > 0) ||
                (detector.description && detector.description.length > 0)) {
                if (detector.type === DetectorType.Detector) {
                  this.groups[0].links[0].links.push({
                      name: detector.name,
                      key: detector.id,
                   //   url: `resource${this.resourceId}/categories/${this.category.id}/detectors/${detector.id}`,
                    //   forceAnchor: true,
                      onClick: (e) => {
                        e.preventDefault();
                   //     feature.clickAction();
                       this.selectedKey = detector.id;
                 //      this.navigateTo(`detectors/${detector.id}`);
                         this._route.navigateByUrl(`resource${this.resourceId}/categories/${this.category.id}/detectors/${detector.id}`);
                    //    this.navigateTo('analysis/tcpconnections');
                      },
                      expandAriaLabel: detector.name,
                      collapseAriaLabel: detector.name,
                    });
                } else {
                  this.groups[0].links[0].links.push({
                      name: detector.name,
                      key: detector.id,
                   //   url: `resource${this.resourceId}/categories/${this.category.id}/analysis/${detector.id}`,
                    //   forceAnchor: true,
                      onClick: (e) => {
                        e.preventDefault();
                        this.selectedKey = detector.id;
                   //     feature.clickAction();

                        this._route.navigateByUrl(`resource${this.resourceId}/categories/${this.category.id}/analysis/${detector.id}`);
                     //   this.navigateTo(`analysis/${detector.id}`);
                    //    this.navigateTo('analysis/tcpconnections');
                      },
                      expandAriaLabel: detector.name,
                      collapseAriaLabel: detector.name,
                    });
                }
              }
            }
          });
        });

        console.log("groups", this.groups);


      this.tiles = this.features.map(feature => <Tile>{
        title: feature.name,
        action: () =>  feature.clickAction()
      });

    //   this._diagnosticApiService.getDetectors().subscribe(detectors => {
    //   var currentCategoryDetectors = detectors.filter(detector => detector.category === this.category.name);
    //   if (currentCategoryDetectors.length === 1) {
    // //    this._logger.LogTopLevelDetector(currentCategoryDetectors[0].id, currentCategoryDetectors[0].name, this.category.id);
    // //    this._router.navigateByUrl(`resource${this._resourceService.resourceIdForRouting}/detectors/${currentCategoryDetectors[0].id}`);
    //   }
    //   else {
    //     const path = ['categories', this.category.id];
    //     const navigationExtras: NavigationExtras = {
    //       queryParamsHandling: 'preserve',
    //       preserveFragment: true,
    //       relativeTo: this._activatedRoute
    //     };

    // //   this._router.navigate(path, navigationExtras);
    //   }
    // });

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
          position: 'absolute',
          left: '3px',
          width: '23px'
        },
        navItem: {

        }
      };



      console.log("Loading category", this.category);
      console.log("starting key", this.startingKey);
    });

  }

  navigateTo(path: string) {
    let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'preserve',
        preserveFragment: true,
        relativeTo: this._activatedRoute
    };
    this._route.navigate([path], navigationExtras);
    console.log("this._route", this._route);
}


}
