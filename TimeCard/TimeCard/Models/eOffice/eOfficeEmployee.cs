using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TimeCard.Models.eOffice
{
    public class eOfficeEmployee
    {
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string EmployeeNo { get; set; }
        public string TitleCode { get; set; }
        public string TitleName { get; set; }
        public string TitleType { get; set; }
        public int BranchId { get; set; }
        public string BranchName { get; set; }
        public int BranchLevel { get; set; }
        public string BranchType { get; set; }
        public int IsManager { get; set; }
        public int IsSpecialize { get; set; }
        public int Status { get; set; }

    }

    public class Employee_update
    {
        public eOfficeEmployee oldEmployee { get; set; }
        public eOfficeEmployee newEmployee { get; set; }
    }
}