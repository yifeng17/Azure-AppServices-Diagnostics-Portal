import { SiteInfoMetaData } from "./site";

export class ApplicationRestartInfo extends SiteInfoMetaData {
    instances: InstanceInfo[];
}

export class SiteProfilingInfo extends SiteInfoMetaData {
    slot:string;
    instances: string[];
}

export class InstanceInfo {
    machineName: string;
    instanceId: string;
}