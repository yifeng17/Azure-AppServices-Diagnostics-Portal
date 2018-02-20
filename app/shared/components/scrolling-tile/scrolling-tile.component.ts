import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ProblemType } from '../../models/problem-category';
import { LoggingService } from '../../services';
import { NguCarousel, NguCarouselStore, NguCarouselService } from '@ngu/carousel';

@Component({
    selector: 'scrolling-tile',
    templateUrl: 'scrolling-tile.component.html',
    styleUrls: ['scrolling-tile.component.css']
    //encapsulation: ViewEncapsulation.None
})

export class ScrollingTileComponent implements OnInit {

    @Input() public ProblemTypes: ProblemType[];

    constructor(private _logger: LoggingService, private carousel: NguCarouselService) {
    }

    logCategorySelected(name: string) {
        this._logger.LogClickEvent(name, 'Home Page');
    }

    private carouselToken: string;

    public carouselTile: NguCarousel;

    ngOnInit() {

        this.carouselTile = {
            grid: { xs: 1, sm: 3, md: 4, lg: 6, all: 0 },
            speed: 600,
            interval: 3000,
            point: {
              visible: true
            },
            load: 2,
            touch: true
          };
    }

    initDataFn(key: NguCarouselStore) {
        this.carouselToken = key.token;
        key.itemWidth= 50;        
    }
}