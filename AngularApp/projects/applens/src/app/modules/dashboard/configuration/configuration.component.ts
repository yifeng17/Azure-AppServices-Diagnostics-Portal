import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
@Component({
  selector: 'configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss', '../onboarding-flow/onboarding-flow.component.scss']
})
export class ConfigurationComponent implements OnInit {
    editorOptions: any;
    code:string;
    showAlert:boolean;
    alertClass: string;
    alertMessage: string;
  constructor(public ngxSmartModalService: NgxSmartModalService) {
    this.editorOptions = {
        theme: 'vs',
        language: 'json',
        fontSize: 14,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        minimap: {
          enabled: false
        },
        folding: true
      };
      this.showAlert = false;
  }

  ngOnInit() {
      // read existing json or schematic json here
      let sample = {
        'public': 'wawscus'
      };
      this.code = JSON.stringify(sample);
  }

  confirmSave()  {
    this.ngxSmartModalService.getModal('saveModal').open();
  }

  saveConfig() {
      // call API to save config and close modal
      // call showAlertBox based on success vs failure
  }

  private showAlertBox(alertClass: string, message: string) {
    this.alertClass = alertClass;
    this.alertMessage = message;
    this.showAlert = true;
  }

}
