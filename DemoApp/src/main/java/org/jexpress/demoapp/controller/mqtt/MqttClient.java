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

import org.eclipse.paho.mqttv5.client.IMqttToken;
import org.eclipse.paho.mqttv5.client.MqttAsyncClient;
import org.eclipse.paho.mqttv5.client.MqttClientPersistence;
import org.eclipse.paho.mqttv5.client.MqttConnectionOptions;
import org.eclipse.paho.mqttv5.client.MqttPingSender;
import org.eclipse.paho.mqttv5.common.MqttException;
import org.eclipse.paho.mqttv5.common.MqttMessage;

import java.io.File;
import java.util.concurrent.ScheduledExecutorService;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
public class MqttClient {
    public static void send(String... messages) throws MqttException {
        MqttConnectionOptions connOpts = MyMqttClientConfig.cfg.buildConnectionOptions();
        connOpts.setCleanStart(MyMqttClientConfig.cfg.isCleanStart());

        File file = new File(".").getAbsoluteFile();
        MqttClientPersistence persistence = null;//new MqttDefaultFilePersistence(file.getAbsolutePath());
        MqttPingSender pingSender = null;
        ScheduledExecutorService executorService = null;
        MqttAsyncClient asyncClient = MyMqttClientConfig.cfg.build(persistence, pingSender, executorService);
        IMqttToken token = asyncClient.connect(connOpts);
        token.waitForCompletion();
        System.out.println("MQTT Connected");

        try {
            int qos = MyMqttClientConfig.cfg.getDefaultQoS();
            boolean isRetained = MyMqttClientConfig.cfg.isRetain();
            String topic = MyMqttClientConfig.cfg.getTopic();

            for (String message : messages) {
                message += " " + System.currentTimeMillis();
                MqttMessage mqttMessage = new MqttMessage(message.getBytes());
                mqttMessage.setQos(qos);
                mqttMessage.setRetained(isRetained);
                token = asyncClient.publish(topic, mqttMessage);
                token.waitForCompletion();
                System.out.println("MQTT Published message: " + message);
            }
        } finally {
            MyMqttClientConfig.cfg.shutdown(asyncClient);
        }
    }
}
