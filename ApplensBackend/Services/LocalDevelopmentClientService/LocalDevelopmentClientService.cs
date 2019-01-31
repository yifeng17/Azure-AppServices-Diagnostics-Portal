using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace AppLensV3
{
    public class LocalDevelopmentClientService: ILocalDevelopmentClientService
    {
        private IConfiguration _configuration;

        public string StorageConnectionString
        {
            get
            {
                return _configuration["LocalDevelopment:connectionString"];
            }
        }

        public LocalDevelopmentClientService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<string> PrepareLocalDevelopment(string detectorId, string scriptBody = null, string resourceId = null)
        {
            try
            {
                var assemPath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
                var csxFilePath = Path.Combine(assemPath, @"LocalDevelopmentTemplate\Detector\detector.csx");
                var settingsPath = Path.Combine(assemPath, @"LocalDevelopmentTemplate\Detector\detectorSettings.txt");

                // Write script body into template detector.csx
                File.WriteAllText(csxFilePath, scriptBody);

                // Prepare ResourceId
                var settingsJson = File.ReadAllText(settingsPath);
                dynamic settingsJsonObject = JsonConvert.DeserializeObject(settingsJson);

                settingsJsonObject["ResourceId"] = resourceId;

                var output = JsonConvert.SerializeObject(settingsJsonObject, Formatting.Indented);
                File.WriteAllText(settingsPath, output);

                var zipSource = Path.Combine(assemPath, @"LocalDevelopmentTemplate");
                var zipfileName = detectorId + @".zip";
                var zipDest = Path.Combine(assemPath, zipfileName);

                // Delete the zipDest first to avoid exception from creation
                File.Delete(zipDest);
                ZipFile.CreateFromDirectory(zipSource, zipDest);

                var zipFile = new FileInfo(zipDest);
                // Storage accounts: detectorlocaldev
                var blobUri = await UploadToBlobStorage(zipFile, StorageConnectionString, "detectordevelopment");

                return blobUri;
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.Message);
                throw ex;
            }
        }

        public static async Task CreateSharedAccessPolicy (CloudBlobClient blobClient, CloudBlobContainer container, string policyName)
        {
            var permissions = await container.GetPermissionsAsync();

            var sharedPolicy = new SharedAccessBlobPolicy()
            {
                SharedAccessExpiryTime = DateTimeOffset.UtcNow.AddYears(10),
                Permissions = SharedAccessBlobPermissions.Write | SharedAccessBlobPermissions.Read
            };

            permissions.SharedAccessPolicies.Add(policyName, sharedPolicy);
            await container.SetPermissionsAsync(permissions);
        }

        private static async Task<string> UploadToBlobStorage(FileInfo zipFile, string storageConnectionString, string blobContainerName)
        {
            // Connect to the storage account's blob endpoint
            var blobUri = "";

            if (CloudStorageAccount.TryParse(storageConnectionString, out CloudStorageAccount account))
            {
                try
                {
                    var client = account.CreateCloudBlobClient();

                    // Create the blob container
                    var container = client.GetContainerReference(blobContainerName);
                    await container.CreateIfNotExistsAsync();

                    // Clear all public permissions for container
                    var permissions = await container.GetPermissionsAsync();
                    permissions.SharedAccessPolicies.Clear();
                    permissions.PublicAccess = BlobContainerPublicAccessType.Off;
                    await container.SetPermissionsAsync(permissions);

                    // Create a shared access policy
                    var sharedAcessPolicyName = "localDevPolicy";
                    await CreateSharedAccessPolicy(client, container, sharedAcessPolicyName);

                    // Upload the zip and store it in the blob
                    var blob = container.GetBlockBlobReference(zipFile.Name);
                    using (FileStream fs = zipFile.OpenRead())
                    {
                       await blob.UploadFromStreamAsync(fs);
                    }

                    // Get the uri string for the container, including the SAS token
                    string sasBlobToken = blob.GetSharedAccessSignature(null, sharedAcessPolicyName);
                    blobUri = blob.Uri + sasBlobToken;
                }
                catch (StorageException ex)
                {
                    Console.WriteLine("Error returned from the service: {0}", ex.Message);
                    throw ex;
                }
            }
            else
            {
                Console.Error.Write(("Invalid storage connection string"));
            }

            return blobUri;
        }
    }
}