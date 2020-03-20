import { Component, HostListener } from "@angular/core";
import { Feature } from "../../../shared-v2/models/features";
import { FeatureService } from "../../../shared-v2/services/feature.service";
import { LoggingV2Service } from "../../../shared-v2/services/logging-v2.service";
import { NotificationService } from "../../../shared-v2/services/notification.service";
import { Globals } from "../../../globals";
import { icons } from "../../icons-constants";

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
  isEscape: boolean = false;
  get inputAriaLabel(): string {
    const resultCount = this.features.length;
    if (this.searchValue === "") {
      return "";
    } else if (resultCount >= 1) {
      return resultCount > 1 ? `${resultCount} Results` : `${resultCount} Result`;
    } else {
      return `No results were found.`;
    }
  }

  @HostListener('mousedown', ['$event.target'])
  onClick(ele: HTMLElement) {
    //If is cross icon in search box
    if ((ele.tagName === "DIV" && ele.className.indexOf("ms-SearchBox-clearButton") > -1) ||
      (ele.tagName === "BUTTON" && ele.className.indexOf("ms-Button--icon") > -1) ||
      (ele.tagName === "DIV" && ele.className.indexOf("ms-Button-flexContainer") > -1) ||
      (ele.tagName === "I" && ele.className.indexOf("ms-Button-icon") > -1)) {
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
    private _notificationService: NotificationService, private globals: Globals) {
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
    //get element which type is input,class has ms-SearchBox-field,placeholder=Search
    const input: any = document.querySelector("input.ms-SearchBox-field[placeholder=Search]");
    input.autocomplete = "off";
  }

  clearSearch() {
    this.searchValue = "";
    this.features = this.featureService.getFeatures(this.searchValue);
  }

  clearSearchWithKey() {
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
  openGeniePanel() {
    this.isEscape = true;
    this.globals.openGeniePanel = true;
  }

  generateIconImagePath(name: string) {
    const basePath = "../../../../assets/img/detectors";
    const fileName = icons.has(name) ? name : 'default';
    return `${basePath}/${fileName}.svg`;
  }
}
