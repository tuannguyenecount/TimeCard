using System.Collections.Generic;


namespace TimeCard.Framework
{
    public class ServiceCache
    {
        private static ServiceCache current = null;
        public static ServiceCache Current
        {
            get
            {
                if (current == null)
                {
                    current = new ServiceCache();
                }
                return current;
            }
        }
        private ServiceCache()
        {
            cacher = new DefaultCacheProvider();
        }
        DefaultCacheProvider cacher = null;

        public string ErrMessage
        {
            get { return errMessage; }
        }
        private string errMessage = null;
        public int ErrCode
        {
            get { return errCode; }
        }
        private int errCode = 0;
        static Dictionary<string, string> keys = new Dictionary<string, string>();
        private void _SetCache(string key, object data, int cacheMins = 0)
        {
            if (data == null)
            {
                ClearCache(key);
            }
            else
            {
                cacher.Set(key, data, cacheMins);
                if (!keys.ContainsKey(key))
                {
                    keys.Add(key, data.GetType().FullName);
                }
            }
        }
        public T GetCache<T>(string key)
        {
            var ret = cacher.Get(key);
            if (ret != null && ret is T)
            {
                return (T)ret;
            }
            return default(T);
        }
        public void SetCache(string key, object ob, int cacheMins = 0)
        {
            if (ob != null)
            {
                _SetCache(key, ob, cacheMins);
            }
        }
        public Dictionary<string, string> RegisteredKeys
        {
            get
            {
                List<string> ls = new List<string>();
                foreach (var k in keys)
                {
                    if (cacher.Get(k.Key) == null)
                    {
                        ls.Add(k.Key);
                    }
                }
                foreach (var key in ls)
                {
                    keys.Remove(key);
                }
                return keys;
            }
        }
        public void ClearCache(string key)
        {
            keys.Remove(key);
            cacher.Invalidate(key);
        }

        public void ClearCacheLikeName(string keywork)
        {
            List<string> ls = new List<string>();
            foreach (string key in keys.Keys)
            {
                if (key.IndexOf(keywork) > -1)
                {
                    ls.Add(key);
                }
            }
            foreach (string key in ls)
            {
                keys.Remove(key);
                cacher.Invalidate(key);
            }
        }
    }
}