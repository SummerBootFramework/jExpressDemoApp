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

package org.jexpress.demoapp.processor.template;


import com.google.inject.Inject;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.api.mail.PostOffice;
import org.summerboot.jexpress.integration.pdf.PdfBuilder;
import org.summerboot.jexpress.integration.pdf.PdfBuilderConfig;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
@Service
public class SinglePageHeightCalculationListener implements PdfBuilder.SinglePageHeightCalculationListener {
    @Inject
    protected PostOffice postOffice;

    @Override
    public void onHeightCalculationRetry(int retry, int pageCount, String requesterTxId, String htmlContent, PdfBuilderConfig.Agent agent, int extraSpace, float pageHeightMillimeters) {

    }
}
