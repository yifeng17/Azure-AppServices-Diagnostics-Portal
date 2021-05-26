
import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { TelemetryService } from 'diagnostic-data';
import { CheckStepView, StepViewContainer } from '../step-view-lib';



@Component({
  selector: 'check-step',
  templateUrl: './check-step.component.html',
  styleUrls: ['./check-step.component.scss', '../../../../../styles/icons.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CheckStepComponent implements OnInit {
  @Input() viewModel: StepViewContainer;
  checkStepView: CheckStepView;
  expanded = false;

  constructor(private _telemetryService: TelemetryService) {

  }

  ngOnInit(): void {
    this.checkStepView = <CheckStepView>this.viewModel.stepView;
  }

  toggleSubChecks(): void {
    this.expanded = !this.expanded;
  }
}
