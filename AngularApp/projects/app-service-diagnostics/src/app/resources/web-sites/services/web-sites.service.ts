import { Injectable } from '@angular/core';
import { ResourceService } from '../../../shared-v2/services/resource.service';
import { OperatingSystem, Site, HostingEnvironmentKind } from '../../../shared/models/site';
import { AppType } from '../../../shared/models/portal';
import { AppAnalysisService } from '../../../shared/services/appanalysis.service';
import { ArmService } from '../../../shared/services/arm.service';
import { ServerFarm, Sku } from '../../../shared/models/server-farm';
import { IDiagnosticProperties } from '../../../shared/models/diagnosticproperties';
import { flatMap } from 'rxjs/operators';
import { PortalReferrerMap } from '../../../shared/models/portal-referrer-map';
import { DetectorType } from 'diagnostic-data';
import { of,  Observable, BehaviorSubject } from 'rxjs';
import { ArmResource } from '../../../shared-v2/models/arm';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Injectable({providedIn: 'root'})
export class WebSitesService extends ResourceService {

    private _resourceGroup: string;
    private _siteName: string;
    private _slotName: string;

    public appStack: string = '';
    public platform: OperatingSystem = OperatingSystem.any;
    public appType: AppType = AppType.WebApp;
    public sku: Sku = Sku.All;
    public hostingEnvironmentKind: HostingEnvironmentKind = HostingEnvironmentKind.All;
    public numberofCriticalChecks: number = 0;
    public reliabilityChecksResults: any = {};

    constructor(protected _armService: ArmService, private _appAnalysisService: AppAnalysisService) {
        super(_armService);
    }

    public getIbizaBladeToDetectorMapings():Observable<PortalReferrerMap[]> {
        return this.warmUpCallFinished.pipe(flatMap( ()=>{
            let bladeToDetectorMap:PortalReferrerMap[];

            bladeToDetectorMap = [{
                ReferrerExtensionName: 'Websites',
                ReferrerBladeName: 'CertificatesBlade',
                ReferrerTabName: 'Bindings',
                DetectorType: DetectorType.Detector,
                DetectorId: 'configuringsslandcustomdomains'
            },
            {
                ReferrerExtensionName: 'Websites',
                ReferrerBladeName: 'CustomDomainsAndSSL',
                ReferrerTabName: '',
                DetectorType: DetectorType.Detector,
                DetectorId: 'configuringsslandcustomdomains'
            }];


            if(this.appType == AppType.WebApp) {
                bladeToDetectorMap.push({
                    ReferrerExtensionName: 'Websites',
                    ReferrerBladeName: 'BackupSummaryBlade',
                    ReferrerTabName: '',
                    DetectorType: DetectorType.Detector,
                    DetectorId: 'backupFailures'
                });
            }
            return of(bladeToDetectorMap);
        }  ));
    }

    public getPesId(): Observable<string> {
        return this.warmUpCallFinished.pipe(flatMap(() => {
            if (this.appType == AppType.WebApp && this.platform == OperatingSystem.windows){
                return of("14748");
            }
            else if (this.appType == AppType.WebApp && this.platform == OperatingSystem.linux){
                return of("16170");
            }
            else if (this.appType == AppType.FunctionApp){
                return of("16072");
            }
            else{
                return of(null);
            }
        }));
    }

    public get searchSuffix(): string {
        return this.appType === AppType.WebApp ? this.platform === OperatingSystem.windows ? 'Azure Web App' : 'Azure Web App(Linux)' : 'Azure Function';
    }

    public get azureServiceName(): string {
        return this.appType === AppType.WebApp ? this.platform === OperatingSystem.windows ? 'Web App (Windows)' : 'Web App (Linux)' : 'Function App';
    }

    public get isApplicableForLiveChat(): boolean {
        return this.resource
            && (this.appType & AppType.WebApp) > 0 //Do not enable chat for Function apps
            && (this.platform & (OperatingSystem.windows | OperatingSystem.linux)
            ) > 0;
    }

    public get liveChatEnabledSupportTopicIds():string[] {
        if(this.isApplicableForLiveChat) {
            if(this.appType === AppType.FunctionApp) {
                return [];
            }
            else if (this.appType === AppType.WebApp) {
                if(this.platform === OperatingSystem.windows) {
                    return [
                        '32583701', //Availability and Performance/Web App experiencing High CPU
                        '32542218', //Availability and Performance/Web App Down
                        '32581616', //Availability and Performance/Web App experiencing High Memory Usage
                        '32457411', //Availability and Performance/Web App Slow
                        '32570954', //Availability and Performance/Web App Restarted
                        '32440123', //Configuration and Management/Configuring SSL
                        '32440122', //Configuration and Management/Configuring custom domain names
                        '32542210', //Configuration and Management/IP Configuration
                        '32581615', //Configuration and Management/Deployment Slots
                        '32542208', //Configuration and Management/Backup and Restore
                        '32589277', //How Do I/Configure domains and certificates,
                        '32589281', //How Do I/IP Configuration
                        '32588774', // Deployment/Visual Studio
                        '32589276' //How Do I/Backup and Restore
                      ];
                }
                else if (this.platform === OperatingSystem.linux) {
                    return [
                        '32542218', //Availability and Performance/Web App Down
                        '32570954', //Availability and Performance/Web App Restarted
                        '32440123', //Configuration and Management/Configuring SSL
                        '32440122', //Configuration and Management/Configuring custom domain names
                        '32542208', //Configuration and Management/Backup and Restore
                        '32542210' //Configuration and Management/IP Configuration
                      ];
                }
                else {
                    return [];
                }
            }
        }
        else {
            return [];
        }
    }

    public getSitePremierAddOns(resourceUri: string): Observable<any> {
        return this._armService.getArmResource(`${resourceUri}/premieraddons`, '2018-02-01');
    }

    public getRiskAlertsResult():Observable<any> {
        return this.warmUpCallFinished.pipe(flatMap( ()=>{
            let resourceUri = this.resource.id;
            let serverFarmId = this.resource.properties.serverFarmId;

            const resourceTasks = forkJoin(
                this._armService.getArmResource(`${resourceUri}/config/web`, '2018-02-01'),
                this._armService.getResourceWithoutEnvelope<ServerFarm>(serverFarmId)
            );

            return resourceTasks;
        }  ));


        // resourceTasks.subscribe(results => {
        //     let res: any = results[0];
        //     autoHealEnabled = res.properties.autoHealEnabled;
        //     healthCheckEnabled = res.properties.healthCheckPath != null && res.properties.healthCheckPath.toString() !== '' && res.properties.healthCheckPath.toString().length >= 1;
        //     this.numberofCriticalChecks = autoHealEnabled ? this.numberofCriticalChecks : this.numberofCriticalChecks+1;
        //     this.numberofCriticalChecks = healthCheckEnabled ? this.numberofCriticalChecks : this.numberofCriticalChecks+1;
        //     console.log("webconfiginfo", res, res.properties, res.properties.autoHealEnabled);
        //     console.log("this.numberofCriticalChecks", this.numberofCriticalChecks, autoHealEnabled, healthCheckEnabled);

        //     let severfarmResource: any = results[1];
        //     let numberOfWorkers = severfarmResource.properties.numberOfWorkers;
        //     let numberOfSites = severfarmResource.properties.numberOfSites;

        //     this.numberofCriticalChecks = numberOfWorkers > 1 ? this.numberofCriticalChecks : this.numberofCriticalChecks+1;


        //     var a = {
        //         "numberofCriticalChecks": this.numberofCriticalChecks,
        //         "autoHealEnabled": autoHealEnabled,
        //         "healthCheckEnabled": healthCheckEnabled,
        //         "numberOfWorkers": numberOfWorkers,
        //         "numberOfSites": numberOfSites
        //     };



        //     console.log("resourceTasksInfo", results, a);

        //     return a;
       // });



        // this._authService.getStartupInfo().pipe(
        //     mergeMap((startUpInfo: StartupInfo) => {
        //         return this._armService.getResource<Site>(startUpInfo.resourceId);
        //     }),
        //     mergeMap((site: ResponseMessageEnvelope<Site>) => {
        //         this.currentSite = site.properties;
        //         return this._rbacService.hasPermission(this.currentSite.serverFarmId, [this._rbacService.readScope]);
        //     }))
        //     .subscribe((hasPermission: boolean) => {
        //         this.hasReadAccessToServerFarm = hasPermission;
        //         this.initialize();
        //     })

    }

    // public getServiceHealthCommunications(): Observable<any[]> {

    //     return this._authService.getStartupInfo().pipe(
    //       mergeMap((startupInfo: StartupInfo) => {

    //         var subscriptionId: string = ResourceDescriptor.parseResourceUri(startupInfo.resourceId).subscription;
    //         return this._armService.getArmResource<any>(`/subscriptions/${subscriptionId}/providers/Microsoft.ResourceHealth/events`, '2018-07-01').pipe(
    //           map((response: any) => {

    //             var commsList = new Array();
    //             var alertFound: boolean = false;
    //             response.value.forEach((item: any) => {
    //               if (item.properties && item.properties.eventType && item.properties.eventType === 'ServiceIssue') {
    //                 var comm = {
    //                   publishedTime: item.properties['lastUpdateTime'],
    //                   title: item.properties['title'],
    //                   richTextMessage: item.properties['description'],
    //                   status: item.properties['status'] === 'Active' ? CommunicationStatus.Active : CommunicationStatus.Resolved,
    //                   incidentId: item.name,
    //                   isAlert: false,
    //                   isExpanded: false,
    //                   commType: 0
    //                 };

    //                 commsList.push(comm);
    //               }
    //             });

    //             var activeComm = commsList.find(item => item.status === CommunicationStatus.Active);
    //             if(activeComm){
    //               activeComm.isAlert = true;
    //               this._logger.LogAzureCommShown(activeComm.incidentId, activeComm.title, 'ServiceHealth', activeComm.isExpanded, activeComm.status === 0, activeComm.publishedTime);
    //             }

    //             return commsList;
    //           })
    //         );
    //       })
    //     );
    //   }


    protected makeWarmUpCalls() {
        super.makeWarmUpCalls();
        this._populateSiteInfo();
        this.warmUpCallFinished.next(true);
        this.reliabilityChecksResults = this.getRiskAlertsResult();
    }

    private _populateSiteInfo(): void {
        console.log("resourceInfo", this.resource, this.resource.properties.serverFarmId);
        const pieces = this.resource.id.toLowerCase().split('/');
        this._subscription = pieces[pieces.indexOf('subscriptions') + 1];
        this._resourceGroup = pieces[pieces.indexOf('resourcegroups') + 1];
        this._siteName = pieces[pieces.indexOf('sites') + 1];
        this._slotName = pieces.indexOf('slots') >= 0 ? pieces[pieces.indexOf('slots') + 1] : '';

        const site: Site = <Site>this.resource.properties;

        this._appAnalysisService.getDiagnosticProperties(this._subscription, this._resourceGroup, this._siteName, this._slotName).subscribe((data: IDiagnosticProperties) => {
            this.appStack = data && data.appStack && data.appStack != '' ? data.appStack : '';
        });

        this.appType = site.kind.toLowerCase().indexOf('functionapp') >= 0 ? AppType.FunctionApp : AppType.WebApp;
        this.platform = site.kind.toLowerCase().indexOf('xenon') >= 0 ? OperatingSystem.HyperV : site.kind.toLowerCase().indexOf('linux') >= 0 ? OperatingSystem.linux : OperatingSystem.windows;
        this.sku = Sku[site.sku];
        this.hostingEnvironmentKind = this.getHostingEnvirontmentKind(site);
    }

    private getHostingEnvirontmentKind(site: Site) {
        let scmHostName = site.enabledHostNames.find(h => h.indexOf('.scm.') > 0);
        return site.hostingEnvironmentId == null ? HostingEnvironmentKind.None : (scmHostName.toLowerCase().endsWith(".azurewebsites.net") ? HostingEnvironmentKind.Public : HostingEnvironmentKind.ILB);
    }
}
