using OCB.Web.Http;
using System;
using System.Collections.Generic;

namespace TimeCard.Framework
{
    public class DataSessionManager
    {
        private static int errCode = 0;
        private static string errMessage = "";
        public static int LastErrCode { get { return errCode; } }
        public static string LastErrMessage { get { return errMessage; } }

        public static T GetData<T>(string entryName, bool removeEntry = false)
        {
            object ob;
            if (OCBSession.TryGet(entryName, out ob, removeEntry))
            {
                DataWidthKey ret = ob as DataWidthKey;
                if (ret != null)
                {
                    return (T)ret.Data;
                }
                else
                {
                    return (T)ob;
                }
            }
            return default(T);
        }
        public static List<T> GetListData<T>(string entryName, bool removeEntry = false)
        {
            object ob;
            if (OCBSession.TryGet(entryName, out ob, removeEntry))
            {
                return (List<T>)ob;
            }
            return null;
        }
        public static bool SetData(string sessionName, object ob, int expirationMinute = 0)
        {
            if (expirationMinute > 0)
            {
                ExpirationSolution.Add(sessionName, expirationMinute);
            }
            return OCBSession.TrySet(sessionName, ob);
        }
        public static bool RemoveData(string sessionName)
        {
            return OCBSession.Remove(sessionName);
        }
        public static bool RemoveAllData()
        {
            return OCBSession.RemoveAll();
        }
        public static bool SetDataWithKey(string sessionName, object key, object data, int expirationMinute = 0)
        {
            if (expirationMinute > 0)
            {
                ExpirationSolution.Add(sessionName, expirationMinute);
            }
            return OCBSession.TrySet(sessionName, new DataWidthKey(key, data));
        }
        public static T GetDataWithKey<T>(string sessionName, object key, bool removeIfKeyNotMatch = true, bool removeSession = false)
        {
            object ob = null;
            if (OCBSession.TryGet(sessionName, out ob, removeSession))
            {
                DataWidthKey dw = ob as DataWidthKey;
                if (dw != null)
                {
                    if (dw.Key.Equals(key))
                    {
                        return (T)dw.Data;
                    }
                    else if (!removeSession && removeIfKeyNotMatch)
                    {
                        OCBSession.Remove(sessionName);
                    }
                }
            }
            return default(T);
        }
        class DataWidthKey
        {
            public DataWidthKey(object key, object data)
            {
                Key = key;
                Data = data;
            }
            public object Key { get; set; }
            public object Data { get; set; }
        }

    }
    public class ExpirationSolution
    {
        const string KEY = "ExpirationSolution";
        const string KEY2 = "ExpirationSolution2";
        public string SessionName { get; set; }
        public DateTime StarDate { get; set; }
        public int Minutes { get; set; }
        public static void Add(string sessionName, int expiration)
        {
            List<ExpirationSolution> list = DataSessionManager.GetData<List<ExpirationSolution>>(KEY, true);
            bool done = false;
            if (list != null)
            {
                int cnt = list.Count;
                for (int i = 0; i < cnt; i++)
                {
                    var it = list[i];
                    if (it.SessionName.Equals(sessionName))
                    {
                        it.StarDate = DateTime.Now;
                        it.Minutes = expiration;
                        done = true;
                        break;
                    }
                }
            }
            else
            {
                list = new List<ExpirationSolution>();
            }
            if (!done)
            {
                list.Add(new ExpirationSolution
                {
                    StarDate = DateTime.Now,
                    Minutes = expiration,
                    SessionName = sessionName
                });
            }
            DataSessionManager.SetData(KEY, list);
        }
        public static void Solve()
        {
            var lastRun = DataSessionManager.GetData<DateTime?>(KEY2);
            if (lastRun == null)
            {
                DataSessionManager.SetData(KEY2, DateTime.Now);
            }
            else
            {
                var tt = DateTime.Now - (DateTime)lastRun;
                //10 phut chay 1 lan
                if (tt.Minutes > 10)
                {
                    List<ExpirationSolution> list = DataSessionManager.GetData<List<ExpirationSolution>>(KEY, true);
                    if (list != null)
                    {
                        List<ExpirationSolution> list2 = new List<ExpirationSolution>();
                        int cnt = list.Count;
                        for (int i = 0; i < cnt; i++)
                        {
                            var it = list[i];
                            var t = DateTime.Now - it.StarDate;
                            if (t.Minutes >= it.Minutes)
                            {
                                DataSessionManager.RemoveData(it.SessionName);
                                continue;
                            }
                            list2.Add(it);
                        }
                        if (list2.Count > 0)
                        {
                            DataSessionManager.SetData(KEY, list2);
                        }
                    }
                    DataSessionManager.SetData(KEY2, DateTime.Now);
                }
            }
        }
    }
}