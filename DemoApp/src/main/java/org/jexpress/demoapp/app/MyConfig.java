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

package org.jexpress.demoapp.app;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.summerboot.jexpress.boot.config.BootConfig;
import org.summerboot.jexpress.boot.config.ConfigUtil;
import org.summerboot.jexpress.boot.config.annotation.Config;
import org.summerboot.jexpress.boot.config.annotation.ConfigHeader;
import org.summerboot.jexpress.boot.config.annotation.ImportResource;

import java.io.File;
import java.util.Properties;

@ImportResource("cfg_app.properties")
public class MyConfig extends BootConfig {

    public static void main(String[] args) {
        String t = generateTemplate(MyConfig.class);
        System.out.println(t);
    }

    public static final MyConfig cfg = new MyConfig();

    private MyConfig() {
    }

    @ConfigHeader(title = "1. Secret things")
    @JsonIgnore
    @Config(key = "secret.licenseKey", validate = Config.Validate.Encrypted, required = true)
    protected volatile String licenseKey;

    @ConfigHeader(title = "2. Timer")
    @Config(key = "scheduler.cronExpressions", defaultValue = "0 */10 * ? * *;0 0 12 ? * FRI", collectionDelimiter = ";")
    protected volatile String[] cronExpressions;

    @Config(key = "idle.hresholdSecond", defaultValue = "7")
    protected volatile int myIdleThresholdSecond;

    @Override
    protected void loadCustomizedConfigs(File cfgFile, boolean isNotMock, ConfigUtil helper, Properties props) throws Exception {
    }

    @Override
    public void shutdown() {
    }

    public String getLicenseKey() {
        return licenseKey;
    }

    public String[] getCronExpressions() {
        return cronExpressions;
    }

    public int getMyIdleThresholdSecond() {
        return myIdleThresholdSecond;
    }
}
