import { Component, OnInit } from '@angular/core';
import { TelemetryService } from 'diagnostic-data';

@Component({
  selector: 'applens-preview-banner',
  templateUrl: './applens-preview-banner.component.html',
  styleUrls: ['./applens-preview-banner.component.scss']
})
export class ApplensBannerComponent implements OnInit{
  public showBanner: boolean = true;
  private url: URL = new URL(window.location.href);
  private readonly prodHostName = "applens.azurewebsites.net";
  private readonly previewHostName = "applens-preview.azurewebsites.net";
  public isPreview: boolean = false;
  constructor(private _telemetryService:TelemetryService) { }

  ngOnInit() {
  }

  switchView(event:Event) {
    event.stopPropagation();
    const url = this.url;
    this._telemetryService.logEvent("SwitchApplensSlot", {
      currentSlot: this.isPreview ? "Preview": "Prod",
      url: window.location.href
    });

    url.hostname = this.isPreview ? this.prodHostName : this.previewHostName;
    url.port = "";
    window.location.href = url.href;
  }

}
