using TimeCard.Framework;
using TimeCard.Models;
using OCB.Libraries.Generic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TimeCard.Security
{
    public class SharedContext
    {
        //public static string LoggedInfo { get; set; }

        public SharedContext()
        {

        }

        public static SharedContext Current
        {
            get
            {
                SharedContext ret = null;
                try
                {
                    ret = DependencyResolver.Current.GetService<SharedContext>();
                }
                catch (Exception)
                {
                    ret = new SharedContext();
                }
                return ret;
            }
        }

        public LoginProfile LoggedProfile
        {
            get
            {
                return DataSessionManager.GetData<LoginProfile>(NAME(GlobalInfo.LOGGED_PROFILE));
            }
            set
            {
                DataSessionManager.SetData(NAME(GlobalInfo.LOGGED_PROFILE), value);
            }
        }

        public List<GroupMenu> MenuList
        {
            get
            {
                return DataSessionManager.GetData<List<GroupMenu>>(NAME(GlobalInfo.MENU_GROUP));
            }
            set
            {
                DataSessionManager.SetData(NAME(GlobalInfo.MENU_GROUP), value);
            }
        }

        /// <summary>
        /// return prefix+sep+name
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public string NAME(string name, string sep = ".")
        {
            return "EOFFICEOCB" + sep + name;
        }

        public string DomainName
        {
            get
            {
                dynamic appSetting = DynamicAppSettings.Instance;
                return appSetting.ActiveDomain ?? "ocb.vn";
            }
        }

        public string HttpContextIdentityName
        {
            get
            {
                return HttpContext.Current!=null &&  HttpContext.Current.User != null && HttpContext.Current.User.Identity != null && HttpContext.Current.User.Identity.IsAuthenticated ? HttpContext.Current.User.Identity.Name : null;
            }
        }
    }
}