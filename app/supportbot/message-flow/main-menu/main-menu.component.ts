import { Component, Injector, Output, EventEmitter, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IChatMessageComponent } from '../../interfaces/ichatmessagecomponent';
import { LoggingService, SiteService } from '../../../shared/services';
import { OperatingSystem, SiteExtensions, Site } from '../../../shared/models/site';
import { ProblemCategoriesService } from '../../../shared/services/problem-categories.service';
import { Category, ProblemType } from '../../../shared/models/problem-category';

@Component({
    templateUrl: 'main-menu.component.html',
    providers: [ProblemCategoriesService]
})
export class MainMenuComponent implements OnInit, AfterViewInit, IChatMessageComponent {

    problemCategories: Category[] = [];
    
    @Output() onViewUpdate = new EventEmitter();
    @Output() onComplete = new EventEmitter<{ status: boolean, data?: any }>();
    @Input() collapsed: boolean[] = [];

    constructor(private _injector: Injector, private _router: Router, private _logger: LoggingService, private _siteService: SiteService, private _categoryService: ProblemCategoriesService) {
    }

    ngOnInit(): void {

        this._siteService.currentSite.subscribe(site => {
            if (site) {
                this.problemCategories = this._categoryService.getCategories(site);
                this.problemCategories.forEach((x)=> {
                    this.collapsed.push(x.Collapsed);
                });

                setTimeout(() => {
                    this.onComplete.emit({ status: true });
                }, 300);
            }
        })
    }

    ngAfterViewInit(): void {
        this.onViewUpdate.emit();
    }    
}
