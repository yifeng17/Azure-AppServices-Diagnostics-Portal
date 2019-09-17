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

// var Highcharts = require('highcharts'),
// HighchartsCustomEvents = require('highcharts-custom-events')(Highcharts);

const moment = momentNs;

declare let d3: any;

// Highcharts.setOptions({
//     title: {
//       style: {
//         color: 'tomato'
//       }
//     },
//     legend: {
//       enabled: false
//     }
//   });

@Component({
    selector: 'highcharts-graph',
    templateUrl: './highcharts-graph.component.html',
    styleUrls: ['./highcharts-graph.component.scss']
})
export class HighchartsGraphComponent implements OnInit {
    Highcharts: typeof Highcharts = Highcharts;
    options: any;

    // chartOptions: any;
    // chartType: TimeSeriesType;

    //   @Input() chartData: GraphSeries[];
    @Input() HighchartData: any = [];

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

    syncEvent(e) {
        var chart,
            point,
            i;
        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
            chart = Highcharts.charts[i];
            // Find coordinates within the chart
            event = chart.pointer.normalize(e);
            // Get the hovered point
            point = chart.series[0].searchPoint(event, true);

            if (point) {
                point.highlight(e);
            }
        }
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
            this._updateObject(this.options.chart, this.chartOptions);
        }

        if (this.startTime && this.endTime) {
            this.options.forceX = [this.startTime, this.endTime];
        }
    }

    private _updateObject(obj: Object, replacement: any): Object {
        Object.keys(replacement).forEach(key => {
            const subItem = obj[key];
            const replace = replacement[key];
            // Below returns true if subItem is an object
            if (subItem === Object(subItem)) {
                obj[key] = this._updateObject(subItem, replace);
            } else {
                obj[key] = replace;
            }
        });

        return obj;
    }


    private _setOptions() {
        let synchronizingZoom1 = this.detectorControlService.synchronizingZoom;
        this.options = {
            title: { text: '' },
            caption: {
                text: '<b>The caption renders in the bottom, and is part of the exported chart.</b><br><em>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</em>'
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
                    events: {
                        dblclick: function () {
                            console.log('dblclick - thanks to the Custom Events plugin');

                            var seriesIndex = this.index;
                            var series = this.chart.series;
                            for (var i = 0; i < series.length; i++) {
                                if (series[i].index != seriesIndex) {
                                    series[i].visible ?
                                        series[i].hide() :
                                        series[i].show();
                                }
                            }
                        }
                    }
                }
            },
            tooltip: {
                enabled: true
            },
        //     navigation: {
        //         menuStyle: {
        //             background: '#E0E0E0',
        //             height: '5px'
        //     }
        // },

    navigation: {
        buttonOptions: {
        //    verticalAlign: 'bottom',
            y: -10,
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
                        console.log("Highcharts.chart", Highcharts.charts);

                        if (synchronizingZoom1)
                        {
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
                // showMaxMin: false,
                // tickFormat: d3.format('.2f'),
                // axisLabelDistance: -10
            },
            series: this.HighchartData  //as Array<Highcharts.Series>,
        } as Highcharts.Options;

        //   this.chartOptions.series = this.HighchartData as Array<Highcharts.Series>;

        //   this.options = {
        //     chart: {
        //       type: 'lineChart',
        //       height: 200,
        //       margin: {
        //         top: 30,
        //         right: 40,
        //         bottom: 50,
        //         left: 50
        //       },
        //       // color: colors,
        //       useInteractiveGuideline: true,
        //       transitionDuration: 350,
        //       showLegend: true,
        //       stacked: true,
        //       clipEdge: false,
        //       showControls: false,
        //       x: function (d: any) { return moment(d.x).valueOf(); },
        //       y: function (d: any) { return d.y; },
        //       xAxis: {
        //         showMaxMin: false,
        //         axisLabel: 'Time (UTC)',
        //         tickSize: 10,
        //         staggerLabels: false,
        //         tickFormat: function (d: any) { return moment(d).utc().format('MM/DD HH:mm'); }
        //       },
        //       yAxis: {
        //         showMaxMin: false,
        //         tickFormat: d3.format('.2f'),
        //         axisLabel: '',
        //         axisLabelDistance: -10
        //       },
        //       forceY: [0, 1]
        //     }
        //   };
    }

    // Try out highcharts data
    updateDemo2: boolean = false;
    usedIndex: number = 0;
    chartTitle: string = 'My chart'; // for init - change through titleChange

    // change in all places
    titleChange(event: any) {
        var v = event;
        this.chartTitle = v;

        this.charts.forEach((el) => {
            el.hcOptions.title.text = v;
        });

        // trigger ngOnChanges
        this.updateDemo2 = true;
    };

    charts = [{
        hcOptions: {
            plotOptions: {
                series: {
                    pointStart: Date.now(),
                    pointInterval: 86400000 // 1 day
                }
            },
            series: [{
                type: 'line',
                data: [11, 2, 3],
                threshold: 5,
                negativeColor: 'red',
                events: {
                    dblclick: function () {
                        console.log('dblclick - thanks to the Custom Events plugin');
                    }
                }
            }, {
                type: 'candlestick',

                data: [
                    [0, 15, -6, 7],
                    [7, 12, -1, 3],
                    [3, 10, -3, 3]
                ]
            }]
        } as Highcharts.Options,
        hcCallback: (chart: Highcharts.Chart) => {
            console.log('some variables: ', Highcharts, chart, this.charts);
        }
    }];

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
}
