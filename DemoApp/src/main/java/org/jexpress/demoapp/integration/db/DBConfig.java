package org.jexpress.demoapp.integration.db;

import org.summerboot.jexpress.boot.config.annotation.ImportResource;
import org.summerboot.jexpress.integration.jpa.JPAHibernateConfig;

@ImportResource(value = "cfg_db.properties", whenUseAlternative = "mockdb", thenLoadConfig = true)
public class DBConfig extends JPAHibernateConfig {

    public static final DBConfig cfg = new DBConfig();

    private DBConfig() {
    }
}
