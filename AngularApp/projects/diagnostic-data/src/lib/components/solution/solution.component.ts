import { Component, ViewEncapsulation, Input } from '@angular/core';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { DiagnosticData, Rendering } from '../../models/detector';
import { SiteService } from 'projects/app-service-diagnostics/src/app/shared/services/site.service';

export class Solution {
  Title: string;
  Descriptions: string[];
  ResourceUri: string;
  RequiresConfirmation: boolean;
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

  // TODO: No provider for SiteService - have to migrate that to this project or fix the reference
  constructor(telemetryService: TelemetryService, public siteService: SiteService) {
    super(telemetryService)
  }

  processData(data: DiagnosticData) {
    super.processData(data);

    this.renderingProperties = <Rendering>data.renderingProperties;

    data.table.rows.map(row => {
      this.solution = <Solution>{
        Title: row[0],
        Descriptions: JSON.parse(row[1]),
        ResourceUri: row[2],
        RequiresConfirmation: row[3]
      };
    });
  }

  checkAcceptRisk() {
    this.acceptRisk = !this.acceptRisk;
  }

  performAction() {
    console.log("Restarting site");
    this.siteService.restartSiteFromResourceUri(this.solution.ResourceUri);
  }

}
