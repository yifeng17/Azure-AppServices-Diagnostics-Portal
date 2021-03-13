
import { Component, Pipe, PipeTransform, Inject, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { HealthStatus, TelemetryService } from 'diagnostic-data';
import { IDropdownOption, ISelectableOption } from 'office-ui-fabric-react';
import { CheckStepView, DropdownStepView, StepViewContainer } from '../../step-view-lib';



@Component({
  selector: 'check-step',
  templateUrl: './check-step.component.html',
  styleUrls: ['./check-step.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CheckStepComponent implements OnInit{
  @Input() viewModel: StepViewContainer;
  checkStepView: CheckStepView;
  status:HealthStatus;
 
  constructor(private _telemetryService: TelemetryService){
    
  }
  
  ngOnInit(): void {
    this.checkStepView = <CheckStepView> this.viewModel.stepView; 
    this.status = this.checkStepView.status;
  }

}


