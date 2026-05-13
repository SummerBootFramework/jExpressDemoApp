package org.jexpress.demoapp.controller.web;

import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import org.jexpress.demoapp.controller.restful.AppURI;
import org.summerboot.jexpress.boot.annotation.Controller;
import org.summerboot.jexpress.nio.server.SessionContext;
import org.summerboot.jexpress.nio.server.ws.rs.WebResourceController;

import java.io.File;

@Controller
public class WebController extends WebResourceController {

    private static final String WELCOME_PAGE1 = "pages" + File.separator + "page1.html";
    private static final String WELCOME_PAGE2 = "pages" + File.separator + "page2.html";

    @GET
    @Path("/web")
    public void welcomePage(final SessionContext context) {
        context.response("index.html", false);
    }

    @GET
    @Path("/ws")
    public void webscoket(final SessionContext context) {
        context.response("websocket_client.html", false);
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/page1") // https://localhost:8311/sampleapp/service/v2
    public void download1(final SessionContext context) {
        context.response(WELCOME_PAGE1, false);
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/page2") // https://localhost:8311/sampleapp/service/v2/page2
    public void download2(final SessionContext context) {
        context.response(WELCOME_PAGE2, false);
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/redirect")
    public void redirect(final SessionContext context) {
        context.redirect(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/page2");
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/download/{downloadMode}")
    public void download3(@NotNull @PathParam("downloadMode") boolean isDownloadMode, final SessionContext context) {
        context.response(WELCOME_PAGE1, isDownloadMode);
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/download403")
    public void download4(final SessionContext context) {
        context.response(new File("../tree.txt"), false);// 403 forbidden if exists
    }

    @GET
    @Path(AppURI.CONTEXT_ROOT + AppURI.WEB_VERSION + "/download3")
    public void download5(@NotNull @QueryParam("file") String filename, final SessionContext context) {
        context.response(new File(filename), false);// 403 forbidden
    }

}