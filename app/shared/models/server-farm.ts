import {ArmObj} from './armObj';

export interface ServerFarm extends ArmObj {
    properties: {
        name: string;
        sku: string;
        workerSize: WorkerSize;
        numberOfWorkers: number;
        numberOfSites: number;
    }
    sku: {
        name: string;
        tier: string;
        family: string;
        capacity: number;
    }
    additionalProperties: {
        cores: number;
        ramInGB: number;
    }
}

export enum WorkerSize {
    small = 0,
    medium = 1,
    large = 2
}