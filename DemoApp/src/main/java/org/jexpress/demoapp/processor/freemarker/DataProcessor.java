package org.jexpress.demoapp.processor.freemarker;

import org.jexpress.demoapp.dto.MyRequest;

import java.util.HashMap;
import java.util.Map;

public abstract class DataProcessor {
    public static final String NAME1 = "invoice_v1";
    public static final String NAME2 = "invoice_v2";

    public Map<String, Object> buildModel(String txId, String greeting, MyRequest myRequest) {
        Map<String, Object> model = new HashMap();
        model.put("txId", txId);
        model.put("greeting", greeting);
        processMyRequest(model, myRequest);
        return model;
    }

    abstract protected void processMyRequest(Map<String, Object> model, MyRequest myRequest);
}
