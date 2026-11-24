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

package org.jexpress.demoapp.integration.grpc.client;

import com.google.protobuf.Empty;
import io.grpc.ManagedChannel;
import io.grpc.netty.shaded.io.grpc.netty.NettyChannelBuilder;
import io.grpc.stub.AbstractStub;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2Request;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2Response;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2ServiceGrpc;
import org.summerboot.jexpress.boot.lifecycle.app.IdleEventMonitor;
import org.summerboot.jexpress.infra.grpc.client.GrpcClient;
import org.summerboot.jexpress.infra.grpc.client.config.GrpcClientConfig;

/**
 * make it package access class, only MyGrpcClient interface is exposed to the caller, so that the caller does not need to know the implementation details of GrpcClient
 *
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
public class Hello2ClientImpl extends GrpcClient<Hello2ClientImpl> {
    private Hello2ServiceGrpc.Hello2ServiceBlockingStub blockingStub;

    protected Hello2ClientImpl(GrpcClientConfig cfg) {
        super(cfg);
    }

    public Hello2ClientImpl(NettyChannelBuilder channelBuilder, String idleEventMonitorName, int idleThresholdSecond) {
        super(channelBuilder, idleEventMonitorName, idleThresholdSecond);
    }

    @Override
    protected AbstractStub onConnected(ManagedChannel channel) {
        this.blockingStub = Hello2ServiceGrpc.newBlockingStub(channel);
        return this.blockingStub;
    }

    public int ping() {
        lock();
        int ret = 0;
        try {
            Hello2Response response = blockingStub.ping(Empty.getDefaultInstance());
            ret = response.getErrorCode();
        } finally {
            unlock();
        }
        return ret;
    }

    public String hello(String firstName, String lastName) {
        Hello2Request request = Hello2Request.newBuilder()
                .setFirstName(firstName)
                .setLastName(lastName)
                .build();
        Hello2Response response = blockingStub.hello2(request);
        return response.getGreeting();
    }

    @Override
    public void onIdle(IdleEventMonitor idleEventMonitor) throws Exception {
        System.out.println(idleEventMonitor.report("gRPC client2"));
    }
}
