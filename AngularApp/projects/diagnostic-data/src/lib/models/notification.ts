import { DetectorResponse, DiagnosticData, HealthStatus, Rendering, RenderingType } from "./detector";
import { Solution } from "../components/solution/solution";

export class NotificationDetail {
    Status: HealthStatus;
    Title: string;
    Description: string;
    Solution: Solution;
    IsExpanded: boolean;
    StartDate: Date;
    ExpiryDate: Date;

    constructor(status: string, title: string, description?: string, solution?: Solution, isExpanded?: boolean, startDate?: Date, expiryDate?: Date) {
        this.Status = HealthStatus[status];
        this.Title = title;
        this.Description = description;
        this.Solution = solution;
        this.IsExpanded = isExpanded == null ? true : isExpanded;
        this.StartDate = startDate;
        this.ExpiryDate = expiryDate;
    }
}

export class NotificationUtils {
    public static parseNotificationRendering(data: DiagnosticData): NotificationDetail[] {
        let notificationList: NotificationDetail[] = [];
        const statusColumnIndex = 0;
        const titleColumnIndex = 1;
        // Test this with an insight for now, thus using 5

        // description index should be 2
        //    const descriptionColumnIndex = 2;
        //    const solutionColumnIndex = 3;
        const descriptionColumnIndex = 3;
        const solutionColumnIndex = 5;

        const datatable = data.table;
        for (let i: number = 0; i < datatable.rows.length; i++) {
            const row = datatable.rows[i];
            const status = <string>row[statusColumnIndex];
            const title = row[titleColumnIndex];
            const description = row[descriptionColumnIndex];
            let solution = null;
            let notification = null;

            if (solutionColumnIndex < row.length)
            {
                solution = JSON.parse(row[solutionColumnIndex]);
            }

            if ((notification = notificationList.find(notification => notification.Title === title)) === null)
            {
                notification = new NotificationDetail(status, title, description, solution);
                console.log("new notification", notification)
                notificationList.push(notification);
            }
        }

        return notificationList;
    }

    static parseInsightRendering(diagnosticData: DiagnosticData): NotificationDetail[] {
        const insights: NotificationDetail[] = [];
        const data = diagnosticData.table;

        const statusColumnIndex = 0;
        const insightColumnIndex = 1;
        const nameColumnIndex = 2;
        const valueColumnIndex = 3;
        const isExpandedIndex = 4;
        const solutionsIndex = 5;

        for (let i: number = 0; i < data.rows.length; i++) {
            let insight: NotificationDetail;
            const row = data.rows[i];
            const insightName = row[insightColumnIndex];
            const nameColumnValue = row[nameColumnIndex];

            let solutionsValue = null;
            if (solutionsIndex < row.length) {
                solutionsValue = <Solution[]>JSON.parse(row[solutionsIndex]);
            }

            if ((insight = insights.find(ins => ins.Title === insightName)) == null) {
                const isExpanded: boolean = row.length > isExpandedIndex ? row[isExpandedIndex].toLowerCase() === 'true' : false;
                let solution = solutionsValue && solutionsValue.length > 0 ? solutionsValue[0] : null;
                insight = new NotificationDetail(row[statusColumnIndex], insightName, row[valueColumnIndex], solution);
                insights.push(insight);
            }
        }

        return insights;
    }
}
