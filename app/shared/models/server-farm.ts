import {ArmObj} from './armObj';

export interface ServerFarm extends ArmObj {
    properties: {
        name: string;
        sku: string;
        workerSize: WorkerSize;
        numberOfWorkers: number;
        numberOfSites: number;
    }
}

export enum WorkerSize {
    small = 0,
    medium = 1,
    large = 2
}