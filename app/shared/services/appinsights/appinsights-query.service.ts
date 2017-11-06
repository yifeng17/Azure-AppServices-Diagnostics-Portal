import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { AppInsightsService } from '../../../shared/services';

@Injectable()
export class AppInsightsQueryService {

    constructor(private appinsightsService: AppInsightsService) {
    }

    GetTopExceptions(startTimeUTC: Date, endTimeUTC: Date, exceptionCountLowerBound?: number) {
        
        let query: string = `
        exceptions
        | where timestamp >= datetime(2017-11-06 13:20) and timestamp <= datetime(2017-11-06 13:25)  
        | where client_Type == "PC" 
        | summarize count() by outerMessage, problemId
        | top 5 by count_ desc`;

        return this.appinsightsService.ExecuteQuery(query);
    }

    GetTopSlowestDependencies(startTimeUTC: Date, endTimeUTC: Date, dependencyCallCountLowerBound?: number) {

        let query: string = `
        dependencies
        | where type != "Ajax"
        | summarize percentiles(duration, 50), count()  by name 
        | where count_ > 10
        | top 5 by percentile_duration_50  desc `;

        return this.appinsightsService.ExecuteQuery(query);
    }

    private isNotNullOrEmpty(item: any): boolean {
        return (item && item != '');
    }
}