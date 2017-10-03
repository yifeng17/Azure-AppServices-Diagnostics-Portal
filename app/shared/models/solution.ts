import { SolutionType } from './enumerations';
import { INameValuePair } from './namevaluepair';

export interface ISolution {
    id: number;
    displayName: string;
    order: number;
    description: string;
    type: SolutionType;
    data: INameValuePair[][];
    metadata: INameValuePair[][];
}