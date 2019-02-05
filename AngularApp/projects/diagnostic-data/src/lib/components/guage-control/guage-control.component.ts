import { Component, OnInit, Input } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { DataTableResponseObject, Rendering, DiagnosticData, HealthStatus } from '../../models/detector';
import { GuageGraphic, GuageSize, GuageElement, GuageRenderDirection, GuageControl } from '../../models/guage';

@Component({
  selector: 'guage-control',
  templateUrl: './guage-control.component.html',
  styleUrls: ['./guage-control.component.scss']
})
export class GuageControlComponent extends DataRenderBaseComponent {
  InsightStatus = HealthStatus;
  guage: GuageControl;
  renderingProperties: Rendering;

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = data.renderingProperties;
    this.parseData(data.table);
  }

  public isVertical(renderDirection: GuageRenderDirection): boolean {
    return renderDirection === GuageRenderDirection.Vertical;
  }

  public isHorizontal(renderDirection: GuageRenderDirection): boolean {
    return renderDirection === GuageRenderDirection.Horizontal;
  }

  private parseData(table: DataTableResponseObject) {
    //Parse the incoming data from the detector backend to create the Guages Array and then initiaze the guage object
    const renderDirectionColumn = 0;
    const masterSizeColumn = 1;
    const sizeColumn = 2;
    const fillColorColumn = 3;
    const percentFilledColumn = 4;
    const displayValueColumn = 5;
    const labelColumn = 6;
    const descriptionColumn = 7;

    if (!(table.rows === undefined || table.rows.length < 1)) {
      this.guage = new GuageControl();
      this.guage.renderDirection = table.rows[0][renderDirectionColumn];
      this.guage.guageSize = table.rows[0][masterSizeColumn];
      this.guage.guages = [];

      var currFillColor: HealthStatus;
      for (let i: number = 0; i < table.rows.length; i++) {
        const row = table.rows[i];

        switch (row[fillColorColumn]) {
          case this.InsightStatus.Critical:
            currFillColor = HealthStatus.Critical;
            break;
          case this.InsightStatus.Warning:
            currFillColor = HealthStatus.Warning;
            break;
          case this.InsightStatus.Success:
            currFillColor = HealthStatus.Success;
            break;
          default:
            currFillColor = HealthStatus.Info;
            break;
        }

        this.guage.guages[i] = new GuageElement(
          new GuageGraphic(currFillColor, row[percentFilledColumn], row[displayValueColumn], row[labelColumn], row[sizeColumn])
          , row[descriptionColumn]);
      }

      //Make sure that the size of each individual Guage Graphic element passed to this object matches the desired size of the parent GuageControl
      if (this.guage.guageSize != GuageSize.Inherit) {
        for (var i = 0; i < this.guage.guages.length; i++) {
          this.guage.guages[i].guageGraphicElement.setGuageParameters(
            this.guage.guages[i].guageGraphicElement.fillColor,
            this.guage.guages[i].guageGraphicElement.percentFilled,
            this.guage.guages[i].guageGraphicElement.numberDisplay,
            this.guage.guages[i].guageGraphicElement.label,
            this.guage.guageSize
          );
        }
      }
    }
  }
}
