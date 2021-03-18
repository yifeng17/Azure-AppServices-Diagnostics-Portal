using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppLensV3.Models;
using System.Net.Http;

namespace AppLensV3.Services
{
    public class NationalCloudIncidentAssistanceService : IIncidentAssistanceService
    {
        public async Task<bool> IsEnabled()
        {
            return false;
        }
        Task<HttpResponseMessage> IIncidentAssistanceService.GetIncidentInfo(string incidentId)
        {
            return null;
        }

        Task<HttpResponseMessage> IIncidentAssistanceService.ValidateAndUpdateIncident(string incidentId, object payload, string update)
        {
            return null;
        }
    }
}
