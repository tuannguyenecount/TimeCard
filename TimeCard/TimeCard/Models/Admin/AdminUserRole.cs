using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TimeCard.Models.Admin
{
    public class AdminUserRole
    {
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string Gender { get; set; }
        public string GenderName { get { return Gender == "MALE" ? "Nam" : "Nữ"; } }
        public string Title { get; set; }
        public string Role { get; set; }
        public string RoleName { get; set; }
        public int Status { get; set; }
        public string StatusName { get { return Status == 1 ? "Hoạt động" : "Ngừng hoạt động"; } }
    }
}