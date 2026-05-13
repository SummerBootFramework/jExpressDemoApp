package org.jexpress.demoapp.controller.mqtt;

import org.summerboot.jexpress.boot.config.annotation.Config;
import org.summerboot.jexpress.boot.config.annotation.ConfigHeader;
import org.summerboot.jexpress.boot.config.annotation.ImportResource;

@ImportResource("cfg_mqttclient.properties")
public class MyMqttClientConfig extends org.summerboot.jexpress.integration.mqtt.MqttClientConfig {

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
