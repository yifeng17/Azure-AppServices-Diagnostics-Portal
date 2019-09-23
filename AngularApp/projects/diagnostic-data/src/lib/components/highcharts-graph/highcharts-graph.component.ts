import * as momentNs from 'moment';
import { Component, Input, OnInit } from '@angular/core';
import { TimeSeriesType } from '../../models/detector';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import * as HC_customEvents from 'highcharts-custom-events';
import AccessibilityModule from 'highcharts/modules/accessibility';
import { HighchartsUtilities } from '../../utilities/highcharts-utilities';
import { DetectorControlService } from '../../services/detector-control.service';

HC_exporting(Highcharts);
AccessibilityModule(Highcharts);
HC_customEvents(Highcharts);

const moment = momentNs;

declare let d3: any;

@Component({
    selector: 'highcharts-graph',
    templateUrl: './highcharts-graph.component.html',
    styleUrls: ['./highcharts-graph.component.scss']
})
export class HighchartsGraphComponent implements OnInit {
    Highcharts: typeof Highcharts = Highcharts;
    options: any;

    @Input() HighchartData: any = [];

    @Input() chartDescription: string="Chart description";

    @Input() chartType: TimeSeriesType;

    @Input() chartOptions: any;

    @Input() startTime: momentNs.Moment;

    @Input() endTime: momentNs.Moment;

    @Input() synchronizingZoom: boolean = true;

    synchronizingZoom1: boolean = true;

    loading: boolean = true;

    constructor(private detectorControlService: DetectorControlService) {
        this.synchronizingZoom1 = this.detectorControlService.synchronizingZoom;
    }

    ngOnInit() {

        this._setOptions();
        this._updateOptions();

        setTimeout(() => {
            this.loading = false;
        }, 100);
    }
    private _updateOptions() {
        if (this.chartType) {
            // stacking:
            // Undefined to disable
            // "Normal" to stack by value
            // "Stack" by "percent".

            let type: string = 'line';
            let stacking = undefined;
            switch (this.chartType as TimeSeriesType) {
                case TimeSeriesType.StackedAreaGraph:
                    type = 'area';
                    stacking = 'normal';
                    break;
                case TimeSeriesType.StackedBarGraph:
                    type = 'column';
                    stacking = 'normal';
                    break;
                case TimeSeriesType.BarGraph:
                    type = 'column';
                    stacking = undefined;
                    break;
                case TimeSeriesType.LineGraph:
                default:
                    type = 'line';
                    break;
            }

            if (this.chartOptions && this.chartOptions["type"]) {
                type = this.chartOptions["type"];
                console.log("type", this.chartOptions["type"]);
            }

            if (this.chartOptions && this.chartOptions["stacking"]) {
                stacking = this.chartOptions["stacking"];
                console.log("stacking", this.chartOptions["stacking"]);
            }

            this.options.chart.type = type;
            this.options.plotOptions.series.stacking = stacking;

        }

        if (this.chartOptions) {
            this._updateObject(this.options, this.chartOptions);
        }

        if (this.startTime && this.endTime) {
            this.options.forceX = [this.startTime, this.endTime];
        }
    }

    private _updateObject(obj: Object, replacement: any): Object {
        // The option keys are different from nvd3. eg. In order to override default colors,
        // use "colors" as key  instead of "color"
        Object.keys(replacement).forEach(key => {
            const subItem = obj[key];
            const replace = replacement[key];

            // Below returns true if subItem is an object
            if (subItem === Object(subItem)) {
                obj[key] = this._updateObject(subItem, replace);
            } else {
                // Special handling to make graph option keys to both highchart formatting and nvd3 formatting
                if (key === "color" || key === "colors")
                {
                    key = "colors";
                }
                obj[key] = replace;
            }
        });

        return obj;
    }


    private _setOptions() {
        console.log("Description to set options", this.chartDescription);
        let synchronizingZoom1 = this.detectorControlService.synchronizingZoom;
     //   let description = this.chartOptions != undefined && this.chartOptions["description"] != undefined ? this.chartOptions["description"]: "Chart description";
        this.options = {
            title: { text: '' },
            accessibility: {
                enabled: true,
                describeSingleSeries: true,
            //    description: `${this.chartDescription}`,
                keyboardNavigation: {
                    enabled: true,
                    mode: "normal",
                    order: ["legend", "series", "zoom", "rangeSelector", "chartMenu"]
                }
            },
            caption: {
                text: `${this.chartDescription}`,
            },
            chart: {
                // styledMode: true,
                reflow: true,
                height: 200,
                // 'line', 'area', 'column'
                type: 'line',
                zoomType: 'x',
                resetZoomButton: {
                    position: {
                        // align: 'left', // by default
                        // verticalAlign: 'bottom', // by default
                        x: 0,
                        y: -10
                    }
                }
            },
            legend: {
                enabled: true,
                align: 'center',
                layout: 'horizontal',
                verticalAlign: 'top',
                itemStyle: { "color": "#333", "cursor": "pointer", "fontSize": "12px", "textOverflow": "ellipsis", "font-weight": "normal", "font-family": " Arial, sans-serif" },
                itemMarginTop: 0,
                itemMarginBottom: 0,
                accessibility: {
                    enabled: true,
                    keyboardNavigation: {
                        enabled: true
                    }
                }
            },
            plotOptions: {
                series: {
                    showInLegend: true,
                    lineWidth: 1.5,
                    negativeColor: 'red',
                    accessiblity: {
                        enabled: true,
                        keyboardNavigation: {
                            enabled: true
                        }
                    }
                }
            },
            tooltip: {
                enabled: true,
                valueDecimals: 2
            },
            navigation: {
                buttonOptions: {
                    //    verticalAlign: 'bottom',
                    y: -10,
                    theme: {
                        'stroke-width': 0,
                        stroke: 'silver',
                        r: 0,
                        states: {
                            hover: {
                                fill: '#ddd'
                            },
                            select: {
                                stroke: '#039',
                                fill: '#ddd'
                            }
                        }
                    }
                },
                menuStyle: {
                    border: "1px solid #999999",
                    height: 1
                },
                menuItemStyle: {
                    padding: "0.2em 1em",
                }
            },
            exporting: {
                accessibility: {
                    enabled: true,
                },
                buttons: {
                    DeselectAllButton: {
                        text: 'None',
                        onclick: function () {
                            var series = this.series;
                            for (var i = 0; i < series.length; i++) {
                                series[i].hide();
                            }
                        }
                    },
                    SelectAllButton: {
                        text: 'All',
                        onclick: function () {
                            var series = this.series;
                            for (var i = 0; i < series.length; i++) {
                                series[i].show();
                            }
                        }
                    }
                },

            },
            xAxis: {
                accessibility: {
                    description: `Time(UTC) from ${this.startTime} to ${this.endTime}`
                },
                type: 'datetime',
                axisLabel: 'Time (UTC)',
                tickSize: 10,
                crosshair: true,
                tickFormat: function (d: any) { return moment(d).utc().format('MM/DD HH:mm'); },
                dateTimeLabelFormats: {
                    second: '%m-%d<br/>%H:%M:%S',
                    minute: '%m-%d<br/>%H:%M',
                    hour: '%m-%d<br/>%H:%M',
                    day: '%Y<br/>%m-%d',
                    week: '%Y<br/>%m-%d',
                    month: '%Y-%m',
                    year: '%Y'
                },
                events: {
                    afterSetExtremes: function (event) {
                        var xMin = event.min;
                        var xMax = event.max;

                        if (synchronizingZoom1) {
                            for (let i = 0; i < Highcharts.charts.length; i = i + 1) {
                                {
                                    var ex = Highcharts.charts[i].xAxis[0].getExtremes();
                                    if (ex.min != xMin || ex.max != xMax) Highcharts.charts[i].xAxis[0].setExtremes(xMin, xMax, true, false);
                                }
                            }
                        }
                    }
                }
            },
            yAxis: {
                axisLabel: '',
                title: {
                    text: ''
                },
                endOnTick: false,
                labels: {
                    format: '{value:.2f}'
                }
            },
            series: this.HighchartData  //as Array<Highcharts.Series>,
        } as Highcharts.Options;
    }

}

export interface GraphPoint {
    x: momentNs.Moment;
    y: number;
}

export interface GraphSeries {
    key: string;
    values: GraphPoint[];
}

export interface HighchartsData {
    x: momentNs.Moment;
    y: number;
    name: string;
    color: string;
}

export interface HighchartGraphSeries {
    name: string;
    type: string;
    data: any;
    events: Function;
    accessibility: any;
}
