package org.jexpress.sampleapp.integration.instrumentation;


import org.jexpress.sampleapp.app.Constant;
import org.summerboot.jexpress.boot.annotation.Inspector;
import org.summerboot.jexpress.boot.instrumentation.HealthInspector;
import org.summerboot.jexpress.nio.server.domain.Err;

import java.util.List;


@Inspector(name = Constant.PC_NAME)
public class PauseChecker implements HealthInspector<Object> {
    public static int index = 2;

    /**
     * @param param
     * @return
     */
    @Override
    public List<Err> ping(Object... param) {
//        try {
//            TimeUnit.SECONDS.sleep(5);
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }
        List<Err> ret = null;
        switch (index) {
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
