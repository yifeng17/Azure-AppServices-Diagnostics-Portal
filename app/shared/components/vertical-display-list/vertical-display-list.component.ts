import { Component, Input, OnInit, AfterContentInit, ContentChildren, QueryList } from '@angular/core';
import { VerticalDisplayListItemComponent } from './vertical-display-list-item/vertical-display-list-item.component';
import { SolutionTypeTag } from '../../models/solution-type-tag';


@Component({
    selector: 'vertical-display-list',
    templateUrl: 'vertical-display-list.component.html',
    styleUrls: ['vertical-display-list.component.css']
})
export class VerticalDisplayListComponent implements AfterContentInit {
    @ContentChildren(VerticalDisplayListItemComponent) listItems: QueryList<VerticalDisplayListItemComponent>;

    titles: VerticalDisplayListMetaData[];

    ngAfterContentInit() {
        if(this.listItems.length > 0){
            this.listItems.toArray()[0].metaData.isSelected = true;
        }
    }

    selectItem(item: VerticalDisplayListItemComponent){
        this.listItems.forEach(item => item.metaData.isSelected = false);
        item.metaData.isSelected = true;
    }
}

export class VerticalDisplayListMetaData {
    title: string;
    isSelected: boolean;
    tags: SolutionTypeTag[];
}