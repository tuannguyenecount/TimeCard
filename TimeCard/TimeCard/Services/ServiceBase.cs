using TimeCard.Helper;
using Oracle.ManagedDataAccess.Client;
using System.Configuration;

namespace TimeCard.Services
{
    public class ServiceBase
    {
        protected static OracleConnection GetConnection()
        {
            return OracleHelper.GetConnection(ConfigurationManager.ConnectionStrings[GlobalInfo.DB_CONNECT_STRING_NAME].ToString());
        }
    }
}