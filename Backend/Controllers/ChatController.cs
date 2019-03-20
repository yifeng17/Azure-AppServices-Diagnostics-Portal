using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers
{
    [Produces("application/json")]
    [Route("api/chat/{product}")]
    [ResponseCache(CacheProfileName = "Default")]
    public class ChatController : Controller
    {
        IChatService ChatService;
        public ChatController(IChatService chatService)
        {
            ChatService = chatService;
        }

        [HttpGet("status")]
        public IActionResult GetChatStatus(string product)
        {
            if (string.IsNullOrWhiteSpace(product))
            {
                return BadRequest("product cannot be empty");
            }

            return Ok(ChatService.GetChatStatus(product));
        }
    }
}