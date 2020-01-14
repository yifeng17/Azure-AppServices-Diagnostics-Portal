import { Component, OnInit, Input } from '@angular/core';
import { TelemetryService, TelemetryEventNames } from 'diagnostic-data';
 import { Globals } from '../../../globals';
//import { Globals } from 'dist/diagnostic-data/lib/services/genie.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'fabric-feedback-container',
  templateUrl: './fabric-feedback-container.component.html',
  styleUrls: ['./fabric-feedback-container.component.scss']
})
export class FabricFeedbackContainerComponent implements OnInit {
  @Input() ratingEventProperties: any;
  @Input() dimissObservable: Observable<void>;
  feedbackText: string = "";
  feedbackIcons: string[] = ["EmojiDisappointed", "Sad", "EmojiNeutral", "Emoji2", "Emoji"];
  submitted: boolean = false;
  rating: number = 0;

  constructor(protected telemetryService: TelemetryService, public globals: Globals) {
    this.submitted = false;
  }

  submitFeedback() {
    const eventProps = {
      Rating: String(this.rating),
      Feedback: this.feedbackText
    };
    this.logEvent(TelemetryEventNames.StarRatingSubmitted, eventProps);
    console.log(this.rating);
    this.submitted = true;
  }

  setRating(index: number) {
    this.rating = index + 1;
  }

  protected logEvent(eventMessage: string, eventProperties?: any, measurements?: any) {
    for (const id of Object.keys(this.ratingEventProperties)) {
      if (this.ratingEventProperties.hasOwnProperty(id)) {
        eventProperties[id] = String(this.ratingEventProperties[id]);
      }
    }
    this.telemetryService.logEvent(eventMessage, eventProperties, measurements);
  }

  openGenieHandler() {
    this.globals.openFeedback = false;
    this.globals.openGeniePanel = true;
  }

  ngOnInit() {
    this.dimissObservable.subscribe(() => {
      this.rating = 0;
      this.feedbackText = "";
      this.submitted = false;
      console.log("FabricFeedbackContainerComponent");
    });
  }

}
