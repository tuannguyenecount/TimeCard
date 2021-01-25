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

        void SetTableHeader(int month, int year, IXLWorksheet ws)
        {
            var allDates = AllDatesInMonth(year, month);
            if (allDates.Count() == 28)
                ws.Columns("34:36").Delete();
            if (allDates.Count() == 29)
                ws.Columns("35:36").Delete();
            if (allDates.Count() == 30)
                ws.Columns("AJ").Delete();
            int column = 6;
            foreach (DateTime dtime in AllDatesInMonth(year, month))
            {
                ws.Cell(6, column).Style.DateFormat.SetFormat("dd/MM");
                ws.Cell(6, column).Value = dtime;
                switch(dtime.DayOfWeek)
                {
                    case DayOfWeek.Monday: 
                        ws.Cell(7, column).Value = "T2"; break;
                    case DayOfWeek.Tuesday:
                        ws.Cell(7, column).Value = "T3"; break;
                    case DayOfWeek.Wednesday:
                        ws.Cell(7, column).Value = "T4"; break;
                    case DayOfWeek.Thursday:
                        ws.Cell(7, column).Value = "T5"; break;
                    case DayOfWeek.Friday:
                        ws.Cell(7, column).Value = "T6"; break;
                    case DayOfWeek.Saturday:
                        ws.Cell(7, column).Value = "T7"; break;
                    case DayOfWeek.Sunday:
                        ws.Cell(7, column).Value = "CN"; break;
                }
                column++;
            }
        }

        [NonAction]
        void SetValueToSheet1(int month, int year, IXLWorksheet ws, IXLWorksheet wsBCDiTre, List<eOfficeEmployee> listUser)
        {
            int days = DateTime.DaysInMonth(year, month);

            #region Set for sheet 1
            int rowSheet1 = 9;
            int stt = 1;
            var allDates = AllDatesInMonth(year, month);
            ws.Rows(rowSheet1, rowSheet1 + listUser.Count).Style.Font.SetFontSize(9);
            ws.Rows(rowSheet1, rowSheet1 + listUser.Count).Style.Font.SetFontName("Arial");
            ws.Rows(rowSheet1, rowSheet1 + listUser.Count).Style.Font.Bold = false;
            ws.Range(rowSheet1, 1, rowSheet1 + listUser.Count, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            ws.Range(rowSheet1, 6, rowSheet1 + listUser.Count, 6 + allDates.Count()).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            ws.Range(rowSheet1, 6, rowSheet1 + listUser.Count, 6 + allDates.Count()).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            #endregion

            int rowSheet2 = 5;
            #region Set for sheet 2
            wsBCDiTre.Rows(rowSheet2, rowSheet2 + listUser.Count).Style.Font.SetFontSize(9);
            wsBCDiTre.Rows(rowSheet2, rowSheet2 + listUser.Count).Style.Font.SetFontName("Arial");
            wsBCDiTre.Rows(rowSheet2, rowSheet2 + listUser.Count).Style.Font.Bold = false;
            wsBCDiTre.Range(rowSheet2, 1, rowSheet2 + listUser.Count, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            #endregion
            
            foreach (var user in listUser)
            {
                #region Set for sheet 1
                ws.Cell(rowSheet1, 1).Value = stt.ToString();
                ws.Cell(rowSheet1, 2).Value = user.EmployeeNo;
                ws.Cell(rowSheet1, 3).Value = user.FullName;
                ws.Cell(rowSheet1, 4).Value = user.UserName;
                ws.Cell(rowSheet1, 5).Value = user.BranchName;
                List<HistoryCheckInModel> historyCheckInModels = SystemService.Current.GetHistoryCheckInByUserName(user.UserName, out ErrorResult);
                historyCheckInModels.ForEach(x =>
                {
                    x.DateCheckInDecryptCustom = x.DateCheckInDecrypt;
                });
                var listInMonth = historyCheckInModels.Where(x => x.DateCheckIn != null && x.DateCheckInDecryptCustom.Value.Month == month
                                    && x.DateCheckInDecryptCustom.Value.Year == year).ToList();
               
                int index = 6;
                foreach (DateTime dtime in allDates)
                {
                    var historyItem = listInMonth.FirstOrDefault(x => x.DateCheckInDecryptCustom != null && x.DateCheckInDecryptCustom.Value.Date == dtime.Date);
                    if (historyItem != null)
                    {
                        ws.Cell(rowSheet1, index).Value = "'" + historyItem.DateCheckInDecryptCustom.Value.ToString("HH:mm");
                        if(historyItem.IsLate)
                        {
                            ws.Cell(rowSheet1, index).Style.Fill.BackgroundColor = XLColor.DarkRed;
                            ws.Cell(rowSheet1, index).Style.Font.FontColor = XLColor.White;
                        }
                    }
                    index++;
                }

                var listDayLate = listInMonth.Where(x => x.IsLate == true);

                ws.Cell(rowSheet1, index).Value = listDayLate.Count();
                ws.Cell(rowSheet1, index + 1).Value = allDates.Count(x => x.DayOfWeek != DayOfWeek.Sunday) -  (listDayLate.Count() + listInMonth.Count(x => x.IsLate == false));
                #endregion

                #region Set for sheet 2

                wsBCDiTre.Cell(rowSheet2, 1).Value = stt.ToString();
                wsBCDiTre.Cell(rowSheet2, 2).Value = user.EmployeeNo;
                wsBCDiTre.Cell(rowSheet2, 3).Value = user.FullName;
                wsBCDiTre.Cell(rowSheet2, 4).Value = user.UserName;
                wsBCDiTre.Cell(rowSheet2, 5).Value = user.BranchName;

                
                string dsNgayDiTre = string.Join("\r\n", listDayLate.Select(x => " • " + x.DateCheckInDecryptCustom.Value.ToString("dd/MM")));
                wsBCDiTre.Cell(rowSheet2, 6).Value = dsNgayDiTre;

                string dsThoiGianDiTre = string.Join("\r\n", listDayLate.Select(x => " • " + x.DateCheckInDecryptCustom.Value.ToString("HH:mm")));
                wsBCDiTre.Cell(rowSheet2, 7).Value = dsThoiGianDiTre;

                string dsLyDoDiTre = string.Join("\r\n", listDayLate.Select(x => " • " + x.NoteCheckIn));
                wsBCDiTre.Cell(rowSheet2, 8).Value = dsLyDoDiTre;

                #endregion

                rowSheet1++;
                rowSheet2++;
                stt++;
            }
            //ws.Columns(1, 38).AdjustToContents();
        }
        
        [NonAction]
        void SetValueToSheet2(int month, int year, IXLWorksheet ws, List<eOfficeEmployee> listUser)
        {
            int row = 5;
            int stt = 1;
            //ws.Rows(row, row + listUser.Count).Style.Font.SetFontSize(8);
            //ws.Rows(row, row + listUser.Count).Style.Font.SetFontName("Arial");
            //ws.Rows(row, row + listUser.Count).Style.Font.Bold = false;
            //ws.Range(row, 1, row + listUser.Count, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            //ws.Range(row, 1, row + listUser.Count - 1, 8).Style.Border.InsideBorder = XLBorderStyleValues.Thin;
            //ws.Range(row, 1, row + listUser.Count - 1, 8).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            foreach (var user in listUser)
            {
                ws.Cell(row, 1).Value = stt.ToString();
                ws.Cell(row, 2).Value = user.EmployeeNo;
                ws.Cell(row, 3).Value = user.FullName;
                ws.Cell(row, 4).Value = user.UserName;
                ws.Cell(row, 5).Value = user.BranchName;
                List<HistoryCheckInModel> historyCheckInModels = SystemService.Current.GetHistoryCheckInByUserName(user.UserName, out ErrorResult);
                string dsNgayDiTre = string.Join("\r\n", historyCheckInModels.Where(x => x.DateCheckIn != null && x.DateCheckInDecrypt.Value.Month == month
                                    && x.DateCheckInDecrypt.Value.Year == year && x.IsLate == true).Select(x => " - " + x.DateCheckInDecrypt.Value.ToString("dd/MM")));
                ws.Cell(row, 6).Value = dsNgayDiTre;
                string dsThoiGianDiTre = string.Join("\r\n", historyCheckInModels.Where(x => x.DateCheckIn != null && x.DateCheckInDecrypt.Value.Month == month
                                    && x.DateCheckInDecrypt.Value.Year == year && x.IsLate == true).Select(x => " - " + x.DateCheckInDecrypt.Value.ToString("HH:mm")));
                ws.Cell(row, 7).Value = dsThoiGianDiTre;
                string dsLyDoDiTre = string.Join("\r\n", historyCheckInModels.Where(x => x.DateCheckIn != null && x.DateCheckInDecrypt.Value.Month == month
                                    && x.DateCheckInDecrypt.Value.Year == year && x.IsLate == true).Select(x => " - " + x.NoteCheckIn));
                ws.Cell(row, 8).Value = dsLyDoDiTre;
                stt++;
                row++;
            }
        }

        public ViewResult Index()
        {
            return View();
        }

        [ValidateAntiForgeryToken]
        [HttpPost]
        public ActionResult ExportExcel(int Month, int Year)
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

            System.IO.File.Copy(Server.MapPath("~/Content/Reports/BaoCaoChamCong.xlsx"), Server.MapPath("~/Content/Reports/BaoCaoChamCongTemp.xlsx"), true);
            var wb = new XLWorkbook(Server.MapPath("~/Content/Reports/BaoCaoChamCongTemp.xlsx")); 
            string month = Month < 10 ? "0" + Month.ToString() : Month.ToString();
            string title = "BÁO CÁO CHẤM CÔNG " + LoginProfile.SpecializeBranch?.BranchName?.ToUpper();

            IXLWorksheet ws;
            wb.TryGetWorksheet("BC đi trễ", out ws);
            ws.Cell("A2").Value = "Đơn vị: " + LoginProfile.SpecializeBranch?.BranchName;
            ws.Cell("A3").Value = title;
            ws.Cell("A4").Value = "Tháng " + month + "/" + Year.ToString();

            IXLWorksheet wsBCDiTre;
            wb.TryGetWorksheet("BC lý do đi làm trễ", out wsBCDiTre);

            SetTableHeader(Month, Year, ws);
            SetValueToSheet1(Month, Year, ws, wsBCDiTre, listUser);

            //wb.TryGetWorksheet("BC lý do đi làm trễ", out ws);
            //SetValueToSheet2(Month, Year, ws, listUser);

            string tempDir = Server.MapPath("~/Temp");
            string fileName = Path.Combine(tempDir, title + " THÁNG " + month + " NĂM " + Year.ToString() + ".xlsx");
            wb.SaveAs(fileName);

            var result = new FilePathResult(fileName, "application/excel");
            result.FileDownloadName = title + " THÁNG " + month + " NĂM " + Year.ToString() + ".xlsx";
            return result;
        }
    }
}