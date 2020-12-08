using TimeCard.Models.eOffice;
using System.Collections.Generic;
using System.Linq;

namespace TimeCard.Security
{
    public class LoginProfile
    {
        /// <summary>
        /// Mã user id
        /// </summary>
        public int UserId { get; set; }
        /// <summary>
        /// User name
        /// </summary>
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Note { get; set; }
        public string UserType { get; set; }
        /// <summary>
        /// Get specialize branch is the first branch of list
        /// </summary>
        public eOfficeBranch SpecializeBranch 
        { 
            get
            {
                eOfficeBranch ret = null;
                if(BranchList != null) {
                    if(BranchList.Count == 1)
                    {
                        ret = BranchList[0];
                    }
                    else
                    {
                        var tmp = BranchList.Where(c => c.IsSpecialize == 1).ToList();
                        if (tmp != null && tmp.Count>0)
                        {
                            ret = tmp[0];
                        }
                    }
                }
                
                return ret; ;
            } 
        }
        public List<eOfficeBranch> BranchList { get; set; }
        private static bool ADValidate(string userId, string pwd)
        {
            bool ret = false;
            if (Authentication.ValidateUser(userId, pwd))
            {
                ret = true;
            }
            return ret;
        }
        public bool IsAdmin
        {
            get
            {
                return this.UserType == "ADMIN";
            }
        }
    }
}