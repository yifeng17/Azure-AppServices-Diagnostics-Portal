import {HealthStatus} from "./detector";
import {Solution} from "../components/solution/solution";

export interface KeystoneInsight {
    status: HealthStatus;
    title: string;
    description: string;
    solution: Solution;
    startDate: Date;
    expiryDate: Date;
}
