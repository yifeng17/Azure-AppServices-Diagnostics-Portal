
import { Component, Pipe, PipeTransform, Inject, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { HealthStatus, TelemetryService } from 'diagnostic-data';
import { IDropdownOption, ISelectableOption } from 'office-ui-fabric-react';
import { DataRenderBaseComponent } from 'projects/diagnostic-data/src/lib/components/data-render-base/data-render-base.component';
import { CheckStepView, DropdownStepView, InfoStepView, InputStepView, StepViewContainer } from '../step-view-lib';



@Component({
  selector: 'input-step',
  templateUrl: './input-step.component.html',
  styleUrls: ['./input-step.component.scss', '../../../../../styles/icons.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InputStepComponent extends DataRenderBaseComponent implements OnInit {
  @Input() viewModel: StepViewContainer;
  inputStepView: InputStepView;
 
  constructor(private _telemetryService: TelemetryService){
    super(_telemetryService);
  }
  
  ngOnInit(): void {
    this.inputStepView = <InputStepView> this.viewModel.stepView; 
  }

  expand(){
    this.inputStepView.collapsed = false;
  }

}


