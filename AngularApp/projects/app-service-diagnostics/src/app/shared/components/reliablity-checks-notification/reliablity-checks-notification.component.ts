import { Component, OnInit } from '@angular/core';
import { MessageBarType, IMessageBarProps, IMessageBarStyles} from 'office-ui-fabric-react';
import { Globals } from '../../../globals';
import { WebSitesService } from '../../../resources/web-sites/services/web-sites.service';
import { ResourceService } from '../../../shared-v2/services/resource.service';


@Component({
  selector: 'reliablity-checks-notification',
  templateUrl: './reliablity-checks-notification.component.html',
  styleUrls: ['./reliablity-checks-notification.component.scss']
})
export class ReliablityChecksNotificationComponent implements OnInit {
  type: MessageBarType = MessageBarType.error;
  criticalCount: string = "4";
  numberofCriticalChecks: number = 0;
  reliabilityChecksResults: any = {};
  text: string = "";
  styles: IMessageBarStyles = {
      content: {
          height: '50px',
      }
  }
  constructor(private _resourceService: ResourceService, private globals: Globals) { }

  ngOnInit() {
    // if (this._resourceService && this._resourceService instanceof WebSitesService)
    // {
        // var a = {
        //     "numberofCriticalChecks": this.numberofCriticalChecks,
        //     "autoHealEnabled": autoHealEnabled,
        //     "healthCheckEnabled": healthCheckEnabled,
        //     "numberOfWorkers": numberOfWorkers,
        //     "numberOfSites": numberOfSites
        // };
         this._resourceService.getReliablityCheckResult().subscribe(results => {
            let res: any = results[0];
            let autoHealEnabled = res.properties.autoHealEnabled;
            let healthCheckEnabled = res.properties.healthCheckPath != null && res.properties.healthCheckPath.toString() !== '' && res.properties.healthCheckPath.toString().length >= 1;
            this.numberofCriticalChecks = autoHealEnabled ? this.numberofCriticalChecks : this.numberofCriticalChecks+1;
            this.numberofCriticalChecks = healthCheckEnabled ? this.numberofCriticalChecks : this.numberofCriticalChecks+1;
            console.log("webconfiginfo", res, res.properties, res.properties.autoHealEnabled);
            console.log("this.numberofCriticalChecks", this.numberofCriticalChecks, autoHealEnabled, healthCheckEnabled);

            let severfarmResource: any = results[1];
            let numberOfWorkers = severfarmResource.properties.numberOfWorkers;
            let numberOfSites = severfarmResource.properties.numberOfSites;

            this.numberofCriticalChecks = numberOfWorkers > 1 ? this.numberofCriticalChecks : this.numberofCriticalChecks+1;


            var a = {
                "numberofCriticalChecks": this.numberofCriticalChecks,
                "autoHealEnabled": autoHealEnabled,
                "healthCheckEnabled": healthCheckEnabled,
                "workerDistributionEnabled": numberOfWorkers > 1,
                "appDensityHealthy": true
            };



            console.log("resourceTasksInfo", results, a);

            this.criticalCount = this.numberofCriticalChecks.toString();

            this.globals.updatereliabilityChecksDetails(a);
            // this.globals.reliabilityChecksDetails.autoHealEnabled = autoHealEnabled;
            // this.globals.reliabilityChecksDetails.healthCheckEnabled = healthCheckEnabled;
            // this.globals.reliabilityChecksDetails.workerDistributionEnabled = numberOfWorkers > 1;
            // this.globals.reliabilityChecksDetails.appDensityHealthy = true;

            this.text = JSON.stringify(a);
            console.log("text ", this.criticalCount , this.reliabilityChecksResults);
          //  return a;
       });

      //  this.reliabilityChecksResults = this._resourceService.reliabilityChecksResults;

    //}
  }

  openReliabilityChecksPanel() {
      console.log("openReliabilityChecksPanel", this.globals.openReliabilityChecksPanel);
      this.globals.openReliabilityChecksPanel = true;
  }

}
