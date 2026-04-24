package org.jexpress.demo.restful.service;

import com.google.inject.Singleton;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.servers.Server;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.constraints.Pattern;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.MatrixParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.jexpress.demo.app.instrumentation.HealthChecker;
import org.summerboot.jexpress.boot.annotation.Controller;
import org.summerboot.jexpress.boot.annotation.Daemon;
import org.summerboot.jexpress.boot.instrumentation.HealthMonitor;
import org.summerboot.jexpress.nio.server.SessionContext;
import org.summerboot.jexpress.nio.server.domain.ServiceError;
import org.summerboot.jexpress.nio.server.ws.rs.BootController;

import java.io.IOException;
import java.time.OffsetDateTime;

@Singleton
@Controller(AlternativeName = "RoleBased")
// to enable it, start application with -use RoleBased or -use RoleBased WebBased to enable both role and web based controllers
@Path("/hellosummer")
@OpenAPIDefinition(//OAS v3
        info = @Info(
                title = "Hello Summer! Demo02",
                version = "Demo 02",
                description = "This is demo",
                contact = @Contact(
                        name = "jExpress.org",
                        email = "info@jexpress.org"
                )
        ),
        servers = {
                @Server(url = "https://localhost:8311", description = "Local Development server")
        }
)
public class MyControllerRoleBased extends BootController {

    @Operation(
            tags = {"My tag"},
            summary = "My summary",
            description = "My description",
            security = {
                    @SecurityRequirement(name = SECURITY_BEARERAUTH)
            },
            parameters = {
                    @Parameter(name = HEADER_LOCATION, in = ParameterIn.HEADER, required = true, description = "Requested server location")
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "good response",
                            content = @Content(schema = @Schema(implementation = Pong.class))
                    ),
                    @ApiResponse(responseCode = "308", description = DESC_308,
                            headers = {
                                    @Header(name = HEADER_LOCATION, schema = @Schema(type = "string"), description = "New server location")
                            }
                    ),
                    @ApiResponse(responseCode = "401", description = DESC_401,
                            content = @Content(schema = @Schema(implementation = ServiceError.class))
                    ),
                    @ApiResponse(responseCode = "409", description = DESC_409,
                            content = @Content(schema = @Schema(implementation = ServiceError.class))
                    ),
                    @ApiResponse(responseCode = "4xx", description = DESC_4xx,
                            content = @Content(schema = @Schema(implementation = ServiceError.class))
                    ),
                    @ApiResponse(responseCode = "5xx", description = DESC_5xx,
                            content = @Content(schema = @Schema(implementation = ServiceError.class))
                    )
            }
    )
    /*
     * curl -v -k https://localhost:8311/hellosummer/hello/234 -H "Accept":"application/xml"
     * curl -v -k https://localhost:8311/hellosummer/hello/234 -H "Accept":"application/json"
     */
    @GET
    @Path("/hello/anonymous/{number}")
    @Daemon
    @Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
    public Pong anonymous(@PathParam("number") int number, SessionContext context) throws IOException {
        HealthChecker.a = number;
        switch (number) {
            case 1 -> {
                throw new IOException("test 1");
            }
            case 2 -> {
                HealthMonitor.inspect();
            }
        }
        return new Pong("Hello stranger: " + context.caller(), context.txId());
    }

    @GET
    @Path("/helloAdmin/user")
    @Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
    @PermitAll
    public Pong loginedUserOnly(SessionContext context) {
        return new Pong("Hello user: " + context.caller(), context.txId());
    }

    @GET
    @Path("/helloAdmin/admin")
    @Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
    @RolesAllowed({"AppAdmin"})
    public Pong adminOnly(SessionContext context) {
        return new Pong("Hello admin: " + context.caller(), context.txId());
    }

    @GET
    @Path("/helloAdmin/employee")
    @Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
    @RolesAllowed({"Employee"})
    public Pong employeeOnly(SessionContext context) {
        return new Pong("Hello employee: " + context.caller(), context.txId());
    }

    @GET
    @Path("/helloAdmin/adminoremployee")
    @Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
    @RolesAllowed({"AppAdmin", "Employee"})
    public Pong adminorEmployeeOnly(SessionContext context) {
        return new Pong("Hello employee: " + context.caller(), context.txId());
    }


    @GET
    @Path("/services/appname/v1/aaa/{pa1: [0-9]*}/bbb/{pa2:[a-zA-Z][a-zA-Z_0-9]}") // "/services/appname/v1/aaa/111;m4=88;m5=99;m1=123 ; m2=456 /bbb/a2;    m3=789  "
    public Pong testPathParamWithRegex(@PathParam("pa1") int pa1Value, @PathParam("pa2") String pa2Value, @MatrixParam("m1") String m1Value, @MatrixParam("m2") String m2Value, @MatrixParam("m3") String m3Value, @MatrixParam("m4") @Pattern(regexp = "[0-9]*") int m4value, SessionContext context) {
        return new Pong("testMatrixParamWithRegex", "pa1=" + pa1Value + ", pa2=" + pa2Value + ", m1=" + m1Value + ", m2=" + m2Value + ", m3=" + m3Value + ", m4=" + m4value + ", txId=" + context.txId());
    }

    public static class Pong {

        private final String name;
        private final String value;
        private final OffsetDateTime receivedTime;

        public Pong(String name, String value) {
            this.name = name;
            this.value = value;
            this.receivedTime = OffsetDateTime.now();
        }

        public String getName() {
            return name;
        }

        public String getValue() {
            return value;
        }

        public OffsetDateTime getReceivedTime() {
            return receivedTime;
        }

    }
}
