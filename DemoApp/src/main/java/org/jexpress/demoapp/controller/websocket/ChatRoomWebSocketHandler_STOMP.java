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
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.group.ChannelGroup;
import io.netty.channel.group.DefaultChannelGroup;
import io.netty.handler.codec.stomp.DefaultStompFrame;
import io.netty.handler.codec.stomp.StompCommand;
import io.netty.handler.codec.stomp.StompFrame;
import io.netty.handler.codec.stomp.StompHeaders;
import io.netty.util.CharsetUtil;
import io.netty.util.concurrent.GlobalEventExecutor;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.controller.authenticate.Caller;
import org.summerboot.jexpress.controller.websocket.WebSocketAuthHandler_OTT;

import java.util.concurrent.ConcurrentHashMap;

/**
 * client - /run/websocket_client.html
 */
@ChannelHandler.Sharable
@Singleton
@Service(binding = ChannelHandler.class, named = "/ws/chatroom2", type = Service.ChannelHandlerType.Websocket)
public class ChatRoomWebSocketHandler_STOMP extends SimpleChannelInboundHandler<StompFrame> {
    private static final ConcurrentHashMap<String, ChannelGroup> rooms = new ConcurrentHashMap<>();

    public static ChannelGroup getRoomChannels(String roomId) {
        // 如果房间不存在，自动创建一个新的 ChannelGroup
        return rooms.computeIfAbsent(roomId, k ->
                new DefaultChannelGroup(GlobalEventExecutor.INSTANCE)
        );
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, StompFrame msg) throws Exception {
        Caller caller = ctx.channel().attr(WebSocketAuthHandler_OTT.USER_ID_KEY).get();

        // read message
        StompCommand cmd = msg.command();
        StompHeaders headers = msg.headers();
        String destination = headers.getAsString(StompHeaders.DESTINATION);
        int contentLength = headers.getInt(StompHeaders.CONTENT_LENGTH, 0);
        boolean hasAcceptVersion = headers.contains(StompHeaders.ACCEPT_VERSION);
        ByteBuf content = msg.content();
        String body = content.toString(CharsetUtil.UTF_8);

        // process message
        ChannelGroup roomChannels = getRoomChannels(destination);
        switch (cmd) {
            case SUBSCRIBE -> {
                roomChannels.add(ctx.channel());
            }
            case UNSUBSCRIBE -> {
                roomChannels.remove(ctx.channel());
            }
        }

        // build reply message
        ByteBuf responseBody = Unpooled.copiedBuffer("blah x 3", CharsetUtil.UTF_8);
        StompFrame response = new DefaultStompFrame(StompCommand.MESSAGE, responseBody);
        response.headers().set(StompHeaders.DESTINATION, destination);
        response.headers().set(StompHeaders.CONTENT_TYPE, "text/plain");

        // broadcast message
        roomChannels.writeAndFlush(response);
    }
}
