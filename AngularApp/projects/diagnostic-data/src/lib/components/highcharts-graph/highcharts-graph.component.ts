import * as momentNs from 'moment';
import { Component, Input, OnInit, HostListener, ElementRef, Output, EventEmitter, Pipe, PipeTransform } from '@angular/core';
import { TimeSeriesType } from '../../models/detector';
import HC_exporting from 'highcharts/modules/exporting';
import AccessibilityModule from 'highcharts/modules/accessibility';
import { DetectorControlService } from '../../services/detector-control.service';
import { xAxisPlotBand, xAxisPlotBandStyles, zoomBehaviors, XAxisSelection, MetricType } from '../../models/time-series';
import { KeyValue } from '@angular/common';
import { PointerEventObject } from 'highcharts';
import { interval, Subscription } from 'rxjs';
import { HighChartsHoverService } from '../../services/highcharts-hover.service';

declare var require: any
var Highcharts = require('highcharts'),
    HighchartsCustomEvents = require('highcharts-custom-events')(Highcharts);
HC_exporting(Highcharts);
AccessibilityModule(Highcharts);

const moment = momentNs;

@Component({
    selector: 'highcharts-graph',
    templateUrl: './highcharts-graph.component.html',
    styleUrls: ['./highcharts-graph.component.scss']
})
export class HighchartsGraphComponent implements OnInit {
    Highcharts: typeof Highcharts = Highcharts;
    options: any;

    MetricType = MetricType;

    @Input() HighchartData: any = [];

    @Input() chartDescription: string = "";

    @Input() chartType: TimeSeriesType;

    @Input() chartOptions: any;

    @Input() startTime: momentNs.Moment;

    @Input() endTime: momentNs.Moment;

    @Input() metricType: MetricType;
    private _xAxisPlotBands: xAxisPlotBand[] = null;
    @Input() public set xAxisPlotBands(value: xAxisPlotBand[]) {
        this._xAxisPlotBands = [];
        this._xAxisPlotBands = value;
        if (value != null && !this.loading) {
            this._updateOptions();
            this.rebindChartOptions();
        }
    }
    public get xAxisPlotBands() {
        return this._xAxisPlotBands;
    }

    public hoverData: { name: string, value: number, color: string, isSelect: boolean, defaultValue: number }[] = [];
    public static chartProperties: { [chartContainerId: string]: KeyValue<string, any>[] } = {};
    public static getChartProperty(propertyName: string, chartContainerId: string): any {
        if (chartContainerId != '') {
            let retVal = null;
            if (!!this.chartProperties[chartContainerId] && this.chartProperties[chartContainerId].length > 0) {
                this.chartProperties[chartContainerId].some(prop => {
                    if (prop.key == propertyName) {
                        retVal = prop.value;
                        return true;
                    }
                });
            }
            return retVal;
        }
        else {
            return null;
        }
    }
    public static addOrUpdateChartProperty(propertyName: string, propertyValue: any, chartContainerId: string): boolean {
        if (chartContainerId == '') {
            return false;
        }
        else {
            let existingValue = HighchartsGraphComponent.getChartProperty(propertyName, chartContainerId);
            if (!!existingValue) {
                HighchartsGraphComponent.chartProperties[chartContainerId].some(prop => {
                    if (prop.key == propertyName) {
                        prop.value = propertyValue;
                        return true;
                    }
                });
            }
            else {
                if (HighchartsGraphComponent.chartProperties[chartContainerId] == null) {
                    HighchartsGraphComponent.chartProperties[chartContainerId] = [];
                }
                HighchartsGraphComponent.chartProperties[chartContainerId].push({
                    key: propertyName,
                    value: propertyValue
                } as KeyValue<string, any>);
            }
            return true;
        }
    }

    private _updateChartCursorTimer: Subscription;
    private _updateChartCursor(currChart: Highcharts.Chart, cursorValue: string): void {
        if (!!currChart) {
            if (this.getCurrentChartContainerId()) {
                let currChartContainer = <HTMLElement>document.getElementById(this.getCurrentChartContainerId());
                if (currChartContainer.getElementsByClassName('highcharts-plot-border') && currChartContainer.getElementsByClassName('highcharts-plot-border').length > 0) {
                    let plotBorderElement = (<HTMLElement>(currChartContainer.getElementsByClassName('highcharts-plot-border')[0]));
                    if (!!plotBorderElement && (!this._updateChartCursorTimer || (!!this._updateChartCursorTimer && this._updateChartCursorTimer.closed))) {
                        this._updateChartCursorTimer = interval(50).subscribe(() => {
                            if (plotBorderElement.getAttribute('cursor') != cursorValue && plotBorderElement.getAttribute('fill') != 'white') {
                                plotBorderElement.setAttribute('fill', 'white');
                                plotBorderElement.setAttribute('opacity', '0.1');
                                plotBorderElement.setAttribute('cursor', cursorValue);
                            }
                            else {
                                this._updateChartCursorTimer.unsubscribe();
                            }
                        });
                    }
                }
            }
        }
    }

    private _zoomBehavior: zoomBehaviors = zoomBehaviors.Zoom;
    private _handleZoomBehaviorUpdate(value: zoomBehaviors) {
        if (value & zoomBehaviors.GeryOutGraph) {
            let currChart = this.getCurrentChart();
            if (!!currChart) {
                let currPlotBands = [];
                if (currChart.options.xAxis instanceof Array && currChart.options.xAxis.length > 0) {
                    currPlotBands = currChart.options.xAxis[0].plotBands;
                }
                let alreadyGreyedOut = currPlotBands.length > 1 && currPlotBands.some(plotBand => plotBand.color === '#e5e5e5');
                if (!alreadyGreyedOut) {
                    currPlotBands.push({
                        color: '#e5e5e5',
                        from: currChart.xAxis[0].min,
                        to: currChart.xAxis[0].max,
                        zIndex: -1, //This will place the grey plotband behind any exisitng plotbands
                        borderWidth: 0,
                        borderColor: 'darkgrey',
                        id: ''
                    });
                    let newChartOptions = {
                        xAxis: {
                            plotBands: currPlotBands
                        }
                    };
                    let currOptions = this.options;
                    this._updateObject(currOptions, newChartOptions);
                    currChart.update(currOptions);
                    this._updateChartCursor(currChart, 'not-allowed');
                }
            }
        }

        if (value & zoomBehaviors.UnGreyGraph) {
            let currChart = this.getCurrentChart();
            if (!!currChart) {
                let currPlotBands = [];
                if (currChart.options.xAxis instanceof Array && currChart.options.xAxis.length > 0) {
                    currPlotBands = currChart.options.xAxis[0].plotBands;
                }
                let alreadyGreyedOut = currPlotBands.length > 1 && currPlotBands.some(plotBand => plotBand.color === '#e5e5e5');
                if (alreadyGreyedOut) {
                    currPlotBands.forEach(plotBand => {
                        if (plotBand.color === '#e5e5e5') {
                            currPlotBands.splice(currPlotBands.indexOf(plotBand), 1);
                        }
                    });
                    let newChartOptions = {
                        xAxis: {
                            plotBands: currPlotBands
                        }
                    };
                    let currOptions = this.options;
                    this._updateObject(currOptions, newChartOptions);
                    currChart.update(currOptions);
                    this._updateChartCursor(currChart, 'inherit');
                }
            }
        }
    }

    private _zoomBehaviorUpdateTimer: Subscription;

    @Input() public set zoomBehavior(value: zoomBehaviors) {
        this._zoomBehavior = value;

        if ((!this._zoomBehaviorUpdateTimer) || (!!this._zoomBehaviorUpdateTimer && this._zoomBehaviorUpdateTimer.closed)) {
            this._zoomBehaviorUpdateTimer = interval(100).subscribe(() => {
                if (HighchartsGraphComponent.addOrUpdateChartProperty('zoomBehavior', this._zoomBehavior, this.getCurrentChartContainerId())) {
                    this._handleZoomBehaviorUpdate(this._zoomBehavior);
                    this._zoomBehaviorUpdateTimer.unsubscribe();
                }
            });
        }
    }
    public get zoomBehavior() {
        return this._zoomBehavior;
    }

    @Output() XAxisSelection: EventEmitter<XAxisSelection> = new EventEmitter<XAxisSelection>();

    private getCurrentChartContainerId(): string {
        if (this.el.nativeElement.getElementsByClassName('highcharts-container') && this.el.nativeElement.getElementsByClassName('highcharts-container').length > 0) {
            return this.el.nativeElement.getElementsByClassName('highcharts-container')[0].id;
        }
        else {
            return '';
        }
    }

    private getCurrentChart(): Highcharts.Chart {
        let currentId = this.getCurrentChartContainerId();
        if (currentId == '') {
            return null;
        }
        for (let i = 0; i < Highcharts.charts.length; i++) {
            let chart = Highcharts.charts[i];
            if (chart) {
                if (currentId === chart.container.id) {
                    return chart;
                }
            }
        }
        return null;
    }

    highchartCallback(): Highcharts.ChartLoadCallbackFunction {
        let _this = this;
        return function (e) {
            var chart: any = this;
            chart.customNamespace = {};
            chart.customNamespace["toggleSelectionButton"] = chart.renderer.button(
                "None", null, -10, function () {
                    // console.log("chart width", `${chart.plotWidth - 20}`);
                    var series = chart.series;
                    var statusToSet = this.text && this.text.textStr && this.text.textStr === "All" ? true : false;
                    for (var i = 0; i < series.length; i++) {
                        series[i].setVisible(statusToSet, false);
                    }
                    _this.hoverData.forEach(d => d.isSelect = statusToSet);
                    statusToSet = !statusToSet;
                    var textStr = statusToSet ? "All" : "None";
                    var ariaLabel = statusToSet ? "Select all the series" : "Deselect all the series";
                    this.attr({
                        role: 'button',
                        text: textStr,
                        "aria-label": ariaLabel,
                    });
                }, {
                fill: 'none',
                stroke: 'none',
                'stroke-width': 0,
                style: {
                    color: '#015cda'
                }
            }, {
                fill: 'grey',
                stroke: 'none',
                'stroke-width': 0,
                style: {
                    color: '#015cda'
                }
            }, null, null, null, true).add();

            var namespace = chart.customNamespace || {};
            if (namespace["toggleSelectionButton"]) {
                namespace["toggleSelectionButton"].attr({
                    role: 'button',
                    tabindex: -1,
                    x: chart.container.offsetWidth - 20,
                    // r: 0,
                    "aria-label": "Deselect all the series",
                });
            }
            var ToggleSelectionButton = function toggleSelectionButton(chart) {
                this.initBase(chart);
            };

            ToggleSelectionButton.prototype = new Highcharts.AccessibilityComponent();
            Highcharts.extend(ToggleSelectionButton.prototype, {
                // Define keyboard navigation for this component
                getKeyboardNavigation: function () {
                    var keys = this.keyCodes,
                        chart = this.chart,
                        namespace = chart.customNamespace || {},
                        component = this;

                    return new Highcharts.KeyboardNavigationHandler(chart, {
                        keyCodeMap: [
                            // On arrow/tab we just move to the next chart element.
                            [[
                                keys.tab, keys.up, keys.down, keys.left, keys.right
                            ], function (keyCode, e) {
                                return this.response[
                                    keyCode === this.tab && e.shiftKey ||
                                        keyCode === keys.left || keyCode === keys.up ?
                                        'prev' : 'next'
                                ];
                            }],

                            // Space/enter means we click the button
                            [[
                                keys.space, keys.enter
                            ], function () {
                                // Fake a click event on the button element
                                var buttonElement = namespace["toggleSelectionButton"] &&
                                    namespace["toggleSelectionButton"].element;
                                if (buttonElement) {
                                    component.fakeClickEvent(buttonElement);
                                }
                                return this.response.success;
                            }]
                        ],

                        // Focus button initially
                        init: function () {
                            var buttonElement = namespace["toggleSelectionButton"] &&
                                namespace["toggleSelectionButton"].element;
                            if (buttonElement && buttonElement.focus) {
                                buttonElement.focus();
                            }
                        }
                    });
                }
            });

            chart.update({
                accessibility: {
                    customComponents: {
                        toggleSelectionButton: new ToggleSelectionButton(chart),
                    },
                    keyboardNavigation: {
                        order: ["legend", "series", "zoom", "rangeSelector", "toggleSelectionButton"],
                    }
                }
            });
        };
    }

    private customChartSelectionCallbackFunction: Highcharts.ChartSelectionCallbackFunction = (event: Highcharts.ChartSelectionContextObject) => {
        if (this._zoomBehavior & zoomBehaviors.FireXAxisSelectionEvent) {
            if (!!event.xAxis) {
                let fromSelection = moment.utc(Highcharts.dateFormat('%Y-%m-%d %H:%M:00', event.xAxis[0].min));
                let toSelection = moment.utc(Highcharts.dateFormat('%Y-%m-%d %H:%M:00', event.xAxis[0].max));

                let fromPoint = null;
                let toPoint = null;
                let currChart = this.getCurrentChart();
                if (!!currChart && !!currChart.series && currChart.series.length > 0) {
                    let firstNonEmptySeries: number = -1;
                    for (let index = 0; index < currChart.series.length; index++) {
                        if (currChart.series[index].visible && currChart.series[index].xAxis.hasData()) {
                            firstNonEmptySeries = index;
                            break;
                        }
                    }
                    if (firstNonEmptySeries > -1) {
                        currChart.series[firstNonEmptySeries].points.forEach(pt => {
                            if (moment.duration(moment.utc(Highcharts.dateFormat('%Y-%m-%d %H:%M:00', pt.x)).diff(fromSelection)).asMinutes() < 4) {
                                fromPoint = moment.utc(Highcharts.dateFormat('%Y-%m-%d %H:%M:00', pt.x));
                            }
                            if (toPoint == null && moment.duration(moment.utc(Highcharts.dateFormat('%Y-%m-%d %H:%M:00', pt.x)).diff(toSelection)).asMinutes() > -4) {
                                toPoint = moment.utc(Highcharts.dateFormat('%Y-%m-%d %H:%M:00', pt.x));
                            }
                        });
                    }

                    if (!!fromPoint && !!toPoint) {
                        let xAxisSelectionEventArgs = new XAxisSelection();
                        xAxisSelectionEventArgs.chart = currChart;
                        xAxisSelectionEventArgs._rawEventArgs = event;
                        xAxisSelectionEventArgs.fromTime = fromPoint;
                        xAxisSelectionEventArgs.toTime = toPoint;
                        this.XAxisSelection.emit(xAxisSelectionEventArgs);
                    }
                }
            }
        }
        if (this.zoomBehavior & zoomBehaviors.CancelZoom) {
            return false;
        }
        else {
            return true;
        }
    };

    private customSetExtremesCallbackFunction: Highcharts.AxisSetExtremesEventCallbackFunction = (evt: Highcharts.AxisSetExtremesEventObject) => {
        if (evt.trigger !== 'sync') { // Prevent feedback loop
            let currChart = this.getCurrentChart();
            if (!currChart) {
                return;
            }
            for (let i = 0; i < Highcharts.charts.length; i++) {
                let chart = Highcharts.charts[i];
                if (chart && currChart !== chart) {
                    let targetZoomBehavior: zoomBehaviors = HighchartsGraphComponent.getChartProperty('zoomBehavior', chart.container.id) as zoomBehaviors;
                    if (targetZoomBehavior == null || !(targetZoomBehavior & zoomBehaviors.CancelZoom)) {
                        if (chart.xAxis[0].setExtremes) { // It is null while updating
                            chart.xAxis[0].setExtremes(evt.min, evt.max, true, true, { trigger: 'sync' });
                        }
                    }
                }
            }
        }
    };

    private rebindChartOptions(): void {
        let currChart = this.getCurrentChart();
        if (!!currChart) {
            currChart.update(this.options);
        }
    }

    loading: boolean = true;

    @HostListener('click', ['$event'])
    onClick(ev: MouseEvent) {
        if (this.zoomBehavior & zoomBehaviors.ShowXAxisSelectionDisabledMessage) {
            let currChart = this.getCurrentChart();
            if (!!currChart) {
                let waitMSG = 'Please wait for current analysis to complete.';
                let normalizedEvent: PointerEventObject = currChart.pointer.normalize(ev);
                let msg = currChart.renderer.label(waitMSG,
                    (currChart.plotWidth / 2) - (waitMSG.length * 2),
                    (currChart.plotHeight / 2),
                    'rect', null, null, false, null, null
                ).attr({
                    zIndex: 100
                })
                    .css({
                        color: 'black',
                    })
                    .add()
                    .toFront()
                    .hide();
                msg.show();
                msg.fadeOut(5000);
                setTimeout(() => {
                    msg.destroy(); //To avoid DOM leaks
                }, 5300);
            }
        }
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(ev: MouseEvent) {
        this.syncCharts();
    }

    @HostListener('keydown', ['$event'])
    onKeydownHandler(ev: KeyboardEvent) {
        var key = ev.key;

        if (key === 'ArrowLeft' || key === 'ArrowRight') {
            let currentId = this.el.nativeElement.getElementsByClassName('highcharts-container')[0].id;

            for (let i = 0; i < Highcharts.charts.length; i++) {
                let chart = Highcharts.charts[i];

                if (chart) {
                    let xi = chart.xAxis[0];
                    xi.removePlotLine("myPlotLine");
                    if (currentId === chart.container.id && !xi.crosshair) {
                        xi.crosshair = true;
                    }
                }
            }
        }
    }

    constructor(private el: ElementRef<HTMLElement>, private highChartsHoverService: HighChartsHoverService) {
    }

    ngOnInit() {
        this._setOptions();
        this._updateOptions();

        setTimeout(() => {
            this.loading = false;
        }, 100);



        setTimeout(() => {
            let currentCharts = this.el.nativeElement.getElementsByClassName('highcharts-container');
            const currentChartId = currentCharts[0].id;
            this.highChartsHoverService.hoverXAxisValue.subscribe(data => {
                this.updateMetric(data);
            });



            const chart = <Highcharts.Chart>Highcharts.charts.find(c => c && c.container.id === currentChartId);
            if (!chart) return;

            chart.series.forEach(series => {
                const data: number[] = series.data.map(point => point.options.y);
                const defaultValue = this.getMetricsDefaultValue(data);
                this.hoverData.push({
                    name: series.name,
                    //Workaround,no color property in highchart ts definition
                    color: (<any>series).color,
                    value: defaultValue,
                    defaultValue: defaultValue,
                    isSelect: true
                });
            });

        }, 300);
    }

    private syncCharts() {
        let xAxisValue: number;
        let currentCharts = this.el.nativeElement.getElementsByClassName('highcharts-container');
        if (!currentCharts || !currentCharts[0]) {
            return;
        }
        let currentId = currentCharts[0].id;
        for (let i = 0; i < Highcharts.charts.length; i++) {
            let chart = <Highcharts.Chart>Highcharts.charts[i];
            if (chart) {
                if (currentId === chart.container.id) {
                    if (chart.hoverPoint && chart.hoverPoint.category) {
                        xAxisValue = Number.parseFloat(chart.hoverPoint.category);
                    }
                    chart.xAxis[0].crosshair = false;
                    this.highChartsHoverService.hoverXAxisValue.next(xAxisValue);

                    let yAxisValue: number = null;
                    if (chart.hoverPoint && chart.hoverPoint.options) {
                        yAxisValue = chart.hoverPoint.options.y;
                    }
                    if (xAxisValue != undefined && xAxisValue != null && yAxisValue !== null) {
                        this.hoverData.forEach(h => h.isSelect = false);
                        //Find all series with same xAxisValue, its yAxisValue is close(<5% diff), then set metric to select
                        chart.series.forEach((s, index) => {
                            const points = s.data;
                            const point = points.find(p => p.options.x === xAxisValue);
                            // if(point && ((point.y - yAxisValue)/yAxisValue < 0.01 || (point.y === 0 && yAxisValue === 0))){
                            //     this.hoverData[index].isSelect = true;
                            // }else {
                            //     this.hoverData[index].isSelect = false;
                            // }
                            this.hoverData[index].isSelect = point && point.y === yAxisValue;
                        });
                    }
                    break;
                }
            }
        }

        for (let i = 0; i < Highcharts.charts.length; i++) {
            let chart = Highcharts.charts[i];
            if (chart) {
                let xi = chart.xAxis[0];
                xi.removePlotLine("myPlotLine");
                xi.addPlotLine({
                    value: xAxisValue,
                    width: 1,
                    color: 'grey',
                    id: 'myPlotLine',
                    zIndex: 10
                });
            }
        }
    }

    private renderTooltipCallback: Highcharts.TooltipFormatterCallbackFunction = function (tooltip) {
        const formattedDate = moment.utc(this.x).format("MM-DD,HH:mm");
        return formattedDate;
    }


    private updateMetric(xAxisValue: number) {
        if (this.metricType === MetricType.None) return;
        //Mouse hover to outside of graph
        if (xAxisValue === undefined || xAxisValue === null) {
            this.hoverData.forEach(data => {
                data.value = data.defaultValue;
            });
            return;
        }
        const chart: any = this.getCurrentChart();
        if (!chart) return;
        const xAxisIndex = chart.series[0].xData.findIndex(item => item === xAxisValue);
        if (xAxisIndex < 0) return;
        this.hoverData.forEach((data, legendIndex) => {
            const value = chart.series[legendIndex].data[xAxisIndex].y
            data.value = value;
        });
    }

    private _updateOptions() {

        let type: string = 'line';
        let stacking = undefined;

        if (this.chartType) {
            // stacking:
            // Undefined to disable
            // "Normal" to stack by value
            // "Stack" by "percent".
            switch (this.chartType as TimeSeriesType) {
                case TimeSeriesType.StackedAreaGraph:
                    // type = 'area';
                    // stacking = 'normal';
                    break;
                case TimeSeriesType.StackedBarGraph:
                    type = 'column';
                    stacking = 'normal';
                    break;
                case TimeSeriesType.BarGraph:
                    type = 'column';
                    break;
                case TimeSeriesType.LineGraph:
                default:
                    type = 'line';
                    break;
            }
        }


        if (this.chartOptions && this.chartOptions["type"]) {
            type = this.chartOptions["type"];
        }

        if (this.chartOptions && this.chartOptions["stacking"]) {
            stacking = this.chartOptions["stacking"];
        }

        this.options.chart.type = type;
        this.options.plotOptions.series.stacking = stacking;

        if (!!this.xAxisPlotBands && this.xAxisPlotBands.length > 0) {
            let chartPlotBands = [];
            this.xAxisPlotBands.forEach(plotBand => {
                var currPlotBand = {
                    color: plotBand.color == '' ? '#e5f9fe' : plotBand.color,
                    from: plotBand.from.utc(true),
                    to: plotBand.to.utc(true),
                    zIndex: !!plotBand.style ? plotBand.style : xAxisPlotBandStyles.BehindPlotLines,
                    borderWidth: (!!plotBand.borderWidth && plotBand.borderWidth > 0) ? plotBand.borderWidth : 0,
                    borderColor: (!!plotBand.borderColor) ? plotBand.borderColor : 'white',
                    id: (!!plotBand.id) ? plotBand.id : ''
                };
                chartPlotBands.push(currPlotBand);

            });
            this.options.xAxis.plotBands = chartPlotBands;
        }

        if (this.chartOptions) {
            this._updateObject(this.options, this.chartOptions);
        }

        if (this.startTime && this.endTime) {
            this.options.forceX = [this.startTime, this.endTime];
        }

        if (this.metricType !== MetricType.None) {
            this.options.tooltip.formatter = this.renderTooltipCallback
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
                // Special handling for the key to override colors. In highchart library, the key should be "colors" instead of "colors"
                if (key === "color" || key === "colors") {
                    key = "colors";
                }
                obj[key] = replace;
            }
        });

        return obj;
    }

    private _setOptions() {
        this.options = {
            title: {
                text: ""
            },
            credits: {
                enabled: false
            },
            colors: ["#0078D4", "#EF6950", "#00188F", "#00A2AD", "#4B003F", "#E3008C", "#022F22"],
            accessibility: {
                enabled: true,
                describeSingleSeries: true,
                description: `${this.chartDescription}`,
                keyboardNavigation: {
                    enabled: true,
                    mode: "normal",
                    order: ["legend", "series", "zoom", "rangeSelector"],
                    focusBorder: {
                        style: {
                            lineWidth: 3,
                            color: '#aa1111',
                            borderRadius: 5
                        },
                        margin: 4
                    },
                    wrapAround: true,
                    skipNullPoints: true
                },
            },
            chart: {
                reflow: true,
                height: 300,
                display: 'block!important',
                type: 'line',
                zoomType: 'x',
                panKey: 'shift',
                panning: true,
                resetZoomButton: {
                    position: {
                        x: -80,
                        y: -19
                    },
                    relativeTo: "spacingBox",
                    theme: {
                        fill: 'none',
                        stroke: 'none',
                        'stroke-width': 0,
                        style: {
                            color: '#015cda'
                        },
                        state: {
                            hover: {
                                fill: 'white',
                                color: 'blue'
                            }
                        }
                    }
                },
                events: {
                    selection: this.customChartSelectionCallbackFunction,
                    load: this.highchartCallback(),
                    render: function () {
                        var chart: any = this;
                        chart.customNamespace["toggleSelectionButton"].attr({
                            x: this.plotWidth - 20,
                            // x:0
                        });
                    },
                },
            },
            legend: {
                enabled: this.metricType === MetricType.None,
                align: 'center',
                layout: 'horizontal',
                verticalAlign: 'bottom',
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
                shared: true,
                enabled: true,
                valueDecimals: 2,
                useHTML: true,
                outside: true,
                backgroundColor: "white",
            },
            navigation: {
                buttonOptions: {
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
                    padding: "0.1em 1em",
                }
            },
            exporting: {
                accessibility: {
                    enabled: true,
                },
                buttons: {
                    contextButton: {
                        enabled: false,
                    },
                },

            },
            xAxis: {
                accessibility: {
                    description: `Time(UTC) from ${this.startTime} to ${this.endTime}`
                },
                type: 'datetime',
                title: {
                    text: 'Time (UTC)',
                },
                tickSize: 10,
                crosshair: false,
                tickFormat: function (d: any) { return moment(d).utc().format('MM/DD HH:mm'); },
                dateTimeLabelFormats: {
                    second: '%m-%d %H:%M:%S',
                    minute: '%m-%d %H:%M',
                    hour: '%m-%d %H:%M',
                    day: '%Y-%m-%d',
                    week: '%Y-%m-%d',
                    month: '%Y-%m',
                    year: '%Y'
                },
                labels: {
                    style: {
                        whiteSpace: 'nowrap'
                    }
                },
                plotBands: [],
                events: {
                    setExtremes: this.customSetExtremesCallbackFunction
                }
            },
            yAxis: {
                tickAmount: 3,
                softMin: 0,
                crosshair: true,
                gridLineColor: "#929294",
                gridLineWidth: 0,
                minorGridLineWidth: 0,
                accessibility: {
                    description: `Y axis values`
                },
                title: {
                    text: '',
                    style: {
                        whiteSpace: 'nowrap'
                    }
                },
                endOnTick: false,
                labels: {
                    format: '{value:.2f}',
                    style: {
                        whiteSpace: 'nowrap'
                    }
                },
            },
            series: this.HighchartData
        } as Highcharts.Options
    }

    selectMetric(index: number) {
        const chart = this.getCurrentChart();
        chart.series.forEach((s, i) => {
            s.setVisible(i === index, false);
        });

        this.hoverData.forEach((d, i) => {
            d.isSelect = i === index;
        });
    }

    leaveMetric() {
        const chart = this.getCurrentChart();
        chart.series.forEach(s => s.setVisible(true, false));
        this.hoverData.forEach(h => h.isSelect = true);
    }

    private getMetricsDefaultValue(data: number[]): number {
        switch (this.metricType) {
            case MetricType.Avg:
                const sum = data.reduce((a, b) => a + b, 0);
                return sum / data.length;
            case MetricType.Min:
                return Math.min(...data);
            case MetricType.Max:
                return Math.max(...data);
            case MetricType.Sum:
                return data.reduce((a, b) => a + b, 0);

            case MetricType.None:
            default:
                return null;
        }
    }
}

@Pipe({ name: "chartMetricPipe" })
export class ChartMetricPipe implements PipeTransform {
    transform(num: number): string {
        const decimalLength = 2;
        const n = Math.floor(num * Math.pow(10, decimalLength)) / Math.pow(10, decimalLength);
        return `${n.toFixed(2)}`;
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
