import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TakeSurveyComponent } from './components/takesurvey/takesurvey.component';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { FabButtonModule, FabChoiceGroupModule, FabTextFieldModule, FabDropdownModule, FabPanelModule } from '@angular-react/fabric';
import {SurveysService} from "./services/surveys.service";
import { HttpClientModule } from '@angular/common/http';


export const SurveysModuleRoutes : ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: TakeSurveyComponent
  }
]);

@NgModule({
  imports: [
    CommonModule,
    SurveysModuleRoutes,
    SharedModule,
    HttpClientModule,
    FormsModule,
    FabButtonModule, FabChoiceGroupModule, FabTextFieldModule, FabDropdownModule, FabPanelModule
  ],
  providers: [SurveysService],
  declarations: [TakeSurveyComponent]
})
export class SurveysModule { }
