using TimeCard.Services;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace TimeCard.Helper
{
    public class DBHelper : ServiceBase
    {
        public DBHelper(string storeName, string userName)
        {
            this.param = new List<DBParam>();
            this.storeName = storeName;
            this.userName = userName;
        }
        public List<DBParam> param { get; set; }
        public string storeName { get; set; }
        public string userName { get; set; }
        public List<string> litHeader { get; set; }
        public DataTable dataTableResult { get; set; }
        public DataTable[] multiDataTableResult { get; set; }
        public DBHelper addHeaderList(List<string> litHeader)
        {
            this.litHeader = litHeader;
            return this;
        }
        public DBHelper addParam(string parameterName, object obj = null, OracleDbType type = OracleDbType.Varchar2)
        {
            param.Add(
                new DBParam
                {
                    parameterName = parameterName,
                    type = type,
                    direction = ParameterDirection.Input,
                    obj = obj
                });
            return this;
        }
        public DBHelper addParamInt(string parameterName, object obj)
        {
            param.Add(
                new DBParam
                {
                    parameterName = parameterName,
                    type = OracleDbType.Int32,
                    direction = ParameterDirection.Input,
                    obj = obj
                });
            return this;
        }
        /// <summary>
        /// Add output param
        /// </summary>
        /// <param name="parameterName">param name</param>
        /// <param name="type">default is RefCursor</param>
        /// <returns></returns>
        public DBHelper addParamOutput(string parameterName, OracleDbType type = OracleDbType.RefCursor)
        {
            param.Add(
                new DBParam
                {
                    parameterName = parameterName,
                    type = type,
                    direction = ParameterDirection.Output
                });
            return this;
        }
        public DBHelper addParamOutputXML(string parameterName)
        {
            param.Add(
                new DBParam
                {
                    parameterName = parameterName,
                    type = OracleDbType.XmlType,
                    direction = ParameterDirection.Output
                });
            return this;
        }
        public DBHelper addParamInputOutput(string parameterName, OracleDbType type = OracleDbType.Varchar2)
        {
            param.Add(
                new DBParam
                {
                    parameterName = parameterName,
                    type = type,
                    direction = ParameterDirection.InputOutput
                });
            return this;
        }
        public DBHelper addParamReturnValue(string parameterName, OracleDbType type = OracleDbType.Varchar2)
        {
            param.Add(
                new DBParam
                {
                    parameterName = parameterName,
                    type = type,
                    direction = ParameterDirection.ReturnValue
                });
            return this;
        }
        public DBHelper ExecuteStore()
        {
            dataTableResult = null;
            try
            {
                if (!string.IsNullOrWhiteSpace(storeName))
                {
                    using (var conn = GetConnection())
                    {
                        OracleParameter[] paramx = new OracleParameter[param.Count];
                        for (int i = 0; i < param.Count; i++)
                        {
                            paramx[i] = new OracleParameter(param[i].parameterName, param[i].type, param[i].obj, param[i].direction);
                        }
                        DataSet ds = OracleHelper.ExecuteDataset(conn, CommandType.StoredProcedure, storeName, paramx);

                        dataTableResult = ds != null && ds.Tables != null && ds.Tables.Count > 0 ? ds.Tables[0] : null;
                    }
                    OracleConnection.ClearAllPools();
                }

            }
            catch (Exception ex)
            {
                LogHelper.Current.WriteLogs(ex.ToString(), "StoreName: " + storeName, userName);
            }
            return this;
        }

        /// <summary>
        /// Multi return cursor
        /// </summary>
        /// <returns></returns>
        public DBHelper ExecuteStoreMulti()
        {
            dataTableResult = null;
            try
            {
                if (!string.IsNullOrWhiteSpace(storeName))
                {
                    using (var conn = GetConnection())
                    {
                        OracleParameter[] paramx = new OracleParameter[param.Count];
                        for (int i = 0; i < param.Count; i++)
                        {
                            paramx[i] = new OracleParameter(param[i].parameterName, param[i].type, param[i].obj, param[i].direction);
                        }
                        DataSet ds = OracleHelper.ExecuteDataset(conn, CommandType.StoredProcedure, storeName, paramx);

                        if (ds != null && ds.Tables != null && ds.Tables.Count > 0)
                        {
                            multiDataTableResult = new DataTable[ds.Tables.Count];
                            for (int j = 0; j < ds.Tables.Count; j++)
                            {
                                multiDataTableResult[j] = ds.Tables[j];
                            }
                        }
                    }
                    OracleConnection.ClearAllPools();
                }

            }
            catch (Exception ex)
            {
                LogHelper.Current.WriteLogs(ex.ToString(), "StoreName: " + storeName, userName);
            }
            return this;
        }

        public DataTable getDataTable()
        {
            return dataTableResult;
        }

        public DataTable[] getDataTableMulti()
        {
            return multiDataTableResult;
        }

        public List<T> getList<T>()
        {
            return DataUtils.ConvertDataList<T>(dataTableResult);
        }

        public T getFirst<T>()
        {
            return DataUtils.ConvertDataList<T>(dataTableResult).FirstOrDefault();
        }
    }

    public class DBParam
    {
        public string parameterName { get; set; }
        public OracleDbType type { get; set; }
        public object obj { get; set; }
        public ParameterDirection direction { get; set; }
    }
}