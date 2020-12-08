using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using OCB.Web.Http;
using System.Web.Routing;
using TimeCard.Helper;
using TimeCard.Framework;

namespace TimeCard.Security
{
    public class NoCacheAttribute : ActionFilterAttribute
    {
        public override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            //var cache = filterContext.HttpContext.Response.Cache;
            //object ob = null;
            //if (OCBSession.TryGet("PDFReport", out ob, true) && ob != null)
            //{
            //    cache.SetExpires(DateTime.UtcNow.AddMinutes(1));
            //    cache.SetCacheability(HttpCacheability.Private);
            //}
            //else
            //{
            //    cache.SetExpires(DateTime.UtcNow.AddDays(-1));
            //    cache.SetCacheability(HttpCacheability.NoCache);
            //    cache.SetValidUntilExpires(false);
            //    cache.SetRevalidation(HttpCacheRevalidation.AllCaches);
            //    cache.SetNoStore();
            //}
            base.OnResultExecuting(filterContext);
        }
    }
 
    public class OnlyAdminAttribute : AuthorizeAttribute
    {
        public string Extends
        {
            get;
            set;
        }

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            base.AuthorizeCore(httpContext);
            return false;
        }
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            var baseController = filterContext.Controller as TimeCard.Controllers.AuthorizeRequiredController;

            LoginProfile loggedUser = baseController.LoginProfile;

            var lit = Utils.GetAppSettings("AdminList", ',');

            bool chk;

            chk = lit.Contains(loggedUser.UserName.ToLower());

            if (chk)
                return;
            else
                filterContext.Result = new RedirectToRouteResult(
                    new RouteValueDictionary
                    {
                        {"id", "ACCESS_CHANGED"},
                        {"action", "LogOff" },
                        {"controller", "Account" }
                    }
                );
        }
    }

    [AttributeUsage(AttributeTargets.Method)]
    public class DeleteTempFileResultAttribute : ActionFilterAttribute
    {
        public bool ImmediateDelete { get; set; }
        public override void OnResultExecuted(ResultExecutedContext filterContext)
        {
            if (ImmediateDelete)
            {
                var result = filterContext.Result as FilePathResult;
                if (result != null)
                {
                    string fileName = result.FileName;
                    if (System.IO.File.Exists(fileName))
                    {
                        filterContext.HttpContext.Response.Flush();
                        filterContext.HttpContext.Response.End();
                        try { System.IO.File.Delete(fileName); }
                        catch (Exception) { }
                    }
                }
            }
            else
            {
                base.OnResultExecuted(filterContext);
                BackgroundGAC.SetFree();
            }


        }
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (!ImmediateDelete)
            {
                BackgroundGAC.SetBusy();
                base.OnActionExecuting(filterContext);
            }

        }
    }
}