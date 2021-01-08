import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericSupportTopicService } from 'diagnostic-data';
import { AuthService } from '../../../startup/services/auth.service';
import { NotificationService, Notification } from '../../../shared-v2/services/notification.service';
import { PortalKustoTelemetryService } from '../../../shared/services/portal-kusto-telemetry.service';
import { SubscriptionPropertiesService } from '../../../shared/services/subscription-properties.service';
import { MessageBarType } from 'office-ui-fabric-react';
@Component({
  selector: 'support-topic-redirect',
  templateUrl: './support-topic-redirect.component.html',
  styleUrls: ['./support-topic-redirect.component.scss']
})
export class SupportTopicRedirectComponent implements OnInit {

  constructor(private _activatedRoute: ActivatedRoute, private _router: Router, private _supportTopicService: GenericSupportTopicService, private _authService: AuthService,
    private _notificationService: NotificationService, private portalKustoLogging: PortalKustoTelemetryService, private subscriptionPropertiesService: SubscriptionPropertiesService) { }

  ngOnInit() {
    this._supportTopicService.getPathForSupportTopic(this._activatedRoute.snapshot.queryParams.supportTopicId, this._activatedRoute.snapshot.queryParams.pesId, this._activatedRoute.snapshot.queryParams.caseSubject).subscribe(res => {
        console.log("navigate to ", res.path);
        this._router.navigate([`../${res.path}`], { relativeTo: this._activatedRoute, queryParams: res.queryParams });

      this._authService.getStartupInfo().subscribe(startupInfo => {
        if (startupInfo.source && startupInfo.source.toLowerCase() == ('CaseSubmissionV2-NonContext').toLowerCase() && !startupInfo.isIFrameForCaseSubmissionSolution) {
          const notification = new Notification('To continue with support request creation, please click on the "X" in the upper right corner.', null, MessageBarType.info, 'fa-info-circle', undefined, true);
          this._notificationService.pushNotification(notification);
        }
      });
    });

    // Logging subscription location placement id in case detector opened from Case Submission flow directly
    let subscriptionid = this._activatedRoute.snapshot.params['subscriptionid'];

    this.subscriptionPropertiesService.getSubscriptionProperties(subscriptionid).subscribe(response => {
      if (response.body["subscriptionPolicies"]) {
        this.portalKustoLogging.logEvent("SubscriptionProperties", {
          subscriptionid: subscriptionid,
          subscriptionLocationPlacementId: response.body["subscriptionPolicies"]["locationPlacementId"]
        });
      }
    });

  }
}
