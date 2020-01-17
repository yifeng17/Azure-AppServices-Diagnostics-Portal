import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetectorControlService } from 'diagnostic-data';
import { ICalendarStrings, IDatePickerProps, IChoiceGroupOption } from 'office-ui-fabric-react';
import { addMonths, addDays } from 'office-ui-fabric-react/lib/utilities/dateMath/DateMath';
import * as momentNs from 'moment';
import { Globals } from '../../../globals';
@Component({
  selector: 'detector-time-picker',
  templateUrl: './detector-time-picker.component.html',
  styleUrls: ['./detector-time-picker.component.scss']
})
export class DetectorTimePickerComponent implements OnInit {
  @Input() showChoices: boolean = false;
  @Output() updateTimerMessage: EventEmitter<string> = new EventEmitter<string>();
  internalTime: string = "";
  showCalendar: boolean = false;
  showTimerPicker: boolean = false;

  //today should current UTC time
  today: Date = new Date(Date.now());
  maxDate: Date = this.today;
  minDate: Date = addMonths(this.today, -1);

  set time(value: string) {
    console.log("time picker title", value);
    this.updateTimerMessage.next(value);
    // this.time = value;
  };
  startDate: Date;
  endDate: Date;
  isCustom: boolean = false;
  //set Last xx hours
  hourDiff: number = 24;

  startClock: string;
  endClock: string;
  timeDiffError: string = "";

  formatDate: IDatePickerProps['formatDate'] = (date) => { return this.convertDateToString(date, false) };

  choiceGroupOptions: IChoiceGroupOption[] = [
    { key: 'Last1Hour', text: 'Last 1 Hour', onClick: () => { this.setTime(1); this.showTimerPicker = false } },
    { key: 'Last6Hours', text: 'Last 6 Hours', onClick: () => { this.setTime(6); this.showTimerPicker = false } },
    { key: 'Last12Hour', text: 'Last 12 Hours', onClick: () => { this.setTime(12); this.showTimerPicker = false } },
    { key: 'Last24Hours', text: 'Last 24 Hours', onClick: () => { this.setTime(24); this.showTimerPicker = false } },
    { key: 'Custom', text: 'Custom', onClick: () => { this.showTimerPicker = true; this.isCustom = true; this.timeDiffError = ""; this.prefillCustom() } },
  ];

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

  constructor(private activatedRoute: ActivatedRoute, private detectorControlService: DetectorControlService, private router: Router, public globals: Globals) { }

  ngOnInit() {
    this.startDate = addDays(this.today, -1);
    this.endDate = this.today;

    this.hourDiff = 24;
    const endTime = this.today;
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
      // if (validUpdate) {
      //   this.startTime = this.detectorControlService.startTimeString;
      //   this.endTime = this.detectorControlService.endTimeString;
      // }

      const routeParams = {
        'startTime': this.detectorControlService.startTime.format('YYYY-MM-DDTHH:mm'),
        'endTime': this.detectorControlService.endTime.format('YYYY-MM-DDTHH:mm')
      };
      if (this.detectorControlService.detectorQueryParamsString != "") {
        routeParams['detectorQueryParams'] = this.detectorControlService.detectorQueryParamsString;
      }
      this.router.navigate([], { queryParams: routeParams, relativeTo: this.activatedRoute });

      // this.updateTimerMessage.next(this.time);
    });
  }

  setTime(hourDiff: number) {
    this.isCustom = false;
    this.hourDiff = hourDiff;
  }

  cancelTimeRange() {
    this.globals.openTimePicker = false;
  }

  //Apply button
  applyTimeRange() {

    // this.showChoices = !this.showChoices;
    let startDateWithTime: string;
    let endDateWithTime: string;

    if (this.isCustom) {
      startDateWithTime = this.convertDateToString(this.convertLocalDateToUTC(this.startDate, this.startClock));
      endDateWithTime = this.convertDateToString(this.convertLocalDateToUTC(this.endDate, this.endClock));
    } else {
      const endTime = new Date(Date.now());
      const startTime = new Date(endTime.getTime() - this.hourDiff * 60 * 60 * 1000);
      startDateWithTime = this.convertDateToString(startTime);
      endDateWithTime = this.convertDateToString(endTime);
    }


    this.internalTime = `${startDateWithTime} to ${endDateWithTime}`;
    this.time = "UTC Time Range (" + this.internalTime + ")";

    this.timeDiffError = this.detectorControlService.getTimeDurationError(startDateWithTime, endDateWithTime);
    if (this.timeDiffError === '') {
      this.detectorControlService.setCustomStartEnd(startDateWithTime, endDateWithTime);
    }
    this.globals.openTimePicker = this.timeDiffError !== "";
  }

  onSelectStartDateHandler(e: { date: Date }) {
    this.startDate = e.date;
    this.isCustom = true;
  }
  onSelectEndDateHandler(e: { date: Date }) {
    this.endDate = e.date;
    this.isCustom = true;
  }

  private convertLocalDateToUTC(date: Date, time: string): Date {
    const hour = Number.parseInt(time.split(":")[0]);
    const minute = Number.parseInt(time.split(":")[1]);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute));
  }

  private convertDateToString(date: Date, withHours: boolean = true): string {
    const moment = momentNs.utc(date.toISOString());
    const stringFormat: string = withHours ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    return moment.format(stringFormat);
  }

  //when click LastXX hours,prefill into custom input
  //shoould be UTC time
  prefillCustom() {
    this.startDate = new Date(this.today.getTime() - this.hourDiff * 60 * 60 * 1000);
    this.endDate = this.today;
    // const currentUTCTime = new Date();


    this.startClock = `${this.startDate.getHours()}:${this.startDate.getMinutes()}`;
    this.endClock = `${this.endDate.getHours()}:${this.endDate.getMinutes()}`;
  }
}
