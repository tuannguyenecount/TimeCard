using TimeCard.Framework;
using TimeCard.Helper;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace TimeCard
{
    public class MvcApplication : HttpApplication
    {
        protected ServiceCache serviceCacher = ServiceCache.Current;
        
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            MvcHandler.DisableMvcResponseHeader = true;

            LogHelper.Current.WriteLogs("========> Start server", "Application_Start", "IIS", "SERVER");
        }
        protected void Application_PreSendRequestHeaders()
        {
            Response.Cache.SetCacheability(HttpCacheability.ServerAndNoCache);
            if (HttpContext.Current != null)
            {
                HttpContext.Current.Response.Headers.Remove("Server");
                HttpContext.Current.Response.Headers.Remove("X-AspNet-Version");
            }
        }

        protected void Application_End()
        {
            LogHelper.Current.WriteLogs("========> Stop server", "Application_End", "IIS", "SERVER");
        }
    }
}
