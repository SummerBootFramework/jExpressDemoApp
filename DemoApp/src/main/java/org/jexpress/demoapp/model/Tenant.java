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

package org.jexpress.demoapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import org.summerboot.jexpress.integration.jpa.EntityEx;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
@Entity
@Table(name = "tenant")
@NamedQueries({
        @NamedQuery(name = "Tenant.findAll", query = "SELECT c FROM Tenant c"),
        @NamedQuery(name = "Tenant.findByOid", query = "SELECT c FROM Tenant c WHERE c.ldapId = :oid"),
        @NamedQuery(name = "Tenant.findByDN", query = "SELECT c FROM Tenant c WHERE c.dn like :dn")})
public class Tenant extends EntityEx {

    private static final long serialVersionUID = 1L;
    @Column(unique = true, length = 255, nullable = false, updatable = false)
    private String dn = "";

    @Column(unique = true, length = 128, nullable = false, updatable = false)
    private String ldapId = "";

    public Tenant() {
    }

    public String getDn() {
        return dn;
    }

    public void setDn(String dn) {
        this.dn = dn;
    }

    public String getLdapId() {
        return ldapId;
    }

    public void setLdapId(String ldapId) {
        this.ldapId = ldapId;
    }
}
