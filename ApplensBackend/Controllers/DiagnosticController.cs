// <copyright file="DiagnosticController.cs" company="Microsoft Corporation">
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
// </copyright>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using AppLensV3.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SendGrid.Helpers.Mail;

namespace AppLensV3.Controllers
{
    /// <summary>
    /// Diagnostic controller.
    /// </summary>
    [Route("api")]
    [Authorize]
    public class DiagnosticController : Controller
    {
        private class InvokeHeaders
        {
            public string Path { get; set; }
            public string Method { get; set; }
            public IEnumerable<string> DetectorAuthors { get; set; }
            public bool InternalClient { get; set; }
            public bool InternalView { get; set; }
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DiagnosticController"/> class.
        /// </summary>
        /// <param name="env">The environment.</param>
        /// <param name="diagnosticClient">Diagnostic client.</param>
        /// <param name="emailNotificationService">Email notification service.</param>
        public DiagnosticController(IHostingEnvironment env, IDiagnosticClientService diagnosticClient, IEmailNotificationService emailNotificationService)
        {
            Env = env;
            DiagnosticClient = diagnosticClient;
            EmailNotificationService = emailNotificationService;
        }

        private IDiagnosticClientService DiagnosticClient { get; }

        private IEmailNotificationService EmailNotificationService { get; }

        private IHostingEnvironment Env { get; }

        private static string TryGetHeader(HttpRequest request, string headerName, string defaultValue = "") =>
            request.Headers.ContainsKey(headerName) ? (string)request.Headers[headerName] : defaultValue;

        /// <summary>
        /// Action for invoke request.
        /// </summary>
        /// <param name="body">Request body.</param>
        /// <returns>Task for invoking request.</returns>
        [HttpPost("invoke")]
        [HttpOptions("invoke")]
        public async Task<IActionResult> Invoke([FromBody]JToken body)
        {
            var invokeHeaders = ProcessInvokeHeaders();

            if (string.IsNullOrWhiteSpace(invokeHeaders.Path))
            {
                return BadRequest("Missing x-ms-path-query header");
            }

            var detectorId = body?["id"] != null ? body["id"].ToString() : string.Empty;

            string applensLink = "https://applens.azurewebsites.net/" + invokeHeaders.Path.Replace("resourcegroup", "resourceGroup").Replace("diagnostics/publish", string.Empty) + "detectors/" + detectorId;

            var detectorAuthorEmails = new List<EmailAddress>();
            if (invokeHeaders.DetectorAuthors.Any())
            {
                detectorAuthorEmails = invokeHeaders.DetectorAuthors
                    .Select(x => x.EndsWith("@microsoft.com") ? x : $"{x}@microsoft.com")
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .Select(x => new EmailAddress(x)).ToList();
            }

            HttpRequestHeaders headers = new HttpRequestMessage().Headers;
            foreach (var header in Request.Headers)
            {
                if ((header.Key.StartsWith("x-ms-") || header.Key.StartsWith("diag-")) && !headers.Contains(header.Key))
                {
                    headers.Add(header.Key, header.Value.ToString());
                }
            }

            var response = await DiagnosticClient.Execute(invokeHeaders.Method, invokeHeaders.Path, body?.ToString(), invokeHeaders.InternalClient, invokeHeaders.InternalView, headers);
            if (response == null)
            {
                return StatusCode(500, "Null response from DiagnosticClient");
            }

            var responseTask = response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, await responseTask);
            }

            if (response.Headers.Contains("diag-script-etag"))
            {
                Request.HttpContext.Response.Headers.Add("diag-script-etag", response.Headers.GetValues("diag-script-etag").First());
            }

            if (invokeHeaders.Path.EndsWith("/diagnostics/publish", StringComparison.OrdinalIgnoreCase) && detectorAuthorEmails.Count > 0 && Env.IsProduction())
            {
                EmailNotificationService.SendPublishingAlert(invokeHeaders.DetectorAuthors.Last(), detectorId, applensLink, detectorAuthorEmails);
            }

            return Ok(JsonConvert.DeserializeObject(await responseTask));
        }

        private InvokeHeaders ProcessInvokeHeaders()
        {
            var path = string.Empty;
            if (Request.Headers.TryGetValue("x-ms-path-query", out var outPath))
            {
                path = outPath;
            }

            string method = HttpMethod.Get.Method;
            if (Request.Headers.TryGetValue("x-ms-method", out var outMethod))
            {
                method = outMethod;
            }

            var rawDetectorAuthors = string.Empty;
            if (Request.Headers.TryGetValue("x-ms-emailRecipients", out var outDetectorAuthors))
            {
                rawDetectorAuthors = outDetectorAuthors;
            }

            var detectorAuthors = rawDetectorAuthors.Split(new char[] { ' ', ',', ';', ':' }, StringSplitOptions.RemoveEmptyEntries);

            var internalClient = true;
            if (Request.Headers.TryGetValue("x-ms-internal-client", out var outClient))
            {
                bool.TryParse(outClient, out internalClient);
            }

            var internalView = true;
            if (Request.Headers.TryGetValue("x-ms-internal-view", out var outView))
            {
                bool.TryParse(outView, out internalView);
            }

            return new InvokeHeaders()
            {
                Path = path,
                Method = method,
                DetectorAuthors = detectorAuthors,
                InternalClient = internalClient,
                InternalView = internalView
            };
        }
    }
}
