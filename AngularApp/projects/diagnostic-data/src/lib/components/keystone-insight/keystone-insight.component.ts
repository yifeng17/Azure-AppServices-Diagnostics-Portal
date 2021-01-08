import { Component, Input } from '@angular/core';
import { KeystoneInsight } from '../../models/keystone';

import { DataRenderBaseComponent } from "../data-render-base/data-render-base.component";
import { RenderingType, InsightsRendering, HealthStatus, DiagnosticData, Rendering } from "../../models/detector";
import { Insight, InsightUtils } from "../../models/insight";
import { TelemetryService } from "../../services/telemetry/telemetry.service";
import { TelemetryEventNames } from "../../services/telemetry/telemetry.common";

@Component({
  selector: 'keystone-insight',
  templateUrl: './keystone-insight.component.html',
  styleUrls: ['./keystone-insight.component.scss']
})
export class KeystoneInsightComponent extends DataRenderBaseComponent  {

  @Input() isRecommended: boolean = true;
  keystoneInsight: KeystoneInsight;
  InsightStatus = HealthStatus;
  renderingProperties: Rendering;
  solutionTitleImageSrc: string = "../../../../assets/img/case-submission-flow/Help-and-Support.svg" ;

  constructor(protected telemetryService: TelemetryService) {
    super(telemetryService);
  }

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = <InsightsRendering>data.renderingProperties;
    this.parseKeystoneInsight(data);
  }

  public parseKeystoneInsight(diagnosticData: DiagnosticData) {
    const data = diagnosticData.table;
    console.log("keystoneInsight data", data);

    if (!!data && !!data.rows && data.rows.length > 0 && !!data.rows[0][0])
    {
        const keystoneInsightJsonStr = data.rows[0][0];
        this.keystoneInsight = JSON.parse(keystoneInsightJsonStr);
        console.log("keystoneInsight", this.keystoneInsight);
    }

    // for (let i: number = 0; i < data.rows.length; i++) {
    //     let insight: Insight;
    //     const row = data.rows[i];
    //     const insightName = row[insightColumnIndex];
    //     const nameColumnValue = row[nameColumnIndex];

    //     let solutionsValue = null;
    //     if (solutionsIndex < row.length) {
    //         solutionsValue = <Solution[]>JSON.parse(row[solutionsIndex]);
    //     }

    //     if ((insight = insights.find(ins => ins.title === insightName)) == null) {
    //         const isExpanded: boolean = row.length > isExpandedIndex ? row[isExpandedIndex].toLowerCase() === 'true' : false;
    //         insight = new Insight(row[statusColumnIndex], insightName, isExpanded, solutionsValue);
    //         insights.push(insight);
    //     }

    //     if (nameColumnValue && nameColumnValue.length > 0) {
    //         insight.data[nameColumnValue] = `${row[valueColumnIndex]}`;
    //     }
    // }
}

}
