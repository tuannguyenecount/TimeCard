using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECMOCB.Models
{
    public class EcmInfo
    {
        public string DocId { get; set; }
        public string DocClass { get; set; }
        public string DocTitle { get; set; }
        public string FolderPath { get; set; }
        public string ObjectStore { get; set; }
        public string User { get; set; }
        public string Domain { get; set; }
        public string Password { get; set; }
        public string Url { get; set; }
    }
}
