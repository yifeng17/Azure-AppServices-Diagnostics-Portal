import { Injectable, OnInit, Inject } from '@angular/core';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../config/diagnostic-data-config';

// @Injectable()
// export class Globals {
//   messages: any[] = [];
//   openGeniePanel: boolean = true;
//   openFeedback: boolean = false;
//   messagesData: { [id: string]: any } = {};
// }



@Injectable()
export class GenieGlobals {
    messages: any[] = [];
    openGeniePanel: boolean = true;
    openFeedback: boolean = false;
    messagesData: { [id: string]: any } = {};

    // constructor( @Inject(DIAGNOSTIC_DATA_CONFIG) private config: DiagnosticDataConfig) {
    // }
}
