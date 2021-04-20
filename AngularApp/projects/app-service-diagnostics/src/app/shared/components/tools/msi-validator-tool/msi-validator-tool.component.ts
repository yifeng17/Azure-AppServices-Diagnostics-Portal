import { Component, OnInit } from '@angular/core';
import { SiteInfoMetaData } from '../../../models/site';
import { SiteService } from '../../../services/site.service';
import { DaasService } from '../../../services/daas.service';
import { AvailabilityLoggingService } from '../../../services/logging/availability.logging.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AvailableResourceTypes, AvailableTypesOfIdentities, MsiValidatorInput, MsiValidatorResult } from '../../../models/daas';


@Component({
  selector: 'msi-validator-tool',
  templateUrl: './msi-validator-tool.component.html',
  styleUrls: ['./msi-validator-tool.component.scss']
})
export class MsiValidatorToolComponent implements OnInit {

  siteToBeDiagnosed: SiteInfoMetaData;
  retrievingInfo : boolean = false;
  msiValidatorTestResult : MsiValidatorResult;


  // variables used in Html
  availableIdentites = Object.values(AvailableTypesOfIdentities);
  availableResourceTypes = Object.values(AvailableResourceTypes);
  validIdentityToShowClientIdTextBox = AvailableTypesOfIdentities.UserAssigned;
  validResourceTypeToShowResourceTextBox = AvailableResourceTypes.Custom;

  // Inputs:  
  msiValidatorInput :  MsiValidatorInput = {
    ResourceType : AvailableResourceTypes.KeyVault,
    Resource : "",
    TypeOfIdentity : AvailableTypesOfIdentities.SystemAssigned,
    ClientId : "",
    Endpoint : ""
  }

  msiValidatorResult : MsiValidatorResult;


  constructor(private _siteService: SiteService, private _daasService: DaasService, private _logger: AvailabilityLoggingService) {
    this._siteService.currentSiteMetaData.subscribe(siteInfo => {
      if (siteInfo) {
          this.siteToBeDiagnosed = siteInfo;          
      }
    });




   }

  ngOnInit() {
  }

  runMsiValidator(){
    this.retrievingInfo = true;
    //this._logger.LogClickEvent('Msi Validator', 'DiagnosticTools');

    this._daasService.getMsiValidator(this.siteToBeDiagnosed, this.msiValidatorInput)
    .subscribe(result => {
      this.retrievingInfo = false;
      this.msiValidatorResult = result;
      console.log(result);
    }, error =>{
      this.retrievingInfo = false;
      console.log(error);
    });

  }

}
