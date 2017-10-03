import { Injectable } from '@angular/core';
import { PortalService, AuthService } from '../';
import { StartupInfo } from '../../models/portal';
import { CommonLogEventType } from './events.enumerations';

@Injectable()
export class LoggingService {

    private _startUpInfo: StartupInfo;
    private _subscriptionId: string = '';
    private _resourceGroup: string = '';
    private _resourceName: string = '';
    private _resourceType: string = '';
    private _ticketBladeWorkflowId: string = '';
    private _supportTopicId: string = '';
    public appStackInfo: string = '';

    constructor(private _portalServiceInstance: PortalService, private _authServiceInstance: AuthService) {

        let self = this;

        this._authServiceInstance.getStartupInfo().subscribe(data => {

            self._startUpInfo = data;

            if (self._startUpInfo && self._startUpInfo.resourceId) {
                let parts = self._startUpInfo.resourceId.toLowerCase().split('/');

                let subscriptionIndex = parts.indexOf('subscriptions');
                self._subscriptionId = subscriptionIndex !== -1 ? parts[subscriptionIndex + 1] : '';

                let resourceGroupIndex = parts.indexOf('resourcegroups');
                self._resourceGroup = resourceGroupIndex !== -1 ? parts[resourceGroupIndex + 1] : '';

                let siteIndex = parts.indexOf('sites');
                self._resourceName = siteIndex !== -1 ? parts[siteIndex + 1] : '';

                let providerIndex = parts.indexOf('providers');
                self._resourceType = providerIndex !== -1 ? parts[providerIndex + 1] + '/' + parts[providerIndex + 2] : '';
            }

            if (self._startUpInfo) {

                if (self._startUpInfo.workflowId) {
                    self._ticketBladeWorkflowId = self._startUpInfo.workflowId;
                }

                if (self._startUpInfo.supportTopicId) {
                    self._supportTopicId = self._startUpInfo.supportTopicId;
                }
            }

            this.LogStartUpInfo(self._startUpInfo);
        });
    }

    protected _log(id: string, category: string, args: any = null): void {

        var commonArgs = {
            ticketBladeWorkflowId: this._ticketBladeWorkflowId,
            subscriptionId: this._subscriptionId,
            resourceGroup: this._resourceGroup,
            resourceType: this._resourceType,
            resourceName: this._resourceName,
            appStack: this.appStackInfo,
            supportTopicId: this._supportTopicId
        };

        var combinedArgs = {};
        Object.keys(commonArgs).forEach((key: string) => combinedArgs[key] = commonArgs[key]);
        if (args) {
            Object.keys(args).forEach((key: string) => combinedArgs[key] = args[key]);
        }

        this._portalServiceInstance.logAction(id, category, combinedArgs);
    }

    LogMessage(message: string, category: string = "Availability") {
        this._log(CommonLogEventType[CommonLogEventType.Message].toString(), category, { message: message });
    }

    LogError(errorMessage: string, category: string = "Availability") {
        this._log(CommonLogEventType[CommonLogEventType.Error].toString(), category, { message: errorMessage });
    }

    LogClickEvent(name: string, containerName: string = "", category: string = "Availability") {
        this._log(CommonLogEventType[CommonLogEventType.Click].toString(), category, {
            name: name,
            containerName: containerName
        });
    }

    LogTabOpened(name: string) {
        this._log(CommonLogEventType[CommonLogEventType.TabOpened].toString(), 'Support Home', {
            name: name
        });
    }

    LogTabClosed(name: string) {
        this._log(CommonLogEventType[CommonLogEventType.TabClosed].toString(), 'Support Home', {
            name: name
        });
    }

    LogStartUpInfo(startupInfo: StartupInfo, category: string = "Availability") {
        this._log(CommonLogEventType[CommonLogEventType.StartUp].toString(), category, {
            featureUri: startupInfo.featureUri ? startupInfo.featureUri : '',
            sessionId: startupInfo.sessionId ? startupInfo.sessionId : '',
            source: startupInfo.source ? startupInfo.source : '',
            supportTopicId: startupInfo.supportTopicId ? startupInfo.supportTopicId : ''
        });
    }

    LogMissingSolution(solutionId: number, category: string = "Availability") {
        this._log(CommonLogEventType[CommonLogEventType.MissingSolution], category, {
            solutionId: solutionId.toString()
        });
    }

    LogFeedback(source: string, helpful: boolean, category: string = "Availability") {
        this._log(CommonLogEventType[CommonLogEventType.Feedback], category, {
            source: source,
            helpful: helpful
        });
    }

    LogFeedbackMessage(source: string, message: string, category: string = "Availability") {
        this._log(CommonLogEventType[CommonLogEventType.FeedbackMessage], category, {
            source: source,
            message: message
        });
    }
}
