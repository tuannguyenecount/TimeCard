using System;
using System.Globalization;
using System.IO;

namespace TimeCard.Helper
{
    public class LogHelper
    {
        public static LogHelper Current { get { return new LogHelper(); } }
        public void WriteLogs(string errorMessage, string action, string userRequest, string type = "CONTENT")
        {
            try
            {
                if(Directory.Exists(Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Logs")) == false)
                {
                    Directory.CreateDirectory(Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Logs"));
                }

                string path = string.Format("{0}\\{1}", System.AppDomain.CurrentDomain.BaseDirectory, "Logs\\" + DateTime.Today.ToString("yyyyMMdd") + ".txt");

                switch (type.ToUpper())
                {
                    case "SERVER":
                        path = string.Format("{0}\\{1}", System.AppDomain.CurrentDomain.BaseDirectory, "Logs\\Server\\" + DateTime.Today.ToString("yyyyMMdd") + "_server.txt");
                        break;
                }

                if (!File.Exists(path))
                {
                    File.Create(path).Close();
                }
                using (StreamWriter w = File.AppendText(path))
                {
                    w.WriteLine("[{0}] {1} {2}", DateTime.Now.ToString(CultureInfo.InvariantCulture), action, userRequest);
                    string err = errorMessage;
                    w.WriteLine(err);
                    w.Flush();
                    w.Close();
                }
            }
            catch (System.Exception ex)
            {
                WriteLogs(ex.Message, "WriteLogs", userRequest);
            }
        }
    }
}