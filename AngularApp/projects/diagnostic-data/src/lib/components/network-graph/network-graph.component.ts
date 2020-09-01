import { Component, OnInit } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { DiagnosticData } from '../../models/detector';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import * as HC_customEvents_ from 'highcharts-custom-events';
import AccessibilityModule from 'highcharts/modules/accessibility';

// const HC_customEvents = HC_customEvents_;
// HC_exporting(Highcharts);
// AccessibilityModule(Highcharts);
// HC_customEvents(Highcharts);

@Component({
  selector: 'network-graph',
  templateUrl: './network-graph.component.html',
  styleUrls: ['./network-graph.component.scss']
})
export class NetworkGraphComponent  extends DataRenderBaseComponent implements OnInit{
    // title = "app";
    // chart;
    // updateFromInput = false;
    // Highcharts: typeof Highcharts = Highcharts;;
    // chartConstructor = "chart";
    // chartCallback;
    // chartOptions = {
    //     chart: {
    //       type: "networkgraph",
    //       height: "100%"
    //     },
    //     title: {
    //       text: "The Indo-European Laungauge Tree"
    //     },
    //     subtitle: {
    //       text: "A Force-Directed Network Graph in Highcharts"
    //     },
    //     plotOptions: {
    //       networkgraph: {
    //         keys: ["from", "to"],
    //         layoutAlgorithm: {
    //           enableSimulation: true
    //         }
    //       }
    //     },
    //     series: [
    //       {
    //         dataLabels: {
    //           enabled: true
    //         },
    //         data: [
    //           ["Proto Indo-European", "Balto-Slavic"],
    //           ["Proto Indo-European", "Germanic"],
    //           ["Proto Indo-European", "Celtic"],
    //           ["Proto Indo-European", "Italic"],
    //           ["Proto Indo-European", "Hellenic"],
    //           ["Proto Indo-European", "Anatolian"],
    //           ["Proto Indo-European", "Indo-Iranian"],
    //           ["Proto Indo-European", "Tocharian"],
    //           ["Indo-Iranian", "Dardic"],
    //           ["Indo-Iranian", "Indic"],
    //           ["Indo-Iranian", "Iranian"],
    //           ["Iranian", "Old Persian"]
    //         ]
    //       }
    //     ]
    //   };


  constructor(protected telemetryService: TelemetryService) {
      super(telemetryService);
   }

   protected processData(data: DiagnosticData) {
    super.processData(data);
  }

  ngOnInit() {
   // this.barChartPopulation();
    // this.pieChartBrowser();
    this.drawNetworkGraph();
  }
  barChartPopulation() {
    Highcharts.chart('barChart', {
      chart: {
        type: 'bar'
      },
      title: {
        text: 'Historic World Population by Region'
      },
      xAxis: {
        categories: ['Africa', 'America', 'Asia', 'Europe', 'Oceania'],
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Population (millions)',
          align: 'high'
        },
      },
      tooltip: {
        valueSuffix: ' millions'
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      series: [{
        type: undefined,
        name: 'Year 1800',
        data: [107, 31, 635, 203, 2]
      }, {
        type: undefined,
        name: 'Year 1900',
        data: [133, 156, 947, 408, 6]
      }, {
        type: undefined,
        name: 'Year 2000',
        data: [814, 841, 3714, 727, 31]
      }, {
        type: undefined,
        name: 'Year 2016',
        data: [1216, 1001, 4436, 738, 40]
      }]
    });
  }

  pieChartBrowser() {
    Highcharts.chart('pieChart', {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: 'Browser market shares in October, 2019'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          }
        }
      },
      series: [{
        name: 'Brands',
        colorByPoint: true,
        type: undefined,
        data: [{
          name: 'Chrome',
          y: 61.41,
          sliced: true,
          selected: true
        }, {
          name: 'Internet Explorer',
          y: 11.84
        }, {
          name: 'Firefox',
          y: 10.85
        }, {
          name: 'Edge',
          y: 4.67
        }, {
          name: 'Safari',
          y: 4.18
        }, {
          name: 'Sogou Explorer',
          y: 1.64
        }, {
          name: 'Opera',
          y: 1.6
        }, {
          name: 'QQ',
          y: 1.2
        }, {
          name: 'Other',
          y: 2.61
        }]
      }]
    });
  }

   drawNetworkGraph() {
    Highcharts.chart('appservicearch',{
        chart: {
        marginTop: 80,
          type: 'networkGraph'
        },
        title: {
          text: 'App Service Request Flow'
        },
        plotOptions: {
            networkgraph: {
                keys: ['from', 'to'],
                layoutAlgorithm: {
                    integration: 'verlet',
                    linkLength: 100
                }
            }
        },
        series: [{
            type: 'networkgraph',
            dataLabels: {
                enabled: true,
            },
          data: [
              ['Client Browser', 'FrontEnd'],
              ['FrontEnd', 'WebWorker']
          ]
        }]
      });
   }
}
