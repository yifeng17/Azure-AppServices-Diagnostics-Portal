import { Injectable } from '@angular/core';
import {ArmResourceConfig, HomePageText, ResourceDescriptor} from '../models/arm/armResourceConfig'

@Injectable()
export class GenericArmConfigService {
  public resourceMap : Array<ArmResourceConfig> = [];

  constructor() { 
    this.resourceMap.push({ 
      homePageText: {
        title:'Azure Kubernetes Services Diagnostics',
        description:'Use Azure Kubernetes Services Diagnostics to investigate how your cluster is performing, diagnose issues, and discover how to improve its reliability. Select the problem category that best matches the information or tool that you\'re interested in:',
        searchBarPlaceHolder:'Search Azure Kubernetes Services'
      },
      matchRegEx : '\/Microsoft\.ContainerService\/managedClusters\/', //Regex to match for Microsoft.Logic
      searchSuffix : 'AKS',
      azureServiceName : 'Azure Kubernetes Services',
      armApiVersion : '2019-04-01',
      isSearchEnabled : true,
      isApplicableForLiveChat : false,
      categories:[]
    });
  } 


  getArmResourceConfig(resourceUri:string) : ArmResourceConfig {
    let returlValue :ArmResourceConfig;
    
    this.resourceMap.some((resource:ArmResourceConfig) => {
      const matchPattern: RegExp = new RegExp(`${resource.matchRegEx}`, "i");
      var result = resourceUri.match(matchPattern);
      if (result && result.length > 0) {
        returlValue = resource;
        return true;
      }
    });

    return returlValue;
  }

  getApiVersion(resourceUri: string):string {
    let apiVersion = '';
    this.resourceMap.some((resource:ArmResourceConfig) => {
      const matchPattern: RegExp = new RegExp(`${resource.matchRegEx}`, "i");
      var result = resourceUri.match(matchPattern);
      if (result && result.length > 0) {
        apiVersion = resource.armApiVersion;
        return true;
      }
    });
    return apiVersion;
  }

}
