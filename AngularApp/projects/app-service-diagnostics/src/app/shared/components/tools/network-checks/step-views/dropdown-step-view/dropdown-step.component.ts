
import { Component, Pipe, PipeTransform, Inject, OnInit, Input, ViewEncapsulation, AfterViewInit, AfterContentInit } from '@angular/core';
import { TelemetryService } from 'diagnostic-data';
import { IDropdown, IDropdownOption, ISelectableOption, RefObject } from 'office-ui-fabric-react';
import React = require('react');
import { DropdownStepView, StepViewContainer } from '../../step-view-lib';



@Component({
  selector: 'dropdown-step',
  templateUrl: './dropdown-step.component.html',
  styleUrls: ['./dropdown-step.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DropDownStepComponent implements OnInit {
  @Input() viewModel: StepViewContainer;
  dropdownStepView: DropdownStepView;
  dropdownOptions: IDropdownOption[][];
  dropdown: IDropdown;
  dropdownRef: {
    current: IDropdown
  };

  constructor(private _telemetryService: TelemetryService) {

  }

  ngOnInit() {
    this.dropdownStepView = <DropdownStepView>this.viewModel.stepView;
    var expandByDefault = this.dropdownStepView.expandByDefault;
    this.dropdownRef = {
      set current(val: IDropdown) {
        this.dropdown = val;
        if (expandByDefault) {
          val.focus(true);
        }
      },

      get current() {
        return this.dropdown;
      }
    };
    this.dropdownOptions = this.dropdownStepView.dropdowns.map(dropdown => this.getOptions(dropdown));//*/
    var push = this.dropdownStepView.dropdowns.push.bind(this.dropdownStepView.dropdowns);
    this.dropdownStepView.dropdowns.push = (dropdown => {
      this.dropdownOptions.length = this.dropdownStepView.dropdowns.length;
      this.dropdownOptions.push(this.getOptions(dropdown));
      return push(dropdown);
    });
  }

  onChange(event: { event: any, option: ISelectableOption, index: number }, dropdownIdx: number) {
    this.dropdownStepView.callback(dropdownIdx, <number>event.option.key);
  }

  getOptions(dropdown: any): IDropdownOption[] {
    return [<IDropdownOption>{ key: -1, text: dropdown.placeholder, isSelected: dropdown.defaultChecked == null, hidden: true }]
      .concat(dropdown.options.map((s, idx) => {
        return { key: idx, text: s, isSelected: idx == dropdown.defaultChecked };
      }));
  }

}


