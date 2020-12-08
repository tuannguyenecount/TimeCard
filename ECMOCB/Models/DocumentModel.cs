using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECMOCB.Models
{
    public class DocumentModel
    {
        public string FileName { get; set; }
        public string DocumentClass { get; set; }
        public byte[] BinaryFile { get; set; }
        public string MimeTypeSource { get; set; }
        public string DestinationFolder { get; set; }
        public string ObjectStore { get; set; }
        public string EcmUrl { get; set; }
        public string EcmDomain { get; set; }
        public string EcmUser { get; set; }
        public string EcmPassword { get; set; }
        public int IsUseCert { get; set; }
        public Dictionary<string, string> Properties { get; set; }
    }
}
