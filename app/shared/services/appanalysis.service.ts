import { Injectable } from '@angular/core';
import { ArmService } from '../../shared/services/arm.service';
import { Cache } from '../../shared/models/icache';
import { IAppAnalysisResponse } from '../../shared/models/appanalysisresponse';
import { IDetectorResponse } from '../../shared/models/detectorresponse';
import { IDiagnosticProperties } from '../../shared/models/diagnosticproperties';
import { ResponseMessageEnvelope, ResponseMessageCollectionEnvelope } from '../../shared/models/responsemessageenvelope';
import { IDetectorDefinition } from '../../shared/models/detectordefinition';
import { UriElementsService, AvailabilityLoggingService } from '../../shared/services';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class AppAnalysisService {
    private _analysisCache: Cache<IAppAnalysisResponse>;
    private _detectorResponseCache: Cache<IDetectorResponse>;
    private _propertiesCache: Cache<IDiagnosticProperties>;

    constructor(private _armService: ArmService, private _uriElementsService: UriElementsService, private _logger: AvailabilityLoggingService) {
        this.invalidateCache();
    }

    getAnalysisResource(subscriptionId: string, resourceGroup: string, siteName: string, slot: string, diagnosticCategory:string, analysisName: string, invalidateCache: boolean = false, startTime: string = '', endTime: string = ''): Observable<IAppAnalysisResponse> {

        // if (this._analysisCache && this._analysisCache[this.getCacheKey(diagnosticCategory, analysisName)]) {
        //     return Observable.of<IAppAnalysisResponse>(this._analysisCache[analysisName]);
        // }

        let resourceUrl: string = this._uriElementsService.getAnalysisResourceUrl(subscriptionId, resourceGroup, siteName, diagnosticCategory, analysisName, slot, startTime, endTime);
        return this._armService.postResource<ResponseMessageEnvelope<IAppAnalysisResponse>>(resourceUrl, null, null, invalidateCache)
            .map((response: ResponseMessageEnvelope<IAppAnalysisResponse>) => <IAppAnalysisResponse>response.properties)
            .do((data: IAppAnalysisResponse) => this._analysisCache[analysisName] = data)
            .catch(this.handleError);
    }

    getDetectors(subscriptionId: string, resourceGroup: string, siteName: string, diagnosticCategory:string, slot: string): Observable<IDetectorDefinition[]> {
        let resourceUrl: string = this._uriElementsService.getDetectorsUrl(subscriptionId, resourceGroup, siteName, diagnosticCategory, slot);
        return this._armService.getResource<any>(resourceUrl)
            .map((response: ResponseMessageCollectionEnvelope<ResponseMessageEnvelope<IDetectorDefinition>>) =>
                response.value.map((item: ResponseMessageEnvelope<IDetectorDefinition>) => <IDetectorDefinition>item.properties))
            .catch(this.handleError);
    }

    getDetectorResource(subscriptionId: string, resourceGroup: string, siteName: string, slot: string, diagnosticCategory:string, detectorName: string, invalidateCache: boolean = false, startTime: string = '', endTime: string = ''): Observable<IDetectorResponse> {

         let cacheKey = this.getCacheKey(diagnosticCategory, detectorName);
        // if (this._detectorResponseCache && this._detectorResponseCache[cacheKey]) {
        //     return Observable.of<IDetectorResponse>(this._detectorResponseCache[cacheKey]);
        // }

        let resourceUrl: string = this._uriElementsService.getDetectorResourceUrl(subscriptionId, resourceGroup, siteName, slot, diagnosticCategory, detectorName, startTime, endTime);

        return this._armService.postResource<ResponseMessageEnvelope<IDetectorResponse>>(resourceUrl, null, null, invalidateCache)
            .map((response: ResponseMessageEnvelope<IDetectorResponse>) => <IDetectorResponse>response.properties)
            .do((data: IDetectorResponse) => {
                this._detectorResponseCache[cacheKey] = data;

                if (detectorName.toLowerCase() === 'runtimeavailability') {

                    let isAppCurrentlyHealthy: boolean = true;

                    let currentAppHealth = this._detectorResponseCache[cacheKey].data[0].find(p => p.name.toLowerCase() === "currentapphealth");
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

    getDiagnosticProperties(subscriptionId: string, resourceGroup: string, siteName: string, slot: string, invalidateCache: boolean = false): Observable<IDiagnosticProperties> {

        // if (this._propertiesCache && this._propertiesCache['diagnosticProperties']) {
        //     return Observable.of<IDiagnosticProperties>(this._propertiesCache['diagnosticProperties']);
        // }

        let resourceUrl: string = this._uriElementsService.getDiagnosticPropertiesUrl(subscriptionId, resourceGroup, siteName, slot);

        return this._armService.getResource<ResponseMessageEnvelope<IDiagnosticProperties>>(resourceUrl, null, invalidateCache)
            .map((response: ResponseMessageEnvelope<IDiagnosticProperties>) => <IDiagnosticProperties>response.properties)
            .do((data: IDiagnosticProperties) => this._propertiesCache['diagnosticProperties'] = data)
            .catch(this.handleError);
    }

    invalidateCache(): void {
        this._analysisCache = {};
        this._detectorResponseCache = {};
        this._propertiesCache = {};
    }

    private getCacheKey(diagnosticCategory: string, identifier): string {
        return (`${diagnosticCategory}_${identifier}`).toLowerCase();
    }

    private handleError(error: any) {
        return Observable.throw(error);
    }
}