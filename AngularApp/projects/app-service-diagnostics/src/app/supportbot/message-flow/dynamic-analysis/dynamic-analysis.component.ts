import { AfterViewInit, Component, EventEmitter, Injector, OnInit, Output, Input } from '@angular/core';
import { Message, TextMessage, ButtonListMessage } from '../../models/message';
import { ActivatedRoute, Router } from '@angular/router';
import { IChatMessageComponent } from '../../interfaces/ichatmessagecomponent';
import { SearchAnalysisMode } from 'projects/diagnostic-data/src/lib/models/search-mode';
// import { FeedbackComponent } from 'diagnostic-data';
import { v4 as uuid } from 'uuid';
import { GenieChatFlow } from '../../../supportbot/message-flow/v2-flows/genie-chat.flow';
import { from } from 'rxjs';
import { ContentService } from '../../../shared-v2/services/content.service';
import { CategoryChatStateService } from '../../../shared-v2/services/category-chat-state.service';
import { LoggingV2Service } from '../../../shared-v2/services/logging-v2.service';

@Component({
    selector: 'dynamic-analysis',
    templateUrl: './dynamic-analysis.component.html',
    styleUrls: ['./dynamic-analysis.component.scss']
})
export class DynamicAnalysisComponent implements OnInit, AfterViewInit, IChatMessageComponent {

    @Output() onViewUpdate = new EventEmitter();
    @Output() onComplete = new EventEmitter<{ status: boolean, data?: any }>();
    @Input() showFeedbackForm: boolean = true;
    @Output() showFeedbackFormChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    loading: boolean = true;
    searchMode: SearchAnalysisMode = SearchAnalysisMode.Genie;

    constructor(private _routerLocal: Router, private _activatedRouteLocal: ActivatedRoute, private injector: Injector, private _genieChatFlow: GenieChatFlow, private _contentService: ContentService, private _chatState: CategoryChatStateService, private _logger: LoggingV2Service) { }

    keyword: string = "";
    targetedScore: number = 0;
    noSearchResult: boolean = undefined;
    showDocumentSearchResult: boolean = false;
    showFeedback: boolean = undefined;
    feedbackText: string = "";
    readonly Feedback: string = 'Feedback';
    ratingEventProperties: { [name: string]: string };
    content: any[];
    getDocumentSearchResult: boolean = false;

    ngOnInit() {
        this.searchMode = SearchAnalysisMode.Genie;
        this.keyword = this.injector.get('keyword');
        this.targetedScore = this.injector.get('targetedScore');
        this.ratingEventProperties = {
            'DetectorId': "id",
            'Url': window.location.href
        };

        console.log("***Dynamic analysis keyword", this.keyword);

        this._logger.LogChatSearch(this.keyword, this._chatState.category.name);
        this._contentService.searchWeb(this.keyword).subscribe(searchResults => {
            if (searchResults && searchResults.webPages && searchResults.webPages.value && searchResults.webPages.value.length > 0) {
                this.getDocumentSearchResult = true;
                this.content = searchResults.webPages.value.map(result => {
                    return {
                        title: result.name,
                        description: result.snippet,
                        link: result.url
                    };
                });

                console.log("content result", this.content);
            }
        });

        // this._routerLocal.navigate([`../analysis/searchResultsAnalysis/search`], { relativeTo: this._activatedRouteLocal, queryParamsHandling: 'merge', queryParams: {searchTerm: this.keyword} });
    }

    ngAfterViewInit() {
        this.onViewUpdate.emit();
    }

    updateStatus(dataOutput) {
        console.log("status Value before", dataOutput);
        let statusValue = {
            status: dataOutput.status,
            outputData: dataOutput.data,
            documentSearchResult: this.content,
            data: true
        };

        if (dataOutput.data == undefined || dataOutput.data.detectors == undefined || dataOutput.data.detectors.length === 0) {
            this.noSearchResult = true;
        }
        else {
            this.noSearchResult = false;
            if (dataOutput.data.successfulViewModels != undefined && dataOutput.data.issueDetectedViewModels != undefined && dataOutput.data.successfulViewModels.length + dataOutput.data.issueDetectedViewModels.length < 7) {
                this.showDocumentSearchResult = true;
            }
        }

        console.log("status Value", statusValue);
        this._genieChatFlow.createMessageFlowForAnaysisResult(statusValue.outputData, this.noSearchResult);

        this.onComplete.emit(statusValue);

        console.log("****lalalastatus Value", statusValue);
    }

    addHelpfulFeedback() {
        this.feedbackText = 'Great to hear! From 1 to 5 stars, how helpful was this?';
        this.showFeedback = true;
    }

    addNotHelpfulFeedback() {
        this.feedbackText = 'Sorry to hear! Could you let us know how we can improve?';
        this.showFeedback = true;
    }
}

export class DynamicAnalysisMessage extends Message {
    constructor(keyword: string = "", targetedScore: number = 0, messageDelayInMs: number = 1000) {
        super(DynamicAnalysisComponent, {
            keyword: keyword,
            targetedScore: targetedScore,
        }, messageDelayInMs);
    }
}
