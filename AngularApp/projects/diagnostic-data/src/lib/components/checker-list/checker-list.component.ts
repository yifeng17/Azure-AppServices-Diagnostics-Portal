import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Pipe, PipeTransform, Inject, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { HealthStatus, LoadingStatus, TelemetryService } from 'diagnostic-data';
import { ResultView } from 'projects/app-service-diagnostics/src/app/shared/components/tools/network-checks/network-checks.component';

@Component({
  selector: 'checker-list',
  templateUrl: './checker-list.component.html',
  styleUrls: ['./checker-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('expand', [
      state('shown', style({ height: '*' })),
      state('hidden', style({ height: '0px', visibility: 'hidden' })),
      transition('* => *', animate('.25s'))
    ])
  ]
})
export class CheckerListComponent implements OnInit{
  @Input() viewModel: ResultView;
  private _expanded = false;

  constructor(private _telemetryService: TelemetryService){
  }
  
  ngOnInit(): void {
  }

  toggleCheckerHeaderStatus(viewModel: ResultView) {
    if(!this._expanded && !viewModel.expanded){
      this._expanded = true;
      this._telemetryService.logEvent("NetworkCheck.CheckExpanded", {checkId: viewModel.id});
    }
    viewModel.expanded = viewModel.loadingStatus === LoadingStatus.Success && !viewModel.expanded;
  }
}


