package org.jexpress.demoapp.controller.restful;

import com.google.inject.Inject;
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
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.jexpress.demoapp.app.Constant;
import org.jexpress.demoapp.dto.MyRequest;
import org.jexpress.demoapp.dto.MyResponse;
import org.jexpress.demoapp.service.BusinessService;
import org.summerboot.jexpress.boot.annotation.Controller;
import org.summerboot.jexpress.boot.annotation.Daemon;
import org.summerboot.jexpress.boot.annotation.Log;
import org.summerboot.jexpress.boot.annotation.RequiresHealthCheck;
import org.summerboot.jexpress.nio.server.SessionContext;
import org.summerboot.jexpress.nio.server.domain.ServiceError;
import org.summerboot.jexpress.nio.server.ws.rs.BootController;

@OpenAPIDefinition(//OAS v3
        info = @Info(
                title = "jExpress Sample App",
                version = "1.0.0",
                description = """
                        Generic Response Headers<table>
                        \t<thead><th>Header</th><th>Description</th><th>Example value</th></thead>
                        \t<tbody>
                        \t<tr><td>X-Reference</td><td>Server-end transaction ID</td><td>164211-2</td></tr>
                        \t<tr><td>X-ServerTs</td><td>Server-end completion date-time with an offset from UTC/Greenwich in the ISO-8601 calendar system</td><td>2026-05-11T09:59:59.209-04:00</td></tr>
                        \t</tbody>
                        </table>""",
                contact = @Contact(
                        name = "jExpress.org",
                        email = "info@jexpress.org"
                )
        ),
        servers = {
                @Server(url = "https://localhost:8211", description = "Default local port1"),
                @Server(url = "https://localhost:8311", description = "Default local port2"),
        }
)
@Controller
@Path(AppURI.CONTEXT_ROOT + AppURI.REST_VERSION)
@Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
@Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
@RequiresHealthCheck({Constant.HI_NAME2, Constant.HI_NAME3})
@Daemon
public class RestController extends BootController {
    @Inject
    private BusinessService businessService;


    @POST
    @Path(AppURI.URL_HELLO1)
    public MyResponse hello1(@Parameter(description = "this is greeting message") @NotNull @PathParam("greeting") String greeting,
                             @Parameter(description = "this is request body") @NotNull MyRequest myRequest,
                             @Parameter(hidden = true) SessionContext context) {
        return businessService.process(greeting, myRequest, context);
    }

    @POST
    @Path(AppURI.URL_HELLO2)
    @Log(maskDataFields = {"creditCardNumber", "privateInfo", "secretList"})
    public MyResponse hello2(@PathParam("greeting") String greeting, MyRequest myRequest, @Parameter(hidden = true) final SessionContext context) {
        return businessService.process(greeting, myRequest, context);
    }

    @Operation(
            tags = {"My tag"},
            summary = "My summary",
            description = "My description",
            security = {
                    @SecurityRequirement(name = SecuritySchemeName_BearerAuth)
            },
            parameters = {
                    @Parameter(name = HEADER_LOCATION, in = ParameterIn.HEADER, required = true, description = "Requested server location")
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "good response",
                            content = @Content(schema = @Schema(implementation = MyResponse.class))
                    ),
                    @ApiResponse(responseCode = "308", description = DESC_308,
                            headers = {
                                    @Header(name = HEADER_LOCATION, schema = @Schema(type = "string"), description = "New server location")
                            }
                    ),
                    @ApiResponse(responseCode = "4xx", description = DESC_4xx,
                            content = @Content(schema = @Schema(implementation = ServiceError.class))
                    ),
                    @ApiResponse(responseCode = "5xx", description = DESC_5xx,
                            content = @Content(schema = @Schema(implementation = ServiceError.class))
                    )
            }
    )
    @POST
    @Path(AppURI.URL_HELLO3)
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({"User", "AppAdmin"})
    @Daemon(false)
    @RequiresHealthCheck({Constant.HC_name1, Constant.HI_NAME2})
    @Log(maskDataFields = {"creditCardNumber", "privateInfo", "secretList"})
    public MyResponse hello3(@PathParam("greeting") String greeting, MyRequest myRequest, @Parameter(hidden = true) final SessionContext context) {
        return businessService.process(greeting, myRequest, context);
    }

    @POST
    @Path(AppURI.URL_HELLO4)
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("AppAdmin")
    @Daemon(false)
    @RequiresHealthCheck({Constant.HC_name1, Constant.HI_NAME2})
    @Log(maskDataFields = {"creditCardNumber", "privateInfo", "secretList"})
    public MyResponse hello4(@PathParam("greeting") String greeting, MyRequest myRequest, @Parameter(hidden = true) final SessionContext context) {
        return businessService.process(greeting, myRequest, context);
    }
}
