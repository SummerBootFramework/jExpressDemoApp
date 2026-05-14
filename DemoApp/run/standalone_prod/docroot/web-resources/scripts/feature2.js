/**
 * Feature 2 - RESTFull Hello World Service
 * Handles form submission, API calls, and response display
 */

// Feature 2 State
let feature2State = {
    lastReference: null,
    isSubmitting: false
};

// Initialize Feature 2
function initializeFeature2() {
    const form = document.getElementById('feature2Form');
    if (form) {
        form.addEventListener('submit', handleFeature2Submit);
    }

    const creditCardInputEl = document.getElementById('creditCardInput');
    if (creditCardInputEl) {
        creditCardInputEl.addEventListener('blur', () => {
            const value = creditCardInputEl.value.trim();
            if (!value) {
                creditCardInputEl.classList.remove('input-error');
                creditCardInputEl.removeAttribute('aria-invalid');
                return;
            }
            const normalized = normalizeCreditCardNumber(value);
            if (isValidCreditCardNumber(normalized)) {
                creditCardInputEl.classList.remove('input-error');
                creditCardInputEl.removeAttribute('aria-invalid');
            } else {
                creditCardInputEl.classList.add('input-error');
                creditCardInputEl.setAttribute('aria-invalid', 'true');
            }
        });
    }
}

/**
 * Handle form submission
 */
async function handleFeature2Submit(e) {
    e.preventDefault();

    if (feature2State.isSubmitting) {
        return;
    }

    const submitBtn = document.querySelector('#feature2Form .feature2-submit-btn');
    setFeature2Submitting(true, submitBtn);

    const creditCardNumberInput = document.getElementById('creditCardInput').value.trim();
    const greeting = document.getElementById('greetingInput').value.trim();
    const shoppingListInput = document.getElementById('shoppingListInput').value.trim();
    const helloWorldApi = document.getElementById('helloWorldApiSelect').value;
    const roleBasedCheckbox = document.getElementById('roleBasedCheckbox');
    const isRoleBased = roleBasedCheckbox.checked;
    const errorContainer = document.getElementById('feature2ErrorContainer');
    const creditCardInputEl = document.getElementById('creditCardInput');

    // Clear previous errors
    errorContainer.innerHTML = '';
    if (creditCardInputEl) {
        creditCardInputEl.classList.remove('input-error');
        creditCardInputEl.removeAttribute('aria-invalid');
    }

    // Validate inputs
    if (!creditCardNumberInput) {
        showFeature2Error('Please enter a credit card number');
        setFeature2Submitting(false, submitBtn);
        return;
    }

    const normalizedCardNumber = normalizeCreditCardNumber(creditCardNumberInput);
    if (!isValidCreditCardNumber(normalizedCardNumber)) {
        showFeature2Error('Please enter a valid credit card number');
        setFeature2Submitting(false, submitBtn);
        return;
    }

    if (!greeting) {
        showFeature2Error('Please enter a greeting');
        setFeature2Submitting(false, submitBtn);
        return;
    }

    if (!shoppingListInput) {
        showFeature2Error('Please enter at least one shopping list item');
        setFeature2Submitting(false, submitBtn);
        return;
    }

    // Parse shopping list - split by newlines or commas, and filter empty items
    const shoppingList = shoppingListInput
        .split(/[\n,]+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);

    if (shoppingList.length === 0) {
        showFeature2Error('Please enter at least one valid shopping list item');
        setFeature2Submitting(false, submitBtn);
        return;
    }

    try {
        // Construct the MyRequest DTO
        const myRequest = {
            creditCardNumber: normalizedCardNumber,
            shoppingList: shoppingList
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        // Add Authorization header if role-based is checked
        if (isRoleBased) {
            const token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        // Make the API call
        const response = await fetch(CONFIG.CONTEXT_ROOT + `/${encodeURIComponent(helloWorldApi)}/${encodeURIComponent(greeting)}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(myRequest)
        });

        // Extract X-Reference header
        const xReference = response.headers.get('X-Reference');
        if (xReference) {
            feature2State.lastReference = xReference;
        }

        if (response.ok) {
            // Handle 2xx response
            const responseData = await response.json();
            displayFeature2Response(responseData);
        } else {
            // Handle 4xx or 5xx response
            const errorData = await response.json();
            if (errorData.errors && Array.isArray(errorData.errors)) {
                showFeature2ErrorModal(errorData.errors);
            } else {
                showFeature2Error('An error occurred: ' + (errorData.message || 'Unknown error'));
            }
        }

        // Update reference container
        updateFeature2Reference();

    } catch (error) {
        console.error('Feature 2 Error:', error);
        showFeature2Error('Error: ' + error.message);
        updateFeature2Reference();
    } finally {
        setFeature2Submitting(false, submitBtn);
    }
}

function setFeature2Submitting(isSubmitting, submitBtn) {
    feature2State.isSubmitting = isSubmitting;
    if (!submitBtn) {
        return;
    }
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? 'Submitting...' : 'Submit';
}

function normalizeCreditCardNumber(cardNumber) {
    return cardNumber.replace(/[\s-]/g, '');
}

function isValidCreditCardNumber(cardNumber) {
    // Basic format: 13-19 digits.
    if (!/^\d{13,19}$/.test(cardNumber)) {
        return false;
    }

    // Luhn checksum.
    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

/**
 * Display successful response
 */
function displayFeature2Response(responseData) {
    const responseSection = document.getElementById('feature2ResponseSection');
    const responseContent = document.getElementById('feature2ResponseContent');

    // Format response data into a structured HTML display
    let html = '<div class="response-display">';

    // Public Info
    if (responseData.publicInfo !== undefined) {
        html += `
            <div class="response-item">
                <span class="response-label">Public Info:</span>
                <span class="response-value">${escapeHtml(responseData.publicInfo || 'N/A')}</span>
            </div>
        `;
    }

    // Private Info
    if (responseData.privateInfo !== undefined) {
        html += `
            <div class="response-item">
                <span class="response-label">Private Info:</span>
                <span class="response-value">${escapeHtml(responseData.privateInfo || 'N/A')}</span>
            </div>
        `;
    }

    // Secret List
    if (responseData.secretList !== undefined) {
        html += `
            <div class="response-item">
                <span class="response-label">Secret List:</span>
                <div class="response-list">
                    ${formatListItems(responseData.secretList)}
                </div>
            </div>
        `;
    }

    // Empty List
    if (responseData.emptyList !== undefined) {
        html += `
            <div class="response-item">
                <span class="response-label">Empty List:</span>
                <div class="response-list">
                    ${formatListItems(responseData.emptyList)}
                </div>
            </div>
        `;
    }

    // Null List
    if (responseData.nullList !== undefined) {
        html += `
            <div class="response-item">
                <span class="response-label">Null List:</span>
                <div class="response-list">
                    ${responseData.nullList === null ? '<span class="list-empty">[null]</span>' : formatListItems(responseData.nullList)}
                </div>
            </div>
        `;
    }

    // Data List
    if (responseData.dataList !== undefined) {
        html += `
            <div class="response-item">
                <span class="response-label">Data List:</span>
                <div class="response-list">
                    ${formatListItems(responseData.dataList)}
                </div>
            </div>
        `;
    }

    html += '</div>';

    // Also show raw JSON for reference
    html += '<div class="response-json-section">';
    html += '<strong>Raw JSON Response:</strong>';
    const formattedJson = JSON.stringify(responseData, null, 2);
    html += `<pre>${escapeHtml(formattedJson)}</pre>`;
    html += '</div>';

    responseContent.innerHTML = html;
    responseSection.classList.add('active');
}

/**
 * Format list items for display
 */
function formatListItems(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
        return '<span class="list-empty">[empty]</span>';
    }
    
    return items
        .map(item => `<div class="list-item">${escapeHtml(String(item))}</div>`)
        .join('');
}

/**
 * Show error message in form
 */
function showFeature2Error(message) {
    const errorContainer = document.getElementById('feature2ErrorContainer');
    const creditCardInputEl = document.getElementById('creditCardInput');
    if (creditCardInputEl) {
        creditCardInputEl.classList.add('input-error');
        creditCardInputEl.setAttribute('aria-invalid', 'true');
    }
    errorContainer.innerHTML = `<div style="color: #dc3545; background: #f8d7da; border: 1px solid #f5c6cb; padding: 12px; border-radius: 4px; margin-top: 10px;">${escapeHtml(message)}</div>`;
}

/**
 * Show error modal with error list
 */
function showFeature2ErrorModal(errors) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('feature2ErrorModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'feature2ErrorModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    // Clear previous content
    let modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.remove();
    }

    // Create modal content
    const errorItemsHtml = errors.map(error => {
        const hasErrorTag = typeof error.errorTag === 'string' && error.errorTag.trim() !== '';
        return `
        <div class="error-item">
            <strong>Error Code: <span class="error-code">${error.errorCode || 'N/A'}</span></strong>
            ${hasErrorTag ? `<strong>Tag: <span class="error-tag">${escapeHtml(error.errorTag)}</span></strong>` : ''}
            <div class="error-desc"><strong>Description:</strong> ${escapeHtml(error.errorDesc || 'N/A')}</div>
        </div>
    `;
    }).join('');

    modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
        <span class="modal-close-icon" onclick="closeFeature2ErrorModal()">×</span>
        <div class="modal-header">
            <h2>Error Response</h2>
        </div>
        <div class="modal-body">
            ${errorItemsHtml}
        </div>
        <div class="modal-footer">
            <button class="modal-close-btn" onclick="closeFeature2ErrorModal()">Close</button>
        </div>
    `;

    modal.appendChild(modalContent);
    modal.classList.add('active');
}

/**
 * Close error modal
 */
function closeFeature2ErrorModal() {
    const modal = document.getElementById('feature2ErrorModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Update reference display
 */
function updateFeature2Reference() {
    const refContainer = document.getElementById('feature2ReferenceContainer');
    if (feature2State.lastReference) {
        refContainer.innerHTML = `<strong>X-Reference Header:</strong> <code>${escapeHtml(feature2State.lastReference)}</code>`;
    } else {
        refContainer.innerHTML = `<span class="feature2-reference-empty">No reference available yet</span>`;
    }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Clear feature 2 form
 */
function clearFeature2Form() {
    document.getElementById('feature2Form').reset();
    document.getElementById('feature2ResponseSection').classList.remove('active');
    document.getElementById('feature2ErrorContainer').innerHTML = '';
    feature2State.lastReference = null;
    updateFeature2Reference();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeFeature2();
});

