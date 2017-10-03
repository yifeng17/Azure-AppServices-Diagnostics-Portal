
# Azure Web Apps Support Center

## Prerequisites
- Node Package Manager (npm)
- Typescript
  `npm install -g typescript`

## Getting Started
- Clone repo `git clone https://github.com/Azure/Azure-WebApps-Support-Center.git`
- Navigate to project root folder and run `npm install` (This will install all the required packages.)

## Local Development
- **For local development** (i.e: https://localhost:3000) authentication is handled by the app itself.
- You need to update `app/shared/services/auth.service.ts` with the Authorization Token. (only for local development)
  - Replace `<token>` with the authorization token (note:- Do not put Bearer)
  - To get the token, you can use <a href="https://github.com/projectkudu/ARMClient">ArmClient</a> `ARMClient.exe token [tenant|subscription]`. This will copy token to clipboard.
  - Replace `<resourceId>` with /subscriptions/{subscriptionId}/resourcegroups/{resourcegroup}/providers/Microsoft.Web/sites/{site}
- **Build** using `npm run build`. Output directory: `/dist`
- **Run** using `npm start`. 

## Production Build
- **Build** using `npm run aot`. Output directory: `/aot`

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
