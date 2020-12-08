using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECMOCB.Models
{
    public class EcmQueryResult
    {
        public int ErrorCode { get; set; }
        public string ErrorMsg { get; set; }
        public DataTable Result { get; set; }
    }
}