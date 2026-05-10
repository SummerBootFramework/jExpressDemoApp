package org.jexpress.sampleapp.app;

import org.summerboot.jexpress.boot.SummerApplication;
import org.summerboot.jexpress.boot.annotation.Version;

@Version(Constant.VERSION)
public class Main {
    public static void main(String[] args) {
        SummerApplication.run();
    }
}
