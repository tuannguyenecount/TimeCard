﻿using System;

namespace TimeCard.Models.System
{
    public class HistoryCheckInModel
    {
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
    }
}