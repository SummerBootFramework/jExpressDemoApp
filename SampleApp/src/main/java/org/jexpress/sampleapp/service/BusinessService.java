package org.jexpress.sampleapp.service;

import org.jexpress.sampleapp.dto.MyRequest;
import org.jexpress.sampleapp.dto.MyResponse;
import org.summerboot.jexpress.nio.server.SessionContext;

public interface BusinessService {

    MyResponse process(String greeting, MyRequest request, final SessionContext context);
}
