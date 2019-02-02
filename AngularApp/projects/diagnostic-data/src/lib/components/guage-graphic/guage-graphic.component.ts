import { Component, OnInit, Input } from '@angular/core';
import {GuageGraphic, GuageSize} from '../../models/guage';

@Component({
  selector: 'guage-graphic',
  templateUrl: './guage-graphic.component.html',
  styleUrls: ['./guage-graphic.component.scss']
})


export class GuageGraphicComponent implements OnInit {

  @Input() guageGraphic:GuageGraphic;
  
  constructor() { }

  ngOnInit() {
  }

}
