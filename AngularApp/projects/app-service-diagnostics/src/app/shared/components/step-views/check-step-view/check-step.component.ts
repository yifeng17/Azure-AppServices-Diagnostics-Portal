
import { Component, Pipe, PipeTransform, Inject, OnInit, Input, ViewEncapsulation, OnChanges, SimpleChanges } from '@angular/core';
import { HealthStatus, TelemetryService } from 'diagnostic-data';
import { IDropdownOption, ISelectableOption } from 'office-ui-fabric-react';
import { checkResultLevel, CheckStepView, StepViewContainer } from '../step-view-lib';



@Component({
  selector: 'check-step',
  templateUrl: './check-step.component.html',
  styleUrls: ['./check-step.component.scss'],
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

@Pipe({
  name: 'convertLevelToHealthStatus'
})
export class ConvertLevelToHealthStatusPipe implements PipeTransform {
  transform(level: checkResultLevel, args?: any): any {
    switch (level) {
      case checkResultLevel.pass:
        return HealthStatus.Success;
      case checkResultLevel.fail:
        return HealthStatus.Critical;
      case checkResultLevel.warning:
        return HealthStatus.Warning;
      case checkResultLevel.pending:
        return HealthStatus.Info;
      case checkResultLevel.error:
        return HealthStatus.Info;
    }
    return HealthStatus.None;
  }
}