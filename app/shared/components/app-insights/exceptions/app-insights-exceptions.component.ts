import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService, AppInsightsQueryService } from '../../../services';

@Component({
    selector: 'app-insights-exceptions',
    templateUrl: 'app-insights-exceptions.component.html',
    //styleUrls: ['app-insights-dependencies.component.css']
})
export class AppInsightsExceptionsComponent implements OnInit, OnChanges {

    subscriptionId: string;
    resourceGroup: string;
    siteName: string;
    slotName: string;

    @Input() startTime: string;
    @Input() endTime: string;

    exceptions: any = [];

    constructor(private _route: ActivatedRoute, private authService: AuthService, public appInsightsQueryService: AppInsightsQueryService) {
        this.exceptions = [];
    }

    ngOnInit(): void {

        this.subscriptionId = this._route.snapshot.params['subscriptionid'];
        this.resourceGroup = this._route.snapshot.params['resourcegroup'];
        this.siteName = this._route.snapshot.params['sitename'];
        this.slotName = this._route.snapshot.params['slot'] ? this._route.snapshot.params['slot'] : '';
    }

    ngOnChanges(changes: SimpleChanges): void {

        if (changes['startTime']) {
            this.exceptions = [];
            this.appInsightsQueryService.GetTopExceptions(this.startTime, this.endTime).subscribe((data: any) => {
                let rows = data["Tables"][0]["Rows"];
                console.log(data);
                this.parseRowsIntoExceptions(rows);
            });
        }
    }

    parseRowsIntoExceptions(rows: any) {
        if (!rows || rows.length === 0) {
            return;
        }

        rows.forEach(element => {
            this.exceptions.push({
                message: element[0],
                exception: element[1],
                count: element[2]
            });
        });
    }
}
