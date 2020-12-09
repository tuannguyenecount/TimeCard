using TimeCard.Helper;
using TimeCard.Models;
using TimeCard.Models.System;
using TimeCard.Security;
using TimeCard.Services;
using System;
using System.Collections.Generic;
using System.Web.Mvc;

namespace TimeCard.Controllers
{
    public partial class HomeController : AuthorizeRequiredController
    {
        public ActionResult Index()
        {
            if (SharedContext.Current.LoggedProfile.IsAdmin)
            {
                return RedirectToAction("Index", "Home", new { area = "Admin" });
            }
            return View();
        }

        [HttpPost]
        public JsonResult GetHistoryCheckIn()
        {
            ErrorResult = new ErrorModel();
            List<HistoryCheckInModel> historys = new List<HistoryCheckInModel>();
            try
            {
                historys = SystemService.Current.GetHistoryCheckInByUserName(SharedContext.Current.LoggedProfile.UserName, out ErrorResult);
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
                LogHelper.Current.WriteLogs(ex.ToString(), "HomeController.GetHistoryCheckIn", LoginProfile.UserName);
            }
            return _Json(ErrorResult.ErrorCode, ErrorResult.ErrorMsg, ErrorResult.ErrorMsg, JsonHelper.Serialize(historys));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult EditNote([Bind(Include = "HistoryId,NoteCheckIn,NoteCheckOut,Note")]HistoryCheckInModel historyCheckInModel, int IsCheckOut)
        {
            var historyData = SystemService.Current.GetHistoryCheckInByHistoryId(historyCheckInModel.HistoryId, SharedContext.Current.LoggedProfile.UserName, out ErrorResult);
            if(historyData == null)
            {
                ModelState.AddModelError("", "Dữ liệu này không tồn tại!");
            }
            else if(historyData.UserName != SharedContext.Current.LoggedProfile.UserName)
            {
                ModelState.AddModelError("", "Bạn không có quyền chỉnh sửa dữ liệu này!");
            }
            if (ModelState.IsValid)
            {
                historyCheckInModel.UserName = LoginProfile.UserName;
                ErrorResult = new ErrorModel();
                try
                {
                    if (IsCheckOut == 1)
                    {
                        SystemService.Current.CheckOut(historyData.UserName, historyData.DateCheckIn);
                        SystemService.Current.EditNote(historyCheckInModel);
                        return RedirectToAction("Logoff", "Account");
                    }
                    else
                    {
                        SystemService.Current.EditNote(historyCheckInModel);
                    }
                    TempData["SuccessMessage"] = "Cập nhật ghi chú thành công.";
                    return RedirectToAction("Index");
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", ex.Message);
                }
            }
            return View("Index");
        }

    }
}