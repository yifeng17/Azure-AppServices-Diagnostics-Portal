import { Category } from "../../../shared-v2/models/category";

export interface ArmResourceConfig
{
	homePageText:HomePageText;
	matchRegEx:string;
	searchSuffix:string;
	azureServiceName:string;
	armApiVersion:string;
	isSearchEnabled:boolean;
	isApplicableForLiveChat:boolean;
	categories:Array<Category>;
}

export interface HomePageText
{
	title:string;
	description:string;
	searchBarPlaceHolder:string;
}

export interface ResourceDescriptor
{
	subscription:string,
	resourceGroup:string,
	provider:string,
	type:string,
	resource:string,
	types:Array<string>,
	resources:Array<string>
}