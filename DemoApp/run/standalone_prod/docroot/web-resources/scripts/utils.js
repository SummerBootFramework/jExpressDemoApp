/**
 * Shared utility functions
 */

/**
 * Toggle password visibility for any password input field.
 * @param {string} inputId - ID of the password input element
 * @param {HTMLElement} btn - The toggle button element
 */
function toggleFieldPassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? '🙈' : '👁';
    btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}

/**
 * Escape HTML special characters to prevent XSS
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
 * Update reference display
 * @param {boolean} isSuccess - Whether the operation was successful
 * @param {string} xReference - The reference ID to display
 * @param {string} elementId - The container element ID
 */
function updateXReference(isSuccess, xReference, elementId) {
    const refContainer = document.getElementById(elementId);
    if (!refContainer) {
        return;
    }

    // Update CSS class based on success/failure
    refContainer.classList.remove('success', 'error');
    if (isSuccess) {
        refContainer.classList.add('success');
    } else {
        refContainer.classList.add('error');
    }

    // Update content
    if (xReference) {
        refContainer.innerHTML = `<strong>Ref#</strong> <code>${escapeHtml(xReference)}</code>`;
    } else {
        refContainer.innerHTML = `<span class="xreference-empty">Ready</span>`;
    }
}

/**
 * Show an inline error box and optionally mark an input as invalid.
 * @param {string} message - Error message text.
 * @param {Object} options - Rendering options.
 * @param {string} options.errorContainerId - Element id that receives the error box.
 * @param {string} [options.inputId] - Optional input id to mark invalid.
 * @param {string} [options.inputErrorClass] - CSS class used for invalid input state.
 * @param {string} [options.errorBoxStyle] - Inline style string for the rendered error box.
 */
function showFormError(message, options) {
    const opts = options || {};
    const errorContainerId = opts.errorContainerId;
    const inputId = opts.inputId;
    const inputErrorClass = opts.inputErrorClass || 'input-error';
    const errorBoxStyle = opts.errorBoxStyle || 'color: #dc3545; background: #f8d7da; border: 1px solid #f5c6cb; padding: 12px; border-radius: 4px; margin-top: 10px;';

    if (!errorContainerId) {
        return;
    }

    const errorContainer = document.getElementById(errorContainerId);
    if (!errorContainer) {
        return;
    }

    if (inputId) {
        const inputEl = document.getElementById(inputId);
        if (inputEl) {
            inputEl.classList.add(inputErrorClass);
            inputEl.setAttribute('aria-invalid', 'true');
        }
    }

    errorContainer.innerHTML = `<div style="${errorBoxStyle}">${escapeHtml(message)}</div>`;
}

/**
 * Show a reusable error modal.
 * @param {Object} options - Modal options.
 * @param {string} options.modalId - Unique modal element id.
 * @param {string} [options.overlayClass] - Overlay class name.
 * @param {string} [options.contentClass] - Content class name.
 * @param {string} [options.title] - Modal title text.
 * @param {string} [options.reference] - Optional reference value shown next to title.
 * @param {number|string} [options.httpStatus] - Optional HTTP status code (for example: 400).
 * @param {string} [options.httpStatusText] - Optional HTTP status text (for example: Bad Request).
 * @param {string} [options.httpStatusLabel] - Optional label shown for HTTP status.
 * @param {Array} [options.errors] - Error item array.
 * @param {string} [options.codeLabel] - Label for code field.
 * @param {string} [options.tagLabel] - Label for tag field.
 * @param {string} [options.descriptionLabel] - Label for description field.
 * @param {string} [options.closeButtonText] - Close button text.
 */
function showErrorModal(options) {
    const opts = options || {};
    if (!opts.modalId) {
        return;
    }

    const overlayClass = opts.overlayClass || 'modal-overlay';
    const contentClass = opts.contentClass || 'modal-content';
    const title = opts.title || 'Error Response';
    const reference = opts.reference || '';
    const httpStatus = opts.httpStatus;
    const httpStatusText = opts.httpStatusText || '';
    const httpStatusLabel = opts.httpStatusLabel || 'HTTP Status';
    const errors = Array.isArray(opts.errors) ? opts.errors : [];
    const codeLabel = opts.codeLabel || 'Error Code';
    const tagLabel = opts.tagLabel || 'Tag';
    const descriptionLabel = opts.descriptionLabel || 'Description';
    const closeButtonText = opts.closeButtonText || 'Close';

    let modal = document.getElementById(opts.modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = opts.modalId;
        modal.className = overlayClass;
        document.body.appendChild(modal);
    }

    let modalContent = modal.querySelector(`.${contentClass}`);
    if (modalContent) {
        modalContent.remove();
    }

    const errorItemsHtml = errors.map(error => {
        const hasErrorTag = typeof error.errorTag === 'string' && error.errorTag.trim() !== '';
        return `
        <div class="error-item">
            <strong>${escapeHtml(codeLabel)}: <span class="error-code">${escapeHtml(error.errorCode || 'N/A')}</span></strong>
            ${hasErrorTag ? `<strong>${escapeHtml(tagLabel)}: <span class="error-tag">${escapeHtml(error.errorTag)}</span></strong>` : ''}
            <div class="error-desc"><strong>${escapeHtml(descriptionLabel)}:</strong> ${escapeHtml(error.errorDesc || 'N/A')}</div>
        </div>
    `;
    }).join('');

    const referenceMarkup = reference ? ` <code>${escapeHtml(reference)}</code>` : '';
    const hasHttpStatus = httpStatus !== undefined && httpStatus !== null && String(httpStatus).trim() !== '';
    const httpStatusValue = hasHttpStatus
        ? `${String(httpStatus)}${httpStatusText ? ` ${httpStatusText}` : ''}`
        : '';
    const httpStatusMarkup = hasHttpStatus
        ? `<div class="error-http-status"><strong>${escapeHtml(httpStatusLabel)}:</strong> ${escapeHtml(httpStatusValue)}</div>`
        : '';

    modalContent = document.createElement('div');
    modalContent.className = contentClass;
    modalContent.innerHTML = `
        <span class="modal-close-icon" aria-label="Close dialog" role="button" tabindex="0">x</span>
        <div class="modal-header">
            <h2>${escapeHtml(title)}${referenceMarkup}</h2>
            ${httpStatusMarkup}
        </div>
        <div class="modal-body">
            ${errorItemsHtml}
        </div>
        <div class="modal-footer">
            <button class="modal-close-btn" type="button">${escapeHtml(closeButtonText)}</button>
        </div>
    `;

    modal.appendChild(modalContent);

    const closeModal = () => {
        modal.classList.remove('active');
    };

    const closeIcon = modalContent.querySelector('.modal-close-icon');
    if (closeIcon) {
        closeIcon.addEventListener('click', closeModal);
        closeIcon.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeModal();
            }
        });
    }

    const closeBtn = modalContent.querySelector('.modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.classList.add('active');
}

