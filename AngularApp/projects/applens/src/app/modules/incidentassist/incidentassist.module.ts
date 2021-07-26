import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentValidationComponent } from './components/incidentvalidation/incidentvalidation.component';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { FabButtonModule, FabPanelModule } from '@angular-react/fabric';
import {IncidentAssistanceService} from "./services/incident-assistance.service";
import { HttpClientModule } from '@angular/common/http';


export const IncidentAssistModuleRoutes : ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: IncidentValidationComponent
  }
]);

@NgModule({
  imports: [
    CommonModule,
    IncidentAssistModuleRoutes,
    SharedModule,
    HttpClientModule,
    FormsModule,
    FabButtonModule,
    FabPanelModule
  ],
  providers: [IncidentAssistanceService],
  declarations: [IncidentValidationComponent]
})
export class IncidentAssistModule { }
