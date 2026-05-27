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

package org.jexpress.demoapp.processor.freemarker.impl;

import com.google.inject.Singleton;
import org.jexpress.demoapp.dto.ItemDto;
import org.jexpress.demoapp.dto.MyRequest;
import org.jexpress.demoapp.processor.freemarker.DataProcessor;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.util.FormatterUtil;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Singleton
@Service(binding = DataProcessor.class, named = DataProcessor.NAME1)
public class InvoiceProcessor_v1 extends DataProcessor {
    @Override
    protected void processMyRequest(Map<String, Object> model, MyRequest myRequest) {
        model.put("creditCardNumber", myRequest.creditCardNumber());

        List<ItemDto> itemList = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (String shoppingItem : myRequest.shoppingList()) {
            BigDecimal itemAmount = new BigDecimal(Math.random() * 100);
            totalAmount = totalAmount.add(itemAmount);
            ItemDto item = new ItemDto(LocalDate.now(), shoppingItem, itemAmount);
            itemList.add(item);
        }
        model.put("itemList", itemList);
        model.put("totalAmount", FormatterUtil.formatCurrencyRetail(totalAmount));
    }
}
