using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TimeCard.Models.System
{
    public class SettingModel
    {
        public string Name { get; set; }
        public string Value1 { get; set; }
        public string Value2 { get; set; }
        public int Status { get; set; }
        public string Setting_Type { get; set; }
    }
}