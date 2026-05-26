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
import org.jexpress.demoapp.grpc.proto.generated2.Hello2Request;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2Response;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2ServiceGrpc;
import org.summerboot.jexpress.controller.grpc.BearerAuthCredential;
import org.summerboot.jexpress.controller.grpc.GRPCClient;

public class Hello2ClientImpl extends GRPCClient<Hello2ClientImpl> {
    private Hello2ServiceGrpc.Hello2ServiceBlockingStub blockingStub;

    @Override
    protected void onConnected(ManagedChannel channel) {
        String jwt = "jwt2";
        BearerAuthCredential bearerAuthCredential = new BearerAuthCredential(jwt);
        this.blockingStub = Hello2ServiceGrpc.newBlockingStub(channel);//.withCallCredentials(bearerAuthCredential);
    }

    public String hello(String firstName, String lastName) {
        Hello2Request request = Hello2Request.newBuilder()
                .setFirstName(firstName)
                .setLastName(lastName)
                .build();
        Hello2Response response = blockingStub.hello2(request);
        return response.getGreeting();
    }
}
