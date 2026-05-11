package org.jexpress.sampleapp.controller.grpc.client;

import io.grpc.ManagedChannel;
import org.jexpress.sampleapp.grpc.proto.generated2.Hello2Request;
import org.jexpress.sampleapp.grpc.proto.generated2.Hello2Response;
import org.jexpress.sampleapp.grpc.proto.generated2.Hello2ServiceGrpc;
import org.summerboot.jexpress.nio.grpc.BearerAuthCredential;
import org.summerboot.jexpress.nio.grpc.GRPCClient;

public class Hello2ClientImpl extends GRPCClient<Hello2ClientImpl> {
    private Hello2ServiceGrpc.Hello2ServiceBlockingStub blockingStub;

    @Override
    protected void onConnected(ManagedChannel channel) {
        String jwt = "jwt2";
        BearerAuthCredential bearerAuthCredential = new BearerAuthCredential(jwt);
        this.blockingStub = Hello2ServiceGrpc.newBlockingStub(channel);//.withCallCredentials(bearerAuthCredential);
    }

    public String hello(String firstName, String lastName) {
        Hello2Request request = Hello2Request.newBuilder()
                .setFirstName(firstName)
                .setLastName(lastName)
                .build();
        Hello2Response response = blockingStub.hello2(request);
        return response.getGreeting();
    }
}
