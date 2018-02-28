import { Component, Injector, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IChatMessageComponent } from '../../interfaces/ichatmessagecomponent';
import { MessageProcessor } from '../../message-processor.service';
import { TextMessage } from '../../models/message';
import { BotLoggingService } from '../../../shared/services/logging/bot.logging.service';
import { MessageSender } from '../../models/message-enums';

@Component({
    templateUrl: 'feedback.component.html'
})
export class FeedbackComponent implements OnInit, AfterViewInit, IChatMessageComponent {

    @Output() onViewUpdate = new EventEmitter();
    @Output() onComplete = new EventEmitter<{ status: boolean, data?: any }>();

    showComponent: boolean;
    feedbackMessage: string;

    constructor(private _injector: Injector, private _msgProcessor: MessageProcessor, private _logger: BotLoggingService) {
        this.showComponent = true;
        this.feedbackMessage = '';
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.onViewUpdate.emit();
    }

    onSubmit(): void {
        if (this.feedbackMessage !== '') {
            this.showComponent = false;
            this._logger.LogFeedbackMessage(this.feedbackMessage, 'Support Home');
            this._msgProcessor.addMessageToCurrentGroup(new TextMessage(this.feedbackMessage, MessageSender.User, 300));
            this.onComplete.emit({
                status: true,
                data: {
                    feedbackMessage: this.feedbackMessage
                }
            });
        }
    }
}
