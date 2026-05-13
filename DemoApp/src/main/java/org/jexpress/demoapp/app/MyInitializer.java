package org.jexpress.demoapp.app;

import com.google.inject.Injector;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.summerboot.jexpress.boot.SummerInitializer;
import org.summerboot.jexpress.boot.annotation.Order;

import java.io.File;

@Order(1)
public class MyInitializer implements SummerInitializer {

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
