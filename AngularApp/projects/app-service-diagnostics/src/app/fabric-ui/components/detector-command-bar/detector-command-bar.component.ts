import { Component, OnInit, ViewChild, Input, Output, TemplateRef, ElementRef, Renderer2, EventEmitter } from '@angular/core';
import { addMonths, addYears, addDays, addWeeks } from 'office-ui-fabric-react/lib/utilities/dateMath/DateMath';
import { FabDropdownComponent } from '@angular-react/fabric';

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
import { trigger, state, transition, animate, style } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'detector-command-bar',
  templateUrl: './detector-command-bar.component.html',
  styleUrls: ['./detector-command-bar.component.scss'],
  animations: [
    trigger('expand', [
      state('hidden', style({ height: '0px' })),
      state('shown', style({ height: '*' })),
      transition('* => *', animate('.25s')),
      transition('void => *', animate(0))
    ])
  ]
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
  showFeedback: boolean = false;
  ratingEventProperties: { [name: string]: string };
  options: FabDropdownComponent['options'] = [
    { key: 'Last1Hour', text: 'Last 1 Hour', data: { iconProps: { iconName: 'CaretRight' }, } },
    { key: 'Last6Hours', text: 'Last 6 Hours', data: { icon: "RadioButtonOff" } },
    { key: 'Last12Hour', text: 'Last 12 Hours', data: { icon: "RadioButtonOff" } },
    { key: 'Last24Hours1', text: 'Last 24 Hours', data: { icon: "RadioButtonOff" } },
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
    { key: 'Last1Hour', text: 'Last 1 Hour', onClick: () => { this.setTime("Last 1 Hour"); this.showTimerPicker = false } },
    { key: 'Last6Hours', text: 'Last 6 Hours', onClick: () => { this.setTime("Last 6 Hours"); this.showTimerPicker = false } },
    { key: 'Last12Hour', text: 'Last 12 Hours', onClick: () => { this.setTime("Last 12 Hours"); this.showTimerPicker = false } },
    { key: 'Last24Hours', text: 'Last 24 Hours', onClick: () => { this.setTime("Last 24 Hours"); this.showTimerPicker = false } },
    { key: 'Custom', text: 'Custom', onClick: () => { this.showTimerPicker = true } },
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
  time: string = "Time Range (Last 24 Hours)"

  itemProps1: Partial<IContextualMenuProps> = {
    onItemClick: (ev, item) => {
      console.log(`${item.text} clicked`);
      return false;
    }
  };

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
    this.showFeedback = !this.showFeedback
  }

  refresh() {
    this.showChoices = !this.showChoices;
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
  startDate: any = addDays(this.today, -1).toISOString().split('T')[0];
  endDate: any = this.today.toISOString().split('T')[0];
  //   minDate: Date = (new Date(Date.now())).add(-30).days();
  //   maxDate: Date = new Date(Date.now()-)

  minDate: Date = addMonths(this.today, -1);


  startClock: string = `${this.startHour}:${this.startMinutes}`;
  endClock: string = `${this.endHour}:${this.endMinutes}`;

  setTime(x: string) {
    this.internalTime = x;
  }

  setTimewithClock(x: number) {
    this.startClock = `${this.endHour - x}:${this.startMinutes}`;
    this.internalTime = `${this.startDate} ${this.startClock} - ${this.endDate} ${this.endClock} `;
  }

  applyTimeRange() {
    this.time = "Time Range (" + this.internalTime + ")";
    this.showChoices = !this.showChoices;
  }

  cancelTimeRange() {
    this.showChoices = !this.showChoices;
  }


  constructor(private globals: Globals, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    console.log("Init commandbar with OpenPanel", this.openPanel);
  }

  feedbackFormChange(change: boolean) {
    this.showFeedback = false;
  }

  //check detectorName after everytime refresh detector-container
  //If it is detector then get detectorId, else get categoryId
  ngAfterViewChecked() {
    let detectorName = "";
    if (this.activatedRoute.firstChild.snapshot.params["detectorName"] !== undefined) {
      detectorName = this.activatedRoute.firstChild.snapshot.params["detectorName"];
    } else {
      detectorName = this.activatedRoute.snapshot.params["category"];
    }
    this.ratingEventProperties = {
      'DetectorId': detectorName,
      'Url': window.location.href
    };
    console.log(detectorName);
  }

}
