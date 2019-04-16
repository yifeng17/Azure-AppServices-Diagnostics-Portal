import { Observable } from 'rxjs';
import { Component, Input } from '@angular/core';
import { Rendering } from '../../models/detector';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { UriUtilities } from '../../utilities/uri-utilities';
import { SolutionService } from '../../services/solution.service';
import { Solution, ActionType } from './solution';

@Component({
  selector: 'solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent extends DataRenderBaseComponent {

  @Input("data") solution: Solution;
  renderingProperties: Rendering;
  actionStatus: string;
  defaultCopyText = 'Copy to Email';
  copyText = this.defaultCopyText;
  appName: string;
  renderedInternalMarkdown = '';

  constructor(telemetryService: TelemetryService, private _siteService: SolutionService) {
    super(telemetryService);
  }

  ngOnInit() {
    let uriParts = this.solution.ResourceUri.split('/');
    this.appName = uriParts[uriParts.length - 1];

    if (this.renderedInternalMarkdown === '') {
        this.buildInternalText();
    }
  }

  buildInternalText() {
    let markdownBuilder = this.solution.InternalMarkdown;

    let detectorLink = UriUtilities.BuildDetectorLink(this.solution.ResourceUri, this.solution.DetectorId);
    let detectorLinkMarkdown = `Go to [App Service Diagnostics](${detectorLink})`;

    if (markdownBuilder.toLowerCase().includes("{detectorlink}")) {
        markdownBuilder = markdownBuilder.replace(/{detectorlink}/gi, detectorLink);
    } else if (!markdownBuilder.includes(detectorLinkMarkdown)) {
        markdownBuilder = markdownBuilder + "\n\n" + detectorLinkMarkdown;
    }

    this.renderedInternalMarkdown = markdownBuilder;
  }

  performAction() {
    this.actionStatus = "Running...";

    this.chooseAction().subscribe(res => {
      if (res.ok == undefined || res.ok) {
        this.actionStatus = "Complete!"
      } else {
        this.actionStatus = `Error completing request. Status code: ${res.status}`
      }
    });
  }

  lowercaseFirst(target: string): string {
    return target.charAt(0).toLowerCase() + target.slice(1)
  }

  convertOptions(): {} {
    let actionOptions = {};
    switch (this.solution.Action) {
      case (ActionType.ArmApi): {
        actionOptions = this.solution.ApiOptions;
        break;
      }
      case (ActionType.GoToBlade): {
        actionOptions = this.solution.BladeOptions;
        break;
      }
      case (ActionType.OpenTab): {
        actionOptions = this.solution.TabOptions;
        break;
      }
    }

    let overrideOptions = {};
    for (let key in actionOptions) {
      overrideOptions[this.lowercaseFirst(key)] = actionOptions[key]
    }

    overrideOptions = {...overrideOptions, ...this.solution.OverrideOptions};

    return overrideOptions;
  }

  chooseAction(): Observable<any> {
    let options = this.convertOptions();

    switch (this.solution.Action) {
      case ActionType.ArmApi: {
        return this._siteService.ArmApi(this.solution.ResourceUri, options);
      }
      case ActionType.GoToBlade: {
        return this._siteService.GoToBlade(this.solution.ResourceUri, options);
      }
      case ActionType.OpenTab: {
        return this._siteService.OpenTab(this.solution.ResourceUri, options);
      }
    }

    throw new Error(`Not Implemented: Solution Service does not have an implementation for the action.`)
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

    this.logTextCopied();

    setTimeout(() => {
      this.copyText = this.defaultCopyText;
    }, 2000);
  }

  logTextCopied() {
    this.telemetryService.logEvent('SolutionTextCopied',
      {
        'solutionName': this.solution.Name,
        'appName': this.appName
      }
    );
  }

}
