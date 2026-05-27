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
class WebSocketClient_STOMP {

    constructor(wsURI) {
        this.wsURI = wsURI;
        this.stompClient = null;
        this.connected = false;
    }

    // 1. GUI: add event listener
    apiInitGUI(statusDivId, connectBtnId, disconnectBtnId, sendBtnId, fileInputId, chatInputId, chatViewDivId, chatMessageClearBtnId, fileUploadProgressBarDivId, fileUploadStatusTextDivId) {
        this.status = document.getElementById(statusDivId);
        this.connectBtn = document.getElementById(connectBtnId);
        this.disconnectBtn = document.getElementById(disconnectBtnId);
        this.sendBtn = document.getElementById(sendBtnId);
        this.fileInput = document.getElementById(fileInputId);
        this.chatInput = document.getElementById(chatInputId);
        this.chatMessagesView = document.getElementById(chatViewDivId);
        this.chatMessageClearBtn = document.getElementById(chatMessageClearBtnId);
        this.fileUploadProgressBar = document.getElementById(fileUploadProgressBarDivId);
        this.fileUploadStatus = document.getElementById(fileUploadStatusTextDivId);

        this.connectBtn.addEventListener('click', this.apiConnect);
        this.disconnectBtn.addEventListener('click', this.apiDisconnect);
        this.sendBtn.addEventListener('click', this.apiSendMessage);

        const chatInput = this.chatInput;
        if (chatInput) {
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
        this.connected = connected;
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

    // 2.1 connection: auth - request One Time Ticket
    rpcRequestOTT(wsURI) {
        return getOTT(wsURI);
    }

    // 2.2 connection: URI with auth result
    utilBuildWsURI(wsURI, ott) {
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return proto + '//' + window.location.host + wsURI + '/' + (ott || '');
    }

    // Disconnect from STOMP server
    apiDisconnect = () => {
        console.log('Disconnecting from STOMP server...');
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.disconnect(() => {
                console.log('Successfully disconnected from STOMP server');
                this.onConnectionStatusChanged(false);
                this.utilAppendMessage('Disconnected successfully.', 'ws-message-system');
            });
        } else {
            console.warn('STOMP client not connected or unavailable');
        }
    }

    // 1. Establish a WebSocket connection and connect to STOMP server
    apiConnect = async () => {
        console.log('=== Initiating STOMP Connection ===');
        console.log('WebSocket URI:', this.wsURI);
        //const ott = this.rpcRequestOTT(this.wsURI);
        const ott = getOTT(this.wsURI);
        if (!ott) {
            this.utilAppendMessage('Cannot connect: failed to get OTT token.', 'ws-message-error');
            return;
        }
        console.log('OTT received:', ott);
        const url = this.utilBuildWsURI(this.wsURI, ott);
        console.log('Full WebSocket URL:', url);
        console.log('===================================');

        // Check if Stomp library is loaded
        if (typeof Stomp === 'undefined') {
            this.utilAppendMessage('Error: STOMP library not loaded. Please refresh the page.', 'ws-message-error');
            console.error('STOMP library is not available');
            return;
        }

        // Create WebSocket and STOMP client
        console.log('Creating WebSocket connection...');
        const ws = new WebSocket(url);
        this.stompClient = Stomp.over(ws);

        // Suppress connection logs
        this.stompClient.debug = null;

        console.log('Connecting to STOMP broker...');
        this.stompClient.connect(
            {}, // headers
            this.onStompConnect.bind(this), // onConnect callback
            this.onStompError.bind(this) // onError callback
        );
    }

    // STOMP connection successful callback
    onStompConnect = (frame) => {
        console.log('=== STOMP Connected ===');
        console.log('Frame:', frame);
        console.log('Frame Headers:', frame.headers);
        console.log('=======================');
        console.log('Connected to STOMP server');
        this.onConnectionStatusChanged(true);
        this.utilAppendMessage('Connected to chat room.', 'ws-message-system');

        // Subscribe to message topic
        console.log('Subscribing to /topic/messages');
        this.stompClient.subscribe('/topic/messages', (message) => {
            console.log('Received message on /topic/messages:', message);
            this.onStompMessage(message);
        });

        // Subscribe to notifications/announcements
        console.log('Subscribing to /topic/announcements');
        this.stompClient.subscribe('/topic/announcements', (message) => {
            console.log('Received message on /topic/announcements:', message);
            const body = message.body;
            this.utilAppendMessage('[Announcement] ' + body, 'ws-message-system');
        });

        // Subscribe to file transfer status
        console.log('Subscribing to /user/queue/file-status');
        this.stompClient.subscribe('/user/queue/file-status', (message) => {
            console.log('Received message on /user/queue/file-status:', message);
            try {
                const response = JSON.parse(message.body);
                this.onFileTransferStatus(response);
            } catch (e) {
                console.error('Failed to parse file status:', e);
            }
        });
    }

    // Handle STOMP frame from server
    onStompMessage = (message) => {
        const body = message.body;
        console.log('=== STOMP Message Received ===');
        console.log('Destination:', message.headers.destination);
        console.log('Message ID:', message.headers['message-id']);
        console.log('Content-Type:', message.headers['content-type']);
        console.log('Body:', body);
        console.log('Full Message Object:', message);
        console.log('==============================');

        try {
            // Try to parse as JSON first
            const response = JSON.parse(body);
            console.log('Parsed JSON Response:', response);
            this.onTextResponse(response);
        } catch (e) {
            // If not JSON, treat as plain text message
            console.log('Treating as plain text message:', body);
            this.utilAppendMessage(body, 'ws-message-incoming');
        }
    }

    // Handle STOMP errors
    onStompError = (frame) => {
        console.error('=== STOMP ERROR ===');
        console.error('Frame:', frame);
        console.error('Frame Body:', frame.body);
        if (frame && frame.headers) {
            console.error('Frame Headers:', frame.headers);
        }
        console.error('===================');
        if (frame && frame.body) {
            this.utilAppendMessage('STOMP error: ' + frame.body, 'ws-message-error');
        } else {
            this.utilAppendMessage('STOMP connection error occurred.', 'ws-message-error');
        }
        this.onConnectionStatusChanged(false);
    }

    // WebSocket close callback
    onWebSocketClose = () => {
        console.log('WebSocket closed');
        this.onConnectionStatusChanged(false);
        this.utilAppendMessage('Disconnected (WebSocket closed).', 'ws-message-system');
    }

    // WebSocket error callback
    onWebSocketError = (event) => {
        console.error('WebSocket error:', event);
        this.onConnectionStatusChanged(false);
        this.utilAppendMessage('WebSocket error occurred. Disconnected.', 'ws-message-error');
    }

    onTextResponse = (response) => {
        if (response.status === "MESSAGE") {
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
        } else if (response.status === "UPLOAD_SERVER_RECEIVED_CHUNK") {
            let realPercent = (response.num / this.file.size) * 100;
            let displayPercent = Math.min(realPercent, 99).toFixed(1);
            this.utilUpdateProgress(displayPercent, `Uploaded ${(response.num / 1024 / 1024).toFixed(1)}MB / ${(this.file.size / 1024 / 1024).toFixed(1)}MB`);
            this.utilSendNextChunk();
        } else if (response.status === "UPLOAD_SERVER_RECEIVED_FULL") {
            this.fileUploadStatus.style.color = "#ff9800";
            this.fileUploadStatus.innerText = "⚡ Physical file transfer complete! The server is currently performing antivirus scan and video transcoding. Please wait...";
        } else if (response.status === "UPLOAD_SERVER_AUDIT_COMPLETE") {
            this.fileUploadProgressBar.style.backgroundColor = "#4caf50";
            this.utilUpdateProgress("100.0", "🎉 All backend transcoding and security audit tasks completed!");
            this.onFileUploaded();
        } else if (response.status === "UPLOAD_SERVER_AUDIT_FAILED") {
            this.fileUploadProgressBar.style.backgroundColor = "#f44336";
            this.utilUpdateProgress("99.0", `❌ Upload abort: ${response.reason}`);
            this.onFileUploaded();
        }
    }

    onFileTransferStatus = (response) => {
        this.onTextResponse(response);
    }

    onBlobResponse = (fileBlob) => {
        const objectURL = URL.createObjectURL(fileBlob);
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

        const downloadDiv = buildDownloadDiv(objectURL, fileName, 'ws-message-system', container);
        container.appendChild(downloadDiv);
        container.scrollTop = container.scrollHeight;
    }

    // Send text message via STOMP
    apiSendMessage = () => {
        if (!this.stompClient || !this.stompClient.connected) {
            this.utilAppendMessage('Error: Not connected to server.', 'ws-message-error');
            console.error('Cannot send message: STOMP client not connected');
            return;
        }

        const input = this.chatInput;
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const payload = JSON.stringify({
            status: 'SEND',
            msg: text
        });

        console.log('=== Sending STOMP Message ===');
        console.log('Destination: /app/chat');
        console.log('Payload:', payload);
        console.log('=============================');

        // Send message to /app/chat destination (backend will process this)
        this.stompClient.send('/app/chat', {}, payload);

        input.value = '';
        input.focus();
    }

    apiSendFile(file) {
        if (!this.stompClient || !this.stompClient.connected) {
            this.utilAppendMessage('Error: Not connected to server.', 'ws-message-error');
            console.error('Cannot send file: STOMP client not connected');
            return;
        }

        const payload = JSON.stringify({
            status: 'UPLOAD_CLIENT_START',
            msg: file.name,
            num: file.size
        });

        console.log('=== Sending File Upload Start ===');
        console.log('Destination: /app/file-upload-start');
        console.log('Payload:', payload);
        console.log('==================================');

        // Send file metadata to server
        this.stompClient.send('/app/file-upload-start', {}, payload);

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
        this.CHUNK_SIZE = 64 * 1024;
        this.fileUploadStatus.innerText = "Data transfer finished. You can select another file to upload.";
    }

    // 4. Read slice and send via STOMP
    utilSendNextChunk() {
        console.log(`Sending file chunk: ${this.offset}/${this.file.size}`);
        if (this.offset >= this.file.size) {
            console.log("All file slices sent, notifying server that upload is complete...");
            const payload = JSON.stringify({
                status: 'UPLOAD_CLIENT_COMPLETE'
            });
            console.log('=== Sending File Upload Complete ===');
            console.log('Destination: /app/file-upload-complete');
            console.log('Payload:', payload);
            console.log('====================================');
            this.stompClient.send('/app/file-upload-complete', {}, payload);
            return;
        }

        const slice = this.file.slice(this.offset, this.offset + this.CHUNK_SIZE);
        const reader = new FileReader();

        reader.onload = (e) => {
            const chunkSize = e.target.result.byteLength;
            console.log(`Sending file chunk: offset=${this.offset}, chunkSize=${chunkSize} bytes`);
            // Send binary chunk data
            this.stompClient.send('/app/file-upload-chunk',
                {'content-type': 'application/octet-stream'},
                e.target.result
            );
            this.offset += this.CHUNK_SIZE;
        };
        reader.readAsArrayBuffer(slice);
    }

    // 5. Update progress UI
    utilUpdateProgress(percent, text) {
        this.fileUploadProgressBar.style.width = percent + "%";
        this.fileUploadProgressBar.innerText = percent + "%";
        this.fileUploadStatus.innerText = text;
    }

    // Append message to chat view
    utilAppendMessage = (text, cssClass) => {
        const div = document.createElement('div');
        div.className = 'ws-message ' + (cssClass || '');
        div.textContent = text;
        this.chatMessagesView.appendChild(div);
        this.chatMessagesView.scrollTop = this.chatMessagesView.scrollHeight;
    }
}