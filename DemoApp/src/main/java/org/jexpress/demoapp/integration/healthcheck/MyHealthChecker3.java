package org.jexpress.demoapp.integration.healthcheck;

import org.summerboot.jexpress.boot.annotation.HealthCheck;
import org.summerboot.jexpress.boot.instrumentation.HealthChecker;
import org.summerboot.jexpress.nio.server.domain.Err;

import java.util.List;

@HealthCheck
public class MyHealthChecker3 implements HealthChecker {
    public static int error = 0;

    @Override
    public List<Err> ping(Object... param) {
        if (error == 0) {
            return null;
        }

        return List.of(new Err(error, "checker3.etag", "checker3.eDesc", new Exception("checker3.mock exception")));
    }
}
