import { Component, OnInit, Input } from '@angular/core';
import { DiagnosticService } from '../../services/diagnostic.service';
import { DetectorControlService } from '../../services/detector-control.service';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { TelemetryEventNames } from '../../services/telemetry/telemetry.common';
import { DetectorResponse, DiagnosticData, DataTableResponseObject } from '../../models/detector';
import { MatTableDataSource} from '@angular/material';
import { Change, ChangeLevel } from '../../models/changesets';
import { animate, state, style, transition, trigger } from '@angular/animations';
import * as momentNs from 'moment';
import { ChangeAnalysisUtilities } from '../../utilities/changeanalysis-utilities';
import { DataTableUtilities } from '../../utilities/datatable-utilities';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
const moment = momentNs;
  @Component({
    selector: 'changes-view',
    templateUrl: './changes-view.component.html',
    styleUrls: ['./changes-view.component.scss'],
    animations: [
        trigger('changeRowExpand', [
          state('collapsed', style({height: '0px', minHeight: '0', visibility: 'hidden'})),
          state('expanded', style({height: '*', visibility: 'visible'})),
          transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
      ],
  })
export class ChangesViewComponent extends DataRenderBaseComponent implements OnInit {

    @Input() changesetId: string = '';
    @Input() changesDataSet: DiagnosticData[];
    @Input() initiatedBy: string = '';
    changesResponse: DetectorResponse;
    dataSource: MatTableDataSource<Change>;
    displayedColumns = ['level', 'time', 'displayName', 'description', 'initiatedBy'];
    expandedElement: Change | null;
    tableItems: Change[];
    options = {
        theme: 'vs',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        minimap: {
          enabled: false
        },
        folding: true
      };
    changeLevelIcon = [{
        "imgSrc": "../../../assets/img/normalicon.png",
        "displayValue": "Normal"
    }, {
        "imgSrc": "../../../assets/img/importanticon.png",
        "displayValue": "Important"
    }, {
        "imgSrc": "../../../assets/img/noiseicon.png",
        "displayValue": "Noise"
    }];

    private _changeFeedbacks: Map<Change, boolean> = new Map<Change, boolean>();

    constructor(private diagnosticService: DiagnosticService, private detectorControlService: DetectorControlService, protected telemetryService: TelemetryService) {
        super(telemetryService);
     }

    ngOnInit() {
        this.tableItems = [];
        let changesTable = this.changesDataSet[0].table;
        if(changesTable) {
            this.parseChangesData(changesTable);
        }
    }

    calculateHeight(element: any) {
        let value = Math.floor(Math.random() * Math.floor(1000));
        return value.toString() + "px";
    }

    private parseChangesData(changesTable: DataTableResponseObject) {
        if(changesTable.rows.length > 0) {
            changesTable.rows.forEach((row, index) => {
                let level: ChangeLevel = ChangeLevel[<string>this.getChangeProperty(row, "level", changesTable)];
                let description = this.getChangeProperty(row, "description", changesTable);
                let oldValue    = this.getChangeProperty(row, "oldValue", changesTable);
                let newValue    = this.getChangeProperty(row, "newValue", changesTable);
                let displayName = this.getChangeProperty(row, "displayName", changesTable);
                let timestamp   = this.getChangeProperty(row, "timeStamp", changesTable);
                let jsonPath    = this.getChangeProperty(row, "jsonPath", changesTable);
                let initiatedBy = this.initiatedBy;
                if (index == 1) {
                    oldValue = {"a": 3, "b": 4, "c": 4, "d": 6};
                    for (let i = 0; i < 100; i++) {
                        oldValue[i.toString()] = i;
                    }
                    
                    newValue = {"a": 3, "b": 5, "e": 6, "c": 4};
                } else if (index == 2) {
                    oldValue = {"a": 3, "c": 5};
                    newValue = {"b": 4};
                }

                let originalModel = ChangeAnalysisUtilities.prepareValuesForDiffView(oldValue);
                let modifiedModel = ChangeAnalysisUtilities.prepareValuesForDiffView(newValue);

                this.tableItems.push({
                    "time":  moment(timestamp).format("MMM D YYYY, h:mm:ss a"),
                    "level": level,
                    "levelIcon": this.getIconForLevel(level),
                    "displayName":ChangeAnalysisUtilities.prepareDisplayValueForTable(displayName),
                    "description": description == null || description == "" ? "N/A" : description,
                    'oldValue': oldValue,
                    'newValue': newValue,
                    'initiatedBy': initiatedBy == null || initiatedBy == "" ? "N/A" : initiatedBy,
                    'jsonPath': jsonPath,
                    'originalModel': ChangeAnalysisUtilities.prepareValuesForDiffView(oldValue),
                    'modifiedModel': ChangeAnalysisUtilities.prepareValuesForDiffView(newValue),
                    'maxRows': Math.max(this.getNumberOfLines(originalModel.code), this.getNumberOfLines(modifiedModel.code))
                });
            });
            this.tableItems.sort((i1, i2) => i1.level - i2.level);
            this.dataSource = new MatTableDataSource(this.tableItems);
        }
    }

    getHeight(element: Change): string {
        let height: number = element.maxRows * 20;
        height = Math.max(height, 50);
        height = Math.min(height, 250);

        return height + "px";
    }

    private getNumberOfLines(str: string): number {
        return (str.match(/\r|\n|\r\n/g) || []).length + 1;
    }

    private getChangeProperty(row: any[], propertyName: string, changesTable: DataTableResponseObject): any {
        if(row.hasOwnProperty(propertyName)) {
            return row[propertyName];
        } else {
            let propertyIndex = DataTableUtilities.getColumnIndexByName(changesTable, propertyName, true);
            return propertyIndex >= 0 ? row[propertyIndex] : null;
        }
    }

    private getIconForLevel(level: ChangeLevel): string {
        switch(level){
            case ChangeLevel.Normal:
                return this.changeLevelIcon[0].imgSrc;
            case ChangeLevel.Important:
                return this.changeLevelIcon[1].imgSrc;
            case ChangeLevel.Noisy:
                return this.changeLevelIcon[2].imgSrc;
            default:
                return this.changeLevelIcon[0].imgSrc;
        }
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    getFeedbackButtonClass(changeItem: Change, isHelpfulButton: boolean): string[] {
        let classNames: string[] = ["feedback-button"];

        let feedbackProvided = this._changeFeedbacks.has(changeItem);
        if (feedbackProvided) {
            classNames.push("disabled");

            let changeHelpful = this._changeFeedbacks.get(changeItem);
            if ((isHelpfulButton && !changeHelpful)
                || (!isHelpfulButton && changeHelpful)) {
                classNames.push("greyed-out");
            }
        }

        return classNames;
    }

    sendFeedback(changeItem: Change, isHelpful: boolean): void {
        let feedbackProvided = this._changeFeedbacks.has(changeItem);
        if (feedbackProvided) {
            return;
        }

        this._changeFeedbacks.set(changeItem, isHelpful);

        let eventProps = {
            'isHelpful': isHelpful.toString(),
            'changeLevel': changeItem.level,
            'dataSource': ChangeAnalysisUtilities.getDataSourceFromChangesetId(this.changesetId),
            'displayName': changeItem.displayName,
            'jsonPath': changeItem.jsonPath,
            'changeTimestamp': changeItem.time,
            'oldValueLength': changeItem.originalModel.code.length.toString(),
            'newValueLength': changeItem.modifiedModel.code.length.toString()
        };
        this.logEvent(TelemetryEventNames.ChangeAnalysisChangeFeedbackClicked, eventProps);
   }
}

