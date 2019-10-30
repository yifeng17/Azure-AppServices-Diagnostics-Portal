import { Component, OnInit, Injector } from '@angular/core';
import { MessageProcessor } from '../../../supportbot/message-processor.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { CategoryService } from '../../../shared-v2/services/category.service';
import { Category } from '../../../shared-v2/models/category';
import { CategoryChatStateService } from '../../../shared-v2/services/category-chat-state.service';
import { INavProps, INavLink, INav, autobind } from 'office-ui-fabric-react';

@Component({
  selector: 'category-chat',
  templateUrl: './category-chat.component.html',
  styleUrls: ['./category-chat.component.scss'],
  providers: [CategoryChatStateService]
})
export class CategoryChatComponent implements OnInit {

  startingKey: string;

  category: Category;

  groups: INavProps["groups"];

  styles: any;

  constructor(private _route: Router, private _injector: Injector, private _activatedRoute: ActivatedRoute, private _categoryService: CategoryService, private _chatState: CategoryChatStateService) {

    this._categoryService.categories.subscribe(categories => {
      this.category = categories.find(category => category.id === this._activatedRoute.snapshot.params.category);
      this._chatState.category = this.category;

      this.startingKey = `welcome-${this.category.id}`;
      this.styles = {
        root: {
          width: 265,
          boxSizing: 'border-box',
          overflowY: 'auto'
        }
      };

      this.groups = [
        {
          links: [
            {
              name: 'Home',
              url: '',
              onClick: () => {
                this.navigateTo('analysis/appDownAnalysis');
              },
              expandAriaLabel: 'Overview',
              collapseAriaLabel: 'Overview',
              isExpanded: true
            },
            {
              name: 'Web app down',
              url: '',
              key: 'key1',
              isExpanded: true,
              onClick: () => {
                this.navigateTo('detectors/tcpconnections');
              },
            },
            {
                name: 'Web app slow',
                url: 'http://example.com',
                key: 'key2',
                isExpanded: true,
                target: '_blank'
              },
              {
                name: 'Hig CPU performance',
                url: 'http://example.com',
                key: 'key3',
                isExpanded: true,
                target: '_blank'
              },
              {
                name: 'Home',
                url: '',
                onClick: () => {
                  this.navigateTo('analysis/appDownAnalysis');
                },
                expandAriaLabel: 'Overview',
                collapseAriaLabel: 'Overview',
                isExpanded: true
              },         {
                name: 'Home',
                url: '',
                onClick: () => {
                  this.navigateTo('analysis/appDownAnalysis');
                },
                expandAriaLabel: 'Overview',
                collapseAriaLabel: 'Overview',
                isExpanded: true
              },         {
                name: 'Home',
                url: '',
                onClick: () => {
                  this.navigateTo('analysis/appDownAnalysis');
                },
                expandAriaLabel: 'Overview',
                collapseAriaLabel: 'Overview',
                isExpanded: true
              },         {
                name: 'Home',
                url: '',
                onClick: () => {
                  this.navigateTo('analysis/appDownAnalysis');
                },
                expandAriaLabel: 'Overview',
                collapseAriaLabel: 'Overview',
                isExpanded: true
              },         {
                name: 'Home',
                url: '',
                onClick: () => {
                  this.navigateTo('analysis/appDownAnalysis');
                },
                expandAriaLabel: 'Overview',
                collapseAriaLabel: 'Overview',
                isExpanded: true
              },         {
                name: 'Home',
                url: '',
                onClick: () => {
                  this.navigateTo('analysis/appDownAnalysis');
                },
                expandAriaLabel: 'Overview',
                collapseAriaLabel: 'Overview',
                isExpanded: true
              },
          ],
        }
      ];

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
