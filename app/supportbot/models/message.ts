import { Component } from '@angular/core';
import { TextMessageComponent } from '../common/text-message/text-message.component';
import { ButtonMessageComponent } from '../common/button-message/button-message.component';

export enum MessageSender {
    System = 0,
    User = 1
}

export enum ButtonActionType {
    Continue = 0,
    SwitchToOtherMessageGroup = 1
}

export abstract class Message {
    constructor(public component: any, public parameters: any, public messageDelayInMs: number = 100) {
    }
}

export class TextMessage extends Message {
    constructor(message: string, sender: MessageSender = MessageSender.System, messageDelayInMs: number = 1000) {
        super(TextMessageComponent, {
            message: message,
            sender: sender
        }, messageDelayInMs);
    }
}

export class ButtonListMessage extends Message {
    constructor(buttonList: { title: string, type: ButtonActionType, next_key: string }[], context: string, sender: MessageSender = MessageSender.System) {
        super(ButtonMessageComponent, {
            buttonList: buttonList,
            sender: sender,
            context: context
        });
    }
}