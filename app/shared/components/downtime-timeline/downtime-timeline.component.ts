import { CommonModule } from '@angular/common';
import { Component, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { IAppAnalysisResponse, IAbnormalTimePeriod } from '../../../shared/models/appanalysisresponse';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
    selector: 'downtime-timeline',
    templateUrl: 'downtime-timeline.component.html',
    styleUrls: ['downtime-timeline.component.css']
})
export class DowntimeTimelineComponent implements OnChanges {
    downtimeDisplayInfo: any[];

    constructor(){
        this.downtimeDisplayInfo = [];
    }

    @Input() appAnalysisResponse: IAppAnalysisResponse;

    @Input() selectedDowntimeIndex: number;

    @Output() selectedDowntimeIndexChange: EventEmitter<number> = new EventEmitter<number>();

    ngOnChanges(changes: any): void {
        let self = this;
        if(changes['appAnalysisResponse']){
            this.downtimeDisplayInfo = [];
            let response = this.appAnalysisResponse;
            if (response && response.abnormalTimePeriods) {
                let startTime = new Date(response.startTime);
                let endTime = new Date(response.endTime);

                let fullDuration = endTime.getTime() - startTime.getTime();

                let currentStart = new Date(startTime);
                let abnormalTimePeriodCount = 0;
                let totalPercent = 0;
                response.abnormalTimePeriods.forEach((downtime: IAbnormalTimePeriod) => {
                    let width = (new Date(downtime.startTime).getTime() - 300000 - currentStart.getTime()) / fullDuration * 100;
                    if(width > 0){
                        totalPercent += width;
                        this.downtimeDisplayInfo.push({
                            percent: width,
                            isDowntime: false,
                            index: -1
                        })
                    }

                    width = (new Date(downtime.endTime).getTime() - (new Date(downtime.startTime).getTime() - 300000)) / fullDuration * 100;
                    width = totalPercent + width > 100 ? 100 - totalPercent : width;
                    totalPercent += width;
                
                    this.downtimeDisplayInfo.push({
                        percent: width,
                        isDowntime: true,
                        index: abnormalTimePeriodCount++
                    })
                    currentStart = new Date(new Date(downtime.endTime).getTime());
                });

                if(currentStart < endTime){
                    let width = (endTime.getTime() - currentStart.getTime()) / fullDuration * 100;
                    width = totalPercent + width > 100 ? 100 - totalPercent : width;
                    totalPercent += width;
                    this.downtimeDisplayInfo.push({
                        percent: width,
                        isDowntime: false,
                        index: -1
                    });
                }
            }
        }
    }

    selectDowntime(identifier: number): void {
        if(identifier >= 0){
            this.selectedDowntimeIndex = identifier;
            this.selectedDowntimeIndexChange.emit(identifier);
        }
    }

    private inIFrame() : boolean{
        return window.parent !== window;
    }
}