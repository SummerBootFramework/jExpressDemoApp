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


import io.grpc.Context;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.netty.handler.codec.http.HttpHeaders;
import org.summerboot.jexpress.api.auth.Caller;
import org.summerboot.jexpress.api.common.SessionContext;
import org.summerboot.jexpress.infra.grpc.server.GrpcServerCallListener;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
public class MyGrpcServerCallListener<ReqT> extends GrpcServerCallListener {
    public MyGrpcServerCallListener(ServerCall.Listener<ReqT> delegate, Context ctx, String fullMethodName, boolean isBusinessRequest, Metadata metadata, SessionContext sessionContext, Caller caller) {
        super(delegate, ctx, fullMethodName, isBusinessRequest, metadata, sessionContext, caller);

    }

    @Override
    protected String sanitizeUserInput(String receivedUserInput) {
        return super.sanitizeUserInput(receivedUserInput);
    }

    @Override
    protected void buildClientServerCommunication(String fullMethodName, HttpHeaders requestHeaders, long requestDataBytes, String sanitizedUserInput, HttpHeaders responseHeaders, long responseDataBytes, String responseBody, SessionContext context, StringBuilder sb, boolean isTraceAll) {
        super.buildClientServerCommunication(fullMethodName, requestHeaders, requestDataBytes, sanitizedUserInput, responseHeaders, responseDataBytes, responseBody, context, sb, isTraceAll);
    }
}
