using System;
using System.Linq;
using Backend.Models;
using Microsoft.Extensions.Configuration;
using NodaTime;

namespace Backend.Services
{
    public class ChatService : IChatService
    {
        private ChatConfiguration chatConfig;
        private IConfiguration overallConfig;

        public ChatService(ChatConfiguration chatConfig, IConfiguration configuration)
        {
            this.chatConfig = chatConfig;
            this.overallConfig = configuration;
        }

        public ChatStatus GetChatStatus(string product)
        {
            var currentDateTime = new ZonedDateTime(SystemClock.Instance.GetCurrentInstant(), DateTimeZoneProviders.Tzdb["America/Los_Angeles"]);

            ProductSpecificSettings productSettings = null;
            if (!string.IsNullOrWhiteSpace(product))
            {
                productSettings = chatConfig.ProductSpecificSettings.FirstOrDefault(p => p.Name.Equals(product, StringComparison.OrdinalIgnoreCase));
            }

            return new ChatStatus
            {
                FreshToken = overallConfig["Chat:FreshToken"],
                IsEnabled = chatConfig.GlobalEnabled,
                IsValidTime = IsWorkingHour(currentDateTime, productSettings) && !IsBreakTime(currentDateTime) && !IsHoliday(currentDateTime)
            };
        }

        private bool IsHoliday(ZonedDateTime currentDateTime)
        {
            foreach (var holiday in chatConfig.PublicHolidays)
            {
                if (currentDateTime.Day == holiday.Day && currentDateTime.Month == holiday.Month && currentDateTime.Year == holiday.Year)
                {
                    return true;
                }
            }
            return false;
        }

        private bool IsWorkingHour(ZonedDateTime currentDateTime, ProductSpecificSettings productSettings)
        {
            ChatHoursDuration[] chatDuration = chatConfig.GlobalChatHours;
            if(productSettings != null && productSettings.ChatHours != null && productSettings.ChatHours.Any())
            {
                chatDuration = productSettings.ChatHours;
            }

            bool result = false;
            foreach(var duration in chatDuration)
            {
                result = result || IsTimeWithinDuration(currentDateTime, duration);
            }

            return result;
        }

        private bool IsTimeWithinDuration(ZonedDateTime currentDateTime, ChatHoursDuration timeDuration)
        {
            var dayOfWeek = (int)currentDateTime.DayOfWeek % 7;
            DateTime startTime = DateTime.ParseExact(timeDuration.BusinessStartTimePST, "HH:mm", null);
            DateTime endTime = DateTime.ParseExact(timeDuration.BusinessEndTimePST, "HH:mm", null);

            return (dayOfWeek >= timeDuration.BusinessStartDay && dayOfWeek <= timeDuration.BuisnessEndDay)
                    && (currentDateTime.Hour > startTime.Hour || (currentDateTime.Hour == startTime.Hour && currentDateTime.Minute >= startTime.Minute))
                    && (currentDateTime.Hour < endTime.Hour || (currentDateTime.Hour == endTime.Hour && currentDateTime.Minute <= endTime.Minute));
        }

        private bool IsBreakTime(ZonedDateTime currentDateTime)
        {
            if (chatConfig.OffHours == null)
            {
                return false;
            }

            var dayOfWeek = (int)currentDateTime.DayOfWeek;

            foreach (var breakTime in chatConfig.OffHours)
            {
                DateTime startTime = DateTime.ParseExact(breakTime.StartTimePST, "HH:mm", null);
                DateTime endTime = DateTime.ParseExact(breakTime.EndTimePST, "HH:mm", null);

                if (dayOfWeek == breakTime.Day &&
                   (currentDateTime.Hour > startTime.Hour || (currentDateTime.Hour == startTime.Hour && currentDateTime.Minute > startTime.Minute)) &&
                   (currentDateTime.Hour < endTime.Hour || (currentDateTime.Hour == endTime.Hour && currentDateTime.Minute < endTime.Hour)))
                {
                    return true;
                }
            }
            return false;
        }
    }
}
