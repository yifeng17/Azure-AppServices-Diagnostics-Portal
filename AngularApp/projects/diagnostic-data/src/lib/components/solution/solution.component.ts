import { Observable } from 'rxjs';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Dictionary } from '../../../../../applens/src/app/shared/models/extensions';
import { Rendering } from '../../models/detector';
import { DiagnosticSiteService } from '../../services/diagnostic-site.service';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';

export enum ActionType {
  RestartSite,
  UpdateSiteAppSettings,
  KillW3wpOnInstance
}

export class Solution {
  Title: string;
  Descriptions: string[];
  ResourceUri: string;
  IsInternal: boolean;
  RequiresConfirmation: boolean;
  Action: ActionType;
  ActionArgs: Dictionary<any>;
}

@Component({
  selector: 'solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent extends DataRenderBaseComponent {

  @Input("data") solution: Solution;
  renderingProperties: Rendering;
  acceptRisk: boolean;
  actionStatus: string;
  defaultCopyText = 'Copy instructions';
  copyText = this.defaultCopyText;

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

  copyInstructions(copyValue: string) {
    this.copyText = "Copying..";

    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = copyValue;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.copyText = "Copied!";

    setTimeout(() => {
      this.copyText = this.defaultCopyText;
    }, 2000);
  }

}
