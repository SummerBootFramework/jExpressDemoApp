package org.jexpress.sampleapp.controller.grpc.impl;

import io.grpc.Status;
import org.jexpress.sampleapp.controller.grpc.Hello1Service;
import org.summerboot.jexpress.boot.BootConstant;
import org.summerboot.jexpress.boot.BootErrorCode;
import org.summerboot.jexpress.boot.annotation.Service;

@Service(binding = Hello1Service.class)
public class Hello1ServiceImpl_A extends Hello1Service {

    @Override
    protected int ping() {
        return BootErrorCode.OK;
    }

    @Override
    protected String hello(String firstName, String lastName) throws Throwable {
        if (firstName.equals("err1")) {
            Status status = Status.INVALID_ARGUMENT.withDescription("my status ex");
            throw status.asException();
        } else if (firstName.equals("err2")) {
            throw new RuntimeException("my RuntimeException");
        }
        return BootConstant.APP_ID + " Hello1 " + firstName + " " + lastName;
    }

}
