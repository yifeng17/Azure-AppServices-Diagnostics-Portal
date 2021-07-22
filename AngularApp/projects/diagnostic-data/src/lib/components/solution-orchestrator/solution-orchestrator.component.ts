import { Moment } from 'moment';
import { v4 as uuid } from 'uuid';
import { Component, OnInit, Input, Inject, EventEmitter, Output } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { LoadingStatus } from '../../models/loading';
import { StatusStyles } from '../../models/styles';
import { DetectorControlService } from '../../services/detector-control.service';
import { DiagnosticService } from '../../services/diagnostic.service';
import { TelemetryEventNames } from '../../services/telemetry/telemetry.common';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { Solution } from '../solution/solution';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { forkJoin as observableForkJoin, Observable, of } from 'rxjs';
import { map, catchError, delay, retryWhen } from 'rxjs/operators';
import { DetectorResponse, DetectorMetaData, HealthStatus, DetectorType, DownTime } from '../../models/detector';
import { Insight, InsightUtils } from '../../models/insight';
import { DataTableResponseColumn, DataTableResponseObject, DiagnosticData, RenderingType, Rendering, TimeSeriesType, TimeSeriesRendering } from '../../models/detector';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../../config/diagnostic-data-config';
import { AppInsightsQueryService } from '../../services/appinsights.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AppInsightQueryMetadata, AppInsightData, BladeInfo } from '../../models/app-insights';
import { GenericSupportTopicService } from '../../services/generic-support-topic.service';
import {RenderingMode} from "../../models/solution-orchestrator";
import { SearchAnalysisMode } from '../../models/search-mode';
import { GenieGlobals } from '../../services/genie.service';
import { SolutionService } from '../../services/solution.service';
import { PortalActionGenericService } from '../../services/portal-action.service';
import {detectorSearchEnabledPesIds, detectorSearchEnabledPesIdsInternal } from '../../models/search';
import { GenericResourceService } from '../../services/generic-resource-service';
import { WebSearchConfiguration } from '../../models/search';
import { GenericContentService } from '../../services/generic-content.service';

@Component({
    selector: 'solution-orchestrator',
    templateUrl: './solution-orchestrator.component.html',
    styleUrls: ['./solution-orchestrator.component.scss'],
    animations: [
        trigger(
            'loadingAnimation',
            [
                state('shown', style({
                    opacity: 1
                })),
                state('hidden', style({
                    opacity: 0
                })),
                transition('* => *', animate('.3s'))
            ]
        )
    ]
})
export class SolutionOrchestratorComponent extends DataRenderBaseComponent implements OnInit {
    @Input() renderMode: RenderingMode = RenderingMode.CaseSubmission;
    @Input() searchMode: SearchAnalysisMode = SearchAnalysisMode.CaseSubmission;
    @Input() resourceId: string = "";
    @Input() searchTerm: string = "";
    @Input() detectorThresholdScore: number = 0.5;
    @Input() articlesThresholdScore: number = 0.5;
    @Output() onComplete = new EventEmitter<any>();
    @Input() keystoneSolutionView: boolean = false;
    inputAriaLabel: string = "Short description of the issue";
    time: string = "";
    detectorViewModels: any[];
    targetedScore: number = 0.5;
    webSearchConfig: any = null;
    pesId: string = null;

    topLevelSolutions = [];
    issueDetectedViewModels: any[] = [];
    successfulViewModels: any[] = [];
    webDocuments = [];
    azureGuide = {};
    videoGuides = [];

    documentsShowLoader = false;
    azureGuidesShowLoader = false;

    detectors: any[] = [];


    detectorId: string;
    detectorName: string = '';
    contentHeight: string;
    LoadingStatus = LoadingStatus;
    detectorMetaData: DetectorMetaData[];
    private childDetectorsEventProperties = {};
    loadingChildDetectors: boolean = false;
    appInsights: any;
    allSolutions: Solution[] = [];
    loadingMessages: string[] = [];
    loadingMessageIndex: number = 0;
    loadingMessageTimer: any;
    showLoadingMessage: boolean = false;
    startTime: Moment;
    endTime: Moment;
    renderingProperties: Rendering;
    isPublic: boolean;
    showAppInsightsSection: boolean = true;
    isAppInsightsEnabled: boolean = false;
    appInsightQueryMetaDataList: AppInsightQueryMetadata[] = [];
    appInsightDataList: AppInsightData[] = [];
    diagnosticDataSet: DiagnosticData[] = [];
    loadingAppInsightsResource: boolean = true;
    loadingAppInsightsQueryData: boolean = true;
    supportDocumentContent: string = "";
    supportDocumentRendered: boolean = false;
    isDynamicAnalysis: boolean = false;
    searchId: string = null;
    showPreLoader: boolean = false;
    preLoadingErrorMessage: string = "Some error occurred while fetching diagnostics."
    showPreLoadingError: boolean = false;
    withinGenie: boolean = false;
    isSearchEmbedded: boolean = false;
    showSuccessfulChecks: boolean = true;
    showWebSearch: boolean = false;
    showWebSearchTimeout: any = null;
    searchDiagnosticData: DiagnosticData;
    readonly stringFormat: string = 'YYYY-MM-DDTHH:mm';
    public inDrillDownMode: boolean = false;
    drillDownDetectorId: string = '';

    solutionsArray = [
        {
            Title: "Review Application Insights Telmetry",
            DescriptionMarkdown: `\n            ### Review Application Insights Data\n\n            It appears that application insights was integrated for this app so review Application Insights data to identify why\n            custom exceptions were thrown by application code or why app was taking a long time to load.\n\n            1. Go to **Application Insights** blade for this App.\n            2. Click on **View Application Insights Data**.\n            3. If that doesn't help, use **Azure Application Insights Snapshot Debugger** to debug the issue further.\n            `,
            Score: 0.9
        },
        {
            Title: "Collect .NET Profiler Trace",
            DescriptionMarkdown: `\n        ### Collect .NET Profiler\n\n        If the issue is happening right now, collect .NET Profiler trace to troubleshoot the issue. A profiler trace helps \n        you easily identify the ExceptionType, message and callstack for a .NET exception without installing any additional \n        tools and without changing the state of the problem. Profiler trace helps you identify exceptions in both ASP.NET \n        and ASP.NET Core applications.\n\n        > If you already know the exact **ExceptionType, Exception Message** and **call stack**, then this tool may not be able to offer more. Try searching online in <a href='https://stackoverflow.com/questions/tagged/azure-web-sites' target='_blank'>StackOverflow.com</a>, <a href='https://social.msdn.microsoft.com/Forums/azure/en-US/home?forum=windowsazurewebsitespreview' target='_blank'>Microsoft forums</a> or open a Support Ticket to identify how to solve the exception.</i>\n        \n        `,
            Score: 0.88
        },
        {
            Title: "Configure AutoHealing Custom Action",
            DescriptionMarkdown: `\n        ### Configure AutoHealing Custom Action\n\n         **If the issue is not reproducible or intermittent**, you can configure AutoHealing's custom action \n         to collect some data (like profiler trace or memory dump) that will help you debug the issue further.\n         The triggers and actions allow you to define various conditions based on request count, slow requests, \n         memory limit on which you can take specific actions like restarting the process, logging an event,\n          or starting another executable.\n        `,
            Score: 0.6
        }
    ];

    docs = [
        {
            Title: "Troubleshooting 502 errors on Azure",
            Description: "App restarts can cause 502 errors. This is a guide to troubleshooting 502 errors when they occur.",
            Url: "https://docs.azure.com/app-services/502-errors/troubleshoot"
        },
        {
            Title: "Troubleshooting 503 errors on Azure",
            Description: "App restarts can cause 503 errors. This is a guide to troubleshooting 503 errors when they occur.",
            Url: "https://docs.azure.com/app-services/503-errors/troubleshoot"
        }
    ];

    issuesDetected = [];

    successfulChecks = [];

    linkStyle = {
        root: {
            marginTop: '12px',
            marginLeft: '20px',
            fontSize: '13px'
        }
    };

    successfulLinkStyle = {
        root: {
            margin: '10px 0px 2px 2px',
            fontSize: '13px'
        }
    };

    solutionButtonStyle = {
        root: {
            marginTop: '10px',
            height: '25px',
            fontSize: '13px',
            paddingBottom: '2px'
        }
    }

    constructor(public _activatedRoute: ActivatedRoute, private _router: Router,
        private _diagnosticService: DiagnosticService, private _detectorControl: DetectorControlService,
        protected telemetryService: TelemetryService, public _appInsightsService: AppInsightsQueryService,
        private _supportTopicService: GenericSupportTopicService, protected _globals: GenieGlobals, private _solutionService: SolutionService,
        @Inject(DIAGNOSTIC_DATA_CONFIG) config: DiagnosticDataConfig, private portalActionService: PortalActionGenericService, private _resourceService: GenericResourceService, private _contentService: GenericContentService,) {
        super(telemetryService);
        this.isPublic = config && config.isPublic;

        if (this.isPublic) {
            this.getPesId();
            /*this._appInsightsService.CheckIfAppInsightsEnabled().subscribe(isAppinsightsEnabled => {
                this.isAppInsightsEnabled = isAppinsightsEnabled;
                this.loadingAppInsightsResource = false;
            });*/
        }
    }

    public _downTime: DownTime = null;
    @Input()
    set downTime(downTime: DownTime) {
        if (!!downTime && !!downTime.StartTime && !!downTime.EndTime) {
            this._downTime = downTime;
            //this.refresh();
        }
        else {
            this._downTime = null;
        }
    }

    //Utility functions
    selectResult(doc: any) {
        window.open(doc.Url, '_blank');
        //this.logEvent(TelemetryEventNames.WebQueryResultClicked, { searchId: this.searchId, article: JSON.stringify(article), ts: Math.floor((new Date()).getTime() / 1000).toString() });
    }

    getLinkText(link: string) {
        return !link || link.length < 20 ? link : link.substr(0, 25) + '...';
    }

    getChildrenOfAnalysis(analysisId, detectorList) {
        return detectorList.filter(element => (element.analysisTypes != null && element.analysisTypes.length > 0 && element.analysisTypes.findIndex(x => x == analysisId) >= 0)).map(element => { return { name: element.name, id: element.id }; });
    }

    showSolutions(){}

    resetGlobals() {
        this.detectors = [];
        this.detectorViewModels = [];
        this.issueDetectedViewModels = [];
        this.loadingChildDetectors = false;
        this.allSolutions = [];
        this.loadingMessages = [];
        this.successfulViewModels = [];
        this.showWebSearch = false;
        this.isSearchEmbedded = false;
        this.downTime = null;
    }

    ngOnInit() {
        this.getAzureGuides();
        this._activatedRoute.queryParamMap.subscribe(qParams => {
            this.resetGlobals();
            this.searchTerm = qParams.get('searchTerm') === null ? this.searchTerm : qParams.get('searchTerm');
            if (this.searchTerm && this.searchTerm.length>1) {
                this.hitSearch();
            }
        });
    }

    updateSearchTerm(searchValue: { newValue: string }) {
        //this.searchTerm = searchValue.newValue;
    }

    getPesId(){
        this._resourceService.getPesId().subscribe(pesId => {
            this.pesId = pesId;
        });    
    }

    onSearchBoxFocus(){}

    refreshPage() {}

    updateMessage(s: string) {
        this.time = s;
    }

    toggleOpenTimePicker() {
        //this.globals.openTimePicker = !this.globals.openTimePicker;
        //this.updateAriaExpanded();
    }

    sendFeedback() {}

    public getMetaDataMarkdown(metaData: AppInsightQueryMetadata) {
        let str = "<pre>" + metaData.query + "</pre>";
        return str;
    }

    getAzureGuides() {
        if (!this.supportDocumentRendered) {
            this.azureGuidesShowLoader = true;
            this._supportTopicService.getSelfHelpContentDocument().subscribe(res => {
                this.azureGuidesShowLoader = false;
                if (res && res.length > 0) {
                    var htmlContent = res[0]["htmlContent"];
                    // Custom javascript code to remove top header from support document html string
                    var tmp = document.createElement("DIV");
                    tmp.innerHTML = htmlContent;
                    var h2s = tmp.getElementsByTagName("h2");
                    if (h2s && h2s.length > 0) {
                        h2s[0].remove();
                    }

                    // Set the innter html for support document display
                    this.supportDocumentContent = tmp.innerHTML;
                    this.supportDocumentRendered = true;
                }
            }, (err) => {
                this.azureGuidesShowLoader = false;
            });
        }
    }

    getBingSearchTask(preferredSites:string[]) {
        return this._contentService.searchWeb(this.searchTerm, this.webSearchConfig.MaxResults.toString(), this.webSearchConfig.UseStack, preferredSites, this.webSearchConfig.ExcludedSites).pipe(map((res) => res), retryWhen(errors => {
            let numRetries = 0;
            return errors.pipe(delay(1000), map(err => {
                if (numRetries++ === 3) {
                    throw err;
                }
                return err;
            }));
        }), catchError(e => {
            throw e;
        }));
    }

    getDocuments() {
        if (!this.webSearchConfig) {
            this.webSearchConfig = new WebSearchConfiguration(this.pesId);
        }
        var searchTask;
        let searchTaskComplete = false;
        let searchTaskPrefsComplete = false;
        let searchTaskPrefs = null;
        let searchTaskResult = null;
        let searchTaskPrefsResult = null;
        // make call to bing search
        var preferredSites = [];
        searchTask = this.getBingSearchTask(preferredSites);
        if (this.webSearchConfig && this.webSearchConfig.PreferredSites && this.webSearchConfig.PreferredSites.length>0) {
            searchTaskPrefs = this.getBingSearchTask(this.webSearchConfig.PreferredSites);
        }
        else {
            searchTaskPrefsComplete = true;
        }
        let postFinish = () => {
            if (searchTaskComplete && searchTaskPrefsComplete) {
                let webresults = this.mergeBingResults([searchTaskResult, searchTaskPrefsResult]);
                this.displayWebResults(webresults);
            }
        }
        this.documentsShowLoader = true;
        searchTask.subscribe(res => {
            searchTaskResult = res;
            searchTaskComplete = true;
            postFinish();
        }, (err)=> {
            searchTaskResult = null;
            searchTaskComplete = true;
            postFinish();
        });
        if (searchTaskPrefs) {
            searchTaskPrefs.subscribe(res => {
                searchTaskPrefsResult = res;
                searchTaskPrefsComplete = true;
                postFinish();
            }, (err)=> {
                searchTaskPrefsResult = null;
                searchTaskPrefsComplete = true;
                postFinish();
            });
        }        
    }

    displayWebResults(results) {
        this.documentsShowLoader = false;
        if (results && results.webPages && results.webPages.value && results.webPages.value.length > 0) {
            
            var webSearchResults = results.webPages.value;
            this.webDocuments = webSearchResults.map(result => {
                return {
                    title: result.name,
                    description: result.snippet,
                    link: result.url,
                    articleSurfacedBy : result.resultSurfacedBy || "Bing"
                };
            });
            this.webDocuments = this.rankResultsBySource(this.webDocuments);
        }
    }

    rankResultsBySource(resultsList) {
        if (!resultsList || resultsList.length == 0) {
            return [];
        }
        var seenSources = {};
        var part1 = [];
        var part2 = [];
        resultsList.forEach(item => {
            let itemUrl = new URL(item.link);
            let itemSource = itemUrl.hostname;
            if (seenSources.hasOwnProperty(itemSource)) {
                if (seenSources[itemSource]>2)
                part2.push(item);
                else
                {
                    part1.push(item);
                    seenSources[itemSource]++;
                }
            }
            else {
                part1.push(item);
                seenSources[itemSource] = 1;
            }
        });
        return part1.concat(part2);
    }

    mergeBingResults(results) {
        var finalResults = results[0];
        if (!(finalResults && finalResults.webPages && finalResults.webPages.value && finalResults.webPages.value.length > 0)) {
            finalResults = {
                webPages: {
                    value: []
                }
            };
        }
        if (results.length>1) {
            if (results[1] && results[1].webPages && results[1].webPages.value && results[1].webPages.value.length > 0) {
                results[1].webPages.value.forEach(result => {
                    var idx = finalResults.webPages.value.findIndex(x => x.url==result.url);
                    if (idx<0) {
                        finalResults.webPages.value.push(result);
                    }
                });
            }
        }
        return finalResults;
    }

    isInCaseSubmission(): boolean {
        return !!this._supportTopicService && !!this._supportTopicService.supportTopicId && this._supportTopicService.supportTopicId != '';
    }

    onSearchEnter(searchValue: { newValue: string }) {
        console.log("Hitting search with", searchValue);
        let searchTerm = searchValue.newValue;
        if (searchTerm !== this.searchTerm) {
            this.hitSearch();
        }
    }

    hitSearch() {
        if (this.searchTerm && this.searchTerm.length>1) {
            var detectorsTask = this.searchDetectors();
            var webDocuments = this.getDocuments();
        }
        else {
            this.refreshPage();
        }
    }

    insertInDetectorArray(detectorItem) {
        if (this.withinGenie) {
            if (this.detectors.findIndex(x => x.id === detectorItem.id) < 0 && detectorItem.score >= this.targetedScore) {
                this.detectors.push(detectorItem);
                this.loadingMessages.push("Checking " + detectorItem.name);
            }
        }
        else if (this.detectors.findIndex(x => x.id === detectorItem.id) < 0) {
            this.detectors.push(detectorItem);
            this.loadingMessages.push("Checking " + detectorItem.name);
        }
    }

    searchDetectors() {
        this._resourceService.getPesId().subscribe(pesId => {
            if (!((this.isPublic && detectorSearchEnabledPesIds.findIndex(x => x==pesId)<0) || (!this.isPublic && detectorSearchEnabledPesIdsInternal.findIndex(x => x==pesId)<0))){
                this.searchId = uuid();
                let searchTask = this._diagnosticService.getDetectorsSearch(this.searchTerm).pipe(map((res) => res), catchError(e => of([])));
                let detectorsTask = this._diagnosticService.getDetectors().pipe(map((res) => res), catchError(e => of([])));
                this.showPreLoader = true;
                observableForkJoin([searchTask, detectorsTask]).subscribe(results => {
                    var searchResults: DetectorMetaData[] = results[0];
                    this.logEvent(TelemetryEventNames.SearchQueryResults, {
                        searchMode: this.searchMode,
                        searchId: this.searchId,
                        query: this.searchTerm, results: JSON.stringify(searchResults.map((det: DetectorMetaData) => new Object({
                            id: det.id,
                            score: det.score
                        }))), ts: Math.floor((new Date()).getTime() / 1000).toString()
                    });
                    var detectorList = results[1];
                    if (detectorList) {
                        searchResults.forEach(result => {
                            if (result.type === DetectorType.Detector) {
                                this.insertInDetectorArray({ name: result.name, id: result.id, score: result.score });
                            }
                            else if (result.type === DetectorType.Analysis) {
                                var childList = this.getChildrenOfAnalysis(result.id, detectorList);
                                if (childList && childList.length > 0) {
                                    childList.forEach((child: DetectorMetaData) => {
                                        this.insertInDetectorArray({ name: child.name, id: child.id, score: result.score });
                                    });
                                }
                                else {
                                    this.insertInDetectorArray({ name: result.name, id: result.id, score: result.score });
                                }
                            }
                        });
                    }
                    this.startDetectorRendering(detectorList, null, false);
                });
            }
        });
    }

    //checkKeystoneSolutions() {}

    startDetectorRendering(detectorList, downTime: DownTime, containsDownTime: boolean) {
        this.issueDetectedViewModels = [];
        const requests: Observable<any>[] = [];

        this.detectorMetaData = detectorList.filter(detector => this.detectors.findIndex(d => d.id === detector.id) >= 0);
        this.detectorViewModels = this.detectorMetaData.map(detector => this.getDetectorViewModel(detector, downTime, containsDownTime));
        if (this.detectorViewModels.length > 0) {
            this.loadingChildDetectors = true;
        }
        this.detectorViewModels.forEach((metaData, index) => {
            requests.push((<Observable<DetectorResponse>>metaData.request).pipe(
                map((response: DetectorResponse) => {
                    this.detectorViewModels[index] = this.updateDetectorViewModelSuccess(metaData, response);

                    if (this.detectorViewModels[index].loadingStatus !== LoadingStatus.Failed) {
                        if (this.detectorViewModels[index].status === HealthStatus.Critical || this.detectorViewModels[index].status === HealthStatus.Warning) {
                            let insight = this.getDetectorInsight(this.detectorViewModels[index], 0);
                            let issueDetectedViewModel = { model: this.detectorViewModels[index], insightTitle: insight.title, insightDescription: insight.description };

                            if (this.issueDetectedViewModels.length > 0) {
                                this.issueDetectedViewModels = this.issueDetectedViewModels.filter(iVM => (!!iVM.model && !!iVM.model.metadata && !!iVM.model.metadata.id && iVM.model.metadata.id != issueDetectedViewModel.model.metadata.id));
                            }

                            this.issueDetectedViewModels.push(issueDetectedViewModel);
                            this.issueDetectedViewModels = this.issueDetectedViewModels.sort((n1, n2) => n1.model.status - n2.model.status);
                        } else {
                            let insight = this.getDetectorInsight(this.detectorViewModels[index], 0);
                            let successViewModel = { model: this.detectorViewModels[index], insightTitle: insight.title, insightDescription: insight.description };

                            if (this.successfulViewModels.length > 0) {
                                this.successfulViewModels = this.successfulViewModels.filter(sVM => (!!sVM.model && !!sVM.model.metadata && !!sVM.model.metadata.id && sVM.model.metadata.id != successViewModel.model.metadata.id));
                            }

                            this.successfulViewModels.push(successViewModel);
                        }
                    }

                    return {
                        'ChildDetectorName': this.detectorViewModels[index].title,
                        'ChildDetectorId': this.detectorViewModels[index].metadata.id,
                        'ChildDetectorStatus': this.detectorViewModels[index].status,
                        'ChildDetectorLoadingStatus': this.detectorViewModels[index].loadingStatus
                    };
                })
                , catchError(err => {
                    this.detectorViewModels[index].loadingStatus = LoadingStatus.Failed;
                    return of({});
                })
            ));
        });

        // Log all the children detectors
        observableForkJoin(requests).subscribe(childDetectorData => {
            setTimeout(() => {
                let dataOutput = {};
                dataOutput["status"] = true;
                dataOutput["data"] = {
                    'searchMode': this.searchMode,
                    'detectors': this.detectors,
                    'successfulViewModels': this.successfulViewModels,
                    'issueDetectedViewModels': this.issueDetectedViewModels
                };

                this.onComplete.emit(dataOutput);
            }, 10);

            this.childDetectorsEventProperties['ChildDetectorsList'] = JSON.stringify(childDetectorData);
            if (this.searchId && this.searchId.length > 0) {
                this.childDetectorsEventProperties['SearchId'] = this.searchId;
            }
            this.logEvent(TelemetryEventNames.ChildDetectorsSummary, this.childDetectorsEventProperties);
        });

        if (requests.length === 0) {
            let dataOutput = {};
            dataOutput["status"] = true;
            dataOutput["data"] = {
                'detectors': []
            };

            this.onComplete.emit(dataOutput);
        }
    }

    updateDetectorViewModelSuccess(viewModel: any, res: DetectorResponse) {
        const status = res.status.statusId;

        viewModel.loadingStatus = LoadingStatus.Success,
            viewModel.status = status;
        viewModel.statusColor = StatusStyles.getColorByStatus(status),
            viewModel.statusIcon = StatusStyles.getIconByStatus(status),
            viewModel.response = res;
        return viewModel;
    }

    getPendingDetectorCount(): number {
        let pendingCount = 0;
        if (this.detectorViewModels) {
            this.detectorViewModels.forEach((metaData, index) => {
                if (this.detectorViewModels[index].loadingStatus == LoadingStatus.Loading) {
                    ++pendingCount;
                }
            });
        }
        return pendingCount;
    }

    getDetectorInsight(viewModel: any, score: number): any {
        let allInsights: Insight[] = InsightUtils.parseAllInsightsFromResponse(viewModel.response,true);
        let insight: any;
        if (allInsights.length > 0) {

            let detectorInsight = allInsights.find(i => i.status === viewModel.status);
            if (detectorInsight == null) {
                detectorInsight = allInsights[0];
            }

            let description = null;
            if (detectorInsight.hasData()) {
                description = detectorInsight.data["Description"];
            }
            insight = { title: detectorInsight.title, description: description };

            // now populate solutions for all the insights
            allInsights.forEach(i => {
                if (i.solutions != null) {
                    i.solutions.forEach(s => {
                        if (this.allSolutions.findIndex(x => x.Name === s.Name) === -1) {
                            this.allSolutions.push(s);
                        }
                    });
                }
            });
        }
        return insight;
    }

    ngOnChanges() {
    }

    getDetectorViewModel(detector: DetectorMetaData, downtime: DownTime, containsDownTime: boolean) {
        let startTimeString = this._detectorControl.startTimeString;
        let endTimeString = this._detectorControl.endTimeString;

        if (containsDownTime && !!downtime && !!downtime.StartTime && !!downtime.EndTime) {
            startTimeString = downtime.StartTime.format(this.stringFormat);
            endTimeString = downtime.EndTime.format(this.stringFormat);
        }

        return {
            title: detector.name,
            metadata: detector,
            loadingStatus: LoadingStatus.Loading,
            startTime: startTimeString,
            endTime: endTimeString,
            status: null,
            statusColor: null,
            statusIcon: null,
            expanded: false,
            response: null,
            request: this._diagnosticService.getDetector(detector.id, startTimeString, endTimeString)
        };
    }

    showDetectorById(detector: string) {

    }

    openBladeDiagnoseDetectorId(category: string, detector: string, type: DetectorType = DetectorType.Detector) {
        const bladeInfo = {
            title: category,
            detailBlade: 'SCIFrameBlade',
            extension: 'WebsitesExtension',
            detailBladeInputs: {
                id: this.resourceId,
                categoryId: category,
                optionalParameters: [{
                    key: "categoryId",
                    value: category
                },
                {
                    key: "detectorId",
                    value: detector
                },
                {
                    key: "detectorType",
                    value: type
                }]
            }
        };
        this._solutionService.GoToBlade(this.resourceId, bladeInfo);

    }

    navigateTo(path: string) {
        let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'preserve',
            preserveFragment: true,
            relativeTo: this._activatedRoute
        };
        let segments: string[] = [path];
        this._router.navigate(segments, navigationExtras);
    }
}

