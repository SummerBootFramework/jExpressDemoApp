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
import org.jexpress.demoapp.integration.grpc.client.MyGrpcClient;
import org.jexpress.demoapp.integration.httpclient.MyHttpClient;
import org.jexpress.demoapp.processor.template.DataProcessor;
import org.jexpress.demoapp.processor.template.SinglePageHeightCalculationListener;
import org.jexpress.demoapp.service.BusinessService;
import org.jexpress.demoapp.service.MyErrorCode;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.api.common.BootPoi;
import org.summerboot.jexpress.api.common.Err;
import org.summerboot.jexpress.api.common.SessionContext;
import org.summerboot.jexpress.infra.netty.config.NioConfig;
import org.summerboot.jexpress.integration.pdf.PdfBuilder;
import org.summerboot.jexpress.integration.pdf.PdfBuilderConfig;
import org.summerboot.jexpress.integration.pdf.ProtectionSpec;
import org.summerboot.jexpress.integration.template.freemarker.FreeMarker;
import org.summerboot.jexpress.util.concurrent.ConcurrentUtil;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
@Singleton
@Service // default bind to the interface it is implemented
public class BusinessServiceImpl1 implements BusinessService {
    protected static Injector injector;
    protected static PdfBuilder pdfBuilder;
    protected static FreeMarker freeMarker;
    protected final static Map<String, Template> FreeMarkerTemplates = new HashMap<>();

    @Inject
    protected MyHttpClient myHttpClient;

    @Inject
    private MyGrpcClient myGrpcClient;

    public static void init(Injector _injector) throws IOException {
        injector = _injector;
        // init
        String domainRoot = NioConfig.cfg.getRootFolder().getAbsolutePath();
        File htmlTemplateDir = new File(domainRoot + File.separator + "templates").getAbsoluteFile();
        File fontDir = new File(domainRoot + File.separator + "templates" + File.separator + "fonts").getAbsoluteFile();
        File fontCacheDir = new File(domainRoot + File.separator + "templates" + File.separator + "fontCache").getAbsoluteFile();
        pdfBuilder = PdfBuilder.init(htmlTemplateDir, fontDir, fontCacheDir);
        PdfBuilder.SinglePageHeightCalculationListener listener = injector.getInstance(SinglePageHeightCalculationListener.class);
        pdfBuilder.addListener(listener);
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
            context.poi(BootPoi.GRPC_BEGIN);// about POI, see section8.3
            greeting = myGrpcClient.hello1(greeting, "lastName222");
            context.poi(BootPoi.GRPC_END);

            // step 2: update result in DB
            context.poi(BootPoi.DB_BEGIN);// about POI, see section8.3
            long randomMillis = ThreadLocalRandom.current().nextLong(100, 501);
            TimeUnit.MILLISECONDS.sleep(randomMillis);
            context.poi(BootPoi.DB_END);

            // step 3: call http client to get a response from another service
            // 3.1 set request.limiter.max.concurrent=2 and request.limiter.queuing.timeout.ms=0 and request.timeout.ms=6000 in run/standalone_prod/configuration folder to control the http client concurrency limit, default is no limit
            // 3.2 set Response_Delay_Second=5 in MockService\run\mock_response\mockservice\myservice\hello_POST.properties to simulate a slow response from the mock service
            // 3.3 add JSON text of MyResponse (see bottom of this file) into MockService\run\mock_response\mockservice\myservice\hello_POST.txt to simulate a static response from the mock service
            int size = 3;
            List<MyResponse> myResults = new ArrayList<>(size);
            List<Callable<MyResponse>> tasks = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                final int idx = i; // capture at task-creation time, not execution time
                Callable<MyResponse> task = () -> httpRpc(idx, myHttpClient, context);
                tasks.add(task);
            }
            long start = System.currentTimeMillis();
            try {
                ConcurrentUtil.runAndWaitForAllResults(tasks, myResults);
            } catch (ExecutionException e) {
                e.printStackTrace();
            }
            long cost = System.currentTimeMillis() - start;
            System.out.println("cost=" + cost);


            // step 4a: build HTML template with FreeMarker
            String templateName = DataProcessor.NAME1;
            DataProcessor processor = injector.getInstance(Key.get(DataProcessor.class, Names.named(templateName)));
            Map<String, Object> dataModel = processor.buildModel(context.txId(), greeting, myRequest);
            Template template = FreeMarkerTemplates.get(templateName);
            String htmlContent = freeMarker.generate(template, dataModel);

            // step 4b: build PDF with protection
            PdfBuilderConfig cfg = PdfBuilderConfig.buildProtectedConfig();
            cfg.setOwnerPwd(myRequest.ownerPwd());
            cfg.setUserPwd(myRequest.userPwd());
            cfg.setPdfVersion(myRequest.pdfVersion());
            cfg.getDocInfo().setProducer("jExpress");
            cfg.setProtectionSpec(ProtectionSpec.PROTECTED);
            byte[] pdf = pdfBuilder.htmlToPdf(context.txId(), htmlContent, cfg, context);
            String pdfBase64 = PdfBuilder.base64Encode(pdf);
            Long pdfCrc = PdfBuilder.crc(pdf);

            List<byte[]> imagePages = pdfBuilder.pdf2Images(context.txId(), pdf, cfg.getUserPwd(), ImageType.RGB, 300f, "png", RenderDestination.EXPORT, context);
            List<String> imageBase64List = new ArrayList<>(imagePages.size());
            for (byte[] imagePage : imagePages) {
                String imageBase64 = PdfBuilder.base64Encode(imagePage);
                imageBase64List.add(imageBase64);
            }

            // step 5a: build GOOD return status and response
            context.status(HttpResponseStatus.CREATED);// override, default is 200 OK
            return new MyResponse("impl1.public." + greeting + myRequest.creditCardNumber(), "impl1.private." + greeting + myRequest.creditCardNumber(),
                    myRequest.shoppingList(), pdfBase64, pdfCrc, imageBase64List);
        } catch (InterruptedException ex) {
            // Restore interrupted status
            Thread.currentThread().interrupt();

            // step 5b: build ERROR return status and response
            Err error = new Err(MyErrorCode.SystemError, null, "Interrupted", ex);
            context.error(error).status(HttpResponseStatus.INTERNAL_SERVER_ERROR);// override, default is 200 OK
            return null;
        }
    }

    private static MyResponse httpRpc(int index, MyHttpClient myHttpClient, SessionContext context) throws IOException {
        MyResponse myResponse = myHttpClient.getHello("name" + index, "body" + index, context);
        LocalDateTime now = LocalDateTime.now();
        System.out.println(now + " [" + index + "]: myResponse=" + myResponse);
        return myResponse;
    }

    /* Sample JSON text of MyResponse:
    {
  "publicInfo": "This is pulic information",
  "privateInfo": "This is private sensitive information",
  "secretList": [
    "secret-token-123",
    "secret-key-456"
  ],
  "emptyList": [],
  "nullList": null,
  "dataList": [
    "item1",
    "item2",
    "item3"
  ],
  "pdfBase64": "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGggNiAwIFIvRmlsdGVyIC9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nA==",
  "pdfCrc": 3847291045,
  "imageBase64": [
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  ]
}
     */
}
