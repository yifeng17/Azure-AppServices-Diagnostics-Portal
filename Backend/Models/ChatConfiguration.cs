using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class ChatConfiguration
    {
        public bool GlobalEnabled { get; set; }

        public PublicHoliday[] PublicHolidays { get; set; }

        public OffHours[] OffHours { get; set; }

        public int BusinessStartDay { get; set; }
        public int BuisnessEndDay { get; set; }
        public int BusinessStartHourPST { get; set; }
        public int BusinessEndHourPST { get; set; }
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
        public int StartHourPST { get; set; }
        public int StartMinutePST { get; set; }
        public int EndHourPST { get; set; }
        public int EndMinutePST { get; set; }
    }

    public class ChatStatus
    {
        public bool IsEnabled { get; set; }

        public bool IsValidTime { get; set; }
    }
}
