using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace TimeCard.Helper
{
    public static class Utils
    {
        public static string GetDomain(string configKey = "ActiveDomain", string defaultDomain = "ocb.vn")
        {
            string domain = ConfigurationManager.AppSettings[configKey];
            if (string.IsNullOrWhiteSpace(domain))
            {
                domain = defaultDomain;
            }
            return domain;
        }
        public static string GetAppSetting(string configKey)
        {
            return ConfigurationManager.AppSettings[configKey];
        }
        public static string[] GetAppSettings(string configKey, params char[] separators)
        {
            string[] ret = null;
            string str = ConfigurationManager.AppSettings[configKey];
            if (!string.IsNullOrWhiteSpace(str))
            {
                ret = str.Split(separators);
            }
            return ret ?? new string[] { };
        }
        public static List<long> ConvertListStringToLong(List<string> src)
        {
            return src.Select(q => Convert.ToInt64(q)).ToList();
        }

        public static string SiteURL(this HttpRequestBase Request)
        {
            var url = Request.Url;
            string port = url.Port == 80 ? "" : ":" + url.Port;
            return url.Scheme + "://" + url.Host + port + "/";
        }
        public static bool ContainVal(this string[] haytrack, string val, StringComparison strComparation = StringComparison.CurrentCultureIgnoreCase)
        {
            bool ret = false;
            if (haytrack != null)
            {
                foreach (string s in haytrack)
                {
                    if (s.Equals(val, strComparation))
                    {
                        ret = true;
                        break;
                    }
                }
            }
            return ret;
        }
        public static bool ContainVal(this List<string> haytrack, string val, StringComparison strComparation = StringComparison.CurrentCultureIgnoreCase)
        {
            string[] ht = haytrack == null ? null : haytrack.ToArray();
            return ht.ContainVal(val, strComparation);
        }
        public static DateTime ToBeginDate(this DateTime me)
        {
            return new DateTime(me.Year, me.Month, me.Day);
        }
        public static DateTime ToEndDate(this DateTime me)
        {
            return new DateTime(me.Year, me.Month, me.Day, 23, 59, 59).AddMilliseconds(999);
        }
        public static int ToInt(this string t)
        {
            if (string.IsNullOrWhiteSpace(t)) return 0;
            return Convert.ToInt32(t);
        }
        public static string ToMonthYear(this string yyyyMM, string sep = "/")
        {
            return yyyyMM.Substring(4, 2) + sep + yyyyMM.Substring(0, 4);
        }
        public static string ToDayMonthYear(this string yyyyMMdd, string sep = "/")
        {
            return yyyyMMdd.Substring(6, 2) + sep + yyyyMMdd.Substring(4, 2) + sep + yyyyMMdd.Substring(0, 4);
        }
        public static string ToYearMonthDay(this string ddMMyyyy)
        {
            //20/02/2020
            return !string.IsNullOrWhiteSpace(ddMMyyyy) ? ddMMyyyy.Substring(6, 4) + ddMMyyyy.Substring(3, 2) + ddMMyyyy.Substring(0, 2) : string.Empty;
        }
        public static DateTime ToDate(this string yyyyMMdd)
        {
            int year = Convert.ToInt32(yyyyMMdd.Substring(0, 4));
            int month = Convert.ToInt32(yyyyMMdd.Substring(4, 2));
            int day = Convert.ToInt32(yyyyMMdd.Substring(6, 2));
            return new DateTime(year, month, day);
        }
        public static string SecureCardNo(this string cardNo)
        {
            cardNo = cardNo.Trim();
            int len = cardNo.Length;
            return cardNo.Substring(0, 4) + new string('*', len - 8) + cardNo.Substring(len - 4, 4);
        }
        public static bool IsInthePast(this string yyyyMMdd)
        {
            try
            {
                int year = Convert.ToInt32(yyyyMMdd.Substring(0, 4));
                int month = Convert.ToInt32(yyyyMMdd.Substring(4, 2));
                int day = Convert.ToInt32(yyyyMMdd.Substring(6, 2));
                DateTime now = DateTime.Now;
                return now.Year * 10000 + now.Month * 100 + now.Day > year * 10000 + month * 100 + day;
            }
            catch (Exception)
            {
                return true;
            }
        }
        public static string NVL(this string me, string _def)
        {
            if (string.IsNullOrWhiteSpace(me))
            {
                return _def;
            }
            else
            {
                return me;
            }
        }
        public static bool IsAMonth(this object me, out int m)
        {
            m = -1;
            return me != null ? int.TryParse(me.ToString(), out m) && m.IsBetween(1, 12) : false;
        }
        public static bool IsAQuater(this object me, out int m)
        {
            m = -1;
            return me != null ? int.TryParse(me.ToString(), out m) && m.IsBetween(1, 4) : false;
        }
        public static bool IsBetween(this IComparable me, IComparable gte, IComparable lte)
        {
            return me.CompareTo(gte) >= 0 && me.CompareTo(lte) <= 0;
        }
        public static decimal ToDecimal(this string val)
        {
            decimal ret = 0;
            decimal.TryParse(val, out ret);
            return ret;
        }

        public static string DecimalFormat(this object num)
        {
            if (num != null)
            {
                string str = num.ToString();
                decimal dec = 0;
                if (decimal.TryParse(str, out dec))
                {
                    return dec.ToString("#,###.####");
                }
            }
            return "";
        }

        // Returns the human-readable file size for an arbitrary, 64-bit file size 
        // The default format is "0.### XB", e.g. "4.2 KB" or "1.434 GB"
        public static string ToSizeString(this long i)
        {
            // Get absolute value
            long absolute_i = (i < 0 ? -i : i);
            // Determine the suffix and readable value
            string suffix;
            double readable;
            if (absolute_i >= 0x1000000000000000) // Exabyte
            {
                suffix = "EB";
                readable = (i >> 50);
            }
            else if (absolute_i >= 0x4000000000000) // Petabyte
            {
                suffix = "PB";
                readable = (i >> 40);
            }
            else if (absolute_i >= 0x10000000000) // Terabyte
            {
                suffix = "TB";
                readable = (i >> 30);
            }
            else if (absolute_i >= 0x40000000) // Gigabyte
            {
                suffix = "GB";
                readable = (i >> 20);
            }
            else if (absolute_i >= 0x100000) // Megabyte
            {
                suffix = "MB";
                readable = (i >> 10);
            }
            else if (absolute_i >= 0x400) // Kilobyte
            {
                suffix = "KB";
                readable = i;
            }
            else
            {
                return i.ToString("0 B"); // Byte
            }
            // Divide by 1024 to get fractional value
            readable = (readable / 1024);
            // Return formatted number with suffix
            return readable.ToString("0.### ") + suffix;
        }

        public static string FilterString(this string str, string type = "ONLYTEXT", string[] pattern = null)
        {
            if (!string.IsNullOrWhiteSpace(str))
            {
                switch (type)
                {
                    case "FILTER":
                        if (pattern == null || pattern.Length == 0)
                        {
                            pattern = new string[] { "html", "head", "body", "script", "style", "input"};
                        }

                        foreach (string p in pattern)
                        {
                            str = Regex.Replace(str, @"<" + p + ".*?>(.*?)<\\/" + p + ">", "", RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Multiline);
                        }

                        break;
                    default:
                        str = Regex.Replace(str, @"<[^>].+?>", "");
                        break;
                }

            }
            return str;
        }

        public static bool IsBetween(this TimeSpan timeNow, TimeSpan start, TimeSpan end)
        {
            var time = timeNow;
            // If the start time and the end time is in the same day.
            if (start <= end)
                return time >= start && time <= end;
            // The start time and end time is on different days.
            return time >= start || time <= end;
        }

        public static string HasRemainingFromNow(this TimeSpan start, TimeSpan end)
        {
            TimeSpan now = DateTime.Now.TimeOfDay;
            //TimeSpan.Parse("24:00:00") is to compensate midnight hours.
            string ret = string.Format("Time remaining before {0} AM is: {1} Hrs.", start.Hours, (now.Hours > start.Hours) ? TimeSpan.Parse("24:00:00").Subtract(now).Add(end).Hours : end.Subtract(now).Hours);
            
            return ret;
        }
    }
}