import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'category-overview',
  templateUrl: './category-overview.component.html',
  styleUrls: ['./category-overview.component.scss']
})
export class CategoryOverviewComponent implements OnInit {

  categoryId: string = "";
  constructor(private _activatedRoute: ActivatedRoute) {


    // this._activatedRoute.paramMap.subscribe(params => {
    //     console.log("category params", params);
    //     this.categoryId = params.get('category');
    //   });
  }

  ngOnInit() {
    this.categoryId = this._activatedRoute.parent.snapshot.params.category;
    console.log("routes", this._activatedRoute.parent);
    console.log("categoryId", this.categoryId);
  }

}
