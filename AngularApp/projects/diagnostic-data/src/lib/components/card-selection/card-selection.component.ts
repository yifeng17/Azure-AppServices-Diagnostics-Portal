import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DiagnosticData } from '../../models/detector';
import { DiagnosticService } from '../../services/diagnostic.service';
import { FeatureNavigationService } from '../../services/feature-navigation.service';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';

export class CardSelection {
  title: string;
  descriptions: string[];
  icon: string;
  linkType: CardActionType;
  linkValue: string;
}

export enum CardActionType {
    Detector,
    Tool
}

@Component({
  selector: 'card-selection',
  templateUrl: './card-selection.component.html',
  styleUrls: ['./card-selection.component.scss']
})
export class CardSelectionComponent extends DataRenderBaseComponent {

  cardSelections: CardSelection[] = [];

  constructor(private _diagnosticService: DiagnosticService, private _router: Router,
    private _activatedRoute: ActivatedRoute, protected telemetryService: TelemetryService, private _navigator: FeatureNavigationService) {
    super(telemetryService);
  }

  protected processData(data: DiagnosticData) {
    super.processData(data);

    data.table.rows.map(row => {
      this.cardSelections.push(<CardSelection>{
        title: row[0],
        descriptions: JSON.parse(row[2]),
        icon: 'fa-bar-chart',
        linkType: parseInt(row[3]),
        linkValue: row[4]
      });
    })
  }

  public selectCard(card: CardSelection) {
    if (card && card.linkType === CardActionType.Detector) {
      this._navigator.NavigateToDetector(this._activatedRoute.snapshot.params['detector'], card.linkValue);
    }
  }
}
