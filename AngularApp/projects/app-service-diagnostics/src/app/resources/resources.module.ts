import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

const ResourceRoutes = RouterModule.forChild([

  // Web Apps
  {
    path: 'subscriptions/:subscriptionid/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:resourcename',
    loadChildren: './web-sites/web-sites.module#WebSitesModule'
  },
  {
    path: 'subscriptions/:subscriptionid/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:resourcename/slots/:slot',
    loadChildren: './web-sites/web-sites.module#WebSitesModule'
  },

  // App Service Environment
  {
    path: 'subscriptions/:subscriptionid/resourcegroups/:resourcegroup/providers/microsoft.web/hostingenvironments/:resourcename',
    loadChildren: './web-hosting-environments/web-hosting-environments.module#WebHostingEnvironmentsModule'
  }

]);

@NgModule({
  imports: [
    CommonModule,
    ResourceRoutes
  ],
  declarations: [],
  providers: []
})
export class ResourcesModule { }
