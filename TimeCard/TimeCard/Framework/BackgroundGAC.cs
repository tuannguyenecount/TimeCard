using TimeCard.Models;
using System;
using System.ComponentModel;
using System.Configuration;
using System.IO;

namespace TimeCard.Framework
{
    public class BackgroundGAC
    {
        private static BackgroundWorker worker = null;
        private static bool busy = false;

        public static void Start()
        {
            if (worker == null)
            {
                busy = false;
                worker = new BackgroundWorker();
                worker.DoWork += new DoWorkEventHandler(DoWork);
                worker.WorkerReportsProgress = false;
                worker.WorkerSupportsCancellation = true;
                worker.RunWorkerCompleted +=
                       new RunWorkerCompletedEventHandler(WorkerCompleted);
                worker.RunWorkerAsync();
            }
        }
        public static void SetBusy()
        {
            busy = true;
        }
        public static void SetFree()
        {
            busy = false;
        }
        private static void DoWork(object sender, DoWorkEventArgs e)
        {
            if (!busy)
            {
                CleanTempDir();
            }
        }
        private static void WorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {
            //one a day = 86400000
            BackgroundWorker worker = sender as BackgroundWorker;
            if (worker != null)
            {
                System.Threading.Thread.Sleep(busy ? 600000 : 86400000);
                worker.RunWorkerAsync();
            }
        }
        public static void Cancel()
        {
            if (worker != null)
            {
                worker.CancelAsync();
                worker = null;
            }
        }
        private static void CleanTempDir()
        {
            var path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Temp");
            if (Directory.Exists(path) == false)
            {
                Directory.CreateDirectory(path);  
            }
            DirectoryInfo d = new DirectoryInfo(path);
            var files = d.GetFiles();
            foreach (FileInfo f in files)
            {
                try
                {
                    f.Delete();
                }
                catch (Exception)
                {
                    break;
                }
            }
            var dirs = d.GetDirectories();
            foreach (DirectoryInfo dir in dirs)
            {
                try
                {
                    string expireddays = ConfigurationManager.AppSettings[dir.Name + "_DIR_EXPIRED_AFTER"];
                    int day = 0;
                    if (!string.IsNullOrWhiteSpace(expireddays) && int.TryParse(expireddays, out day) && day > 0)
                    {
                        CleanFileOnExpire(dir, day);
                    }
                    else
                    {
                        dir.Delete(true);
                    }

                }
                catch (Exception)
                {
                    break;
                }
            }
        }
        private static void CleanFileOnExpire(DirectoryInfo dir, int day)
        {
            var files = dir.GetFiles();
            var today = DateTime.Today;
            foreach (FileInfo f in files)
            {
                TimeSpan t = today - f.CreationTime;
                if (t.TotalDays >= day)
                {
                    try
                    {
                        f.Delete();
                    }
                    catch (Exception) { }
                }
            }
        }
    }
}