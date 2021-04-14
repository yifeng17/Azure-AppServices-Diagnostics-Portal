export class Query {
    searchId : string; 
    searchTerm : string;
    productName : string ;
    documentType : string ;
    documentSource : string[];
    numberOfDocuments : number; 
    deepSearchEnabled : boolean;
    bingSearchEnabled : boolean;

    customFilterConditionsForBing : string;

    pesId : string;

    supportTopicId : string;
}

export class Document{
    title : string ;
    url : string ;
    score : number;
    description : string ;
    documentType : string;
    documentSource : string
}