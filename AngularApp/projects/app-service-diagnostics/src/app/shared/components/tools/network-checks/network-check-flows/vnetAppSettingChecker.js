"use strict";

export class VnetAppSettingChecker {
    constructor(siteInfo, diagProvider, apiVersion = "2021-01-01") {
        if (siteInfo == null || diagProvider == null) {
            throw new error("Constructor parameters cannot be null");
        }
        this.siteInfo = siteInfo;
        this.diagProvider = diagProvider;
        this.apiVersion = apiVersion;

        this.siteArmId = siteInfo.id;
        this.serverFarmId = siteInfo.serverFarmId;
        this.dataPreparePromise = this.prepareDataAsync();
    }

    async prepareDataAsync() {
        this.appSettings = await this.diagProvider.getAppSettings();
    }


    async getAlwaysFallbackToPublicDnsAsync(){
        await this.dataPreparePromise;
        return this.appSettings["WEBSITE_ALWAYS_FALLBACK_TO_PUBLIC_DNS"];
    }

    async getVnetRouteAllAsync(){
        await this.dataPreparePromise;
        return this.appSettings["WEBSITE_VNET_ROUTE_ALL"];
    }
}