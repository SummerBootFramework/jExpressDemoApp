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

package org.jexpress.demoapp.integration.healthcheck;

import com.google.inject.Inject;
import org.jexpress.demoapp.app.MyConfig;
import org.jexpress.demoapp.integration.httpclient.MyHttpClient;
import org.summerboot.jexpress.annotation.health.HealthCheck;
import org.summerboot.jexpress.api.common.BootErrorCode;
import org.summerboot.jexpress.api.common.Err;
import org.summerboot.jexpress.api.health.HealthChecker;
import org.summerboot.jexpress.api.rpc.RpcResult;
import org.summerboot.jexpress.boot.lifecycle.app.IdleEventMonitor;

import java.util.List;
import java.util.concurrent.TimeUnit;

@HealthCheck(name = MyHttpClientHealthChecker.NAME)
public class MyHttpClientHealthChecker implements HealthChecker {
    public static final String NAME = "MyHttpClientHealthChecker";

    @Inject
    private MyHttpClient myHttpClient;

    @Override
    public List<Err> ping(Object[] param) {
        try {
            RpcResult rpcResult = myHttpClient.ping();
            if (!rpcResult.isRemoteSuccess()) {
                return List.of(new Err(BootErrorCode.ACCESS_ERROR_RPC, NAME, rpcResult.httpStatus().toString(), null));
            }
        } catch (Exception ex) {
            return List.of(new Err(BootErrorCode.ACCESS_ERROR_RPC, NAME, ex.toString(), ex));
        }
        return null;
    }

    public static final IdleEventMonitor IDLE_EVENT_MONITOR = new IdleEventMonitor(NAME) {

        @Override
        public long getIdleIntervalMillis() {
            return TimeUnit.SECONDS.toMillis(MyConfig.cfg.getMyIdleThresholdSecond());// dynamic value, can be changed at runtime
        }
    };
}
