package org.jexpress.demoapp.app;

import org.summerboot.jexpress.boot.SummerApplication;
import org.summerboot.jexpress.boot.annotation.Version;

@Version(value = Constant.VERSION, logFileName = "jExpressApp")
public class Main {
    public static void main(String[] args) {
        SummerApplication.run();
    }
}
