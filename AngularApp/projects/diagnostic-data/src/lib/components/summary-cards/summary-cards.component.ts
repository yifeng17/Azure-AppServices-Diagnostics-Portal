import { Component, OnInit, Inject } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { HealthStatus, DiagnosticData } from '../../models/detector';
import { FeatureNavigationService } from '../../services/feature-navigation.service';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../../config/diagnostic-data-config';
import { FeatureService } from 'projects/app-service-diagnostics/src/app/shared-v2/services/feature.service';
import { AuthService } from 'projects/app-service-diagnostics/src/app/startup/services/auth.service';

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
  private resourceId:string;
  constructor(protected _telemetryService: TelemetryService, private _activatedRoute: ActivatedRoute, private _router: Router, @Inject(DIAGNOSTIC_DATA_CONFIG) config: DiagnosticDataConfig, private _navigator: FeatureNavigationService,private _featureService:FeatureService,private _authService:AuthService) {
    super(_telemetryService);
    this.isPublic = config && config.isPublic;
    this._authService.getStartupInfo().subscribe(startupInfo => this.resourceId = startupInfo.resourceId);
    console.log("summary card",this._featureService);
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
        this.navigate(card);
        break;
      case ActionType.None:
        break;
      default:
        break;
    }
  }

  navigate(card: SummaryCard): void {
    if (this.isPublic) {
      const category = this._featureService.getCategoryIdByhDetectorId(card.link);
      console.log("summary card link",category);
      this._router.navigateByUrl(`resource${this.resourceId}/categories/${category}/detectors/${card.link}`);
      
    } else {
      this._navigator.NavigateToDetector(this._activatedRoute.snapshot.params['detector'], card.link);
    }
  }
}
