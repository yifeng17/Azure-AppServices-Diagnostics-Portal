import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppAnalysisService } from '../../../../shared/services';
import { IDetectorResponse } from '../../../../shared/models/detectorresponse';
import { DetectorViewBaseComponent } from '../../detector-view-base/detector-view-base.component';
import { ChartType } from '../../../../shared/models/chartdata';
declare let d3: any;

@Component({
    templateUrl: '../../detector-view-base/detector-view-base.component.html',
    styles: ['.row { margin-top: 5px; }']
})
export class ThreadDetectorComponent extends DetectorViewBaseComponent {

    constructor(protected _route: ActivatedRoute, protected _appAnalysisService: AppAnalysisService) {
        super(_route, _appAnalysisService);
        this.detectorMetricsTitle = "App Process Thread Count per Instance";
        this.metricsChartType = ChartType.lineChart;
    }

    processDetectorResponse(response: IDetectorResponse){
        this.detectorResponse = response;
        this.detectorMetrics = response.metrics;
    }

    getDetectorName(): string {
        return 'threadcount';
    }
}