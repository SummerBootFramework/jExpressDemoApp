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

import com.google.inject.Singleton;
import org.summerboot.jexpress.annotation.Service;

@Service
@Singleton
public class MyGrpcClientImpl implements MyGrpcClient {
    private static final Hello1ClientImpl hello1Client = new Hello1ClientImpl().withConfig(Hello1ClientConfig.cfg).connect();
    private static final Hello2ClientImpl hello2Client = new Hello2ClientImpl().withConfig(Hello2ClientConfig.cfg).connect();

    @Override
    public int ping1() {
        return hello1Client.ping();
    }

    @Override
    public String hello1(String firstName, String lastName) {
        return hello1Client.hello(firstName, lastName);
    }

    @Override
    public int ping2() {
        return hello2Client.ping();
    }

    @Override
    public String hello2(String firstName, String lastName) {
        return hello2Client.hello(firstName, lastName);
    }

    public void connect() {
        hello1Client.connect();
        hello2Client.connect();
    }

    public void shutdown() {
        hello1Client.disconnect();
        hello2Client.disconnect();
    }
}
