using TimeCard.Helper;
using TimeCard.Models;
using TimeCard.Security;
using System;
using System.Collections.Generic;
using TimeCard.Models.eOffice;

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

        public List<eOfficeBranch> GetBranchForUser(string UserName, out ErrorModel errorModel)
        {
            List<eOfficeBranch> ret = null;
            errorModel = new ErrorModel();
            try
            {
                DBHelper db = new DBHelper(GlobalInfo.PKG_TMS + ".sp_get_branch_for_user", UserName)
                    .addParamOutput("oResult")
                    .addParam("pUserName", UserName)
                    .ExecuteStore();

                ret = db.getList<eOfficeBranch>();
                errorModel.ErrorCode = 1;
                errorModel.ErrorMsg = "Success";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "EOfficeService.GetBranchForUser", UserName);
            }
            return ret;
        }

        public List<eOfficeEmployee> GetUserBranchTree(int BranchId, string UserName, out ErrorModel errorModel)
        {
            List<eOfficeEmployee> ret = null;
            errorModel = new ErrorModel();
            try
            {
                DBHelper db = new DBHelper(GlobalInfo.PKG_TMS + ".sp_get_user_branch_tree", UserName)
                    .addParamOutput("oResult")
                    .addParam("pUserName", UserName)
                    .addParam("pJson", JsonHelper.Serialize(new { BranchId = BranchId }))
                    .ExecuteStore();

                ret = db.getList<eOfficeEmployee>();
                errorModel.ErrorCode = 1;
                errorModel.ErrorMsg = "Success";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "EOfficeService.sp_get_user_branch_tree", UserName);
            }
            return ret;
        }
    }
}