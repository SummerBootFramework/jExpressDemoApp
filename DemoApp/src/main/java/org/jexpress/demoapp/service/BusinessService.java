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

package org.jexpress.demoapp.service;

import org.jexpress.demoapp.dto.MyRequest;
import org.jexpress.demoapp.dto.MyResponse;
import org.summerboot.jexpress.controller.SessionContext;

import java.io.IOException;

public interface BusinessService {

    MyResponse process(String greeting, MyRequest request, final SessionContext context) throws IOException;
}
