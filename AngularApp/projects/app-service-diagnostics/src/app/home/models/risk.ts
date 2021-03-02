import { DiagnosticData, HealthStatus, Insight, LoadingStatus, Rendering, RenderingType } from "diagnostic-data";
import { Solution } from "dist/diagnostic-data/lib/components/solution/solution";
import { DetectorResponse } from "diagnostic-data";
import { MessageBarType } from "office-ui-fabric-react";
import { Observable } from "rxjs";

export interface RiskTile {
    id: string;
    title: string;
    linkText: string;
    riskInfo: RiskInfo;
    loadingStatus: LoadingStatus;
    showTile: boolean;
}

export interface NotificationMessageBar {
    showEmergingIssue: boolean;
    id: string;
    panelTitle: string;
    notificationMessage: string;
    status: HealthStatus,
    linkText: string;
}

export interface RiskInfo {
    [propName: string]: HealthStatus;
}

export class RiskHelper {
    public static convertToRiskInfo(info: any): RiskInfo {
        let riskInfo: RiskInfo = {};
        const keys = Object.keys(info);
        for (let key of keys) {
            const type = info[key].messageType;
            if (type !== undefined && type !== null) {
                let status = this.convertMessageTypeToHealthStatus(type);
                riskInfo[key] = status;
            }
        }
        return riskInfo;
    }

    private static convertMessageTypeToHealthStatus(messageBarType: MessageBarType): HealthStatus {
        switch (messageBarType) {
            case MessageBarType.severeWarning:
            case MessageBarType.error:
                return HealthStatus.Critical;

            case MessageBarType.warning:
                return HealthStatus.Warning;

            case MessageBarType.info:
                return HealthStatus.Info;

            case MessageBarType.success:
                return HealthStatus.Success;

            default:
                return HealthStatus.Info;
        }
    }

    public static convertResponseToRiskInfo(res: DetectorResponse): RiskInfo {
        let riskInfo: RiskInfo = {};
        let notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === RenderingType.Notification);

        const statusColumnIndex = 0;
        const titleColumnIndex = 1;

        for (let notification of notificationList) {

            const data = notification.table;

            for (let i: number = 0; i < data.rows.length; i++) {
                const row = data.rows[i];
                const notificationStatus = <string>row[statusColumnIndex];
                const insightName = row[titleColumnIndex];

                if (notificationStatus !== undefined && notificationStatus !== null) {
                    riskInfo[insightName] = HealthStatus[notificationStatus];
                }
            }

        }
        return riskInfo;
    }
}
