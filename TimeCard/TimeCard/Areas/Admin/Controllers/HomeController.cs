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

        public ContentResult UpdateDB()
        {
            List<eOfficeEmployee> listUser = new List<eOfficeEmployee>();
            try
            {
                if (LoginProfile.BranchList == null)
                {
                    LoginProfile.BranchList = EOfficeService.current.GetBranchForUser(LoginProfile.UserName, out ErrorResult);
                }
                if (LoginProfile.BranchList != null)
                {
                    foreach (var branchItem in LoginProfile.BranchList)
                    {
                        listUser.AddRange(EOfficeService.current.GetUserBranchTree(branchItem.BranchId, LoginProfile.UserName, out ErrorResult));
                    }
                }
                foreach(var user in listUser)
                {
                    var historyCheckIns = SystemService.Current.GetHistoryCheckInByUserName(user.UserName, out ErrorResult);
                    foreach(var historyCheckInModel in historyCheckIns)
                    {
                        if (historyCheckInModel.DateCheckInDecrypt != null)
                        {
                            historyCheckInModel.DateCheckIn_DTime = historyCheckInModel.DateCheckInDecrypt.Value.ToString("ddMMyyyyHHmmss");
                        }
                        if (historyCheckInModel.DateCheckOutDecrypt != null)
                        {
                            historyCheckInModel.DateCheckOut_DTime = historyCheckInModel.DateCheckOutDecrypt.Value.ToString("ddMMyyyyHHmmss");
                        }
                        SystemService.Current.SaveInformationCheckInOut(historyCheckInModel, LoginProfile.UserName);
                    }
                }
            }
            catch (Exception ex)
            {
               
            }
            return Content("success");
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
                if (LoginProfile.BranchList != null)
                {
                    foreach (var branchItem in LoginProfile.BranchList)
                    {
                        listUser.AddRange(EOfficeService.current.GetUserBranchTree(branchItem.BranchId, LoginProfile.UserName, out ErrorResult));
                    }
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
        public ActionResult SaveCheckInOut(FormCollection frm)
        {
            if (ModelState.IsValid)
            {
                var historyCheckInModel = new HistoryCheckInModel()
                {
                    DateCheckIn_DTime = frm["DateCheckIn"].ToString(),
                    DateCheckOut_DTime = frm["DateCheckOut"].ToString(),
                    HistoryId = int.Parse(frm["HistoryId"].ToString()),
                    NoteCheckIn = frm["NoteCheckIn"].ToString(),
                    NoteCheckOut = frm["NoteCheckOut"].ToString(),
                    UserName = frm["UserName"],
                    Note = frm["Note"].ToString()
                };
                ErrorResult = new ErrorModel();
                try
                {
                    DateTime dateCheckIn, dateCheckOut;
                    if (!string.IsNullOrEmpty(historyCheckInModel.DateCheckIn_DTime))
                    {
                        historyCheckInModel.DateCheckIn_DTime = historyCheckInModel.DateCheckIn_DTime.Trim();
                        if (DateTime.TryParseExact(historyCheckInModel.DateCheckIn_DTime, "dd-MM-yyyy HH:mm", null, System.Globalization.DateTimeStyles.None, out dateCheckIn))
                        {
                            historyCheckInModel.DateCheckIn_DTime = dateCheckIn.ToString("ddMMyyyyHHmmss");
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckIn_DTime, "dd-MM-yyyy HH:m", null, System.Globalization.DateTimeStyles.None, out dateCheckIn))
                        {
                            historyCheckInModel.DateCheckIn_DTime = dateCheckIn.ToString("ddMMyyyyHHmmss");
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckIn_DTime, "dd-MM-yyyy H:mm", null, System.Globalization.DateTimeStyles.None, out dateCheckIn))
                        {
                            historyCheckInModel.DateCheckIn_DTime = dateCheckIn.ToString("ddMMyyyyHHmmss");
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckIn_DTime, "dd-MM-yyyy H:m", null, System.Globalization.DateTimeStyles.None, out dateCheckIn))
                        {
                            historyCheckInModel.DateCheckIn_DTime = dateCheckIn.ToString("ddMMyyyyHHmmss");
                        }
                        else
                        {
                            return Content("Thời gian cần đúng định dạng dd-MM-yyyy HH:mm");
                        }
                    }
                    if (!string.IsNullOrEmpty(historyCheckInModel.DateCheckOut_DTime))
                    {
                        historyCheckInModel.DateCheckOut_DTime = historyCheckInModel.DateCheckOut_DTime.Trim();
                        if (DateTime.TryParseExact(historyCheckInModel.DateCheckOut_DTime, "dd-MM-yyyy HH:mm", null, System.Globalization.DateTimeStyles.None, out dateCheckOut))
                        {
                            historyCheckInModel.DateCheckOut_DTime = dateCheckOut.ToString("ddMMyyyyHHmmss");
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckOut_DTime, "dd-MM-yyyy HH:m", null, System.Globalization.DateTimeStyles.None, out dateCheckOut))
                        {
                            historyCheckInModel.DateCheckOut_DTime = dateCheckOut.ToString("ddMMyyyyHHmmss");
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckOut_DTime, "dd-MM-yyyy H:mm", null, System.Globalization.DateTimeStyles.None, out dateCheckOut))
                        {
                            historyCheckInModel.DateCheckOut_DTime = dateCheckOut.ToString("ddMMyyyyHHmmss");
                        }
                        else if (DateTime.TryParseExact(historyCheckInModel.DateCheckOut_DTime, "dd-MM-yyyy H:m", null, System.Globalization.DateTimeStyles.None, out dateCheckOut))
                        {
                            historyCheckInModel.DateCheckOut_DTime = dateCheckOut.ToString("ddMMyyyyHHmmss");
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