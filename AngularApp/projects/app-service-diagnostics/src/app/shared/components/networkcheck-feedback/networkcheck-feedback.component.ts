import { Component, AfterViewInit, ViewChild, TemplateRef, AfterContentInit, OnInit, OnDestroy, Input } from '@angular/core';
import { DirectionalHint, ICheckProps, IPanelProps, PanelType } from 'office-ui-fabric-react';
import { TelemetryService, TelemetryEventNames, PIIUtilities, TelemetrySource } from 'diagnostic-data';
import { Globals } from '../../../globals';
import { ActivatedRoute } from '@angular/router';
import * as momentNs from 'moment';
import { Guid } from '../../../shared/utilities/guid';


@Component({
  selector: 'networkcheck-feedback',
  templateUrl: './networkcheck-feedback.component.html',
  styleUrls: ['./networkcheck-feedback.component.scss']
})
export class NetworkCheckFeedbackComponent implements AfterViewInit, OnInit,OnDestroy {
  
  @Input() openFeedback: boolean;
  hideOverlay = true;
  type: PanelType = PanelType.custom;
  siteName: string = "";
  ratingEventProperties: any;
  feedbackText: string = "- What was the issue?\r\n\r\n\r\n" +
    "- If the issue was not resolved, what can be the reason?\r\n\r\n\r\n" + 
    "- What else do you expect from this tool?\r\n";
  panelWidth: string = "315px";
  feedbackIcons: { id: string, text: string }[] =
    [
      {
        id: "Sad",
        text: "dissatisfied "
      },
      {
        id: "EmojiNeutral",
        text: "ok"
      },
      {
        id: "Emoji2",
        text: "satisfied"
      }
    ];
  submitted: boolean = false;
  rating: number = 0;
  issueResolved: boolean = null;
  checked: boolean = true;
  submittedPanelTimer: any = null;
  checkLabel: string = "Microsoft can email you about your feedback";
  tooltipDirectionalHint = DirectionalHint.rightBottomEdge;

  submittedPanelStyles: IPanelProps["styles"] = {
    root: {
      height: "120px"
    }
  }
  currentTime: string = "";
  constructor(protected telemetryService: TelemetryService, public globals: Globals, private activatedRoute: ActivatedRoute) { }

  submitFeedback() {
    const eventProps = {
      IssueResolved: String(this.issueResolved),
      Rating: String(this.rating),
      Feedback: PIIUtilities.removePII(this.feedbackText)
    };
    const detectorName = this.globals.getDetectorName();
    const isHomepage = !this.activatedRoute.root.firstChild.firstChild.firstChild.firstChild.snapshot.params["category"];
    this.ratingEventProperties = {
      'DetectorId': detectorName,
      'Url': window.location.href,
      'Location': isHomepage ? TelemetrySource.LandingPage : TelemetrySource.CategoryPage,
      'MayContact': this.checked,
      'FeedbackId': Guid.newShortGuid()
    };
    this.logEvent("NetworkCheck.Feedback", eventProps);
    
    this.reset();
    this.submitted = true;
  }

  setRating(index: number) {
    this.rating = index + 1;
  }

  setResolved(isResovled: boolean){
    this.issueResolved = isResovled;
  }

  protected logEvent(eventMessage: string, eventProperties?: any, measurements?: any) {
    for (const id of Object.keys(this.ratingEventProperties)) {
      if (this.ratingEventProperties.hasOwnProperty(id)) {
        eventProperties[id] = String(this.ratingEventProperties[id]);
      }
    }
    this.telemetryService.logEvent(eventMessage, eventProperties, measurements);
  }

  ngOnInit() {
    this.reset();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const eles = document.querySelectorAll("#feedback-icons i");
      if (eles && eles.length > 0) {
        eles.forEach((ele, index) => {
          ele.setAttribute("role", "button");
          ele.setAttribute("name", this.feedbackIcons[index].text);
        });
      }
    });
  }

  reset() {
    this.openFeedback = false;
    this.hideOverlay = true;
  }


  dismissedFeedbackHandler() {
    this.reset();
  }

  dismissedSubmittedHandler() {
    this.submitted = false;
  }

  onOpenSubmittedPanel() {
    this.currentTime = momentNs(Date.now()).format("hh:mm A");
    this.submittedPanelTimer = setTimeout(() => {
      this.dismissedSubmittedHandler();
    },3000);
  }

  onOpenFeedbackPanel() {
    this.openFeedback = true;
    this.hideOverlay = true;
    this.siteName = this.activatedRoute.root.firstChild.firstChild.snapshot.params['resourcename'];
  }

  onOpened() {
    if(this.globals.openFeedback){
      this.globals.openFeedback = false;
      this.hideOverlay = false;
    }
  }

  ngOnDestroy() {
    this.submittedPanelTimer = null;
  }
}
