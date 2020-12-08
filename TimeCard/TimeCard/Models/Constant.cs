using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TimeCard.Models
{
    public class Constant
    {
        // Statuc
        public class Status
        {
            public const int Active = 1; 
            public const int Deactive = 0;
        }

        public class OptionType
        {
            public const string CREATEDATE = "CREATEDATE";
            public const string DUEDATE = "DUEDATE";
        }
    }
}