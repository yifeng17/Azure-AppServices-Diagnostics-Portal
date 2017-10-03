import { MessageGroup } from '../models/message-group';

export class MessageFlowFactory {
    private static _registeredMessageFlowProviders: any[] = [];

    public static registerMessageFlowProvider(messageFlowProvider: any) {
        if (messageFlowProvider) {
            this._registeredMessageFlowProviders.push(messageFlowProvider);
        }
    }

    public static getMessageGroups(): MessageGroup[] {
        var result: MessageGroup[] = [];

        this._registeredMessageFlowProviders.forEach((p: any) => {
            result = result.concat(p.prototype.GetMessageFlowList());
        });

        return result;
    }
}

// Custom Decorator for Message Providers to register with Factory.
export function RegisterMessageFlowWithFactory() {
    return function (target) {
        MessageFlowFactory.registerMessageFlowProvider(target);
    }
}
