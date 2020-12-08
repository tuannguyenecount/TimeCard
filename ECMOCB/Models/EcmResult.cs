using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECMOCB.Models
{
    public class EcmResult
    {
        public int ErrorCode { get; set; }
        public string ErrorMsg { get; set; }
        public string DocId { get; set; }
        public string FileName { get; set; }
        public string Mime { get; set; }
        public double ContentLength { get; set; }
    }
}