package org.jexpress.sampleapp.service.grpc.impl;

import org.jexpress.sampleapp.service.grpc.Hello2Service;
import org.summerboot.jexpress.boot.BootConstant;
import org.summerboot.jexpress.boot.BootErrorCode;
import org.summerboot.jexpress.boot.annotation.Service;

@Service(binding = Hello2Service.class, AlternativeName = "hawaii_2")
public class Hello2ServiceImpl_B extends Hello2Service {
    @Override
    protected int ping() {
        return BootErrorCode.OK;
    }

    @Override
    protected String hello(String firstName, String lastName) {
        return BootConstant.APP_ID + " Aloha2 " + firstName + " " + lastName;
    }

}
