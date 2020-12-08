extern alias Newton;
using NewtonReference = Newton::Newtonsoft.Json;
using System.IO;

namespace TimeCard.Helper
{
    public static class JsonHelper
    {
        public static string Serialize(object ob)
        {
            return NewtonReference.JsonConvert.SerializeObject(ob, NewtonReference.Formatting.Indented, new NewtonReference.JsonSerializerSettings
            {
                DefaultValueHandling = NewtonReference.DefaultValueHandling.Ignore
            });
        }
        public static string SerializeAll(object ob)
        {
            return NewtonReference.JsonConvert.SerializeObject(ob, NewtonReference.Formatting.Indented, new NewtonReference.JsonSerializerSettings
            {
                DefaultValueHandling = NewtonReference.DefaultValueHandling.Include
            });
        }
        public static void Serialize2File(string filePath, object ob)
        {
            using (StreamWriter file = File.CreateText(filePath))
            {
                NewtonReference.JsonSerializer serializer = new NewtonReference.JsonSerializer();
                serializer.Serialize(file, ob);
            }
        }
        public static T DeSerialize<T>(string json)
        {
            return NewtonReference.JsonConvert.DeserializeObject<T>(json, new NewtonReference.JsonSerializerSettings
            {
                ConstructorHandling = NewtonReference.ConstructorHandling.AllowNonPublicDefaultConstructor,
                ObjectCreationHandling = NewtonReference.ObjectCreationHandling.Replace,
            });
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="json">EX {"Property1":"1", "Property2":"Mike", "Property3":"Some"}</param>
        /// <param name="template">forexample: template=new {Property1=0, Property2=""}</param>
        /// <returns>Anonymous object. ex: object.Property1=0; object.Property2="Mike"}</returns>
        public static object DeSerializeAnonymousType(string json, object template)
        {
            return NewtonReference.JsonConvert.DeserializeAnonymousType(json, template);
        }
    }
}