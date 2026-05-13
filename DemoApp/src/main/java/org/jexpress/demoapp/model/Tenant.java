package org.jexpress.demoapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import org.summerboot.jexpress.integration.jpa.EntityEx;

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
