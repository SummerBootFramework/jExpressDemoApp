package org.jexpress.demoapp.integration.healthcheck;


import org.jexpress.demoapp.app.Constant;
import org.summerboot.jexpress.boot.annotation.HealthCheck;
import org.summerboot.jexpress.boot.instrumentation.HealthChecker;
import org.summerboot.jexpress.nio.server.domain.Err;

import java.util.List;


@HealthCheck(name = Constant.PC_NAME)
public class PauseChecker implements HealthChecker {
    public static int error = 0;

    @Override
    public List<Err> ping(Object... param) {
        if (error == 0) {
            return null;
        }

        return List.of(new Err(error, "pause.etag", "pause.eDesc", new Exception("pause.mock exception")));
    }

    @Override
    public InspectionType inspectionType() {
        return InspectionType.PauseCheck;
    }
}
