import { registerElement } from "@angular-react/core";
import { Nav } from "office-ui-fabric-react";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FabNavComponent } from "./fab-nav.component";

@NgModule({
    imports: [CommonModule],
    declarations: [FabNavComponent],
    exports: [FabNavComponent],
    schemas: [NO_ERRORS_SCHEMA]
})
export class FabNavModule {
    constructor() {
        registerElement('Nav', () => Nav)
    }
}
