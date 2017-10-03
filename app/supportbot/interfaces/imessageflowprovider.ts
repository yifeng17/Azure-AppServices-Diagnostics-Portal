import { MessageGroup } from '../models/message-group';

export interface IMessageFlowProvider {
    GetMessageFlowList(): MessageGroup[];
}