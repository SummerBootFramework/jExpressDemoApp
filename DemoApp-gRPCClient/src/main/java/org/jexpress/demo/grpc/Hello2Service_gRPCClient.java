package org.jexpress.demo.grpc;

import com.google.protobuf.Empty;
import io.grpc.ManagedChannel;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2Request;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2Response;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2ServiceGrpc;
import org.summerboot.jexpress.grpc.client.GrpcClient;

public class Hello2Service_gRPCClient extends GrpcClient<Hello2Service_gRPCClient> {
    private Hello2ServiceGrpc.Hello2ServiceBlockingStub blockingStub;

    @Override
    protected void onConnected(ManagedChannel channel) {
        this.blockingStub = Hello2ServiceGrpc.newBlockingStub(channel);//.withCallCredentials(bearerAuthCredential);
    }

    /**
     * Check health status
     *
     * @return
     */
    public Hello2Response ping() {
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
    public Hello2Response hello(String callerTxId, String firstName, String lastName) {
        lock();
        try {
            Hello2Request request = Hello2Request.newBuilder()
                    .setCallerTxId(callerTxId)
                    .setFirstName(firstName)
                    .setLastName(lastName)
                    .build();
            return blockingStub.hello2(request);
        } finally {
            unlock();
        }
    }
}