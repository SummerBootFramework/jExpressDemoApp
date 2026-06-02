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

package org.jexpress.demoapp.controller.mqtt;

import org.summerboot.jexpress.annotation.config.Config;
import org.summerboot.jexpress.annotation.config.ConfigFilename;
import org.summerboot.jexpress.annotation.config.ConfigHeader;
import org.summerboot.jexpress.integration.messaging.mqtt.config.MqttClientConfig;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
@ConfigFilename("cfg_mqttclient.properties")
public class MyMqttClientConfig extends MqttClientConfig {

    public static void main(String... args) {
        String t = generateTemplate(MyMqttClientConfig.class);
        System.out.println(t);
    }

    public static final MyMqttClientConfig cfg = new MyMqttClientConfig();

    private MyMqttClientConfig() {
    }

    @ConfigHeader(title = "6. " + ID + " pub settings")
    @Config(key = ID + ".CleanStart", defaultValue = "true")
    protected volatile boolean cleanStart;

    @Config(key = ID + ".Retain", defaultValue = "true")
    protected volatile boolean retain;

    @Config(key = ID + ".Topic")
    protected volatile String topic;

    public boolean isCleanStart() {
        return cleanStart;
    }

    public boolean isRetain() {
        return retain;
    }

    public String getTopic() {
        return topic;
    }
}
