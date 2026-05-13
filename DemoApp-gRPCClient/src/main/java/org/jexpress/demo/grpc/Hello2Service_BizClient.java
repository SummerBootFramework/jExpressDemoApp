package org.jexpress.demo.grpc;


import io.netty.handler.codec.http.HttpResponseStatus;
import org.jexpress.demoapp.grpc.proto.generated2.Hello2Response;
import org.summerboot.jexpress.boot.BootErrorCode;
import org.summerboot.jexpress.boot.annotation.HealthCheck;
import org.summerboot.jexpress.boot.instrumentation.HealthChecker;
import org.summerboot.jexpress.boot.instrumentation.HealthMonitor;
import org.summerboot.jexpress.nio.grpc.GRPCClientConfig;
import org.summerboot.jexpress.nio.server.SessionContext;
import org.summerboot.jexpress.nio.server.domain.Err;

import java.util.List;

@HealthCheck(name = "gRPC.hello2")
public abstract class Hello2Service_BizClient implements HealthChecker {
    private Hello2Service_gRPCClient gRPCAgent;

    abstract protected GRPCClientConfig getGRPCClientConfig();

    protected Hello2Service_gRPCClient getAgent() {
        if (gRPCAgent == null) {
            gRPCAgent = new Hello2Service_gRPCClient().withConfig(getGRPCClientConfig()).connect();
        }
        return gRPCAgent;
    }

    private static final String TAG = "Hello2";

    @Override
    public List<Err> ping(Object[] objects) {
        List pingError = null;
        try {
            Hello2Response gRPCResponse = getAgent().ping();
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
        Hello2Response gRPCResponse;
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
