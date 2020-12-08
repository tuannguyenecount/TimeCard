using System.Collections.Generic;
using System.Web.Mvc;
using TimeCard.Controllers;
using TimeCard.Models.Admin;
using TimeCard.Models.System;
using TimeCard.Services;

namespace TimeCard.Areas.Admin.Controllers
{
    public class ReportController : AdminAuthorizeRequiredController
    {
        public ActionResult Index()
        {
            List<AdminUser> listUser = AdminService.current.AdminUserGet(GetLoggedUserName(), out ErrorResult);
            foreach(var item in listUser)
            {
                List<HistoryCheckInModel> historyCheckInModels = SystemService.Current.GetHistoryCheckInByUserName(item.UserName, out ErrorResult);
            }
            return View();
        }
    }
}