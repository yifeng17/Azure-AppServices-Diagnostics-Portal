import { ArmObj } from './armObj';

export interface Site {
    name: string;
    kind: string;
    state: string;
    hostNames: string[];
    enabledHostNames: string[];
    hostNameSslStates: [{
        name: string;
        hostType: number;
    }];
    sku: string;
    containerSize: number;
    serverFarm: string;
    serverFarmId: string;
    hostingEnvironmentId: string;
    resourceGroup: string;
}

export class SiteInfoMetaData {
    resourceUri: string;
    subscriptionId: string;
    resourceGroupName: string;
    siteName: string;
    slot: string;
}

export class SiteExtensions {
    public static operatingSystem(site: Site): OperatingSystem {
        if (site && site.kind) {
            return site.kind.split(',').indexOf('linux') > 0 ? OperatingSystem.linux : OperatingSystem.windows;
        }
        return OperatingSystem.linux | OperatingSystem.windows;
    }
}

export interface SiteRestartData {
    resourceUri: string;
    siteName: string;
}

// Flags
export enum OperatingSystem {
    windows = 1 << 0,
    linux = 1 << 1,
    any = 11 << 0 
}