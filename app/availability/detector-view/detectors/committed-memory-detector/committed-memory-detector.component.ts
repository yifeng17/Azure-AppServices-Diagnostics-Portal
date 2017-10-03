import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppAnalysisService, PortalActionService, WindowService, AvailabilityLoggingService } from '../../../../shared/services';
import { IDetectorResponse } from '../../../../shared/models/detectorresponse';
import { DetectorViewBaseComponent } from '../../detector-view-base/detector-view-base.component';
import { ChartType } from '../../../../shared/models/chartdata';

declare let d3: any;

@Component({
    templateUrl: 'committed-memory-detector.component.html'
})

export class CommittedMemoryUsageComponent extends DetectorViewBaseComponent {

    constructor(protected _route: ActivatedRoute, protected _appAnalysisService: AppAnalysisService) {
        super(_route, _appAnalysisService);
        this.detectorMetricsTitle = "Committed MBytes per Instance";
        this.detectorMetricsDescription = "Committed MBytes is the amount of committed virtual memory, in MegaBytes. Committed memory is the physical memory which has space reserved on the disk paging file(s).";
        this.metricsChartType = ChartType.lineChart;
}

    getDetectorName(): string {
        return 'committedmemoryusage';
    }
}