import { Injectable, OnInit, Inject } from '@angular/core';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../config/diagnostic-data-config';
import { FabSliderModule } from '../../../../../node_modules/@angular-react/fabric';

// @Injectable()
// export class Globals {
//   messages: any[] = [];
//   openGeniePanel: boolean = true;
//   openFeedback: boolean = false;
//   messagesData: { [id: string]: any } = {};
// }



@Injectable({
    providedIn: 'root'
})
export class GenieGlobals {
    constructor() { }
    messages: any[] = [];
    openGeniePanel: boolean = false;
    openFeedback: boolean = false;
    messagesData: { [id: string]: any } = {};

    // constructor( @Inject(DIAGNOSTIC_DATA_CONFIG) private config: DiagnosticDataConfig) {
    // }
}
