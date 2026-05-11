package test.integration.grpc;

import io.grpc.BindableService;
import io.grpc.netty.shaded.io.grpc.netty.NettyChannelBuilder;
import org.jexpress.sampleapp.controller.grpc.client.Hello1ClientImpl;
import org.jexpress.sampleapp.controller.grpc.client.Hello2ClientImpl;
import org.jexpress.sampleapp.controller.grpc.impl.Hello1ServiceImpl_A;
import org.jexpress.sampleapp.controller.grpc.impl.Hello2ServiceImpl_A;
import org.summerboot.jexpress.boot.BootConstant;
import org.summerboot.jexpress.nio.grpc.GRPCTestHelper;
import org.summerboot.jexpress.security.EncryptorUtil;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.IOException;
import java.security.GeneralSecurityException;

import static org.testng.Assert.assertEquals;

public class GrpcTest extends GRPCTestHelper {

    @BeforeClass
    public static void setUpClass() throws Exception {
        EncryptorUtil.setMasterPassword("changeit");
    }

    @AfterClass
    public static void tearDownClass() throws Exception {
    }

    @BeforeMethod
    public void setUpMethod() throws Exception {
    }

    @AfterMethod
    public void tearDownMethod() throws Exception {
    }

    @Test
    public void test() throws GeneralSecurityException, IOException {
        super.test2WayTLS();
    }

    @Override
    protected BindableService[] getServerImpls() {
        BindableService impl1 = new Hello1ServiceImpl_A();
        BindableService impl2 = new Hello2ServiceImpl_A();
        return new BindableService[]{impl1, impl2};
    }

    @Override
    protected void runClient(NettyChannelBuilder channelBuilder) {
        // connect to server
        Hello1ClientImpl client1 = new Hello1ClientImpl().withNettyChannelBuilder(channelBuilder).connect();
        Hello2ClientImpl client2 = new Hello2ClientImpl().withNettyChannelBuilder(channelBuilder).connect();
        try {
            String g1 = client1.hello("firstName", "lastName");
            System.out.println("g1=" + g1);
            assertEquals(g1, BootConstant.APP_ID + " Hello1 " + "firstName lastName");
            String g2 = client2.hello("firstName", "lastName");
            System.out.println("g2=" + g2);
            assertEquals(g2, BootConstant.APP_ID + " Hello2 " + "firstName lastName");
        } finally {
            client1.disconnect();
            client2.disconnect();
        }
    }


}
