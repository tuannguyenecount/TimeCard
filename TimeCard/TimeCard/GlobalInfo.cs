using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Web;

namespace TimeCard
{
    public static class GlobalInfo
    {
        public static string DB_CONNECT_STRING_NAME = "EOFFICEOCB";
        private static string DB_SCHEMA = "TMS";

        public static string LOGGED_PROFILE = "LOGGED_PROFILE";
        public static string MENU_GROUP = "MENU_GROUP";

        public static string PKG_TMS = GetPackage("PKG_TMS");
        public static string PKG_TMS_SYSTEM = GetPackage("PKG_TMS_SYSTEM");
        public static string PKG_TMS_REPORT = GetPackage("PKG_TMS_REPORT");
        public static string PKG_TMS_SCHEDULE = GetPackage("PKG_TMS_SCHEDULE");
        public static string PKG_TMS_CHECKINOUT = GetPackage("PKG_TMS_CHECKINOUT");
        private static string GetPackage(string PackageName)
        {
            return string.Format("{0}.{1}", DB_SCHEMA, PackageName);
        }
    }

    public static class CachedName
    {
        public static string STATUS_LIST = "_STATUS_LIST_";
        public static string NOTIFY_TEMPLATE_LIST = "_NOTIFY_TEMPLATE_LIST_";
        

    }
}