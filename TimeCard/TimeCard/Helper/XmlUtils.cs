using OCB.Libraries.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Xml.Serialization;

namespace TimeCard.Helper
{
    public class XmlUtils
    {
        public static string Serialize(object ob)
        {
            XmlSerializer x = new XmlSerializer(ob.GetType());
            using (StringWriter sw = new StringWriter())
            {
                x.Serialize(sw, ob);
                return sw.ToString();
            }
        }
        public static T DeSerializeOne<T>(string xml)
        {
            XmlSerializer ser = new XmlSerializer(typeof(T));
            object ob = null;
            using (StringReader rd = new StringReader(xml))
            {
                ob = ser.Deserialize(rd);
                if (ob != null)
                {
                    return (T)ob;
                }
                return default(T);
            }
        }
        public static List<T> DeSerialize<T>(string xml, string tag = "//Root")
        {
            XmlParser paser = new XmlParser("<xml><Root>" + xml + "</Root></xml>");
            return paser.GetList<T>(tag);
        }
        public static void BackupData<T>(T ob, string fullFilePath, bool backup = false)
        {
            try
            {
                XmlSerializer x = new XmlSerializer(typeof(T));
                if (backup && File.Exists(fullFilePath))
                {
                    int cnt = 1;
                    string newfile = fullFilePath + "." + cnt.ToString("D3");
                    while (File.Exists(newfile))
                    {
                        cnt++;
                        newfile = fullFilePath + "." + cnt.ToString("D3");
                    }
                    File.Copy(fullFilePath, newfile);
                }
                var fstr = File.Create(fullFilePath);
                using (fstr)
                {
                    x.Serialize(fstr, ob);
                }
            }
            catch (Exception) { }
        }
    }
}