import { Injectable } from '@angular/core';
import { ArmService } from '../../shared/services/arm.service';
import { ICache } from '../../shared/models/icache';
import { IAppAnalysisResponse } from '../../shared/models/appanalysisresponse';
import { IDetectorResponse } from '../../shared/models/detectorresponse';
import { IDiagnosticProperties } from '../../shared/models/diagnosticproperties';
import { IResponseMessageEnvelope, IResponseMessageCollectionEnvelope } from '../../shared/models/responsemessageenvelope';
import { IDetectorDefinition } from '../../shared/models/detectordefinition';
import { UriElementsService, AvailabilityLoggingService } from '../../shared/services';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class AppAnalysisService {
    private _analysisCache: ICache<IAppAnalysisResponse>;
    private _detectorResponseCache: ICache<IDetectorResponse>;
    private _propertiesCache: ICache<IDiagnosticProperties>;

    constructor(private _armService: ArmService, private _uriElementsService: UriElementsService, private _logger: AvailabilityLoggingService) {
        this.invalidateCache();
    }

    getAnalysisResource(subscriptionId: string, resourceGroup: string, siteName: string, slot: string, analysisName: string, startTime: string = '', endTime: string = ''): Observable<IAppAnalysisResponse> {

        if (this._analysisCache && this._analysisCache[analysisName]) {
            return Observable.of<IAppAnalysisResponse>(this._analysisCache[analysisName]);
        }

        let resourceUrl: string = this._uriElementsService.getAnalysisResourceUrl(subscriptionId, resourceGroup, siteName, analysisName, slot, startTime, endTime);
        return this._armService.getResource<IResponseMessageEnvelope<IAppAnalysisResponse>>(resourceUrl)
            .map((response: IResponseMessageEnvelope<IAppAnalysisResponse>) => <IAppAnalysisResponse>response.properties)
            .do((data: IAppAnalysisResponse) => this._analysisCache[analysisName] = data)
            .catch(this.handleError);
    }

    getDetectors(subscriptionId: string, resourceGroup: string, siteName: string, slot: string): Observable<IDetectorDefinition[]> {
        let resourceUrl: string = this._uriElementsService.getDetectorsUrl(subscriptionId, resourceGroup, siteName, slot);
        return this._armService.getResource<any>(resourceUrl)
            .map((response: IResponseMessageCollectionEnvelope<IResponseMessageEnvelope<IDetectorDefinition>>) =>
                response.value.map((item: IResponseMessageEnvelope<IDetectorDefinition>) => <IDetectorDefinition>item.properties))
            .catch(this.handleError);
    }

    getDetectorResource(subscriptionId: string, resourceGroup: string, siteName: string, slot: string, detectorName: string, startTime: string = '', endTime: string = ''): Observable<IDetectorResponse> {

        if (this._detectorResponseCache && this._detectorResponseCache[detectorName]) {
            return Observable.of<IDetectorResponse>(this._detectorResponseCache[detectorName]);
        }

        let resourceUrl: string = this._uriElementsService.getDetectorResourceUrl(subscriptionId, resourceGroup, siteName, slot, detectorName, startTime, endTime);

        return this._armService.getResource<IResponseMessageEnvelope<IDetectorResponse>>(resourceUrl)
            .map((response: IResponseMessageEnvelope<IDetectorResponse>) => <IDetectorResponse>response.properties)
            .do((data: IDetectorResponse) => {
                this._detectorResponseCache[detectorName] = data;

                if (detectorName.toLowerCase() === 'runtimeavailability') {

                    let isAppCurrentlyHealthy: boolean = true;

                    let currentAppHealth = this._detectorResponseCache[detectorName].data[0].find(p => p.name.toLowerCase() === "currentapphealth");
                    if (currentAppHealth) {
                        if (currentAppHealth.value.toLowerCase() === 'unhealthy') {
                            isAppCurrentlyHealthy = false;
                        }

                        this._logger.LogCurrentHealth(isAppCurrentlyHealthy);
                    }
                }
            })
            .catch(this.handleError);
    }

    getDiagnosticProperties(subscriptionId: string, resourceGroup: string, siteName: string, slot: string): Observable<IDiagnosticProperties> {

        if (this._propertiesCache && this._propertiesCache['diagnosticProperties']) {
            return Observable.of<IDiagnosticProperties>(this._propertiesCache['diagnosticProperties']);
        }

        let resourceUrl: string = this._uriElementsService.getDiagnosticPropertiesUrl(subscriptionId, resourceGroup, siteName, slot);

        return this._armService.getResource<IResponseMessageEnvelope<IDiagnosticProperties>>(resourceUrl)
            .map((response: IResponseMessageEnvelope<IDiagnosticProperties>) => <IDiagnosticProperties>response.properties)
            .do((data: IDiagnosticProperties) => this._propertiesCache['diagnosticProperties'] = data)
            .catch(this.handleError);
    }

    invalidateCache(): void {
        this._analysisCache = {};
        this._detectorResponseCache = {};
        this._propertiesCache = {};
    }

    private handleError(error: any) {
        return Observable.throw(error);
    }
}