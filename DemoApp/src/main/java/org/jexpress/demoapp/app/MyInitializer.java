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

package org.jexpress.demoapp.app;

import com.google.inject.Injector;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.summerboot.jexpress.annotation.Order;
import org.summerboot.jexpress.boot.lifecycle.app.AppInitializer;

import java.io.File;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
@Order(1)
public class MyInitializer implements AppInitializer {

    private static final String CLI_CMD = "mycli";

    private static final Logger log = LogManager.getLogger(MyInitializer.class);
    private static final java.util.logging.Logger jul = java.util.logging.Logger.getLogger(MyInitializer.class.getName());

    @Override
    public void initCLI(Options options) {
        Option arg = Option.builder(CLI_CMD)
                .desc("this is my cli")
                .build();
        options.addOption(arg);
        Throwable ex = null;//new RuntimeException("test");
        jul.log(java.util.logging.Level.INFO, "JUL log string={0} int={1}", new Object[]{"abc", 123});
        log.info("Log4J2 log stirng={} int={}", "abc", 123, ex);
    }

    /**
     * @param configDir
     */
    @Override
    public void initAppBeforeIoC(File configDir) {
        log.info(configDir);
    }

    @Override
    public void initAppAfterIoC(File configDir, Injector guiceInjector) {
        log.info(configDir);
    }

}
