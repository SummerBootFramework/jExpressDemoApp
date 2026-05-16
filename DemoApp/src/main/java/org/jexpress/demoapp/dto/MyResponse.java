package org.jexpress.demoapp.dto;

import java.util.List;

public record MyResponse(
        String publicInfo,
        String privateInfo,
        List<String> secretList,
        List<String> emptyList,
        List<String> nullList,
        List<String> dataList,
        String pdfBase64,
        Long pdfCrc
) {
    public MyResponse(String publicInfo, String privateInfo, List<String> dataList, String pdfBase64, Long pdfCrc) {
        this(publicInfo, privateInfo, List.of("pwd1", "pwd2"), List.of(), null, dataList, pdfBase64, pdfCrc);
    }

    public MyResponse(String publicInfo, String privateInfo, List<String> dataList) {
        this(publicInfo, privateInfo, List.of("pwd1", "pwd2"), List.of(), null, dataList, null, null);
    }
}
