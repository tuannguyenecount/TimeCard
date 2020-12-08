using TimeCard.Helper;
using System.Configuration;
using System.DirectoryServices.AccountManagement;
using System.Web.Security;

namespace TimeCard.Security
{
    public class Authentication
    {
        public static bool ValidateUser(string username, string password)
        {
            string val = ConfigurationManager.AppSettings["ByPassDomain"];
            LoginProfile loggedProfile = new LoginProfile
            {
                UserName = username
            };
            SharedContext.Current.LoggedProfile = loggedProfile;
            if ("1".Equals(val)) return true;
            string domain = Utils.GetDomain();
            var pc = new PrincipalContext(ContextType.Domain, domain);

            return pc.ValidateCredentials(username, password, ContextOptions.Negotiate);
        }
        public static void SignOn(string username)
        {
            FormsAuthentication.SetAuthCookie(username, true);
        }
        public static void SignOut()
        {
            FormsAuthentication.SignOut();
        }
    }
}