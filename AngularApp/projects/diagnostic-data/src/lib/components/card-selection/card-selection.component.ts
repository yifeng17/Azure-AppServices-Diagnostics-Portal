import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { TelemetryService } from './../../services/telemetry/telemetry.service';
import { Component } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { DiagnosticService } from '../../services/diagnostic.service';
import { DiagnosticData } from '../../models/detector';

export class CardSelection {
  title: string;
  descriptions: string[];
  icon: string;
  linkType: string;
  linkValue: string;
}

@Component({
  selector: 'card-selection',
  templateUrl: './card-selection.component.html',
  styleUrls: ['./card-selection.component.scss']
})
export class CardSelectionComponent extends DataRenderBaseComponent {

  cardSelections: CardSelection[] = [];

  constructor(private _diagnosticService: DiagnosticService, private _router: Router, 
    private _activatedRoute: ActivatedRoute, protected telemetryService: TelemetryService) {
    super(telemetryService);
  }

  protected processData(data: DiagnosticData) {
    super.processData(data);

    data.table.rows.map(row => {
      this.cardSelections.push(<CardSelection>{
        title: row[0],
        descriptions: JSON.parse(row[3]),
        icon: row[1] != "" ? row[1]: 'fa-bar-chart',
        linkType: row[4],
        linkValue: row[5]
      });
    })
    console.log(this.cardSelections);
  }

  public selectCard(card: CardSelection) {
    if (card && card.linkType.toLowerCase() == 'detector') {
      this._router.navigate([`../${card.linkValue}`, <NavigationExtras>{ relativeTo: this._activatedRoute }])
    }
  }

}
