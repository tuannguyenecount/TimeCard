﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TimeCard.Models
{
    public class UserHubModels
    {
        public string UserName { get; set; }
        public HashSet<string> ConnectionIds { get; set; }
    }
}