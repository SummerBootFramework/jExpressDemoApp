package org.jexpress.sampleapp.service.restful;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.jexpress.sampleapp.app.Constant;
import org.jexpress.sampleapp.domain.MyRequest;
import org.jexpress.sampleapp.domain.MyResponse;
import org.summerboot.jexpress.boot.annotation.Controller;
import org.summerboot.jexpress.boot.annotation.Daemon;
import org.summerboot.jexpress.boot.annotation.Log;
import org.summerboot.jexpress.boot.annotation.RequiresHealthCheck;
import org.summerboot.jexpress.nio.server.ws.rs.BootController;

@Controller
@Path("/sampleapp/service/v1")
@Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
@RequiresHealthCheck({Constant.HI_NAME2, Constant.HI_NAME3})
@Daemon
public class RestController extends BootController {

    @POST
    @Path("/helloworld1/{greeting}")
    @Produces({MediaType.APPLICATION_JSON})
    public MyResponse hello1(@PathParam("greeting") String greeting, MyRequest myRequest) {
        return new MyResponse("public." + greeting + myRequest.creditCardNumber(), "private." + greeting + myRequest.creditCardNumber(), myRequest.shoppingList());
    }

    @POST
    @Path("/helloworld2/{greeting}")
    @Log(maskDataFields = {"creditCardNumber", "privateInfo", "secretList"})
    public MyResponse hello2(@PathParam("greeting") String greeting, MyRequest myRequest) {
        return new MyResponse("public." + greeting + myRequest.creditCardNumber(), "private." + greeting + myRequest.creditCardNumber(), myRequest.shoppingList());
    }

    @POST
    @Path("/helloworld3/{greeting}")
    @RolesAllowed("User")
    @Daemon(false)
    @RequiresHealthCheck({Constant.HI_NAME1, Constant.HI_NAME2})
    @Log(maskDataFields = {"creditCardNumber", "privateInfo", "secretList"})
    public MyResponse hello3(@PathParam("greeting") String greeting, MyRequest myRequest) {
        return new MyResponse("public." + greeting + myRequest.creditCardNumber(), "private." + greeting + myRequest.creditCardNumber(), myRequest.shoppingList());
    }
}
