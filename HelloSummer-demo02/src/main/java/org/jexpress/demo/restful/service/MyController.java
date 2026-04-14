package org.jexpress.demo.restful.service;

import com.google.inject.Singleton;
import io.netty.handler.codec.http.HttpResponseStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jexpress.demo.app.MyConfig;
import org.jexpress.demo.restful.service.vo.AppPOI;
import org.summerboot.jexpress.boot.annotation.Controller;
import org.summerboot.jexpress.boot.annotation.Log;
import org.summerboot.jexpress.boot.annotation.ParamCollectionDelimiter;
import org.summerboot.jexpress.nio.server.SessionContext;

import java.time.OffsetDateTime;
import java.util.List;

@Singleton
@Controller(responseHeader_ServerTs = "ts", responseHeader_Reference = "ref")
@Path("/hellosummer2")
public class MyController {

    protected Logger log = LogManager.getLogger(this.getClass());


    private final String a = "[a-zA-Z0-9_+&*-]*@gmail.com";

    @GET
    @Path("/hello/{name}")
    @Produces({MediaType.TEXT_PLAIN})
    public String hello(@NotNull @PathParam("name") @Pattern(regexp = a) String myName) {// both Nonnull or NotNull works
        return "Hello " + myName;
    }

    @POST
    @Path("/CRLF")
    public String testCRLF(String body) {
        log.error("body={}", body);
        log.error("body=" + body);
        log.error(body);
        return body;
    }

    @POST
    @Path("/account1/{name}")
    @Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
// require request header Content-Type: application/json or Content-Type: application/xml
    @Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
// require request header Accept: application/json or Accept: application/xml
    public ResponseDto hello_no_validation_unprotected_logging(@PathParam("name") String myName, RequestDto request) {
        return new ResponseDto("secret: " + MyConfig.cfg.getLicenseKey(), "shared");
    }

    /**
     * Three features:
     * <p>
     * 1. auto validate JSON request by @Valid and @NotNull annotation
     * <p>
     * 2. protected user credit card and privacy information from being logged
     * by @Log annotation
     * <p>
     * 3. mark performance POI (point of interest) by using
     * SessionContext.poi(key), see section#8.3
     *
     * @param myName
     * @param request
     * @param context
     * @return
     */
    @POST
    @Path("/account2/{name}")
    @Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
// require request header Content-Type: application/json or Content-Type: application/xml
    @Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
// require request header Accept: application/json or Accept: application/xml
    @Log(maskDataFields = {"creditCardNumber", "clientPrivacy", "secretList"})
    @ParamCollectionDelimiter(";")
    public ResponseDto hello_auto_validation_protected_logging_markWithPOI(@NotNull @PathParam("name") String myName, @NotNull RequestDto request, final SessionContext context) {
        context.poi(AppPOI.DB_BEGIN);// about POI, see section8.3
        // DB access and it takes time ...
        context.poi(AppPOI.DB_END);

        context.poi(AppPOI.GRPC_BEGIN);// about POI, see section8.3
        // gRPC access and it takes time ...
        context.poi(AppPOI.GRPC_END);

        context.status(HttpResponseStatus.CREATED);// override, default is 200 OK
        return new ResponseDto("secret: " + MyConfig.cfg.getLicenseKey(), "shared: " + request.getCreditCardNumber());
    }

    @GET
    @Path("/time")
    public String time() {
        System.out.println("testempty");
        return "" + OffsetDateTime.now();
    }

    public static class RequestDto {

        @NotNull
        private String creditCardNumber;

        @Valid
        @NotEmpty
        private List<String> shoppingList;

        public String getCreditCardNumber() {
            return creditCardNumber;
        }

        public void setCreditCardNumber(String creditCardNumber) {
            this.creditCardNumber = creditCardNumber;
        }

        public List<String> getShoppingList() {
            return shoppingList;
        }

        public void setShoppingList(List<String> shoppingList) {
            this.shoppingList = shoppingList;
        }

    }

    public static class ResponseDto {

        private String clientPrivacy;
        private String clientNonPrivacy;
        private List<String> secretList = List.of("aa", "bb");
        private List<String> emptyList = List.of();
        private List<String> nullList = null;

        public ResponseDto() {
        }

        public ResponseDto(String clientPrivacy, String clientNonPrivacy) {
            this.clientPrivacy = clientPrivacy;
            this.clientNonPrivacy = clientNonPrivacy;
        }

        public String getClientPrivacy() {
            return clientPrivacy;
        }

        public void setClientPrivacy(String clientPrivacy) {
            this.clientPrivacy = clientPrivacy;
        }

        public String getClientNonPrivacy() {
            return clientNonPrivacy;
        }

        public void setClientNonPrivacy(String clientNonPrivacy) {
            this.clientNonPrivacy = clientNonPrivacy;
        }

        public List<String> getSecretList() {
            return secretList;
        }

        public void setSecretList(List<String> secretList) {
            this.secretList = secretList;
        }

        public List<String> getEmptyList() {
            return emptyList;
        }

        public void setEmptyList(List<String> emptyList) {
            this.emptyList = emptyList;
        }

        public List<String> getNullList() {
            return nullList;
        }

        public void setNullList(List<String> nullList) {
            this.nullList = nullList;
        }
    }
}
