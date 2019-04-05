using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Backend.Controllers
{
    [Produces("application/json")]
    [Route("api/appsettings")]
    [ResponseCache(CacheProfileName = "Default")]
    public class AppSettingsController : Controller
    {
        private IConfiguration config;

        public AppSettingsController(IConfiguration configuration)
        {
            this.config = configuration;
        }

        [HttpGet("{name}")]
        public IActionResult GetAppSettingValue(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("App setting name is empty");
            }

            return Ok(config[name]);
        }
    }
}