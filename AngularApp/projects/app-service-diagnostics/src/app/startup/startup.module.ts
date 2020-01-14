import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { WindowService } from './services/window.service';
import { PortalService } from './services/portal.service';
import { BroadcastService } from './services/broadcast.service';
import { AuthService } from './services/auth.service';
import { StartupMessages } from '../supportbot/message-flow/startup/startupmessages';
import { MainMenuMessageFlow } from '../supportbot/message-flow/main-menu/mainmenumessageflow';
import { HealthCheckMessageFlow } from '../supportbot/message-flow/health-check/healthcheckmessageflow';
import { FeedbackMessageFlow } from '../supportbot/message-flow/feedback/feedbackmessageflow';
import { Geniefeedbackmessageflow } from '../supportbot/message-flow/genie-feedback/geniefeedbackmessageflow';
import { MessageProcessor } from '../supportbot/message-processor.service';
import { GenericCategoryFlow } from '../supportbot/message-flow/v2-flows/generic-category.flow';
import { GenieChatFlow } from '../supportbot/message-flow/v2-flows/genie-chat.flow';
import { AvailabilityPerformanceFlow } from '../supportbot/message-flow/v2-flows/availability-performance.flow';

@NgModule({
  imports: [
    HttpClientModule,
    CommonModule
  ],
  declarations: []
})
export class StartupModule {
  static forRoot(): ModuleWithProviders {
    return {
        ngModule: StartupModule,
        providers: [
            WindowService,
            PortalService,
            BroadcastService,
            AuthService,
            StartupMessages,
            MainMenuMessageFlow,
            HealthCheckMessageFlow,
            FeedbackMessageFlow,
            // CpuAnalysisChatFlow,
            MessageProcessor,
            AvailabilityPerformanceFlow,
            // LinuxAvailabilityPerformanceFlow,
            GenericCategoryFlow,
             GenieChatFlow
        ]
    };
}
}
