package org.jexpress.sampleapp.integration.healthcheck;


import org.jexpress.sampleapp.app.Constant;
import org.summerboot.jexpress.boot.annotation.HealthCheck;
import org.summerboot.jexpress.boot.instrumentation.HealthChecker;
import org.summerboot.jexpress.nio.server.domain.Err;

import java.util.List;


@HealthCheck(name = Constant.PC_NAME)
public class PauseChecker implements HealthChecker {
    public static int error = 0;

    /**
     * @param param
     * @return
     */
    @Override
    public List<Err> ping(Object... param) {
        List<Err> ret = null;
        switch (error) {
            case 2 -> {
                ret = List.of(new Err(1, "test 2b", null, null));
            }
            case 3 -> {
                ret = List.of(new Err(2, "test 3", null, null));
            }
        }
        return ret;
    }

    @Override
    public InspectionType inspectionType() {
        return InspectionType.PauseCheck;
    }
}
