/*
 * Copyright 2005-2026 Du Law Office - jExpress, The Summer Boot Framework Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://apache.org
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package org.jexpress.demoapp.controller.restful;


import org.summerboot.jexpress.annotation.validation.Unique;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
@Unique(type = String.class, name = "URI")// try cli: java -jar SampleApp-1.0.0.jar -list URI
public interface AppURI {
    String CONTEXT_ROOT = "/sampleapp/service";
    String REST_VERSION = "/v1";
    String WEB_VERSION = "/v2";


    String RET_200 = "/200";

    String RET_204 = "/204";

    String URL_HELLO1 = "/helloworld1/{greeting}";
    String URL_HELLO2 = "/helloworld2/{greeting}";
    String URL_HELLO3 = "/helloworld3/{greeting}";
    String URL_HELLO4 = "/helloworld4/{greeting}";
    String URL_MockHealthStatus = "/mock/health/{target}/{error}";
    // String URL_HELLO3_duplicated = "/helloworld3/{greeting}"; // give it a try to run app with this enabled

    String API_NF_FILE_UPLOAD = CONTEXT_ROOT + REST_VERSION + "/upload";
}
