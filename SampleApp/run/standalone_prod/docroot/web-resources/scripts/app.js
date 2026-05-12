/**
 * File Upload Manager SPA
 * Features: Login with JWT, File Upload with Drag & Drop, Progress Tracking
 */

// Constants
const CONFIG = {
    CONTEXT_ROOT: '/sampleapp/service/v1',
    STORAGE_KEY_TOKEN: 'authtoken',
    STORAGE_KEY_DISPLAY_NAME: 'displayName',
    STORAGE_KEY_TENANT_NAME: 'tenantName',
    LOGIN_ENDPOINT: '/j_security_check',
    UPLOAD_ENDPOINT: '/upload'
};

const SUBMENU_VIEWS = {
    sub1: 'uploadView',
    sub2: 'sub2View',
    sub3: 'sub3View',
    sub4: 'sub4View',
    sub3_1: 'sub31View',
    sub3_2: 'sub32View'
};

// State
let appState = {
    token: null,
    displayName: '',
    tenantName: '',
    selectedFiles: [],
    uploadTasks: {},
    taskIdCounter: 0
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check for existing token
    const savedToken = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
    const savedDisplayName = localStorage.getItem(CONFIG.STORAGE_KEY_DISPLAY_NAME) || '';
    const savedTenantName = localStorage.getItem(CONFIG.STORAGE_KEY_TENANT_NAME) || '';

    appState.displayName = savedDisplayName;
    appState.tenantName = savedTenantName;

    if (savedToken) {
        appState.token = savedToken;
        updateUserMenu();
        showUploadView();
    } else {
        updateUserMenu();
        showLoginView();
    }

    attachEventListeners();
    initSub32SplitResize();
}

function attachEventListeners() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);

    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

    // File Selection
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileSelect);

    const selectFileBtn = document.getElementById('selectFileBtn');
    selectFileBtn.addEventListener('click', () => fileInput.click());

    // Drag and Drop
    const dropZone = document.getElementById('dropZone');
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => fileInput.click());

    // Upload
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.addEventListener('click', handleUpload);

    // Logout
    const logoutBtn = document.getElementById('userLogoutBtn');
    logoutBtn.addEventListener('click', handleLogout);

    // Clear Tasks
    const clearTasksBtn = document.getElementById('clearTasksBtn');
    clearTasksBtn.addEventListener('click', handleClearTasks);

    // Submenu navigation
    document.querySelectorAll('.submenu-link[data-view-target]').forEach(link => {
        link.addEventListener('click', handleSubmenuClick);
    });
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const isHidden = passwordInput.type === 'password';

    passwordInput.type = isHidden ? 'text' : 'password';
    togglePasswordBtn.textContent = isHidden ? '🙈' : '👁';
    togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}


/**
 * LOGIN FUNCTIONALITY
 */
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');

    // Clear previous error
    loginError.textContent = '';

    try {
        const response = await fetch(CONFIG.CONTEXT_ROOT + CONFIG.LOGIN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `j_username=${encodeURIComponent(username)}&j_password=${encodeURIComponent(password)}`
        });

        if (!response.ok) {
            throw new Error(`Login failed with status ${response.status}`);
        }

        // Get JWT from response header
        const token = response.headers.get('X-AuthToken');
        if (!token) {
            throw new Error('No authentication token received from server');
        }

        // Save token
        appState.token = token;
        appState.displayName = response.headers.get('displayName') || username;
        appState.tenantName = response.headers.get('tenantName') || '';
        localStorage.setItem(CONFIG.STORAGE_KEY_TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEY_DISPLAY_NAME, appState.displayName);
        localStorage.setItem(CONFIG.STORAGE_KEY_TENANT_NAME, appState.tenantName);

        updateUserMenu();

        // Reset and clear form
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').textContent = '';

        // Show upload view
        showUploadView();
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = error.message || 'Login failed. Please try again.';
    }
}

function handleLogout() {
    const token = appState.token;

    // Call DELETE logout endpoint
    if (token) {
        fetch(CONFIG.CONTEXT_ROOT + '/login', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(error => {
            console.error('Logout API call error:', error);
        });
    }

    // Clear token
    appState.token = null;
    appState.displayName = '';
    appState.tenantName = '';
    localStorage.removeItem(CONFIG.STORAGE_KEY_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEY_DISPLAY_NAME);
    localStorage.removeItem(CONFIG.STORAGE_KEY_TENANT_NAME);

    // Reset state
    appState.selectedFiles = [];
    appState.uploadTasks = {};
    appState.taskIdCounter = 0;

    // Clear UI
    document.getElementById('fileList').innerHTML = '';
    document.getElementById('taskList').innerHTML = '';
    document.getElementById('filePreview').classList.remove('active');
    document.getElementById('uploadTasks').classList.remove('active');

    updateUserMenu();

    // Show login view
    showLoginView();
}

function handleClearTasks() {
    const taskList = document.getElementById('taskList');
    const uploadTasks = document.getElementById('uploadTasks');
    const clearTasksBtn = document.getElementById('clearTasksBtn');

    // Clear all task items
    taskList.innerHTML = '';

    // Clear task state
    appState.uploadTasks = {};

    // Hide upload tasks section
    uploadTasks.classList.remove('active');

    // Hide clear button
    clearTasksBtn.style.display = 'none';
}

function handleSubmenuClick(e) {
    e.preventDefault();

    if (!appState.token) {
        return;
    }

    const viewTarget = e.currentTarget.getAttribute('data-view-target');
    activateSubmenuView(viewTarget);
}

/**
 * VIEW MANAGEMENT
 */
function showLoginView() {
    document.getElementById('loginView').classList.add('active');
    document.getElementById('appViews').classList.add('hidden');
    document.querySelectorAll('.content-view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.submenu-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.navbar')?.classList.add('hidden');
    document.getElementById('userMenu').classList.add('hidden');
    document.getElementById('username').focus();
}

function showUploadView() {
    document.getElementById('loginView').classList.remove('active');
    document.getElementById('appViews').classList.remove('hidden');
    document.querySelector('.navbar')?.classList.remove('hidden');
    activateSubmenuView('sub1');
    document.getElementById('userMenu').classList.remove('hidden');
}

function activateSubmenuView(viewTarget) {
    const targetViewId = SUBMENU_VIEWS[viewTarget];
    if (!targetViewId) {
        return;
    }

    document.querySelectorAll('.content-view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.submenu-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.menu-link').forEach(link => link.classList.remove('active-root'));

    const targetView = document.getElementById(targetViewId);
    if (targetView) {
        targetView.classList.add('active');
    }

    const targetLink = document.querySelector(`.submenu-link[data-view-target="${viewTarget}"]`);
    if (targetLink) {
        targetLink.classList.add('active');

        const rootMenuLink = targetLink.closest('.menu-item')?.querySelector('.menu-link');
        if (rootMenuLink) {
            rootMenuLink.classList.add('active-root');
        }
    }
}

/**
 * FILE SELECTION HANDLING
 */
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFilesToSelection(files);
    // Reset input so same file can be selected again
    e.target.value = '';
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('dropZone').classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('dropZone').classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('dropZone').classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files);
    addFilesToSelection(files);
}

function addFilesToSelection(files) {
    files.forEach(file => {
        // Check if file already selected
        if (!appState.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
            appState.selectedFiles.push(file);
        }
    });

    renderFilePreview();
    updateUploadButtonState();
}

function removeFileFromSelection(index) {
    appState.selectedFiles.splice(index, 1);
    renderFilePreview();
    updateUploadButtonState();
}

function renderFilePreview() {
    const fileList = document.getElementById('fileList');
    const filePreviewDiv = document.getElementById('filePreview');

    fileList.innerHTML = '';

    if (appState.selectedFiles.length === 0) {
        filePreviewDiv.classList.remove('active');
        return;
    }

    filePreviewDiv.classList.add('active');

    appState.selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        const fileIcon = getFileIcon(file.type);
        const fileSize = formatFileSize(file.size);
        const fileSizeBytes = file.size.toLocaleString() + ' bytes';

        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">${fileIcon}</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize} (${fileSizeBytes})</div>
                </div>
            </div>
            <button type="button" class="remove-btn" data-index="${index}">Remove</button>
        `;

        fileItem.querySelector('.remove-btn').addEventListener('click', () => {
            removeFileFromSelection(index);
        });

        fileList.appendChild(fileItem);

        // Generate thumbnail for image files
        if (file.type.startsWith('image/')) {
            generateThumbnail(file, fileItem);
        }
    });
}

function generateThumbnail(file, fileItemElement) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'file-thumbnail';

        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = file.name;

        thumbnailContainer.appendChild(img);
        fileItemElement.insertBefore(thumbnailContainer, fileItemElement.firstChild);
    };

    reader.readAsDataURL(file);
}

function updateUploadButtonState() {
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = appState.selectedFiles.length === 0;
}

/**
 * FILE UPLOAD FUNCTIONALITY
 */
async function handleUpload() {
    if (appState.selectedFiles.length === 0 || !appState.token) {
        alert('No files selected or not authenticated');
        return;
    }

    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;

    const uploadTasksDiv = document.getElementById('uploadTasks');
    uploadTasksDiv.classList.add('active');

    // Upload each file
    for (const file of appState.selectedFiles) {
        uploadFile(file);
    }

    // Clear selected files after starting uploads
    appState.selectedFiles = [];
    renderFilePreview();
    updateUploadButtonState();
    uploadBtn.disabled = false;
}

function uploadFile(file) {
    const taskId = appState.taskIdCounter++;
    const formData = new FormData();
    formData.append('file', file);

    // Create task item
    const taskItem = createTaskItem(taskId, file.name, file.size);
    const taskList = document.getElementById('taskList');
    taskList.appendChild(taskItem);

    const cancelBtn = taskItem.querySelector('.cancel-upload-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            cancelUploadTask(taskId);
        });
    }

    // Store task reference
    appState.uploadTasks[taskId] = {
        element: taskItem,
        xhr: null,
        status: 'uploading'
    };

    // Create XMLHttpRequest for upload progress tracking
    const xhr = new XMLHttpRequest();
    appState.uploadTasks[taskId].xhr = xhr;

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            updateTaskProgress(taskId, percentComplete);
        }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
            completeTask(taskId);
        } else {
            failTask(taskId, `Server returned status ${xhr.status}`);
        }
    });

    // Handle error
    xhr.addEventListener('error', () => {
        failTask(taskId, 'Upload failed');
    });

    // Handle abort
    xhr.addEventListener('abort', () => {
        failTask(taskId, 'Upload cancelled');
    });

    // Set up request
    xhr.open('POST', CONFIG.CONTEXT_ROOT + CONFIG.UPLOAD_ENDPOINT);
    xhr.setRequestHeader('Authorization', `Bearer ${appState.token}`);

    // Send request
    xhr.send(formData);
}

function createTaskItem(taskId, fileName, fileSizeBytes) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.id = `task-${taskId}`;
    const fileSizeText = `${formatFileSize(fileSizeBytes)} (${fileSizeBytes.toLocaleString()} bytes)`;

    taskItem.innerHTML = `
        <div class="task-header">
            <span class="task-name">${escapeHtml(fileName)}</span>
            <span class="task-file-size">${escapeHtml(fileSizeText)}</span>
            <span class="task-percent">0%</span>
            <span class="task-status uploading">Uploading</span>
            <button type="button" class="cancel-upload-btn" data-task-id="${taskId}">Cancel</button>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: 0%;">0%</div>
        </div>
    `;

    return taskItem;
}

function updateTaskProgress(taskId, percentage) {
    const taskElement = appState.uploadTasks[taskId].element;
    if (!taskElement) return;

    const progressBar = taskElement.querySelector('.progress-bar');
    const percentDisplay = taskElement.querySelector('.task-percent');

    const roundedPercent = Math.round(percentage);
    progressBar.style.width = roundedPercent + '%';
    progressBar.textContent = roundedPercent + '%';
    percentDisplay.textContent = roundedPercent + '%';
}

function completeTask(taskId) {
    const taskElement = appState.uploadTasks[taskId].element;
    if (!taskElement) return;

    appState.uploadTasks[taskId].status = 'completed';

    const progressBar = taskElement.querySelector('.progress-bar');
    progressBar.classList.add('completed');
    progressBar.textContent = '✓ Complete';

    const status = taskElement.querySelector('.task-status');
    status.classList.remove('uploading');
    status.classList.add('completed');
    status.textContent = 'Completed';

    setTaskCancelable(taskElement, false);

    updateClearButtonVisibility();
}

function failTask(taskId, errorMessage) {
    const taskElement = appState.uploadTasks[taskId].element;
    if (!taskElement) return;

    appState.uploadTasks[taskId].status = 'error';

    const progressBar = taskElement.querySelector('.progress-bar');
    progressBar.classList.add('error');
    progressBar.textContent = '✕ Error';

    const status = taskElement.querySelector('.task-status');
    status.classList.remove('uploading');
    status.classList.add('error');
    status.textContent = 'Error: ' + errorMessage;

    setTaskCancelable(taskElement, false);

    updateClearButtonVisibility();
}

function cancelUploadTask(taskId) {
    const task = appState.uploadTasks[taskId];
    if (!task || task.status !== 'uploading' || !task.xhr) {
        return;
    }
    task.xhr.abort();
}

function setTaskCancelable(taskElement, enabled) {
    const cancelBtn = taskElement.querySelector('.cancel-upload-btn');
    if (!cancelBtn) {
        return;
    }
    cancelBtn.disabled = !enabled;
    cancelBtn.style.display = enabled ? 'inline-block' : 'none';
}

/**
 * UTILITY FUNCTIONS
 */
function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
    return '📎';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

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

function updateClearButtonVisibility() {
    const clearTasksBtn = document.getElementById('clearTasksBtn');
    const taskList = document.getElementById('taskList');
    const hasCompletedOrErrorTasks = Array.from(taskList.children).some(task => {
        const status = task.querySelector('.task-status');
        return status && (status.classList.contains('completed') || status.classList.contains('error'));
    });

    if (hasCompletedOrErrorTasks) {
        clearTasksBtn.style.display = 'block';
    }
}

function updateUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const userMenuLabel = document.getElementById('userMenuLabel');
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const displayName = appState.displayName || 'User';
    const tenantName = appState.tenantName || '';

    userMenuLabel.textContent = displayName;
    userMenuTrigger.setAttribute('data-tenant', tenantName);

    if (appState.token) {
        userMenu.classList.remove('hidden');
    } else {
        userMenu.classList.add('hidden');
    }
}

function initSub32SplitResize() {
    const container = document.getElementById('sub32SplitContainer');
    const leftPane = document.getElementById('sub32LeftPane');
    const rightPane = document.getElementById('sub32RightPane');
    const divider = document.getElementById('sub32Divider');

    if (!container || !leftPane || !rightPane || !divider) {
        return;
    }

    const MIN_PANE_WIDTH = 180;
    const MAX_PANE_RATIO = 0.8;
    let isDragging = false;

    function updatePaneSizes(clientX) {
        const rect = container.getBoundingClientRect();
        const dividerWidth = divider.offsetWidth;
        const totalPaneWidth = rect.width - dividerWidth;
        const maxPaneWidth = Math.floor(totalPaneWidth * MAX_PANE_RATIO);
        const minLeft = Math.max(MIN_PANE_WIDTH, totalPaneWidth - maxPaneWidth);
        const maxLeft = Math.min(maxPaneWidth, totalPaneWidth - MIN_PANE_WIDTH);
        let newLeft = clientX - rect.left;

        if (newLeft < minLeft) {
            newLeft = minLeft;
        }
        if (newLeft > maxLeft) {
            newLeft = maxLeft;
        }

        const rightWidth = totalPaneWidth - newLeft;
        leftPane.style.width = `${newLeft}px`;
        rightPane.style.width = `${rightWidth}px`;
    }

    function resetPaneSizes() {
        leftPane.style.width = '50%';
        rightPane.style.width = '50%';
    }

    divider.addEventListener('mousedown', e => {
        e.preventDefault();
        isDragging = true;
        document.body.classList.add('split-resizing');
    });

    divider.addEventListener('dblclick', e => {
        e.preventDefault();
        resetPaneSizes();
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) {
            return;
        }
        updatePaneSizes(e.clientX);
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) {
            return;
        }
        isDragging = false;
        document.body.classList.remove('split-resizing');
    });
}
