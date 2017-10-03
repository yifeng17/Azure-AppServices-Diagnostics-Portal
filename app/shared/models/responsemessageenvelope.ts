export interface IResponseMessageEnvelope<T> {
    id: string;
    name: string;
    type: string;
    kind: string;
    location: string;
    properties: T;
}

export interface IResponseMessageCollectionEnvelope<T>{
    id:string;
    nextLink:string;
    value: T[]
}