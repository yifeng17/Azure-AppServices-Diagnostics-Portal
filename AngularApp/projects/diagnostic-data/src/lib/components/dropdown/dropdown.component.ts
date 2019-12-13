import { Component } from '@angular/core';
import { DataTableResponseObject, DiagnosticData, Rendering } from '../../models/detector';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { IDropdownOption } from 'office-ui-fabric-react';

enum DropdownType{
  Legacy,
  Fabric
}

enum DropdownPosition {
  FloatLeft,
  FloatRight
}

@Component({
  selector: 'diag-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent extends DataRenderBaseComponent {

  renderingProperties: Rendering;
  label: string;
  selectedKey: string;
  selectedData: DiagnosticData[];
  keys: string[];
  options:IDropdownOption[] = [];
  dropdownPostion: DropdownPosition = DropdownPosition.FloatRight;
  dropdownType: DropdownType = DropdownType.Legacy;
  Type = DropdownType;
  Position = DropdownPosition;
  private keyDataMapping: Map<string, DiagnosticData[]>;

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = data.renderingProperties;
    this.parseData(data.table);
  }

  private parseData(table: DataTableResponseObject) {

    const labelColumn = 0;
    const keyColumn = 1;
    const selectedColumn = 2;
    const valueColumn = 3;
    const dropdownTypeColumn = 4;
    const dropdownPosColumn = 5;

    this.keyDataMapping = new Map<string, DiagnosticData[]>();

    for (let i: number = 0; i < table.rows.length; i++) {

      const row = table.rows[i];
      this.label = row[labelColumn];
      const key: string = row[keyColumn];
      const selected: boolean = row[selectedColumn];
      const data: string = row[valueColumn];
      const rawJson: any = JSON.parse(data);
      const diagnosticDataList: DiagnosticData[] = <DiagnosticData[]>rawJson;
      
      const dropdownTypeStr:string = row[dropdownTypeColumn];
      this.dropdownType = DropdownType[dropdownTypeStr];

      const dropdownPosStr:string = row[dropdownPosColumn];
      this.dropdownPostion = DropdownPosition[dropdownPosStr];

      this.keyDataMapping.set(key, diagnosticDataList);

      if (selected === true) {
        this.selectedKey = key;
        this.selectedData = diagnosticDataList;
      }
    }

    this.keys = Array.from(this.keyDataMapping.keys());

    this.keys.forEach(k => {
      this.options.push({ key : k, text : k }); 
    });
  }

  selectKey(key: string) {
    this.selectedKey = key;
    this.selectedData = this.keyDataMapping.get(this.selectedKey);
  }

  selectFabricKey(key: {option: IDropdownOption}) {
    this.selectedKey = key.option.text;
    this.selectedData = this.keyDataMapping.get(this.selectedKey);
  }
}
