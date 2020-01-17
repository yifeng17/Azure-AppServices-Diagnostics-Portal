import { Component, OnInit, ViewChild, Input, Output, TemplateRef, ElementRef, Renderer2, EventEmitter } from '@angular/core';
import {
  IContextualMenuProps,
} from 'office-ui-fabric-react';
import { Globals } from '../../../globals';
import { DetectorControlService } from 'projects/diagnostic-data/src/lib/services/detector-control.service';

@Component({
  selector: 'detector-command-bar',
  templateUrl: './detector-command-bar.component.html',
  styleUrls: ['./detector-command-bar.component.scss']
})
export class DetectorCommandBarComponent implements OnInit {
  // @ViewChild('timepicker', { static: true }) timepicker: any;
  // @Input() openPanel: boolean = false;
  // @Output() openPanelChange: EventEmitter<boolean> = new EventEmitter<boolean>();



  // showTypingMessage: boolean;
  // selectedItem?: IDropdownOption;
  // timeDivider: DropdownMenuItemType = DropdownMenuItemType.Divider;
  // options: IDropdownOption[] = [
  //   { key: 'Last1Hour', text: 'Last 1 Hour', data: { iconProps: { iconName: 'CaretRight' }, } },
  //   { key: 'Last6Hours', text: 'Last 6 Hours', data: { icon: "RadioButtonOff" } },
  //   { key: 'Last12Hour', text: 'Last 12 Hours', data: { icon: "RadioButtonOff" } },
  //   { key: 'Last24Hours', text: 'Last 24 Hours', data: { icon: "RadioButtonOff" } },
  //   { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
  //   { key: 'Custom', text: 'Custom', data: { icon: "RadioButtonOff" } }
  // ];

  dropdownStyles = {
    // type: PanelType.smallFixedNear,
    openPanel: false
    //   customWidth: "585",
  };



  time:string;
  // showTimerPicker: boolean = false;
  // calloutStyles: any = {
  //   overflowY: "hidden",
  //   right: 20,
  //   top: 50,
  //   padding: 10
  // };



  // logEvent(...args: any[]) {
  //   console.log(args);
  //   if (args.length > 1 && args[1].option != undefined && args[1].option.key === "Custom") {
  //     this.dropdownStyles.openPanel = true;
  //     this.options.push({ key: 'StartTime', text: 'Start Time' });
  //     this.options.push({ key: 'EndTime', text: 'End Time' });
  //   }
  // }

  // commandbar related
  commandbarStyles = {
    // type: PanelType.smallFixedNear,
    backgroundColor: "blue"
    //   customWidth: "585",

  };
  listenObj: any;
  dropdownOpen: boolean = true;
  // customizeTime: boolean = false;
  // customIcon: string = "RadioBtnOff";



  itemProps1: Partial<IContextualMenuProps> = {
    onItemClick: (ev, item) => {
      console.log(`${item.text} clicked`);
      return false;
    }
  };


  constructor(private globals: Globals, private detectorControlService: DetectorControlService) { }



  ngOnInit() {
    // console.log("Init commandbar with OpenPanel", this.openPanel);
  }

  // setText(event: any) {
  //   this.time = "Setting the time";
  //   // this.customizeTime = true;
  //   this.customIcon = "RadioBtnOn";

  //   //     console.log("item", item);
  //   //     console.log("event", event, event.item.onClick);
  //   //    // event.preventDefault();
  //   //     event.item.onClick = ((e) => {
  //   //         e.preventDefault();
  //   //     });
  //   var x = document.getElementsByClassName("ms-Callout-container");
  //   console.log("Callout picker", x[0], x[0]);

  //   //  x[0].style.display = "block";
  //   //console.log("Callout picker", x[0], x[0].style.display);
  //   //event.preventDefault();

  // }

  toggleOpenState() {
    this.globals.openGeniePanel = !this.globals.openGeniePanel;
    // this.openPanel = !this.openPanel;
    // this.openPanelChange.emit(this.openPanel);
    console.log("toggle panel, isOpen:", this.globals.openGeniePanel);
  }


  sendFeedback() {
    this.globals.openFeedback = !this.globals.openFeedback;
  }


  // refresh() {
  //   this.showChoices = !this.showChoices;
  // }

  refreshPage() {
    this.detectorControlService.refresh();
  }

  toggleOpenTimePicker() {
    this.globals.openTimePicker = !this.globals.openTimePicker;
  }

  showSearch() {

  }

  onCopyClicked() {

  }

  updateMessage(s:string){
    this.time = s;
  }
}
