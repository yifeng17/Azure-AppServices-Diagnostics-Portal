import { Component, OnInit, Input } from '@angular/core';
import { Solution } from '../solution/solution.component';

@Component({
  selector: 'solutions',
  templateUrl: './solutions.component.html',
  styleUrls: ['./solutions.component.scss']
})
export class SolutionsComponent implements OnInit {

  @Input() solutions: Solution[];
  selectedSolution = 0;

  constructor() { }

  ngOnInit() {
  }

}
