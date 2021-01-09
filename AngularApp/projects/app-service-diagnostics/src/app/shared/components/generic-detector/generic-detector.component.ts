import { Router } from '@angular/router';
import { Component, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TelemetryService, FeatureNavigationService, DiagnosticService, DetectorMetaData, DetectorType } from 'diagnostic-data';
import { AuthService } from '../../../startup/services/auth.service';
import { Subscription } from 'rxjs';
import { ResourceService } from '../../../shared-v2/services/resource.service';

@Component({
    selector: 'generic-detector',
    templateUrl: './generic-detector.component.html',
    styleUrls: ['./generic-detector.component.scss'],
    providers: [
        FeatureNavigationService
    ]
})
export class GenericDetectorComponent implements OnDestroy {
    @Input() keystoneDetectorId = "";
    keystoneSolutionView: boolean = false;
    keystoneDetectorTitle: string = "Option 2: View diagnostic analysis";

    detector: string;
    analysisDetector: string;
    navigateSub: Subscription;
    analysisMode: boolean = false;
    isCaseSubmissionSolutionIFrame: boolean = false;

    constructor(private _activatedRoute: ActivatedRoute, private _diagnosticService: DiagnosticService, private _resourceService: ResourceService, private _authServiceInstance: AuthService, protected _telemetryService: TelemetryService,
        private _navigator: FeatureNavigationService, private _router: Router) {
        this._activatedRoute.paramMap.subscribe(params => {
            let currAnalysisId = params.get('analysisId');
            let currDetetctor = params.get('detectorName');
            if (!!currAnalysisId) {
                this.analysisDetector = currAnalysisId;
                if (!!currDetetctor) {
                    this.detector = currDetetctor;
                }
                else {
                    this.detector = currAnalysisId;
                }
            }
            else {
                if (!!currDetetctor) {
                    this.detector = currDetetctor;
                }
            }

            this._activatedRoute.queryParamMap.subscribe((queryParams) => {
                this.keystoneDetectorId = queryParams.get('keystoneDetectorId');
                this.keystoneSolutionView = !!this.keystoneDetectorId;
            })

            this.navigateSub = this._navigator.OnDetectorNavigate.subscribe((detector: string) => {
                if (detector) {
                    let detectorMetaData: DetectorMetaData = this._diagnosticService.getDetectorById(detector);
                    if (detectorMetaData.type === DetectorType.Detector) {
                        this._router.navigate([`../../detectors/${detector}`], { relativeTo: this._activatedRoute, queryParamsHandling: 'merge' });
                    } else if (detectorMetaData.type === DetectorType.Analysis) {
                        this._router.navigate([`../../analysis/${detector}`], { relativeTo: this._activatedRoute, queryParamsHandling: 'merge' });
                    }
                }
            });

            this._activatedRoute.data.subscribe(data => {
                this.analysisMode = data['analysisMode'];
            })

            this._authServiceInstance.getStartupInfo().subscribe(startUpInfo => {
                if (startUpInfo) {
                    const resourceId = startUpInfo.resourceId ? startUpInfo.resourceId : '';
                    const ticketBladeWorkflowId = startUpInfo.workflowId ? startUpInfo.workflowId : '';
                    const supportTopicId = startUpInfo.supportTopicId ? startUpInfo.supportTopicId : '';
                    const sessionId = startUpInfo.sessionId ? startUpInfo.sessionId : '';
                    this.isCaseSubmissionSolutionIFrame = startUpInfo.isIFrameForCaseSubmissionSolution != undefined ? startUpInfo.isIFrameForCaseSubmissionSolution : false;

                    const eventProperties: { [name: string]: string } = {
                        'ResourceId': resourceId,
                        'TicketBladeWorkflowId': ticketBladeWorkflowId,
                        'SupportTopicId': supportTopicId,
                        'PortalSessionId': sessionId,
                        'AzureServiceName': this._resourceService.azureServiceName
                    };
                    this._telemetryService.eventPropertiesSubject.next(eventProperties);

                    this._telemetryService.logEvent("GenericDetectorViewLoaded", {
                        'AnalysisMode': String(this.analysisMode),
                        'DetectorId': this.detector,
                        'AnalysisDetector': this.analysisDetector,
                        'IsKeystoneView': String(this.keystoneSolutionView),
                        'KeystoneDetctorId': this.keystoneDetectorId,
                    });
                }
            });
        });
    }

    ngOnDestroy() {
        this.navigateSub.unsubscribe();
    }
}
