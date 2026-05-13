package org.jexpress.demoapp.service;

import org.summerboot.jexpress.boot.annotation.Unique;

@Unique(name = "AppErrorCode", type = int.class)// try cli: java -jar SampleApp-1.0.0.jar -list AppErrorCode
public interface MyErrorCode {
    int SystemError = 500;
    // int duplicateError = 500; // give it a try to run app with this enabled
}
