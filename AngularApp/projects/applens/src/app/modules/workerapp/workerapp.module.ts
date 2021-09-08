import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { RouterModule } from '@angular/router';
import { WorkerAppFinderComponent } from './workerapp-finder/workerapp-finder.component';
import { SharedModule } from '../../shared/shared.module';

export const WorkerAppModuleRoutes : ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: WorkerAppFinderComponent
  }
]);

@NgModule({
  imports: [
    CommonModule,
    WorkerAppModuleRoutes,
    SharedModule
  ],
  declarations: [WorkerAppFinderComponent]
})
export class WorkerAppModule { }
