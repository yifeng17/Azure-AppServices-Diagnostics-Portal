using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace AppLensV3.Services
{
    public interface IFreshChatClientService
    {
        /// <summary>
        /// Get the API Key and validate is the call is genuine or should be rejected
        /// </summary>
        /// <param name="ApiKey">Api Key as sent by FreshChat webhook</param>
        /// <returns>True if success. False to reject.</returns>
        bool VerifyCall(string ApiKey);

        bool MakeGetCallToFreshChat(string baseUri, string uri);

        bool MakeGetCallToFreshChat(string fullUri);

        bool MakeCallToFreshChat(string baseUri, string uri, HttpMethod method, string jsonBody);

        bool MakeCallToFreshChat(string fullUri, HttpMethod method, string jsonBody);

        IEnumerable<AgentDetails> GetAllAgents();

        void AddOrUpdateAgent(string agentId, AgentDetails value);

        bool TryRemoveAgent(string agentId, out AgentDetails value);

        bool TryGetAgent(string agentId, out AgentDetails value);

        string RemovePII(string content);

    }
}
