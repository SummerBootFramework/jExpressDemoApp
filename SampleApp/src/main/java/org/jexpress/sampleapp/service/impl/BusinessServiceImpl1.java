package org.jexpress.sampleapp.service.impl;

import com.google.inject.Singleton;
import io.netty.handler.codec.http.HttpResponseStatus;
import org.jexpress.sampleapp.dto.MyRequest;
import org.jexpress.sampleapp.dto.MyResponse;
import org.jexpress.sampleapp.service.BusinessService;
import org.jexpress.sampleapp.service.MyErrorCode;
import org.summerboot.jexpress.boot.BootPOI;
import org.summerboot.jexpress.boot.annotation.Service;
import org.summerboot.jexpress.nio.server.SessionContext;
import org.summerboot.jexpress.nio.server.domain.Err;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

@Singleton
@Service // default bind to the interface it is implemented
public class BusinessServiceImpl1 implements BusinessService {
    @Override
    public MyResponse process(String greeting, MyRequest myRequest, final SessionContext context) {
        try {
            // step 1: call gRPC for a transaction
            context.poi(BootPOI.GRPC_BEGIN);// about POI, see section8.3
            long randomMillis = ThreadLocalRandom.current().nextLong(100, 501);
            TimeUnit.MILLISECONDS.sleep(randomMillis);
            context.poi(BootPOI.GRPC_END);

            // step 2: update result in DB
            context.poi(BootPOI.DB_BEGIN);// about POI, see section8.3
            randomMillis = ThreadLocalRandom.current().nextLong(100, 501);
            TimeUnit.MILLISECONDS.sleep(randomMillis);
            context.poi(BootPOI.DB_END);

            // step 3a: build GOOD return status and response
            context.status(HttpResponseStatus.CREATED);// override, default is 200 OK
            return new MyResponse("impl1.public." + greeting + myRequest.creditCardNumber(), "impl1.private." + greeting + myRequest.creditCardNumber(), myRequest.shoppingList());
        } catch (InterruptedException ex) {
            // Restore interrupted status
            Thread.currentThread().interrupt();

            // step 3b: build ERROR return status and response
            Err error = new Err(MyErrorCode.SystemError, null, "Interrupted", ex);
            context.error(error).status(HttpResponseStatus.INTERNAL_SERVER_ERROR);// override, default is 200 OK
            return null;
        }
    }
}
