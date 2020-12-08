using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TimeCard.Models
{
    public class ErrorModel
    {
        public int TaskId { get; set; }
        public int NotifyId { get; set; }
        public int ErrorCode { get; set; }
        public string ErrorMsg { get; set; }
        public string ErrorDetail { get; set; }
        public string Package { get; set; }
        public string Store { get; set; }
        public string UserRequest { get; set; }
    }
}