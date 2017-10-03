import { Component } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { AppAnalysisService, AvailabilityLoggingService, AuthService } from '../../../../shared/services';
import { IDetectorResponse } from '../../../../shared/models/detectorresponse';
import { DetectorViewInstanceDetailComponent } from '../../detector-view-instance-detail/detector-view-instance-detail.component';
import { StartupInfo } from '../../../../shared/models/portal';
declare let d3: any;

@Component({
    templateUrl: 'site-cpu-analysis-detector.component.html',
    styles: ['.row { margin-top: 5px; }']
})
export class SiteCpuAnalysisDetectorComponent extends DetectorViewInstanceDetailComponent {

    showProblemsAndSolutions: boolean = false;
    bladeOpenedFromSupportTicketFlow: boolean = false;

    constructor(protected _route: ActivatedRoute, protected _appAnalysisService: AppAnalysisService, protected _logger: AvailabilityLoggingService, private _authService: AuthService) {
        super(_route, _appAnalysisService, _logger);
        this.detectorMetricsTitle = "Overall CPU Usage per Instance";
        this.detectorMetricsDescription = "This graphs shows the total CPU usage on each of the instances where your application is running. " +
            "Below you can look at a specific instance and see how much CPU each app is consuming."
        this.instanceDetailTitle = "App CPU Usage Breakdown";
        this.instanceDetailDescription = "This shows the average CPU usage, in percent out of 100, for each application in the given time window."

        this.showProblemsAndSolutions = this._route.snapshot.url.findIndex((x: UrlSegment) => x.path === 'focus') > 0;

        this._authService.getStartupInfo().subscribe((startupInfo: StartupInfo) => {
            this.bladeOpenedFromSupportTicketFlow = startupInfo.source !== undefined && startupInfo.source.toLowerCase() === 'casesubmission';
        });
    }

    processDetectorResponse(response: IDetectorResponse) {
        this.detectorResponse = response;
        this.detectorMetrics = response.metrics.filter(x => x.name === "Overall CPU Percent");
        this.instanceDetailMetrics = response.metrics.filter(x => x.name !== "Overall CPU Percent");
    }

    getDetectorName(): string {
        return 'sitecpuanalysis';
    }
}