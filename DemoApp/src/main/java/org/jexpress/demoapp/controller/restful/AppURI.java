package org.jexpress.demoapp.controller.restful;

import org.summerboot.jexpress.boot.annotation.Unique;

@Unique(type = String.class, name = "URI")// try cli: java -jar SampleApp-1.0.0.jar -list URI
public interface AppURI {
    String CONTEXT_ROOT = "/sampleapp/service";
    String REST_VERSION = "/v1";
    String WEB_VERSION = "/v2";

    String URL_HELLO1 = "/helloworld1/{greeting}";
    String URL_HELLO2 = "/helloworld2/{greeting}";
    String URL_HELLO3 = "/helloworld3/{greeting}";
    // String URL_HELLO3_duplicated = "/helloworld3/{greeting}"; // give it a try to run app with this enabled

    String API_NF_FILE_UPLOAD = CONTEXT_ROOT + REST_VERSION + "/upload";
}
