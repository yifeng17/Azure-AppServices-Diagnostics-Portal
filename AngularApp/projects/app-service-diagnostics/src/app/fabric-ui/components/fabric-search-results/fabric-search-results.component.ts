import { Component, HostListener } from "@angular/core";
import { Feature } from "../../../shared-v2/models/features";
import { FeatureService } from "../../../shared-v2/services/feature.service";
import { LoggingV2Service } from "../../../shared-v2/services/logging-v2.service";
import { NotificationService } from "../../../shared-v2/services/notification.service";

enum BlurType {
  //click other place to close panel
  Blur,
  //use tab or cross icon(on right) will not trigger blur
  None
}
@Component({
  selector: 'fabric-search-results',
  templateUrl: './fabric-search-results.component.html',
  styleUrls: ['./fabric-search-results.component.scss']
})
export class FabricSearchResultsComponent {

  searchValue: string = "";
  resultCount: number;
  features: Feature[] = [];
  searchLogTimout: any;
  showSearchResults: boolean;
  clickSearchBox: BlurType = BlurType.Blur;
  //Only ture when press ESC and no word in search box,collapse search result.
  isEscape:boolean = false;
  get inputAriaLabel(): string {
    const resultCount = this.features.length;
    if (this.searchValue === "") {
      return "";
    } else if (resultCount > 1) {
      return `${resultCount} Results`;
    } else {
      return `${resultCount} Result`;
    }
  }

  @HostListener('mousedown', ['$event.target'])
  onClick(ele: HTMLElement) {
    //If is cross icon in search box
    if ((ele.tagName === "DIV" && ele.className.indexOf("ms-SearchBox-clearButton") > -1) ||
        (ele.tagName === "BUTTON" && ele.className.indexOf("ms-Button--icon") > -1) ||
        (ele.tagName === "DIV" && ele.className.indexOf("ms-Button-flexContainer") > -1) ||
        (ele.tagName === "I" && ele.className.indexOf("ms-Button--icon") > -1)) {
      this.clickSearchBox = BlurType.None;
    } else {
      this.clickSearchBox = BlurType.Blur;
    }
  }

  @HostListener('keydown.Tab', ['$event.target'])
  onKeyUp(ele: HTMLElement) {
    if (ele.tagName === "INPUT" || (ele.tagName === "BUTTON" && ele.className.indexOf("ms-Button--icon") > -1) && this.features.length > 0) {
      this.clickSearchBox = BlurType.None;
    }
    //After go over last search result or no result,collapse results
    else if (this.features.length > 0 && ele.innerText.includes(this.features[this.features.length - 1].name) || (ele.tagName === "BUTTON" && ele.className.indexOf("ms-Button--icon") > -1 && this.features.length === 0)) {
      this.clickSearchBox = BlurType.Blur;
      this.onBlurHandler();
    }
    else {
      this.clickSearchBox = BlurType.Blur;
    }
  }


  constructor(public featureService: FeatureService, private _logger: LoggingV2Service,
    private _notificationService: NotificationService) {
    // this.features = this.featureService.getFeatures(this.searchValue);
  }

  navigateToFeature(feature: Feature) {
    this._notificationService.dismiss();
    this._logSearchSelection(feature);
    feature.clickAction();
  }

  private _logSearch() {
    this._logger.LogSearch(this.searchValue);
  }

  private _logSearchSelection(feature: Feature) {
    this._logSearch();
    this._logger.LogSearchSelection(this.searchValue, feature.id, feature.name, feature.featureType.name);
  }

  updateSearchValue(searchValue: { newValue: string }) {
    this.showSearchResults = !this.isEscape;
    this.searchValue = searchValue.newValue;

    if (this.searchLogTimout) {
      clearTimeout(this.searchLogTimout);
    }

    this.searchLogTimout = setTimeout(() => {
      this._logSearch();
    }, 5000);
    this.features = this.featureService.getFeatures(this.searchValue);
    this.isEscape = false;
  }

  onSearchBoxFocus() {
    this.showSearchResults = true;
    this.features = this.featureService.getFeatures(this.searchValue);

    //Disable AutoComplete
    const input: any = document.getElementById("SearchBox1");
    input.autocomplete = "off";
  }

  clearSearch() {
    this.searchValue = "";
    this.features = this.featureService.getFeatures(this.searchValue);
  }

  clearSrarchWithKey() {
    //only true when trigger ESC
    this.isEscape = this.searchValue === "";
  }

  onBlurHandler() {
    switch (this.clickSearchBox) {
      case BlurType.Blur:
        this.clearSearch();
        this.showSearchResults = false;
        break;
      case BlurType.None:
        this.clickSearchBox = BlurType.Blur;
        break;
      default:
        break;
    }
  }
}
