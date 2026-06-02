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

package org.jexpress.demoapp.processor.template.impl;

import com.google.inject.Singleton;
import org.jexpress.demoapp.dto.MyRequest;
import org.jexpress.demoapp.processor.template.DataProcessor;
import org.summerboot.jexpress.annotation.Service;

import java.util.Map;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
@Singleton
@Service(binding = DataProcessor.class, named = DataProcessor.NAME2)
public class InvoiceProcessor_v2 extends DataProcessor {
    @Override
    protected void processMyRequest(Map<String, Object> model, MyRequest myRequest) {

    }
}
