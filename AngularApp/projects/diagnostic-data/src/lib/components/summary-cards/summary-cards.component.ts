import { Component, OnInit, Inject } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { HealthStatus, DiagnosticData } from '../../models/detector';
import { FeatureNavigationService } from '../../services/feature-navigation.service';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../../config/diagnostic-data-config';

export interface SummaryCard {
  title: string,
  message: string,
  description: string,
  status: HealthStatus,
  link: string,
  actionType: ActionType
}

export enum ActionType {
  Detector,
  Tool,
  None
}

@Component({
  selector: 'summary-cards',
  templateUrl: './summary-cards.component.html',
  styleUrls: ['./summary-cards.component.scss']
})
export class SummaryCardsComponent extends DataRenderBaseComponent {
  summaryCards: SummaryCard[] = [];
  SummaryStatus = HealthStatus;
  isPublic: boolean;
  clickable:boolean[];
  constructor(protected _telemetryService: TelemetryService, private _activatedRoute: ActivatedRoute, private _router: Router, @Inject(DIAGNOSTIC_DATA_CONFIG) config: DiagnosticDataConfig, private _navigator: FeatureNavigationService) {
    super(_telemetryService);
    this.isPublic = config && config.isPublic;
  }

  protected processData(data: DiagnosticData) {
    super.processData(data);

    const statusColumn = 0;
    const titleColumn = 1;
    const messageColumn = 2;
    const descriptionColumn = 3;
    const linkColumn = 4;
    const actionTypeColumn = 5

    const rows = data.table.rows;
    rows.forEach(row => {
      let status: string = row[statusColumn];
      let actionType: string = row[actionTypeColumn];
      this.summaryCards.push(
        <SummaryCard>{
          title: row[titleColumn],
          message: row[messageColumn],
          description: row[descriptionColumn],
          link: row[linkColumn],
          status: HealthStatus[status],
          actionType: ActionType[actionType]
        });
      this.clickable = this.checkClickable(this.summaryCards);
    });

  }


  checkClickable(cards:SummaryCard[]):boolean[] {
    return cards.map(card => {
      if (card.actionType !== ActionType.None && card.link !== "") {
        return true;
      }
      return false;
    });
  }

  //Todo: Add Tool type Navigation
  onClickCard(card: SummaryCard): void {
    switch (card.actionType) {
      case ActionType.Detector:
        this.navigateToDetector(card);
        break;
      case ActionType.None:
        break;
      default:
        break;
    }
  }

  navigateToDetector(card: SummaryCard): void {
    if (this.isPublic) {
      //In Category OverView Page of external UI
      this._router.navigate([`../../../detectors/${card.link}`], { relativeTo: this._activatedRoute, queryParamsHandling: 'merge' });
    } else {
      this._navigator.NavigateToDetector(this._activatedRoute.snapshot.params['detector'], card.link);
    }
  }

}
