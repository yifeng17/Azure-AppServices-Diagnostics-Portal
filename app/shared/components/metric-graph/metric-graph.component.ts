import { CommonModule } from '@angular/common';
import { Component, Input, Output, OnInit } from '@angular/core';
import { IMetricSet } from '../../models/detectorresponse';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { GraphHelper } from '../../utilities/graphHelper';
import { ChartSeries, ChartType } from '../../models/chartdata';
import 'rxjs/add/operator/map';

@Component({
    selector: 'metric-graph',
    templateUrl: 'metric-graph.component.html'
})
export class MetricGraphComponent implements OnInit {
    constructor() {
        this.chartOptions = GraphHelper.getDefaultChartOptions();
        this.chartType = ChartType.lineChart;
    }

    private _metricSetsSubject: ReplaySubject<IMetricSet[]> = new ReplaySubject<IMetricSet[]>(1); 

    @Input() set metricSets(value: IMetricSet[]) { 
        this._metricSetsSubject.next(value); 
    }

    @Input() title: string;
    @Input() description: string;
    @Input() chartType: ChartType;
    @Input() yAxisLabel: string;

    chartData: ChartSeries[];
    chartOptions: any;

    showDescription: boolean = true;

    ngOnInit() {
        this._metricSetsSubject.subscribe((metricSets: IMetricSet[]) => {
            if(metricSets){
                this.chartOptions.chart.type = ChartType[this.chartType].toString();
                this.chartOptions.chart.yAxis.axisLabel = this.yAxisLabel;
                this.chartOptions.chart.margin.bottom = 40;
                this.chartData = GraphHelper.parseMetricsToChartDataPerInstance(metricSets, 0, false);
            }
        });
    }
}