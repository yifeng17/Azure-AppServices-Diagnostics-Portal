import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { TelemetryEventNames } from '../../services/telemetry/telemetry.common';

@Component({
  selector: 'feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  @Input() ratingEventProperties: any;
  @Output() submit: EventEmitter<boolean> = new EventEmitter<boolean>();
  showThanksMessage: boolean = false;
  rating: number = 0;
  comments: string = 'Start Rating';
  feedbackText: string;

  hideWholeForm: boolean;
  showTextBox: boolean;
  yesSelected: boolean;
  noSelected: boolean;
  showMessageBox: boolean = false;
  showFeedbackForm: boolean = false;
  cancelClicked: boolean = false;

  constructor(protected telemetryService: TelemetryService) {
  }

  ngOnInit() {
  }


    @Input() source: string;

    expandFeedbackForm() {
      this.showFeedbackForm = true;
      this.showThanksMessage = false;
    }

    feedbackButtonClicked(helpful: boolean) {
        this.yesSelected = helpful;
        this.noSelected = !helpful;
     //   this._logger.LogFeedback(this.source, helpful);
        if (this.yesSelected) {
            this.showThanksMessage = true;
        } else {
            this.showMessageBox = true;
        }
    }

    cancelButtonClicked() {
      //this.cancelClicked = true;
      this.showFeedbackForm = false;
      this.comments = "Start Rating";
      this.feedbackText = "";
    }
  
    setStar(data: any, comments?: any) {
      this.rating = data;
      this.comments = comments;
    }
  
    public feedbackMessageSubmitted() {
      const eventProps = {
        Rating: String(this.rating),
        Feedback: this.feedbackText
      };

      this.showThanksMessage = true;
      this.showFeedbackForm = false;
      this.logEvent(TelemetryEventNames.StarRatingSubmitted, eventProps);
      this.submit.emit(this.showThanksMessage);
      this.comments = "Start Rating";
      this.feedbackText = "";
    //   setTimeout(() => {
    //     this.showThanksMessage = false;
    //     this.showFeedbackForm = false;
    // }, 2000);
    }
  
    protected logEvent(eventMessage: string, eventProperties?: any, measurements?: any) {
      for (const id of Object.keys(this.ratingEventProperties)) {
        if (this.ratingEventProperties.hasOwnProperty(id)) {
          eventProperties[id] = String(this.ratingEventProperties[id]);
        }
      }
      this.telemetryService.logEvent(eventMessage, eventProperties, measurements);
    }

}

