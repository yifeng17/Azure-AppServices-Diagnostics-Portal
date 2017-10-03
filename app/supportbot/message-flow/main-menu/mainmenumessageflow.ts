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

        var mainMenuGroup: MessageGroup = new MessageGroup('main-menu', [], 'health-check');
        mainMenuGroup.messages.push(new TextMessage('Here are some of the things that I can help you with:', MessageSender.System, 2000));
        mainMenuGroup.messages.push(new MainMenuMessage(this._getCategories()));

        messageGroupList.push(mainMenuGroup);

        return messageGroupList;
    }

    private _getCategories(): { name: string, href: string }[] {
        return [{
            name: 'Web App Down',
            href: 'availability/analysis'
        }, {
            name: 'Web App Slow',
            href: 'performance/analysis'
        }, {
            name: 'High CPU Usage',
            href: 'availability/detectors/sitecpuanalysis'
        }, {
            name: 'High Memory Usage',
            href: 'availability/memoryanalysis'
        }, {
            name: 'Web App Restarted',
            href: 'availability/apprestartanalysis'
        }];
    }
}

export class MainMenuMessage extends Message {
    constructor(categories: { name: string, href: string }[], messageDelayInMs: number = 1000) {
        
        super(MainMenuComponent, {
            categories: categories
        }, messageDelayInMs);
    }
}