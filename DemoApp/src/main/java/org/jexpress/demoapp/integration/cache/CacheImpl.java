package org.jexpress.demoapp.integration.cache;

import com.google.inject.Singleton;
import org.summerboot.jexpress.boot.annotation.HealthCheck;
import org.summerboot.jexpress.boot.annotation.Service;
import org.summerboot.jexpress.integration.cache.AuthTokenCache;
import org.summerboot.jexpress.integration.cache.SimpleLocalCacheImpl;

@Singleton
@Service(binding = AuthTokenCache.class, AlternativeName = "aaa")
@HealthCheck(name = "cache")
public class CacheImpl extends SimpleLocalCacheImpl<String, String> implements AuthTokenCache {

    @Override
    public void blacklist(String key, String value, long ttlMilliseconds) {
        put(key, value, ttlMilliseconds);
    }

    @Override
    public boolean isBlacklist(String key) {
        String v = get(key);
        return v != null;
    }

//    @Override
//    public List<Err> ping(Object... params) {
//        var e = new Err(BootErrorCode.ACCESS_ERROR_CACHE, null, "Cache Access Error - ", null);
//        List<Err> errors = new ArrayList<>();
//        errors.add(e);
//
//        try {
//            TimeUnit.SECONDS.sleep(15);
//        } catch (InterruptedException ex) {
//        }
//        return errors;
//    }
}
