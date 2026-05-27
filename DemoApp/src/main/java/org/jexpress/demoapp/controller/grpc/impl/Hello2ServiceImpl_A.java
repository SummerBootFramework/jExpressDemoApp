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

import org.jexpress.demoapp.controller.grpc.Hello2Service;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.boot.BootConstant;
import org.summerboot.jexpress.boot.BootErrorCode;

@Service(binding = Hello2Service.class)
public class Hello2ServiceImpl_A extends Hello2Service {
    @Override
    protected int ping() {
        return BootErrorCode.OK;
    }

    @Override
    protected String hello(String firstName, String lastName) {
        return BootConstant.APP_ID + " Hello2 " + firstName + " " + lastName;
    }

}
