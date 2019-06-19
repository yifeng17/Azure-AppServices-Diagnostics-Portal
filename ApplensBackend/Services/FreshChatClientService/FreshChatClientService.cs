using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AppLensV3.Services
{
    public class FreshChatClientService : IFreshChatClientService
    {

        private IConfiguration _configuration;

        private ConcurrentDictionary<string, AgentDetails> _agentCache;

        private HttpClient HttpClient { get; set; }

        private string ApplensApiKey { get; set; }
        private string FreshChatApiKey { get; set; }
        private string FreshChatBaseUri { get; set; }
        private string UserAgentToFreshChat { get; set; }

        public void LoadConfigurations(IConfiguration configuration)
        {
            _configuration = configuration;
            ApplensApiKey = _configuration["FreshChat:ApplensApiKey"];
            FreshChatApiKey = _configuration["FreshChat:FreshChatApiKey"];
            FreshChatBaseUri = _configuration["FreshChat:FreshChatBaseUri"];
            UserAgentToFreshChat = _configuration["FreshChat:UserAgentToFreshChat"];

            _agentCache = new ConcurrentDictionary<string, AgentDetails>();
        }

        public IEnumerable<AgentDetails> GetAllAgents()
        {
            return _agentCache.Values;
        }

        public void AddOrUpdateAgent(string agentId, AgentDetails value)
        {
            _agentCache.AddOrUpdate(agentId.ToLower(), value, (existingKey, oldValue) => value);
        }

        public bool TryRemoveAgent(string agentId, out AgentDetails value)
        {
            return _agentCache.TryRemove(agentId.ToLower(), out value);
        }

        public bool TryGetAgent(string agentId, out AgentDetails value)
        {
            return _agentCache.TryGetValue(agentId.ToLower(), out value);
        }

        private void InitializeHttpClient()
        {
            HttpClient = new HttpClient
            {
                MaxResponseContentBufferSize = int.MaxValue,
                Timeout = TimeSpan.FromSeconds(30)
            };

            HttpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpClient.DefaultRequestHeaders.Add("User-Agent", this.UserAgentToFreshChat);
        }

        private string MaskPhone(string content)
        {
            // (\+?\d ?\d ?\d ?) Matches an optional + sign and optional up to 3 digits
            // ([\d\-)\(\s]{10}) Matches 10 occurrences of either a digit, - ) ( or a white space

            /*Matches
             * Phone:0914252358741 saasd
             * Phone = +0914252358741 saasd
             * Phone + 914252358741 saasd
             * Phone + 14252358741 saasd
             * Phone 4252358741 s sd ad asd
             * saasd(425)222 - 7777 saasd
             * saasd 425 - 222 - 7777saasd
             * saasd + 1425 - 222 - 7777 saasd
             * saasd 425 222 7777 dfas
             */
            // Does not match : I have 200 websites
            string pattern = @"(\+?\d?\d?\d?)([\d\-)\(\s]{10})";
            return Regex.Replace(content, pattern, m => " ********** ");
        }

        private string MaskQueryString(string content)
        {
            // (?<=https?:\/\/([\w\.-_%]+\?) Starts with an http, may contain an s, must contain a :// followerd by at least one alphanumeric character including  .-_% and must end with a ? to indicate start of a query string.
            // [\w-\._&%]+) After a ?, there must be at least one alphanumeric character including - . _ & % followed by = (denoted by ?=). This matches the name part of the querystring.
            // ?=[\w-\._%]+ Repeatedly match a word (including - . _ % having at least one character that starts after an = .

            // Matches http://something.com?me=1&so=me https://something.co.uk?me=1&so=me&do=re&me=do%20something http://something.com?me=1 .
            // Does not match https://something.com? https://noQuery.com .
            string pattern = @"(?<=https?:\/\/([\w\.-_%]+\?)[\w-\._&%]+)?=[\w-\._%]+";
            return Regex.Replace(content, pattern, m => "=****", RegexOptions.IgnoreCase);
        }

        private string MaskIPV4Address(string content)
        {
            string pattern = @"(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])";
            return Regex.Replace(content, pattern, m => (m.Value.Split('.')[0] + "." + m.Value.Split('.')[1] + "." + m.Value.Split('.')[2] + ".XXX"));
        }

        private string MaskPassword(string content)
        {
            // (?<=(\bpass\b)|(\bpwd\b)|(\bpassword\b)|(\buserpass\b)) Pattern should start with either pass or pwd or password or userpass.
            // [^\w\r\n] Followed by at least one character including space but not the newline character.
            // \b[\S]+ Match an entire word that contains any character and there should be at least one character present

            /* Matches
             * pass abc@#_!(?%123 
             * pass abc@#_!(?%123
             * password abc@#_!(?%123 
             * Password : abc@#_!(?%123
             * PASS abc@#_!(?%123
             * pass abc@#_!(?%123
             * password abc@#_!(?%123 sads adasd

            Does not match
             * Pass:
             * I am doing fine :)
             */
            string pattern = @"(?<=(\bpass\b)|(\bpwd\b)|(\bpassword\b)|(\buserpass\b))[^\w\r\n]+\b[\S]+";
            return Regex.Replace(content, pattern, m => ":****", RegexOptions.IgnoreCase);
        }

        private string MaskEmails(string content)
        {
            // (?<=[\w]{1}) the name has to start with 1 word-character
            // [\w-\._\+%]* the replacement-part can contain 0-n word characters including -_.+%
            // ?=@ the name has to end with a @
            // [\w-_]+ @ should be followed by one characters which may contain _
            // [\.]{0} Presence of a . is optional. To check for emails of the form abc@gmail
            // Depending on the amount of characters you want to remain unchanged you can change {1} to {2} or something else at the beginning or at the end.

            // Matches aar9_onb@dev.com, m@text.com.in, me@t_o.dom, user@gmail, again@gmail.
            // Does not match someone@, @someone
            string pattern = @"(?<=[\w]{1})[\w-\._\+%]*(?=@([\w-_]+)[\.]{0})";
            return Regex.Replace(content, pattern, m => new string('*', m.Length));
        }

        //private List<Func<string, string>> Anonymizers = new List<Func<string, string>>();

        //private void InitializeDelegates()
        //{
        //    Anonymizers.Add(MaskEmails);
        //    Anonymizers.Add(MaskPassword);
        //    Anonymizers.Add(MaskQueryString);
        //    Anonymizers.Add(MaskPhone);
        //}

        public string RemovePII(string content)
        {
            string currContent = content;

            currContent = MaskEmails(currContent);
            currContent = MaskPassword(currContent);
            currContent = MaskQueryString(currContent);
            currContent = MaskPhone(currContent);
            currContent = MaskIPV4Address(currContent);

            return currContent;
            //string currContent = content;
            //foreach (Func<string, string> currAnonymizer in Anonymizers)
            //{
            //    currContent = currAnonymizer(currContent);
            //}
        }

        public FreshChatClientService(IConfiguration configuration)
        {
            LoadConfigurations(configuration);
            InitializeHttpClient();
            //InitializeDelegates();
        }

        public bool MakeCallToFreshChat(string baseUri, string uri, HttpMethod method, string jsonBody)
        {
            throw new NotImplementedException();
        }

        public bool MakeCallToFreshChat(string fullUri, HttpMethod method, string jsonBody)
        {
            throw new NotImplementedException();
        }

        public bool MakeGetCallToFreshChat(string baseUri, string uri)
        {
            throw new NotImplementedException();
        }

        public bool MakeGetCallToFreshChat(string fullUri)
        {
            throw new NotImplementedException();
        }

        public bool VerifyCall(string ApiKey)
        {
            if (string.IsNullOrWhiteSpace(ApiKey))
            {
                return false;
            }

            return string.Compare(ApiKey, this.ApplensApiKey, true) == 0;
        }
    }
}
