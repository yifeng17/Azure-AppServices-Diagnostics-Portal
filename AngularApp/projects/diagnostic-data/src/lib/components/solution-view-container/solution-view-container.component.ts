
import { Component, Input, OnInit } from '@angular/core';
import { TelemetryService } from "../../services/telemetry/telemetry.service";

@Component({
  selector: 'solution-view-container',
  templateUrl: './solution-view-container.component.html',
  styleUrls: ['./solution-view-container.component.scss']
})
export class SolutionViewContainerComponent implements OnInit {
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

        this.telemetryService.logEvent('SolutionLoaded', this.eventProps);
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

        this.telemetryService.logEvent("SolutionFeedback", feedbackEventProps);
        this.showThanksMessage = this.yesSelected || this.noSelected;
    }

}


