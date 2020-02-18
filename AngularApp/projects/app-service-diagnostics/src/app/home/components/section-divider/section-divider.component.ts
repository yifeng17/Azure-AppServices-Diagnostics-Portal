import { Component, OnInit, Input, ContentChildren, QueryList } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CategoryMenuItemComponent } from '../category-menu-item/category-menu-item.component';
import { ActivatedRoute, Router, NavigationExtras, NavigationEnd, Scroll } from '@angular/router';

@Component({
  selector: 'section-divider',
  templateUrl: './section-divider.component.html',
  styleUrls: ['./section-divider.component.scss'],
  animations: [
    trigger('expand', [
      state('shown' , style({ height: '*' })),
      state('hidden', style({ height: '0px' })),
      transition('* => *', animate('.1s'))
    ])
  ]
})
export class SectionDividerComponent implements OnInit {

  @Input() label: string;
  @Input() initiallySelected: boolean = true;
  @Input() collapsible: boolean = true;
  @Input() disableExpandIcon: boolean = false;
  @Input() routePath: string="";

  selected: boolean = true;

  constructor(private _route: Router, private _activatedRoute:ActivatedRoute) { }

  ngOnInit() {
    this.selected = this.initiallySelected;
  }


  isSelected() {
    if(this._route.url.includes(this.routePath))
    {
        return true;
    }
    else
    {
        return false;
    }
  }

  sectionHeaderClick() {
      this.navigateTo(`${this.routePath}`);
  }

  navigateTo(path: string) {
    let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'preserve',
        preserveFragment: true,
        relativeTo: this._activatedRoute
    };
    this._route.navigate(path.split('/'), navigationExtras);
}

  toUpperCase(label: string) {
    return label.toUpperCase();
  }

}
