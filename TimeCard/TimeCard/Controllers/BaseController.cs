using TimeCard.Framework;
using TimeCard.Helper;
using TimeCard.Models;
using TimeCard.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;

namespace TimeCard.Controllers
{
    [NoCache]
    public abstract class BaseController : Controller
    {
        protected LoginProfile currentProfile = SharedContext.Current.LoggedProfile;
        protected ServiceCache serviceCacher = ServiceCache.Current;
        protected ErrorModel ErrorResult;

        public ActionResult GetPartialView(string view)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(view))
                {
                    return PartialView(string.Format("~/Views/{0}.cshtml", view));
                }
                else
                {
                    return Content(string.Format("{0} : not found", view));
                }
            }
            catch (Exception ex)
            {
                LogHelper.Current.WriteLogs(ex.ToString(), "BaseController.GetPartialView", GetLoggedUserName());
            }
            return Content("Error");
        }

        public ActionResult PageNotFound()
        {
            return View("~/Views/Home/PageNotFound.cshtml");
        }

        /// <summary>
        /// client will request this action inteval to keep the session alive
        /// </summary>
        /// <returns></returns>
        public ActionResult Active()
        {
            return Json(new
            {
                Ticks = DateTime.Now.Ticks
            });
        }

        public ActionResult KeepAlive()
        {
            return Content("keepalive");
        }

        protected bool CheckAction(string act, string controller)
        {
            var controllerFullName = string.Format("TimeCard.Controllers.{0}Controller", controller);
            var cont = Assembly.GetExecutingAssembly().GetType(controllerFullName);
            return cont != null && cont.GetMethod(act) != null;
        }

        protected bool CheckPermit(int id, string user)
        {
            bool ret = false;
            //var lit = SharedContext.Current.ReportList;
            //if (lit != null && lit.Count > 0)
            //{
            //    foreach (var it in lit)
            //    {
            //        ret = it.ProcedureId == id;
            //        if (ret) break;
            //    }
            //}
            return ret;
        }

        public FileResult GetFile(string fname)
        {
            return File(Url.Content(string.Format("~/Temp/{0}.xlsx", fname)), null, fname);
        }
        protected string GetLoggedUserName()
        {
            return SharedContext.Current.LoggedProfile.UserName.ToLower();
        }
        protected string GetLoggedUserNameReal()
        {
            return Request.RequestContext.HttpContext.User.Identity.Name;
        }
        protected string GetView(string folder, string view = "Index")
        {
            return string.Format("~/Views/Home/{0}/{1}.cshtml", folder, view);
        }

        protected JsonResult _Json(int ErrorCode, string ErrorMsg, string ErrorDetail="", object Data=null)
        {
            object obj= null;

            if (Data != null)
            {
                obj = new
                {
                    ErrorCode = ErrorCode,
                    ErrorMsg = ErrorMsg,
                    ErrorDetail = ErrorDetail,
                    Data = Data
                };
            }
            else
            {
                obj = new
                {
                    ErrorCode = ErrorCode,
                    ErrorMsg = ErrorMsg,
                    ErrorDetail = ErrorDetail
                };
            }

            return Json(obj);
        }
    }
}