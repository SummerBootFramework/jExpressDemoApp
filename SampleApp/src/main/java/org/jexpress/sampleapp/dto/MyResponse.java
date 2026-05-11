package org.jexpress.sampleapp.dto;

import java.util.List;

public record MyResponse(
        String publicInfo,
        String privateInfo,
        List<String> secretList,
        List<String> emptyList,
        List<String> nullList,
        List<String> dataList
) {

    public MyResponse(String publicInfo, String privateInfo, List<String> dataList) {
        this(publicInfo, privateInfo, List.of("pwd1", "pwd2"), List.of(), null, dataList);
    }
}
