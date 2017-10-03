import { Injectable } from '@angular/core';
import { IMessageFlowProvider } from '../../interfaces/imessageflowprovider';
import { Message, TextMessage } from '../../models/message';
import { MessageGroup } from '../../models/message-group';
import { RegisterMessageFlowWithFactory } from '../message-flow.factory';
import { FeedbackComponent } from './feedback.component';

@Injectable()
@RegisterMessageFlowWithFactory()
export class FeedbackMessageFlow implements IMessageFlowProvider {
    GetMessageFlowList(): MessageGroup[] {
        var messageGroupList: MessageGroup[] = [];

        var feedbackGroup: MessageGroup = new MessageGroup('feedback', [], '');
        feedbackGroup.messages.push(new TextMessage('Please help me improve by providing some feedback. What was my most/least helpful feature? What features would you like to see?'));
        feedbackGroup.messages.push(new FeedbackMessage());
        feedbackGroup.messages.push(new TextMessage('Thank you!'));
        // TODO : Add Button Message - 1) To Refresh, 2) Return to top
        messageGroupList.push(feedbackGroup);

        return messageGroupList;
    }
}

export class FeedbackMessage extends Message {
    constructor(messageDelayInMs: number = 1000) {

        super(FeedbackComponent, {}, messageDelayInMs);
    }
}
