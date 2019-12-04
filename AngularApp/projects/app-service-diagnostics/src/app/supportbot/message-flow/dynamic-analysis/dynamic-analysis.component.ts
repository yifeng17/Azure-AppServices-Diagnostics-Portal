import { Component, OnInit } from '@angular/core';
import { Message, TextMessage, ButtonListMessage } from '../../models/message';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'dynamic-analysis',
  templateUrl: './dynamic-analysis.component.html',
  styleUrls: ['./dynamic-analysis.component.scss']
})
export class DynamicAnalysisComponent implements OnInit {

  loading: boolean = true;

  constructor(private _routerLocal: Router, private _activatedRouteLocal: ActivatedRoute) { }

  ngOnInit() {
    //this._routerLocal.navigate([`../../searchResultsAnalysis/search`], { relativeTo: this._activatedRouteLocal, queryParamsHandling: 'merge', queryParams: {searchTerm: this.searchTerm} });
  }
}

export class DynamicAnalysisMessage extends Message {

    constructor(messageDelayInMs: number = 1000) {
      super(DynamicAnalysisComponent, {}, messageDelayInMs);
    }
}
