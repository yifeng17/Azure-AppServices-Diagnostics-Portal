# Azure App Services Diagnostics Portal And Applens

This is the repository for Azure App Service Diagnostics experience.

## Prerequisites
- [Node 6.*](https://nodejs.org/en/download/)
- Node Package Manager (npm)
- Typescript
  `npm install -g typescript`
- Angular-CLI
  `npm install -g @angular/cli@6`

## Project Structure

```
root
│
└───AngularApp
│   │   This is the home of the angular code for App Service Diagnostics Portal and Applens
|   |
|   |   angular.json - This is the angular-cli configruation file
│   │
│   └───projects
|       |   This is the list of projects registered in angular.json
|       |
│       └───app-service-diagnostics
|       |   |    This is the code for the external App Service Diagnostics Portal
|       |
|       └───applens
|       |   |    This is the code for Applens
|       |
|       └───diagnostic-data
|           |    This is a library containing the common component and services
|           |    that are used to generate detector views in ASD/Applens.
|           |    Any component or feature that you want to use both internally
|           |    or externally should be put here
│
└───Backend
│   │   ASP.Net Core Backend for App Service Diagnostics Portal
|
└───ApplensBackend
│   │   ASP.Net Core Backend for Applens
```

## Getting Started
- Clone repo `git clone https://github.com/Azure/Azure-WebApps-Support-Center.git`
- Navigate to the angular root folder `AngularApp` and run `npm install` (This will install all the required packages.)

## App Service Diagnostics Portal

### Set Up a Local Development Environment

1. Get Resource Auth Token from ARM Client:
   - Install <a href="https://github.com/projectkudu/ARMClient">ArmClient</a>: `choco install armclient`
     - Ensure source `chocolatey` is enabled: `choco source enable -n=chocolatey`
   - Log in to ArmClient: `ARMClient.exe login`
   - Run `ARMClient.exe token {SubscriptionID}` with your Subscription ID, which will copy the Auth Token to the clipboard
2. Add Auth Token and ResourceID to Auth Service:
   - Open `AngularApp\projects\app-service-diagnostics\src\app\startup\services\auth.service.ts`
   - Add the following values to `localStartUpInfo:`
    ```Typescript
    private localStartUpInfo: StartupInfo = <StartupInfo>{
        token: '{PASTE AUTH TOKEN FROM STEP 1 HERE}',
        resourceId: '{RESOURCE ID HERE}'
    };
    ```
   - Copy the ID of a Resource you want to test, and copy it into the `resourceId` denoted above
3. Set environment to use local AppLens Backend:
   - Open `AngularApp\projects\app-service-diagnostics\src\environments\environment.ts`
   - Set `useApplensBackend: true`
4. Remove the `[Authorize]` annotations in `ApplensBackend\Controllers\DiagnosticController.cs` and `ApplensBackend\Controllers\ResourceController.cs`
5. (Optional) Run the server without SSL
   - Run `ng serve` for a dev server, or alternatively `npm start`.
   - Navigate to `http://localhost:3000/`.
   - The app will automatically reload if you change any of the source files.
6. Run the SSL server
   - Navigate to `AngularApp\ssl`
   - Follow the instructions in `AngularApp\ssl\README.md` to create a self-signed certficate and install the certificate for your local machine in Trusted Root
   - Run the SSL server: `npm run ssl`
   - Navigate to `https://localhost:3000` to confirm the server is up
   - Access the resource using the [Local Portal Test URL](https://ms.portal.azure.com/?websitesextension_ext=asd.env%3Dlocal)
   - This will load the iframe from `https://localhost:3000`. Must be running in *ssl* mode.
   - Any changes made to the locally hosted project will be automatically refreshed in the Portal
   - *BUG*: See Known Issues about Observer API

#### Known Issues
- Currently the Observer call to get the stamp name for the site is case sensitive on `resourceGroupName`, but the parameter is passed in lowercase, breaking functionality for resource groups that are not completely lowercase
  - `SitesController.cs` line 29: `GetStampName(string subscriptionId, string resourceGroupName, string siteName);`
  - **Workaround**: Hardcode resourceGroupName to the case-corrected resource group string
    - Ex: `GetStampName(subscriptionId, "MyResourceGroup", siteName);`


### Testing Local Changes in the Portal

- In order to test your local changes in the portal, you can use the following links:
  - [Local](https://ms.portal.azure.com/?websitesextension_ext=asd.env%3Dlocal): This will load the iframe from `https://localhost:3000`. Must be running in *ssl* mode (`npm run ssl`).
  - [Staging](https://ms.portal.azure.com/?websitesextension_ext=asd.env%3Dstaging): This will load the iframe from `https://supportcenter-bay-staging.azurewebsites.net`

### Back End

- Right now the back end is optional as it is not required for functionality of the angular project.
- You will need appropriate secrets to be added to appsettings.Development.json.
- Open the `Backend` project in Visual Studio 2017 and run it in `IIS Express` mode.

### Production Build

- The production build commands for the angular projects are as follows:
  - `npm run build-applens` - Build Applens. Build output is placed in `ApplensBackend/wwwroot`.
  - `npm run build-asd` - Build App Service Diagnostic Portal. Build output is placed in `Backend/wwwroot`.
  - `npm run build` - Build both App Service Diagnostic Portal and Applens.
- If you have the appropriate Publishing Profiles, you can deploy these changes to the staging slots.
- TODO: Azure Dev Ops Integration
