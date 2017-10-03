import { Component, Injector, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IChatMessageComponent } from '../../interfaces/ichatmessagecomponent';
import { ButtonActionType } from '../../models/message';
import { BotLoggingService } from '../../../shared/services';

@Component({
    templateUrl: 'button-message.component.html'
})
export class ButtonMessageComponent implements OnInit, AfterViewInit, IChatMessageComponent {

    buttonList: { title: string, type: ButtonActionType, next_key: string }[] = [];
    buttonCssClasses = ['btn-info', 'btn-warning', 'btn-danger', 'btn-primary'];
    showComponent: boolean = true;
    context: string;

    @Output() onViewUpdate = new EventEmitter();
    @Output() onComplete = new EventEmitter<{ status: boolean, data?: any }>();

    constructor(private injector: Injector, private _logger: BotLoggingService) {
    }

    ngOnInit(): void {
        this.buttonList = this.injector.get('buttonList');
        this.context = this.injector.get('context');
    }

    ngAfterViewInit(): void {
        this.onViewUpdate.emit();
    }

    onClick(item: any) {
        this.showComponent = false;
        this._logger.LogClickEvent(item.title, this.context, 'Support Home');
        this.onComplete.emit({ status: true, data: item });
    }
}