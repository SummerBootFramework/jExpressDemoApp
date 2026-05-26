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

package org.jexpress.demoapp.integration.healthcheck;

import org.summerboot.jexpress.boot.annotation.HealthCheck;
import org.summerboot.jexpress.controller.Err;
import org.summerboot.jexpress.integration.healthcheck.HealthChecker;

import java.util.List;

@HealthCheck
public class MyHealthChecker2 implements HealthChecker {
    public static int error = 0;

    @Override
    public List<Err> ping(Object... param) {
        if (error == 0) {
            return null;
        }

        return List.of(new Err(error, "checker2.etag", "checker2.eDesc", new Exception("checker2.mock exception")));
    }
}
