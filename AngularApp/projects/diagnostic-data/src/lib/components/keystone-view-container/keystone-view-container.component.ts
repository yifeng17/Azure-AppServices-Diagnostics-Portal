import { Component, Input, OnInit } from '@angular/core';
import { TelemetryService } from "../../services/telemetry/telemetry.service";

@Component({
    selector: 'keystone-view-container',
    templateUrl: './keystone-view-container.component.html',
    styleUrls: ['./keystone-view-container.component.scss']
})
export class KeystoneViewContainerComponent implements OnInit {
    @Input() solutionTitle: string = "";
    @Input() isRecommended: boolean = false;
    @Input() detector: string = "";
    @Input() isAnalysisView: boolean = false;
    @Input() isKeystoneDetector: boolean = false;

    solutionTitleImageSrc: string = "../../../../assets/img/case-submission-flow/Help-and-Support.svg";

    yesSelected: boolean;
    noSelected: boolean;
    showThanksMessage: boolean = false;
    eventProps: { [name: string]: string } = {};

    constructor(protected telemetryService: TelemetryService) { }

    ngOnInit() {
        this.solutionTitleImageSrc = this.getIconImagePath();
        this.eventProps = {
            'Detector': this.detector,
            'IsKeystoneDetector': String(this.isKeystoneDetector),
            'SolutionTitle': this.solutionTitle,
            'IsRecommmended': String(this.isRecommended),
            'IsAnalysisView': String(this.isAnalysisView)
          };

        this.telemetryService.logEvent('KeystoneSolutionLoaded', this.eventProps);
    }

    private getIconImagePath() {
        return this.isRecommended ? "../../../../assets/img/case-submission-flow/Help-and-Support.svg" : "../../../../assets/img/case-submission-flow/Troubleshoot.svg";
    }

    feedbackButtonClicked(helpful: boolean) {
        this.yesSelected = helpful;
        this.noSelected = !helpful;

        const feedbackEventProps = {
            ...this.eventProps,
            'IsHelpful': String(helpful)
        }

        this.telemetryService.logEvent("KeystoneFeedback", feedbackEventProps);
        this.showThanksMessage = this.yesSelected || this.noSelected;
    }
}


