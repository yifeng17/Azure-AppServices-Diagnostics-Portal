import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppAnalysisService, PortalActionService, WindowService, AvailabilityLoggingService } from '../../../../shared/services';
import { IDetectorResponse } from '../../../../shared/models/detectorresponse';
import { DetectorViewBaseComponent } from '../../detector-view-base/detector-view-base.component';

declare let d3: any;

@Component({
    templateUrl: 'page-operations-detector.component.html'
})

export class PageFileOperationsComponent extends DetectorViewBaseComponent {

    constructor(protected _route: ActivatedRoute, protected _appAnalysisService: AppAnalysisService) {
        super(_route, _appAnalysisService);
        this.detectorMetricsTitle = "Page Reads/sec per Instance";
        this.detectorMetricsDescription = "Page Reads/sec is the rate at which the disk was read to resolve hard page faults. Hard page faults occur when a process references a page in virtual memory that is not in working set or elsewhere in physical memory, and must be retrieved from disk.";
    }

    processDetectorResponse(response: IDetectorResponse){
        this.detectorResponse = response;
        this.detectorMetrics = response.metrics.filter(metric => metric.name === 'Page Reads/sec');
    }

    getDetectorName(): string {
        return 'committedmemoryusage';
    }
}