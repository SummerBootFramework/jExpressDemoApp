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

package org.jexpress.demoapp.security.authentication;

import com.google.inject.Singleton;
import io.grpc.ServerInterceptor;
import org.summerboot.jexpress.annotation.Service;
import org.summerboot.jexpress.boot.lifecycle.AuthenticatorListener;
import org.summerboot.jexpress.core.session.SessionContext;
import org.summerboot.jexpress.security.auth.Authenticator;
import org.summerboot.jexpress.security.auth.BootAuthenticator;
import org.summerboot.jexpress.security.auth.Caller;
import org.summerboot.jexpress.security.auth.User;

import javax.naming.NamingException;

@Singleton
@Service(binding = {Authenticator.class, ServerInterceptor.class})
public class MyAuthenticator extends BootAuthenticator {

    @Override
    protected Caller authenticate(String username, String password, Object metaData, AuthenticatorListener listener, SessionContext context) throws NamingException {
        // case1: verify username and password against LDAP
        /*        
        try (LdapAgent ldap = LdapAgent.build()) {
            return ldap.authenticateUser(username, password, listener);
        }*/

        // case2: verify username and password with mock logic
        if ("wrongpwd".equals(password)) {
            return null;
        }
        // build a caller to return
        long tenantId = 1;
        String tenantName = "jExpress Org";
        long userId = 456;
        User user = new User(tenantId, tenantName, userId, username);
        if (username.startsWith("admin.")) {
            user.addGroup("AdminGroup");
        }
        if (username.startsWith("user.")) {
            user.addGroup("UserGroup");
        }
        if (username.startsWith("employee.")) {
            user.addGroup("EmployeeGroup");
        }
        //user.addGroup("OtherGroup");
        user.setDisplayName("Hello " + username);
        return user;
    }

    @Override
    protected String oneTimeTokenAuthorize(String wsURI, Caller caller, SessionContext context) {
        return null;
    }
}
