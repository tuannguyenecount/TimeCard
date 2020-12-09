using System;

namespace TimeCard.Models.System
{
    public class HistoryCheckInModel
    {
        private string _note;
        public int HistoryId { get; set; }
        public string UserName { get; set; }
        public string IP { get; set; }
        public string DateCheckIn { get; set; }
        public string DateCheckOut { get; set; }
        public Nullable<DateTime> DateCheckInDecrypt
        {
            get
            {
                DateTime result;
                if (string.IsNullOrEmpty(DateCheckIn))
                    return null;
                else
                {
                    if(DateTime.TryParse(DateCheckIn, out result))
                    {
                        return result;
                    }
                }
                result = DateTime.ParseExact(Crypt.Decrypt(DateCheckIn),"ddMMyyyyHHmmss", null);
                return result;
            }
        }
        public Nullable<DateTime> DateCheckOutDecrypt
        {
            get
            {
                DateTime result;
                if (string.IsNullOrEmpty(DateCheckOut))
                    return null;
                else
                {
                    if (DateTime.TryParse(DateCheckOut, out result))
                    {
                        return result;
                    }
                }
                result = DateTime.ParseExact(Crypt.Decrypt(DateCheckOut), "ddMMyyyyHHmmss", null);
                return result;
            }
        }
        public string NoteCheckIn { get; set; }
        public string NoteCheckOut { get; set; }
        public string Note
        {
            get
            {
                if(DateCheckInDecrypt != null && DateCheckInDecrypt.Value.Date != DateTime.Today.Date && DateCheckOutDecrypt == null)
                {
                    return "Check out tự động. " + (_note ?? string.Empty).Replace("Check out tự động","");
                }
                return _note;
            }
            set
            {
                _note = value;
            }
        }
        public bool IsLate
        {
            get
            {
                TimeSpan start = new TimeSpan(8, 1, 0); //8 o'clock
                if (DateCheckInDecrypt != null && DateCheckInDecrypt.Value.TimeOfDay >= start)
                    return true;
                else
                    return false;
            }
        }
        public bool? IsLeaveEarly
        {
            get
            {
                if(DateCheckOutDecrypt == null)
                {
                    return null;
                }
                TimeSpan end = new TimeSpan(17, 0, 0); //17 o'clock
                if(DateTime.Today.DayOfWeek == DayOfWeek.Saturday)
                {
                    end = new TimeSpan(12, 0, 0);
                }
                if (DateCheckOutDecrypt.Value.TimeOfDay < end)
                    return true;
                else
                    return false;
            }
        }
        public string Title
        {
            get
            {
                string result = string.Empty;
                if(DateCheckInDecrypt != null)
                {
                    result = "<b>" + (DateCheckInDecrypt.Value.Hour < 10 ? "0" + DateCheckInDecrypt.Value.Hour.ToString() : DateCheckInDecrypt.Value.Hour.ToString())
                                + ":" + (DateCheckInDecrypt.Value.Minute < 10 ? "0" + DateCheckInDecrypt.Value.Minute.ToString() : DateCheckInDecrypt.Value.Minute.ToString()) + "</b>&nbsp;";  
                }
                if (DateCheckOutDecrypt != null)
                {
                    result += "<b> - " + (DateCheckOutDecrypt.Value.Hour < 10 ? "0" + DateCheckOutDecrypt.Value.Hour.ToString() : DateCheckOutDecrypt.Value.Hour.ToString())
                                + ":" + (DateCheckOutDecrypt.Value.Minute < 10 ? "0" + DateCheckOutDecrypt.Value.Minute.ToString() : DateCheckOutDecrypt.Value.Minute.ToString()) + "</b>&nbsp;";
                }
                if (IsLate)
                {
                    if (IsLeaveEarly != null && IsLeaveEarly == true)
                    {
                        result += "Đi làm trễ - Ra về sớm.<br/>";
                    }
                    else
                    {
                        result += "Đi làm trễ.<br/>";
                    }
                }
                else
                {
                    if (IsLeaveEarly == true)
                    {
                        result += "Ra về sớm.<br/>";
                    }
                    else
                    {
                        if (IsLeaveEarly == false)
                        {
                            result += "Đi làm - Ra về đúng giờ.<br/>";
                        }
                        else
                        {
                            result += "Đi làm đúng giờ.<br/>";
                        }
                    }
                }
                if (!string.IsNullOrEmpty(NoteCheckIn))
                {
                    result += "Lý do đi trễ: " + NoteCheckIn + ".<br/>";
                }
                if (!string.IsNullOrEmpty(NoteCheckOut))
                {
                    result += "Lý do ra về sớm: " + NoteCheckOut + ".<br/>";
                }
                if (!string.IsNullOrEmpty(Note))
                {
                    result += "Ghi chú: " + Note + "<br/>";
                }
                return result;
            }
        }
        public string BackgroundColor
        {
            get
            {
                if (IsLate == true || IsLeaveEarly == true)
                {
                    return "#dc3545";
                }
                //if (IsLeaveEarly)
                //{
                //    return "#f39c12";
                //}
                return "#00a65a";
            }
        }
        public int TotalMinuteLate
        {
            get
            {
                if (DateCheckInDecrypt == null)
                    return 0;
                DateTime timeStart = new DateTime(DateCheckInDecrypt.Value.Year, DateCheckInDecrypt.Value.Month, DateCheckInDecrypt.Value.Day, 8, 0, 59);
                return (DateCheckInDecrypt.Value - timeStart).TotalMinutes > 0 ? (int)(DateCheckInDecrypt.Value - timeStart).TotalMinutes : 0; 
            }
        }
        public int TotalMinuteLeaveEarly
        {
            get
            {
                if (DateCheckInDecrypt == null || DateCheckOutDecrypt == null)
                    return 0;
                
                DateTime timeEnd = new DateTime(DateCheckInDecrypt.Value.Year, DateCheckInDecrypt.Value.Month, DateCheckInDecrypt.Value.Day, 17, 0, 0);
                if(DateCheckInDecrypt.Value.DayOfWeek == DayOfWeek.Saturday)
                {
                    timeEnd = new DateTime(DateCheckInDecrypt.Value.Year, DateCheckInDecrypt.Value.Month, DateCheckInDecrypt.Value.Day, 12, 0, 0);
                }
                return (timeEnd - DateCheckOutDecrypt.Value).TotalMinutes > 0 ? (int)(timeEnd - DateCheckOutDecrypt.Value).TotalMinutes : 0;
            }
        }
    }
}