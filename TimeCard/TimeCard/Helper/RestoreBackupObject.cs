using System;
using System.IO;
using System.Xml.Serialization;

namespace TimeCard.Helper
{
    public class RestoreBackupObject
    {
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
        public static T RestoreData<T>(string fullFilePath)
        {
            object ob = null;
            try
            {
                XmlSerializer ser = new XmlSerializer(typeof(T));
                using (TextReader rd = new StreamReader(fullFilePath))
                {
                    ob = ser.Deserialize(rd);
                    if (ob != null)
                    {
                        return (T)ob;
                    }
                    return default(T);
                }
            }
            catch (Exception)
            {
                return default(T);
            }
        }
        public static string Serialize(object ob)
        {
            string ret = "";
            try
            {
                if (ob != null)
                {
                    XmlSerializer x = new XmlSerializer(ob.GetType());
                    StringWriter sw = new StringWriter();
                    x.Serialize(sw, ob);
                    ret = sw.ToString();
                }
                else
                {
                    ret = "Object is null";
                }
            }
            catch (Exception ex)
            {
                ret = ex.Message;
            }
            return ret;
        }
    }
}