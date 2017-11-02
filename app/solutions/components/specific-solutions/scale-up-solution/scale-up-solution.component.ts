import { Component, Input } from '@angular/core';
import { SolutionBaseComponent } from '../../common/solution-base/solution-base.component';
import { SolutionData } from '../../../../shared/models/solution';
import { ServerFarmDataService } from '../../../../shared/services/server-farm-data.service';
import { ServerFarm } from '../../../../shared/models/server-farm';


@Component({
    templateUrl: 'scale-up-solution.component.html',
    styleUrls: ['../../../styles/solutions.css',
        'scale-up-solution.component.css'
    ]
})
export class ScaleUpSolutionComponent implements SolutionBaseComponent {

    @Input() data: SolutionData;

    title: string = "Scale up your App Service Plan";
    description: string = "Increase the size of the instances in your app service plan. Each instance will have more cores (CPU), memory, and disk space.";

    currentServerFarm: ServerFarm;

    suggestion: string;

    constructor(private _serverFarmService: ServerFarmDataService) {
        this._serverFarmService.getSiteServerFarm().subscribe(serverFarm => {
            if (serverFarm) {
                console.log(serverFarm);
                this.currentServerFarm = serverFarm;
                this.generateSuggestion();
            }
        }, error => {
            //TODO: handle error
        })
    }

    generateSuggestion() {
        let sizeId = parseInt(this.currentServerFarm.sku.name.replace(this.currentServerFarm.sku.family, ''));

        // TODO: if it is an ASE, we should offer premium sized instances

        if (sizeId < 3) {
            this.suggestion = `You can increase your App Service Plan to the next tier <b>${this.currentServerFarm.sku.family + (sizeId + 1)}</b>. ` +
                `This would increase your RAM size to <b>${this.currentServerFarm.additionalProperties.ramInGB * 2}GB</b> ` +
                `and the number of cores to <b>${this.currentServerFarm.additionalProperties.cores * 2}</b>.`
        }
        else {
            this.suggestion = 'You are already scaled to the maximum instance size. You could try scaling out instead.'
        }
    }
}
