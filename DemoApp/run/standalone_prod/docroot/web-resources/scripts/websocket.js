(function () {
    let wsSocket = null;

    // ── Helpers ──────────────────────────────────────────────────────────────


    // ── UI State ─────────────────────────────────────────────────────────────

    function setConnectedState(connected) {
        const status = el('wsStatus');
        const connectBtn = el('wsConnectBtn');
        const disconnectBtn = el('wsDisconnectBtn');
        const sendBtn = el('wsSendBtn');
        const fileInput = el('wsFileInput');
        const chatInput = el('wsChatInput');

        if (status) {
            status.textContent = connected ? 'Connected' : 'Disconnected';
            status.className = 'ws-status ' + (connected ? 'ws-status-connected' : 'ws-status-disconnected');
        }
        if (connectBtn) connectBtn.disabled = connected;
        if (disconnectBtn) disconnectBtn.disabled = !connected;
        if (sendBtn) sendBtn.disabled = !connected;
        if (fileInput) fileInput.disabled = !connected;
        if (chatInput) chatInput.disabled = !connected;
    }

    function appendMessage(text, cssClass) {
        const messages = el('wsChatMessages');
        if (!messages) return;

        const div = document.createElement('div');
        div.className = 'ws-message ' + (cssClass || '');
        if (text.startsWith('base64')) {
            const dataArray = text.split(',');
            const mimeType = dataArray[1];
            const fileType = dataArray[2];
            const fileExt = dataArray[3];
            const base64Data = dataArray[4]; // Remove "base64," prefix
            console.log('Received base64 data of type:', mimeType + ', fileType:' + fileType + ', fileExt:' + fileExt);
            switch (fileType) {
                case 'video':
                    displayBase64Video(base64Data, div);
                    break;
                case 'audio':
                    displayBase64Audio(base64Data, div);
                    break;
                case 'image':
                    displayBase64Image(0, base64Data, div);
                    break;
                case 'application':
                    switch (fileExt) {
                        case 'pdf':
                            displayBase64PDF(base64Data, div);
                            break;
                    }
                    break;
                default:
                    attachForDownload(base64Data, div, 'download', mimeType);
                    break;
            }
        } else {
            div.textContent = text;
        }
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function appendImage(blob, cssClass) {
        const url = URL.createObjectURL(blob);
        const img = document.createElement('img');
        img.src = url;

        const messages = el('wsChatMessages');
        if (!messages) return;

        const div = document.createElement('div');
        div.className = 'ws-message ' + (cssClass || '');
        div.appendChild(img);
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        URL.revokeObjectURL(url);// 不再使用时释放内存：
    }

    function downloadFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; // 设置下载的文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }


    // ── WebSocket Lifecycle ───────────────────────────────────────────────────

    async function connect() {
        if (wsSocket) return;

        // Await the OTT so we pass the resolved string to getWsUrl
        const wsURI = CONFIG.WS_URL_CHATROOM1;
        const ott = getOTT(wsURI);
        console.log('Resolved OTT for WS:', ott);
        const url = getWsUrl(wsURI, ott);
        console.log('WebSocket URL:', url);
        const token = getToken();

        try {
            wsSocket = token ? new WebSocket(url, token) : new WebSocket(url);
            wsSocket.binaryType = 'blob'; // 推荐用于文件处理，直接生成文件对象
            // wsSocket.binaryType = 'arraybuffer'; // 如果你需要逐字节解析或修改文件数据
        } catch (e) {
            appendMessage('Failed to create WebSocket: ' + e.message, 'ws-message-error');
            return;
        }

        wsSocket.binaryType = 'arraybuffer';

        wsSocket.onopen = function () {
            setConnectedState(true);
            appendMessage('Connected to chat room.', 'ws-message-system');
        };

        wsSocket.onclose = function (event) {
            setConnectedState(false);
            wsSocket = null;
            appendMessage('Disconnected (code: ' + event.code + ').', 'ws-message-system');
        };

        wsSocket.onerror = function () {
            appendMessage('WebSocket error occurred.', 'ws-message-error');
        };

        wsSocket.onmessage = function (event) {
            if (typeof event.data === 'string') {
                // Server may send multi-line history in one frame
                const lines = event.data.split('\n');
                lines.forEach(function (line) {
                    if (line.trim()) {
                        appendMessage(line, 'ws-message-incoming');
                    }
                });
            } else if (event.data instanceof Blob) {
                appendMessage('[Binary data received Blob (' + event.data.byteLength + ' bytes)]', 'ws-message-incoming');
                const fileBlob = event.data;
                // 渲染图片
                const imageUrl = URL.createObjectURL(fileBlob);
                document.getElementById('my-image').src = imageUrl;

                //downloadFile(fileBlob, 'downloaded_file.ext');
                appendImage(fileBlob, 'ws-message-incoming');
            } else if (event.data instanceof ArrayBuffer) {
                appendMessage('[Binary data received ArrayBuffer (' + event.data.byteLength + ' bytes)]', 'ws-message-incoming');
                const arrayBuffer = event.data;
                // 使用 DataView 或类型化数组（如 Uint8Array）读取
                const view = new Uint8Array(arrayBuffer);

                // convert to Blob for easier handling (e.g., if it's an image or file)
                const fileBlob = new Blob([arrayBuffer]);

                //downloadFile(fileBlob, 'downloaded_file.ext');
                appendImage(fileBlob, 'ws-message-incoming');
            } else {
                appendMessage('[Binary data received unknown type (' + event.data.byteLength + ' bytes)]', 'ws-message-incoming');
            }
        };
    }

    function disconnect() {
        if (wsSocket) {
            wsSocket.close();
            wsSocket = null;
        }
    }

    // ── Sending ───────────────────────────────────────────────────────────────

    function sendMessage() {
        if (!wsSocket || wsSocket.readyState !== WebSocket.OPEN) return;
        const input = el('wsChatInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        wsSocket.send(text);
        input.value = '';
        input.focus();
    }

    function sendFile(file) {
        //sendHugeFile(file);
        const fileSize = file.size;
        if (fileSize > 5242880) {
            sendHugeFile(file);
        } else {
            sendSmallFile(file);
        }
    }

    function sendSmallFile(file) {
        if (!wsSocket || wsSocket.readyState !== WebSocket.OPEN || !file) return;
        const reader = new FileReader();
        reader.onloadend = function () {
            wsSocket.send(reader.result);
            appendMessage('File sent: ' + file.name + ' (' + file.size + ' bytes)', 'ws-message-system');
        };
        reader.onerror = function () {
            appendMessage('Failed to read file: ' + file.name, 'ws-message-error');
        };
        reader.readAsArrayBuffer(file);
    }

    function sendHugeFile(file) {
        const wsURI = CONFIG.WS_URL_LARGEFILEUPLOAD;
        const uploader = new HugeFileUploader(wsURI, file);
        uploader.checkBeforeUpload();
    }

    // ── Initialisation ────────────────────────────────────────────────────────

    function initWs() {
        const connectBtn = el('wsConnectBtn');
        if (!connectBtn) return;  // View not present

        connectBtn.addEventListener('click', connect);
        el('wsDisconnectBtn').addEventListener('click', disconnect);
        el('wsSendBtn').addEventListener('click', sendMessage);

        const chatInput = el('wsChatInput');
        if (chatInput) {
            chatInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        const fileInput = el('wsFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', function () {
                const file = fileInput.files[0];
                if (file) {
                    sendFile(file);
                }
                fileInput.value = '';
            });
        }

        const clearBtn = el('wsClearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                const messages = el('wsChatMessages');
                if (messages) messages.innerHTML = '';
            });
        }
    }

    document.addEventListener('DOMContentLoaded', initWs);
})();
