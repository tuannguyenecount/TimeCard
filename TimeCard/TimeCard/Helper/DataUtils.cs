using System;
using System.Collections.Generic;
using System.Data;
using System.Reflection;

namespace TimeCard.Helper
{
    public static class DataUtils
    {
        public static List<T> ConvertDataList<T>(DataSet ds)
        {
            var ret = default(List<T>);
            if (ds != null && ds.Tables != null && ds.Tables.Count > 0)
            {
                ret = ConvertDataList<T>(ds.Tables[0]);
            }
            return ret;
        }
        public static List<T> ConvertDataList<T>(DataTable dt)
        {
            List<T> data = new List<T>();
            if (dt != null && dt.Rows != null && dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    T item = GetItem<T>(row);
                    data.Add(item);
                }
            }
            return data;
        }
        private static T GetItem<T>(DataRow dr)
        {
            Type temp = typeof(T);
            T obj = Activator.CreateInstance<T>();

            foreach (DataColumn column in dr.Table.Columns)
            {
                foreach (PropertyInfo pro in temp.GetProperties())
                {
                    if (pro.Name.ToUpper() == column.ColumnName.ToUpper() && dr[column.ColumnName] != DBNull.Value)
                    {
                        try
                        {
                            switch (pro.PropertyType.Name.ToLower())
                            {
                                case "string":
                                    pro.SetValue(obj, dr[column.ColumnName].ToString(), null);
                                    break;
                                case "decimal":
                                    pro.SetValue(obj, Convert.ToDecimal(dr[column.ColumnName]), null);
                                    break;
                                case "double":
                                    pro.SetValue(obj, Convert.ToDouble(dr[column.ColumnName]), null);
                                    break;
                                case "int64": //long
                                    pro.SetValue(obj, Convert.ToInt64(dr[column.ColumnName]), null);
                                    break;
                                case "datetime":
                                    pro.SetValue(obj, Convert.ToDateTime(dr[column.ColumnName]), null);
                                    break;
                                case "int32":
                                    pro.SetValue(obj, Convert.ToInt32(dr[column.ColumnName]), null);
                                    break;
                            }
                        }
                        catch (Exception ex)
                        {
                            LogHelper.Current.WriteLogs(ex.ToString(), "T GetItem<T>(DataRow dr) : line 130", "");
                            return default(T);
                        }
                    }
                    else
                        continue;
                }
            }
            return obj;
        }

        public static DataTable GetTableFromString(List<string> lit)
        {
            DataTable ret = null;
            if (lit != null && lit.Count > 0)
            {
                ret = new DataTable();

                foreach (var it in lit)
                {
                    var tmp = it.Split('|');
                    var t = tmp.Length > 1 ? tmp[1].ToLower() : "string";
                    ret.Columns.Add(new DataColumn
                    {
                        DataType = "datetime" == t ? typeof(System.DateTime) : ("decimal" == t ? typeof(System.Decimal) : typeof(System.String)),
                        AllowDBNull = true,
                        ColumnName = tmp[0]
                    });
                }
            }
            return ret;
        }

        public static object[] SetValueForRow(DataRow r, List<string> litHeader)
        {
            object[] ret = null;
            if (r != null && litHeader != null && litHeader.Count > 0)
            {
                ret = new object[litHeader.Count];
                for (var i = 0; i < litHeader.Count; i++)
                {
                    string c = litHeader[i].Split('|')[0];
                    ret[i] = r[c];
                }
            }
            return ret;
        }

        public static List<string> GetColumnDataTable(DataTable dt)
        {
            List<string> ret = null;
            if (dt != null && dt.Columns.Count > 0)
            {
                ret = new List<string>();
                foreach (DataColumn c in dt.Columns)
                {
                    ret.Add(c.ToString() + "|" + c.DataType.Name);
                }
            }
            return ret;
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="dt">Datatable source</param>
        /// <param name="template">{"GD_ID|String","DON_VI_TAO|String"}</param>
        /// <returns></returns>
        public static DataTable GetExportData(DataTable dt, string template)
        {
            DataTable ret = null;
            try
            {
                if (!string.IsNullOrWhiteSpace(template) && dt != null && dt.Rows != null && dt.Rows.Count > 0)
                {
                    List<string> litheader = JsonHelper.DeSerialize<List<string>>(template);
                    if (litheader != null && litheader.Count > 0)
                    {
                        ret = GetTableFromString(litheader);
                        for (int j = 0; j < dt.Rows.Count; j++)
                        {
                            var row = dt.Rows[j];
                            ret.Rows.Add(SetValueForRow(row, litheader));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogHelper.Current.WriteLogs(ex.ToString(), "DataUtils.GetExportData", "");
            }
            return ret;
        }

        public static List<string> ToList(this DataColumnCollection dataColumn, bool hasDataType = false)
        {
            List<string> ret = null;
            if (dataColumn != null && dataColumn.Count > 0)
            {
                ret = new List<string>();
                for (var i = 0; i < dataColumn.Count; i++)
                {
                    ret.Add(dataColumn[i].ColumnName + (hasDataType ? "|" + dataColumn[i].DataType.Name : string.Empty));
                }
            }
            return ret;
        }

        public static string ReplaceToObject<T>(this T obj, string msg)
        {
            if (string.IsNullOrWhiteSpace(msg) || msg.Length==0)
                return msg;
            try
            {
                Type temp = typeof(T);
                //T obj = Activator.CreateInstance<T>();

                foreach (PropertyInfo pro in temp.GetProperties())
                {
                    string proName = string.Format("<#{0}#>", pro.Name);
                    if (msg.Contains(proName))
                    {
                        string val = pro.GetValue(obj).ToString();
                        msg = msg.Replace(proName, val);
                    }
                    else
                        continue;
                }
            }
            catch (Exception ex)
            {
                LogHelper.Current.WriteLogs(ex.ToString(), "ReplaceToObject<T>", "");
            }
            return msg;
        }
    }
}