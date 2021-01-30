import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Pipe, PipeTransform, Inject, OnInit, Input } from '@angular/core';
import { HealthStatus, LoadingStatus } from 'diagnostic-data';
import { CheckResultView } from 'projects/app-service-diagnostics/src/app/shared/components/tools/network-checks/network-checks.component';

@Component({
  selector: 'checker-list',
  templateUrl: './checker-list.component.html',
  styleUrls: ['./checker-list.component.scss'],
  animations: [
    trigger('expand', [
      state('shown', style({ height: '*' })),
      state('hidden', style({ height: '0px', visibility: 'hidden' })),
      transition('* => *', animate('.25s'))
    ])
  ]
})
export class CheckerListComponent implements OnInit{
  @Input() viewModel: CheckResultView;
  title: string = 'asdfasdfasdf';
  
  ngOnInit(): void {
  }

  toggleCheckerHeaderStatus(viewModel: CheckResultView) {
    viewModel.expanded = viewModel.loadingStatus === LoadingStatus.Success && !viewModel.expanded;
  }
}


