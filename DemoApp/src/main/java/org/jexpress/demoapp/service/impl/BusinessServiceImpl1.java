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

package org.jexpress.demoapp.service.impl;

import com.google.inject.Binding;
import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.Key;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.google.inject.TypeLiteral;
import com.google.inject.name.Names;
import freemarker.template.Template;
import io.netty.handler.codec.http.HttpResponseStatus;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.RenderDestination;
import org.jexpress.demoapp.dto.MyRequest;
import org.jexpress.demoapp.dto.MyResponse;
import org.jexpress.demoapp.processor.freemarker.DataProcessor;
import org.jexpress.demoapp.service.BusinessService;
import org.jexpress.demoapp.service.MyErrorCode;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.boot.BootPOI;
import org.summerboot.jexpress.controller.Err;
import org.summerboot.jexpress.controller.SessionContext;
import org.summerboot.jexpress.integration.pdf.PDFBuilder;
import org.summerboot.jexpress.integration.pdf.PDFBuilderConfig;
import org.summerboot.jexpress.integration.pdf.ProtectionSpec;
import org.summerboot.jexpress.integration.smtp.PostOffice;
import org.summerboot.jexpress.integration.templateengine.FreeMarker;
import org.summerboot.jexpress.webserver.netty.NioConfig;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

@Singleton
@Service // default bind to the interface it is implemented
public class BusinessServiceImpl1 implements BusinessService {
    protected static Injector injector;
    protected static PDFBuilder pdfBuilder;
    protected static FreeMarker freeMarker;
    protected final static Map<String, Template> FreeMarkerTemplates = new HashMap<>();

    @Inject
    protected PostOffice postOffice;

    public static void init(Injector _injector) throws IOException {
        injector = _injector;
        // init
        String domainRoot = NioConfig.cfg.getRootFolder().getAbsolutePath();
        File htmlTemplateDir = new File(domainRoot + File.separator + "templates").getAbsoluteFile();
        File fontDir = new File(domainRoot + File.separator + "templates" + File.separator + "fonts").getAbsoluteFile();
        File fontCacheDir = new File(domainRoot + File.separator + "templates" + File.separator + "fontCache").getAbsoluteFile();
        pdfBuilder = PDFBuilder.init(htmlTemplateDir, fontDir, fontCacheDir);
        freeMarker = freeMarker.init(htmlTemplateDir);

        // build FreeMarker (processor <--> templates)
        List<Binding<DataProcessor>> bindings = injector.findBindingsByType(new TypeLiteral<DataProcessor>() {
        });
        FreeMarkerTemplates.clear();
        for (Binding<DataProcessor> binding : bindings) {
            Provider<DataProcessor> p = binding.getProvider();
            DataProcessor processor = p.get();
            Service annotation = processor.getClass().getAnnotation(Service.class);
            if (annotation == null) {
                continue;
            }
            String templateName = annotation.named();
            if (FreeMarkerTemplates.containsKey(templateName)) {
                continue;
            }
            Template template = freeMarker.getTemplate(templateName + ".html");
            FreeMarkerTemplates.put(templateName, template);
        }
    }

    @Override
    public MyResponse process(String greeting, MyRequest myRequest, final SessionContext context) throws IOException {
        try {
            // step 1: call gRPC for a transaction
            context.poi(BootPOI.GRPC_BEGIN);// about POI, see section8.3
            long randomMillis = ThreadLocalRandom.current().nextLong(100, 501);
            TimeUnit.MILLISECONDS.sleep(randomMillis);
            context.poi(BootPOI.GRPC_END);

            // step 2: update result in DB
            context.poi(BootPOI.DB_BEGIN);// about POI, see section8.3
            randomMillis = ThreadLocalRandom.current().nextLong(100, 501);
            TimeUnit.MILLISECONDS.sleep(randomMillis);
            context.poi(BootPOI.DB_END);

            // step 3a: build HTML template with FreeMarker
            String templateName = DataProcessor.NAME1;
            DataProcessor processor = injector.getInstance(Key.get(DataProcessor.class, Names.named(templateName)));
            Map<String, Object> dataModel = processor.buildModel(context.txId(), greeting, myRequest);
            Template template = FreeMarkerTemplates.get(templateName);
            String htmlContent = freeMarker.generate(template, dataModel);

            // step 3b: build PDF with protection
            PDFBuilderConfig cfg = PDFBuilderConfig.buildProtectedConfig();
            cfg.setOwnerPwd(myRequest.ownerPwd());
            cfg.setUserPwd(myRequest.userPwd());
            cfg.setPdfVersion(myRequest.pdfVersion());
            cfg.getDocInfo().setProducer("jExpress");
            cfg.setProtectionSpec(ProtectionSpec.PROTECTED);
            byte[] pdf = pdfBuilder.html2PDF(context.txId(), htmlContent, false, cfg, postOffice, context);
            String pdfBase64 = PDFBuilder.base64Encode(pdf);
            Long pdfCrc = PDFBuilder.crc(pdf);

            List<byte[]> imagePages = pdfBuilder.pdf2Images(context.txId(), pdf, cfg.getUserPwd(), ImageType.RGB, 300f, "png", RenderDestination.EXPORT, context);
            List<String> imageBase64List = new ArrayList<>(imagePages.size());
            for (byte[] imagePage : imagePages) {
                String imageBase64 = PDFBuilder.base64Encode(imagePage);
                imageBase64List.add(imageBase64);
            }

            // step 4a: build GOOD return status and response
            context.status(HttpResponseStatus.CREATED);// override, default is 200 OK
            return new MyResponse("impl1.public." + greeting + myRequest.creditCardNumber(), "impl1.private." + greeting + myRequest.creditCardNumber(),
                    myRequest.shoppingList(), pdfBase64, pdfCrc, imageBase64List);
        } catch (InterruptedException ex) {
            // Restore interrupted status
            Thread.currentThread().interrupt();

            // step 4b: build ERROR return status and response
            Err error = new Err(MyErrorCode.SystemError, null, "Interrupted", ex);
            context.error(error).status(HttpResponseStatus.INTERNAL_SERVER_ERROR);// override, default is 200 OK
            return null;
        }
    }
}
