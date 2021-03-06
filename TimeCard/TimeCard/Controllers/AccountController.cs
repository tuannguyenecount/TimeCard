﻿using TimeCard.Framework;
using TimeCard.Helper;
using TimeCard.Models;
using TimeCard.Security;
using TimeCard.Services;
using System;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Web.Mvc;

namespace TimeCard.Controllers
{
    public class AccountController : BaseController
    {
        public ActionResult Checkin()
        {
            CheckInUser model = new CheckInUser();
            DataSessionManager.RemoveAllData();

            Authentication.SignOut();
            ViewBag.IsLoggingOut = true;
            UserOnlineManager.DisConnect();

            return View(model);
        }

        [HttpPost]
        public ActionResult Checkin(CheckInUser model)
        {
            DataSessionManager.RemoveAllData();
            if (TryUpdateModel<CheckInUser>(model) && !string.IsNullOrWhiteSpace(model.Username) && !string.IsNullOrWhiteSpace(model.Password))
            {
                model.Username = model.Username.Trim().ToLower();
                bool valid = Authentication.ValidateUser(model.Username, model.Password);

                if (valid)
                {
                    SharedContext.Current.LoggedProfile = EOfficeService.current.Login(model, out ErrorResult);
                    if (SharedContext.Current.LoggedProfile == null)
                    {
                        ViewBag.ErrorMessage = "Thông tin đăng nhập chưa có trên hệ thống OCB OFFICE, anh/chị vui lòng liên hệ với ocboffice@ocb.com.vn để được hỗ trợ";
                    }
                    else
                    {
                        
                        var lst = SystemService.Current.GetHistoryCheckInByUserName(model.Username, out ErrorResult);
                        var checkHaveCheckIn = lst.Any(x => x.DateCheckIn_Parse != null && x.DateCheckIn_Parse.Value.Date == DateTime.Today.Date);
                        if (checkHaveCheckIn == false)
                        {
                            SystemService.Current.Checkin(model.Username, model.NoteCheckIn, out ErrorResult);
                        }
                        ViewBag.ErrorResult = ErrorResult;
                        Authentication.SignOn(model.Username);
                        var returnUrl = Request["ReturnUrl"];
                        if (string.IsNullOrWhiteSpace(returnUrl))
                        {
                            return Redirect(Utils.GetAppSetting("DefaultPageAfterLogin"));
                        }    
                        else
                            return Redirect(returnUrl);
                    }
                }
                else
                {
                    ViewBag.ErrorMessage = "Điểm danh thất bại";
                }
            }
            else
            {
                Authentication.SignOut();
                ViewBag.IsLoggingOut = true;
                UserOnlineManager.DisConnect();
            }

            return View(model);
        }

        public ActionResult Logoff()
        {
            UserOnlineManager.DisConnect();
            Authentication.SignOut();
            ViewBag.IsLoggingOut = true;
            DataSessionManager.RemoveAllData();
            return RedirectToAction("Checkin", "Account",new { area = "" });
        }
    }
}