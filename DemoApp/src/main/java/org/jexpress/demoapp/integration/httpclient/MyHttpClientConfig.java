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

import org.summerboot.jexpress.annotation.config.Config;
import org.summerboot.jexpress.annotation.config.ConfigFilename;
import org.summerboot.jexpress.annotation.config.ConfigHeader;
import org.summerboot.jexpress.integration.rpc.http.config.HttpClientConfig;

@ConfigFilename("cfg_httpclient.properties")
public class MyHttpClientConfig extends HttpClientConfig {
    public static void main(String... args) {
        String t = generateTemplate(MyHttpClientConfig.class);
        System.out.println(t);
    }

    public static final MyHttpClientConfig cfg = new MyHttpClientConfig();

    @ConfigHeader(title = "4. Endpoint Configuration", desc = "Endpoint configuration for the HTTP client.")
    @Config(key = "endpoint", required = true)
    private volatile String endpoint;

    public String getEndpoint() {
        return endpoint;
    }
}
