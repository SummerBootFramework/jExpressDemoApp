package org.jexpress.demo.grpc;

import com.google.protobuf.Empty;
import io.grpc.ManagedChannel;
import io.grpc.netty.shaded.io.grpc.netty.NettyChannelBuilder;
import io.grpc.stub.AbstractStub;
import org.jexpress.demoapp.grpc.proto.generated1.Hello1Request;
import org.jexpress.demoapp.grpc.proto.generated1.Hello1Response;
import org.jexpress.demoapp.grpc.proto.generated1.Hello1ServiceGrpc;
import org.summerboot.jexpress.boot.lifecycle.app.IdleEventMonitor;
import org.summerboot.jexpress.infra.grpc.client.GrpcClient;
import org.summerboot.jexpress.infra.grpc.client.config.GrpcClientConfig;


/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
public class Hello1Service_gRPCClient extends GrpcClient<Hello1Service_gRPCClient> {
    private Hello1ServiceGrpc.Hello1ServiceBlockingStub blockingStub;

    protected Hello1Service_gRPCClient(GrpcClientConfig cfg) {
        super(cfg);
    }

    protected Hello1Service_gRPCClient(NettyChannelBuilder channelBuilder, String idleEventMonitorName, int idleThresholdSecond) {
        super(channelBuilder, idleEventMonitorName, idleThresholdSecond);
    }

    @Override
    public void onIdle(IdleEventMonitor idleEventMonitor) throws Exception {
    }

    @Override
    protected AbstractStub onConnected(ManagedChannel channel) {
        this.blockingStub = Hello1ServiceGrpc.newBlockingStub(channel);
        return this.blockingStub;
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
