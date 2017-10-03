import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppAnalysisService, PortalActionService, WindowService, AvailabilityLoggingService } from '../../../../shared/services';
import { IDetectorResponse } from '../../../../shared/models/detectorresponse';
import { DetectorViewBaseComponent } from '../../detector-view-base/detector-view-base.component';

declare let d3: any;

@Component({
    templateUrl: 'php-log-analyzer-detector.component.html',
    styles: ['.row { margin-top: 5px; }']
})

export class PhpLogAnalyzerComponent extends DetectorViewBaseComponent {

    showMetadata: boolean;

    constructor(protected _route: ActivatedRoute, protected _appAnalysisService: AppAnalysisService) {
        super(_route, _appAnalysisService);
        this.detectorMetricsTitle = "PHP Log Analyzer";
        this.detectorMetricsDescription = "The above graph displays the failures based on the PHP log";
        this.showMetadata = false;
    }

    processDetectorResponse(response: IDetectorResponse){
        this.detectorResponse = response;
        this.detectorMetrics = response.metrics;
        this.showMetadata = this.detectorResponse && this.detectorResponse.data.length > 0;
    }
    getDetectorName(): string {
        return 'loganalyzer';
    }
}