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

package org.jexpress.demoapp.controller.grpc;

import com.google.protobuf.Empty;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import io.netty.handler.codec.http.HttpResponseStatus;
import org.apache.logging.log4j.Level;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2Request;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2Response;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2ServiceGrpc;
import org.summerboot.jexpress.boot.BootErrorCode;
import org.summerboot.jexpress.boot.annotation.GrpcController;
import org.summerboot.jexpress.boot.annotation.Ping;
import org.summerboot.jexpress.nio.grpc.GRPCServer;
import org.summerboot.jexpress.nio.server.SessionContext;
import org.summerboot.jexpress.nio.server.domain.Err;
import org.summerboot.jexpress.nio.server.domain.ProcessorSettings;

@GrpcController
public abstract class Hello2Service extends Hello2ServiceGrpc.Hello2ServiceImplBase {

    static ProcessorSettings settings = new ProcessorSettings();

    static {
        settings.setHttpServiceResponseHeaderName_ServerTimestamp("X-Response-Ts");
    }


    protected final Hello2Response PONG = pong(BootErrorCode.OK, "");

    protected static Hello2Response pong(int errorCode, String errorDesc) {
        return Hello2Response.newBuilder()
                .setErrorCode(errorCode)
                .setErrorDesc(errorDesc)
                .setVersion("1.0.0")
                .build();
    }

    @Override
    public void ping(Empty e, StreamObserver<Hello2Response> responseObserver) {
        try {
            int errorCode = ping();
            if (errorCode == BootErrorCode.OK) {
                responseObserver.onNext(PONG);
                responseObserver.onCompleted();
            } else {
                Status status = Status.UNAVAILABLE.withDescription("Ping error#" + errorCode);
                responseObserver.onError(status.asException());
            }
        } catch (Throwable ex) {
            responseObserver.onError(ex);
        }
    }


    @Ping
    @Override
    public void hello2(Hello2Request request, StreamObserver<Hello2Response> responseObserver) {
        /*SessionContext serviceContext = GRPCServer.SessionContext.get();
        SocketAddress addr = Authenticator.GrpcCallerAddr.get();
        Caller caller = Authenticator.GrpcCaller.get();
        String uid = Authenticator.GrpcCallerId.get();
        ProcessorSettings processorSettings = new ProcessorSettings();
        serviceContext.processorSettings(processorSettings);*/

        SessionContext context = GRPCServer.SessionContext.get();
        context.processorSettings(settings);
        final String serverTxId = context.txId();
        String callerTxId = request.getCallerTxId();
        context.memo("callerTxId", callerTxId);

        int errorCode = BootErrorCode.OK;
        String errorDesc = "";
        String greeting = "";
        long start = System.currentTimeMillis();
        try {
            greeting = hello(request.getFirstName(), request.getLastName());
        } catch (Throwable ex) {
            errorCode = 123;
            errorDesc = ex.toString();
            Err error = new Err(errorCode, null, null, ex, null);
            context.error(error).level(Level.ERROR).status(HttpResponseStatus.INTERNAL_SERVER_ERROR);
            responseObserver.onError(ex);
            return;
        }
        long cost = System.currentTimeMillis() - start;

        Hello2Response helloResponse = Hello2Response.newBuilder()
                .setServerTxId(serverTxId)
                .setErrorCode(errorCode)
                .setErrorDesc(errorDesc)
                .setVersion("1.0.1")
                .setCost(cost)
                .setGreeting(greeting)
                .build();
        responseObserver.onNext(helloResponse);
        responseObserver.onCompleted();
    }


    abstract protected int ping();

    abstract protected String hello(String firstName, String lastName) throws Throwable;

}
