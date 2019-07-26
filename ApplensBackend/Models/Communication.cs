using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppLensV3.Models
{
     public class ConnectionRow
    {
        public string timeStamp;
        public string batchId;
        public string functionApp;
        public string level;
        public string functionName;
        public string bindingType;
        public string direction;
        public string settingKey;
        public string accountName;
        public bool validationPassed;
        public string details;

        public ConnectionRow(string timeStamp1="", string batchId1 = "1", string functionApp1 = "", string level1 = "", string functionName1 = "", string bindingType1 = "", string direction1 = "",
            string settingKey1 = "", string accountName1 = "", bool validationPassed1 = true, string details1 = "")
        {
            timeStamp = timeStamp1;
            batchId = batchId1;
            functionApp = functionApp1;
            level = level1;
            functionName = functionName1;
            bindingType = bindingType1;
            direction = direction1;
            settingKey = settingKey1;
            accountName = accountName1;
            validationPassed = validationPassed1;
            details = details1;
        }
    }

    public class Communication
    {
        public string CommunicationId { get; set; }

        public DateTime PublishedTime { get; set; }

        public string Title { get; set; }

        public string RichTextMessage { get; set; }

        public CommunicationStatus Status { get; set; }

        public string IncidentId { get; set; }

        public List<ImpactedService> ImpactedServices { get; set; }

        public bool IsAlert { get; set; }

        public bool IsExpanded { get; set; }

        public Communication()
        {
            ImpactedServices = new List<ImpactedService>();
            IsAlert = false;
            IsExpanded = false;
        }
    }
    
    public class ImpactedService
    {
        public string Name { get; set; }

        public List<string> Regions { get; set; }

        public ImpactedService()
        {
            Regions = new List<string>();
        }
    }

    public enum CommunicationStatus
    {
        Active = 0,
        Resolved
    }

    public enum SourceType
    {
        ServiceHealth = 0,
        AppServiceAdvisor = 1
    }

}
