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
import org.summerboot.jexpress.nio.server.websocket.BootWebSocketHandler;
import org.summerboot.jexpress.security.auth.Caller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@ChannelHandler.Sharable
@Singleton
@Service(binding = ChannelHandler.class, named = "/ws/chat2", type = Service.ChannelHandlerType.Websocket)
public class ChatRoomWebSocketHandler2 extends BootWebSocketHandler {

    private final StringBuilder history = new StringBuilder();

    private static final DateTimeFormatter DTF = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private static final String ID = "[ws2] ";

    private static String getId(Caller caller) {
        return OffsetDateTime.now().truncatedTo(ChronoUnit.SECONDS).format(DTF) + " [" + caller.getUid() + "]: ";
    }

    @Override
    protected Caller auth(Caller caller) {
        return caller;
    }

    @Override
    protected String onCallerConnected(ChannelHandlerContext ctx, Caller caller) {
        sendToChannel(ctx, history.toString());
        String msg = ID + getId(caller) + "joined from " + ctx.channel().remoteAddress();
        history.append(msg).append("\n");
        return msg;
    }

    @Override
    protected String onMessage(ChannelHandlerContext ctx, Caller caller, String txt) {
        log.debug(() -> caller + " sent: " + txt);
        String msg = ID + getId(caller) + txt;
        history.append(msg).append("\n");
        //sendToAllChannels(msg, true);
        return msg;
    }

    @Override
    protected String onMessage(ChannelHandlerContext ctx, Caller caller, byte[] data) {
        File outputFile = new File(ID + "aaa").getAbsoluteFile();
        System.out.println(outputFile);
        try {
            Files.write(outputFile.toPath(), data);
        } catch (IOException ex) {
            ex.printStackTrace();
        }
        sendToAllChannels(data, false);
        return null;
    }

}
