using ECMOCB.CEWSI;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace TimeCard.Models.eOffice
{
    public class eOfficeBranch
    {
        public int BranchId { get; set; }
        public string BranchName { get; set; }
        public int BranchLevel { get; set; }
        public int ParentBranchId { get; set; }        
        public string ParentBranchName { get; set; }
        public int ParentBranchLevel { get; set; }
        public string BranchType { get; set; }
        public int CustGroupId { get; set; }
        public string CustGroupName { get; set; }
        public int AreaId { get; set; }
        public string AreaName { get; set; }
        public string TitleCode { get; set; }
        public string TitleName { get; set; }
        public int IsManager { get; set; }
        public int IsSpecialize { get; set; }
        public int Status { get; set; }
    }
}
