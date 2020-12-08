using System;
using System.Runtime.Caching;

namespace TimeCard.Framework
{
    public class DefaultCacheProvider
    {
        private ObjectCache Cache { get { return MemoryCache.Default; } }
        public object Get(string key)
        {
            return Cache[key];
        }
        public void Set(string key, object data, int cacheMins)
        {
            CacheItemPolicy policy = new CacheItemPolicy();
            if (cacheMins <= 0)
            {
                cacheMins = 600; //10 hours
            }
            policy.AbsoluteExpiration = DateTime.Now + TimeSpan.FromMinutes(cacheMins);
            Cache.Add(new CacheItem(key, data), policy);
        }

        public bool IsSet(string key)
        {
            return (Cache[key] != null);
        }

        public void Invalidate(string key)
        {
            Cache.Remove(key);
        }
    }
}