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
import './sequance-diagram'


  

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
    let dia = joint.dia;
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

    graph.addCells([rect, rect2, link]);//*/
    //this.sd();
    this.sequence();
  }

  private sd(){
    var standard = joint.shapes.standard;
    var dia = joint.dia;

    standard.Rectangle.define('sd.RoleGroup', {
        z: 1,
        attrs: {
            body: {
                stroke: '#DDDDDD',
                strokeWidth: 1,
                fill: '#F9FBFA'
            }
        }
    }, {
        fitRoles: function() {
            this.fitEmbeds({ padding: 10 });
        }
    });

    standard.Rectangle.define('sd.Role', {
        z: 2,
        size: { width: 100, height: 80 },
        attrs: {
            body: {
                stroke: '#A0A0A0',
                strokeWidth: 1,
                rx: 2,
                ry: 2
            },
            label: {
                fontSize: 18,
                fontFamily: 'sans-serif',
                textWrap: {
                    width: -10
                }
            }
        }
    }, {
        setName: function(name) {
            this.attr(['label', 'text'], name);
        }
    });

    standard.Link.define('sd.Lifeline', {
        z: 3,
        attrs: {
            line: {
                stroke: '#A0A0A0',
                strokeWidth: 1,
                strokeDasharray: '5,2',
                targetMarker: null
            }
        }
    }, {
        attachToRole: function(role, maxY) {
            const roleCenter = role.getBBox().center();
            this.set({
                source: { id: role.id },
                target: { x: roleCenter.x, y: maxY }
            });
            role.embed(this);
        }
    });

    dia.Link.define('sd.LifeSpan', {
        z: 4,
        attrs: {
            line: {
                connection: true,
                stroke: '#222222',
                strokeWidth: 2
            },
            icon: {
                atConnectionRatioIgnoreGradient: 0.5
            }
        }
    }, {
        markup: [{
            tagName: 'path',
            selector: 'line',
            attributes: {
                'fill': 'none',
                'pointer-events': 'none'
            }
        }, {
            tagName: 'g',
            selector: 'icon',
            children: [{
                tagName: 'circle',
                attributes: {
                    'r': 12,
                    'fill': '#222222'
                }
            }, {
                tagName: 'path',
                attributes: {
                    'd': 'M -3 -5 3 -5 3 -2 -3  2 -3 5 3 5 3 2 -3 -2 Z',
                    'stroke': '#FFFFFF',
                    'stroke-width': 1,
                    'fill': 'none'
                }
            }]
        }],
        attachToMessages: function(from, to) {
            this.source(from, { anchor: { name: 'connectionRatio', args: { ratio: 1 }}});
            this.target(to, { anchor: { name: 'connectionRatio', args: { ratio: 0 }}});
        }
    });

    standard.Link.define('sd.Message', {
        z: 5,
        source: { anchor: { name: 'connectionLength' }},
        target: { anchor: { name: 'connectionPerpendicular' }},
        attrs: {
            line: {
                stroke: '#4666E5',
                sourceMarker: {
                    'type': 'path',
                    'd': 'M -3 -3 -3 3 3 3 3 -3 z',
                    'stroke-width': 3
                }
            },
            wrapper: {
                strokeWidth: 20,
                cursor: 'grab'
            },
        }
    }, {
        defaultLabel: {
            markup: [{
                tagName: 'rect',
                selector: 'labelBody'
            }, {
                tagName: 'text',
                selector: 'labelText'
            }],
            attrs: {
                labelBody: {
                    ref: 'labelText',
                    refWidth: '100%',
                    refHeight: '100%',
                    refWidth2: 20,
                    refHeight2: 10,
                    refX: -10,
                    refY: -5,
                    rx: 2,
                    ry: 2,
                    fill: '#4666E5'
                },
                labelText: {
                    fill: '#FFFFFF',
                    fontSize: 12,
                    fontFamily: 'sans-serif',
                    textAnchor: 'middle',
                    textVerticalAnchor: 'middle',
                    cursor: 'grab'
                }
            }
        },
        setStart: function(y) {
            this.prop(['source', 'anchor', 'args', 'length'], y);
        },
        setFromTo: function(from, to) {
            this.prop({
                source: { id: from.id },
                target: { id: to.id }
            });
        },
        setDescription: function(description) {
            this.labels([{ attrs: { labelText: { text: description }}}]);
        }
    });
  }

  private sequence(){
    let dia = joint.dia;
    let sd = joint.shapes.sd;
    let paperElement = jQuery("#paper");
    var paperWidth = 800;
    var paperHeight = 600;

    var graph = new dia.Graph();
    var paper = new dia.Paper({
        el: paperElement,
        width: paperWidth,
        height: paperHeight,
        model: graph,
        frozen: true,
        async: true,
        sorting: dia.Paper.sorting.APPROX,
        defaultConnectionPoint: { name: 'rectangle' },
        background: { color:  '#F3F7F6' },
        moveThreshold: 5,
        restrictTranslate: function(elementView) {
            var element = elementView.model;
            var padding = (element.isEmbedded()) ? 20 : 10;
            return {
                x: padding,
                y: element.getBBox().y,
                width: paperWidth - 2 * padding,
                height: 0
            };
        },
        interactive: function(cellView) {
            var cell = cellView.model;
            return (cell.isLink())
                ? { linkMove: false, labelMove: false }
                : true;
        }
    });

    paper.el.style.border = '1px solid #E5E5E5';

    paper.on('link:pointermove', function(linkView, _evt, _x, y) {
        var link = linkView.model;
        if (link instanceof sd.Message) {
            var sView = linkView.sourceView;
            var tView = linkView.targetView;
            var padding = 20;
            var minY = Math.max(tView.sourcePoint.y - sView.sourcePoint.y, 0) + padding;
            var maxY = sView.targetPoint.y - sView.sourcePoint.y - padding;
            link.setStart(Math.min(Math.max(y - sView.sourcePoint.y, minY), maxY));
        }
    });

    var role1 = new sd.Role({ position: { x: 100, y: 20 }});
    role1.setName('Browser');
    role1.addTo(graph);

    var role2 = new sd.Role({ position: { x: 400, y: 20 }});
    role2.setName('Web Server');
    role2.addTo(graph);

    var role3 = new sd.Role({ position: { x: 600, y: 20 }});
    role3.setName('Database Server');
    role3.addTo(graph);

    var backend = new sd.RoleGroup();
    backend.embed(role2);
    backend.embed(role3);
    backend.addTo(graph);
    backend.fitRoles();
    backend.listenTo(graph, 'change:position', function(cell) {
        if (cell.isEmbeddedIn(this)) this.fitRoles();
    });

    var lifeline1 = new sd.Lifeline();
    lifeline1.attachToRole(role1, paperHeight);
    lifeline1.addTo(graph);

    var lifeline2 = new sd.Lifeline();
    lifeline2.attachToRole(role2, paperHeight);
    lifeline2.addTo(graph);

    var lifeline3 = new sd.Lifeline();
    lifeline3.attachToRole(role3, paperHeight);
    lifeline3.addTo(graph);

    var message1 = new sd.Message();
    message1.setFromTo(lifeline1, lifeline2);
    message1.setStart(50);
    message1.setDescription('HTTP GET Request');
    message1.addTo(graph);

    var message2 = new sd.Message();
    message2.setFromTo(lifeline2, lifeline3);
    message2.setStart(150);
    message2.setDescription('SQL Command');
    message2.addTo(graph);

    var message3 = new sd.Message();
    message3.setFromTo(lifeline3, lifeline2);
    message3.setStart(250);
    message3.setDescription('Result Set');
    message3.addTo(graph);

    var message4 = new sd.Message();
    message4.setFromTo(lifeline2, lifeline1);
    message4.setStart(350);
    message4.setDescription('HTTP Response');
    message4.addTo(graph);

    var lifespan1 = new sd.LifeSpan();
    lifespan1.attachToMessages(message2, message3);
    lifespan1.addTo(graph);

    paper.unfreeze();
  }

}
