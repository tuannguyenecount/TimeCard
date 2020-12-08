using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECMOCB.Models
{
    public class IdmObjectType
    {
        // values
        public static readonly int idmObjTypeMultipleValues = 1066;
        public static readonly int idmObjTypeObjectSet = 14;
        public static readonly int idmObjTypePropertyDescriptions = 1142;
        public static readonly int idmObjTypeAccessPermission = 2012;
        public static readonly int idmObjTypePermissionDescription = 1177;
        public static readonly int idmObjTypeClassDescription = 25;
        public static readonly int idmObjTypePropertyDescription = 24;
        public static readonly int idmObjTypeObjectStore = 4;
        public static readonly int idmObjTypeDocument = 1;
        public static readonly int idmObjTypeFolder = 2;
        public static readonly int idmObjTypeVersionSeries = 1140;
        public static readonly int idmObjTypeReferentialContainmentRelationship = 1124;
        public static readonly int idmObjTypeContentTransfer = 1038;
        public static readonly int idmObjTypeContentReference = 1035;
        public static readonly int idmObjTypeCustomObject = 15;
        public static readonly int idmObjTypeTransient = 1137;
        public static readonly int idmObjTypeClassDefinition = 1027;
        public static readonly int idmObjTypePropertyTemplate = 1055;
        public static readonly int idmObjTypePropertyDefinition = 1077;
        public static readonly int idmObjTypeLocalizedString = 1075;
        public static readonly int idmObjTypeTableDefinition = 1135;
        public static readonly int idmObjTypeColumnDefinition = 1028;
        public static readonly int idmObjTypeChoiceList = 1026;
        public static readonly int idmObjTypeChoice = 1025;
        public static readonly int idmObjTypeDynamicReferentialContainmentRelationship = 1050;
        public static readonly int idmObjTypeStoragePolicy = 1037;
        public static readonly int idmObjTypeAnnotation = 3;
        public static readonly int idmObjTypeEventAction = 1143;
        public static readonly int idmObjTypeSubscription = 1144;
        public static readonly int idmObjTypeDocumentLifecyclePolicy = 1148;
        public static readonly int idmObjTypeDocumentState = 1152;
        public static readonly int idmObjTypeDocumentLifecycleAction = 1154;
        public static readonly int idmObjTypeLink = 1156;
        public static readonly int idmObjTypeWorkflowDefinition = 1160;
        public static readonly int idmObjTypeDocumentClassificationAction = 1161;
        public static readonly int idmObjTypeXMLPropertyMappingScript = 1162;
        public static readonly int idmObjTypeInstanceSubscription = 1165;
        public static readonly int idmObjTypeClassSubscription = 1166;
        public static readonly int idmObjTypeSecurityPolicy = 1170;
        public static readonly int idmObjTypeSecurityTemplate = 1175;
        public static readonly int idmObjTypeUser = 2000;
        public static readonly int idmObjTypeGroup = 2001;
        public static readonly int idmObjTypeReadOnlyObjectSet = 2002;
        public static readonly int idmObjTypeComputer = 2003;
        public static readonly int idmObjTypeEntireNetwork = 2004;
        public static readonly int idmObjTypeDomain = 2005;
        public static readonly int idmObjTypeRealm = 2006;
        public static readonly int idmObjTypeObjectStoreService = 2007;
        public static readonly int idmObjTypeFileStore = 2008;
        public static readonly int idmObjTypeCbrEngineType = 2009;
        public static readonly int idmObjTypeContentManagerService = 2010;
        public static readonly int idmObjTypeContentCacheService = 2011;
        public static readonly int idmObjTypePermission = 2012;
        public static readonly int idmObjTypeAny = 0;

        /////////////////////////////////////////////////////////////
        //
        //	Get property value in string format
        //
        /////////////////////////////////////////////////////////////
        public static string getPropertyValue(CEWSI.PropertyType objProp)
        {
            if (objProp == null)
                return "null";

            string strValue = "";
            Type objType = objProp.GetType();

            if (objType == typeof(CEWSI.SingletonString))
            {
                strValue = (string)((CEWSI.SingletonString)objProp).Value;
            }
            else
                if (objType == typeof(CEWSI.SingletonBoolean))
            {
                strValue = (string)((CEWSI.SingletonBoolean)objProp).Value.ToString();
            }
            else
                if (objType == typeof(CEWSI.SingletonDateTime))
            {
                strValue = (string)((CEWSI.SingletonDateTime)objProp).Value.ToString();
            }
            else
                if (objType == typeof(CEWSI.SingletonFloat64))
            {
                strValue = (string)((CEWSI.SingletonFloat64)objProp).Value.ToString();
            }
            else
                if (objType == typeof(CEWSI.SingletonId))
            {
                strValue = (string)((CEWSI.SingletonId)objProp).Value;
            }
            else
                if (objType == typeof(CEWSI.SingletonInteger32))
            {
                strValue = (string)((CEWSI.SingletonInteger32)objProp).Value.ToString();
            }
            else
                if (objType == typeof(CEWSI.SingletonObject))
            {
                CEWSI.SingletonObject objSO = (CEWSI.SingletonObject)objProp;

                if (objSO.Value == null)
                {
                    strValue = "null";
                }
                else
                {
                    try
                    {
                        CEWSI.ObjectReference objRef = (CEWSI.ObjectReference)objSO.Value;
                        strValue = (string)(objRef.objectId);
                    }
                    catch (System.Exception)
                    {
                        strValue = "Unevaluated";
                    }
                }
            }
            else
                if (objType == typeof(CEWSI.EnumOfObject))
            {
                StringBuilder buffer = new StringBuilder();
                CEWSI.EnumOfObject objEnum = (CEWSI.EnumOfObject)objProp;
                if ((CEWSI.ObjectValue[])objEnum.Value != null)
                {
                    buffer.Append("\r\n");
                    foreach (CEWSI.ObjectValue obj in (CEWSI.ObjectValue[])objEnum.Value)
                    {
                        buffer.Append("          " + obj.objectId + "\r\n");
                    }
                }
                strValue = buffer.ToString();

            }
            else
                if (objType == typeof(CEWSI.ListOfString))
            {
                if (((CEWSI.ListOfString)objProp).Value != null)
                {
                    StringBuilder buffer = new StringBuilder();
                    foreach (string str in (string[])((CEWSI.ListOfString)objProp).Value)
                    {
                        buffer.Append(str + ",");
                    }
                    strValue = buffer.ToString();
                }
            }
            else
                if (objType == typeof(CEWSI.ListOfObject))
            {
                CEWSI.ListOfObject objList = (CEWSI.ListOfObject)objProp;
                if (objProp.propertyId == "ContentElements")
                {
                    strValue = ("ContentElements");
                }
                else
                {
                    if (objList != null)
                    {
                        StringBuilder buffer = new StringBuilder();
                        foreach (CEWSI.DependentObjectType obj in (CEWSI.DependentObjectType[])((CEWSI.ListOfObject)objList).Value)
                        {
                            buffer.Append(obj.classId + ", ");
                        }
                        strValue = buffer.ToString();
                    }
                }
            }
            else
            {
                strValue = (string)objProp.ToString();
            }

            //buffer.Append((objRet == null) ? "null" : objRet.ToString());

            return strValue;
        }
    }
}
