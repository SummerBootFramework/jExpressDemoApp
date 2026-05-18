package org.jexpress.demoapp.processor.freemarker.impl;

import com.google.inject.Singleton;
import org.jexpress.demoapp.dto.ItemDto;
import org.jexpress.demoapp.dto.MyRequest;
import org.jexpress.demoapp.processor.freemarker.DataProcessor;
import org.summerboot.jexpress.boot.annotation.Service;
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
