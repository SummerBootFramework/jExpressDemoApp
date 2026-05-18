/**
 * File Upload feature module
 */

function attachFileUploadEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const dropZone = document.getElementById('dropZone');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearTasksBtn = document.getElementById('clearTasksBtn');

    if (!fileInput || !selectFileBtn || !dropZone || !uploadBtn || !clearTasksBtn) {
        return;
    }

    fileInput.addEventListener('change', handleFileSelect);
    selectFileBtn.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => fileInput.click());

    uploadBtn.addEventListener('click', handleUpload);
    clearTasksBtn.addEventListener('click', handleClearTasks);
}

function handleClearTasks() {
    const taskList = document.getElementById('taskList');
    const uploadTasks = document.getElementById('uploadTasks');
    const clearTasksBtn = document.getElementById('clearTasksBtn');

    taskList.innerHTML = '';
    appState.uploadTasks = {};
    uploadTasks.classList.remove('active');
    clearTasksBtn.style.display = 'none';
}

function resetFileUploadState() {
    appState.selectedFiles = [];
    appState.uploadTasks = {};
    appState.taskIdCounter = 0;

    const fileList = document.getElementById('fileList');
    const taskList = document.getElementById('taskList');
    const filePreview = document.getElementById('filePreview');
    const uploadTasks = document.getElementById('uploadTasks');

    if (fileList) fileList.innerHTML = '';
    if (taskList) taskList.innerHTML = '';
    if (filePreview) filePreview.classList.remove('active');
    if (uploadTasks) uploadTasks.classList.remove('active');
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFilesToSelection(files);
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

        if (file.type.startsWith('image/')) {
            generateThumbnail(file, fileItem);
        }
    });
}

function generateThumbnail(file, fileItemElement) {
    const reader = new FileReader();

    reader.onload = e => {
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

async function handleUpload() {
    if (appState.selectedFiles.length === 0 || !appState.token) {
        alert('No files selected or not authenticated');
        return;
    }

    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;

    const uploadTasksDiv = document.getElementById('uploadTasks');
    uploadTasksDiv.classList.add('active');

    for (const file of appState.selectedFiles) {
        uploadFile(file);
    }

    appState.selectedFiles = [];
    renderFilePreview();
    updateUploadButtonState();
    uploadBtn.disabled = false;
}

function uploadFile(file) {
    const taskId = appState.taskIdCounter++;
    const formData = new FormData();
    formData.append('file', file);

    const taskItem = createTaskItem(taskId, file.name, file.size);
    const taskList = document.getElementById('taskList');
    taskList.appendChild(taskItem);

    const cancelBtn = taskItem.querySelector('.cancel-upload-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            cancelUploadTask(taskId);
        });
    }

    appState.uploadTasks[taskId] = {
        element: taskItem,
        xhr: null,
        status: 'uploading'
    };

    const xhr = new XMLHttpRequest();
    appState.uploadTasks[taskId].xhr = xhr;

    xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            updateTaskProgress(taskId, percentComplete);
        }
    });

    xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
            completeTask(taskId);
        } else {
            failTask(taskId, `Server returned status ${xhr.status}`);
        }
    });

    xhr.addEventListener('error', () => {
        failTask(taskId, 'Upload failed');
    });

    xhr.addEventListener('abort', () => {
        failTask(taskId, 'Upload cancelled');
    });

    xhr.open('POST', CONFIG.CONTEXT_ROOT + CONFIG.URI_UPLOAD);
    xhr.setRequestHeader('Authorization', `Bearer ${appState.token}`);
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
    progressBar.textContent = 'Complete';

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
    progressBar.textContent = 'Error';

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

function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return 'IMG';
    if (mimeType.startsWith('video/')) return 'VID';
    if (mimeType.startsWith('audio/')) return 'AUD';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.includes('word')) return 'DOC';
    if (mimeType.includes('sheet')) return 'XLS';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'ZIP';
    return 'FILE';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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

