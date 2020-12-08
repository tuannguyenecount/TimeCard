using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TimeCard.Models.Admin
{
    public class AdminUser
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Title { get; set; }
        public string Gender { get; set; }
        public string UserType { get; set; }
        public string GenderName { get; set; }
        public int Status { get; set; }
        public string StatusName { get { return Status == 1 ? "Hoạt động" : "Ngừng hoạt động"; } }
    }
}