using TimeCard.Helper;
using TimeCard.Models;
using TimeCard.Security;
using TimeCard.Services;
using System;
using System.Web.Mvc;
using TimeCard.Controllers;
using System.Collections.Generic;
using TimeCard.Models.System;
using TimeCard.Models.Admin;
using TimeCard.Models.eOffice;

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
            List<eOfficeEmployee> listUser = new List<eOfficeEmployee>();
            try
            {
                if(LoginProfile.BranchList == null)
                {
                    LoginProfile.BranchList = EOfficeService.current.GetBranchForUser(LoginProfile.UserName, out ErrorResult);
                }
                foreach (var branchItem in LoginProfile.BranchList)
                {
                    listUser.AddRange(EOfficeService.current.GetUserBranchTree(branchItem.BranchId, LoginProfile.UserName, out ErrorResult));
                }
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
        public ActionResult SaveCheckInOut(HistoryCheckInModel historyCheckInModel)
        {
            if (ModelState.IsValid)
            {
                ErrorResult = new ErrorModel();
                try
                {
                    DateTime dateCheckIn, dateCheckOut;
                    if (!string.IsNullOrEmpty(historyCheckInModel.DateCheckIn))
                    {
                        historyCheckInModel.DateCheckIn = historyCheckInModel.DateCheckIn.Trim();
                        if (DateTime.TryParseExact(historyCheckInModel.DateCheckIn, "dd-MM-yyyy HH:mm", null, System.Globalization.DateTimeStyles.None, out dateCheckIn))
                        {
                            historyCheckInModel.DateCheckIn = Crypt.Encrypt(dateCheckIn.ToString("ddMMyyyyHHmmss"));
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckIn, "dd-MM-yyyy HH:m", null, System.Globalization.DateTimeStyles.None, out dateCheckIn))
                        {
                            historyCheckInModel.DateCheckIn = Crypt.Encrypt(dateCheckIn.ToString("ddMMyyyyHHmmss"));
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckIn, "dd-MM-yyyy H:mm", null, System.Globalization.DateTimeStyles.None, out dateCheckIn))
                        {
                            historyCheckInModel.DateCheckIn = Crypt.Encrypt(dateCheckIn.ToString("ddMMyyyyHHmmss"));
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckIn, "dd-MM-yyyy H:m", null, System.Globalization.DateTimeStyles.None, out dateCheckIn))
                        {
                            historyCheckInModel.DateCheckIn = Crypt.Encrypt(dateCheckIn.ToString("ddMMyyyyHHmmss"));
                        }
                        else
                        {
                            return Content("Thời gian cần đúng định dạng dd-MM-yyyy HH:mm");
                        }
                    }
                    if (!string.IsNullOrEmpty(historyCheckInModel.DateCheckOut))
                    {
                        historyCheckInModel.DateCheckOut = historyCheckInModel.DateCheckOut.Trim();
                        if (DateTime.TryParseExact(historyCheckInModel.DateCheckOut, "dd-MM-yyyy HH:mm", null, System.Globalization.DateTimeStyles.None, out dateCheckOut))
                        {
                            historyCheckInModel.DateCheckOut = Crypt.Encrypt(dateCheckOut.ToString("ddMMyyyyHHmmss"));
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckOut, "dd-MM-yyyy HH:m", null, System.Globalization.DateTimeStyles.None, out dateCheckOut))
                        {
                            historyCheckInModel.DateCheckOut = Crypt.Encrypt(dateCheckOut.ToString("ddMMyyyyHHmmss"));
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckOut, "dd-MM-yyyy H:mm", null, System.Globalization.DateTimeStyles.None, out dateCheckOut))
                        {
                            historyCheckInModel.DateCheckOut = Crypt.Encrypt(dateCheckOut.ToString("ddMMyyyyHHmmss"));
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckOut, "dd-MM-yyyy H:m", null, System.Globalization.DateTimeStyles.None, out dateCheckOut))
                        {
                            historyCheckInModel.DateCheckOut = Crypt.Encrypt(dateCheckOut.ToString("ddMMyyyyHHmmss"));
                        }
                        else
                        {
                            return Content("Thời gian cần đúng định dạng dd-MM-yyyy HH:mm");
                        }
                    }
                    SystemService.Current.SaveInformationCheckInOut(historyCheckInModel, LoginProfile.UserName);
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