using TimeCard.Helper;
using TimeCard.Models;
using TimeCard.Models.System;
using System;
using System.Collections.Generic;

namespace TimeCard.Services
{
    public class SystemService
    {
        private static SystemService currentService = null;
        public static SystemService Current
        {
            get
            {
                if (currentService == null)
                    currentService = new SystemService();
                return currentService;
            }
        }

        #region Setting 
 
        public SettingModel GetSetting(string Name, string UserName, out ErrorModel errorModel)
        {
            SettingModel ret = null;

            errorModel = new ErrorModel();
            try
            {
                DBHelper db = new DBHelper(GlobalInfo.PKG_TMS_SYSTEM + ".sp_get_setting", UserName)
                    .addParamOutput("oResult")
                    .addParam("pUserRequest", UserName)
                    .addParam("pJson", JsonHelper.Serialize(new { Name = Name }))
                    .ExecuteStore();

                ret = db.getFirst<SettingModel>();

                errorModel.ErrorCode = ret != null ? 1 : 0;
                errorModel.ErrorMsg = errorModel.ErrorCode == 1 ? "Success" : "fail";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "SystemService.GetSetting", UserName);
            }

            return ret;
        }
        #endregion

        #region Check in

        public ErrorModel Checkin(string userName, string ip, string dateCheckIn, string noteCheckin, out ErrorModel errorModel)
        {
            errorModel = new ErrorModel();
            try
            {
                DBHelper db = new DBHelper(GlobalInfo.PKG_TMS_CHECKINOUT + ".sp_checkin", userName)
                    .addParamOutput("oResult")
                    .addParam("pUserName", userName)
                    .addParam("pJson", JsonHelper.Serialize(new
                    {
                        UserName = userName,
                        IP = ip,
                        DateCheckIn = dateCheckIn,
                        NoteCheckIn = noteCheckin
                    }))
                    .ExecuteStore();

                errorModel = db.getFirst<ErrorModel>();
                errorModel.ErrorCode = 1;
                errorModel.ErrorMsg = "Success";                
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "SystemService.Checkin", userName);
            }

            return errorModel;
        }

        public List<HistoryCheckInModel> GetHistoryCheckInByUserName(string UserName, out ErrorModel errorModel)
        {
            List<HistoryCheckInModel> ret = null;
            errorModel = new ErrorModel();
            try
            {
                DBHelper db = new DBHelper(GlobalInfo.PKG_TMS_CHECKINOUT + ".sp_get_HistoryCheckin_By_UserName", UserName)
                    .addParamOutput("oResult")
                    .addParam("pUserRequest", UserName)
                    .addParam("pJson", JsonHelper.Serialize(new { UserName = UserName }))
                    .ExecuteStore();

                ret = db.getList<HistoryCheckInModel>();

                errorModel.ErrorCode = ret != null ? 1 : 0;
                errorModel.ErrorMsg = errorModel.ErrorCode == 1 ? "Success" : "fail";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "SystemService.sp_get_HistoryCheckin_By_UserName", UserName);
            }

            return ret;
        }

        public HistoryCheckInModel GetHistoryCheckInByHistoryId(int HistoryId, string UserName, out ErrorModel errorModel)
        {
            HistoryCheckInModel ret = null;
            errorModel = new ErrorModel();
            try
            {
                DBHelper db = new DBHelper(GlobalInfo.PKG_TMS_CHECKINOUT + ".sp_get_HistoryCheckin_By_HistoryId", UserName)
                    .addParamOutput("oResult")
                    .addParam("pUserRequest", UserName)
                    .addParam("pJson", JsonHelper.Serialize(new { HistoryId = HistoryId, UserName = UserName }))
                    .ExecuteStore();

                ret = db.getFirst<HistoryCheckInModel>();

                errorModel.ErrorCode = ret != null ? 1 : 0;
                errorModel.ErrorMsg = errorModel.ErrorCode == 1 ? "Success" : "fail";
            }
            catch (Exception ex)
            {
                errorModel.ErrorCode = -1;
                errorModel.ErrorMsg = ex.Message;
                errorModel.ErrorDetail = ex.ToString();
                LogHelper.Current.WriteLogs(ex.ToString(), "SystemService.sp_get_HistoryCheckin_By_HistoryId", UserName);
            }

            return ret;
        }

        public void CheckOut(string userName, string sDateCheckIn)
        {
            try
            {
                string sDateCheckOut = Crypt.Encrypt(DateTime.Now.ToString("ddMMyyyyHHmmss"));
                DBHelper db = new DBHelper(GlobalInfo.PKG_TMS_CHECKINOUT + ".sp_checkout", userName)
                    .addParamOutput("oResult")
                    .addParam("pUserName", userName)
                    .addParam("pJson", JsonHelper.Serialize(new { 
                        UserName = userName,
                        DateCheckIn = sDateCheckIn,
                        DateCheckOut = sDateCheckOut
                    }))
                    .ExecuteStore();
            }
            catch (Exception ex)
            {
                LogHelper.Current.WriteLogs(ex.ToString(), "SystemService.CheckOut", userName);
                throw new Exception(ex.ToString());
            }
        }

        public void EditNoteCheckInCheckOut(HistoryCheckInModel historyCheckInModel)
        {
            try
            {
                DBHelper db = new DBHelper(GlobalInfo.PKG_TMS_CHECKINOUT + ".sp_editNote_CheckInCheckOut", historyCheckInModel.UserName)
                    .addParamOutput("oResult")
                    .addParam("pUserName", historyCheckInModel.UserName)
                    .addParam("pJson", JsonHelper.Serialize(historyCheckInModel))
                    .ExecuteStore();
            }
            catch (Exception ex)
            {
                LogHelper.Current.WriteLogs(ex.ToString(), "SystemService.EditNoteCheckInCheckOut", historyCheckInModel.UserName);
                throw new Exception(ex.ToString());
            }
        }

        public void EditInformationCheckInOut(HistoryCheckInModel historyCheckInModel, string userName)
        {
            try
            {
                DBHelper db = new DBHelper(GlobalInfo.PKG_TMS_CHECKINOUT + ".sp_editInformation_CheckInOut", userName)
                    .addParamOutput("oResult")
                    .addParam("pUserName", userName)
                    .addParam("pJson", JsonHelper.Serialize(historyCheckInModel))
                    .ExecuteStore();
            }
            catch (Exception ex)
            {
                LogHelper.Current.WriteLogs(ex.ToString(), "SystemService.EditInformationCheckInOut", userName);
                throw new Exception(ex.ToString());
            }
        }


        #endregion
    }
}