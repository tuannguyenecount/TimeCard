using System;
using System.Collections.Generic;
using System.Data;
using OfficeOpenXml;
using System.IO;
using System.Text.RegularExpressions;

namespace TimeCard.Helper
{
    public class ExcelUtils
    {
        public static void SaveToExcel(ExcelDataSource src, FileInfo newFile, FileInfo templateFile, bool printHeader = false)
        {
            using (ExcelPackage pck = new ExcelPackage(newFile, templateFile))
            {
                ExcelWorksheet ws = pck.Workbook.Worksheets[1];
                if (src.SheetName != null)
                {
                    ws.Name = src.SheetName;
                }
                if (!string.IsNullOrWhiteSpace(src.FillAT) && src.DataTable != null)
                {
                    Excel_String_Filter(src.DataTable);
                    Regex r = new Regex(@"\D");
                    int startRow = Convert.ToInt32(r.Replace(src.FillAT, ""));
                    if (src.DataTable.Rows.Count > 1)
                    {
                        ws.InsertRow(startRow, src.DataTable.Rows.Count - 1, startRow + src.DataTable.Rows.Count - 1);
                    }
                    ws.Cells[src.FillAT].LoadFromDataTable(src.DataTable, printHeader);
                }

                if (printHeader)
                    ws.HeaderFooter.FirstHeader.CenteredText = src.HeaderTitle;

                src.FillText(ws);
                pck.Save();
            }
        }
        public static void SaveToExcelMultipleSheet(List<ExcelDataSource> listSrc, FileInfo newFile, FileInfo templateFile, bool printHeader = false)
        {
            using (ExcelPackage pck = new ExcelPackage(newFile, templateFile))
            {
                int index = 0;

                if (listSrc.Count > 0)
                {
                    foreach (var src in listSrc)
                    {
                        ExcelWorksheet ws = pck.Workbook.Worksheets[(index + 1)];

                        if (src.SheetName != null)
                        {
                            ws.Name = src.SheetName;
                        }

                        if (!string.IsNullOrWhiteSpace(src.FillAT) && src.DataTable != null)
                        {
                            Excel_String_Filter(src.DataTable);
                            Regex r = new Regex(@"\D");
                            int startRow = Convert.ToInt32(r.Replace(src.FillAT, ""));
                            if (src.DataTable.Rows.Count > 1)
                            {
                                ws.InsertRow(startRow, src.DataTable.Rows.Count - 1, startRow + (src.DataTable.Rows.Count - 1));

                            }
                            ws.Cells[src.FillAT].LoadFromDataTable(src.DataTable, printHeader);


                        }

                        if (!string.IsNullOrWhiteSpace(src.FillAT2) && src.DataTable2 != null)
                        {
                            Excel_String_Filter(src.DataTable2);
                            Regex r = new Regex(@"\D");
                            int startRow = Convert.ToInt32(r.Replace(src.FillAT2, ""));
                            if (src.DataTable2.Rows.Count > 1)
                            {
                                ws.InsertRow(startRow, src.DataTable2.Rows.Count - 1, startRow + (src.DataTable2.Rows.Count - 1));
                            }
                            ws.Cells[src.FillAT2].LoadFromDataTable(src.DataTable2, printHeader);
                        }

                        src.FillText(ws);

                        index++;
                    }
                }

                pck.Save();

            }
        }
        public static void Excel_String_Filter(DataTable dt)
        {
            var cols = dt.Columns;
            var cnt = cols.Count;
            List<int> stringCols = new List<int>();
            for (int i = 0; i < cnt; i++)
            {
                if (cols[i].DataType == typeof(string))
                {
                    stringCols.Add(i);
                }
            }
            if (stringCols.Count > 0)
            {
                DataRowCollection rows = dt.Rows;
                string re = @"[^\x09\x0A\x0D\x20-\xD7FF\xE000-\xFFFD\x10000-x10FFFF]";
                foreach (DataRow row in rows)
                {
                    object[] vals = row.ItemArray;
                    foreach (int idx in stringCols)
                    {
                        if (vals[idx] != null && vals[idx] != DBNull.Value)
                        {
                            var val = vals[idx].ToString();

                            if (val.Length < 2)
                            {
                                vals[idx] = Regex.Replace(val, re, "");
                            }
                        }
                    }
                    row.ItemArray = vals;
                }
            }
        }
        private static Regex onlyNums = new Regex(@"\D");
        private static Regex onlyChars = new Regex(@"\d");
        public static string ShiftTo(string cellPos, int rows)
        {
            return GetColName(cellPos) + (GetRow(cellPos) + rows);
        }
        public static int GetRow(string cellPos)
        {
            string numRow = onlyNums.Replace(cellPos, "");
            return Convert.ToInt32(numRow);
        }
        public static string GetColName(string cellPos)
        {
            return onlyChars.Replace(cellPos, "");
        }
    }

    public class ExcelDataSource
    {
        public DataTable DataTable { get; set; }
        public String SheetName { get; set; }
        public String FillAT { get; set; }
        public string HeaderTitle { get; set; }
        public Dictionary<string, object> _dic = new Dictionary<string, object>();
        public void FillText(ExcelWorksheet ws)
        {
            foreach (var pair in _dic)
            {
                var cell = ws.Cells[pair.Key];
                cell.Value = pair.Value;
            }
        }
        public ExcelDataSource AddValue(string cellPos, object text)
        {
            _dic.Add(cellPos, text);
            return this;
        }
        public DataTable DataTable2 { get; set; }
        public String FillAT2 { get; set; }
    }
    public class MultiSectionExcelExporting
    {
        private Dictionary<string, object> cellsData = new Dictionary<string, object>();
        public MultiSectionExcelExporting AddCellData(string key, object val)
        {
            cellsData.Add(key, val);
            return this;
        }
        private List<SectionExcel> sections = new List<SectionExcel>();
        public MultiSectionExcelExporting AddSection(SectionExcel aSec)
        {
            sections.Add(aSec);
            return this;
        }
        public SectionExcel SummarySection { get; set; }
        public string SheetName { get; set; }
        public string ReportTemplate { get; set; }
        public string ReportFileNamePrefix { get; set; }

        public void SaveToExcel(DataTable[] dataSrc, FileInfo newFile, FileInfo templateFile, bool printHeader = false)
        {
            int len = dataSrc.Length;
            if (len != sections.Count)
            {
                throw new Exception("numbers of sections and data sources are difference!");
            }

            using (ExcelPackage pck = new ExcelPackage(newFile, templateFile))
            {
                ExcelWorksheet ws = pck.Workbook.Worksheets[1];
                if (SheetName != null)
                {
                    ws.Name = SheetName;
                }

                foreach (var p in cellsData)
                {
                    ws.Cells[p.Key].Value = p.Value;
                }
                int totalCount = 0;
                int first_row = -1;
                for (int i = 0; i < len; i++)
                {
                    var src = dataSrc[i];
                    int cnt = src.Rows.Count;
                    var curentSection = sections[i];
                    if (cnt > 0)
                    {
                        totalCount += cnt;
                        int currentRow = ExcelUtils.GetRow(curentSection.FillATCellPos);
                        if (first_row == -1)
                        {
                            first_row = currentRow;
                        }
                        ExcelUtils.Excel_String_Filter(src);
                        int newRows = cnt - 1;
                        if (newRows > 0)
                        {
                            ws.InsertRow(currentRow, newRows, currentRow);
                            curentSection.ShitfTo(newRows, false);
                            for (int j = i + 1; j < len; j++)
                            {
                                sections[j].ShitfTo(newRows, true);
                            }
                            if (SummarySection != null)
                            {
                                SummarySection.ShitfTo(newRows, false);
                            }
                        }
                        ws.Cells[curentSection.FillATCellPos].LoadFromDataTable(src, printHeader);
                        if (curentSection.CounterCellPos != null)
                        {
                            ws.Cells[curentSection.CounterCellPos].Value = cnt;
                        }
                        if (curentSection.SumCellPosList != null)
                        {
                            foreach (string sumPos in curentSection.SumCellPosList)
                            {
                                var colName = ExcelUtils.GetColName(sumPos);
                                ws.Cells[sumPos].Formula = string.Format("Sum({0}{1}:{0}{2})", colName, currentRow, currentRow + newRows);
                            }
                        }
                        if (curentSection.SumColumList != null)
                        {
                            foreach (string sumCol in curentSection.SumColumList)
                            {
                                string[] parts = sumCol.Split('-');
                                string sumPos = parts[0];
                                var colName = parts[1];
                                ws.Cells[sumPos].Formula = string.Format("Sum({0}{1}:{0}{2})", colName, currentRow, currentRow + newRows);
                            }
                        }
                    }
                }
                if (SummarySection != null)
                {
                    if (SummarySection.CounterCellPos != null)
                    {
                        if (totalCount > 0)
                        {
                            ws.Cells[SummarySection.CounterCellPos].Value = totalCount;
                        }
                        else
                        {
                            ws.Cells[SummarySection.CounterCellPos].Value = "";
                        }
                    }
                    if (SummarySection.SumCellPosList != null)
                    {
                        foreach (string sumPos in SummarySection.SumCellPosList)
                        {
                            var colName = ExcelUtils.GetColName(sumPos);
                            List<string> cols = new List<string>();
                            for (int i = 0; i < len; i++)
                            {
                                string ret = sections[i].GetSumColumByName(colName);
                                if (ret != null)
                                {
                                    cols.Add(ret);
                                }
                            }
                            if (cols.Count == 0)
                            {
                                int lastRow = ExcelUtils.GetRow(sumPos) - 1;
                                ws.Cells[sumPos].Formula = string.Format("Sum({0}{1}:{0}{2})", colName, first_row, lastRow);
                            }
                            else
                            {
                                ws.Cells[sumPos].Formula = string.Format("Sum({0})", string.Join(",", cols));
                            }
                        }
                    }

                    if (SummarySection.SumColumList != null)
                    {
                        foreach (string sumCol in SummarySection.SumColumList)
                        {
                            string[] parts = sumCol.Split('-');
                            string sumPos = parts[0];
                            var colName = parts[1];

                            var colName2 = ExcelUtils.GetColName(sumPos);
                            List<string> cols = new List<string>();
                            for (int i = 0; i < len; i++)
                            {
                                string ret = sections[i].GetSumColumByName(colName2);
                                if (ret != null)
                                {
                                    cols.Add(ret);
                                }
                            }
                            if (cols.Count == 0)
                            {
                                int lastRow = ExcelUtils.GetRow(sumPos) - 1;
                                ws.Cells[sumPos].Formula = string.Format("Sum({0}{1}:{0}{2})", colName, first_row, lastRow);
                            }
                            else
                            {
                                ws.Cells[sumPos].Formula = string.Format("Sum({0})", string.Join(",", cols));
                            }
                            //ws.Cells[sumPos].Formula = string.Format("Sum({0}{1}:{0}{2})", colName, first_row, lastRow);
                        }
                    }
                }
                pck.Save();
            }
        }
    }
    public class SectionExcel
    {
        public string FillATCellPos { get; set; }
        public string CounterCellPos { get; set; }
        /// <summary>
        /// used for sub total, sum in the same column
        /// </summary>
        public List<string> SumCellPosList { get; set; }
        /// <summary>
        /// use in case set total of a column to a cell.
        /// format: CellPos+'-ColumnName'. Ex: C15-J means C15 = Sum(J$StartRow:J$EndRow)
        /// </summary>
        public List<string> SumColumList { get; set; }
        public void ShitfTo(int numOfRows, bool applyFillAtPos)
        {
            if (applyFillAtPos)
            {
                FillATCellPos = ExcelUtils.ShiftTo(FillATCellPos, numOfRows);
            }
            if (!string.IsNullOrWhiteSpace(CounterCellPos))
            {
                CounterCellPos = ExcelUtils.ShiftTo(CounterCellPos, numOfRows);
            }
            if (SumCellPosList != null)
            {
                int len = SumCellPosList.Count;
                for (int i = 0; i < len; i++)
                {
                    SumCellPosList[i] = ExcelUtils.ShiftTo(SumCellPosList[i], numOfRows);
                }
            }
            if (SumColumList != null)
            {
                int len = SumColumList.Count;
                for (int i = 0; i < len; i++)
                {
                    string[] parts = SumColumList[i].Split('-');
                    SumColumList[i] = ExcelUtils.ShiftTo(parts[0], numOfRows) + "-" + parts[1];
                }
            }
        }
        public string GetSumColumByName(string colName)
        {
            string ret = null;
            if (SumCellPosList != null)
            {
                foreach (string cellPos in SumCellPosList)
                {
                    var aName = ExcelUtils.GetColName(cellPos);
                    if (colName.Equals(aName))
                    {
                        return cellPos;
                    }
                }
            }
            return ret;
        }
    }
}