package org.jexpress.demoapp.controller.websocket;

import io.netty.channel.ChannelHandlerContext;
import org.summerboot.jexpress.nio.server.BootWebSocketHandler;
import org.summerboot.jexpress.security.auth.Caller;
import org.summerboot.jexpress.security.auth.User;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * client - /run/websocket_client.html
 */
//@ChannelHandler.Sharable
//@Singleton
//@Service(binding = ChannelHandler.class, named = "/mywebsocket/demo2", type = Service.ChannelHandlerType.Websocket)
public class ChatRoomWebSocketHandler2 extends BootWebSocketHandler {

    private final StringBuilder history = new StringBuilder();

    private static final DateTimeFormatter DTF = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    private static final String ID = "[ws2] ";

    private static String getId(Caller caller) {
        return OffsetDateTime.now().truncatedTo(ChronoUnit.SECONDS).format(DTF) + " [" + caller.getUid() + "]: ";
    }

    @Override
    protected Caller auth(String token) {
        return new User(null, token);
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
        sendToAllChannels(msg, true);
        return null;
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
