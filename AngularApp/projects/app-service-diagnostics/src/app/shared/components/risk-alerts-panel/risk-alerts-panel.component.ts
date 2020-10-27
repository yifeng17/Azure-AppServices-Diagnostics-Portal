import { Component, OnInit } from '@angular/core';
import { IPanelProps,IPanelStyles, MessageBarType, PanelType } from 'office-ui-fabric-react';
import { Globals } from '../../../globals';

@Component({
  selector: 'risk-alerts-panel',
  templateUrl: './risk-alerts-panel.component.html',
  styleUrls: ['./risk-alerts-panel.component.scss']
})
export class RiskAlertsPanelComponent implements OnInit {

type: PanelType = PanelType.custom;
autoHealMessageType: MessageBarType = MessageBarType.severeWarning;
healthCheckMessageType: MessageBarType = MessageBarType.severeWarning;
distributedWorkerMessageType: MessageBarType = MessageBarType.severeWarning;
appDensityHealthyMessageType: MessageBarType = MessageBarType.severeWarning;

autoHealTitle: string = "Auto-Heal is not enabled.";
healthCheckTitle: string = "Health Check is not enabled.";
workerDistributionTitle: string = "Distritubting your web app accross multiple instances";
appDensityHealthyTitle: string = "Your App Service Plan is currently saturated. ";

autoHealTitleDescription: string = "Auto-Heal is highly recommended for production applications that need to ensure high availability and resilience. Although Auto-Heal is not an eventual fix for issues your application may encounter, it allows your application to quickly recover from unexpected issues whether they be platform or application and stay available for customers. If Auto-Heal is being triggerred repeatedly. Re-examine the rule and ensure trigger values aren't too aggressive <li/>Investigate the cause for a proper fix. Note: Please ignore this message if you have Auto-Heal enabled in web.config but not via configuration settings. This checks the current Auto-Heal setttings.";
healthCheckDescription: string = "This feature will ping the specified health check path on all instances of your webapp every 2 minutes. If an instance does not respond within 10 minutes (5 pings), the instance is determined to be unhealthy and our service will stop routing requests to it. It is highly recommended for production apps to utilize this feature and minimize any potential downtime caused due to a faulty instance.";
workerDistributionDescription: string = "The webapp is currently configured to run on only one instance. Since you have only one instance you can expect downtime because when the App Service platform is upgraded, the instance on which your web app is running will be upgraded. Therefore, your web app process will be restarted and will experience downtime. ";
appDensityHealthyDescription: string = "Apps that are a part of the same App Service Plan, compete for the same set of resources. Our data indicates that you have more than recommended number of sites running on your App Service Plan."

width: string = "850px";
  autoHealEnabled: boolean = false;
  healthCheckEnabled: boolean = false;
  workerDistributionEnabled: boolean = false;
  appDensityHealthy: boolean = false;

  styles: any = {
    root: {
        marginTop: '50px',
    }
}

  constructor(public globals: Globals) { }

  ngOnInit() {
    this.globals.reliabilityChecksDetailsBehaviorSubject.subscribe((reliabilityChecks) => {

        console.log("Got updated info", reliabilityChecks);
        this.autoHealEnabled =  reliabilityChecks.autoHealEnabled;
        this.healthCheckEnabled = reliabilityChecks.healthCheckEnabled;
        this.workerDistributionEnabled = reliabilityChecks.workerDistributionEnabled;
        this.appDensityHealthy = reliabilityChecks.appDensityHealthy;

        if (this.autoHealEnabled) {
            this.autoHealMessageType = MessageBarType.success;
            this.autoHealTitle = "Auto-Heal is enabled.";
            this.autoHealTitleDescription = "Auto-Heal is highly recommended for production applications that need to ensure high availability and resilience. Although Auto-Heal is not an eventual fix for issues your application may encounter, it allows your application to quickly recover from unexpected issues whether they be platform or application and stay available for customers. If Auto-Heal is being triggerred repeatedly. Re-examine the rule and ensure trigger values aren't too aggressive. Investigate the cause for a proper fix.";
        }

        if (this.healthCheckEnabled) {
            this.healthCheckMessageType = MessageBarType.success;
            this.healthCheckTitle = "Health Check is enabled.";
            this.healthCheckDescription = "Health Check feature is currently configured for this web app. This will help minimize potential downtime.";
        }

        if (this.workerDistributionEnabled) {
            this.distributedWorkerMessageType = MessageBarType.success;
            this.workerDistributionTitle = "Great, your web app is running on more than two instances.";
            this.workerDistributionDescription = "This is optimal because instances in different upgrade domains will not be upgraded at the same time. While one worker instance is getting upgraded the other is still active to serve web requests.";
        }

        if (this.appDensityHealthy) {
            this.appDensityHealthyMessageType = MessageBarType.success;
            this.appDensityHealthyTitle="Total active sites on the App Service Plan are within the recommended value";
            this.appDensityHealthyDescription = "Total active sites on the App Service Plan are within the recommended value. You are currently running 3 active app(s) within the ApplensAgent20181007033616Plan App Service Plan.";
        }
        this.healthCheckEnabled = reliabilityChecks.healthCheckEnabled;
        this.workerDistributionEnabled = reliabilityChecks.workerDistributionEnabled;
        this.appDensityHealthy = reliabilityChecks.appDensityHealthy;
    })

  }


//   this.globals.reliabilityChecksDetails.healthCheckEnabled = healthCheckEnabled;
//   this.globals.reliabilityChecksDetails.workerDistributionEnabled = numberOfWorkers > 1;
//   this.globals.reliabilityChecksDetails.appDensityHealthy = true;

  dismissedHandler() {
    this.globals.openRiskAlertsPanel = false;
  }

}
