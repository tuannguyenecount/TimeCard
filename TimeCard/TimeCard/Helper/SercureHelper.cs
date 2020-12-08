using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;

namespace TimeCard.Helper
{
    public class SercureHelper
    {
        public static bool ValidateAntiForgery(HttpRequestBase request, string userRequest, string action)
        {
            bool ret = false;
            var cookie = request.Cookies[AntiForgeryConfig.CookieName];
            try
            {
                AntiForgery.Validate();
                ret = true;
            }
            catch (HttpAntiForgeryException fex)
            {
                //do nothing
                ret = false;
            }
            catch (Exception ex)
            {
                ret = false;
                LogHelper.Current.WriteLogs(ex.ToString(), "SercureHelper._Check_AntiForgery - " + action, userRequest);
            }
            return ret;
        }
    }
}