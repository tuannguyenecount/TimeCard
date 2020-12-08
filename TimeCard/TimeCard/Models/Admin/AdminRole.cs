using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TimeCard.Models.Admin
{
    public class AdminRole
    {
        public string Role { get; set; }
        public string RoleName { get; set; }
        public string Params { get; set; }
        public int Status { get; set; }
        public string StatusName { get { return Status == 1 ? "Hoạt động" : "Ngừng hoạt động"; } }
    }
}