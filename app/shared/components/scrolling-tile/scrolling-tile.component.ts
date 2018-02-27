import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Subcategory } from '../../models/problem-category';
import { LoggingService } from '../../services';
import { NguCarousel, NguCarouselStore, NguCarouselService } from '@ngu/carousel';

@Component({
    selector: 'scrolling-tile',
    templateUrl: 'scrolling-tile.component.html',
    styleUrls: ['scrolling-tile.component.css']
})

export class ScrollingTileComponent implements OnInit {

    @Input() public Subcategories: Subcategory[];
    @Input() public Collapsed: boolean;

    constructor(private _logger: LoggingService, private carousel: NguCarouselService) {
    }

    logCategorySelected(name: string) {
        this._logger.LogClickEvent(name, 'Home Page');
    }

    public carouselTile: NguCarousel;

    ngOnInit() {

        if (this.Subcategories.length > 0) {
            this.carouselTile = {
                grid: { xs: 0, sm: 0, md: 0, lg: 0, all: 135 },
                slide: 1,
                speed: 600,
                interval: 3000,
                point: {
                    visible: false
                },
                load: 1,
                touch: false
            };
        }
    }
}