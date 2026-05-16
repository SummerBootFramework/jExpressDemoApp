package org.jexpress.demoapp.processor.freemarker.impl;

import com.google.inject.Singleton;
import org.jexpress.demoapp.dto.MyRequest;
import org.jexpress.demoapp.processor.freemarker.DataProcessor;
import org.summerboot.jexpress.boot.annotation.Service;

import java.util.Map;

@Singleton
@Service(binding = DataProcessor.class, named = DataProcessor.NAME2)
public class InvoiceProcessor_v2 extends DataProcessor {
    @Override
    protected void processMyRequest(Map<String, Object> model, MyRequest myRequest) {

    }
}
