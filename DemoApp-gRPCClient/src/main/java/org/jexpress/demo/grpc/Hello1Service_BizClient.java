package org.jexpress.demo.grpc;

import io.netty.handler.codec.http.HttpResponseStatus;
import org.jexpress.demoapp.grpc.proto.generated1.Hello1Response;
import org.summerboot.jexpress.annotation.health.HealthCheck;
import org.summerboot.jexpress.api.common.BootErrorCode;
import org.summerboot.jexpress.api.common.Err;
import org.summerboot.jexpress.api.common.SessionContext;
import org.summerboot.jexpress.api.health.HealthChecker;
import org.summerboot.jexpress.infra.grpc.client.config.GrpcClientConfig;
import org.summerboot.jexpress.integration.HealthMonitor;

import java.util.List;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
@HealthCheck(name = "gRPC.hello1")
public abstract class Hello1Service_BizClient implements HealthChecker {
    private Hello1Service_gRPCClient gRPCAgent;

    abstract protected GrpcClientConfig getGRPCClientConfig();

    protected Hello1Service_gRPCClient getAgent() {
        if (gRPCAgent == null) {
            gRPCAgent = new Hello1Service_gRPCClient().withConfig(getGRPCClientConfig()).connect();
        }
        return gRPCAgent;
    }

    private static final String TAG = "Hello1";

    @Override
    public List<Err> ping(Object[] objects) {
        List pingError = null;
        try {
            Hello1Response gRPCResponse = getAgent().ping();
            int errorCode = gRPCResponse.getErrorCode();
            if (errorCode != 0) {
                String gRPCErrorDesc = gRPCResponse.getErrorDesc();
                pingError = List.of(new Err(BootErrorCode.ACCESS_ERROR_RPC, null, TAG + ".error@ping code=" + errorCode + ", desc=" + gRPCErrorDesc, null));
            }
        } catch (Throwable ex) {
            pingError = List.of(new Err(BootErrorCode.ACCESS_ERROR_RPC, null, TAG + ".error@ping " + ex.toString(), ex));
        }
        return pingError;
    }

    public String bizFunction(String firstName, String lastName, SessionContext context) {
        String callerTxId = context.txId();
        Hello1Response gRPCResponse;
        context.poi(TAG + ".begin");

        // process IO
        try {
            gRPCResponse = getAgent().hello(callerTxId, firstName, lastName);
            context.memo(TAG + ".response", gRPCResponse.toString());
        } catch (Throwable ex) {
            var e = new Err(BootErrorCode.ACCESS_ERROR_RPC, null, null, ex, TAG + ".exception");
            context.error(e).status(HttpResponseStatus.BAD_GATEWAY);
            HealthMonitor.inspect(this);
            return null;
        } finally {
            context.poi(TAG + ".end");
        }

        // process success
        int gRPCErrorCode = gRPCResponse.getErrorCode();
        if (gRPCErrorCode == BootErrorCode.OK) {
            return gRPCResponse.getGreeting();
        }

        // process failure
        String gRPCErrorDesc = gRPCResponse.getErrorDesc();
        String gRPCServerTxId = gRPCResponse.getServerTxId();
        var e = new Err(BootErrorCode.ACCESS_ERROR_RPC, null, null, null, TAG + ".error@" + gRPCServerTxId + " code=" + gRPCErrorCode + ", desc=" + gRPCErrorDesc);
        context.error(e).status(HttpResponseStatus.BAD_GATEWAY);
        return null;
    }
}
