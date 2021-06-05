import { Component, Pipe, PipeTransform, Inject, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { DiagnosticData, HealthStatus, RenderingType, TelemetryService } from 'diagnostic-data';
import { IDropdownOption, ISelectableOption } from 'office-ui-fabric-react';
import { DataRenderBaseComponent } from 'projects/diagnostic-data/src/lib/components/data-render-base/data-render-base.component';
import { StepViewContainer, StepViewType } from '../step-view-lib';



@Component({
  selector: 'step-views-renderer',
  templateUrl: './step-views-renderer.component.html',
  styleUrls: ['./step-views-renderer.component.scss', '../../../../../styles/icons.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StepViewsRendererComponent extends DataRenderBaseComponent implements OnInit{
  stepViews: StepViewContainer[] = [];
  constructor(private _telemetryService: TelemetryService){
    super(_telemetryService);
  }

  protected processData(data: DiagnosticData) {
    super.processData(data);
    var json = data.table.rows[0][0];
    var stepViews = JSON.parse(json);
    this.stepViews = stepViews.map(s => {
      if(s.type == StepViewType.check){
        s["expandByDefault"] = true;
      }
      return new StepViewContainer(s);
    });
  }
  
  ngOnInit(): void {
    super.ngOnInit();
  }

}
