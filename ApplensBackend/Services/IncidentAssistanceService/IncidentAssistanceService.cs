using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Net.Http;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using AppLensV3.Helpers;
using AppLensV3.Models;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using Microsoft.Extensions.Configuration;
using System.Text;

namespace AppLensV3.Services
{
    public interface IIncidentAssistanceService
    {
        Task<bool> IsEnabled();
        Task<HttpResponseMessage> GetIncidentInfo(string incidentId);
        Task<HttpResponseMessage> ValidateAndUpdateIncident(string incidentId, object payload, string update);
    }

    public class IncidentAssistanceService : IIncidentAssistanceService
    {
        private bool isEnabled;
        private string IncidentAssistEndpoint;
        private string ApiKey;
        private readonly Lazy<HttpClient> _client = new Lazy<HttpClient>(() =>
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            return client;
        });

        private HttpClient _httpClient
        {
            get
            {
                return _client.Value;
            }
        }

        public IncidentAssistanceService(IConfiguration configuration)
        {
            if (!bool.TryParse(configuration["IncidentAssistance:IsEnabled"].ToString(), out isEnabled))
            {
                isEnabled = false;
            }
            if (isEnabled) {
                IncidentAssistEndpoint = configuration["IncidentAssistance:IncidentAssistEndpoint"].ToString();
                ApiKey = configuration["IncidentAssistance:ApiKey"].ToString();
            }
        }

        public async Task<bool> IsEnabled()
        {
            return isEnabled;
        }

        public async Task<HttpResponseMessage> GetIncidentInfo(string incidentId)
        {
            if (string.IsNullOrWhiteSpace(incidentId))
            {
                throw new ArgumentException("incidentId");
            }
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, $"{IncidentAssistEndpoint}/api/GetIncidentInfo/{incidentId}?code={ApiKey}");
            return await _httpClient.SendAsync(request);
        }

        public async Task<HttpResponseMessage> ValidateAndUpdateIncident(string incidentId, object payload, string update)
        {
            if (string.IsNullOrWhiteSpace(incidentId))
            {
                throw new ArgumentException("incidentId");
            }
            
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IncidentAssistEndpoint}/api/ValidateAndUpdateICM?code={ApiKey}&update={update}");
            request.Content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
            return await _httpClient.SendAsync(request);
        }
    }
}