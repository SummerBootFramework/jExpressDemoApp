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
import org.summerboot.jexpress.controller.authenticate.Caller;
import org.summerboot.jexpress.controller.websocket.WebSocketHandler;
import org.summerboot.jexpress.util.FileUtil;

import java.io.File;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * client - /run/websocket_client.html
 */
@ChannelHandler.Sharable
@Singleton
@Service(binding = ChannelHandler.class, named = "/ws/chatroom2", type = Service.ChannelHandlerType.Websocket)
public class ChatRoomWebSocketHandler_v2 extends WebSocketHandler {
    private static final String ID = "[v2] ";
    private static final DateTimeFormatter DTF = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private static String getId(Caller caller) {
        return OffsetDateTime.now().truncatedTo(ChronoUnit.SECONDS).format(DTF) + " [" + caller.getUid() + "]: ";
    }

    @Override
    protected String onCallerSubscribe(ChannelHandlerContext ctx, String roomId, Caller caller, boolean isSubscribe) {
        return ID + getId(caller) + (isSubscribe ? "joined" : "left") + " from " + ctx.channel().remoteAddress();
    }

    @Override
    protected String onMessageReceived(ChannelHandlerContext ctx, String roomId, Caller caller, String text) {
        return ID + getId(caller) + text;
    }

    @Override
    protected boolean onFileRecevied(ChannelHandlerContext ctx, String roomId, Caller caller, File file, FileUtil.FileTypeInfo fileTypeInfo, StringBuilder message) {
        String msg = ID + getId(caller) + "sent a " + fileTypeInfo.getExtension() + " file (" + FileUtil.formatFileSize(file.length()) + "): " + file.getName();
        message.append(msg);
        return true;
    }
}
