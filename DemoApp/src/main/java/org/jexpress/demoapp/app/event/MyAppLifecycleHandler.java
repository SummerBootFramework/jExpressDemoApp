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

package org.jexpress.demoapp.app.event;

import com.google.inject.Singleton;
import org.jexpress.demoapp.app.MyConfig;
import org.jexpress.demoapp.app.MyInitializer;
import org.jexpress.demoapp.service.impl.BusinessServiceImpl1;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.summerboot.jexpress.annotation.Scheduled;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.api.grpc.GRPCServer;
import org.summerboot.jexpress.boot.SummerApplication;
import org.summerboot.jexpress.boot.lifecycle.AppLifecycleHandler;
import org.summerboot.jexpress.boot.lifecycle.AppLifecycleListener;
import org.summerboot.jexpress.boot.lifecycle.IdleEventMonitor;
import org.summerboot.jexpress.infra.netty.NioServer;

import java.util.concurrent.TimeUnit;

@Singleton
@Service(binding = AppLifecycleListener.class)
@Scheduled(cronField = "cronSettings")
public class MyAppLifecycleHandler extends AppLifecycleHandler implements Job {
    private static String[] cronSettings = MyConfig.cfg.getCronExpressions();


    private static final java.util.logging.Logger jul = java.util.logging.Logger.getLogger(MyInitializer.class.getName());
    private static final String MY_IDLE_EVENT_MONITOR_ID = "MyIdleEventMonitor";

    private IdleEventMonitor myIdleEventMonitor = new IdleEventMonitor(MY_IDLE_EVENT_MONITOR_ID) {
        @Override
        public long getIdleIntervalMillis() {
            return TimeUnit.SECONDS.toMillis(MyConfig.cfg.getMyIdleThresholdSecond());
        }
    };

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        log.info("onCron: " + jobExecutionContext);
        String lastTransactionId = jobExecutionContext.getFireTime().toString();
        myIdleEventMonitor.onCall("cron@" + lastTransactionId);
    }

    @Override
    public void beforeApplicationStart(SummerApplication.AppContext context) throws Exception {
        super.beforeApplicationStart(context);
        BusinessServiceImpl1.init(context.guiceInjector());
    }

    /**
     * called when application paused or resumed by configuration/pause file or BottController's ${context-root}/status?pause=true|false
     *
     * @param healthOk
     * @param paused
     * @param serviceStatusChanged
     * @param reason
     */
    @Override
    public void onApplicationStatusUpdated(SummerApplication.AppContext context, boolean healthOk, boolean paused, boolean serviceStatusChanged, String reason) throws Exception {
        super.onApplicationStatusUpdated(context, healthOk, paused, serviceStatusChanged, reason);
        System.out.println("My application status updated");
    }

    /**
     * @param healthOk
     * @param paused
     * @param retryIndex
     * @param nextInspectionIntervalSeconds
     */
    @Override
    public void onHealthInspectionFailed(SummerApplication.AppContext context, boolean healthOk, boolean paused, long retryIndex, int nextInspectionIntervalSeconds) throws Exception {
        super.onHealthInspectionFailed(context, healthOk, paused, retryIndex, nextInspectionIntervalSeconds);
        System.out.println("My health inspection failed");
    }

    @Override
    public void onIdle(IdleEventMonitor idleEventMonitor) throws Exception {
        switch (idleEventMonitor.getName()) {
            case GRPCServer.IDLE_EVENT_MONITOR_ID -> {
                //System.out.println("GRPCServer is idling");
            }
            case NioServer.IDLE_EVENT_MONITOR_ID -> {
                //System.out.println("GRPCServer is idling");
            }
            case MY_IDLE_EVENT_MONITOR_ID -> {
                log.debug("MyMonitor is idling");
            }
        }
    }
}
