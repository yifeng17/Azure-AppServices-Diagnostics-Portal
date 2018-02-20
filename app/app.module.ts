import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouteReuseStrategy } from '@angular/router';

import { SharedModule } from './shared/shared.module';
import { SupportBotModule } from './supportbot/supportbot.module';
import { AvailabilityModule } from './availability/availability.module';
import { AppComponent } from './app.component';
import { CustomReuseStrategy } from './app-route-reusestrategy.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NguCarouselModule } from '@ngu/carousel';

@NgModule({
  imports: [
    BrowserModule,
    SharedModule.forRoot(),
    SupportBotModule,
    AvailabilityModule,
    BrowserAnimationsModule,
    NguCarouselModule,
    RouterModule.forRoot([
      { path: '', component: AppComponent }
    ])
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }