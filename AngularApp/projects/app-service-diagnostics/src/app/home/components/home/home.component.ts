import { DetectorControlService, FeatureNavigationService, DetectorResponse } from 'diagnostic-data';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../../shared-v2/models/category';
import { CategoryService } from '../../../shared-v2/services/category.service';
import { FeatureService } from '../../../shared-v2/services/feature.service';
import { LoggingV2Service } from '../../../shared-v2/services/logging-v2.service';
import { NotificationService } from '../../../shared-v2/services/notification.service';
import { ResourceService } from '../../../shared-v2/services/resource.service';
import { HomePageText } from '../../../shared/models/arm/armResourceConfig';
import { ArmService } from '../../../shared/services/arm.service';
import { AuthService } from '../../../startup/services/auth.service';
import { TelemetryService } from 'diagnostic-data';
import { PortalKustoTelemetryService } from '../../../shared/services/portal-kusto-telemetry.service';
import { WebSitesService } from '../../../resources/web-sites/services/web-sites.service';
import { AppType } from '../../../shared/models/portal';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { DiagnosticService } from 'diagnostic-data';
import { ISearchBoxProps } from 'office-ui-fabric-react';
import { FabDropdownComponent } from '@angular-react/fabric';
import { HttpResponse } from '@angular/common/http';
// import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import {
    ICalendarStrings,
    IContextualMenuProps,
    ISelection,
    Selection,
    DropdownMenuItemType,
    IDropdownOption,
    ICheckboxProps,
    IPersonaProps,
    IPeoplePickerProps,
    IIconProps
} from 'office-ui-fabric-react';
// import { FabPeoplePickerComponent } from '@angular-react/fabric/public-api';
import { from } from 'rxjs';


@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    logEvent(...args: any[]) {
        console.log(args);
    }

    selectedItem?: IDropdownOption;
    options: FabDropdownComponent['options'] = [
        { key: 'A', text: 'Option a' },
        { key: 'B', text: 'Option b' },
        { key: 'C', text: 'Option c' },
        { key: 'D', text: 'Option d' },
        { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
        { key: 'E', text: 'Option e' },
        { key: 'F', text: 'Option f' },
        { key: 'G', text: 'Option g' },
    ];


    strings: ICalendarStrings = {
        months: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ],

        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

        shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

        goToToday: 'Go to today',
        weekNumberFormatString: 'Week number {0}',
    };

    detailItems = [
        { field1: 'f1content1', field2: 'f2content1' },
        { field1: 'f1content2', field2: 'f2content2' },
        { field1: 'f1content3', field2: 'f2content3' },
        { field1: 'f1content4' },
        { field2: 'f2content5' },
    ];

    onNewClicked() {
        console.log('New clicked');
    }

    onCopyClicked() {
        console.log('Copy clicked');
    }

    onSaveAsClicked() {
        console.log('Save as clicked');
    }

    onSaveAsFirstClicked() {
        console.log('Save as 1 clicked');
    }

    onSaveAsSecondClicked() {
        console.log('Save as 2 clicked');
    }

    customItemCount = 1;

    onCustomItemClick(item: any) {
        this.customItemCount++;
        console.log('custom item clicked', item);
    }

    onColumnHeaderClicked(event: any) {
        console.log('Column header clicked', event);
    }



    disabled = true;
    dialogHidden = true;
    sampleContentCounter = 0;
    secondsCounter = 0;
    sampleContent2 = '0 Seconds Passed';
    sampleContent3 = '';
    selectedComboBoxKey: string = "None";
    selectedComboBoxValue: string = "None";
    selectedDate: Date;

    //   comboBoxOptions: IComboBoxOption[] = [
    //     { key: 'A', text: 'See option A' },
    //     { key: 'B', text: 'See option B' },
    //   ];

    onSelectDate(event) {
        this.selectedDate = event.date;
    }

    comboChange(event) {
        this.selectedComboBoxKey = event.option.key;
        this.selectedComboBoxValue = event.option.text;
    }

    get sampleContent() {
        return `Button clicked ${this.sampleContentCounter} times.`;
    }

    toggle() {
        this.disabled = !this.disabled;
    }

    toggleDialog() {
        this.dialogHidden = !this.dialogHidden;
        this.sampleContent3 = '';
    }

    click() {
        this.sampleContentCounter += 1;
    }

    clickSave() {
        this.sampleContent3 = 'Saved...';
    }

    iconProps: ISearchBoxProps['iconProps'] = { iconName: 'Filter' };
    resourceName: string;
    categories: Category[];
    searchValue = '';
    searchBoxFocus: boolean;
    searchLogTimout: any;
    event: any;
    subscriptionId: string;
    searchResultCount: number;
    homePageText: HomePageText;
    searchPlaceHolder: string;
    providerRegisterUrl: string;
    get inputAriaLabel(): string {
        return this.searchValue !== '' ?
            `${this.searchResultCount} Result` + (this.searchResultCount !== 1 ? 's' : '') :
            '';
    }

    get isIE_Browser(): boolean {
        return /msie\s|trident\//i.test(window.navigator.userAgent);
    }

    get isPublicAzure(): boolean {
        return ((window.location != window.parent.location) ? document.referrer : document.location.href).includes("azure.com");
    }

    constructor(private _resourceService: ResourceService, private _categoryService: CategoryService, private _notificationService: NotificationService, private _router: Router,
        private _detectorControlService: DetectorControlService, private _featureService: FeatureService, private _logger: LoggingV2Service, private _authService: AuthService,
        private _navigator: FeatureNavigationService, private _activatedRoute: ActivatedRoute, private armService: ArmService, private logService: TelemetryService, private kustologgingService: PortalKustoTelemetryService, private _diagnosticService: DiagnosticService) {

        const i = setInterval(() => {
            this.secondsCounter += 1;
            this.sampleContent2 = `${this.secondsCounter} Seconds Passed`;
        }, 1000);

        setTimeout(() => {
            clearInterval(i);
        }, 12000);

        if (_resourceService.armResourceConfig && _resourceService.armResourceConfig.homePageText
            && _resourceService.armResourceConfig.homePageText.title && _resourceService.armResourceConfig.homePageText.title.length > 1
            && _resourceService.armResourceConfig.homePageText.description && _resourceService.armResourceConfig.homePageText.description.length > 1
            && _resourceService.armResourceConfig.homePageText.searchBarPlaceHolder && _resourceService.armResourceConfig.homePageText.searchBarPlaceHolder.length > 1) {
            this.homePageText = _resourceService.armResourceConfig.homePageText;
            this.searchPlaceHolder = this.homePageText.searchBarPlaceHolder;
        }
        else {
            if (this._resourceService.resource.type === 'Microsoft.Web/hostingEnvironments') {
                this.homePageText = {
                    title: 'App Service Environment Diagnostics',
                    description: 'Use App Service Environment Diagnostics to investigate how your App Service Environment is performing, diagnose issues, and discover how to\
          improve the availability of your App Service Environment. Select the problem category that best matches the information or tool that you\'re\
          interested in:',
                    searchBarPlaceHolder: 'Search App Service Environment Diagnostics'
                };
                this.searchPlaceHolder = this.homePageText.searchBarPlaceHolder;
            }
            else {
                if (this._resourceService && this._resourceService instanceof WebSitesService && (this._resourceService as WebSitesService).appType === AppType.FunctionApp) {
                    this.homePageText = {
                        title: 'Azure Functions Diagnostics',
                        description: 'Use Azure Functions Diagnostics to investigate how your function app is performing, diagnose issues, and discover how to\
            improve your function app. Select the problem category that best matches the information or tool that you\'re\
            interested in:',
                        searchBarPlaceHolder: 'Search Azure Functions Diagnostics'
                    };
                    this.searchPlaceHolder = this.homePageText.searchBarPlaceHolder;
                }
                else {
                    this.homePageText = {
                        title: 'App Service Diagnostics',
                        description: 'Use App Service Diagnostics to investigate how your app is performing, diagnose issues, and discover how to\
            improve your application. Select the problem category that best matches the information or tool that you\'re\
            interested in:',
                        searchBarPlaceHolder: 'Search App Service Diagnostics'
                    };
                    this.searchPlaceHolder = this.homePageText.searchBarPlaceHolder;
                }
            }
        }

        if (this.isPublicAzure == false && this.isIE_Browser == false) {
            this.homePageText = {
                title: 'Azure Kubernetes Service Diagnostics',
                description: 'Explore ways to diagnose and troubleshoot the common problems of your cluster from CRUD operations to connection problems. Click on any of the documents below to start troubleshooting.',
                searchBarPlaceHolder: 'Search a keyword that best describes your issue'
            };
        }

        if (_resourceService.armResourceConfig) {
            this._categoryService.initCategoriesForArmResource(_resourceService.resource.id);
        }

        this._categoryService.categories.subscribe(categories => this.categories = categories);


        this._authService.getStartupInfo().subscribe(startupInfo => {
            if (startupInfo.additionalParameters && Object.keys(startupInfo.additionalParameters).length > 0) {
                let path = 'resource' + startupInfo.resourceId.toLowerCase();
                path = this._updateRouteBasedOnAdditionalParameters(path, startupInfo.additionalParameters);
                if (path) {
                    this._router.navigateByUrl(path);
                }
            }
        });
        this.subscriptionId = this._activatedRoute.snapshot.params['subscriptionid'];
    }

    ngOnInit() {
        this.resourceName = this._resourceService.resource.name;
        this.providerRegisterUrl = `/subscriptions/${this.subscriptionId}/providers/Microsoft.ChangeAnalysis/register`;
        if (!this._detectorControlService.startTime) {
            this._detectorControlService.setDefault();
        }

        if (this._resourceService.resource.type === 'Microsoft.Web/sites') {
            // Register Change Analysis Resource Provider.
            this.armService.postResourceFullResponse(this.providerRegisterUrl, {}, true, '2018-05-01').subscribe((response: HttpResponse<{}>) => {
                let eventProps = {
                    url: this.providerRegisterUrl
                };
                this.kustologgingService.logEvent("Change Analysis Resource Provider registered", eventProps);
            }, (error: any) => {
                this.logHTTPError(error, 'registerResourceProvider');
            });
        }


        if (!this._detectorControlService.startTime) {
            this._detectorControlService.setDefault();
        }

        this.logService.logEvent("telemetry service logging", {});
        this.kustologgingService.logEvent("kusto telemetry service logging", {});


        initializeIcons('https://static2.sharepointonline.com/files/fabric/assets/icons/');

    };

    onSearchBoxFocus(event: any): void {
        this.searchBoxFocus = true;
    }

    clearSearch() {
        this.searchBoxFocus = false;
        this.searchValue = '';
        this.searchResultCount = 0;
    }

    updateSearchValue(searchValue) {
        this.searchValue = searchValue.newValue;

        if (this.searchLogTimout) {
            clearTimeout(this.searchLogTimout);
        }

        this.searchLogTimout = setTimeout(() => {
            this._logSearch();
        }, 5000);
    }

    onResultCount(count: number) {
        this.searchResultCount = count;
    }

    // onSearchLostFocus() {
    //     if (this.searchValue === '') {
    //         this.searchResultCount = 0;
    //     }
    // }

    // onFocusClear() {
    //     if (this.searchValue === '') {
    //         this.clearSearch();
    //     }
    // }

    private _updateRouteBasedOnAdditionalParameters(route: string, additionalParameters: any): string {
        if (additionalParameters.featurePath) {
            let featurePath: string = additionalParameters.featurePath;
            featurePath = featurePath.startsWith('/') ? featurePath.replace('/', '') : featurePath;

            return `${route}/${featurePath}`;
        }

        return null;
    }

    private _logSearch() {
        this._logger.LogSearch(this.searchValue);
    }

    private logHTTPError(error: any, methodName: string): void {
        let errorLoggingProps = {
            errorMsg: error.message ? error.message : 'Server Error',
            statusCode: error.status ? error.status : 500
        };
        this.kustologgingService.logTrace('HTTP error in ' + methodName, errorLoggingProps);
    }
}

