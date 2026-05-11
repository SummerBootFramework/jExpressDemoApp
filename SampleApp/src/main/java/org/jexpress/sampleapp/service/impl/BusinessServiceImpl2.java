package org.jexpress.sampleapp.service.impl;

import com.google.inject.Singleton;
import org.jexpress.sampleapp.dto.MyRequest;
import org.jexpress.sampleapp.dto.MyResponse;
import org.jexpress.sampleapp.service.BusinessService;
import org.summerboot.jexpress.boot.annotation.Service;
import org.summerboot.jexpress.nio.server.SessionContext;

@Singleton
@Service(AlternativeName = "impl2")// give it a try to start app with arg: -use impl2
public class BusinessServiceImpl2 implements BusinessService {
    @Override
    public MyResponse process(String greeting, MyRequest myRequest, final SessionContext context) {
        return new MyResponse("impl2.public." + greeting + myRequest.creditCardNumber(), "impl2.private." + greeting + myRequest.creditCardNumber(), myRequest.shoppingList());
    }
}
