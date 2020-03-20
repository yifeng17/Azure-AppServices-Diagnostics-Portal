import { Component, OnInit, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { WebSitesService } from './resources/web-sites/services/web-sites.service';
import { AuthService } from './startup/services/auth.service';
import { StartupInfo } from './shared/models/portal';

@Component({
    selector: 'sc-app',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {

    private _newVersionEnabled = true;
    public get newVersionEnabled() { return this._newVersionEnabled; }

    public set newVersionEnabled(value: boolean) {
        this._newVersionEnabled = value;
     }

    constructor(private _router: Router) {
    }

    ngOnInit() {
        if (isDevMode()) {
            console.log('%c Support Center is running in dev mode', 'color: orange');
            console.log('%c Logs that are normally published to the portal kusto logs will show up in the console', 'color: orange');
        }

        this._router.navigate(['/resourceRedirect']);
        initializeIcons('https://static2.sharepointonline.com/files/fabric/assets/icons/');
    }
}
