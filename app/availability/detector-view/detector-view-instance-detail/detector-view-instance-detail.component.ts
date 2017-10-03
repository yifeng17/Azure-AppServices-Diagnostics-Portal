import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppAnalysisService, AvailabilityLoggingService} from '../../../shared/services';
import { IMetricSet } from '../../../shared/models/detectorresponse';
import { DetectorViewBaseComponent } from '../detector-view-base/detector-view-base.component';
import { ChartType } from '../../../shared/models/chartdata';
declare let d3: any;

@Component({
    templateUrl: 'detector-view-instance-detail.component.html',
    styles: ['.row { margin-top: 5px; }']
})
export class DetectorViewInstanceDetailComponent extends DetectorViewBaseComponent {

    // The purpose of this class is not really ever to be used by itself but just for all instance detail detectors to extend
    // It also provides a consistent template for components that extend this class to use
    constructor(protected _route: ActivatedRoute, protected _appAnalysisService: AppAnalysisService, protected _logger: AvailabilityLoggingService) {
        super(_route, _appAnalysisService);
        // Right now this is the same for CPU and Memory, the only detectors to extend this class
        this.metricsChartType = ChartType.lineChart;
        this.instanceDetailChartType = ChartType.lineChart;
        this.detectorMetricsYAxisLabel = 'Percent';
        this.instanceDetailYAxisLabel = 'Percent';
    }

    instanceDetailMetrics: IMetricSet[];
    instanceDetailTitle: string;
    instanceDetailDescription: string;
    instanceDetailChartType: ChartType;
    instanceDetailYAxisLabel: string;

    logInstanceSelected(instance: string){
        this._logger.LogDetectorViewInstanceSelected(this.getDetectorName(), instance);
    }
}