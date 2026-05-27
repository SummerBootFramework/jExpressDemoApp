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

package org.jexpress.demoapp.controller.web;

import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import org.jexpress.demoapp.controller.restful.AppURI;
import org.summerboot.jexpress.annotation.Controller;
import org.summerboot.jexpress.annotation.restful.Daemon;
import org.summerboot.jexpress.controller.SessionContext;
import org.summerboot.jexpress.controller.web.WebResourceController;
import org.summerboot.jexpress.webserver.netty.NioConfig;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Controller
public class WebController extends WebResourceController {

    private static final String File_HTML1 = "pages" + File.separator + "page1.html";
    private static final String File_HTML2 = "pages" + File.separator + "page2.html";
    private static final String File_PDF = "pages" + File.separator + "invoice.pdf";


    @GET
    @Path("/web")
    @Daemon
    public void welcomePage(final SessionContext context) {
        context.response("index.html", false);
    }

    @GET
    @Path("/ws")
    public void webscoket(final SessionContext context) {
        context.response("websocket_client.html", false);
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/redirect") // https://localhost:8311/sampleapp/service/v2/redirect
    public void redirect(final SessionContext context) {
        context.redirect(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/html/display");
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/html/display") // https://localhost:8311/sampleapp/service/v2/html/display
    public File htmlDownload(final SessionContext context) {
        context.downloadMode(false);
        return new File(File_HTML1);
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/html/download") // https://localhost:8311/sampleapp/service/v2/html/download
    public File htmlDisplay() {
        return new File(File_HTML1);
    }


    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/pdf/display") // https://localhost:8311/sampleapp/service/v2/pdf/display
    public File pdfDisplay(final SessionContext context) {
        context.downloadMode(false);
        return new File(File_PDF);
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/pdf/download") // https://localhost:8311/sampleapp/service/v2/pdf/download
    public File pdfDownloadFile() {
        return new File(File_PDF);
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/pdf/download2") // https://localhost:8311/sampleapp/service/v2/pdf/download2
    public java.nio.file.Path pdfDownloadPath() {
        return new File(File_PDF).toPath();
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/pdf/download3/{fileName}") // https://localhost:8311/sampleapp/service/v2/pdf/download3/myfilename
    public byte[] pdfDownloadData(@PathParam("fileName") String fileName, final SessionContext context) throws IOException {
        if (fileName != null) {
            context.downloadFleName(fileName);
        }
        java.nio.file.Path path = Paths.get(NioConfig.cfg.getDocrootDir(), File_PDF);
        byte[] fileBytes = Files.readAllBytes(path);
        return fileBytes;
    }

    // https://localhost:8311/sampleapp/service/v2/download?file=pages/page2.html (200 OK)
    // https://localhost:8311/sampleapp/service/v2/download?file=pages/page3.html (404 not found)
    // https://localhost:8311/sampleapp/service/v2/download?file=../configuration/jwt_private.key (403 forbidden)
    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/download")
    public File download(@NotNull @QueryParam("file") String filename, final SessionContext context) {
        context.downloadMode(false);
        return new File(filename);
    }

    @Override
    protected String getFaviconPath() {
        return "web-resources/images/favicon.ico";
    }
}