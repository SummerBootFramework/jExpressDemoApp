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

import org.summerboot.jexpress.annotation.config.ConfigFilename;
import org.summerboot.jexpress.controller.grpc.GRPCClientConfig;

@ConfigFilename("cfg_grpcclient2.properties")
public class Hello2ClientConfig extends GRPCClientConfig {

    public static void main(String... args) {
        String t = generateTemplate(Hello2ClientConfig.class);
        System.out.println(t);
    }

    public static final Hello2ClientConfig cfg = new Hello2ClientConfig();

    private Hello2ClientConfig() {
    }
}
