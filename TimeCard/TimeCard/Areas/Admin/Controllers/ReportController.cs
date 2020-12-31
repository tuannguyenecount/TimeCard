using ClosedXML.Excel;
using System.Collections.Generic;
using System.Web.Mvc;
using TimeCard.Controllers;
using TimeCard.Models.Admin;
using TimeCard.Models.System;
using TimeCard.Services;
using System;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using TimeCard.Models.eOffice;

namespace TimeCard.Areas.Admin.Controllers
{
    public class ReportController : AdminAuthorizeRequiredController
    {
        [NonAction]
        IEnumerable<DateTime> AllDatesInMonth(int year, int month)
        {
            int days = DateTime.DaysInMonth(year, month);
            for (int day = 1; day <= days; day++)
            {
                yield return new DateTime(year, month, day);
            }
        }

        [NonAction]
        async Task SetValueToSheet(IXLWorksheet ws, eOfficeEmployee user)
        {
            ws.Cell("B2").Value = "CHI TIẾT CHẤM CÔNG CỦA " + user.FullName.ToUpper();
            int year = DateTime.Today.Year;
            int month = DateTime.Today.Month;
            int days = DateTime.DaysInMonth(year, month);
            var rngTable = ws.Range("B2:M" + (4 + days));
            rngTable.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
            rngTable.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            List<HistoryCheckInModel> historyCheckInModels = SystemService.Current.GetHistoryCheckInByUserName(user.UserName, out ErrorResult);
            int row = 3;
            foreach (DateTime dtime in AllDatesInMonth(year, month))
            {
                rngTable.Cell(row, 1).Style.DateFormat.SetFormat("dd-MM-yyyy");
                rngTable.Cell(row, 1).Value = dtime;
                var historyItem = historyCheckInModels.FirstOrDefault(x => x.DateCheckInDecrypt != null && x.DateCheckInDecrypt.Value.Date == dtime.Date);
                if (historyItem != null)
                {
                    rngTable.Cell(row, 2).Value = historyItem.DateCheckInDecrypt.Value.ToString("HH:mm");
                    rngTable.Cell(row, 3).Value = historyItem.DateCheckOutDecrypt?.ToString("HH:mm");
                    if (historyItem.IsLate)
                    {
                        rngTable.Cell(row, 4).Value = "X";
                        rngTable.Cell(row, 4).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                        rngTable.Row(row).Style.Fill.BackgroundColor = XLColor.Red;
                        rngTable.Row(row).Style.Font.FontColor = XLColor.White;
                    }
                    rngTable.Cell(row, 5).Value = historyItem.TotalMinuteLate;
                    rngTable.Cell(row, 6).Value = historyItem.NoteCheckIn;
                    if (historyItem.IsLeaveEarly == true)
                    {
                        rngTable.Cell(row, 7).Value = "X";
                        rngTable.Cell(row, 7).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    }
                    rngTable.Cell(row, 8).Value = historyItem.TotalMinuteLeaveEarly;
                    rngTable.Cell(row, 9).Value = historyItem.NoteCheckOut;
                    rngTable.Cell(row, 10).Value = historyItem.Note;
                    rngTable.Cell(row, 11).Value = historyItem.IPCheckIn;
                    rngTable.Cell(row, 12).Value = historyItem.IPCheckOut;
                }
                row++;
            }
            rngTable.Cell(row, 2).Value = historyCheckInModels.Count();
            rngTable.Cell(row, 4).Value = historyCheckInModels.Count(x => x.IsLate == true);
            rngTable.Cell(row, 5).Value = historyCheckInModels.Sum(x => x.TotalMinuteLate);
            rngTable.Cell(row, 7).Value = historyCheckInModels.Count(x => x.IsLeaveEarly == true);
            rngTable.Cell(row, 8).Value = historyCheckInModels.Sum(x => x.TotalMinuteLeaveEarly);
            rngTable.Row(row).Style.Font.Bold = true;
            rngTable.Row(row).Style.Fill.BackgroundColor = XLColor.LightGray;
            ws.Columns(1, 11).AdjustToContents();
        }

        public ViewResult Index()
        {
            return View();
        }

        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<ActionResult> ExportExcel(int Month, int Year)
        {
            if(LoginProfile.BranchList == null)
                LoginProfile.BranchList = EOfficeService.current.GetBranchForUser(LoginProfile.UserName, out ErrorResult);
            List<eOfficeEmployee> listUser = new List<eOfficeEmployee>();
            foreach (var branchItem in LoginProfile.BranchList)
            {
                listUser.AddRange(EOfficeService.current.GetUserBranchTree(branchItem.BranchId, LoginProfile.UserName, out ErrorResult));
            }
            if(listUser.Count == 0)
            {
                return Content("Anh/chị hiện không quản lý nhân viên nào!");
            }
            System.IO.File.Copy(Server.MapPath("~/Content/Reports/TimeCardDetail.xlsx"), Server.MapPath("~/Content/Reports/TimeCardDetailTemp.xlsx"), true);
            var wb = new XLWorkbook(Server.MapPath("~/Content/Reports/TimeCardDetailTemp.xlsx")); 
            string month = Month < 10 ? "0" + Month.ToString() : Month.ToString();
            string title = "LỊCH SỬ CHẤM CÔNG THÁNG " + month + " NĂM " + Year;
            List<Task> tasks = new List<Task>();
            IXLWorksheet wsTemplate;
            wb.TryGetWorksheet("Template", out wsTemplate);
            int i = 1;
            foreach (var user in listUser) 
            {
                var ws = wsTemplate.CopyTo(i.ToString() + ". " + user.UserName);
                Task t = SetValueToSheet(ws, user);
                tasks.Add(t);
                i++;
            }
            await Task.WhenAll(tasks);
            wb.Worksheets.Delete("Template");
            string tempDir = Server.MapPath("~/Temp");
            string fileName = Path.Combine(tempDir, title + ".xlsx");
            wb.SaveAs(fileName);
            var result = new FilePathResult(fileName, "application/excel");
            result.FileDownloadName = title + ".xlsx";
            return result;
        }
    }
}