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

package org.jexpress.demoapp.controller.grpc.impl;

import org.jexpress.demoapp.controller.grpc.Hello1Service;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.boot.BootConstants;
import org.summerboot.jexpress.core.error.BootErrorCode;

@Service(binding = Hello1Service.class, AlternativeName = "hawaii_1")
public class Hello1ServiceImpl_B extends Hello1Service {
    @Override
    protected int ping() {
        return BootErrorCode.OK;
    }

    @Override
    protected String hello(String firstName, String lastName) {
        if (firstName.startsWith("error")) {
            throw new RuntimeException("my error");
        }
        return BootConstants.APP_ID + " Aloha1 " + firstName + " " + lastName;
    }

}
