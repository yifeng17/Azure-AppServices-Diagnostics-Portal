export class UriUtilities {
  static BuildDetectorLink(resourceUri: string, detectorId: string): string {
    return "https://portal.azure.com" +
      `/?websitesextension_ext=asd.featurePath%3Ddetectors%2F${detectorId}#@microsoft.onmicrosoft.com` +
      `/resource/${resourceUri}/customtroubleshoot`
  }
}
