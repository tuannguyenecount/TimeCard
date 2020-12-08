using ECMOCB.CEWSI;
using ECMOCB.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace ECMOCB
{
    public class ECMService
    {
        public static EcmResult CreateDoc(DocumentModel doc)
        {
            EcmResult ret = new EcmResult();

            //string mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            bool isCheckin = false;
            if (doc.IsUseCert == 1)
                Addcert(doc.EcmUrl);

            CEWSI.FNCEWS40PortTypeClient objBinding = WSIUtil.ConfigureBinding(doc.EcmUser, doc.EcmDomain, doc.EcmPassword, doc.EcmUrl);

            CEWSI.CreateAction createVerb = new CEWSI.CreateAction();
            createVerb.classId = doc.DocumentClass;

            CEWSI.CheckinAction checkinVerb = new CEWSI.CheckinAction();
            if (isCheckin)
            {
                checkinVerb.checkinMinorVersion = true;
                checkinVerb.checkinMinorVersionSpecified = true;
            }

            CEWSI.ChangeRequestType objChange = new CEWSI.ChangeRequestType();
            objChange.Action = new CEWSI.ActionType[2];
            objChange.Action[0] = (CEWSI.ActionType)createVerb;
            objChange.Action[1] = (CEWSI.ActionType)checkinVerb;

            objChange.TargetSpecification = new CEWSI.ObjectReference();
            objChange.TargetSpecification.classId = "ObjectStore";
            objChange.TargetSpecification.objectId = doc.ObjectStore;
            objChange.id = "1";

            int propLength = doc.Properties != null && doc.Properties.Count > 0 ? doc.Properties.Count + 1 : 1;
            CEWSI.ModifiablePropertyType[] objInputProps = new CEWSI.ModifiablePropertyType[propLength];

            #region properties have the must
            CEWSI.PropertyType[] ctProps = new CEWSI.PropertyType[3];

            CEWSI.SingletonString typeProp = new CEWSI.SingletonString();
            typeProp.propertyId = "ContentType";
            typeProp.Value = doc.MimeTypeSource;
            ctProps[0] = typeProp;

            CEWSI.DependentObjectType ct = new CEWSI.DependentObjectType();
            ct.dependentAction = CEWSI.DependentObjectTypeDependentAction.Insert;
            ct.dependentActionSpecified = true;

            CEWSI.SingletonString nameProp = new CEWSI.SingletonString();
            nameProp.propertyId = "RetrievalName";
            nameProp.Value = doc.FileName;
            ctProps[1] = nameProp;

            CEWSI.ContentData contData = new CEWSI.ContentData();
            contData.propertyId = "Content";

            CEWSI.InlineContent ic = new CEWSI.InlineContent();
            ic.Binary = doc.BinaryFile;

            contData.Value = ic;
            ctProps[2] = contData;

            ct.classId = "ContentTransfer";

            //	create content object list
            ct.Property = ctProps;
            CEWSI.DependentObjectType[] contentObjects = new CEWSI.DependentObjectType[1];
            contentObjects[0] = ct;

            //	Create the content element list and set it into the document's properties
            CEWSI.ListOfObject objContentList = new CEWSI.ListOfObject();
            objContentList.propertyId = "ContentElements";
            objContentList.Value = contentObjects;
            objInputProps[0] = objContentList;
            #endregion

            if (doc.Properties != null && doc.Properties.Count > 0)
            {
                int i = 1;
                foreach (var p in doc.Properties)
                {
                    CEWSI.SingletonString objProp = new CEWSI.SingletonString();
                    objProp.propertyId = p.Key;
                    objProp.Value = p.Value;
                    objInputProps[i++] = objProp;
                }
            }

            objChange.ActionProperties = objInputProps;

            // Send off the request
            CEWSI.ChangeResponseType[] objResponseArray = null;
            CEWSI.ExecuteChangesRequest objRequest = new CEWSI.ExecuteChangesRequest();
            objRequest.refresh = true;
            objRequest.refreshSpecified = true;
            objRequest.ChangeRequest = new CEWSI.ChangeRequestType[1];
            objRequest.ChangeRequest[0] = objChange;
            try
            {
                objResponseArray = objBinding.ExecuteChanges(WSIUtil.GetLocalization(), objRequest);
            }
            catch (System.Net.WebException ex)
            {
                //Console.WriteLine("An exception occurred while creating a document: [" + ex.Message + "]");
                ret.ErrorCode = -1;
                ret.ErrorMsg = ex.ToString();
                return ret;
            }
            catch (Exception allEx)
            {
                //Console.WriteLine("An exception occurred: [" + allEx.Message + "]");
                ret.ErrorCode = -1;
                ret.ErrorMsg = allEx.ToString();
                return ret;
            }

            // Created a document!  Sanity check the results
            string strObjectId = "";
            bool bFound = false;

            if (objResponseArray == null || objResponseArray.Length < 1)
            {
                ret.ErrorCode = 0;
                ret.ErrorMsg = "The change request was executed, but a valid object was not returned";
                return ret;
            }
            CEWSI.ChangeResponseType objResponse = objResponseArray[0];
            foreach (CEWSI.PropertyType objProp in objResponse.Property)
            {
                if (objProp.propertyId.CompareTo("Id") == 0)
                {
                    strObjectId = IdmObjectType.getPropertyValue(objProp);
                    bFound = true;
                    break;
                }
            }
            if (!bFound)
            {
                ret.ErrorCode = 0;
                ret.ErrorMsg = "The document was created, but the results do not contain a document ID";
                return ret;
            }

            //Console.WriteLine("Successfully created a document!  ID = [" + strObjectId + "].  Now filing.");

            ret = FileDoc(new EcmInfo
            {
                DocId = strObjectId,
                DocClass = doc.DocumentClass,
                DocTitle = doc.FileName,
                FolderPath = doc.DestinationFolder,
                ObjectStore = doc.ObjectStore,
                User = doc.EcmUser,
                Domain = doc.EcmDomain,
                Password = doc.EcmPassword,
                Url = doc.EcmUrl
            });
            ret.DocId = strObjectId;
            ret.FileName = doc.FileName;
            ret.Mime = doc.MimeTypeSource;

            return ret;
        }

        public static byte[] getSouceFileContent(string strSource)
        {
            byte[] binaryData;
            try
            {
                System.IO.FileStream inFile = new System.IO.FileStream(strSource,
                    System.IO.FileMode.Open,
                    System.IO.FileAccess.Read);
                binaryData = new Byte[inFile.Length];
                long bytesRead = inFile.Read(binaryData, 0, (int)inFile.Length);
                inFile.Close();
            }
            catch (System.Exception exp)
            {
                throw new System.Exception(exp.Message, exp);
            }
            return binaryData;
        }

        private static EcmResult FileDoc(EcmInfo info)
        {
            EcmResult ret = new EcmResult();
            // Create a Create verb, populate it to create a new RCR
            CEWSI.CreateAction createVerb = new CEWSI.CreateAction();
            createVerb.autoUniqueContainmentName = true;
            createVerb.autoUniqueContainmentNameSpecified = true;
            createVerb.classId = "DynamicReferentialContainmentRelationship";

            CEWSI.ChangeRequestType objChange = new CEWSI.ChangeRequestType();
            objChange.Action = new CEWSI.ActionType[1];
            objChange.Action[0] = (CEWSI.ActionType)createVerb;
            objChange.TargetSpecification = new CEWSI.ObjectReference();
            objChange.TargetSpecification.classId = "ObjectStore";
            objChange.TargetSpecification.objectId = info.ObjectStore;
            objChange.id = "1";

            // Create the properties of the new RCR
            CEWSI.ObjectReference objHeadRef = new CEWSI.ObjectReference();
            objHeadRef.classId = info.DocClass;
            objHeadRef.objectId = info.DocId;
            objHeadRef.objectStore = info.ObjectStore;
            CEWSI.SingletonObject propHead = new CEWSI.SingletonObject();
            propHead.propertyId = "Head";
            propHead.Value = (CEWSI.ObjectEntryType)objHeadRef;

            CEWSI.ObjectReference objTailRef = new CEWSI.ObjectReference();
            objTailRef.classId = "Folder";
            objTailRef.objectId = info.FolderPath;
            objTailRef.objectStore = info.ObjectStore;
            CEWSI.SingletonObject propTail = new CEWSI.SingletonObject();
            propTail.propertyId = "Tail";
            propTail.Value = (CEWSI.ObjectEntryType)objTailRef;

            CEWSI.SingletonString propContainmentName = new CEWSI.SingletonString();
            propContainmentName.propertyId = "ContainmentName";
            propContainmentName.Value = info.DocTitle;

            CEWSI.ModifiablePropertyType[] objProps = new CEWSI.ModifiablePropertyType[3];
            objProps[0] = propTail;
            objProps[1] = propHead;
            objProps[2] = propContainmentName;
            objChange.ActionProperties = objProps;

            // Fill in the security headers...
            CEWSI.FNCEWS40PortTypeClient objBinding = WSIUtil.ConfigureBinding(info.User, info.Domain, info.Password, info.Url);

            // Send off the request
            CEWSI.ChangeResponseType[] objResponseArray = null;
            CEWSI.ExecuteChangesRequest objRequest = new CEWSI.ExecuteChangesRequest();
            objRequest.refresh = false;
            objRequest.refreshSpecified = true;
            objRequest.ChangeRequest = new CEWSI.ChangeRequestType[1];
            objRequest.ChangeRequest[0] = objChange;
            try
            {
                objResponseArray = objBinding.ExecuteChanges(WSIUtil.GetLocalization(), objRequest);
            }
            catch (System.Net.WebException ex)
            {
                //Console.WriteLine("An exception occurred while filing a document: [" + ex.Message + "]");
                //Console.ReadLine();
                ret.ErrorCode = -1;
                ret.ErrorMsg = ex.ToString();
                return ret;
            }
            //catch (Exception allEx)
            //{
            //    //Console.WriteLine("An exception occurred: [" + allEx.Message + "]");
            //    //Console.ReadLine();
            //    return false;
            //}

            //Console.WriteLine("Successfully filed a document!");
            //Console.ReadLine();
            ret.ErrorCode = 1;
            ret.ErrorMsg = "Successfully filed a document!";
            return ret;
        }

        [Obsolete]
        private static void Addcert(string url)
        {
            //Do webrequest to get info on secure site
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.AllowAutoRedirect = false;
            System.Net.ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            response.Close();
            X509Certificate cert = request.ServicePoint.Certificate;
            X509Certificate2 cert2 = new X509Certificate2(cert);
            string CertIssuer = cert2.GetIssuerName();
            //open client cert to read and check exist
            X509Store store = new X509Store(StoreName.Root, StoreLocation.LocalMachine);
            store.Open(OpenFlags.ReadOnly);
            var certificates = store.Certificates.Find(X509FindType.FindByIssuerName, CertIssuer, false);
            if (certificates != null && certificates.Count > 0)
            {
                Console.WriteLine("Certificate already exists");
                return;
            }
            else
            {
                //add cert to client
                //store.Open(OpenFlags.ReadWrite);
                //store.Add(cert2);
                //store.Close();
            }
        }

        public static bool Deletedoc(DocumentModel doc, string docId, int taskId, string userName)
        {

            EcmResult ret = new EcmResult();

            //string mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            //bool isCheckin = false;
            if (doc.IsUseCert == 1)
                Addcert(doc.EcmUrl);

            CEWSI.FNCEWS40PortTypeClient objBinding = WSIUtil.ConfigureBinding(doc.EcmUser, doc.EcmDomain, doc.EcmPassword, doc.EcmUrl);

            CEWSI.ObjectStoreScope objObjectStoreScope = new CEWSI.ObjectStoreScope();
            objObjectStoreScope.objectStore = doc.ObjectStore;

            // Create RepositorySearch
            CEWSI.RepositorySearch objRepositorySearch = new CEWSI.RepositorySearch();
            objRepositorySearch.repositorySearchMode = CEWSI.RepositorySearchModeType.Rows;
            objRepositorySearch.repositorySearchModeSpecified = true;
            objRepositorySearch.SearchScope = objObjectStoreScope;

            objRepositorySearch.SearchSQL = "SELECT [DocumentTitle],[Id],[DateLastModified],bpmCodeLarge FROM " + doc.DocumentClass + " WHERE Id='" + docId + "' AND bpmCode='" + taskId.ToString() + "' AND NguoiTao='" + userName + "' ORDER BY [DateLastModified]";


            // Invoke the ExecuteSearch operation
            CEWSI.ObjectSetType objObjectSet = objBinding.ExecuteSearch(WSIUtil.GetLocalization(), objRepositorySearch);

            // Display the Document Titles
            int hitCount = (objObjectSet.Object == null) ? 0 : objObjectSet.Object.Length;

            if (hitCount == 0)
            {
                return true;
            }

            CEWSI.DeleteAction docUnfile = new CEWSI.DeleteAction();

            // Assign the action to the ChangeRequestType element
            CEWSI.ChangeRequestType[] objChangeRequestTypeArray = new CEWSI.ChangeRequestType[1];
            CEWSI.ChangeRequestType objChangeRequestType = new CEWSI.ChangeRequestType();
            objChangeRequestTypeArray[0] = objChangeRequestType;

            // Create ChangeResponseType element array
            CEWSI.ChangeResponseType[] objChangeResponseTypeArray;

            // Build ExecuteChangesRequest element and assign ChangeRequestType element array to it
            CEWSI.ExecuteChangesRequest objExecuteChangesRequest = new CEWSI.ExecuteChangesRequest();
            objExecuteChangesRequest.ChangeRequest = objChangeRequestTypeArray;
            objExecuteChangesRequest.refresh = true; // return a refreshed object
            objExecuteChangesRequest.refreshSpecified = true;

            objChangeRequestType.Action = new CEWSI.ActionType[1];
            objChangeRequestType.Action[0] = (CEWSI.ActionType)docUnfile;

            // Specify the target object (Reservation object) for the actions
            objChangeRequestType.TargetSpecification = new CEWSI.ObjectReference();
            objChangeRequestType.TargetSpecification.classId = doc.DocumentClass;
            objChangeRequestType.TargetSpecification.objectId = docId;
            objChangeRequestType.TargetSpecification.objectStore = doc.ObjectStore;
            objChangeRequestType.id = "1";

            // Assign ChangeRequestType element
            objChangeRequestTypeArray[0] = objChangeRequestType;

            // Build ExecuteChangesRequest element and assign ChangeRequestType element array to it
            objExecuteChangesRequest.ChangeRequest = objChangeRequestTypeArray;
            objExecuteChangesRequest.refresh = true; // return a refreshed object
            objExecuteChangesRequest.refreshSpecified = true;

            try
            {
                // Call ExecuteChanges operation to implement the Delete object
                objChangeResponseTypeArray = objBinding.ExecuteChanges(WSIUtil.GetLocalization(), objExecuteChangesRequest);
            }
            catch (System.Net.WebException ex)
            {
                Console.WriteLine("An exception occurred while checking out a document: [" + ex.Message + "]");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine("An exception : [" + ex.Message + "]");
                return false;
            }

            // The new document object will be returned, unless there is an error
            if (objChangeResponseTypeArray == null || objChangeResponseTypeArray.Length < 1)
            {
                Console.WriteLine("A valid object was not returned from the ExecuteChanges operation");
                return false;
            }

            return true;
        }

        public static EcmResult CreateFolder(DocumentModel doc, string folderName, string parentFolder, string folderClass)
        {
            EcmResult ret = new EcmResult();
            if (doc.IsUseCert == 1)
                Addcert(doc.EcmUrl);

            CEWSI.ChangeRequestType objChange = new CEWSI.ChangeRequestType();
            CEWSI.CreateAction createVerb = new CEWSI.CreateAction();
            createVerb.classId = folderClass;
            objChange.Action = new CEWSI.ActionType[1];
            objChange.Action[0] = (CEWSI.ActionType)createVerb;
            objChange.TargetSpecification = new CEWSI.ObjectReference();
            objChange.TargetSpecification.classId = "ObjectStore";
            objChange.TargetSpecification.objectId = doc.ObjectStore;
            objChange.id = "1";

            CEWSI.ModifiablePropertyType[] objInputProps = new CEWSI.ModifiablePropertyType[2];
            objChange.ActionProperties = objInputProps;

            // Build a list of properties to set in the new folder (just the folder name and parent for now)
            //    -Folder name property
            CEWSI.SingletonString objString = new CEWSI.SingletonString();
            objString.Value = folderName;
            objString.propertyId = "FolderName";
            objInputProps[0] = objString;

            //    -Parent property
            CEWSI.ObjectSpecification objSpec = new CEWSI.ObjectSpecification();
            CEWSI.SingletonObject objObject = new CEWSI.SingletonObject();
            objSpec.classId = "Folder";
            objSpec.path = parentFolder;
            objSpec.objectStore = doc.ObjectStore;
            objObject.propertyId = "Parent";
            objObject.Value = (CEWSI.ObjectEntryType)objSpec;
            objInputProps[1] = objObject;

            // Fill in the security headers...
            CEWSI.FNCEWS40PortTypeClient objBinding = WSIUtil.ConfigureBinding(doc.EcmUser, doc.EcmDomain, doc.EcmPassword, doc.EcmUrl);

            // Send off the request
            CEWSI.ChangeResponseType[] objResponseArray = null;
            CEWSI.ExecuteChangesRequest objRequest = new CEWSI.ExecuteChangesRequest();
            objRequest.refresh = true;
            objRequest.refreshSpecified = true;
            objRequest.ChangeRequest = new CEWSI.ChangeRequestType[1];
            objRequest.ChangeRequest[0] = objChange;
            try
            {
                objResponseArray = objBinding.ExecuteChanges(WSIUtil.GetLocalization(), objRequest);
            }
            catch (System.Net.WebException ex)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = ex.ToString();
                return ret;
            }
            catch (Exception allEx)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = allEx.ToString();
                return ret;
            }

            // Created a folder!  Sanity check the results
            string strObjectId = "";
            bool bFound = false;

            if (objResponseArray == null || objResponseArray.Length < 1)
            {
                ret.ErrorCode = 0;
                ret.ErrorMsg = "The change request was executed, but a valid object was not returned";
                return ret;
            }
            CEWSI.ChangeResponseType objResponse = objResponseArray[0];
            foreach (CEWSI.PropertyType objProp in objResponse.Property)
            {
                if (objProp.propertyId.CompareTo("Id") == 0)
                {
                    strObjectId = IdmObjectType.getPropertyValue(objProp);
                    bFound = true;
                    break;
                }
            }
            if (!bFound)
            {
                ret.ErrorCode = 0;
                ret.ErrorMsg = "The folder was created, but the results do not contain a folder ID";
                return ret;
            }
            ret.ErrorCode = 1;
            ret.ErrorMsg = "Successfully created a folder";
            ret.DocId = strObjectId;
            return ret;
        }

        public static EcmQueryResult QueryDocument(DocumentModel doc, string query, int maxRow = 100)
        {
            EcmQueryResult ret = new EcmQueryResult();
            CEWSI.ObjectSetType objResponse = null;

            // Perform the requested query
            try
            {
                if (doc.IsUseCert == 1)
                    Addcert(doc.EcmUrl);
                // Set up a connection to the web service.
                // Fill in the security headers...
                CEWSI.FNCEWS40PortTypeClient objBinding = WSIUtil.ConfigureBinding(doc.EcmUser, doc.EcmDomain, doc.EcmPassword, doc.EcmUrl);

                // Create a search object
                // Set up the scope for the query
                // Set up the SQL for the search
                CEWSI.RepositorySearch objSearch = new CEWSI.RepositorySearch();
                CEWSI.ObjectStoreScope objSearchScope = new CEWSI.ObjectStoreScope();
                objSearchScope.objectStore = doc.ObjectStore;
                objSearch.SearchScope = objSearchScope;
                objSearch.SearchSQL = query;
                objSearch.maxElements = maxRow;
                objSearch.maxElementsSpecified = true;

                // Execute the search
                objResponse = objBinding.ExecuteSearch(WSIUtil.GetLocalization(), objSearch);
            }
            catch (System.Net.WebException ex)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = "An exception occurred while querying: [" + ex.Message + "]\n" + ex.ToString();
                return ret;
            }
            catch (Exception allEx)
            {
                ret.ErrorCode = -1;
                ret.ErrorMsg = "An exception occurred: [" + allEx.Message + "]\n" + allEx.ToString();
                return ret;
            }

            // Sanity check the results data
            long lColumnCount = 0;
            long lRowCount = 0;
            long i;
            if (objResponse == null || objResponse.Object == null)
            {
                ret.ErrorCode = 1;
                ret.ErrorMsg = "The query completed successfully but the results were null";
                return ret;
            }
            if (objResponse.Object.Length < 1)
            {
                ret.ErrorCode = 1;
                ret.ErrorMsg = "No results were found for this query - exiting";
                return ret;
            }
            lColumnCount = objResponse.Object[0].Property.Length;
            if (lColumnCount < 1)
            {
                ret.ErrorCode = 1;
                ret.ErrorMsg = "The query succeeded, but the results contain no properties - exiting";
                return ret;
            }
            /*
			if( lColumnCount > 12 )
			{
				MessageBox.Show("The result set has more than 12 columns.  Only the first 12 columns will be displayed");
				lColumnCount = 12;
			}
			*/

            // Query was successful; display a list of result rows
            // First create a data table that has one column for each property in the 
            //  returned data
            System.Data.DataColumn dtCol;
            System.Data.DataRow dtRow;
            CEWSI.PropertyType prop;

            CEWSI.ObjectValue[] objObjects = objResponse.Object;
            lRowCount = objObjects.Length;
            System.Data.DataTable dtblResults = new System.Data.DataTable("Results");
            for (i = 0; i < lColumnCount; i++)
            {
                dtCol = new System.Data.DataColumn(objObjects[0].Property[i].propertyId);
                dtCol.DataType = System.Type.GetType("System.String");
                dtCol.DefaultValue = "";
                dtblResults.Columns.Add(dtCol);
            }

            // Populate the rows
            for (i = 0; i < lRowCount; i++)
            {
                dtRow = dtblResults.NewRow();
                for (long iCol = 0; iCol < lColumnCount; iCol++)
                {
                    prop = objObjects[i].Property[iCol];
                    dtRow[prop.propertyId] = IdmObjectType.getPropertyValue(prop);
                }
                dtblResults.Rows.Add(dtRow);
            }
            ret.Result = dtblResults;
            ret.ErrorCode = 1;
            ret.ErrorMsg = "Success";
            return ret;
        }

   //     public static EcmQueryResult QueryFolder(DocumentModel doc, string query, int maxRow = 100)
   //     {
   //         EcmQueryResult ret = new EcmQueryResult();
   //         CEWSI.ObjectSetType objResponse = null;

   //         // Perform the requested query
   //         try
   //         {
   //             if (doc.IsUseCert == 1)
   //                 Addcert(doc.EcmUrl);
   //             // Set up a connection to the web service.
   //             // Fill in the security headers...
   //             CEWSI.FNCEWS40PortTypeClient objBinding = WSIUtil.ConfigureBinding(doc.EcmUser, doc.EcmDomain, doc.EcmPassword, doc.EcmUrl);

   //             // Create a search object
   //             // Set up the scope for the query
   //             // Set up the SQL for the search
   //             CEWSI.RepositorySearch objSearch = new CEWSI.RepositorySearch();
   //             CEWSI.ObjectStoreScope objSearchScope = new CEWSI.ObjectStoreScope();
   //             objSearchScope.objectStore = doc.ObjectStore;
   //             objSearch.SearchScope = objSearchScope;
   //             objSearch.SearchSQL = query;
   //             objSearch.maxElements = maxRow;
   //             objSearch.maxElementsSpecified = true;

   //             // Execute the search
   //             objResponse = objBinding.ExecuteSearch(WSIUtil.GetLocalization(), objSearch);
   //         }
   //         catch (System.Net.WebException ex)
   //         {
   //             ret.ErrorCode = -1;
   //             ret.ErrorMsg = "An exception occurred while querying: [" + ex.Message + "]\n" + ex.ToString();
   //             return ret;
   //         }
   //         catch (Exception allEx)
   //         {
   //             ret.ErrorCode = -1;
   //             ret.ErrorMsg = "An exception occurred: [" + allEx.Message + "]\n" + allEx.ToString();
   //             return ret;
   //         }

   //         // Sanity check the results data
   //         long lColumnCount = 0;
   //         long lRowCount = 0;
   //         long i;
   //         if (objResponse == null || objResponse.Object == null)
   //         {
   //             ret.ErrorCode = 1;
   //             ret.ErrorMsg = "The query completed successfully but the results were null";
   //             return ret;
   //         }
   //         if (objResponse.Object.Length < 1)
   //         {
   //             ret.ErrorCode = 1;
   //             ret.ErrorMsg = "No results were found for this query - exiting";
   //             return ret;
   //         }
   //         lColumnCount = objResponse.Object[0].Property.Length;
   //         if (lColumnCount < 1)
   //         {
   //             ret.ErrorCode = 1;
   //             ret.ErrorMsg = "The query succeeded, but the results contain no properties - exiting";
   //             return ret;
   //         }
   //         /*
			//if( lColumnCount > 12 )
			//{
			//	MessageBox.Show("The result set has more than 12 columns.  Only the first 12 columns will be displayed");
			//	lColumnCount = 12;
			//}
			//*/

   //         // Query was successful; display a list of result rows
   //         // First create a data table that has one column for each property in the 
   //         //  returned data
   //         System.Data.DataColumn dtCol;
   //         System.Data.DataRow dtRow;
   //         CEWSI.PropertyType prop;

   //         CEWSI.ObjectValue[] objObjects = objResponse.Object;
   //         lRowCount = objObjects.Length;
   //         System.Data.DataTable dtblResults = new System.Data.DataTable("Results");
   //         for (i = 0; i < lColumnCount; i++)
   //         {
   //             dtCol = new System.Data.DataColumn(objObjects[0].Property[i].propertyId);
   //             dtCol.DataType = System.Type.GetType("System.String");
   //             dtCol.DefaultValue = "";
   //             dtblResults.Columns.Add(dtCol);
   //         }

   //         // Populate the rows
   //         for (i = 0; i < lRowCount; i++)
   //         {
   //             dtRow = dtblResults.NewRow();
   //             for (long iCol = 0; iCol < lColumnCount; iCol++)
   //             {
   //                 prop = objObjects[i].Property[iCol];
   //                 dtRow[prop.propertyId] = IdmObjectType.getPropertyValue(prop);
   //             }
   //             dtblResults.Rows.Add(dtRow);
   //         }
   //         ret.Result = dtblResults;
   //         ret.ErrorCode = 1;
   //         ret.ErrorMsg = "Success";
   //         return ret;
   //     }


   //     public static EcmQueryResult QueryFolder1(DocumentModel doc, string folderPath)
   //     {
   //         byte[] ret = null;

   //         Addcert(doc.EcmUrl);
   //         CEWSI.FNCEWS40PortTypeClient wseService = WSIUtil.ConfigureBinding(doc.EcmUser, doc.EcmDomain, doc.EcmPassword, doc.EcmUrl);

   //         // Add default locale info to SOAP header
   //         Localization objDefaultLocale = new Localization();
   //         objDefaultLocale.Locale = "en-US";

   //         // Set a reference to the document to retrieve
   //         ObjectSpecification objDocumentSpec = new ObjectSpecification();
   //         objDocumentSpec.classId = "Document";
   //         objDocumentSpec.path = folderPath;
   //         //objDocumentSpec.objectId = docId;
   //         objDocumentSpec.objectStore = doc.ObjectStore;

   //         // Create property filter object and set its attributes
   //         PropertyFilterType objPropFilter = new PropertyFilterType();
   //         objPropFilter.maxRecursion = 4;
   //         objPropFilter.maxRecursionSpecified = true;

   //         // Create filter element array to hold IncludeProperties specifications
   //         objPropFilter.IncludeProperties = new FilterElementType[4];

   //         // Create filter element for ContentElements property
   //         objPropFilter.IncludeProperties[1] = new FilterElementType();
   //         objPropFilter.IncludeProperties[1].Value = "ContentElements";

   //         // Create an object request for a GetObjects operation
   //         ObjectRequestType[] objObjectRequestTypeArray = new ObjectRequestType[1];
   //         objObjectRequestTypeArray[0] = new ObjectRequestType();
   //         objObjectRequestTypeArray[0].SourceSpecification = objDocumentSpec;
   //         objObjectRequestTypeArray[0].PropertyFilter = objPropFilter;

   //         // Call GetObjects operation to get document object and its properties
   //         ObjectResponseType[] objObjectResponseTypeArray;
   //         try
   //         {
   //             objObjectResponseTypeArray = wseService.GetObjects(objDefaultLocale, objObjectRequestTypeArray);
   //         }
   //         catch (System.Net.WebException ex)
   //         {
   //             Console.WriteLine("An exception occurred while requesting a document: [" + ex.Message + "]");
   //             return null;
   //         }

   //         // Get document object from the GetObjects response
   //         ObjectValue objDocument = null;
   //         if (objObjectResponseTypeArray[0] is SingleObjectResponse)
   //         {
   //             objDocument = ((SingleObjectResponse)objObjectResponseTypeArray[0]).Object;
   //         }

   //         // Get the ContentElements property of the Document object
   //         ListOfObject prpContentElements = null;
   //         foreach (PropertyType prpProperty in objDocument.Property)
   //         {
   //             if (prpProperty.propertyId == "ContentElements")
   //             {
   //                 prpContentElements = (ListOfObject)prpProperty;
   //                 break;
   //             }
   //         }

   //         // Get number of content elements
   //         int intElementCount = (prpContentElements.Value == null) ? 0 : prpContentElements.Value.Length;
   //         if (intElementCount == 0)
   //         {
   //             Console.WriteLine("The selected document has no content elements");
   //             Console.WriteLine("Press Enter to end");
   //             //Console.ReadLine();
   //             return null;
   //         }

   //         // Get the content from each content element of the document
   //         for (int intElem = 0; intElem < intElementCount; intElem++)
   //         {
   //             // Get a ContentTransfer object from the ContentElements property collection
   //             DependentObjectType objContentTransfer = prpContentElements.Value[intElem];

   //             // Construct element specification for GetContent request
   //             ElementSpecificationType objElemSpecType = new ElementSpecificationType();
   //             objElemSpecType.itemIndex = intElem;
   //             objElemSpecType.itemIndexSpecified = true;
   //             objElemSpecType.elementSequenceNumber = 0;
   //             objElemSpecType.elementSequenceNumberSpecified = false;

   //             // Construct the GetContent request
   //             ContentRequestType objContentReqType = new ContentRequestType();
   //             objContentReqType.cacheAllowed = true;
   //             objContentReqType.cacheAllowedSpecified = true;
   //             objContentReqType.id = "1";
   //             //objContentReqType.maxBytes = 100 * 1024;
   //             //objContentReqType.maxBytesSpecified = true;
   //             objContentReqType.maxBytesSpecified = false;
   //             objContentReqType.startOffset = 0;
   //             objContentReqType.startOffsetSpecified = true;
   //             objContentReqType.continueFrom = null;
   //             objContentReqType.ElementSpecification = objElemSpecType;
   //             objContentReqType.SourceSpecification = objDocumentSpec;
   //             ContentRequestType[] objContentReqTypeArray = new ContentRequestType[1];
   //             objContentReqTypeArray[0] = objContentReqType;
   //             GetContentRequest objGetContentReq = new GetContentRequest();
   //             objGetContentReq.ContentRequest = objContentReqTypeArray;
   //             objGetContentReq.validateOnly = false;
   //             objGetContentReq.validateOnlySpecified = true;

   //             // Call the GetContent operation
   //             ContentResponseType[] objContentRespTypeArray = null;
   //             try
   //             {
   //                 objContentRespTypeArray = wseService.GetContent(objDefaultLocale, objGetContentReq);
   //             }
   //             catch (System.Net.WebException ex)
   //             {
   //                 Console.WriteLine("An exception occurred while fetching content from a content element: [" + ex.Message + "]");
   //                 Console.WriteLine("Press Enter to end");
   //                 //Console.ReadLine();
   //                 return null;
   //             }
   //             catch (Exception allEx)
   //             {
   //                 Console.WriteLine("An exception occurred: [" + allEx.Message + "]");
   //                 Console.WriteLine("Press Enter to end");
   //                 //Console.ReadLine();
   //                 return null;
   //             }

   //             // Process GetContent response
   //             ContentResponseType objContentRespType = objContentRespTypeArray[0];
   //             if (objContentRespType is ContentErrorResponse)
   //             {
   //                 ContentErrorResponse objContentErrorResp = (ContentErrorResponse)objContentRespType;
   //                 ErrorStackType objErrorStackType = objContentErrorResp.ErrorStack;
   //                 ErrorRecordType objErrorRecordType = objErrorStackType.ErrorRecord[0];
   //                 Console.WriteLine("Error [" + objErrorRecordType.Description + "] occurred. " + " Err source is [" + objErrorRecordType.Source + "]");
   //                 //Console.WriteLine("Press Enter to end");
   //                 //Console.ReadLine();
   //                 return null;
   //             }
   //             else if (objContentRespType is ContentElementResponse)
   //             {
   //                 ContentElementResponse objContentElemResp = (ContentElementResponse)objContentRespType;
   //                 InlineContent objInlineContent = (InlineContent)objContentElemResp.Content;
   //                 ret = objInlineContent.Binary;
   //                 // Write content to file
   //                 //Stream outputStream = File.OpenWrite(strDocContentPath);
   //                 //outputStream.Write(objInlineContent.Binary, 0, objInlineContent.Binary.Length);
   //                 //outputStream.Close();
   //                 Console.WriteLine("Document content has been written");
   //                 //Console.WriteLine("Press Enter to end");
   //                 //Console.ReadLine();
   //             }
   //             else
   //             {
   //                 Console.WriteLine("Unknown data type returned in content response: [" + objContentRespType.GetType().ToString() + "]");
   //                 //Console.WriteLine("Press Enter to end");
   //                 //Console.ReadLine();
   //                 return null;
   //             }

   //         }
   //         return new EcmQueryResult();
   //     }

        public static byte[] GetContenFile(DocumentModel doc, string docId)
        {
            byte[] ret = null;

            Addcert(doc.EcmUrl);
            CEWSI.FNCEWS40PortTypeClient wseService = WSIUtil.ConfigureBinding(doc.EcmUser, doc.EcmDomain, doc.EcmPassword, doc.EcmUrl);

            // Add default locale info to SOAP header
            Localization objDefaultLocale = new Localization();
            objDefaultLocale.Locale = "en-US";

            // Set a reference to the document to retrieve
            ObjectSpecification objDocumentSpec = new ObjectSpecification();
            objDocumentSpec.classId = "Document";
            objDocumentSpec.objectId = docId;
            objDocumentSpec.objectStore = doc.ObjectStore;

            // Create property filter object and set its attributes
            PropertyFilterType objPropFilter = new PropertyFilterType();
            objPropFilter.maxRecursion = 4;
            objPropFilter.maxRecursionSpecified = true;

            // Create filter element array to hold IncludeProperties specifications
            objPropFilter.IncludeProperties = new FilterElementType[4];

            // Create filter element for ContentElements property
            objPropFilter.IncludeProperties[1] = new FilterElementType();
            objPropFilter.IncludeProperties[1].Value = "ContentElements";

            // Create an object request for a GetObjects operation
            ObjectRequestType[] objObjectRequestTypeArray = new ObjectRequestType[1];
            objObjectRequestTypeArray[0] = new ObjectRequestType();
            objObjectRequestTypeArray[0].SourceSpecification = objDocumentSpec;
            objObjectRequestTypeArray[0].PropertyFilter = objPropFilter;

            // Call GetObjects operation to get document object and its properties
            ObjectResponseType[] objObjectResponseTypeArray;
            try
            {
                objObjectResponseTypeArray = wseService.GetObjects(objDefaultLocale, objObjectRequestTypeArray);
            }
            catch (System.Net.WebException ex)
            {
                Console.WriteLine("An exception occurred while requesting a document: [" + ex.Message + "]");
                return null;
            }

            // Get document object from the GetObjects response
            ObjectValue objDocument = null;
            if (objObjectResponseTypeArray[0] is SingleObjectResponse)
            {
                objDocument = ((SingleObjectResponse)objObjectResponseTypeArray[0]).Object;
            }

            // Get the ContentElements property of the Document object
            ListOfObject prpContentElements = null;
            foreach (PropertyType prpProperty in objDocument.Property)
            {
                if (prpProperty.propertyId == "ContentElements")
                {
                    prpContentElements = (ListOfObject)prpProperty;
                    break;
                }
            }

            // Get number of content elements
            int intElementCount = (prpContentElements.Value == null) ? 0 : prpContentElements.Value.Length;
            if (intElementCount == 0)
            {
                Console.WriteLine("The selected document has no content elements");
                Console.WriteLine("Press Enter to end");
                //Console.ReadLine();
                return null;
            }

            // Get the content from each content element of the document
            for (int intElem = 0; intElem < intElementCount; intElem++)
            {
                // Get a ContentTransfer object from the ContentElements property collection
                DependentObjectType objContentTransfer = prpContentElements.Value[intElem];

                // Construct element specification for GetContent request
                ElementSpecificationType objElemSpecType = new ElementSpecificationType();
                objElemSpecType.itemIndex = intElem;
                objElemSpecType.itemIndexSpecified = true;
                objElemSpecType.elementSequenceNumber = 0;
                objElemSpecType.elementSequenceNumberSpecified = false;

                // Construct the GetContent request
                ContentRequestType objContentReqType = new ContentRequestType();
                objContentReqType.cacheAllowed = true;
                objContentReqType.cacheAllowedSpecified = true;
                objContentReqType.id = "1";
                //objContentReqType.maxBytes = 100 * 1024;
                //objContentReqType.maxBytesSpecified = true;
                objContentReqType.maxBytesSpecified = false;
                objContentReqType.startOffset = 0;
                objContentReqType.startOffsetSpecified = true;
                objContentReqType.continueFrom = null;
                objContentReqType.ElementSpecification = objElemSpecType;
                objContentReqType.SourceSpecification = objDocumentSpec;
                ContentRequestType[] objContentReqTypeArray = new ContentRequestType[1];
                objContentReqTypeArray[0] = objContentReqType;
                GetContentRequest objGetContentReq = new GetContentRequest();
                objGetContentReq.ContentRequest = objContentReqTypeArray;
                objGetContentReq.validateOnly = false;
                objGetContentReq.validateOnlySpecified = true;

                // Call the GetContent operation
                ContentResponseType[] objContentRespTypeArray = null;
                try
                {
                    objContentRespTypeArray = wseService.GetContent(objDefaultLocale, objGetContentReq);
                }
                catch (System.Net.WebException ex)
                {
                    Console.WriteLine("An exception occurred while fetching content from a content element: [" + ex.Message + "]");
                    Console.WriteLine("Press Enter to end");
                    //Console.ReadLine();
                    return null;
                }
                catch (Exception allEx)
                {
                    Console.WriteLine("An exception occurred: [" + allEx.Message + "]");
                    Console.WriteLine("Press Enter to end");
                    //Console.ReadLine();
                    return null;
                }

                // Process GetContent response
                ContentResponseType objContentRespType = objContentRespTypeArray[0];
                if (objContentRespType is ContentErrorResponse)
                {
                    ContentErrorResponse objContentErrorResp = (ContentErrorResponse)objContentRespType;
                    ErrorStackType objErrorStackType = objContentErrorResp.ErrorStack;
                    ErrorRecordType objErrorRecordType = objErrorStackType.ErrorRecord[0];
                    Console.WriteLine("Error [" + objErrorRecordType.Description + "] occurred. " + " Err source is [" + objErrorRecordType.Source + "]");
                    //Console.WriteLine("Press Enter to end");
                    //Console.ReadLine();
                    return null;
                }
                else if (objContentRespType is ContentElementResponse)
                {
                    ContentElementResponse objContentElemResp = (ContentElementResponse)objContentRespType;
                    InlineContent objInlineContent = (InlineContent)objContentElemResp.Content;
                    ret = objInlineContent.Binary;
                    // Write content to file
                    //Stream outputStream = File.OpenWrite(strDocContentPath);
                    //outputStream.Write(objInlineContent.Binary, 0, objInlineContent.Binary.Length);
                    //outputStream.Close();
                    Console.WriteLine("Document content has been written");
                    //Console.WriteLine("Press Enter to end");
                    //Console.ReadLine();
                }
                else
                {
                    Console.WriteLine("Unknown data type returned in content response: [" + objContentRespType.GetType().ToString() + "]");
                    //Console.WriteLine("Press Enter to end");
                    //Console.ReadLine();
                    return null;
                }

            }
            return ret;
        }
    }
}
