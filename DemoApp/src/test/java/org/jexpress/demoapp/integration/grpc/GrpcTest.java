/*
 * Copyright 2005-2026 Du Law Office - jExpress, The Summer Boot Framework Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://apache.org
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package org.jexpress.demoapp.integration.grpc;

import io.grpc.BindableService;
import io.grpc.netty.shaded.io.grpc.netty.NettyChannelBuilder;
import org.jexpress.demoapp.controller.grpc.impl.Hello1ServiceImpl_A;
import org.jexpress.demoapp.controller.grpc.impl.Hello2ServiceImpl_A;
import org.jexpress.demoapp.integration.grpc.client.Hello1ClientImpl;
import org.jexpress.demoapp.integration.grpc.client.Hello2ClientImpl;
import org.summerboot.jexpress.boot.BootConstants;
import org.summerboot.jexpress.grpc.test.GrpcTestHelper;
import org.summerboot.jexpress.security.crypto.EncryptorUtil;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.IOException;
import java.security.GeneralSecurityException;

import static org.testng.Assert.assertEquals;

public class GrpcTest extends GrpcTestHelper {

    @BeforeClass
    public static void setUpClass() throws Exception {
        EncryptorUtil.setMasterPassword("changeit");
    }

    @AfterClass
    public static void tearDownClass() throws Exception {
    }

    @BeforeMethod
    public void setUpMethod() throws Exception {
    }

    @AfterMethod
    public void tearDownMethod() throws Exception {
    }

    @Test
    public void test() throws GeneralSecurityException, IOException {
        super.test2WayTLS();
    }

    @Override
    protected BindableService[] getServerImpls() {
        BindableService impl1 = new Hello1ServiceImpl_A();
        BindableService impl2 = new Hello2ServiceImpl_A();
        return new BindableService[]{impl1, impl2};
    }

    @Override
    protected void runClient(NettyChannelBuilder channelBuilder) {
        // connect to server
        Hello1ClientImpl client1 = new Hello1ClientImpl().withNettyChannelBuilder(channelBuilder).connect();
        Hello2ClientImpl client2 = new Hello2ClientImpl().withNettyChannelBuilder(channelBuilder).connect();
        try {
            String g1 = client1.hello("firstName", "lastName");
            System.out.println("g1=" + g1);
            assertEquals(g1, BootConstants.APP_ID + " Hello1 " + "firstName lastName");
            String g2 = client2.hello("firstName", "lastName");
            System.out.println("g2=" + g2);
            assertEquals(g2, BootConstants.APP_ID + " Hello2 " + "firstName lastName");
        } finally {
            client1.disconnect();
            client2.disconnect();
        }
    }


}
