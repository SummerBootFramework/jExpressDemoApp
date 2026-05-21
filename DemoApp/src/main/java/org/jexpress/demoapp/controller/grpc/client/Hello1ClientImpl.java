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

package org.jexpress.demoapp.controller.grpc.client;

import io.grpc.ManagedChannel;
import org.jexpress.demoapp.grpc.proto.generated1.Hello1Request;
import org.jexpress.demoapp.grpc.proto.generated1.Hello1Response;
import org.jexpress.demoapp.grpc.proto.generated1.Hello1ServiceGrpc;
import org.summerboot.jexpress.nio.grpc.BearerAuthCredential;
import org.summerboot.jexpress.nio.grpc.GRPCClient;

import java.util.concurrent.TimeUnit;

public class Hello1ClientImpl extends GRPCClient<Hello1ClientImpl> {

    private Hello1ServiceGrpc.Hello1ServiceBlockingStub blockingStub;

    @Override
    protected void onConnected(ManagedChannel channel) {
        try {
            TimeUnit.SECONDS.sleep(0);// to test read lock
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        String jwt = "jwt1";
        BearerAuthCredential bearerAuthCredential = new BearerAuthCredential(jwt);
        this.blockingStub = Hello1ServiceGrpc.newBlockingStub(channel);//.withCallCredentials(bearerAuthCredential);
    }

    public String hello(String firstName, String lastName) {
        Hello1Request request = Hello1Request.newBuilder()
                .setFirstName(firstName)
                .setLastName(lastName)
                .build();
        lock();
        String ret = null;
        try {
            Hello1Response response = blockingStub.hello1(request);
            ret = response.getGreeting();
        } finally {
            unlock();
        }
        return ret;
    }

}
