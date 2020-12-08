using ECMOCB.CEWSI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.Text;
using System.Threading.Tasks;

namespace ECMOCB
{
    class WSIUtil
    {
        private static Localization localization;
        private static FNCEWS40PortTypeClient port;

        public static FNCEWS40PortTypeClient ConfigureBinding(String user, String domain, String password, String uri)
        {
            BindingElementCollection bec = new BindingElementCollection();

            // Everything gets treated as if it is username credentials until
            //  right at the point of serialization.
            TransportSecurityBindingElement sbe = SecurityBindingElement.CreateUserNameOverTransportBindingElement();
            sbe.IncludeTimestamp = false;
            bec.Add(sbe);

            if (uri.IndexOf("SOAP") != -1)
            {
                // using the SOAP endpoint
                TextMessageEncodingBindingElement tme = new TextMessageEncodingBindingElement();
                tme.MessageVersion = MessageVersion.Soap11;
                tme.ReaderQuotas.MaxDepth = 1024;
                tme.ReaderQuotas.MaxStringContentLength = 1024 * 1024;
                bec.Add(tme);
            }
            else
            {
                MtomMessageEncodingBindingElement mme = new MtomMessageEncodingBindingElement();
                mme.MessageVersion = MessageVersion.Soap12;
                mme.ReaderQuotas.MaxDepth = 1024;
                mme.ReaderQuotas.MaxStringContentLength = 1024 * 1024;
                mme.MaxBufferSize = 2147483647;
                bec.Add(mme);
            }

            HttpsTransportBindingElement tbe = new HttpsTransportBindingElement();
            tbe.MaxReceivedMessageSize = 2147483647;
            tbe.MaxBufferSize = 2147483647;
            bec.Add(tbe);

            CustomBinding binding = new CustomBinding(bec);
            binding.ReceiveTimeout = new TimeSpan(TimeSpan.TicksPerDay);    // 100 nanonsecond units, make it 1 day
            binding.SendTimeout = binding.ReceiveTimeout;

            EndpointAddress endpoint = new EndpointAddress(uri);

            port = new FNCEWS40PortTypeClient(binding, endpoint);

            port.ClientCredentials.UserName.UserName = user;
            port.ClientCredentials.UserName.Password = password;

            // set up the Localization header, minus the locale. We assume
            //  the timezone cannot change between calls, but that the locale
            //  may.
            localization = new Localization();
            localization.Timezone = GetTimezone();

            return port;
        }

        public static Localization GetLocalization()
        {
            return localization;
        }

        private static string GetTimezone()
        {
            System.TimeZone tz = System.TimeZone.CurrentTimeZone;
            System.TimeSpan tspan = tz.GetUtcOffset(System.DateTime.Now);

            // TimeZone.  Format should be '+|-HH:MM' (e.g., -07:00).
            String tzformat;
            if (tspan.Hours >= 0)
            {
                tzformat = String.Format("+{0}:{1}", tspan.Hours.ToString("D2"), tspan.Minutes.ToString("D2"));
            }
            else
            {
                tzformat = String.Format("{0}:{1}", tspan.Hours.ToString("D2"), tspan.Minutes.ToString("D2"));
            }
            return tzformat;
        }
    }
}
