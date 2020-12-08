using TimeCard.Framework;
using TimeCard.Helper;
using TimeCard.Models;
using TimeCard.Security;
using TimeCard.Services;
using System;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Web.Mvc;
using TimeCard.Controllers;
using System.Collections.Generic;
using TimeCard.Models.System;
using TimeCard.Models.eOffice;
using TimeCard.Models.Admin;

namespace TimeCard.Areas.Admin.Controllers
{
    public class HomeController : AdminAuthorizeRequiredController
    {
        public ActionResult Index()
        {
            return View();
        }

        [ValidateAntiForgeryToken]
        [HttpPost]
        public JsonResult GetAllUser()
        {
            ErrorResult = new ErrorModel();
            bool success = false;
            string message = "";
            List<AdminUser> listUser = new List<AdminUser>();
            try
            {
                listUser = AdminService.current.AdminUserGet(GetLoggedUserName(), out ErrorResult);
                success = true;
                message = "success";          
            }
            catch (Exception ex)
            {
                message = "Lấy danh sách user lỗi: " + ex.Message;
            }
            return Json(new { success, message, Data = listUser });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult GetHistoryCheckInByUserName(string userName)
        {
            ErrorResult = new ErrorModel();
            List<HistoryCheckInModel> historys = new List<HistoryCheckInModel>();
            try
            {
                historys = SystemService.Current.GetHistoryCheckInByUserName(userName, out ErrorResult);
                if (historys.Count > 0)
                {
                    ErrorResult.ErrorCode = 1;
                    ErrorResult.ErrorMsg = "Success";
                }
                else
                {
                    ErrorResult.ErrorCode = 0;
                    ErrorResult.ErrorMsg = "Fail";
                }
            }
            catch (Exception ex)
            {
                ErrorResult = new ErrorModel { ErrorCode = -1, ErrorMsg = ex.ToString() };
                LogHelper.Current.WriteLogs(ex.ToString(), "HistoryCheckInController.GetHistoryCheckInByUserName", LoginProfile.UserName);
            }
            return _Json(ErrorResult.ErrorCode, ErrorResult.ErrorMsg, ErrorResult.ErrorMsg, JsonHelper.Serialize(historys));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult EditCheckInOut(HistoryCheckInModel historyCheckInModel)
        {
            var historyData = SystemService.Current.GetHistoryCheckInByHistoryId(historyCheckInModel.HistoryId, LoginProfile.UserName, out ErrorResult);
            if (historyData == null)
            {
                ModelState.AddModelError("", "Dữ liệu này không tồn tại!");
            }
            if (ModelState.IsValid)
            {
                ErrorResult = new ErrorModel();
                try
                {
                    DateTime dateCheckIn, dateCheckOut;
                    if(DateTime.TryParseExact(historyCheckInModel.DateCheckIn,"dd-MM-yyyy HH:mm", null, System.Globalization.DateTimeStyles.None, out dateCheckIn))
                    {
                        historyCheckInModel.DateCheckIn = Crypt.Encrypt(dateCheckIn.ToString("ddMMyyyyHHmmss"));
                    }
                    else
                    {
                        return Content("Thời gian cần đúng định dạng dd-MM-yyyy HH:mm");
                    }
                    if (DateTime.TryParseExact(historyCheckInModel.DateCheckOut, "dd-MM-yyyy HH:mm", null, System.Globalization.DateTimeStyles.None, out dateCheckOut))
                    {
                        historyCheckInModel.DateCheckOut = Crypt.Encrypt(dateCheckOut.ToString("ddMMyyyyHHmmss"));
                    }
                    else
                    {
                        return Content("Thời gian cần đúng định dạng dd-MM-yyyy HH:mm");
                    }
                    SystemService.Current.EditInformationCheckInOut(historyCheckInModel, LoginProfile.UserName);
                    return Content("1");
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", ex.Message);
                    return Content(ex.Message);
                }
            }
            return Content("Có lỗi dữ liệu không hợp lệ");
        }
    }
}