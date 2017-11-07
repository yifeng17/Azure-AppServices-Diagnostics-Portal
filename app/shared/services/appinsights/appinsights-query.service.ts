import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { AppInsightsService } from '../../../shared/services';
import { ICache } from '../../../shared/models/icache';

@Injectable()
export class AppInsightsQueryService {

    private exceptionsCache: ICache<any>;
    private dependenciesCache: ICache<any>;

    constructor(private appinsightsService: AppInsightsService) {
        this.invalidateCache();
    }

    GetTopExceptions(startTimeUTC: string, endTimeUTC: string, recordsLimit: number = 5) {

        if (this.exceptionsCache && this.exceptionsCache[startTimeUTC]) {
            return Observable.of<any>(this.exceptionsCache[startTimeUTC]);
        }

        let query: string = `
        exceptions
        | where timestamp >= datetime(${startTimeUTC}) and timestamp <= datetime(${endTimeUTC})  
        | where client_Type == "PC" 
        | summarize count() by outerMessage, problemId
        | top ${recordsLimit} by count_ desc`;

        return this.appinsightsService.ExecuteQuery(query)
            .do(data => {
                this.exceptionsCache[startTimeUTC] = data;
            });
    }

    GetTopSlowestDependencies(startTimeUTC: Date, endTimeUTC: Date, dependencyCallCountLowerBound?: number) {

        let query: string = `
        dependencies
        | where type != "Ajax"
        | summarize percentiles(duration, 50), count()  by name 
        | where count_ > 10
        | top 5 by percentile_duration_50  desc`;

        return this.appinsightsService.ExecuteQuery(query);
    }

    invalidateCache(): void {
        this.exceptionsCache = {};
        this.dependenciesCache = {};
    }

    private isNotNullOrEmpty(item: any): boolean {
        return (item && item != '');
    }
}