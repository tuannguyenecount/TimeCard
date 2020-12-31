using TimeCard.Framework;
using TimeCard.Helper;
using TimeCard.Models;
using TimeCard.Security;
using TimeCard.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TimeCard.Controllers
{
    [Authorize]
    public abstract class AuthorizeRequiredController : BaseController
    {
        private string currentAction = null;

        public LoginProfile LoginProfile
        {
            get; private set;
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            currentAction = filterContext.ActionDescriptor.ActionName;
            if (Request.IsAuthenticated)
            {
                UserOnlineManager.Connect();
                ExpirationSolution.Solve();
            }
            ViewBag.LoggedProfile = SharedContext.Current.LoggedProfile;
            ViewBag.BranchListOfUser = SharedContext.Current.LoggedProfile.BranchList;
            ViewBag.DefaultPageAfterLogin = Utils.GetAppSetting("DefaultPageAfterLogin");

            var sett = SystemService.Current.GetSetting("SCRIPTVERSION", LoginProfile.UserName, out ErrorResult);
            ViewBag.VersionScript = sett != null ? sett.Value1 : "1";
            base.OnActionExecuting(filterContext);
        }
        protected override void OnAuthorization(AuthorizationContext filterContext)
        {
            string errMsg = "";
            ViewBag.IsPopup = "1".Equals(Request["popup"]);

            var LoggedUser = SharedContext.Current.LoggedProfile;

            if (LoggedUser == null)
            {
                filterContext.Result = RedirectToAction("Logoff", "Account", new { errMsg = errMsg });
             }
            else
            {
                ViewBag.LoggedUser = LoggedUser;
                LoginProfile = LoggedUser;
                base.OnAuthorization(filterContext);
            }
        }

        public ActionResult UserOnline()
        {
            return Json(UserOnlineManager.List);
        }
    }

    [Authorize]
    public abstract class AdminAuthorizeRequiredController: AuthorizeRequiredController
    {
        protected override void OnAuthorization(AuthorizationContext filterContext)
        {
            string errMsg = "";
            ViewBag.IsPopup = "1".Equals(Request["popup"]);

            var LoggedUser = SharedContext.Current.LoggedProfile;
            string[] usersAdmin = System.Configuration.ConfigurationManager.AppSettings["UsersAdmin"].Split(',');

            if (LoggedUser != null && LoggedUser.IsAdmin == true && usersAdmin.Contains(LoggedUser.UserName))
            {
                ViewBag.LoggedUser = LoggedUser;
                base.OnAuthorization(filterContext);
            }
            else
            {
                filterContext.Result = RedirectToAction("Logoff", "Account", new { errMsg = errMsg, area = "" });
            }
        }
    }
}