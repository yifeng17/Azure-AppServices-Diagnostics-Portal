import { CommonModule } from '@angular/common';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent } from './admin/admin.component';

export const AdminModuleRoutes : ModuleWithProviders = RouterModule.forChild([
    {
        path: '',
        component: AdminComponent
    }
]);

@NgModule({
    imports: [
        CommonModule,
        AdminModuleRoutes,
        SharedModule
    ],
    declarations: [AdminComponent]
})
export class AdminModule { }
