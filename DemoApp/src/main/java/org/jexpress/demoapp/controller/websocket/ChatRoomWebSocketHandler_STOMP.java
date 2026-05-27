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
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelId;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.group.ChannelGroup;
import io.netty.channel.group.DefaultChannelGroup;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.stomp.StompCommand;
import io.netty.handler.codec.stomp.StompFrame;
import io.netty.handler.codec.stomp.StompHeaders;
import io.netty.util.CharsetUtil;
import io.netty.util.concurrent.GlobalEventExecutor;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.controller.authenticate.Caller;
import org.summerboot.jexpress.controller.websocket.WebSocketAuthHandler_OTT;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * client - /run/websocket_client.html
 */
@ChannelHandler.Sharable
@Singleton
@Service(binding = ChannelHandler.class, named = "/ws/chatroom2", type = Service.ChannelHandlerType.Websocket)
public class ChatRoomWebSocketHandler_STOMP extends SimpleChannelInboundHandler<StompFrame> {
    private static final ConcurrentHashMap<String, ChannelGroup> rooms = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<String, ConcurrentHashMap<ChannelId, String>> roomSubscriptions = new ConcurrentHashMap<>();
    private static final AtomicLong messageIdSeq = new AtomicLong(0);

    private static final String DEFAULT_ROOM = "lobby";

    public static ChannelGroup getRoomChannels(String roomId) {
        if (roomId == null) {
            roomId = DEFAULT_ROOM;
        }
        // 如果房间不存在，自动创建一个新的 ChannelGroup
        return rooms.computeIfAbsent(roomId, k ->
                new DefaultChannelGroup(GlobalEventExecutor.INSTANCE)
        );
    }

    private static String normalizeDestination(StompCommand cmd, String destination) {
        if (destination == null || destination.isBlank()) {
            return DEFAULT_ROOM;
        }
        // UI sends SEND to /app/chat and SUBSCRIBE to /topic/messages.
        // Route SEND commands to the broadcast topic so subscribers can receive messages.
        if (cmd == StompCommand.SEND && destination.startsWith("/app/")) {
            return "/topic/messages";
        }
        return destination;
    }

    private static void subscribe(ChannelHandlerContext ctx, String destination, String subscriptionId) {
        getRoomChannels(destination).add(ctx.channel());
        roomSubscriptions
                .computeIfAbsent(destination, k -> new ConcurrentHashMap<>())
                .put(ctx.channel().id(), subscriptionId);
    }

    private static void unsubscribe(ChannelHandlerContext ctx, String subscriptionId) {
        ChannelId channelId = ctx.channel().id();
        roomSubscriptions.forEach((destination, subscriptions) -> {
            String existing = subscriptions.get(channelId);
            if (existing != null && existing.equals(subscriptionId)) {
                subscriptions.remove(channelId);
                ChannelGroup room = rooms.get(destination);
                if (room != null) {
                    room.remove(ctx.channel());
                }
            }
        });
    }

    private static void removeChannelFromAllRooms(ChannelHandlerContext ctx) {
        ChannelId channelId = ctx.channel().id();
        roomSubscriptions.forEach((destination, subscriptions) -> {
            subscriptions.remove(channelId);
            ChannelGroup room = rooms.get(destination);
            if (room != null) {
                room.remove(ctx.channel());
            }
        });
    }

    private static void sendConnectedFrame(ChannelHandlerContext ctx, StompHeaders headers) {
        String acceptVersion = headers.getAsString(StompHeaders.ACCEPT_VERSION);
        String version = "1.2";
        if (acceptVersion != null && !acceptVersion.isBlank()) {
            if (acceptVersion.contains("1.2")) {
                version = "1.2";
            } else if (acceptVersion.contains("1.1")) {
                version = "1.1";
            } else if (acceptVersion.contains("1.0")) {
                version = "1.0";
            }
        }
        String connectedFrame = "CONNECTED\n"
                + "version:" + version + "\n"
                + "server:jexpress-stomp\n"
                + "heart-beat:0,0\n"
                + "\n"
                + "\0";
        ctx.writeAndFlush(new TextWebSocketFrame(connectedFrame));
    }

    private static void handleDisconnect(ChannelHandlerContext ctx, StompHeaders headers) {
        String receipt = headers.getAsString(StompHeaders.RECEIPT);
        if (receipt != null && !receipt.isBlank()) {
            String receiptFrame = "RECEIPT\n"
                    + "receipt-id:" + receipt + "\n"
                    + "\n"
                    + "\0";
            ctx.writeAndFlush(new TextWebSocketFrame(receiptFrame));
        }
        removeChannelFromAllRooms(ctx);
        ctx.close();
    }

    private static String buildMessageFrame(String destination, String subscriptionId, String messageId, String textBody) {
        int contentLength = textBody.getBytes(CharsetUtil.UTF_8).length;
        return "MESSAGE\n"
                + "destination:" + destination + "\n"
                + "subscription:" + subscriptionId + "\n"
                + "message-id:" + messageId + "\n"
                + "content-type:text/plain; charset=UTF-8\n"
                + "content-length:" + contentLength + "\n"
                + "\n"
                + textBody
                + "\0";
    }

    private static void broadcastToRoom(String destination, String textBody) {
        ChannelGroup room = rooms.get(destination);
        if (room == null || room.isEmpty()) {
            return;
        }
        ConcurrentHashMap<ChannelId, String> subscriptions = roomSubscriptions.get(destination);
        if (subscriptions == null || subscriptions.isEmpty()) {
            return;
        }
        room.forEach(channel -> {
            String subscriptionId = subscriptions.get(channel.id());
            if (subscriptionId == null) {
                return;
            }
            String messageId = "msg-" + messageIdSeq.incrementAndGet();
            String frame = buildMessageFrame(destination, subscriptionId, messageId, textBody);
            channel.writeAndFlush(new TextWebSocketFrame(frame));
        });
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, StompFrame msg) {
        Caller caller = ctx.channel().attr(WebSocketAuthHandler_OTT.USER_ID_KEY).get();

        // read message
        StompCommand cmd = msg.command();
        StompHeaders headers = msg.headers();
        String destination = normalizeDestination(cmd, headers.getAsString(StompHeaders.DESTINATION));
        String subscriptionId = headers.getAsString(StompHeaders.ID);
        ByteBuf content = msg.content();
        String body = content.toString(CharsetUtil.UTF_8);

        // process message
        switch (cmd) {
            case CONNECT, STOMP -> sendConnectedFrame(ctx, headers);
            case DISCONNECT -> handleDisconnect(ctx, headers);
            case SUBSCRIBE -> {
                if (subscriptionId == null || subscriptionId.isBlank()) {
                    subscriptionId = "sub-" + messageIdSeq.incrementAndGet();
                }
                subscribe(ctx, destination, subscriptionId);
                String who = caller == null ? "anonymous" : caller.getUid();
                broadcastToRoom(destination, who + " joined " + destination);
            }
            case UNSUBSCRIBE -> {
                if (subscriptionId != null && !subscriptionId.isBlank()) {
                    unsubscribe(ctx, subscriptionId);
                }
            }
            case SEND -> {
                String who = caller == null ? "anonymous" : caller.getUid();
                broadcastToRoom(destination, who + ": " + body);
            }
            default -> { /* ignore unknown commands */ }
        }
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        removeChannelFromAllRooms(ctx);
        super.channelInactive(ctx);
    }
}