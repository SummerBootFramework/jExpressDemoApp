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


import com.google.inject.Singleton;
import io.grpc.Context;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerInterceptor;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.api.auth.Caller;
import org.summerboot.jexpress.api.common.SessionContext;
import org.summerboot.jexpress.infra.grpc.server.GrpcServerCallListener;
import org.summerboot.jexpress.infra.grpc.server.GrpcServerInterceptor;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
@Singleton
@Service(binding = ServerInterceptor.class)
public class MyGrpcServerInterceptor extends GrpcServerInterceptor {
    @Override
    public boolean isPing(String methodName) {
        return methodName.endsWith("/ping");
    }

    @Override
    protected <ReqT> GrpcServerCallListener buildListener(ServerCall.Listener<ReqT> delegate, Context ctx, String fullMethodName, boolean isBusinessRequest, Metadata metadata, SessionContext sessionContext, Caller caller) {
        return new MyGrpcServerCallListener<>(delegate, ctx, fullMethodName, isBusinessRequest, metadata, sessionContext, caller);
    }
}
