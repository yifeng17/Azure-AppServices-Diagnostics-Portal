import { Component } from '@angular/core';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { DiagnosticData, Rendering } from '../../models/detector';

export class Solution {
  title: string;
  descriptions: string[];
  requiresConfirmation: boolean;
  resourceGroup: string;
  resourceName: string;
  bladeName: string;
}

export enum SolutionActionType {
  Internal,
  External
}

@Component({
  selector: 'solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent extends DataRenderBaseComponent {

  solution: Solution;
  renderingProperties: Rendering;

  constructor(telemetryService: TelemetryService) {
    super(telemetryService)
  }

  processData(data: DiagnosticData) {
    super.processData(data);

    this.renderingProperties = <Rendering>data.renderingProperties;

    data.table.rows.map(row => {
      this.solution = <Solution>{
        title: row[0],
        descriptions: JSON.parse(row[1]),
        requiresConfirmation: row[2],
        resourceGroup: row[3],
        resourceName: row[4],
        bladeName: row[5]
      };
    });
  }

}
