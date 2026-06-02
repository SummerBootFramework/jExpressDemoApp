/*
 * Copyright 2005-2026 Du Law Office - jExpress, The Summer Boot Framework Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://apache.org
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package org.jexpress.demoapp.integration.cache;

import com.google.inject.Singleton;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.annotation.health.HealthCheck;
import org.summerboot.jexpress.api.cache.AuthTokenCache;
import org.summerboot.jexpress.integration.cache.local.AuthTokenCacheLocalImpl;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
@Singleton
@Service(binding = AuthTokenCache.class, AlternativeName = "myCacheImpl")
@HealthCheck(name = "cache")
public class CacheImpl extends AuthTokenCacheLocalImpl {

    @Override
    public void blacklist(String key, String value, long ttlMilliseconds) {
        put(key, value, ttlMilliseconds);
    }

    @Override
    public boolean isBlacklist(String key) {
        String v = get(key);
        return v != null;
    }


}
