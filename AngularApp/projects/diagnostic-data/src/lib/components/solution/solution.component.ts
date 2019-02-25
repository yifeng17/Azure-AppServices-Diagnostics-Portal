import { Component, ViewEncapsulation, Input } from '@angular/core';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { Rendering } from '../../models/detector';
import { DiagnosticSiteService } from '../../services/diagnostic-site.service';
import { Dictionary } from '../../../../../applens/src/app/shared/models/extensions';
import { Observable } from 'rxjs';

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
  actionStatus: string;

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
    console.log("Running action on solution " + this.solution.Title);
    this.actionStatus = "Running...";

    this.chooseAction(this.solution.Action, this.solution.ResourceUri, this.solution.ActionArgs).subscribe(res => {
      this.actionStatus = "Complete!";

      if (res) {
        console.log("Solution action succeeded");
      } else {
        console.log("Solution action failed");
      }
    });
  }

  chooseAction(actionType: ActionType, resourceUri: string, args?: Dictionary<string>): Observable<any> {
    switch (actionType) {
      case ActionType.RestartSite:
        return this._siteService.restartSiteFromUri(resourceUri);
      case ActionType.UpdateSiteAppSettings:
        return this._siteService.updateSettingsFromUri(resourceUri, args);
      case ActionType.KillW3wpOnInstance:
        break;
    }
  }

}
