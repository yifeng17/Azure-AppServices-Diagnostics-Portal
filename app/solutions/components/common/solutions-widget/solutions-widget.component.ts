import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { SolutionUIModelBase } from '../../../../shared/models/solution-ui-model/solution-ui-model-base';
import { SolutionMetadata } from '../../../../shared/models/solution-ui-model/solutionproperties';
import { PortalActionService, AvailabilityLoggingService, WindowService, SolutionFactoryService } from '../../../../shared/services';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { SolutionFactory } from '../../../../shared/models/solution-ui-model/solutionfactory';
import { SolutionHolder } from '../../../../shared/models/solution-holder';
import { } from '../../../../shared/services/solution-factory.service';
import { ISolution } from '../../../../shared/models/solution';


@Component({
    selector: 'solutions-widget',
    templateUrl: 'solutions-widget.component.html'
})
export class SolutionsWidgetComponent implements OnInit {

    private _solutionModelSubject: ReplaySubject<ISolution[]> = new ReplaySubject<ISolution[]>(1);

    constructor(private _solutionFactoryService: SolutionFactoryService) {

    }

    @Input() set solutionModels(model: ISolution[]) {
        this._solutionModelSubject.next(model);
    };

    solutions: SolutionHolder[] = [];

    ngOnInit(): void {
        this._solutionModelSubject.subscribe((solutions: ISolution[]) => {
            solutions = this.updateSolutions(solutions);

            solutions.forEach(solution => {
                let solutionHolder = this._solutionFactoryService.getSolutionById(solution);
                if (solutionHolder) {
                    this.solutions.push(solutionHolder);
                }
            });

            let sampleRestart = <ISolution>{ "id": 1.0, "displayName": "Kill Process(es) on Instance", "order": 1.0, "description": "This action will only kill a specific process on specified instances. Other processes are not affected and the whole site is not restarted.", "data": [[{ "name": "SubscriptionId", "value": "1402be24-4f35-4ab7-a212-2cd496ebdf14" }, { "name": "ResourceGroup", "value": "netpractice" }, { "name": "SiteName", "value": "netpractice" }, { "name": "ProcessName", "value": "netpractice" }, { "name": "MachineName", "value": "RD0003FF57EA9A" }, { "name": "InstanceId", "value": "8fa4a4ad3d3b6a29f92b0728c845d7800e2e2aa3ddaee4c3b878971ac3e46506" }]], "metadata": [] };

            if (this.solutions.findIndex(x => x.data.solution.id === 1) < 0) {
                let t = this._solutionFactoryService.getSolutionById(sampleRestart);
                this.solutions.push(t);
            }

            if (this.solutions.findIndex(x => x.data.solution.id === 3) < 0) {
                let t = this._solutionFactoryService.getSolutionById(<ISolution>{ id: 3 });
                this.solutions.push(t);
            }
        })
    }

    updateSolutions(solutions: ISolution[]) {
        let advancedRestarts = solutions.filter(x => x.id === 1);
        let rest = solutions.filter(x => x.id !== 1);

        let finalSolutions: ISolution[] = [];

        if (advancedRestarts.length > 0) {
            let original = advancedRestarts[0];
            if (advancedRestarts.length > 1) {
                advancedRestarts.forEach(x => {
                    if(x !== original && x.data.length > 0){
                        original.data.push(x.data[0]);
                    }
                })
            }

            finalSolutions.push(original);
        }

        rest.forEach(r => finalSolutions.push(r));

        return finalSolutions;
    }
}