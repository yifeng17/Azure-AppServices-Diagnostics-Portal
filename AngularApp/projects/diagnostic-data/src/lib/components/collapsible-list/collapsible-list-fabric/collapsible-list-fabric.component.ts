import { Component, OnInit, Input, ContentChildren, QueryList } from '@angular/core';
import { TelemetryService } from '../../../services/telemetry/telemetry.service';
import { CollapsibleListItemComponent } from '../collapsible-list-item.component';

@Component({
  selector: 'collapsible-list-fabric',
  templateUrl: './collapsible-list-fabric.component.html',
  styleUrls: ['./collapsible-list-fabric.component.scss']
})
export class CollapsibleListFabricComponent {

  @Input() title: string;
  @Input() collapsed: boolean;
  @Input() lessMargin: boolean = false;
  @Input() iconProps: any = null;

  @ContentChildren(CollapsibleListItemComponent) listItemComponents: QueryList<CollapsibleListItemComponent>;

  constructor(private telemetryService:TelemetryService) {
  }

  clickHandler() {
    this.telemetryService.logEvent("ClickCollapsibleList",{
      "CurrentState" : this.collapsed ? "Collapse" : "Expand",
      "Title": this.title
    });
    this.collapsed = !this.collapsed;
  }
}
