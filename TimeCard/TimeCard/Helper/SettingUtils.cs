using TimeCard.Models;
using TimeCard.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace TimeCard.Helper
{
    public static class SettingUtils
    {
        public static string GetSettingValue(this string SettingName)
        {
            ErrorModel ErrorResult;
            string ret=null;
            var cfg = SystemService.Current.GetSetting(SettingName, "system", out ErrorResult);
            
            if (cfg != null && !string.IsNullOrWhiteSpace(cfg.Value1))
            {
                ret = cfg.Value1;
            }
            return ret;
        }
    }
}