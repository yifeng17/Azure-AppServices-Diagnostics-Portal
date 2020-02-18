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
  @Output() updateTimerMessage: EventEmitter<string> = new EventEmitter<string>();
  internalTime: string = "";
  showCalendar: boolean = false;
  showTimePicker: boolean = false;

  
  today: Date = new Date(Date.now());
  maxDate: Date = this.convertUTCToLocalDate(this.today);
  minDate: Date = this.convertUTCToLocalDate(addMonths(this.today, -1));

  set time(value: string) {
    this.updateTimerMessage.next(value);
  };
  startDate: Date;
  endDate: Date;
  // isCustom: boolean = false;
  //set Last xx hours
  hourDiff: number = 24;

  startClock: string;
  endClock: string;
  timeDiffError: string = "";

  formatDate: IDatePickerProps['formatDate'] = (date) => { return this.convertDateToString(date, false) };

  choiceGroupOptions: IChoiceGroupOption[] = [
    { key: 'Last1Hour', text: 'Last 1 Hour', onClick: () => { this.setTime(1) } },
    { key: 'Last6Hours', text: 'Last 6 Hours', onClick: () => { this.setTime(6) } },
    { key: 'Last12Hour', text: 'Last 12 Hours', onClick: () => { this.setTime(12) } },
    { key: 'Last24Hours', text: 'Last 24 Hours', onClick: () => { this.setTime(24) } },
    { key: 'Custom', text: 'Custom', onClick: () => { this.selectCustom() } },
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
    const localEndTime = this.today;
    const localStartTime = new Date(localEndTime.getTime() - this.hourDiff * 60 * 60 * 1000);
    const startDateWithTime = this.convertLocalDateToUTC(localStartTime);
    const endDateWithTime = this.convertLocalDateToUTC(localEndTime);
    this.internalTime = `${startDateWithTime} to ${endDateWithTime}`;
    this.time = "UTC Time Range (" + this.internalTime + ")";

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
    this.showTimePicker = false;
    this.hourDiff = hourDiff;
  }

  cancelTimeRange() {
    this.globals.openTimePicker = false;
  }

  //clickHandler for apply button
  applyTimeRange() {
    let startDateWithTime: string;
    let endDateWithTime: string;
    //custom
    if (this.showTimePicker) {
      // startDateWithTime = this.convertDateToString(this.convertLocalDateToUTCWithTimeString(this.startDate, this.startClock));
      // endDateWithTime = this.convertDateToString(this.convertLocalDateToUTCWithTimeString(this.endDate, this.endClock));
      startDateWithTime = this.convertLocalDateToUTCWithTimeString(this.startDate,this.startClock);
      endDateWithTime = this.convertLocalDateToUTCWithTimeString(this.endDate,this.endClock);
    } else {
      const localEndTime = new Date();
      const localStartTime = new Date(localEndTime.getTime() - this.hourDiff * 60 * 60 * 1000);
      startDateWithTime = this.convertLocalDateToUTC(localStartTime);
      endDateWithTime = this.convertLocalDateToUTC(localEndTime);
      // const utcEndTime = this.convertLocalDateToUTC(localEndTime);
      // const utcStartTime = this.convertLocalDateToUTC(localStartTime);
      // startDateWithTime = this.convertDateToString(utcStartTime);
      // endDateWithTime = this.convertDateToString(utcEndTime);
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
    // this.isCustom = true;
  }
  onSelectEndDateHandler(e: { date: Date }) {
    this.endDate = e.date;
    // this.isCustom = true;
  }

  //
  private convertLocalDateToUTC(date: Date) {
    // return new Date(
    //   Date.UTC(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes())
    // );
    const moment = momentNs.utc(date.getTime());
    const stringFormat: string = 'YYYY-MM-DD HH:mm';
    return moment.format(stringFormat);
  }

  //Use year-month-date in calender and time hh-mm as input
  private convertLocalDateToUTCWithTimeString(date: Date, time: string): string {
    //replace hour and minute within formatted UTC string
    const year = date.getFullYear().toString();
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}`:`${date.getMonth() + 1}`;
    const day = date.getDate() < 10 ? `0${date.getDate()}`:`${date.getDate()}`;
    const hour = Number.parseInt(time.split(":")[0]) < 10 ? `0${Number.parseInt(time.split(":")[0])}` :`${Number.parseInt(time.split(":")[0])}`;
    const minute = Number.parseInt(time.split(":")[1]) < 10 ? `0${Number.parseInt(time.split(":")[1])}` :`${Number.parseInt(time.split(":")[1])}`;
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  //convert ISO string(UTC time) to LocalDate with same year,month,date...
  //Maybe have better way to implement
  private convertUTCToLocalDate(date: Date): Date {
    const s = date.toISOString();
    const year = Number.parseInt(s.substring(0, 4));
    //month:0 - 11
    const month = Number.parseInt(s.substring(5, 7)) - 1;
    const day = Number.parseInt(s.substring(8, 10));
    const hour = Number.parseInt(s.substring(11, 13));
    const minute = Number.parseInt(s.substring(14, 16));

    return new Date(year, month, day, hour, minute);
  }


  private convertDateToString(date: Date, withHours: boolean = true): string {
    const year = date.getFullYear().toString();
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}`:`${date.getMonth() + 1}`;
    const day = date.getDate() < 10 ? `0${date.getDate()}`:`${date.getDate()}`;
    const hour = date.getHours() < 10 ? `0${date.getHours()}` :`${date.getHours()}`;
    const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` :`${date.getMinutes()}`;
    return withHours ? `${year}-${month}-${day} ${hour}:${minute}`:`${year}-${month}-${day}`;

  }

  //when click LastXX hours,prefill into custom input, shoould be UTC time
  selectCustom() {
    this.showTimePicker = true;
    this.timeDiffError = "";

    const end = new Date();
    const start = new Date(end.getTime() - this.hourDiff *  60 * 60 * 1000);
    this.startDate = this.convertUTCToLocalDate(start);
    this.endDate = this.convertUTCToLocalDate(end);

    //startDate and endDate contains current hour and minute info
    //only need hh:mm
    this.startClock = this.convertDateToString(this.startDate).substring(11,16);
    this.endClock = this.convertDateToString(this.endDate).substring(11,16);
  }
}
