import { Component, OnInit, ViewChild, Input, Output, TemplateRef, ElementRef, Renderer2, EventEmitter } from '@angular/core';
import { addMonths, addYears, addDays, addWeeks } from 'office-ui-fabric-react/lib/utilities/dateMath/DateMath';
import { FabDropdownComponent } from '@angular-react/fabric';
import * as momentNs from 'moment';
import {
  PanelType,
  IPanelStyles,
  ICalendarStrings,
  IContextualMenuProps,
  ISelection,
  Selection,
  DropdownMenuItemType,
  IDropdownOption,
  ICheckboxProps,
  IPersonaProps,
  IPeoplePickerProps
} from 'office-ui-fabric-react';
import { Globals } from '../../../globals';
import { ActivatedRoute, Router } from '@angular/router';
import { DetectorControlService } from 'projects/diagnostic-data/src/lib/services/detector-control.service';

@Component({
  selector: 'detector-command-bar',
  templateUrl: './detector-command-bar.component.html',
  styleUrls: ['./detector-command-bar.component.scss']
})
export class DetectorCommandBarComponent implements OnInit {
  @ViewChild('timepicker', { static: true }) timepicker: any;
  @Input() openPanel: boolean = false;
  @Output() openPanelChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  internalTime: string = "";
  showCalendar: boolean = false;
  showTypingMessage: boolean;
  selectedItem?: IDropdownOption;
  timeDivider: DropdownMenuItemType = DropdownMenuItemType.Divider;
  options: IDropdownOption[] = [
    { key: 'Last1Hour', text: 'Last 1 Hour', data: { iconProps: { iconName: 'CaretRight' }, } },
    { key: 'Last6Hours', text: 'Last 6 Hours', data: { icon: "RadioButtonOff" } },
    { key: 'Last12Hour', text: 'Last 12 Hours', data: { icon: "RadioButtonOff" } },
    { key: 'Last24Hours', text: 'Last 24 Hours', data: { icon: "RadioButtonOff" } },
    { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
    { key: 'Custom', text: 'Custom', data: { icon: "RadioButtonOff" } }
  ];

  dropdownStyles = {
    // type: PanelType.smallFixedNear,
    openPanel: false
    //   customWidth: "585",
  };



  showChoices: boolean = false;
  showTimerPicker: boolean = false;
  calloutStyles: any = {
    overflowY: "hidden",
    right: 20,
    top: 50,
    padding: 10
  };

  choiceGroupOptions: any = [
    { key: 'Last1Hour', text: 'Last 1 Hour', onClick: () => { this.setTime(1); this.showTimerPicker = false } },
    { key: 'Last6Hours', text: 'Last 6 Hours', onClick: () => { this.setTime(6); this.showTimerPicker = false } },
    { key: 'Last12Hour', text: 'Last 12 Hours', onClick: () => { this.setTime(12); this.showTimerPicker = false } },
    { key: 'Last24Hours', text: 'Last 24 Hours', onClick: () => { this.setTime(24); this.showTimerPicker = false } },
    { key: 'Custom', text: 'Custom', onClick: () => { this.showTimerPicker = true;this.isCustom = true;this.timeDiffError = "" } },
  ];

  logEvent(...args: any[]) {
    console.log(args);
    if (args.length > 1 && args[1].option != undefined && args[1].option.key === "Custom") {
      this.dropdownStyles.openPanel = true;
      this.options.push({ key: 'StartTime', text: 'Start Time' });
      this.options.push({ key: 'EndTime', text: 'End Time' });
    }
  }

  // commandbar related
  commandbarStyles = {
    // type: PanelType.smallFixedNear,
    backgroundColor: "blue"
    //   customWidth: "585",

  };
  listenObj: any;
  dropdownOpen: boolean = true;
  customizeTime: boolean = false;
  customIcon: string = "RadioBtnOff";
  time: string = "Time Range (Last 24 Hours)";


  itemProps1: Partial<IContextualMenuProps> = {
    onItemClick: (ev, item) => {
      console.log(`${item.text} clicked`);
      return false;
    }
  };
  timeDiffError: string = "";
  startTime: string;
  endTime: string;
  constructor(private globals: Globals, private _activatedRoute: ActivatedRoute, private detectorControlService: DetectorControlService, public _router: Router) {

  }

  ngOnInit() {
    console.log("Init commandbar with OpenPanel", this.openPanel);
    this.startDate = addDays(this.today, -1);
    this.endDate = this.today;
    //set the HH:MM:SS to 0 for start date and end date
    // this.startDate.setHours(0, 0, 0, 0);
    // this.endDate.setHours(0, 0, 0, 0);

      this.hourDiff = 24;
      const endTime = new Date(Date.now());
      const startTime = new Date(endTime.getTime() - this.hourDiff * 60 * 60 * 1000);
      const startDateWithTime = this.convertDateToString(startTime);
      const endDateWithTime = this.convertDateToString(endTime);
      this.internalTime = `${startDateWithTime} to ${endDateWithTime}`;
      this.time = "Time Range (" + this.internalTime + ")";




    this.timeDiffError = '';
    if (this.detectorControlService.timeRangeDefaulted) {
      this.timeDiffError = this.detectorControlService.timeRangeErrorString;
    }
    this.detectorControlService.update.subscribe(validUpdate => {
      if (validUpdate) {
        this.startTime = this.detectorControlService.startTimeString;
        this.endTime = this.detectorControlService.endTimeString;
      }

      const routeParams = {
        'startTime': this.detectorControlService.startTime.format('YYYY-MM-DDTHH:mm'),
        'endTime': this.detectorControlService.endTime.format('YYYY-MM-DDTHH:mm')
      };
      if (this.detectorControlService.detectorQueryParamsString != "") {
        routeParams['detectorQueryParams'] = this.detectorControlService.detectorQueryParamsString;
      }
      this._router.navigate([], { queryParams: routeParams, relativeTo: this._activatedRoute });

    });
  }

  setText(event: any) {
    this.time = "Setting the time";
    this.customizeTime = true;
    this.customIcon = "RadioBtnOn";

    //     console.log("item", item);
    //     console.log("event", event, event.item.onClick);
    //    // event.preventDefault();
    //     event.item.onClick = ((e) => {
    //         e.preventDefault();
    //     });

    console.log("time picker", this.timepicker);
    var x = document.getElementsByClassName("ms-Callout-container");
    console.log("Callout picker", x[0], x[0]);

    //  x[0].style.display = "block";
    //console.log("Callout picker", x[0], x[0].style.display);
    //event.preventDefault();

  }

  toggleOpenState() {
    this.globals.openGeniePanel = !this.globals.openGeniePanel;
    this.openPanel = !this.openPanel;
    this.openPanelChange.emit(this.openPanel);
    console.log("toggle panel, isOpen:", this.globals.openGeniePanel);
  }


  sendFeedback() {
    this.globals.openFeedback = !this.globals.openFeedback;
  }

  refresh() {
    this.showChoices = !this.showChoices;
  }

  refreshPage() {
    this.detectorControlService.refresh();
}


  showSearch() {

  }

  onCopyClicked() {

  }

  dates: ICalendarStrings = {
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

  today: Date = new Date(Date.now());
  maxDate: Date = this.today;
  endHour: any = this.today.getHours();
  endMinutes: any = this.today.getMinutes();
  startHour: any = this.today.getHours();
  startMinutes: any = this.today.getMinutes();
  // startDate: any = addDays(this.today, -1).toISOString().split('T')[0];
  // endDate: any = this.today.toISOString().split('T')[0];
  //   minDate: Date = (new Date(Date.now())).add(-30).days();
  //   maxDate: Date = new Date(Date.now()-)
  startDate: Date;
  endDate: Date;
  minDate: Date = addMonths(this.today, -1);
  isCustom: boolean = false;
  //set Last xx hours
  hourDiff: number = 24;
  startClock: string = `00:00`;
  endClock: string = `00:00`;

  setTime(hourDiff: number) {
    this.isCustom = false;
    this.hourDiff = hourDiff;
  }

  //Apply button
  applyTimeRange() {

    // this.showChoices = !this.showChoices;
    let startDateWithTime: string;
    let endDateWithTime: string;

    if (this.isCustom) {
      const startObj = this.splitHourAndMin(this.startClock);
      const endObj = this.splitHourAndMin(this.endClock);
      startDateWithTime = this.convertDateToString(this.convertLocalDateToUTC(this.startDate, startObj.hour, startObj.minute));
      endDateWithTime = this.convertDateToString(this.convertLocalDateToUTC(this.endDate, endObj.hour, endObj.minute));
    } else {
      const endTime = new Date(Date.now());
      const startTime = new Date(endTime.getTime() - this.hourDiff * 60 * 60 * 1000);
      startDateWithTime = this.convertDateToString(startTime);
      endDateWithTime = this.convertDateToString(endTime);
    }


    this.internalTime = `${startDateWithTime} to ${endDateWithTime}`;
    this.time = "Time Range (" + this.internalTime + ")";

    this.timeDiffError = this.detectorControlService.getTimeDurationError(startDateWithTime, endDateWithTime);
    if (this.timeDiffError === '') {
      this.detectorControlService.setCustomStartEnd(startDateWithTime, endDateWithTime);
    }
    this.showChoices = this.timeDiffError !== "";
  }


  cancelTimeRange() {
    this.showChoices = !this.showChoices;
  }

  // setManulaDate() {
  //   this.timeDiffError = this.detectorControlService.getTimeDurationError(this.startTime, this.endTime);
  // }

  onSelectStartDateHandler(e: { date: Date }) {
    // this.startDate = this.convertLocalDateToUTC(e.date);
    this.startDate = e.date;
    this.isCustom = true;
  }
  onSelectEndDateHandler(e: { date: Date }) {
    // this.endDate = this.convertLocalDateToUTC(e.date);
    this.endDate = e.date;
    this.isCustom = true;
  }

  private splitHourAndMin(time: string): { hour: number, minute: number } {
    // let copiedDate = new Date(date.getTime());
    const hour = Number.parseInt(time.split(":")[0]);
    const minute = Number.parseInt(time.split(":")[1]);
    return {
      hour: hour,
      minute: minute
    };
  }

  private convertLocalDateToUTC(date: Date, hour: number, minute: number): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute));
  }

  //YYYY-MM-DD HH:MM:SS
  private convertDateToString(date: Date): string {
    //Todo: use momnet.js to format
    let s = date.toISOString();
    let strList = s.split(":");
    //remove ms part
    strList.pop();
    let dateString = strList.join(":");
    return dateString.replace("T", " ");
  }
}
