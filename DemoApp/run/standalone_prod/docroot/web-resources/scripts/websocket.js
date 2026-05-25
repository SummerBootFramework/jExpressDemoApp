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


/**
 * @author Changski Tie Zheng Zhang 张铁铮, 魏泽北, 杜旺财, 杜富贵
 */
class WebSocketClient {

    constructor(wsURI) {
        this.wsURI = wsURI;
        this.ws = null;
        //this.initGUI('wsStatus', 'wsConnectBtn', 'wsDisconnectBtn', 'wsSendBtn', 'wsFileInput', 'wsChatInput', 'wsChatMessages', 'wsClearBtn', 'wsFileUploadProgressBar', 'wsFileUploadStatusText');
    }

    // 1. GUI: add event listener
    apiInitGUI(statusDivId, connectBtnId, disconnectBtnId, sendBtnId, fileInputId, chatInputId, chatViewDivId, chatMessageClearBtnId, fileUploadProgressBarDivId, fileUploadStatusTextDivId) {
        this.status = document.getElementById(statusDivId); // 'wsStatus'
        this.connectBtn = document.getElementById(connectBtnId); // 'wsConnectBtn'
        this.disconnectBtn = document.getElementById(disconnectBtnId); // 'wsDisconnectBtn'
        this.sendBtn = document.getElementById(sendBtnId); // 'wsSendBtn'
        this.fileInput = document.getElementById(fileInputId); // 'fileInput'
        this.chatInput = document.getElementById(chatInputId); // 'wsChatInput'
        this.chatMessagesView = document.getElementById(chatViewDivId); // 'wsChatMessages'
        this.chatMessageClearBtn = document.getElementById(chatMessageClearBtnId); // 'wsClearBtn'
        this.fileUploadProgressBar = document.getElementById(fileUploadProgressBarDivId); // 'wsFileUploadProgressBar'
        this.fileUploadStatus = document.getElementById(fileUploadStatusTextDivId); // 'wsFileUploadStatusText'

        this.connectBtn.addEventListener('click', this.apiConnect);
        this.disconnectBtn.addEventListener('click', this.apiDisconnect);
        this.sendBtn.addEventListener('click', this.apiSendMessage);

        const chatInput = this.chatInput;
        if (chatInput) {
            //chatInput.addEventListener('keydown', function (e) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.apiSendMessage();
                }
            });
        }

        const fileInput = this.fileInput;
        if (fileInput) {
            fileInput.addEventListener('change', () => {
                const file = fileInput.files[0];
                if (file) {
                    this.apiSendFile(file);
                }
                fileInput.value = '';
            });
        }

        const clearBtn = this.chatMessageClearBtn;
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const messages = this.chatMessagesView;
                if (messages) messages.innerHTML = '';
                if (this.fileUploadStatus) this.fileUploadStatus.innerText = '';
                if (this.fileUploadProgressBar) {
                    this.fileUploadProgressBar.innerText = '';
                    this.fileUploadProgressBar.style.backgroundColor = 'transparent';
                }
            });
        }
    }

    // 2. GUI: update button status on connection status change
    onConnectionStatusChanged(connected) {
        if (this.status) {
            this.status.textContent = connected ? 'Connected' : 'Disconnected';
            this.status.className = 'ws-status ' + (connected ? 'ws-status-connected' : 'ws-status-disconnected');
        }
        if (this.connectBtn) this.connectBtn.disabled = connected;
        if (this.disconnectBtn) this.disconnectBtn.disabled = !connected;
        if (this.sendBtn) this.sendBtn.disabled = !connected;
        if (this.fileInput) this.fileInput.disabled = !connected;
        if (this.chatInput) this.chatInput.disabled = !connected;
    }

    // 2.1 connection: auth
    rpcRequestOTT(wsURI) {
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

    // 2.2 connection: URI with auth result
    utilBuildWsURI(wsURI, ott) {
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return proto + '//' + window.location.host + wsURI + '/' + (ott || '');
    }

    apiDisconnect = () => {
        if (this.ws) {
            this.ws.send(JSON.stringify({
                status: 'DISCONNECT'
            }));
        }
    }

    // 1. Establish a WebSocket connection
    apiConnect = async () => {
        console.log('Connecting: ' + this.wsURI);
        const ott = this.rpcRequestOTT(this.wsURI);
        console.log('got Resolved OTT:', ott);
        const url = this.utilBuildWsURI(this.wsURI, ott);
        console.log('WebSocket URL:', url);
        this.ws = new WebSocket(url);
        this.ws.binaryType = 'blob'; // 推荐用于文件处理，直接生成文件对象
        // this.ws.binaryType = 'arraybuffer'; // 如果你需要逐字节解析或修改文件数据

        this.ws.onopen = () => {
            this.onConnectionStatusChanged(true);
            this.utilAppendMessage('Connected to chat room.', 'ws-message-system');
            this.ws.send(JSON.stringify({
                status: 'CONNECT',
                msg: appState.uid
            }));
            this.ws.send(JSON.stringify({
                status: 'SUBSCRIBE',
                msg: '888'
            }));
        };

        this.ws.onclose = (event) => {
            console.log("WebSocket channel closed: " + event.code);
            this.onConnectionStatusChanged(false);
            this.ws = null;
            if (event.code === 1000) {
                this.utilAppendMessage('Disconnected successfully (code: ' + event.code + ').', 'ws-message-system');
            } else {
                this.utilAppendMessage('Disconnected unexpected (code: ' + event.code + ').', 'ws-message-error');
            }
        };

        this.ws.onerror = () => {
            this.utilAppendMessage('WebSocket error occurred.', 'ws-message-error');
        };

        // 3. Core: A response listener designed based on the backend CompletableFuture architecture.
        this.ws.onmessage = (event) => {
            if (typeof event.data === 'string') {
                const response = JSON.parse(event.data);
                console.log(response);
                this.onTextResponse(response);
            } else if (event.data instanceof Blob) {
                const fileBlob = event.data;
                this.onBlobResponse(fileBlob);
            } else if (event.data instanceof ArrayBuffer) {

            } else {
                this.utilAppendMessage('[Binary data received unknown type (' + event.data.byteLength + ' bytes)]', 'ws-message-incoming');
            }
        };
    }

    onTextResponse = (response) => {
        if (response.status === "MESSAGE") {
            // Server may send multi-line history in one frame
            const lines = response.msg.split('\n');
            lines.forEach((line) => {
                if (line.trim()) {
                    this.utilAppendMessage(line, 'ws-message-incoming');
                }
            });
        } else if (response.status === "FILE") {
            this.fileMimeType = response.mimeType;
            this.fileGroup = response.fileType;
            this.fileExtension = response.fileExtension;
            this.fileName = response.fileName;
        }

        // Core Branch A: Traditional Physical File Fragmentation to Disk Progress
        else if (response.status === "UPLOAD_SERVER_RECEIVED_CHUNK") {
            // Calculate the actual physical upload percentage
            let realPercent = (response.num / this.file.size) * 100;

            // [Crucial] As long as the file hasn't passed the global audit, the progress will be locked at a maximum of 99%.
            // This prevents the interface from reaching 100% while the user is still waiting for backend antivirus and transcoding, creating the illusion of a "freeze".
            let displayPercent = Math.min(realPercent, 99).toFixed(1);

            this.utilUpdateProgress(displayPercent, `Uploaded ${(response.num / 1024 / 1024).toFixed(1)}MB / ${(this.file.size / 1024 / 1024).toFixed(1)}MB`);

            // Triggering the back pressure and reverse pressure safety valve: The backend finished writing this 1MB, and the frontend is only now sending the next block.
            this.utilSendNextChunk();
        }

        // Core branch B: The files have been sent, and we are now entering phase two (the backend has entered the parallel auditing of CompletableFuture.allOf).
        else if (response.status === "UPLOAD_SERVER_RECEIVED_FULL") {
            this.fileUploadStatus.style.color = "#ff9800"; // 橙色提示
            this.fileUploadStatus.innerText = "⚡ Physical file transfer complete! The server is currently performing the following in parallel: antivirus scan and multi-bitrate video transcoding and slicing. Please wait...";
            // 此时进度条稳稳地悬停在 99%
        }

        // Core Branch C: [Final Station] All backend multitasking tasks passed!
        else if (response.status === "UPLOAD_SERVER_AUDIT_COMPLETE") {
            this.fileUploadProgressBar.style.backgroundColor = "#4caf50"; // 鲜绿色
            this.utilUpdateProgress("100.0", "🎉 All backend transcoding and security audit tasks have been successfully completed! The files are ready.");
            //this.ws.close();
            this.onFileUploaded();
        }

        // Core Branch D: [Failure Terminal] Security scan intercepts (virus detected) or transcodes completely crashes.
        else if (response.status === "UPLOAD_SERVER_AUDIT_FAILED") {
            this.fileUploadProgressBar.style.backgroundColor = "#f44336"; // 红色
            this.utilUpdateProgress("99.0", `❌ Upload abort: ${response.reason}`);
            //this.ws.close();
            this.onFileUploaded();
        }
    }

    onLargeRemoteDownloadResponse = (message) => {
        const container = this.chatMessagesView;
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
                <div class="file-info">
                    <span class="file-icon">📄</span>
                    <div class="file-detail">
                        <p class="file-name">大文件分享</p>
                        <p class="file-size">大小: ${(message.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
                <a href="${message.url}" target="_blank" download class="download-btn">点击下载</a>
            `;

        container.appendChild(card);
    }

    onBlobResponse = (fileBlob) => {
        // 💡 关键步：为二进制数据生成一个本地临时的 Object URL
        const objectURL = URL.createObjectURL(fileBlob);

        // 2. 根据文件类型（MIME Type）渲染到不同的 HTML 标签中
        const mimeType = this.fileMimeType;
        const fileGroup = this.fileGroup;
        const fileExtension = this.fileExtension;
        const fileName = this.fileName;
        console.log('mimeType:' + mimeType + ', group:' + fileGroup + ', extension:' + fileExtension + ', fileName:' + fileName);
        const container = this.chatMessagesView;

        switch (fileGroup) {
            case 'video':
                const videoDiv = buildVideoDiv(objectURL, fileName, '300px', 'ws-message-system');
                container.appendChild(videoDiv);
                container.scrollTop = container.scrollHeight;
                break;
            case 'audio':
                const audioDiv = buildAudioDiv(objectURL, fileName, '300px', 'ws-message-system');
                container.appendChild(audioDiv);
                container.scrollTop = container.scrollHeight;
                break;
            case 'image':
                const imageDiv = buildImageDiv(objectURL, fileName, '300px', 'ws-message-system');
                container.appendChild(imageDiv);
                container.scrollTop = container.scrollHeight;
                break;
            case 'application':
                switch (fileExtension) {
                    case 'pdf':
                        const pdfDiv = buildPdfDiv(fileBlob, fileName, '300px', 'ws-message-system');
                        container.appendChild(pdfDiv);
                        container.scrollTop = container.scrollHeight;
                        break;
                    default:
                        break;
                }
                break;
        }
        // const link = document.createElement('a');
        // link.href = objectURL;
        // link.download = fileName; // 如果后端在流里没带文件名，可自定义
        // link.textContent = fileName + " (click to download)";
        // container.appendChild(link);
        const downloadDiv = buildDownloadDiv(objectURL, fileName, 'ws-message-system', container);
        container.appendChild(downloadDiv);
        container.scrollTop = container.scrollHeight;
    }

    //sendMessage() {
    apiSendMessage = () => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        const input = this.chatInput;
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        this.ws.send(JSON.stringify({
            status: 'SEND',
            msg: text
        }));
        input.value = '';
        input.focus();
    }

    apiSendFile(file) {
        this.ws.send(JSON.stringify({
            status: 'UPLOAD_CLIENT_START',
            msg: file.name,
            num: file.size
        }));

        this.file = file;
        this.offset = 0;
        this.CHUNK_SIZE = 64 * 1024; // 64KB for Chrome, >= 1MB for Firefox
        this.fileUploadStatus.innerText = "Data transfer begins...";

        this.fileMimeType = '';
        this.fileGroup = '';
        this.fileExtension = '';
        this.fileName = file.name;
        this.utilSendNextChunk();
    }

    onFileUploaded() {
        this.offset = 0;
        this.file = null;
        this.CHUNK_SIZE = 64 * 1024; // 64KB for Chrome, >= 1MB for Firefox
        this.fileUploadStatus.innerText = "Data transfer finished. You can select another file to upload.";
    }

    // 4. Read slice and fire
    utilSendNextChunk() {
        console.log(`sendNextChunk ${this.offset}/${this.file.size}`);
        // 157286400/22410018
        if (this.offset >= this.file.size) {
            // All chunks sent - notify server
            console.log("All slices have been sent, and the server is being notified that the upload is complete...");
            this.ws.send(JSON.stringify({
                status: 'UPLOAD_CLIENT_COMPLETE'
            }));
            return;
        }

        const slice = this.file.slice(this.offset, this.offset + this.CHUNK_SIZE);
        const reader = new FileReader();

        reader.onload = (e) => {
            this.ws.send(e.target.result);
            this.offset += this.CHUNK_SIZE;
        };
        reader.readAsArrayBuffer(slice);
    }

    // 5. Core methods for driving UI rendering
    utilUpdateProgress(percent, text) {
        this.fileUploadProgressBar.style.width = percent + "%";
        this.fileUploadProgressBar.innerText = percent + "%";
        this.fileUploadStatus.innerText = text;
    }

    //appendMessage(text, cssClass) {
    utilAppendMessage = (text, cssClass) => {
        const div = document.createElement('div');
        div.className = 'ws-message ' + (cssClass || '');
        div.textContent = text;
        this.chatMessagesView.appendChild(div);
        this.chatMessagesView.scrollTop = this.chatMessagesView.scrollHeight;
    }

}
