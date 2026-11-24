package org.jexpress.demo.grpc;

import com.google.protobuf.Empty;
import io.grpc.ManagedChannel;
import io.grpc.netty.shaded.io.grpc.netty.NettyChannelBuilder;
import io.grpc.stub.AbstractStub;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2Request;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2Response;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2ServiceGrpc;
import org.summerboot.jexpress.boot.lifecycle.app.IdleEventMonitor;
import org.summerboot.jexpress.infra.grpc.client.GrpcClient;
import org.summerboot.jexpress.infra.grpc.client.config.GrpcClientConfig;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
public class Hello2Service_gRPCClient extends GrpcClient<Hello2Service_gRPCClient> {
    private Hello2ServiceGrpc.Hello2ServiceBlockingStub blockingStub;

    protected Hello2Service_gRPCClient(GrpcClientConfig cfg) {
        super(cfg);
    }

    protected Hello2Service_gRPCClient(NettyChannelBuilder channelBuilder, String idleEventMonitorName, int idleThresholdSecond) {
        super(channelBuilder, idleEventMonitorName, idleThresholdSecond);
    }

    @Override
    public void onIdle(IdleEventMonitor idleEventMonitor) throws Exception {
    }

    @Override
    protected AbstractStub onConnected(ManagedChannel channel) {
        this.blockingStub = Hello2ServiceGrpc.newBlockingStub(channel);
        return this.blockingStub;
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