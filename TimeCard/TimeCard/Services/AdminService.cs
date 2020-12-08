using TimeCard.Helper;
using TimeCard.Models;
using TimeCard.Models.Admin;
using TimeCard.Models.eOffice;
using TimeCard.Security;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Helpers;

namespace TimeCard.Services
{
    public partial class AdminService
    {
        public static AdminService current
        {
            get { return new AdminService(); }
        }

        #region Admin User service
        public List<AdminUser> AdminUserGet(string userRequest, out ErrorModel errorModel)
        {
            errorModel = new ErrorModel();
            List<AdminUser> ret = null;

            try
            {
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_get_user");

                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParamInt("p_data", null)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<AdminUser>(dt);

                errorModel.ErrorCode = ret != null ? 0 : 1;
                errorModel.ErrorMsg = errorModel.ErrorCode == 0 ? "Success" : "fail";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminUserGet", userRequest);
            }

            return ret;
        }

        public ErrorModel AdminUserSave(AdminUser user, string userRequest)
        {
            var ret = new ErrorModel();

            try
            {
                string json = JsonHelper.SerializeAll(user);
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_save_user");

                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParam("p_data", json)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<ErrorModel>(dt).SingleOrDefault();
            }
            catch (Exception ex)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = ex.Message;
                ret.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminUserSave", userRequest);
            }

            return ret;
        }

        public ErrorModel AdminUserStatus(AdminUser user, string userRequest)
        {
            var ret = new ErrorModel();

            try
            {
                string json = JsonHelper.SerializeAll(user);
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_change_status_user");

                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParam("p_data", json)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<ErrorModel>(dt).SingleOrDefault();
            }
            catch (Exception ex)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = ex.Message;
                ret.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminUserDelete", userRequest);
            }

            return ret;
        }

        public ErrorModel AdminRemoveUser(AdminUser user, string userRequest)
        {
            var ret = new ErrorModel();
            try
            {
                string json = JsonHelper.SerializeAll(user);
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_remove_user");

                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParam("p_data", json)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<ErrorModel>(dt).SingleOrDefault();
            }
            catch (Exception ex)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = ex.Message;
                ret.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminRemoveUser", userRequest);
            }

            return ret;
        }

        #endregion

        #region Admin Role service
        public List<AdminRole> AdminRoleGet(string userRequest, out ErrorModel errorModel)
        {
            errorModel = new ErrorModel();
            List<AdminRole> ret = null;

            try
            {
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_get_role");

                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParamInt("p_data", null)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<AdminRole>(dt);

                errorModel.ErrorCode = ret != null ? 0 : 1;
                errorModel.ErrorMsg = errorModel.ErrorCode == 0 ? "Success" : "fail";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminRoleGet", userRequest);
            }

            return ret;
        }

        public ErrorModel AdminRoleSave(AdminRole role, string userRequest)
        {
            var ret = new ErrorModel();

            try
            {
                string json = JsonHelper.SerializeAll(role);
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_save_role");

                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParam("p_data", json)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<ErrorModel>(dt).SingleOrDefault();
            }
            catch (Exception ex)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = ex.Message;
                ret.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminRoleSave", userRequest);
            }

            return ret;
        }

        public ErrorModel AdminRoleStatus(AdminRole role, string userRequest)
        {
            var ret = new ErrorModel();

            try
            {
                string json = JsonHelper.SerializeAll(role);
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_change_status_role");

                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParam("p_data", json)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<ErrorModel>(dt).SingleOrDefault();
            }
            catch (Exception ex)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = ex.Message;
                ret.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminRoleStatus", userRequest);
            }

            return ret;
        }
        #endregion

        #region Admin User Role service
        public List<AdminUserRole> AdminRoleGetUserByRole(string role, int? status, string userRequest, out ErrorModel errorModel)
        {
            errorModel = new ErrorModel();
            List<AdminUserRole> ret = null;

            try
            {
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_get_user_by_role");
                var it = new
                {
                    Role = role,
                    Status = status
                };
                string json = JsonHelper.SerializeAll(it);
                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParam("p_data", json)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<AdminUserRole>(dt);

                errorModel.ErrorCode = ret != null ? 0 : 1;
                errorModel.ErrorMsg = errorModel.ErrorCode == 0 ? "Success" : "fail";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminRoleGetUserByRole", userRequest);
            }

            return ret;
        }

        public ErrorModel AdminUserRoleSave(AdminUserRole user, string userRequest)
        {
            var ret = new ErrorModel();

            try
            {
                string json = JsonHelper.SerializeAll(user);
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_save_user_role");

                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParam("p_data", json)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<ErrorModel>(dt).SingleOrDefault();
            }
            catch (Exception ex)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = ex.Message;
                ret.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminUserSave", userRequest);
            }

            return ret;
        }

        public ErrorModel AdminUserRoleRemove(AdminUserRole user, string userRequest)
        {
            var ret = new ErrorModel();

            try
            {
                string json = JsonHelper.SerializeAll(user);
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_remove_user_role");

                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParam("p_data", json)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<ErrorModel>(dt).SingleOrDefault();
            }
            catch (Exception ex)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = ex.Message;
                ret.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.sp_remove_user_role", userRequest);
            }

            return ret;
        }

        public ErrorModel AdminUserRoleStatus(AdminUserRole user, string userRequest)
        {
            var ret = new ErrorModel();

            try
            {
                string json = JsonHelper.SerializeAll(user);
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_change_status_user_role");

                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParam("p_data", json)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<ErrorModel>(dt).SingleOrDefault();
            }
            catch (Exception ex)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = ex.Message;
                ret.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminUserRoleStatus", userRequest);
            }

            return ret;
        }
        #endregion

        #region Admin Employee service
        public List<eOfficeEmployee> AdminEmployeeGet(int? branchId, string titleCode, int? status, string userRequest, out ErrorModel errorModel)
        {
            errorModel = new ErrorModel();
            List<eOfficeEmployee> ret = null;

            try
            {
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_get_employee");
                var it = new
                {
                    BranchId = branchId,
                    TitleCode = titleCode,
                    Status = status
                };
                string json = JsonHelper.SerializeAll(it);
                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("pUserRequest", userRequest)
                    .addParam("pJson", json)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<eOfficeEmployee>(dt);

                errorModel.ErrorCode = ret != null ? 0 : 1;
                errorModel.ErrorMsg = errorModel.ErrorCode == 0 ? "Success" : "fail";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminEmployeeGet", userRequest);
            }

            return ret;
        }

        public ErrorModel AdminEmployeeSave(Employee_update obj, string userRequest, out ErrorModel errorModel)
        {
            errorModel = new ErrorModel();
            ErrorModel ret = null;

            try
            {
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS_SYSTEM, "sp_save_employee");
                string json = JsonHelper.SerializeAll(obj);
                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("pUserRequest", userRequest)
                    .addParam("pJson", json)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = ret = DataUtils.ConvertDataList<ErrorModel>(dt).SingleOrDefault();

                errorModel.ErrorCode = ret != null ? 0 : 1;
                errorModel.ErrorMsg = errorModel.ErrorCode == 0 ? "Success" : "fail";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminEmployeeSave", userRequest);
            }

            return ret;
        }
        #endregion

        #region Admin Branch

        public eOfficeBranch AdminBranchGetById(string userRequest, int BranchId, out ErrorModel errorModel)
        {
            errorModel = new ErrorModel();
            eOfficeBranch ret = null;

            try
            {
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS, "sp_get_branch_by_id");
                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .addParam("pJson", JsonHelper.Serialize(new {
                        BranchId = BranchId
                    }))
                    .ExecuteStore();

                ret = db.getFirst<eOfficeBranch>();

                errorModel.ErrorCode = 1;
                errorModel.ErrorMsg = "Success";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminBranchGetAll", userRequest);
            }

            return ret;
        }
        public List<eOfficeBranch> AdminBranchGetAll(string userRequest, out ErrorModel errorModel)
        {
            errorModel = new ErrorModel();
            List<eOfficeBranch> ret = null;

            try
            {
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS, "sp_get_all_branch");
                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("p_user_name", userRequest)
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<eOfficeBranch>(dt);

                errorModel.ErrorCode = 1;
                errorModel.ErrorMsg = "Success";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminBranchGetAll", userRequest);
            }

            return ret;
        }

        public List<eOfficeBranch> AdminSaveBranch(List<eOfficeBranch> listBranch, string userRequest, out ErrorModel errorModel)
        {
            List<eOfficeBranch> ret = null;
            errorModel = new ErrorModel();
            try
            {
                DBHelper db = new DBHelper(GlobalInfo.PKG_TMS_SYSTEM + ".sp_save_branch", userRequest)
                    .addParamOutput("oResult")
                    .addParam("pUserName", userRequest)
                    .addParam("pJson", JsonHelper.Serialize(listBranch))
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
            }
            return ret;
        }
        #endregion

        #region Admin Title
        public List<eOfficeTitle> AdminTitleGetAll(string userRequest, out ErrorModel errorModel)
        {
            errorModel = new ErrorModel();
            List<eOfficeTitle> ret = null;

            try
            {
                string stn = string.Format("{0}.{1}", GlobalInfo.PKG_TMS, "sp_get_title");
                DBHelper db = new DBHelper(stn, userRequest)
                    .addParamOutput("oResult")
                    .addParam("pUserRequest", userRequest)
                    .addParam("pJson")
                    .ExecuteStore();

                DataTable dt = db.getDataTable();
                ret = DataUtils.ConvertDataList<eOfficeTitle>(dt);

                errorModel.ErrorCode = ret != null ? 0 : 1;
                errorModel.ErrorMsg = errorModel.ErrorCode == 0 ? "Success" : "fail";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "AdminService.AdminTitleGetAll", userRequest);
            }

            return ret;
        }
        #endregion

    }
}