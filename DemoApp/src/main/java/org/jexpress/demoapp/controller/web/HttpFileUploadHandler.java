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

import com.google.inject.Inject;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.codec.http.HttpMethod;
import io.netty.handler.codec.http.HttpResponseStatus;
import org.jexpress.demoapp.controller.restful.AppURI;
import org.summerboot.jexpress.boot.BootErrorCode;
import org.summerboot.jexpress.boot.annotation.Service;
import org.summerboot.jexpress.controller.Err;
import org.summerboot.jexpress.controller.SessionContext;
import org.summerboot.jexpress.controller.authenticate.Authenticator;
import org.summerboot.jexpress.controller.authenticate.Caller;
import org.summerboot.jexpress.controller.web.BootHttpFileUploadHandler;
import org.summerboot.jexpress.integration.cache.AuthTokenCache;
import org.summerboot.jexpress.webserver.netty.NioConfig;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@Service(binding = ChannelHandler.class, named = "MyUpload", type = Service.ChannelHandlerType.FileUpload)
public class HttpFileUploadHandler extends BootHttpFileUploadHandler<Object> {

    @Inject
    private Authenticator auth;

    //@Inject
    private AuthTokenCache cache = null;

    @Override
    protected boolean isValidRequestPath(HttpMethod method, String httpRequestPath, SessionContext context) {
        return HttpMethod.POST.equals(method) && httpRequestPath.startsWith(AppURI.API_NF_FILE_UPLOAD);
    }

    @Override
    protected Caller authenticate(final HttpHeaders httpHeaders, SessionContext context) {
        Caller caller = auth.verifyToken(httpHeaders, cache, null, context);
        if (caller != null && !caller.isInRole("User")) {
            return null;
        }
        return caller;
    }

    @Override
    protected long getCallerFileUploadSizeLimit_Bytes(Caller caller, SessionContext context) {
//        if (caller == null) {
//            return 0;
//        }
//        if (caller.isInRole(Role.AppAdmin)) {
//            return Long.MAX_VALUE;
//        }
        return Long.MAX_VALUE;
    }

    @Override
    protected Object onFileUploaded(ChannelHandlerContext ctx, String fileName, File file, Map<String, String> params, Caller caller, SessionContext context) {
        try {
            Path src = file.toPath().toAbsolutePath();
            //Path dest = src.resolveSibling(fileName + "_" + this.hashCode() + "_" + System.currentTimeMillis());
            Path dest = Paths.get(NioConfig.instance(NioConfig.class).getTempUoloadDir(), String.valueOf(caller.getId()), fileName);
            File f = dest.toFile();
            f.mkdirs();
            Files.move(src, dest, StandardCopyOption.REPLACE_EXISTING);
            context.status(HttpResponseStatus.OK);
            return fileName;
        } catch (IOException ex) {
            Err err = new Err(BootErrorCode.NIO_UNEXPECTED_SERVICE_FAILURE, null, "Failed to uploaded " + fileName, ex);
            context.error(err).status(HttpResponseStatus.INTERNAL_SERVER_ERROR);
            return null;
        } catch (Throwable ex) {//todo: hide internal info
            Err err = new Err(BootErrorCode.NIO_UNEXPECTED_SERVICE_FAILURE, null, "Failed to uploaded " + fileName, ex);
            context.error(err).status(HttpResponseStatus.INTERNAL_SERVER_ERROR);
            return null;
        }
    }
}
