import { Component, Injector, Input, Output, EventEmitter, OnInit, AfterViewInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IChatMessageComponent } from '../../interfaces/ichatmessagecomponent';
import { MessageProcessor } from '../../message-processor.service';
import { TextMessage } from '../../models/message';
import { BotLoggingService } from '../../../shared/services/logging/bot.logging.service';
import { MessageSender, ButtonActionType } from '../../models/message-enums';
import { ButtonMessageComponent } from '../../common/button-message/button-message.component';
import { CategoryChatStateService } from '../../../shared-v2/services/category-chat-state.service';
import { Globals } from '../../../globals';
import { Subject, Observable } from 'rxjs';
import { TelemetryService, TelemetryEventNames } from 'diagnostic-data';

@Component({
    templateUrl: 'genie-feedback.component.html',
    selector: 'genie-feedback',
    styleUrls: ['./genie-feedback.component.scss']
})
export class GenieFeedbackComponent extends ButtonMessageComponent {
    @Input() ratingEventProperties: any;
  dimissObservable: Observable<void>;
  feedbackText: string = "";
  feedbackIcons: string[] = ["EmojiDisappointed", "Sad", "EmojiNeutral", "Emoji2", "Emoji"];
  submitted: boolean = false;
  rating: number = 0;
    dismissSubject: Subject<void> = new Subject<void>();
    showComponent: boolean;
    feedbackMessage: string;
    constructor(protected telemetryService: TelemetryService, protected _injector: Injector, private _msgProcessor: MessageProcessor, protected _logger: BotLoggingService, protected globals: Globals, @Optional() protected _chatState?: CategoryChatStateService) {
        super(_injector, _logger, globals, _chatState);
        this.showComponent = true;
        this.feedbackMessage = '';
    }

    ngOnInit(): void {
        super.ngOnInit();
        const submit = this._injector.get('submitButtonName', 'Submit');
        this.buttonList.push({
            title: submit,
            next_key: '',
            type: ButtonActionType.Continue
        });
        this.rating = 0;
        this.feedbackText = "";
        this.submitted = false;
        console.log("FabricFeedbackContainerComponent");
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.onViewUpdate.emit();
        }, (500));
    }

    onClick(item: any) {
        if (item.title === 'Submit') {
            this.onSubmit();
        }
        else if (item.title === 'Cancel') {
            this.onCancel();
        }
        else {
            super.onClick(item);
        }
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

    onSubmit(): void {
        if (this.feedbackMessage !== '') {
            this.showComponent = false;
            this._logger.LogFeedbackMessage(this.context, this.feedbackMessage, this.category);
            this.onComplete.emit({
                status: true,
                data: {
                    feedbackCancel: false,
                    feedbackMessage: this.feedbackMessage
                }
            });
        }
    }

    onCancel(): void {
        if (this.feedbackMessage !== '') {
            this.showComponent = false;
            this._logger.LogFeedbackMessage(this.context, this.feedbackMessage, this.category);
            this.onComplete.emit({
                status: true,
                data: {
                    feedbackCancel: true,
                    feedbackMessage: this.feedbackMessage
                }
            });
        }
    }
}
