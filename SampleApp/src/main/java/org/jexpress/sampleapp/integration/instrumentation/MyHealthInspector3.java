package org.jexpress.sampleapp.integration.instrumentation;

import org.jexpress.sampleapp.app.Constant;
import org.summerboot.jexpress.boot.annotation.Inspector;
import org.summerboot.jexpress.boot.instrumentation.HealthInspector;
import org.summerboot.jexpress.nio.server.domain.Err;

import java.util.List;

@Inspector(name = Constant.HI_NAME3)
public class MyHealthInspector3 implements HealthInspector {
    @Override
    public List<Err> ping(Object[] param) {
        return List.of();
    }
}
