import { Component, OnInit } from '@angular/core';
import { FabButtonModule } from '@angular-react/fabric';
import {IncidentAssistanceService} from '../../services/incident-assistance.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TelemetryService, TelemetryEventNames } from 'diagnostic-data';

@Component({
  selector: 'incidentvalidation',
  templateUrl: './incidentvalidation.component.html',
  styleUrls: ['./incidentvalidation.component.scss']
})
export class IncidentValidationComponent implements OnInit {
  pageLoading: boolean= true;
  alternateContent: string = null;
  isEnabled: boolean = false;
  incidentId: string = null;
  displayLoader: boolean = false;
  incidentInfo: IncidentInfo;
  validationButtonDisabled: boolean = true;
  updateButtonDisabled: boolean = true;
  updatedSuccessfully: boolean = false;
  incidentValidationStatus: boolean = false;
  footerMessage: string = null;
  footerMessageType: string = "none";

  constructor(private _incidentAssistanceService: IncidentAssistanceService, private _route: ActivatedRoute, private _telemetryService: TelemetryService, private _router: Router) {}

  ngOnInit() {
    this.incidentId = this._route.snapshot.params['incidentId'];
    this._telemetryService.logPageView(TelemetryEventNames.IncidentAssistancePage, {IncidentId: this.incidentId});
    if (this.incidentId && this.incidentId.length>0){
      this.pageLoading = true;
      this.displayLoader = true;
      this._incidentAssistanceService.isIncidentAssistanceEnabled().subscribe((res) => {
        this.displayLoader = false;
        this.isEnabled = res.body;
        if (this.isEnabled) {
          this.getIncidentData();
        }
        else{
          this._telemetryService.logEvent(TelemetryEventNames.IncidentAssistancePage, {"IsEnabled": this.isEnabled.toString()});
          this.alternateContent = "Incident assistance feature is currently disabled in AppLens";
          this.pageLoading = false;
        }
      }, (err) => {
        this.displayLoader = false;
      });
    }
    else{
      this.alternateContent = "A valid incident id was not provided in the url path.";
    }
  }

  refreshButtonStatus() {
    this.validationButtonDisabled = this.incidentValidationStatus || this.incidentInfo.validationResults.every(x => x.value==x.oldValue);
    this.updateButtonDisabled = !this.incidentValidationStatus || this.updatedSuccessfully;
  }

  setIncidentInfo(payload){
    if (payload && payload.validationResults && payload.validationResults.length>0){
      payload.validationResults.forEach(x => {
        x["oldValue"] = x.value;
      });
    }
    this.incidentInfo = payload;
  }

  getIncidentData() {
    this.displayLoader = true;
    this._incidentAssistanceService.getIncident(this.incidentId).subscribe(res => {
      this.displayLoader = false;
      var result = JSON.parse(res.body);
      this.pageLoading = false;
      this.setIncidentInfo(result);
      this.incidentValidationStatus = result.validationResults.every(x => x.validationStatus);
      this._telemetryService.logEvent(TelemetryEventNames.IncidentAssistanceLoaded, {"IncidentId": this.incidentInfo.incidentId, "ValidationStatus": this.incidentValidationStatus.toString()});
      if (!this.incidentValidationStatus){
        this.footerMessage = "Some validations have failed. Please correct the info and click on 'Check Validation' button.";
        this.footerMessageType = "error";
      }
    },
    (err) => {
      this.displayLoader = false;
      this.alternateContent = `Failed to load incident information. ${err.error}`;
    });
  }

  onSubmit() {
    if (!this.validationButtonDisabled){
      var body = {
        "IncidentId": this.incidentInfo.incidentId,
        "ValidationResults": this.incidentInfo.validationResults.map(x => {return {Name: x.name, Value: x.value};})
      };
      this.resetGlobals();
      this.displayLoader = true;
      this._incidentAssistanceService.validateIncident(body).subscribe(res => {
        this.displayLoader = false;
        var result = JSON.parse(res.body);
        if (result.validationStatus) {
          this.incidentValidationStatus = true;
          this.footerMessage = "All validations have passed.";
          this.footerMessageType = "success";
          this.incidentInfo.validationResults.forEach(x => {x.validationStatus = true; x.oldValue = x.value;});
          this.refreshButtonStatus();
        }
        else {
          this.onValidationFailed(result);
        }
        this._telemetryService.logEvent(TelemetryEventNames.IncidentValidationCheck, {"IncidentId": this.incidentInfo.incidentId, "ValidationStatus": this.incidentValidationStatus.toString(), "Status": "success"});
      },
      (err) => {
        this.displayLoader = false;
        this._telemetryService.logEvent(TelemetryEventNames.IncidentValidationCheck, {"IncidentId": this.incidentInfo.incidentId, "Status": "failed", "ErrorMessage": err.error});
        this.footerMessage = `Failed to validate incident. ${err.error}`;
        this.footerMessageType = "error";
      });
    }
  }

  onUpdateClick() {
    if (!this.updateButtonDisabled){
      var body = {
        "IncidentId": this.incidentInfo.incidentId,
        "ValidationResults": this.incidentInfo.validationResults.map(x => {return {Name: x.name, Value: x.value};})
      };
      this.resetGlobals();
      this.displayLoader = true;
      this._incidentAssistanceService.updateIncident(body).subscribe(res => {
        this.displayLoader = false;
        var result = JSON.parse(res.body);
        if (result.updationStatus) {
          this.updatedSuccessfully = true;
          this.updateButtonDisabled = true;
          this.footerMessage = "Incident has been updated successfully and will be investigated by the team."
          this.footerMessageType = "success";
        }
        else {
          this.updatedSuccessfully = false;
          if (result.validationStatus) {
            this.footerMessage = `Incident updation has failed. ${result.errorMessage}`;
            this.footerMessageType = "error";
          }
          else {
            this.onValidationFailed({incidentId: result.incidentId, title: result.title, validationResults: result.validationResults});
          }
        }
        this._telemetryService.logEvent(TelemetryEventNames.IncidentValidationCheck, {"IncidentId": this.incidentInfo.incidentId, "UpdationStatus": this.updatedSuccessfully.toString(), "Status": "success"});
      },
      (err) => {
        this.displayLoader = false;
        this._telemetryService.logEvent(TelemetryEventNames.IncidentValidationCheck, {"IncidentId": this.incidentInfo.incidentId, "Status": "failed", "ErrorMessage": err.error});
        this.footerMessage = `Failed to update incident because of ${err.error}`;
        this.footerMessageType = "error";
      });
    }
  }

  onValidationFailed(incidentInfo){
    this.incidentValidationStatus = false;
    this.footerMessage = "Some validations have failed. Please try again.";
    this.footerMessageType = "error";
    this.setIncidentInfo(incidentInfo);
    this.refreshButtonStatus();
  }

  resetGlobals(){
    this.alternateContent = null;
    this.footerMessage = null;
    this.footerMessageType = "none";
  }
}

interface IncidentInfo{
  incidentId: string;
  title: string;
  validationResults: ValidationResult[];
}

interface ValidationResult{
  name: string;
  value: string;
  oldValue: string;
  validationStatus: boolean;
  validationMessage: string;
}

interface ValidationUpdateResponse extends IncidentInfo{
  validationStatus: boolean;
  updationStatus: boolean;
  errorMessage: string;
  successMessage: string;
}