using TimeCard.Helper;
using TimeCard.Models;
using TimeCard.Security;
using System;

namespace TimeCard.Services
{
    public partial class EOfficeService
    {
        public static EOfficeService current
        {
            get { return new EOfficeService(); }
        }

        public LoginProfile Login(CheckInUser model, out ErrorModel errorModel)
        {
            LoginProfile ret = null;

            errorModel = new ErrorModel();
            try
            {
                DBHelper db = new DBHelper(GlobalInfo.PKG_TMS_SYSTEM + ".sp_login", model.Username)
                    .addParamOutput("oResult")
                    .addParam("pUserName", model.Username)
                    .ExecuteStore();

                ret = db.getFirst<LoginProfile>();

                errorModel.ErrorCode = ret != null ? 1 : 0;
                errorModel.ErrorMsg = errorModel.ErrorCode == 1 ? "Success" : "fail";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "EOfficeService.Login", model.Username);
            }

            return ret;
        }
    }
}