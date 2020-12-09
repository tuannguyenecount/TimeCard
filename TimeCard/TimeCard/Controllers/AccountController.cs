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

        public static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("No network adapters with an IPv4 address in the system!");
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
                        string IP = System.Web.HttpContext.Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"];
                        if (string.IsNullOrEmpty(IP))
                        {
                            IP = System.Web.HttpContext.Current.Request.ServerVariables["REMOTE_ADDR"];
                        }
                        var lst = SystemService.Current.GetHistoryCheckInByUserName(model.Username, out ErrorResult);
                        var checkHaveCheckIn = lst.Any(x => x.DateCheckInDecrypt != null && x.DateCheckInDecrypt.Value.Date == DateTime.Today.Date);
                        if (checkHaveCheckIn == false)
                        {
                            string dateCheckIn = Crypt.Encrypt(DateTime.Now.ToString("ddMMyyyyHHmmss"));
                            SystemService.Current.Checkin(model.Username, IP, dateCheckIn, model.NoteCheckIn, out ErrorResult);
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