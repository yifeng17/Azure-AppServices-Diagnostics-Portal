import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../startup/services/auth.service';
import { ResourceService } from '../../../shared-v2/services/resource.service';
import { PortalReferrerMap, PortalReferrerInfo } from '../../models/portal-referrer-map';
import { DetectorType, TelemetryService } from 'diagnostic-data';
import { ArmService } from '../../services/arm.service';
import { WebSitesService } from '../../../resources/web-sites/services/web-sites.service';

@Component({
  selector: 'portal-referrer-resolver',
  templateUrl: './portal-referrer-resolver.component.html',
  styleUrls: ['./portal-referrer-resolver.component.scss']
})
export class PortalReferrerResolverComponent implements OnInit {
  private portalReferrerToDetectorMap: PortalReferrerMap[];
  public loadingMessage: string;
  public isEvaluating: boolean;
  public detectorId: string;

  constructor(private _authService: AuthService, private _router: Router, private _activatedRoute: ActivatedRoute,
    private _resourceService: ResourceService, private _logService: TelemetryService) {
    this.isEvaluating = true;
    this.loadingMessage = 'Collecting data to analyze your issue...';

    if (this._resourceService instanceof WebSitesService) {
      this.portalReferrerToDetectorMap = [{
        ReferrerExtensionName: 'Websites',
        ReferrerBladeName: 'CertificatesBlade',
        ReferrerTabName: 'Bindings',
        DetectorType: DetectorType.Detector,
        DetectorId: 'configuringsslandcustomdomains'
      },
      {
        ReferrerExtensionName: 'Websites',
        ReferrerBladeName: 'CustomDomainsAndSSL',
        ReferrerTabName: '',
        DetectorType: DetectorType.Detector,
        DetectorId: 'configuringsslandcustomdomains'
      },
      {
        ReferrerExtensionName: 'Websites',
        ReferrerBladeName: 'BackupSummaryBlade',
        ReferrerTabName: '',
        DetectorType: DetectorType.Detector,
        DetectorId: 'backupFailures'
      }];
    }

    this._authService.getStartupInfo().subscribe(startUpInfo => {
      var referrerParam = startUpInfo.optionalParameters.find(param => param.key === "Referrer");
      if (referrerParam) {
        this.matchReferrerAndRoute(referrerParam.value);
      }
    });
  }

  public isCollectingData(): boolean {
    return this.isEvaluating;
  }

  ngOnInit() {
  }

  matchReferrerAndRoute(referrer: PortalReferrerInfo): void {
    let path = `resource${this._resourceService.resourceIdForRouting}`;

    var referrerMatch = this.portalReferrerToDetectorMap.find(referrerMap =>
      referrerMap.ReferrerExtensionName.toLowerCase() === referrer.ExtensionName.toLowerCase() &&
      referrerMap.ReferrerBladeName.toLowerCase() === referrer.BladeName.toLowerCase() &&
      referrerMap.ReferrerTabName.toLowerCase() === referrer.TabName.toLowerCase()
    );


    if (referrerMatch) {
      if (referrerMatch.DetectorType === DetectorType.Detector) {
        path = `${path}/detectors/${referrerMatch.DetectorId}`;
        this.detectorId = referrerMatch.DetectorId;
      }
      else {
        if (referrerMatch.DetectorType === DetectorType.Analysis) {
          path = `${path}/analysis/${referrerMatch.DetectorId}`;
        }
      }
      this._logService.logEvent('IntegratedDiagnostics', {
        resourceUri: this._resourceService.resource.id,
        referrerInformation: JSON.stringify(referrer),
        targetType: referrerMatch.DetectorType,
        target: referrerMatch.DetectorId
      });
    }
    else {
      this._logService.logEvent('IntegratedDiagnostics', {
        resourceUri: this._resourceService.resource.id,
        referrerInformation: JSON.stringify(referrer),
        targetType: '',
        target: ''
      });
    }

    this.isEvaluating = false;
    this._router.navigate([path], { queryParamsHandling: 'merge' });
  }
}
