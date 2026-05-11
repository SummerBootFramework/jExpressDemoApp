package org.jexpress.sampleapp.integration.healthcheck;

import org.jexpress.sampleapp.app.Constant;
import org.summerboot.jexpress.boot.annotation.HealthCheck;
import org.summerboot.jexpress.boot.instrumentation.HealthChecker;
import org.summerboot.jexpress.nio.server.domain.Err;

import java.util.List;

@HealthCheck(name = Constant.HI_NAME2)
public class MyHealthChecker2 implements HealthChecker {
    @Override
    public List<Err> ping(Object[] param) {
        return List.of();
    }
}
