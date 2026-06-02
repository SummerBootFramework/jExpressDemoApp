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

package org.jexpress.demoapp.dto;

import java.util.List;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
public record MyResponse(
        String publicInfo,
        String privateInfo,
        List<String> secretList,
        List<String> emptyList,
        List<String> nullList,
        List<String> dataList,
        String pdfBase64,
        Long pdfCrc,
        List<String> imageBase64
) {
    public MyResponse(String publicInfo, String privateInfo, List<String> dataList, String pdfBase64, Long pdfCrc, List<String> imageBase64) {
        this(publicInfo, privateInfo, List.of("pwd1", "pwd2"), List.of(), null, dataList, pdfBase64, pdfCrc, imageBase64);
    }

    public MyResponse(String publicInfo, String privateInfo, List<String> dataList) {
        this(publicInfo, privateInfo, List.of("pwd1", "pwd2"), List.of(), null, dataList, null, null, null);
    }
}
