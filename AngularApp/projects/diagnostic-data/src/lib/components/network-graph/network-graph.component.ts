import { Component, OnInit } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { DiagnosticData } from '../../models/detector';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import * as HC_customEvents_ from 'highcharts-custom-events';
import AccessibilityModule from 'highcharts/modules/accessibility';
import  HighchartsNetworkgraph from "highcharts/modules/networkgraph";
import * as jQuery from 'jquery';
import * as joint from 'jointjs';

@Component({
  selector: 'network-graph',
  templateUrl: './network-graph.component.html',
  styleUrls: ['./network-graph.component.scss', '../../../../../../node_modules/jointjs/css/layout.css']
})
export class NetworkGraphComponent  extends DataRenderBaseComponent implements OnInit{


  constructor(protected telemetryService: TelemetryService) {
      super(telemetryService);
     // Highcharts.chart('container', this.charOptions);
   }

   protected processData(data: DiagnosticData) {
    super.processData(data);
    let graph = new joint.dia.Graph;

    let paper = new joint.dia.Paper({
      el: jQuery("#paper"),
      width: 600,
      height: 200,
      model: graph,
      gridSize: 1
    });

    let rect = new joint.shapes.basic.Rect({
      position: { x: 100, y: 30 },
      size: { width: 100, height: 30 },
      attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
    });

    let rect2 = rect.clone() as joint.shapes.basic.Rect;
    rect2.translate(300);

    var link = new joint.dia.Link({
      source: { id: rect.id },
      target: { id: rect2.id }
    });

    graph.addCells([rect, rect2, link]);
  }

}
