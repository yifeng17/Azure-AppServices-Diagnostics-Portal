import { Component, Injector, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IChatMessageComponent } from '../../interfaces/ichatmessagecomponent';
import { LoggingService } from '../../../shared/services';

@Component({
    templateUrl: 'main-menu.component.html'
})
export class MainMenuComponent implements OnInit, AfterViewInit, IChatMessageComponent {

    categories: { name: string, href: string }[];
    colors: { text: string, background: string }[];

    @Output() onViewUpdate = new EventEmitter();
    @Output() onComplete = new EventEmitter<{ status: boolean, data?: any }>();

    constructor(private _injector: Injector, private _router: Router, private _logger: LoggingService) {
    }

    ngOnInit(): void {
        let categoriesFromParams: any[] = this._injector.get('categories');
        var iterator = 0;
        this.categories = [];

        this._initializeColors();

        var interval = setInterval(() => {
            if (iterator >= categoriesFromParams.length) {
                clearInterval(interval);

                setTimeout(() => {
                    this.onComplete.emit({ status: true });
                }, 300);

            }
            else {
                this.categories.push(categoriesFromParams[iterator]);
            }
            iterator++;
        }, 100);
    }

    ngAfterViewInit(): void {
        this.onViewUpdate.emit();
    }

    private _initializeColors() {
        this.colors = [{
            text: 'white',
            background: '#1446a0'
        }, {
            text: 'white',
            background: '#ef476f'
        }, {
            text: 'white',
            background: '#540d6e'
        }, {
            text: 'white',
            background: 'rgb(1, 185, 137)'
        }, {
            text: 'white',
            background: 'rgb(234, 131, 0)'
        }];
    }

    logCategorySelected(name: string) {
        this._logger.LogClickEvent(name, 'Home Page');
    }
}
