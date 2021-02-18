import { DiagnosticData, HealthStatus, Insight, LoadingStatus, Rendering } from "diagnostic-data";
import { Solution } from "dist/diagnostic-data/lib/components/solution/solution";
import { DetectorResponse } from "dist/diagnostic-data/public_api";
import { MessageBarType } from "office-ui-fabric-react";
import { Observable } from "rxjs";

export interface RiskTile {
    id: string;
    title: string;
    action: () => void;
    linkText: string;
    riskInfo: RiskInfo;
    loadingStatus: LoadingStatus;
    infoObserverable: Observable<RiskInfo>;
    showTile:boolean;
    riskAlertResponse: DetectorResponse;
}

export interface RiskInfo {
    [propName: string]: HealthStatus;
}

export class RiskHelper
{
    public static convertToRiskInfo(info:any):RiskInfo {
        let riskInfo:RiskInfo = {};
        const keys = Object.keys(info);
        for(let key of keys){
            const type = info[key].messageType;
            if(type !== undefined && type !== null){
                let status = this.convertMessageTypeToHealthStatus1(type);
                riskInfo[key] = status;
            }
        }
        return riskInfo;
    }

    private static convertMessageTypeToHealthStatus(messageBarType:MessageBarType):HealthStatus{
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

    private static convertMessageTypeToHealthStatus1(messageBarType:MessageBarType):HealthStatus{
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
        let riskInfo:RiskInfo = {};
        let notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === 7);
   //     let notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === 26);
     //   const keys = Object.keys(notificationList);

        const statusColumnIndex = 0;
        const insightColumnIndex = 1;
        const nameColumnIndex = 2;
        const valueColumnIndex = 3;
        const isExpandedIndex = 4;
        const solutionsIndex = 5;

        for(let notification of notificationList){

            const data = notification.table;

            for (let i: number = 0; i < data.rows.length; i++) {
                const row = data.rows[i];
               // (<string>row[statusColumnIndex])
                const notificationStatus = <string>row[statusColumnIndex];
                const insightName = row[insightColumnIndex];
                const nameColumnValue = row[nameColumnIndex];

                if(notificationStatus !== undefined && notificationStatus !== null){
                riskInfo[insightName] = HealthStatus[notificationStatus];
                }

            }

        }
        return riskInfo;
    }

    public static parseRiskNotificationRendering(res: DetectorResponse): RiskInfo {
        let riskInfo:RiskInfo = {};
        let notificationList = res.dataset.filter(set => (<Rendering>set.renderingProperties).type === 26);
     //   const keys = Object.keys(notificationList);

        const statusColumnIndex = 0;
        const insightColumnIndex = 1;
        const nameColumnIndex = 2;
        const valueColumnIndex = 3;
        const isExpandedIndex = 4;
        const solutionsIndex = 5;

        for(let notification of notificationList){

            const data = notification.table;

            for (let i: number = 0; i < data.rows.length; i++) {
                const row = data.rows[i];
                const notificationStatus = <string>row[statusColumnIndex];
                const insightName = row[insightColumnIndex];
                const nameColumnValue = row[nameColumnIndex];

                if(notificationStatus !== undefined && notificationStatus !== null){
                    riskInfo[insightName] = HealthStatus[notificationStatus];
                }
            }
        }
        return riskInfo;
    }

    static parseInsightRendering(diagnosticData: DiagnosticData): Insight[] {
        const insights: Insight[] = [];
        const data = diagnosticData.table;

        const statusColumnIndex = 0;
        const insightColumnIndex = 1;
        const nameColumnIndex = 2;
        const valueColumnIndex = 3;
        const isExpandedIndex = 4;
        const solutionsIndex = 5;

        for (let i: number = 0; i < data.rows.length; i++) {
            let insight: Insight;
            const row = data.rows[i];
            const insightName = row[insightColumnIndex];
            const nameColumnValue = row[nameColumnIndex];

            let solutionsValue = null;
            if (solutionsIndex < row.length) {
                solutionsValue = <Solution[]>JSON.parse(row[solutionsIndex]);
            }

            if ((insight = insights.find(ins => ins.title === insightName)) == null) {
                const isExpanded: boolean = row.length > isExpandedIndex ? row[isExpandedIndex].toLowerCase() === 'true' : false;
                insight = new Insight(row[statusColumnIndex], insightName, isExpanded, solutionsValue);
                insights.push(insight);
            }

            if (nameColumnValue && nameColumnValue.length > 0) {
                insight.data[nameColumnValue] = `${row[valueColumnIndex]}`;
            }
        }

        return insights;
    }
}
