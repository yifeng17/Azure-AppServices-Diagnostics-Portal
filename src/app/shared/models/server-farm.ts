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

export enum Sku {
    Free = 1 << 0,
    Shared = 1 << 1,
    Basic = 1 << 2,
    Standard = 1 << 3,
    Premium = 1 << 4,
    Dynamic = 1 << 5,
    Paid = 1111 << 2,
    NotDynamic = 11111 << 0,
    All = 111111 << 0
}

export enum WorkerSize {
    small = 0,
    medium = 1,
    large = 2
}