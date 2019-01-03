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
  comments: string = 'Start your rating.';
  feedbackText: string;

  hideWholeForm: boolean;
  showTextBox: boolean;
  yesSelected: boolean;
  noSelected: boolean;
  showMessageBox: boolean = false;
  showFeedbackForm: boolean = false;


  constructor(protected telemetryService: TelemetryService) {
  }

  ngOnInit() {
  }


    @Input() source: string;

    expandFeedbackForm() {
      this.showFeedbackForm = !this.showFeedbackForm;
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

    // feedbackMessageSubmitted() {
    //   //  this._logger.LogFeedbackMessage(this.source, this.feedbackText);
    //     this.showMessageBox = false;
    //     this.showThanksMessage = true;

        // setTimeout(() => {
        //     this.hideWholeForm = true;
        // }, 2000);
    // }


  
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
      this.logEvent(TelemetryEventNames.StarRatingSubmitted, eventProps);
      this.submit.emit(this.showThanksMessage);

    //   setTimeout(() => {
    //     this.hideWholeForm = true;
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

