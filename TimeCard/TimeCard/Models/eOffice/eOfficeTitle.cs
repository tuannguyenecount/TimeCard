using ECMOCB.CEWSI;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace TimeCard.Models.eOffice
{
    public class eOfficeTitle
    {
        public int TitleId { get; set; }
        public string TitleCode { get; set; }
        public string TitleName { get; set; }
        public string TitleType { get; set; }
        public int Status { get; set; }
    }
}
