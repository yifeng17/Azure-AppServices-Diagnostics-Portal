import { Component, ViewEncapsulation, Input } from '@angular/core';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { Rendering } from '../../models/detector';
import { DiagnosticSiteService } from '../../services/diagnostic-site.service';
import { Dictionary } from '../../../../../applens/src/app/shared/models/extensions';

export enum ActionType {
  RestartSite,
  UpdateSiteAppSettings,
  KillW3wpOnInstance
}

export class Solution {
  Title: string;
  Descriptions: string[];
  ResourceUri: string;
  RequiresConfirmation: boolean;
  Action: ActionType;
  ActionArgs: Dictionary<any>;
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
  acceptRisk: boolean;
  restartStatus: string;

  constructor(telemetryService: TelemetryService, private _siteService: DiagnosticSiteService) {
    super(telemetryService);
  }

  ngOnInit() {
    if (this.solution.Descriptions == null) {
      this.solution.Descriptions = [];
    }

    this.acceptRisk = !this.solution.RequiresConfirmation;
  }

  checkAcceptRisk() {
    this.acceptRisk = !this.acceptRisk;
  }

  performAction() {
    console.log("Restarting site on solution " + this.solution.Title);
    this.restartStatus = "Running...";

    this._siteService.restartSiteFromUri(this.solution.ResourceUri).subscribe(res => {
      this.restartStatus = "Complete!";

      if (res) {
        console.log("Site restart succeeded");
      } else {
        console.log("Site restart failed");
      }
    });
  }

}
