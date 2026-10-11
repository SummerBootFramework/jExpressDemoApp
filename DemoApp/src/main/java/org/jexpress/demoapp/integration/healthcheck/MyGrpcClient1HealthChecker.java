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

import com.google.inject.Inject;
import org.jexpress.demoapp.integration.grpc.client.MyGrpcClient;
import org.summerboot.jexpress.annotation.health.HealthCheck;
import org.summerboot.jexpress.api.common.BootErrorCode;
import org.summerboot.jexpress.api.common.Err;
import org.summerboot.jexpress.api.health.HealthChecker;

import java.util.ArrayList;
import java.util.List;

@HealthCheck(name = MyGrpcClient1HealthChecker.NAME)
public class MyGrpcClient1HealthChecker implements HealthChecker {
    public static final String NAME = "MyGrpcClient1HealthChecker";

    @Inject
    private MyGrpcClient myGrpcClient;

    @Override
    public List<Err> ping(Object[] param) {
        List<Err> errors = new ArrayList<>();
        try {
            int result = myGrpcClient.ping1();
            if (result != BootErrorCode.OK) {
                errors.add(new Err(BootErrorCode.ACCESS_ERROR_RPC, NAME, "GrpcClient1: Unexpected response: " + result, null));
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            errors.add(new Err(BootErrorCode.ACCESS_ERROR_RPC, NAME, "GrpcClient1: Error occurred while pinging: " + ex.toString(), ex));
        }
        try {
            int result = myGrpcClient.ping2();
            if (result != BootErrorCode.OK) {
                errors.add(new Err(BootErrorCode.ACCESS_ERROR_RPC, NAME, "GrpcClient2: Unexpected response: " + result, null));
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            errors.add(new Err(BootErrorCode.ACCESS_ERROR_RPC, NAME, "GrpcClient2: Error occurred while pinging: " + ex.toString(), ex));
        }
        return errors;
    }
}
