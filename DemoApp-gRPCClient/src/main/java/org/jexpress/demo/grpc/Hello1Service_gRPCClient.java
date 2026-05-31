package org.jexpress.demo.grpc;

import com.google.protobuf.Empty;
import io.grpc.ManagedChannel;
import org.jexpress.demoapp.grpc.proto.generated1.Hello1Request;
import org.jexpress.demoapp.grpc.proto.generated1.Hello1Response;
import org.jexpress.demoapp.grpc.proto.generated1.Hello1ServiceGrpc;
import org.summerboot.jexpress.grpc.client.GrpcClient;
import org.summerboot.jexpress.grpc.interceptor.BearerAuthCredential;

public class Hello1Service_gRPCClient extends GrpcClient<Hello1Service_gRPCClient> {
    private Hello1ServiceGrpc.Hello1ServiceBlockingStub blockingStub;

    @Override
    protected void onConnected(ManagedChannel channel) {
        String jwt = "jwt1";
        BearerAuthCredential bearerAuthCredential = new BearerAuthCredential(jwt);
        this.blockingStub = Hello1ServiceGrpc.newBlockingStub(channel);//.withCallCredentials(bearerAuthCredential);
    }

    /**
     * Check health status
     *
     * @return
     */
    public Hello1Response ping() {
        lock();
        try {
            return blockingStub.ping(Empty.getDefaultInstance());
        } finally {
            unlock();
        }
    }

    /**
     * Handle gRPC process only, do not handel business logic
     *
     * @param callerTxId
     * @param firstName
     * @param lastName
     * @return
     */
    public Hello1Response hello(String callerTxId, String firstName, String lastName) {
        lock();
        try {
            Hello1Request request = Hello1Request.newBuilder()
                    .setCallerTxId(callerTxId)
                    .setFirstName(firstName)
                    .setLastName(lastName)
                    .build();
            return blockingStub.hello1(request);
        } finally {
            unlock();
        }
    }
}
