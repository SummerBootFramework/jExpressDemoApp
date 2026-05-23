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

package org.jexpress.demoapp.controller.websocket;

import com.google.inject.Singleton;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import org.summerboot.jexpress.boot.annotation.Service;
import org.summerboot.jexpress.nio.server.websocket.LargeFileStreamHandler;
import org.summerboot.jexpress.security.auth.Caller;

import java.io.File;

/**
 * client - /run/websocket_client.html
 */
@ChannelHandler.Sharable
@Singleton
@Service(binding = ChannelHandler.class, named = "/ws/largefileupload", type = Service.ChannelHandlerType.Websocket)
public class LargeFileWebSocketHandler extends LargeFileStreamHandler {
    @Override
    protected void onUploadCompleted(ChannelHandlerContext ctx, File targetFile, Caller caller) {
        System.out.println("file upload completed: " + targetFile.getAbsolutePath());
    }
}
