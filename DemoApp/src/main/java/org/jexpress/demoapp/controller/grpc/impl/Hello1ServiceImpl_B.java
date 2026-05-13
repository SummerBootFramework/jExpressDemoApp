package org.jexpress.demoapp.controller.grpc.impl;

import org.jexpress.demoapp.controller.grpc.Hello1Service;
import org.summerboot.jexpress.boot.BootConstant;
import org.summerboot.jexpress.boot.BootErrorCode;
import org.summerboot.jexpress.boot.annotation.Service;

@Service(binding = Hello1Service.class, AlternativeName = "hawaii_1")
public class Hello1ServiceImpl_B extends Hello1Service {
    @Override
    protected int ping() {
        return BootErrorCode.OK;
    }

    @Override
    protected String hello(String firstName, String lastName) {
        if (firstName.startsWith("error")) {
            throw new RuntimeException("my error");
        }
        return BootConstant.APP_ID + " Aloha1 " + firstName + " " + lastName;
    }

}
