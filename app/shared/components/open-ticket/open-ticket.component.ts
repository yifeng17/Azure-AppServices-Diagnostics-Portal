import { Component } from '@angular/core';
import { PortalService } from '../../services';


@Component({
    selector: 'open-ticket',
    templateUrl: 'open-ticket.component.html'
})
export class OpenTicketComponent {

    constructor(private _portalService: PortalService){
    }

    openSupportTicketBlade(): void {
    }
}