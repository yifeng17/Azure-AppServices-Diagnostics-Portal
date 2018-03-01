import { Component, Input, OnInit, ViewEncapsulation, ElementRef, HostBinding, ViewChild, Renderer } from '@angular/core';
import { Subcategory } from '../../models/problem-category';
import { NguCarousel, NguCarouselStore, NguCarouselService } from '@ngu/carousel';
import { LoggingService } from '../../services/logging/logging.service';

@Component({
    selector: 'scrolling-tile',
    templateUrl: 'scrolling-tile.component.html',
    styleUrls: ['scrolling-tile.component.css']
})

export class ScrollingTileComponent implements OnInit {

    @Input() public Subcategories: Subcategory[];
    @Input() public Collapsed: boolean;

    @ViewChild('.carousel-inner', { read: ElementRef })
    private carouselInnerRef: ElementRef;

    private carouselInner: any;

    public carouselTile: NguCarousel;

    public width: number;

    public tileWidth: number = 120;

    public tileCount: number;

    public visibleTileCount: number;

    public leftArrowEnabled: boolean = false;
    public rightArrowEnabled: boolean = false;

    private carouselItems: any;

    constructor(private _logger: LoggingService, private carousel: NguCarouselService, private el: ElementRef, private renderer: Renderer) {
    }

    logCategorySelected(name: string) {
        this._logger.LogClickEvent(name, 'Home Page');
    }

    registerContainerWidth(boundingRect: any) {
        this.width = boundingRect.width;

        this.visibleTileCount = (boundingRect.width - (boundingRect.width % this.tileWidth)) / this.tileWidth;
    }


    ngOnInit() {

        this.registerContainerWidth(this.el.nativeElement.firstElementChild.getBoundingClientRect());

        if (this.Subcategories.length > 0) {
            this.carouselTile = {
                grid: { xs: 0, sm: 0, md: 0, lg: 0, all: 135 },
                speed: 1000,
                interval: 3000,
                point: {
                    visible: false
                },
                load: 1,
                touch: false
            };
        }
    }

    // scrollLeft() {
    //     let start = 0, end = 6, val = 3; 
    //     let speed = 3000;
    //     for (let i = start - 1; i < end; i++) {
    //         val = val * 2;
    //         // tslint:disable-next-line:no-unused-expression
    //         this.carouselItems[i] && this.setStyle(this.carouselItems[i], 'transform', `translate3d(${val}px, 0, 0)`);
    //     }

    //     setTimeout(() => {
    //         for (let i = 0; i < this.carouselItems.length; i++) {
    //             this.setStyle(this.carouselItems[i], 'transform', 'translate3d(0, 0, 0)');
    //         }
    //     }, speed * .7);
    // }

    // private setStyle(el: any, prop: any, val: any): void {
    //     this.renderer.setElementStyle(el, prop, val);
    // }
}