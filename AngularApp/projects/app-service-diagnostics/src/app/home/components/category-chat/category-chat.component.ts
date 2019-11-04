import { Component, OnInit, Injector } from '@angular/core';
import { MessageProcessor } from '../../../supportbot/message-processor.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { CategoryService } from '../../../shared-v2/services/category.service';
import { Category } from '../../../shared-v2/models/category';
import { CategoryChatStateService } from '../../../shared-v2/services/category-chat-state.service';
import { INavProps, INavLink, INav, autobind, INavStyles } from 'office-ui-fabric-react';
import { GenericApiService } from '../../../shared/services/generic-api.service';
import { CategoriesService } from '../../../shared/services/categories.service';
import { DiagnosticService, DetectorMetaData } from 'diagnostic-data';
import { FeatureService } from '../../../shared-v2/services/feature.service';
import { Tile } from '../../../shared/components/tile-list/tile-list.component';
import { Feature } from '../../../shared-v2/models/features';

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

  groups: any = [{
    links: [
      {
        name: 'Overview',
        key: 'Overview',
        onClick: (e) => {
          e.preventDefault();
          this.navigateTo('analysis/tcpconnections');
        },
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

  styles: any;

  constructor(private _route: Router, private _injector: Injector, private _activatedRoute: ActivatedRoute, private categoryService: CategoryService, 
    private _chatState: CategoryChatStateService, private _genericApiService: GenericApiService, private _diagnosticService: DiagnosticService
    ,private _featureService: FeatureService) {


    this.categoryService.categories.subscribe(categories => {
      this.category = categories.find(category => category.id === this._activatedRoute.snapshot.params.category);
      this._chatState.category = this.category;
      this.features = this._featureService.getFeaturesForCategory(this._chatState.category);
      this.tiles = this.features.map(feature => <Tile>{
        title: feature.name,
        action: () =>  feature.clickAction()
      });

      console.log("Filtered features", this.features );
      this.features.forEach((feature) => {
          this.groups[0].links[0].links.push({
            name: feature.name,
            key: feature.id,
            onClick: (e) => {
              e.preventDefault();
              feature.clickAction();
          //    this.navigateTo('analysis/tcpconnections');
            },
            expandAriaLabel: feature.name,
            collapseAriaLabel: feature.name,
          })
      });

      console.log("this.groups", this.groups);

    //  this.groups = [{links: this.links}];

      this.startingKey = `welcome-${this.category.id}`;


      this._diagnosticService.getDetectors().subscribe(detectors => {

        console.log("All detectors", detectors);
      var currentCategoryDetectors = detectors.filter(detector => detector.category === this.category.name);
      console.log("this category", this.category);

      console.log("Filetered detectors", currentCategoryDetectors);
      if (currentCategoryDetectors.length === 1) {
    //    this._logger.LogTopLevelDetector(currentCategoryDetectors[0].id, currentCategoryDetectors[0].name, this.category.id);
    //    this._router.navigateByUrl(`resource${this._resourceService.resourceIdForRouting}/detectors/${currentCategoryDetectors[0].id}`);
      }
      else {
        const path = ['categories', this.category.id];
        const navigationExtras: NavigationExtras = {
          queryParamsHandling: 'preserve',
          preserveFragment: true,
          relativeTo: this._activatedRoute
        };

    //   this._router.navigate(path, navigationExtras);
      }
    });

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
          position: 'fixed', 
          left: '8px',
          width: '23px'
        }
      };

      this.initialSelectedKey = 'Overview';
      // this.groups = [
      //   {
      //     links: [
            // {
            //   name: 'Home',
            //   key: 'home',
            //   onClick: (e) => {
            //     e.preventDefault();
            //     this.navigateTo('analysis/tcpconnections');
            //   },
            //   expandAriaLabel: 'Overview',
            //   collapseAriaLabel: 'Overview',
            // },
      //       {
      //         name: 'Web app down',
      //         key: 'key1',
      //         onClick: (e) => {
      //           e.preventDefault();
      //           this.navigateTo('detectors/appDownAnalysis');
      //         },
      //       },
      //       {
      //           name: 'Web app slow',
      //           key: 'key2',
      //           onClick: (e) => {
      //             e.preventDefault();
      //             this.navigateTo('detectors/appDownAnalysis');
      //           },
      //         },
      //         {
      //           name: 'Hig CPU performance',
      //           url: '',
      //           key: 'key3',
      //           target: '_blank'
      //         },
      //         {
      //           name: 'Home',
      //           url: '',
      //           onClick: (e) => {
      //             e.preventDefault();
      //             this.navigateTo('analysis/appDownAnalysis');
      //           },
      //           expandAriaLabel: 'Overview',
      //           collapseAriaLabel: 'Overview',
      //           // isExpanded: true,
      //         },
      //         {
      //           name: 'Home',
      //           url: '',
      //           onClick: (e) => {
      //             e.preventDefault();
      //             this.navigateTo('analysis/appDownAnalysis');
      //           },
      //           expandAriaLabel: 'Overview',
      //           collapseAriaLabel: 'Overview',
      //         },
      //         {
      //           name: 'Home',
      //           url: '',
      //           onClick: (e) => {
      //             e.preventDefault();
      //             this.navigateTo('analysis/appDownAnalysis');
      //           },
      //           expandAriaLabel: 'Overview',
      //           collapseAriaLabel: 'Overview',
      //         }
      //     ],
      //   }
      // ];

      console.log("Loading category", this.category);
      console.log("starting key", this.startingKey);
    });

  }

  ngOnInit() {

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