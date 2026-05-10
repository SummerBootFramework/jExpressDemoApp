package org.jexpress.sampleapp.integration.instrumentation;

import org.summerboot.jexpress.boot.annotation.Inspector;
import org.summerboot.jexpress.boot.instrumentation.HealthInspector;
import org.summerboot.jexpress.nio.server.domain.Err;

import java.util.List;

@Inspector // not a best practice, always need to change manually after refactoring
public class MyHealthInspector1 implements HealthInspector {
    @Override
    public List<Err> ping(Object... param) {
        return List.of(new Err(123, "etag", "eDesc", null));
    }
}
