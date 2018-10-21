using Backend.Helpers;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [Produces("application/json")]
    [Route("api/comms")]
    public class CommsController : Controller
    {
        private readonly IOutageCommunicationService _outageService;

        public CommsController(IOutageCommunicationService outageService)
        {
            this._outageService = outageService;
        }

        [HttpGet]
        [HttpOptions]
        public async Task<IActionResult> Invoke(string startTime = null, string endTime = null)
        {
            if (!Request.Headers.ContainsKey("x-ms-resource") || !Request.Headers.TryGetValue("x-ms-resource", out StringValues val))
            {
                return BadRequest("Missing x-ms-resource");
            }

            string resource = val.First();
            Regex resourceRegEx = new Regex("/subscriptions/(.*)/resourcegroups/(.*)/providers/(.*)/(.*)/(.*)");
            Match match = resourceRegEx.Match(resource);
            if (!match.Success)
            {
                return BadRequest("resource uri not in correct format.");
            }

            string subscriptionId = match.Groups[1].Value;

            if (!DateTimeHelper.PrepareStartEndTimeWithTimeGrain(startTime, endTime, string.Empty, 30, out DateTime startTimeUtc, out DateTime endTimeUtc, out TimeSpan timeGrainTimeSpan, out string errorMessage))
            {
                return BadRequest(errorMessage);
            }

            List<Communication> comms = await this._outageService.GetCommunicationsAsync(subscriptionId, startTimeUtc, endTimeUtc);
            return Ok(comms);
        }
    }
}