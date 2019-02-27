import { Component, OnInit, Input } from '@angular/core';
import { Solution } from '../solution/solution.component';

@Component({
  selector: 'solutions',
  templateUrl: './solutions.component.html',
  styleUrls: ['./solutions.component.scss']
})
export class SolutionsComponent implements OnInit {

  @Input() solutions: Solution[];
  selectedSolution: string;

  constructor() { }

  ngOnInit() {
    this.selectedSolution = this.solutions.length > 0 ? this.solutions[0].Title : "";

    this.logActiveSolution();
  }

  setActiveSolution(title: string) {
    this.selectedSolution = title;

    this.logActiveSolution();
  }

  getActiveSolution(): Solution {
    return this.solutions.find(x => x.Title === this.selectedSolution);
  }

  logActiveSolution() {
    console.log(this.selectedSolution);
  }

}
