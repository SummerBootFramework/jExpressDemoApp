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

package org.jexpress.demoapp.integration.httpclient;

import com.google.inject.Singleton;
import io.netty.handler.codec.http.HttpResponseStatus;
import org.jexpress.demoapp.dto.MyResponse;
import org.jexpress.demoapp.integration.healthcheck.MyHttpClientHealthChecker;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.api.common.SessionContext;
import org.summerboot.jexpress.api.rpc.RpcResult;
import org.summerboot.jexpress.integration.rpc.http.RpcDelegateHttpClientImpl;
import org.summerboot.jexpress.integration.rpc.http.config.HttpClientConfig;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;

@Service(binding = MyHttpClient.class)
@Singleton
public class MyHttpClientImpl extends RpcDelegateHttpClientImpl implements MyHttpClient {
    @Override
    protected HttpClientConfig getHttpClientConfig() {
        return MyHttpClientConfig.cfg;
    }

    @Override
    public RpcResult ping() throws IOException {
        final URI uri = URI.create(MyHttpClientConfig.cfg.getEndpoint() + "/ping");
        HttpRequest.Builder reqBuilder = HttpRequest.newBuilder(uri).GET();
        HttpResponseStatus[] expectedStatus = {HttpResponseStatus.OK, HttpResponseStatus.NO_CONTENT};
        return rpc(SessionContext.build(-1), reqBuilder.build(), false, expectedStatus);
    }

    @Override
    public RpcResult<MyResponse> getHelloRpcResult(String name, String body, SessionContext context) throws IOException {
        // reset idle event monitor
        MyHttpClientHealthChecker.IDLE_EVENT_MONITOR.onCall(context.txId());

        // rpc
        final URI uri = URI.create(MyHttpClientConfig.cfg.getEndpoint() + "/hello?name=" + name);
        HttpRequest.Builder reqBuilder = HttpRequest.newBuilder(uri).POST(HttpRequest.BodyPublishers.ofString(body));
        HttpResponseStatus[] expectedStatus = {HttpResponseStatus.OK};
        boolean isStreaming = true; // new to jExpress v2.7.4: set to true to enable streaming processing of large response bodies
        return rpc(context, reqBuilder.build(), isStreaming, expectedStatus);
    }

    @Override
    public MyResponse getHello(String name, String body, SessionContext context) throws IOException {
        RpcResult<MyResponse> rpcResult = getHelloRpcResult("name", "body", context);
        if (!rpcResult.isRemoteSuccess()) {
            return null; // errors are already set in the context by rpcEx() method
        }
        return rpcResult.deserialize(MyResponse.class, context);
    }
}
