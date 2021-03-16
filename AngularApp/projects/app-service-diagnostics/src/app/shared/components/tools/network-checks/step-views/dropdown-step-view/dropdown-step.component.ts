
import { Component, Pipe, PipeTransform, Inject, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { TelemetryService } from 'diagnostic-data';
import { IDropdownOption, ISelectableOption } from 'office-ui-fabric-react';
import { DropdownStepView, StepViewContainer } from '../../step-view-lib';



@Component({
  selector: 'dropdown-step',
  templateUrl: './dropdown-step.component.html',
  styleUrls: ['./dropdown-step.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DropDownStepComponent implements OnInit{
  @Input() viewModel: StepViewContainer;
  dropdownStepView: DropdownStepView;
  dropdownOptions:IDropdownOption[];
 
  constructor(private _telemetryService: TelemetryService){
    
  }
  
  ngOnInit(): void {
    this.dropdownStepView = <DropdownStepView> this.viewModel.stepView; 
    this.dropdownOptions = [<IDropdownOption>{ key: -1, text: "Select an Option", isSelected: this.dropdownStepView.defaultChecked == null, hidden: true }]
      .concat(this.dropdownStepView.options.map((s, idx)=> {
          return { key: idx, text: s, isSelected: idx == this.dropdownStepView.defaultChecked };
      }));
  }

  onChange(event:{event:any, option: ISelectableOption, index: number}){
    this.dropdownStepView.callback(<number>event.option.key);
  }

}


