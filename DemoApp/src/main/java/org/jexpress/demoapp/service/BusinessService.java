package org.jexpress.demoapp.service;

import org.jexpress.demoapp.dto.MyRequest;
import org.jexpress.demoapp.dto.MyResponse;
import org.summerboot.jexpress.nio.server.SessionContext;

public interface BusinessService {

    MyResponse process(String greeting, MyRequest request, final SessionContext context);
}
