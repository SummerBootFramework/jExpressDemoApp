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

package test.integration.db;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.TypedQuery;
import org.jexpress.demoapp.integration.db.DBConfig;
import org.jexpress.demoapp.model.FileLocation;
import org.jexpress.demoapp.model.Tenant;
import org.summerboot.jexpress.boot.config.ConfigUtil;
import org.summerboot.jexpress.security.EncryptorUtil;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Ignore;
import org.testng.annotations.Test;

import java.io.File;
import java.util.List;

@Ignore
public class DBTest {

    public DBTest() {
    }

    private static final File FILE_CFG__DB = new File("src/test/resources/config/cfg_db.properties");

    @BeforeClass
    public static void setUpClass() throws Exception {
        EncryptorUtil.setMasterPassword("changeit");
        ConfigUtil.updatePasswords(FILE_CFG__DB, null, true);
        DBConfig.cfg.load(FILE_CFG__DB, "org.jexpress");
    }

    @AfterClass
    public static void tearDownClass() throws Exception {
    }

    @BeforeMethod
    public void setUpMethod() throws Exception {
    }

    @AfterMethod
    public void tearDownMethod() throws Exception {
    }

    @Test
    public void testORMapping() {
        List<FileLocation> list;
        EntityTransaction tx;
        EntityManager em = DBConfig.cfg.em();

        //1. CURD = read list
        try {
            TypedQuery q = em.createQuery("SELECT o FROM FileLocation o", FileLocation.class);
            list = q.getResultList();
            System.out.println(list.size());
        } finally {
            em.close();
        }

        //2. CURD = delete
        Tenant t = new Tenant();
        t.setId(1L);
        t.setDn("dn2");
        t.setLdapId("ldapId2");

        FileLocation f = new FileLocation();
        f.setVersion(1);
        f.setTenant(t);
        f.setName("name2");
        f.setLocation("location2");
        if (list.contains(f)) {
            em = DBConfig.cfg.em();
            try {
                tx = em.getTransaction();
                tx.begin();
                em.remove(f);
                tx.commit();
            } finally {
                em.close();
            }
            em = DBConfig.cfg.em();
            try {
                TypedQuery q = em.createQuery("SELECT o FROM FileLocation o", FileLocation.class);
                list = q.getResultList();
                System.out.println(list.size());
            } finally {
                em.close();
            }
        }

        //3. CURD = create
        f = new FileLocation();
        f.setTenant(t);
        f.setLocation("location2");
        f.setName("name2");
        em = DBConfig.cfg.em();
        try {
            tx = em.getTransaction();
            tx.begin();
            em.persist(f);
            tx.commit();
        } finally {
            em.close();
        }
        em = DBConfig.cfg.em();
        try {
            TypedQuery q = em.createQuery("SELECT o FROM FileLocation o", FileLocation.class);
            list = q.getResultList();
            System.out.println(list.size());
        } finally {
            em.close();
        }

        //4. CURD = update
        em = DBConfig.cfg.em();
        try {
            tx = em.getTransaction();
            tx.begin();
            f = em.find(FileLocation.class, "name2");
            f.setLocation("location-" + System.currentTimeMillis());
            tx.commit();
        } finally {
            em.close();
        }
        em = DBConfig.cfg.em();
        try {
            TypedQuery q = em.createQuery("SELECT o FROM FileLocation o", FileLocation.class);
            list = q.getResultList();
            System.out.println(list.size());
        } finally {
            em.close();
        }
    }

//    public void testC() {
//        Tenant t = new Tenant();
//        t.setDn("dn2");
//        t.setLdapId("ldapId2");
//
//        FileLocation f = new FileLocation();
//        f.setTenant(t);
//        f.setLocation("location2");
//        f.setName("name2");
//
//        DBConfig cfg = BootConfig.instance(DBConfig.class);
//        EntityManager em = cfg.em();
//        try {
//            EntityTransaction tx = em.getTransaction();
//            tx.begin();
//            em.persist(t);
//            System.out.println("t.id=" + t.getId());
//            em.persist(f);
//            System.out.println("f.id=" + f.getId());
//            tx.commit();
//
//            System.out.println("t.id=" + t.getId());
//            System.out.println("f.id=" + f.getId());
//
//            Tenant t2 = em.find(Tenant.class, 1);
//            System.out.println("t2.c=" + t2.getCreatedTs());
//            System.out.println("t2.u=" + t2.getUpdatedTs());
//
//        } finally {
//            em.close();
//        }
//        System.out.println("t.id=" + t.getId());
//        System.out.println("f.id=" + f.getId());
//    }
}
