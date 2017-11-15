import { Injectable } from '@angular/core';
import { IMessageFlowProvider } from '../../interfaces/imessageflowprovider';
import { Message, TextMessage, MessageSender } from '../../models/message';
import { MessageGroup } from '../../models/message-group';
import { RegisterMessageFlowWithFactory } from '../message-flow.factory';
import { MainMenuComponent } from './main-menu.component';

@Injectable()
@RegisterMessageFlowWithFactory()
export class MainMenuMessageFlow implements IMessageFlowProvider {
    GetMessageFlowList(): MessageGroup[] {

        var messageGroupList: MessageGroup[] = [];

        var mainMenuGroup: MessageGroup = new MessageGroup('main-menu', [], () => 'health-check');
        mainMenuGroup.messages.push(new TextMessage('Here are some of the things that I can help you with:', MessageSender.System, 2000));
        mainMenuGroup.messages.push(new MainMenuMessage());

        messageGroupList.push(mainMenuGroup);

        return messageGroupList;
    }
}

export class MainMenuMessage extends Message {
    constructor(messageDelayInMs: number = 1000) {
        
        super(MainMenuComponent, {}, messageDelayInMs);
    }
}