using TimeCard.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TimeCard.Security
{
    public class UserOnlineManager
    {
        const string KEY = "USER_ONLINE_MANAGER";
        const int LifeTime = 60;
        public static void Connect()
        {
            var p = SharedContext.Current.LoggedProfile;
            if (p != null)
            {
                var ls = List;
                bool addNew = true;
                string uid = GetId(p.UserName);
                if (ls != null)
                {
                    var f = ls.FirstOrDefault(o => o.LoginId.Equals(uid));
                    if (f != null)
                    {
                        f.LastAccess = DateTime.Now;
                        addNew = false;
                    }
                }
                if (addNew)
                {
                    if (ls == null) ls = new List<UserOnline>();
                    ls.Add(
                        new UserOnline
                        {
                            LoginId = uid,
                            Fullname = p.FullName,
                            LastAccess = DateTime.Now,
                            LastIp = HttpContext.Current.Request.UserHostAddress
                        }
                    );
                }
                ServiceCache.Current.SetCache(KEY, ls, LifeTime);
            }
        }
        public static List<UserOnline> List
        {
            get
            {
                return ServiceCache.Current.GetCache<List<UserOnline>>(KEY);
            }
        }
        public static void DisConnect()
        {
            var ls = List;
            if (ls != null)
            {
                var p = SharedContext.Current.LoggedProfile;
                if (p != null)
                {
                    var f = ls.FirstOrDefault(o => o.LoginId.Equals(GetId(p.UserName)));
                    if (f != null)
                    {
                        ls.Remove(f);
                        ServiceCache.Current.SetCache(KEY, ls, LifeTime);
                    }
                }
            }
        }
        private static string GetId(string uid)
        {
            string real = SharedContext.Current.HttpContextIdentityName;
            if (!uid.StartsWith(real + "@"))
            {
                uid = uid + "-" + real;
            }
            return uid;
        }
    }

    public class UserOnline
    {
        public string LoginId { get; set; }
        public string Fullname { get; set; }
        public string LastIp { get; set; }
        public DateTime LastAccess { get; set; }
    }
}