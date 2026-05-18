/**
 * Feature 3 - Ping and Admin Features
 * Handles API calls to Ping, Version, HealthCheck, and Status endpoints
 */

// Feature 3 State
let feature3State = {
    lastReference: null
};

// Initialize Feature 3
function initializeFeature3() {
    const pingBtn = document.getElementById('pingBtn');
    if (pingBtn) {
        pingBtn.addEventListener('click', handlePingClick);
    }

    const versionBtn = document.getElementById('versionBtn');
    if (versionBtn) {
        versionBtn.addEventListener('click', handleVersionClick);
    }

    const healthCheckBtn = document.getElementById('healthCheckBtn');
    if (healthCheckBtn) {
        healthCheckBtn.addEventListener('click', handleHealthCheckClick);
    }

    const statusBtn = document.getElementById('statusBtn');
    if (statusBtn) {
        statusBtn.addEventListener('click', handleStatusClick);
    }
}

/**
 * Handle Ping button click
 */
async function handlePingClick() {
    const pingBtn = document.getElementById('pingBtn');
    const responseContainer = document.getElementById('pingResponse');

    if (pingBtn) pingBtn.disabled = true;
    if (responseContainer) responseContainer.innerHTML = '<p class="loading">Loading...</p>';

    try {
        const url = CONFIG.CONTEXT_ROOT + '/' + CONFIG.PING;
        const response = await fetch(url, {
            method: 'GET'
        });

        // Extract X-Reference header
        const xReference = response.headers.get('X-Reference');
        if (xReference) {
            feature3State.lastReference = xReference;
        }

        const statusText = `HTTP Status: ${response.status} ${response.statusText}`;

        if (responseContainer) {
            // Add error-status class if HTTP status >= 400
            if (response.status >= 400) {
                responseContainer.innerHTML = `<div class="feature3-status-display error">${escapeHtml(statusText)}</div>`;
                responseContainer.classList.add('error-status');
            } else {
                responseContainer.innerHTML = `<div class="feature3-status-display success">${escapeHtml(statusText)}</div>`;
                responseContainer.classList.remove('error-status');
            }
        }

        // Update reference container
        updateXReference(response.ok, feature3State.lastReference, 'feature3ReferenceContainer');
    } catch (error) {
        console.error('Ping Error:', error);
        if (responseContainer) {
            responseContainer.innerHTML = `<div class="feature3-status-display error">Error: ${escapeHtml(error.message)}</div>`;
        }
        updateXReference(false, feature3State.lastReference, 'feature3ReferenceContainer');
    } finally {
        if (pingBtn) pingBtn.disabled = false;
    }
}

/**
 * Handle Version button click
 */
async function handleVersionClick() {
    const versionBtn = document.getElementById('versionBtn');
    const responseContainer = document.getElementById('versionResponse');

    if (versionBtn) versionBtn.disabled = true;
    if (responseContainer) responseContainer.innerHTML = '<p class="loading">Loading...</p>';

    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const url = CONFIG.CONTEXT_ROOT + '/' + CONFIG.ADMIN_VERSION;
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        // Extract X-Reference header
        const xReference = response.headers.get('X-Reference');
        if (xReference) {
            feature3State.lastReference = xReference;
        }

        const responseText = await response.text();

        if (responseContainer) {
            responseContainer.innerHTML = `<div class="feature3-response-display">${escapeHtml(responseText)}</div>`;
            // Add error-status class if HTTP status >= 400
            if (response.status >= 400) {
                responseContainer.classList.add('error-status');
            } else {
                responseContainer.classList.remove('error-status');
            }
        }

        // Update reference container
        updateXReference(response.ok, feature3State.lastReference, 'feature3ReferenceContainer');
    } catch (error) {
        console.error('Version Error:', error);
        if (responseContainer) {
            responseContainer.innerHTML = `<div class="feature3-status-display error">Error: ${escapeHtml(error.message)}</div>`;
        }
        updateXReference(false, feature3State.lastReference, 'feature3ReferenceContainer');
    } finally {
        if (versionBtn) versionBtn.disabled = false;
    }
}

/**
 * Handle HealthCheck button click
 */
async function handleHealthCheckClick() {
    const healthCheckBtn = document.getElementById('healthCheckBtn');
    const responseContainer = document.getElementById('healthCheckResponse');

    if (healthCheckBtn) healthCheckBtn.disabled = true;
    if (responseContainer) responseContainer.innerHTML = '<p class="loading">Loading...</p>';

    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const url = CONFIG.CONTEXT_ROOT + '/' + CONFIG.ADMIN_HEALTHCHECK;
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        // Extract X-Reference header
        const xReference = response.headers.get('X-Reference');
        if (xReference) {
            feature3State.lastReference = xReference;
        }

        const statusText = `HTTP Status: ${response.status} ${response.statusText}`;

        if (responseContainer) {
            // Add error-status class if HTTP status >= 400
            if (response.status >= 400) {
                responseContainer.innerHTML = `<div class="feature3-status-display error">${escapeHtml(statusText)}</div>`;
                responseContainer.classList.add('error-status');
            } else {
                responseContainer.innerHTML = `<div class="feature3-status-display success">${escapeHtml(statusText)}</div>`;
                responseContainer.classList.remove('error-status');
            }
        }

        // Update reference container
        updateXReference(response.ok, feature3State.lastReference, 'feature3ReferenceContainer');
    } catch (error) {
        console.error('HealthCheck Error:', error);
        if (responseContainer) {
            responseContainer.innerHTML = `<div class="feature3-status-display error">Error: ${escapeHtml(error.message)}</div>`;
        }
        updateXReference(false, feature3State.lastReference, 'feature3ReferenceContainer');
    } finally {
        if (healthCheckBtn) healthCheckBtn.disabled = false;
    }
}

/**
 * Handle Status button click
 */
async function handleStatusClick() {
    const statusBtn = document.getElementById('statusBtn');
    const statusCheckbox = document.getElementById('statusPauseCheckbox');
    const responseContainer = document.getElementById('statusResponse');

    if (statusBtn) statusBtn.disabled = true;
    if (responseContainer) responseContainer.innerHTML = '<p class="loading">Loading...</p>';

    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const pauseValue = statusCheckbox && statusCheckbox.checked ? 'true' : 'false';
        const url = CONFIG.CONTEXT_ROOT + '/' + CONFIG.ADMIN_STATUS + '?pause=' + pauseValue;
        const response = await fetch(url, {
            method: 'PUT',
            headers: headers
        });

        // Extract X-Reference header
        const xReference = response.headers.get('X-Reference');
        if (xReference) {
            feature3State.lastReference = xReference;
        }

        const statusText = `HTTP Status: ${response.status} ${response.statusText}`;

        if (responseContainer) {
            // Add error-status class if HTTP status >= 400
            if (response.status >= 400) {
                responseContainer.innerHTML = `<div class="feature3-status-display error">${escapeHtml(statusText)}</div>`;
                responseContainer.classList.add('error-status');
            } else {
                responseContainer.innerHTML = `<div class="feature3-status-display success">${escapeHtml(statusText)}</div>`;
                responseContainer.classList.remove('error-status');
            }
        }

        // Update reference container
        updateXReference(response.ok, feature3State.lastReference, 'feature3ReferenceContainer');
    } catch (error) {
        console.error('Status Error:', error);
        if (responseContainer) {
            responseContainer.innerHTML = `<div class="feature3-status-display error">Error: ${escapeHtml(error.message)}</div>`;
        }
        updateXReference(false, feature3State.lastReference, 'feature3ReferenceContainer');
    } finally {
        if (statusBtn) statusBtn.disabled = false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeFeature3();
});

