
import { Component, Pipe, PipeTransform, Inject, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { HealthStatus, TelemetryService } from 'diagnostic-data';
import { IDropdownOption, ISelectableOption } from 'office-ui-fabric-react';
import { CheckStepView, DropdownStepView, InfoStepView, StepViewContainer } from '../../step-view-lib';



@Component({
  selector: 'info-step',
  templateUrl: './info-step.component.html',
  styleUrls: ['./info-step.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InfoStepComponent implements OnInit{
  @Input() viewModel: StepViewContainer;
  infoStepView: InfoStepView;
 
  constructor(private _telemetryService: TelemetryService){
    
  }
  
  ngOnInit(): void {
    this.infoStepView = <InfoStepView> this.viewModel.stepView; 
  }

}


