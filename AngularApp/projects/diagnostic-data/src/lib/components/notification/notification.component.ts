import { Component} from "@angular/core";
import { DataRenderBaseComponent } from "../data-render-base/data-render-base.component";
import { RenderingType, InsightsRendering, HealthStatus, DiagnosticData, NotificationRendering } from "../../models/detector";
import { Insight, InsightUtils } from "../../models/insight";
import { TelemetryService } from "../../services/telemetry/telemetry.service";
import { TelemetryEventNames } from "../../services/telemetry/telemetry.common";
import { NotificationDetail, NotificationUtils } from "../../models/notification";

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent extends DataRenderBaseComponent {
    DataRenderingType = RenderingType.Notification;

    renderingProperties: NotificationRendering;

    public notifications: NotificationDetail[];

    NotificationStatus = HealthStatus;

    constructor(protected telemetryService: TelemetryService) {
      super(telemetryService);
    }

    protected processData(data: DiagnosticData) {
      super.processData(data);
      this.renderingProperties = <NotificationRendering>data.renderingProperties;
      this.notifications = NotificationUtils.parseNotificationRendering(data);

     // this.notifications = NotificationUtils.parseInsightRendering(data);
      console.log("this.notifications", this.notifications);
    }

    hasSolution(notification: NotificationDetail) {
      return notification.Solution != null;
    }
}
