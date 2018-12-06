using Backend.Models;
using NodaTime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class ChatService : IChatService
    {
        ChatConfiguration Config;

        public ChatService(ChatConfiguration config)
        {
            Config = config;
        }

        public ChatStatus GetChatStatus()
        {
            var currentDateTime = new ZonedDateTime(SystemClock.Instance.GetCurrentInstant(), DateTimeZoneProviders.Tzdb["America/Los_Angeles"]);
            return new ChatStatus
            {
                IsEnabled = Config.GlobalEnabled,
                IsValidTime = IsWorkingHour(currentDateTime) && !IsBreakTime(currentDateTime) && !IsHoliday(currentDateTime)
            };
        }

        private bool IsHoliday(ZonedDateTime currentDateTime)
        {
            foreach (var holiday in Config.PublicHolidays)
            {
                if (currentDateTime.Day == holiday.Day && currentDateTime.Month == holiday.Month && currentDateTime.Year == holiday.Year)
                {
                    return true;
                }
            }
            return false;
        }

        private bool IsWorkingHour(ZonedDateTime currentDateTime)
        {
            var dayOfWeek = (int)currentDateTime.DayOfWeek;
            var hourOfDay = currentDateTime.Hour;
            return dayOfWeek >= Config.BusinessStartDay && dayOfWeek <= Config.BuisnessEndDay
                && hourOfDay >= Config.BusinessStartHourPST && hourOfDay < Config.BusinessEndHourPST;
        }

        private bool IsBreakTime(ZonedDateTime currentDateTime)
        {
            if (Config.OffHours == null)
            {
                return false;
            }

            var dayOfWeek = (int)currentDateTime.DayOfWeek;

            foreach (var breakTime in Config.OffHours)
            {
                if (dayOfWeek == breakTime.Day &&
                   (currentDateTime.Hour > breakTime.StartHourPST || (currentDateTime.Hour == breakTime.StartHourPST && currentDateTime.Minute > breakTime.StartMinutePST)) &&
                   (currentDateTime.Hour < breakTime.EndHourPST || (currentDateTime.Hour == breakTime.EndHourPST && currentDateTime.Minute < breakTime.EndHourPST)))
                {
                    return true;
                }
            }
            return false;
        }
    }
}
