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

/*
在数 GB 级的大文件传输过程中，网络抖动（如 Wi-Fi 信号不稳定、基站切换）是不可避免的。如果网络一断开，前端就立刻发起高频重连，在服务器宕机或网络彻底崩溃时，成千上万个客户端的并发重连会引发分布式拒绝服务攻击（DDoS 塌陷效应），直接把后端网关冲垮。
为了保障高可用性，行业标准的做法是引入 指数退避算法（Exponential Backoff） 结合 随机抖动因子（Jitter）。
指数退避：每次重连失败，下一次重连的等待时间都会翻倍（例如 1秒 ➡️ 2秒 ➡️ 4秒 ➡️ 8秒），防止高频轰炸服务器。
随机抖动（Jitter）：在等待时间上加上一个随机数，防止集群下所有客户端在同一秒同时发起重连，实现流量错峰。


🛡️ 这套高可用策略对系统的保护作用
规避“雷暴并发”冲击：
假设服务器发生短暂断电，在重启完成的瞬间，所有断开的几千个浏览器客户端会在第 1 秒瞬间发起重连，这会产生极高的瞬时 QPS 将刚重启的系统重新击垮。通过在代码中加入 Math.random() 引入随机抖动因子，可以把这几千个请求平滑地稀释铺展到 0.5 秒到 1.5 秒的时间长轴中，使后端的微服务网关和 Nginx 路由承受的波峰流量极其平稳。
两端游标强制幂等对齐：
网络断开时，前端发送完了第 151 块碎片并把游标推进到了 151MB，但可能在后端还没来得及把这 1MB 刷入 NVMe 固态硬盘（或者写完磁盘后还没来得及发出 ACK 回包）时连接就断了。
我们的设计是：重连时不盲目沿用前端本地的游标，而是通过 checkBeforeUpload() 强制重新去后端读取真实的物理文件大小（File.length()），后端说当前是 150MB，前端就无条件将游标倒带回 150MB 重新发射。这就完美确保了多块分片在任何网络突发状况下绝对不重、不漏、不错位。

至此，前后端关于大文件秒传、断点续传、串行反压控制、并行转码审计以及高可用容灾退避的闭环逻辑已经全部落地。

使用方式：
const uploader = new HugeFileUploader(bigFile, "user_999");
uploader.checkBeforeUpload();
*/

class HugeFileUploader {
    constructor(wsURI, file) {
        this.wsURI = wsURI;
        this.file = file;
        this.CHUNK_SIZE = 1024 * 1024; // 1MB 分片
        this.offset = 0;
        this.ws = null;

        // 获取 DOM 元素用于更新 UI
        this.progressBar = document.getElementById("progressBar");
        this.statusText = document.getElementById("statusText");
    }

    // 1. Pre-check request (based on instant transfer/resumable transfer history)
    async checkBeforeUpload() {
        this.statusText.innerText = "正在校验本地文件特征...";

        // Simulate requesting a resume function from an HTTP interface (assuming 0 bytes were previously transferred, resulting in a completely new file).
        const mockHttpResponse = {
            status: "PARTIAL",
            uploadedSize: 0,
            ticket: "t_future_task_888"
        };

        this.offset = mockHttpResponse.uploadedSize;
        this.startWebSocket();
    }

    // 2. Establish a WebSocket connection
    startWebSocket() {
        //this.ws = new WebSocket(`wss://://yourserver.com{ticket}`);
        const wsURI = this.wsURI;//CONFIG.WS_URL_LARGEFILEUPLOAD;
        console.log('LFU.Resolved wsURI for WS:', wsURI);
        const ott = getOTT(wsURI);
        console.log('LFU.Resolved OTT for WS:', ott);
        const url = getWsUrl(wsURI, ott);
        console.log('LFU.WebSocket URL:', url);
        this.ws = new WebSocket(url);
        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = () => {
            this.statusText.innerText = "Connection successful, data transfer begins...";
            this.sendNextChunk();
        };

        // 3. Core: A response listener designed based on the backend CompletableFuture architecture.
        this.ws.onmessage = (event) => {
            const response = JSON.parse(event.data);

            // Core Branch A: Traditional Physical File Fragmentation to Disk Progress
            if (response.status === "PROGRESS") {
                // Calculate the actual physical upload percentage
                let realPercent = (response.uploadedSize / this.file.size) * 100;

                // [Crucial] As long as the file hasn't passed the global audit, the progress will be locked at a maximum of 99%.
                // This prevents the interface from reaching 100% while the user is still waiting for backend antivirus and transcoding, creating the illusion of a "freeze".
                let displayPercent = Math.min(realPercent, 99).toFixed(1);

                this.updateUI(displayPercent, `Uploaded ${(response.uploadedSize / 1024 / 1024).toFixed(1)}MB / ${(this.file.size / 1024 / 1024).toFixed(1)}MB`);

                // Triggering the back pressure and reverse pressure safety valve: The backend finished writing this 1MB, and the frontend is only now sending the next block.
                this.sendNextChunk();
            }

            // Core branch B: The files have been sent, and we are now entering phase two (the backend has entered the parallel auditing of CompletableFuture.allOf).
            else if (response.status === "COMPLETE") {
                this.statusText.style.color = "#ff9800"; // 橙色提示
                this.statusText.innerText = "⚡ Physical file transfer complete! The server is currently performing the following in parallel: antivirus scan and multi-bitrate video transcoding and slicing. Please wait...";
                // 此时进度条稳稳地悬停在 99%
            }

            // Core Branch C: [Final Station] All backend multitasking tasks passed!
            else if (response.status === "ALL_TASKS_COMPLETE") {
                this.progressBar.style.backgroundColor = "#4caf50"; // 鲜绿色
                this.updateUI("100.0", "🎉 All backend transcoding and security audit tasks have been successfully completed! The files are ready.");
                this.ws.close();
            }

            // Core Branch D: [Failure Terminal] Security scan intercepts (virus detected) or transcodes completely crashes.
            else if (response.status === "AUDIT_FAILED") {
                this.progressBar.style.backgroundColor = "#f44336"; // 红色
                this.updateUI("99.0", `❌ Upload abort: ${response.reason}`);
                this.ws.close();
            }
        };

        this.ws.onclose = () => {
            console.log("WebSocket channel closed。");
        };
    }

    // 4. Read slice and fire
    sendNextChunk() {
        console.log(`sendNextChunk ${this.offset}/${this.file.size}`);
        // 157286400/22410018
        if (this.offset >= this.file.size) {
            // All chunks sent - notify server
            console.log("All slices have been sent, and the server is being notified that the upload is complete...");
            this.ws.send("UPLOAD_COMPLETE");
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
    updateUI(percent, text) {
        this.progressBar.style.width = percent + "%";
        this.progressBar.innerText = percent + "%";
        this.statusText.innerText = text;
    }
}

class HugeFileUploader_ResumeDownload_WIP {
    constructor(wsURI, file, userId) {
        this.wsURI = wsURI;
        this.file = file;
        this.userId = userId;
        this.CHUNK_SIZE = 5 * 1024 * 1024; // 1MB 每一块
        this.offset = 0;
        this.ws = null;

        // --- 高可用重连控制核心变量 ---
        this.maxReconnectAttempts = 5; // 最大重试次数
        this.reconnectAttempts = 0;    // 当前重试计数
        this.baseDelay = 1000;         // 基础等待时间：1秒 (1000毫秒)
        this.maxDelay = 16000;         // 最大等待上限：16秒

        // UI 节点
        this.progressBar = document.getElementById("progressBar");
        this.statusText = document.getElementById("statusText");
    }

    /**
     * 1. 预检请求：询问后端当前文件已经上传了多少字节（断点位置）
     */
    async checkBeforeUpload() {
        this.statusText.style.color = "#555";
        this.statusText.innerText = "正在向服务器同步断点历史...";

        try {
            // 生产环境中通过 fetch 访问 HTTP 路由，传入文件 MD5
            // const res = await fetch(`/api/v1/file/check?md5=${fileMd5}`);
            // const data = await res.json();

            // 模拟后端返回：假设网络中途断开时，后端已经安全落盘了 150MB
            const mockHttpResponse = {
                status: "PARTIAL",
                uploadedSize: this.reconnectAttempts > 0 ? this.offset : 157286400, // 150MB
                ticket: "t_high_availability_999"
            };

            // 精准将物理游标回退/对齐到后端的物理落盘位置
            this.offset = 0;//mockHttpResponse.uploadedSize;
            console.log("checkBeforeUpload: 服务器反馈已上传字节数:", this.offset);

            // 唤醒 WebSocket 连接
            this.startWebSocket(mockHttpResponse.ticket);

        } catch (error) {
            this.statusText.innerText = "预检接口请求失败，准备触发降级重试...";
            this.handleReconnect();
        }
    }

    /**
     * 2. 建立 WebSocket 传输通道
     */
    startWebSocket(ticket) {
        //this.ws = new WebSocket(`wss://://yourserver.com{ticket}`);
        const wsURI = this.wsURI;//CONFIG.WS_URL_LARGEFILEUPLOAD;
        console.log('LFU.Resolved wsURI for WS:', wsURI);
        const ott = getOTT(wsURI);
        console.log('LFU.Resolved OTT for WS:', ott);
        const url = getWsUrl(wsURI, ott);
        console.log('LFU.WebSocket URL:', url);
        this.ws = new WebSocket(url);

        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = () => {
            console.log("WebSocket 通道连接成功。");
            // 连接成功后，必须立即清空重连计数器，恢复健康状态
            this.reconnectAttempts = 0;

            this.statusText.style.color = "#4caf50";
            this.statusText.innerText = `通道已重连！正在从 ${(this.offset / 1024 / 1024).toFixed(1)}MB 处执行断点续传...`;

            // 恢复发送切片
            this.sendNextChunk();
        };

        // 核心 ACK 反压与多状态机监听
        this.ws.onmessage = (event) => {
            const response = JSON.parse(event.data);

            if (response.status === "PROGRESS") {
                let realPercent = (response.uploadedSize / this.file.size) * 100;
                let displayPercent = Math.min(realPercent, 99).toFixed(1);
                this.updateUI(displayPercent, `正在传输: ${(response.uploadedSize / 1024 / 1024).toFixed(1)}MB / ${(this.file.size / 1024 / 1024).toFixed(1)}MB`);

                // 只有后端安全写完磁盘，游标才推进，确保物理安全
                this.sendNextChunk();
            } else if (response.status === "COMPLETE") {
                this.statusText.style.color = "#ff9800";
                this.statusText.innerText = "⚡ 数据传输完毕，服务器正在后台执行杀毒与转码流水线...";
            } else if (response.status === "ALL_TASKS_COMPLETE") {
                this.progressBar.style.backgroundColor = "#4caf50";
                this.updateUI("100.0", "🎉 恭喜！断点续传及全链路异步转码任务完美完工！");
                this.ws.close();
            }
        };

        // 3. 【核心触发点】通道异常断开监听
        this.ws.onclose = (event) => {
            // 如果是正常业务完成触发的 close，不做任何处理
            if (this.offset >= this.file.size || event.code === 1000) return;

            console.warn(`[警告] WebSocket 意外断开，网络处于失联状态。code=${event.code}, reason=${event.reason}, offset=${this.offset}/${this.file.size}`);
            //this.handleReconnect();
        };
    }

    /**
     * 4. 核心高可用算法：带随机抖动的指数退避重试
     */
    handleReconnect() {
        console.log("handleReconnect: 当前重试次数:", this.reconnectAttempts);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.statusText.style.color = "#f44336";
            this.statusText.innerText = `❌ 遭遇持续的网络故障，已连续重试 ${this.maxReconnectAttempts} 次失败，请检查网络后手动刷新页面。`;
            return;
        }

        this.reconnectAttempts++;

        // 【指数退避核心公式】：Delay = min(BaseDelay * 2^(attempts-1), MaxDelay)
        let delay = this.baseDelay * Math.pow(2, this.reconnectAttempts - 1);
        delay = Math.min(delay, this.maxDelay);

        // 【引入随机抖动因子 (Full Jitter)】：防止客户端共振轰炸服务器
        // 实际延迟时间在 [0.5 * delay, 1.5 * delay] 之间浮动
        const jitter = (Math.random() - 0.5) * (delay * 0.5);
        const finalDelay = Math.round(delay + jitter);

        this.statusText.style.color = "#ff9800";
        this.statusText.innerText = `⚠️ 网络连接中断！正在激活断点续传技术... 第 [${this.reconnectAttempts}/${this.maxReconnectAttempts}] 次重连将在 ${(finalDelay / 1000).toFixed(1)} 秒后启动...`;

        // 延迟到期后，重新从第一步 HTTP 预检开始执行，重新对齐物理磁盘游标
        setTimeout(() => {
            this.checkBeforeUpload();
        }, finalDelay);
    }

    sendNextChunk1() {
        console.log(`准备发送下一块数据，当前游标位置: ${this.offset}/${this.file.size} 字节`);
        if (this.offset >= this.file.size) return;

        const slice = this.file.slice(this.offset, this.offset + this.CHUNK_SIZE);
        console.log(`切片大小: ${slice.size} 字节, 切片范围: [${this.offset}, ${this.offset + slice.size})`);
        const reader = new FileReader();

        reader.onload = (e) => {
            // 捕获可能由于 WebSocket 正在关闭中而引发的报错
            try {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(e.target.result);
                    this.offset += this.CHUNK_SIZE; // 前端逻辑游标预热
                }
            } catch (err) {
                console.error("切片发送遭遇管道死锁，等待自动触发 onclose 进行重连...");
            }
        };
        reader.readAsArrayBuffer(slice);
    }

    sendNextChunk() {
        console.log(`sendNextChunk ${this.offset}/${this.file.size}`);
        // 157286400/22410018
        if (this.offset >= this.file.size) {
            // All chunks sent - notify server
            console.log("所有切片已发送，正在通知服务器上传完成...");
            this.ws.send("UPLOAD_COMPLETE");
            return;
        }

        const slice = this.file.slice(this.offset, this.offset + this.CHUNK_SIZE);
        console.log(`切片大小: ${slice.size} 字节, 切片范围: [${this.offset}, ${this.offset + slice.size})`);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(e.target.result);
                    this.offset += this.CHUNK_SIZE;
                }
            } catch (err) {
                console.error("切片发送遭遇管道死锁，等待自动触发 onclose 进行重连...");
            }
        };
        reader.readAsArrayBuffer(slice);
    }

    updateUI(percent, text) {
        this.progressBar.style.width = percent + "%";
        this.progressBar.innerText = percent + "%";
        this.statusText.innerText = text;
    }
}

