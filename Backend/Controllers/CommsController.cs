using Backend.Helpers;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
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

        [HttpGet("{subscriptionId}")]
        [HttpOptions("{subscriptionId}")]
        public async Task<IActionResult> Invoke(string subscriptionId, string startTime = null, string endTime = null)
        {
            if (string.IsNullOrWhiteSpace(subscriptionId))
            {
                return BadRequest("subscriptionId cannot be empty");
            }

            if (!DateTimeHelper.PrepareStartEndTimeWithTimeGrain(startTime, endTime, string.Empty, 30, out DateTime startTimeUtc, out DateTime endTimeUtc, out TimeSpan timeGrainTimeSpan, out string errorMessage))
            {
                return BadRequest(errorMessage);
            }

            List<Communication> comms = await this._outageService.GetCommunicationsAsync(subscriptionId, startTimeUtc, endTimeUtc);
            return Ok(comms);
        }
    }
}