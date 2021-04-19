export class DocumentSearchConfiguration{
    documentSearchEnabledSupportTopicIds = {
        "14748" : ["32542209"],
        "16072" : ["32542209"],
        "16170" : ["32542209"]
    };

    documentSearchEnabledPesIdsInternal: string[] = ["14748", "16072", "16170"];

    
    private pesId_ProductName_Map = {
        "14748" : "App Services",
        "16072" : "App Services",
        "16170" : "App Services",
    }

    public getProductName(pesId : string): string {
        if(pesId in this.pesId_ProductName_Map){
            return this.pesId_ProductName_Map[pesId]
        }
        return "";
    }

}
