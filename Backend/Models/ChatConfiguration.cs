using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class ChatConfiguration
    {
        public string FreshToken { get; set; }

        public bool GlobalEnabled { get; set; }

        public ChatHoursDuration[] GlobalChatHours { get; set; }

        public PublicHoliday[] PublicHolidays { get; set; }

        public OffHours[] OffHours { get; set; }
        
        public ProductSpecificSettings[] ProductSpecificSettings { get; set; }
    }
    
    public class PublicHoliday
    {
        public int Day { get; set; }

        public int Month { get; set; }

        public int Year { get; set; }
    }

    public class OffHours
    {
        public int Day { get; set; }

        public string StartTimePST { get; set; }

        public string EndTimePST { get; set; }
    }

    public class ChatHoursDuration
    {
        public int BusinessStartDay { get; set; }

        public int BuisnessEndDay { get; set; }

        public string BusinessStartTimePST { get; set; }

        public string BusinessEndTimePST { get; set; }
    }

    public class ProductSpecificSettings
    {
        public string Name { get; set; }
        
        public ChatHoursDuration[] ChatHours { get; set; }
    }

    public class ChatStatus
    {
        public string FreshToken { get; set; }

        public bool IsEnabled { get; set; }

        public bool IsValidTime { get; set; }
    }
}
