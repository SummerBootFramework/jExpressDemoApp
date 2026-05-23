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

function getOTT(wsURI) {
    try {
        const token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
        const url = CONFIG.CONTEXT_ROOT + CONFIG.URI_WS_OTT + '?wsURI=' + encodeURIComponent(wsURI || '');

        // Synchronous XMLHttpRequest (blocks execution until response)
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, false); // false = synchronous

        // Set headers
        xhr.setRequestHeader('Content-Type', 'application/json');
        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.send(null);

        // Extract X-Reference header (if present)
        const xReference = xhr.getResponseHeader('X-Reference');
        if (xReference) {
            console.log('OTT X-Reference:', xReference);
        }

        if (xhr.status >= 400) {
            console.warn('getOTT failed, status:', xhr.status);
            return '';
        }

        const responseText = xhr.responseText;
        return responseText || '';
    } catch (error) {
        console.error('getOTT Error:', error);
        return '';
    }
}

/**
 * Demo 6 - WebSocket Chat Room
 * Connects to ChatRoomWebSocketHandler at /mywebsocket/demo
 * The JWT token is passed as the WebSocket subprotocol for auth.
 */
async function getOTTAsync(wsURI) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const url = CONFIG.CONTEXT_ROOT + CONFIG.URI_WS_OTT + '?wsURI=' + encodeURIComponent(wsURI || '');

        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        // Extract X-Reference header (if present)
        const xReference = response.headers.get('X-Reference');
        if (xReference) {
            console.log('OTT X-Reference:', xReference);
        }

        if (!response.ok) {
            console.warn('getOTT failed, status:', response.status);
            return '';
        }

        const responseText = await response.text();
        // Return the OTT (or empty string on no content)
        return responseText || '';
    } catch (error) {
        console.error('getOTT Error:', error);
        return '';
    }
}

function getWsUrl(wsURI, ott) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return proto + '//' + window.location.host + wsURI + '/' + (ott || '');
}

function getToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN) || '';
}

function el(id) {
    return document.getElementById(id);
}

/**
 * Display PDF from base64 string inside a container element.
 * Creates a Blob URL and embeds it in an <iframe>.
 * Also provides a Download button.
 * @param {string} pdfBase64 - Base64-encoded PDF content
 * @param {string} pdfViewerContainerId - ID of the container element
 */
function displayBase64PDFById(pdfBase64, pdfViewerContainerId) {
    const container = document.getElementById(pdfViewerContainerId);
    displayBase64PDF(pdfBase64, container);
}

function displayBase64PDF(pdfBase64, container) {
    //const container = document.getElementById(pdfViewerContainerId);
    if (!container) {
        console.warn('displayBase64PDF: container not found:', pdfViewerContainerId);
        return;
    }

    // Revoke any previous blob URL to avoid memory leaks
    const prevIframe = container.querySelector('iframe.pdf-viewer-frame');
    if (prevIframe && prevIframe.src && prevIframe.src.startsWith('blob:')) {
        URL.revokeObjectURL(prevIframe.src);
    }

    // Decode base64 → Uint8Array → Blob → object URL
    const byteChars = atob(pdfBase64);
    const byteNums = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteNums], {type: 'application/pdf'});
    const blobUrl = URL.createObjectURL(blob);

    container.innerHTML = `
        <div class="pdf-viewer-toolbar">
            <span class="pdf-viewer-title">📄 PDF Preview</span>
            <a href="${blobUrl}" download="document.pdf" class="btn btn-secondary pdf-viewer-download-btn">⬇ Download</a>
        </div>
        <iframe
            src="${blobUrl}"
            class="pdf-viewer-frame"
            title="PDF Preview"
            type="application/pdf"
        ></iframe>
    `;
    container.classList.add('active');
}


/**
 * Display image from base64 string inside a container element.
 * @param {number} index - Image index (for labelling)
 * @param {string} imageBase64 - Base64-encoded image (assumed JPEG/PNG)
 * @param {string} imageViewContainerId - ID of the container element
 */
function displayBase64ImageById(index, imageBase64, imageViewContainerId) {
    const container = document.getElementById(imageViewContainerId);
    displayBase64Image(index, imageBase64, container);
}

function displayBase64Image(index, imageBase64, container) {
    //const container = document.getElementById(imageViewContainerId);
    if (!container) {
        console.warn('displayBase64Image: container not found:', imageViewContainerId);
        return;
    }
    if (index === 0) {
        // Clear on first image
        container.innerHTML = '<div class="image-viewer-grid"></div>';
        container.classList.add('active');
    }
    const grid = container.querySelector('.image-viewer-grid') || container;
    const img = document.createElement('img');
    img.src = `data:image/png;base64,${imageBase64}`;
    img.alt = `Image ${index + 1}`;
    img.className = 'image-viewer-img';
    img.title = `Image ${index + 1}`;
    grid.appendChild(img);
}

function displayBase64Video(base64Data, container) {
    if (!container) {
        console.warn('displayBase64Video: container not found');
        return;
    }
    const video = document.createElement('video');
    video.controls = true;
    video.src = `data:video/mp4;base64,${base64Data}`;
    video.className = 'video-viewer-video';
    //container.innerHTML = '';
    container.appendChild(video);
}

function displayBase64Audio(base64Data, container) {
    if (!container) {
        console.warn('displayBase64Video: container not found');
        return;
    }
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = `data:audio/mp4;base64,${base64Data}`;
    audio.className = 'audio-viewer-audio';
    container.appendChild(audio);
}

function attachForDownload(base64Data, container, fileName, mimeType) {
    const blob = new Blob([new Uint8Array(atob(base64Data).split('').map(c => c.charCodeAt(0)))], {type: mimeType});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    container.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
}