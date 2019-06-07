using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace AppLensV3
{
    #region Enums
    public enum ActorTypes
    {
        [EnumMember(Value = "agent")]
        Agent,

        [EnumMember(Value = "system")]
        System,

        [EnumMember(Value = "user")]
        User
    }

    public enum Actions
    {
        [EnumMember(Value = "conversation_assignment")]
        ConversationAssignment,

        [EnumMember(Value = "conversation_reopen")]
        ConversationReopen,

        [EnumMember(Value = "conversation_resolution")]
        ConversationResolution,

        [EnumMember(Value = "message_create")]
        MessageCreate
    }

    public enum MessageTypes
    {
        [EnumMember(Value = "normal")]
        Normal,

        [EnumMember(Value = "private")]
        Private
    }

    public enum PartTypes
    {
        [EnumMember(Value = "text")]
        Text,

        [EnumMember(Value = "url_button")]
        UrlButton,

        [EnumMember(Value = "quick_reply_button")]
        QuickReplyButton,

        [EnumMember(Value = "image")]
        Image,

        [EnumMember(Value = "collection")]
        Collection
    }

    public enum StatusList
    {
        [EnumMember(Value = "new")]
        New,

        [EnumMember(Value = "assigned")]
        Assigned,

        [EnumMember(Value = "resolved")]
        Resolved,

        [EnumMember(Value = "reopened")]
        Reopened
    }

    public enum SocialProfileTypes
    {
        [EnumMember(Value = "facebook")]
        Facebook,

        [EnumMember(Value = "twitter")]
        Twitter,

        [EnumMember(Value = "skype")]
        Skype,

        [EnumMember(Value = "linkedin")]
        Linkedin
    }

    #endregion //Enums

    public class Actor
    {
        [JsonConverter(typeof(StringEnumConverter))]
        [JsonProperty(PropertyName = "actor_type")]
        public ActorTypes ActorType;

        [JsonProperty(PropertyName = "actor_Id")]
        public string ActorId;
    }

    public interface IPart
    {
        PartTypes GetPartTpe();
    }

    public class TextPart : IPart
    {
        [JsonProperty(PropertyName = "content", Order = 1)]
        public string Content;

        public PartTypes GetPartTpe()
        {
            return PartTypes.Text;
        }
    }

    public class UrlButtonPart : IPart
    {
        [JsonProperty(PropertyName = "label")]
        public string Label;

        [JsonProperty(PropertyName = "url")]
        public string Url;

        [JsonProperty(PropertyName = "target")]
        public string Target;

        public PartTypes GetPartTpe()
        {
            return PartTypes.UrlButton;
        }
    }

    public class QuickReplyButtonPart : IPart
    {
        [JsonProperty(PropertyName = "label")]
        public string Label;

        [JsonProperty(PropertyName = "custom_reply_text")]
        public string CustomReplyText;

        public PartTypes GetPartTpe()
        {
            return PartTypes.QuickReplyButton;
        }
    }

    public class ImagePart : IPart
    {
        [JsonProperty(PropertyName = "url")]
        public string Url;

        public PartTypes GetPartTpe()
        {
            return PartTypes.Image;
        }
    }

    public class CollectionPart : IPart
    {
        [JsonProperty(PropertyName = "sub_parts")]
        public List<MessagePart> SubParts;

        public PartTypes GetPartTpe()
        {
            return PartTypes.Collection;
        }

    }

    public class MessagePart
    {
        [JsonProperty(PropertyName = "text")]
        public TextPart Text;

        [JsonProperty(PropertyName = "image")]
        public ImagePart Image;

        [JsonProperty(PropertyName = "url_button")]
        public UrlButtonPart UrlButton;

        [JsonProperty(PropertyName = "quick_reply_button")]
        public QuickReplyButtonPart QuickReplyButton;

        [JsonProperty(PropertyName = "collection")]
        public CollectionPart Collection;
    }

    public class Message
    {
        [JsonProperty(PropertyName = "message_parts")]
        public List<MessagePart> MsgParts;

        [JsonProperty(PropertyName = "reply_parts")]
        public List<MessagePart> ReplyParts;

        [JsonProperty(PropertyName = "app_id")]
        public string AppId;

        [JsonProperty(PropertyName = "actor_id")]
        public string ActorId;

        [JsonProperty(PropertyName = "id")]
        public string Id;

        [JsonProperty(PropertyName = "channel_id")]
        public string ChannelId;

        [JsonProperty(PropertyName = "conversation_id")]
        public string ConversationId;

        [JsonConverter(typeof(StringEnumConverter))]
        [JsonProperty(PropertyName = "message_type")]
        public MessageTypes MessageType;

        [JsonConverter(typeof(StringEnumConverter))]
        [JsonProperty(PropertyName = "actor_type")]
        public ActorTypes ActorType;

        [JsonProperty(PropertyName = "created_time")]
        public DateTime CreatedTime;
    }

    public class MessageCreateData : IData
    {
        [JsonProperty(PropertyName = "message", Order = 1)]
        public Message Message;
    }

    public class ConversationDetails : IData
    {
        [JsonProperty(PropertyName = "conversation_id")]
        public string ConversationId;

        [JsonProperty(PropertyName = "app_id")]
        public string AppId;

        [JsonProperty(PropertyName = "status")]
        public StatusList Status;

        [JsonProperty(PropertyName = "assigned_agent_id")]
        public string AssignedAgentId;
    }

    public class ReopenDetails
    {
        [JsonProperty(PropertyName = "reopener")]
        public ActorTypes Reopener;

        [JsonProperty(PropertyName = "reopener_id")]
        public string ReopenerId;

        [JsonProperty(PropertyName = "conversation")]
        public ConversationDetails Conversation;
    }

    public class ConvReopenData :IData
    {
        [JsonProperty(PropertyName = "reopen")]
        public ReopenDetails Reopen;
    }

    public class ResolveDetails
    {
        [JsonProperty(PropertyName = "resolver")]
        public ActorTypes Resolver;

        [JsonProperty(PropertyName = "resolver_id")]
        public string ResolverId;

        [JsonProperty(PropertyName = "conversation")]
        public ConversationDetails Conversation;
    }

    public class ConvResolutionData : IData
    {
        [JsonProperty(PropertyName = "resolve")]
        public ResolveDetails Resolve;
    }

    public class AssignmentDetails
    {
        [JsonProperty(PropertyName = "assignor")]
        public ActorTypes Assignor;

        [JsonProperty(PropertyName = "assignor_id")]
        public string AssignorId;

        [JsonProperty(PropertyName = "to_agent_id")]
        public string ToAgentId;

        [JsonProperty(PropertyName = "to_group_id")]
        public string ToGroupId;

        [JsonProperty(PropertyName = "from_agent_id")]
        public string FromAgentId;

        [JsonProperty(PropertyName = "from_group_id")]
        public string FromGroupId;

        [JsonProperty(PropertyName = "conversation")]
        public ConversationDetails Conversation;

    }

    public class ConvAssignmentData:IData
    {
        [JsonProperty(PropertyName = "assignment")]
        public AssignmentDetails Assignment;
    }

    public interface IData
    { }

    public class FreshChatPayload
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="FreshChatPayload"/> class.
        /// To be used only for Deserialization. For use in code, initialize an with Action.
        /// </summary>
        public FreshChatPayload()
        {
            this.Data = null;
        }

        public FreshChatPayload(Actions action)
        {
            this.Action = action;
        }

        [JsonProperty(PropertyName = "actor", Order = 1)]
        public Actor Actor;

        private Actions _action;

        [JsonProperty(PropertyName = "action", Order = 2)]
        public Actions Action {
            get {
                return _action;
            }

            set {
                this._action = value;
                if (this.Data == null)
                {
                    switch (this._action)
                    {
                        case Actions.MessageCreate:
                            this.Data = new MessageCreateData();
                            break;
                        case Actions.ConversationReopen:
                            this.Data = new ConvReopenData();
                            break;
                        case Actions.ConversationResolution:
                            this.Data = new ConvResolutionData();
                            break;
                        default:
                            this.Data = new ConvAssignmentData();
                            break;
                    }
                }
            }
        }

        [JsonProperty(PropertyName = "action_time", Order = 3)]
        public DateTime ActionTime;

        [JsonProperty(PropertyName = "data", Order = 4)]
        public IData Data;
    }

    public class Avatar
    {
        [JsonProperty(PropertyName = "url")]
        public string Url;
    }

    public class SocialProfile
    {
        [JsonConverter(typeof(StringEnumConverter))]
        [JsonProperty(PropertyName = "type")]
        public SocialProfileTypes Type;

        [JsonProperty(PropertyName = "id")]
        public string Id;
    }

    public class PersonDetails
    {
        public PersonDetails(ActorTypes type)
        {
            this.PersonType = type;
        }

        [JsonProperty(PropertyName = "id")]
        public string Id;

        [JsonProperty(PropertyName = "email")]
        public string Email;

        [JsonProperty(PropertyName = "avatar")]
        public Avatar Avatar;

        [JsonProperty(PropertyName = "phone")]
        public string Phone;

        [JsonProperty(PropertyName = "first_name")]
        public string FirstName;

        [JsonProperty(PropertyName = "last_name")]
        public string LastName;

        [JsonProperty(PropertyName = "social_profiles")]
        public List<SocialProfile> SocialProfiles;

        [JsonConverter(typeof(StringEnumConverter))]
        public ActorTypes PersonType;
    }

    public class AgentDetails : PersonDetails
    {
        public AgentDetails()
            : base(ActorTypes.Agent)
        {
        }

        [JsonProperty(PropertyName = "biography")]
        public string Biography;
    }

    public class UserDetailsProperties
    {
        [JsonProperty(PropertyName = "name")]
        public string Name;

        [JsonProperty(PropertyName = "value")]
        public string Value;
    }

    public class UserDetails : PersonDetails
    {
        public UserDetails()
            : base(ActorTypes.User)
        {
        }

        [JsonProperty(PropertyName = "reference_id")]
        public string ReferenceId;

        [JsonProperty(PropertyName = "created_time")]
        public DateTime CreatedTime;

        [JsonProperty(PropertyName = "properties")]
        public List<UserDetailsProperties> Properties;
    }

    public class ChatMessageToLog
    {
        // Need a way to get the ARM resource url. Have to check with Freshchat folks on this.
        public string ResourceUri { get; set; }

        public string Id { get; set; }

        public string ChannelId { get; set; }

        public string ConversationId { get; set; }

        public PersonDetails Sender { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public MessageTypes MessageType { get; set; }

        public DateTime TimeStamp { get; set; }

        public List<string> TextContent { get; set; }

        public List<string> ImageUrls { get; set; }
    }
}
