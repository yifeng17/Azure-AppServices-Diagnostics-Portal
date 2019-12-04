import { Injectable } from '@angular/core';
import { IMessageFlowProvider } from '../../interfaces/imessageflowprovider';
import { TextMessage } from '../../models/message';
import { MessageGroup } from '../../models/message-group';
import { RegisterMessageFlowWithFactory } from '../message-flow.factory';

@Injectable()
@RegisterMessageFlowWithFactory()
export class StartupMessages extends IMessageFlowProvider {

    public GetMessageFlowList(): MessageGroup[] {

        const messageGroupList: MessageGroup[] = [];

        const welcomeMessageGroup: MessageGroup = new MessageGroup('startup', [], () => '');
        welcomeMessageGroup.messages.push(new TextMessage('Welcome to App Service Diagnostics. My name is Genie and I am here to help you answer any questions you may have about diagnosing and solving your problems with your app. Please describe the issue of your app.'));

        messageGroupList.push(welcomeMessageGroup);

        return messageGroupList;
    }


}
