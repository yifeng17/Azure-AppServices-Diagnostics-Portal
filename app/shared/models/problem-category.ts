import { OperatingSystem } from "./site";

export class Category
{
    Name:string;
    ProblemTypes: ProblemType[]
    Collapsed: boolean = true;
}

export class ProblemType
{
    Name:string;    
    BgColor: string;
    TextColor:string;
    Href: string;
    OperatingSystem: OperatingSystem;
}