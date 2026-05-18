/**
 * Feature 4 - Health Checker Mock Status
 */

function initializeFeature4() {
    const form = document.getElementById('feature4Form');
    if (!form) {
        return;
    }
    form.addEventListener('submit', handleFeature4Submit);
}

async function handleFeature4Submit(e) {
    e.preventDefault();

    const checkerSelect = document.getElementById('healthCheckerSelect');
    const errorCodeInput = document.getElementById('healthErrorCodeInput');
    const responseEl = document.getElementById('feature4Response');
    const setBtn = document.getElementById('feature4SetBtn');

    if (!checkerSelect || !errorCodeInput || !responseEl || !setBtn) {
        return;
    }

    const checkerName = checkerSelect.value;
    const errorCode = errorCodeInput.value.trim();

    setBtn.disabled = true;
    setBtn.textContent = 'Setting...';
    responseEl.textContent = '';

    try {
        const token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const endpoint = `${CONFIG.CONTEXT_ROOT}${CONFIG.URI_MOCK_HEALTSTATUS}${encodeURIComponent(checkerName)}/${encodeURIComponent(errorCode)}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers
        });

        const xReference = response.headers.get('X-Reference');

        const bodyText = await response.text().catch(() => '');

        if (response.ok) {
            responseEl.className = 'feature4-response success';
            responseEl.textContent = bodyText || 'Set successfully.';
        } else {
            responseEl.className = 'feature4-response error';
            responseEl.textContent = bodyText || `Request failed (${response.status} ${response.statusText})`;
        }

        updateXReference(response.ok, xReference, 'feature4ReferenceContainer');
    } catch (error) {
        responseEl.className = 'feature4-response error';
        responseEl.textContent = error && error.message ? error.message : 'Network error';
        updateXReference(false, null, 'feature4ReferenceContainer');
    } finally {
        setBtn.disabled = false;
        setBtn.textContent = 'Set';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeFeature4();
});