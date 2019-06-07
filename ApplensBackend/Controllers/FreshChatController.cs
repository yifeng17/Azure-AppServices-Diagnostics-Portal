using AppLensV3.Helpers;
using AppLensV3.Models;
using AppLensV3.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AppLensV3.Attributes;
using Newtonsoft.Json;

namespace AppLensV3.Controllers
{
    [Route("api")]
    [FreshChatAuth(true)]
    public class FreshChatController: ControllerBase
    {
        private readonly IDiagnosticClientService _diagnosticClient;
        private readonly IFreshChatClientService _freshChatClientService;

        public FreshChatController(IDiagnosticClientService diagnosticClient, IFreshChatClientService freshChatClientService)
        {
            _diagnosticClient = diagnosticClient;
            _freshChatClientService = freshChatClientService;
        }

        private List<string> ExtractAllTextContent(List<MessagePart> msgParts)
        {
            List<string> textContent = new List<string>();
            if (msgParts != null && msgParts.Count > 0)
            {
                foreach (MessagePart currPart in msgParts)
                {
                    textContent.AddRange(ExtractAllTextContent(currPart));
                }
            }

            return textContent;
        }

        private List<string> ExtractAllTextContent(MessagePart msgPart)
        {
            List<string> textContent = new List<string>();
            if (msgPart.Text != null)
            {
                textContent.Add(_freshChatClientService.RemovePII(msgPart.Text.Content));
            }

            if (msgPart.Collection != null && msgPart.Collection.SubParts.Count > 0)
            {
                foreach (MessagePart currPart in msgPart.Collection.SubParts)
                {
                    textContent.AddRange(ExtractAllTextContent(currPart));
                }
            }

            return textContent;
        }

        private List<string> ExtractAllImageUrls(List<MessagePart> msgParts)
        {
            List<string> imageUrl = new List<string>();

            if (msgParts != null && msgParts.Count > 0)
            {
                foreach (MessagePart currPart in msgParts)
                {
                    imageUrl.AddRange(ExtractAllImageUrls(currPart));
                }
            }

            return imageUrl;
        }

        private List<string> ExtractAllImageUrls(MessagePart msgPart)
        {
            List<string> imageUrl= new List<string>();
            if (msgPart.Image != null)
            {
                imageUrl.Add(msgPart.Image.Url);
            }

            if (msgPart.Collection != null && msgPart.Collection.SubParts.Count > 0)
            {
                foreach (MessagePart currPart in msgPart.Collection.SubParts)
                {
                    imageUrl.AddRange(ExtractAllImageUrls(currPart));
                }
            }

            return imageUrl;
        }

        /// <summary>
        /// Action for freshchat webhook.
        /// </summary>
        /// <param name="body">Request body.</param>
        /// <returns>Task for handling freshchat webhook.</returns>
        [HttpPost("chatHook")]
        public async Task<IActionResult> ChatHook([FromBody]JToken body)
        {
            if (body != null)
            {
                try
                {
                    FreshChatPayload incomingPayload = incomingPayload = body.ToObject<FreshChatPayload>();
                    ChatMessageToLog logMsg = new ChatMessageToLog();
                    switch (incomingPayload.Action)
                    {
                        case Actions.MessageCreate:
                            MessageCreateData msgData = (MessageCreateData) incomingPayload.Data;
                            logMsg.ResourceUri = string.Empty;
                            logMsg.Id = msgData.Message.Id;
                            logMsg.ChannelId = msgData.Message.ChannelId;
                            logMsg.ConversationId = msgData.Message.ConversationId;
                            logMsg.TimeStamp = msgData.Message.CreatedTime;
                            logMsg.MessageType = msgData.Message.MessageType;

                            if (msgData.Message.ActorType == ActorTypes.Agent)
                            {
                                logMsg.Sender = new AgentDetails();
                            }
                            else
                            {
                                logMsg.Sender = new UserDetails();
                            }

                            logMsg.Sender.Id = msgData.Message.ActorId;

                            if (msgData.Message.MsgParts != null && msgData.Message.MsgParts.Count > 0)
                            {
                                logMsg.TextContent = ExtractAllTextContent(msgData.Message.MsgParts);
                                logMsg.ImageUrls = ExtractAllImageUrls(msgData.Message.MsgParts);
                            }

                            if (msgData.Message.ReplyParts != null && msgData.Message.ReplyParts.Count > 0)
                            {
                                logMsg.TextContent = ExtractAllTextContent(msgData.Message.ReplyParts);
                                logMsg.ImageUrls = ExtractAllImageUrls(msgData.Message.ReplyParts);
                            }

                            break;
                        default:
                            throw new Exception($"Unhandled message type {incomingPayload.Action.ToString()}. Unable to handle.");
                            break;
                    }

                    return Content(JsonConvert.SerializeObject(logMsg));
                }
                catch (JsonSerializationException sException)
                {
                    throw new JsonSerializationException("Failed to Deserialize the incoming data.", sException);
                }
                catch (Exception ex)
                {
                    throw new ArgumentException("Unknwon error while trying to read the incoming post body ", ex);
                }
            }
            else
            {
                return BadRequest("Empty post body");
            }
        }

    }
}
