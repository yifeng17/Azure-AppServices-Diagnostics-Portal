
import { Component, Pipe, PipeTransform, Inject, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { HealthStatus, TelemetryService } from 'diagnostic-data';
import { IDropdownOption, ISelectableOption } from 'office-ui-fabric-react';
import { CheckStepView, DropdownStepView, InfoStepView, InputStepView, StepViewContainer } from '../step-view-lib';



@Component({
  selector: 'input-step',
  templateUrl: './input-step.component.html',
  styleUrls: ['./input-step.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InputStepComponent implements OnInit{
  @Input() viewModel: StepViewContainer;
  inputStepView: InputStepView;
 
  constructor(private _telemetryService: TelemetryService){
    
  }
  
  ngOnInit(): void {
    this.inputStepView = <InputStepView> this.viewModel.stepView; 
  }

}


