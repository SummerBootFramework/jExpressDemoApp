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
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.summerboot.jexpress.integration.jpa.AbstractEntity;

import java.util.Objects;

/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tenant_ID", "name"})
})
@NamedQueries({
        @NamedQuery(name = "FileLocation.findAll", query = "SELECT o FROM FileLocation o where o.tenant.id=:tenantID order by o.name"),
        @NamedQuery(name = "FileLocation.findByName", query = "SELECT o FROM FileLocation o WHERE o.tenant.id=:tenantID and o.name = :name"),
        @NamedQuery(name = "FileLocation.findByLocation", query = "SELECT o FROM FileLocation o WHERE o.tenant.id=:tenantID and o.location = :location")})
public class FileLocation extends AbstractEntity {

    private static final long serialVersionUID = 1L;

    @ManyToOne
    @JoinColumn(name = "tenant_ID", nullable = false, updatable = false, insertable = true)
    private Tenant tenant;

    @Id
    @Column(unique = true, nullable = false, length = 255)
    private String name;

    @Column(unique = false, nullable = false, length = 1000)
    private String location;

    public FileLocation() {
        super();
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 97 * hash + Objects.hashCode(this.tenant);
        hash = 97 * hash + Objects.hashCode(this.name);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final FileLocation other = (FileLocation) obj;
        if (!Objects.equals(this.name, other.name)) {
            return false;
        }
        return Objects.equals(this.tenant, other.tenant);
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    /**
     * Get the value of name
     *
     * @return the value of name
     */
    public String getName() {
        return name;
    }

    /**
     * Set the value of name
     *
     * @param name new value of name
     */
    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    /**
     * Set the value of location
     *
     * @param location new value of location
     */
    public void setLocation(String location) {
        this.location = location;
    }

    @Override
    public String toString() {
        return location + "@" + name;
    }
}
