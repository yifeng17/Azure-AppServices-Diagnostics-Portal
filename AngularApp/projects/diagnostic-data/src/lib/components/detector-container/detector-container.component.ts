import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DiagnosticService } from '../../services/diagnostic.service';
import { DetectorControlService } from '../../services/detector-control.service';
import { DetectorCommandService } from '../../services/detector-command.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { DetectorResponse, RenderingType } from '../../models/detector';
import { BehaviorSubject } from 'rxjs';
import { VersionService } from '../../services/version.service';

@Component({
  selector: 'detector-container',
  templateUrl: './detector-container.component.html',
  styleUrls: ['./detector-container.component.scss']
})
export class DetectorContainerComponent implements OnInit {

  detectorResponse: DetectorResponse = null;
  error: any;
  @Input() hideDetectorControl: boolean = false;
  hideTimerPicker: boolean = false;

  detectorName: string;

  @Input() detectorSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  @Input() set detector(detector: string) {
    this.detectorSubject.next(detector);
  }

  @Input() analysisMode:boolean = false;
  @Input() isAnalysisView:boolean = false;
  isCategoryOverview:boolean = false;
  detectorResSubscription: any;
  private isLegacy:boolean
  constructor(private _route: ActivatedRoute, private _diagnosticService: DiagnosticService,
    public detectorControlService: DetectorControlService, private detectorCommandService: DetectorCommandService, private versionService:VersionService) { }


  ngOnInit() {
    // let guid = Guid.newGuid();
    // console.log("new guid", guid);
    console.info("Entering ngoninit");
    this.versionService.isLegacySub.subscribe(isLegacy => this.isLegacy = isLegacy);
    //Remove after A/B Test
    if (this.isLegacy) {
      this.hideTimerPicker = false;
    } else {
      this.hideTimerPicker= this.hideDetectorControl || this._route.snapshot.parent.url.findIndex((x: UrlSegment) => x.path === "categories") > -1;
    }
    
    // this.detectorResSubscription = this.detectorControlService.update.subscribe(isValidUpdate => {
    //   console.log("detectorcontaine: isValidUpate, this.detectorName", isValidUpdate, this.detectorName);
    //   if (isValidUpdate && this.detectorName) {
    //     console.log("detectorcontaine: starts refresh");
    //     this.refresh();
    //   }
    // });

    this.detectorSubject.subscribe(detector => {
      if (detector && detector !== "searchResultsAnalysis") {
        this.detectorName = detector;
        this.refresh();
     //   this.startSubscribingToRefresh();
      }
    });

    const component:any = this._route.component; 
    if (component && component.name) {
      this.isCategoryOverview = component.name === "CategoryOverviewComponent";
    }
  }

  private startSubscribingToRefresh()
  {
    if (this.detectorResSubscription)
    {
      this.detectorResSubscription.unsubscribe();
    }
    console.info("In detector view, calling resetRefresBehaviorSubject() in detector control service");

    this.detectorControlService.resetRefresBehaviorSubject();
    this.detectorResSubscription = this.detectorControlService.update.subscribe(isValidUpdate => {
     // console.log("detectorcontaine: isValidUpate, this.detectorName", isValidUpdate, this.detectorName);
     console.info(`In detector View : ${this.detectorName}, got isValidUpdate: ${isValidUpdate} from detector control service`);
      if (isValidUpdate && this.detectorName) {
        console.info(`In detector View : ${this.detectorName}, triggering refresh`);
        this.refresh();
      }
    });
  }



  refresh() {
    this.error = null;
    this.detectorResponse = null;
    console.log("detectorcontainer: refresh(), calling getDetectorResponse");
    this.getDetectorResponse();
  }

  getDetectorResponse() {
      let allRouteQueryParams = this._route.snapshot.queryParams;
      let additionalQueryString = '';
      let knownQueryParams = ['startTime', 'endTime'];
      Object.keys(allRouteQueryParams).forEach(key => {
        if(knownQueryParams.indexOf(key) < 0) {
            additionalQueryString += `&${key}=${encodeURIComponent(allRouteQueryParams[key])}`;
        }
      });
     this._diagnosticService.getDetector(this.detectorName, this.detectorControlService.startTimeString, this.detectorControlService.endTimeString,
      true,  this.detectorControlService.isInternalView, additionalQueryString)
      .subscribe((response: DetectorResponse) => {
        console.log("detectorcontainer calling getDetectorResponse",additionalQueryString,  response);
        this.shouldHideTimePicker(response);
        this.detectorResponse = response;
      }, (error: any) => {
        this.error = error;
      });
  }

  // TODO: Right now this is hardcoded to hide for cards, but make this configurable from backend
  shouldHideTimePicker(response: DetectorResponse) {
    if (response && response.dataset && response.dataset.length > 0) {
      const cardRenderingIndex = response.dataset.findIndex(data => data.renderingProperties.type == RenderingType.Cards);

      //Remove after A/B Test
      if (this.isLegacy) {
        this.hideDetectorControl = cardRenderingIndex >= 0;
      } else {
        this.hideDetectorControl = cardRenderingIndex >= 0 || this.hideDetectorControl;
      }
      
    }
  }

  
  ngOnDestroy(): void {
    console.log("destroying detector container for:", this.detectorName);
    if (this.detectorResSubscription) {
        this.detectorResSubscription.unsubscribe();
    }

  }
}
