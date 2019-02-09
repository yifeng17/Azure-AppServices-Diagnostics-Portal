import { Component, ViewEncapsulation, Input } from '@angular/core';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { DiagnosticData, Rendering } from '../../models/detector';

export class Solution {
  Title: string;
  Descriptions: string[];
  RequiresConfirmation: boolean;
  ResourceGroup: string;
  ResourceName: string;
  BladeName: string;
}

export enum SolutionActionType {
  Internal,
  External
}

@Component({
  selector: 'solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SolutionComponent extends DataRenderBaseComponent {

  @Input() solution: Solution;
  renderingProperties: Rendering;
  acceptRisk = false;

  constructor(telemetryService: TelemetryService) {
    super(telemetryService)
  }

  processData(data: DiagnosticData) {
    super.processData(data);

    this.renderingProperties = <Rendering>data.renderingProperties;

    data.table.rows.map(row => {
      this.solution = <Solution>{
        Title: row[0],
        Descriptions: JSON.parse(row[1]),
        RequiresConfirmation: row[2],
        ResourceGroup: row[3],
        ResourceName: row[4],
        BladeName: row[5]
      };
    });
  }

  checkAcceptRisk() {
    this.acceptRisk = !this.acceptRisk;
  }

}
