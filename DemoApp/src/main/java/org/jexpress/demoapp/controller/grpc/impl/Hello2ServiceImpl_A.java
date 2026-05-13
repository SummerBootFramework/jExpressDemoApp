package org.jexpress.demoapp.controller.grpc.impl;

import org.jexpress.demoapp.controller.grpc.Hello2Service;
import org.summerboot.jexpress.boot.BootConstant;
import org.summerboot.jexpress.boot.BootErrorCode;
import org.summerboot.jexpress.boot.annotation.Service;

@Service(binding = Hello2Service.class)
public class Hello2ServiceImpl_A extends Hello2Service {
    @Override
    protected int ping() {
        return BootErrorCode.OK;
    }

    @Override
    protected String hello(String firstName, String lastName) {
        return BootConstant.APP_ID + " Hello2 " + firstName + " " + lastName;
    }

}
