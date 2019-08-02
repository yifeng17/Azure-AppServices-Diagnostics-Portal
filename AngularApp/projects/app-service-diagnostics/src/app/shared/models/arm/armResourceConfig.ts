import { Category } from "../../../shared-v2/models/category";
import { MessageGroup } from "../../../supportbot/models/message-group";

export interface ArmResourceConfig {
	homePageText?: HomePageText;
	matchRegEx?: string;
	searchSuffix?: string;
	azureServiceName?: string;
	armApiVersion?: string;
	isSearchEnabled?: boolean;
	isApplicableForLiveChat?: boolean;
	categories?: Array<Category>;
}

export interface GenieConfig {
	isGenieEnabled: boolean;
	Messages: MessageGroup[];
}

export interface HomePageText {
	title: string;
	description: string;
	searchBarPlaceHolder: string;
}

export class ResourceDescriptor {
	constructor() {
		this.subscription = '';
		this.resourceGroup = '';
		this.provider = '';
		this.type = '';
		this.resource = '';
		this.types = [];
		this.resources = [];
	}
	subscription: string;
	resourceGroup: string;
	provider: string;
	type: string;
	resource: string;
	types: Array<string>;
	resources: Array<string>;
}