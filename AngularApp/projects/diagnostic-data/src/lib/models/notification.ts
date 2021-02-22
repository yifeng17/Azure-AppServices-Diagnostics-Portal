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
            let solutionValue = null;
            let notification = null;

            if (solutionColumnIndex < row.length) {
                solutionValue = <Solution[]>JSON.parse(row[solutionColumnIndex]);
            }

            if ((notification = notificationList.find(notification => notification.Title === title)) == undefined) {

                let solution = solutionValue && solutionValue.length > 0 ? solutionValue[0] : null;
                notification = new NotificationDetail(status, title, description, solution);
                notificationList.push(notification);
            }
        }

        return notificationList;
    }

    public static parseNotificationRendering1(data: DiagnosticData): NotificationDetail[] {
        let notificationList: NotificationDetail[] = [];
        const statusColumnIndex = 0;
        const titleColumnIndex = 1;
        const descriptionColumnIndex = 2;
        const solutionColumnIndex = 3;

        const datatable = data.table;
        for (let i: number = 0; i < datatable.rows.length; i++) {
            const row = datatable.rows[i];
            const status = <string>row[statusColumnIndex];
            const title = row[titleColumnIndex];
            const description = row[descriptionColumnIndex];
            let solution = null;
            let notification = null;

            if (solutionColumnIndex < row.length) {
                solution = <Solution>JSON.parse(row[solutionColumnIndex]);
            }

            if ((notification = notificationList.find(notification => notification.Title === title)) == undefined) {
                notification = new NotificationDetail(status, title, description, solution);
                notificationList.push(notification);
            }
        }

        return notificationList;
    }
}
