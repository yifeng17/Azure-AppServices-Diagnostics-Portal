import { DetectorTag } from "diagnostic-data";

export interface Package {
    codeString: string;
    id: string;
    committedByAlias: string;
    packageConfig: string;
    dllBytes: string;
    pdbBytes: string;
    tags: DetectorTag[];
}

export interface Dependency {
    name: string;
    version: string;
    allVersions: string[];
}
