using System;

namespace TimeCard.Models.System
{
    public class HistoryCheckInModel
    {
        private string _note;
        public int HistoryId { get; set; }
        public string UserName { get; set; }
        public string IPCheckIn { get; set; }
        public string IPCheckOut { get; set; }
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
                    if (DateTime.TryParse(DateCheckIn, out result))
                    {
                        return result;
                    }
                }
                result = DateTime.ParseExact(Crypt.Decrypt(DateCheckIn), "ddMMyyyyHHmmss", null);
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
                if(DateCheckIn_Parse != null && DateCheckIn_Parse.Value.Date != DateTime.Today.Date && DateCheckOut_Parse == null)
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
                if (DateCheckIn_Parse != null && DateCheckIn_Parse.Value.TimeOfDay >= start)
                    return true;
                else
                    return false;
            }
        }
        public bool? IsLeaveEarly
        {
            get
            {
                if(DateCheckOut_Parse == null)
                {
                    return null;
                }
                TimeSpan end = new TimeSpan(17, 0, 0); //17 o'clock
                if(DateCheckOut_Parse.Value.DayOfWeek == DayOfWeek.Saturday)
                {
                    end = new TimeSpan(12, 0, 0);
                }
                if (DateCheckOut_Parse.Value.TimeOfDay < end)
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
                if(DateCheckIn_Parse != null)
                {
                    result = "<b>" + (DateCheckIn_Parse.Value.Hour < 10 ? "0" + DateCheckIn_Parse.Value.Hour.ToString() : DateCheckIn_Parse.Value.Hour.ToString())
                                + ":" + (DateCheckIn_Parse.Value.Minute < 10 ? "0" + DateCheckIn_Parse.Value.Minute.ToString() : DateCheckIn_Parse.Value.Minute.ToString()) + "</b>&nbsp;";  
                }
                if (DateCheckOut_Parse != null)
                {
                    result += "<b> - " + (DateCheckOut_Parse.Value.Hour < 10 ? "0" + DateCheckOut_Parse.Value.Hour.ToString() : DateCheckOut_Parse.Value.Hour.ToString())
                                + ":" + (DateCheckOut_Parse.Value.Minute < 10 ? "0" + DateCheckOut_Parse.Value.Minute.ToString() : DateCheckOut_Parse.Value.Minute.ToString()) + "</b>&nbsp;";
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
                if (DateCheckIn_Parse == null)
                    return 0;
                DateTime timeStart = new DateTime(DateCheckIn_Parse.Value.Year, DateCheckIn_Parse.Value.Month, DateCheckIn_Parse.Value.Day, 8, 0, 59);
                return (DateCheckIn_Parse.Value - timeStart).TotalMinutes > 0 ? (int)(DateCheckIn_Parse.Value - timeStart).TotalMinutes : 0; 
            }
        }
        public int TotalMinuteLeaveEarly
        {
            get
            {
                if (DateCheckIn_Parse == null || DateCheckOut_Parse == null)
                    return 0;
                
                DateTime timeEnd = new DateTime(DateCheckIn_Parse.Value.Year, DateCheckIn_Parse.Value.Month, DateCheckIn_Parse.Value.Day, 17, 0, 0);
                if(DateCheckIn_Parse.Value.DayOfWeek == DayOfWeek.Saturday)
                {
                    timeEnd = new DateTime(DateCheckIn_Parse.Value.Year, DateCheckIn_Parse.Value.Month, DateCheckIn_Parse.Value.Day, 12, 0, 0);
                }
                return (timeEnd - DateCheckOut_Parse.Value).TotalMinutes > 0 ? (int)(timeEnd - DateCheckOut_Parse.Value).TotalMinutes : 0;
            }
        }
        public string DateCheckIn_DTime { get; set; }
        public string DateCheckOut_DTime { get; set; }
        public Nullable<DateTime> DateCheckIn_Parse
        {
            get
            {
                if (string.IsNullOrEmpty(this.DateCheckIn_DTime))
                    return null;
                else
                {
                    return DateTime.ParseExact(this.DateCheckIn_DTime, "ddMMyyyyHHmmss", null);
                }
            }
        }
        public Nullable<DateTime> DateCheckOut_Parse
        {
            get
            {
                if (string.IsNullOrEmpty(this.DateCheckOut_DTime))
                    return null;
                else
                {
                    return DateTime.ParseExact(this.DateCheckOut_DTime, "ddMMyyyyHHmmss", null);
                }
            }
        }
    }
}