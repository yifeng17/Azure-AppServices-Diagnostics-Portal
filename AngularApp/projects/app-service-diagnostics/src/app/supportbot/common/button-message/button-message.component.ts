import { Component, Injector, OnInit, AfterViewInit, Output, EventEmitter, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IChatMessageComponent } from '../../interfaces/ichatmessagecomponent';
import { BotLoggingService } from '../../../shared/services/logging/bot.logging.service';
import { ButtonActionType, MessageSender } from '../../models/message-enums';
import { CategoryChatStateService } from '../../../shared-v2/services/category-chat-state.service';
import { Globals } from '../../../globals';
import { TextMessage } from '../../models/message';
import { FeedbackMessage } from '../../message-flow/feedback/feedbackmessageflow';

@Component({
    templateUrl: 'button-message.component.html'
})
export class ButtonMessageComponent implements OnInit, AfterViewInit, IChatMessageComponent {

    buttonList: { title: string, type: ButtonActionType, next_key: string }[] = [];
    showComponent: boolean = true;
    context: string;
    category: string;

    @Output() onViewUpdate = new EventEmitter();
    @Output() onComplete = new EventEmitter<{ status: boolean, data?: any }>();

    constructor(protected injector: Injector, protected _logger: BotLoggingService,protected globals: Globals, @Optional() protected _chatState?: CategoryChatStateService) {
    }

    ngOnInit(): void {
        const buttons = <{ title: string, type: ButtonActionType, next_key: string }[]>this.injector.get('buttonList', []);
        buttons.forEach(button => {
            this.buttonList.push(button);
        });

        const context = this.injector.get('context', '');

        if (context === 'feature' && this._chatState && this._chatState.selectedFeature) {
            this.context = `${context}:${this._chatState.selectedFeature.id}`;
        } else {
            this.context = context;
        }

        this.category = this.injector.get('category', '');
    }

    ngAfterViewInit(): void {
        this.onViewUpdate.emit();
    }

    onClick(item: any) {
        this.showComponent = false;
        this._logger.LogClickEvent(item.title, this.context, this.category);

        if (item.type === ButtonActionType.GetFeedback)
        {
            console.log("Feedback button onclick", item);
            if (item.title.toLowerCase() === "yes")
            {
                console.log("Feedback button yes onclick", item);
                 this.globals.messages.push(new TextMessage('Great to hear! From 1 to 5 stars, how helpful was this?', MessageSender.System, 500));
                // this.globals.messages.push(new FeedbackMessage([], 'Submit and Show Tile Menu', 'Feedback', "Availbiliy and Performance"));
             }
            else
            {
                console.log("Feedback button no onclick", item);
                 this.globals.messages.push(new TextMessage('Sorry to hear! Could you let us know how we can improve?', MessageSender.System, 500));
            //     this.globals.messages.push(new FeedbackMessage([], 'Submit and Show Tile Menu', 'Feedback', "Availbiliy and Performance"));
            // }
        }
        this.onComplete.emit({ status: true, data: item });
    }
}
}
