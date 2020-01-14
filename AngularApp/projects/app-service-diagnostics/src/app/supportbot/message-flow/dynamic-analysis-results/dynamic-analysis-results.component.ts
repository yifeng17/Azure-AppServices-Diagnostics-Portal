import { Component, OnInit, EventEmitter, Output, Injector, AfterViewInit } from '@angular/core';
import { IChatMessageComponent } from '../../interfaces/ichatmessagecomponent';
import { Message } from '../../models/message';
import { ContentService } from '../../../shared-v2/services/content.service';
import { SearchAnalysisMode } from 'projects/diagnostic-data/src/lib/models/search-mode';

@Component({
  selector: 'dynamic-analysis-results',
  templateUrl: './dynamic-analysis-results.component.html',
  styleUrls: ['./dynamic-analysis-results.component.scss']
})
export class DynamicAnalysisResultsComponent implements OnInit, AfterViewInit, IChatMessageComponent {

  content: any[];
  searchMode: SearchAnalysisMode = SearchAnalysisMode.Genie;
  detectorViewModelsData: any = {};
  inputData: any;

  @Output() onViewUpdate = new EventEmitter();
  @Output() onComplete = new EventEmitter<{ status: boolean, data?: any }>();

  constructor(private injector: Injector, private _contentService: ContentService) { }

  ngOnInit() {
    this.searchMode = SearchAnalysisMode.Genie;
    this.inputData = this.injector.get('inputData');
    console.log("****get inputdata", this.inputData);
    this.onComplete.emit({status: true, data: this.inputData});
  //  this._dynamicAnalysisService.getData()
    // this._contentService.getContent().subscribe(content => {
    //   this.content = content;
    //   this.onComplete.emit({status: true});
    // });
  }

  ngAfterViewInit() {
    this.onViewUpdate.emit();
  }

  updateStatus($event) {
   console.log("update status");
  }

  openArticle(link) {
    window.open(link, '_blank');
  }
}

export class DynamicAnalysisResultsMessage extends Message {
  constructor(data: any, keywordId: string = "", messageDelayInMs: number = 1000) {
    super(DynamicAnalysisResultsComponent, {
      inputData: data
     }, messageDelayInMs);
  }
}
