const { generateModernPage } = require('../page-generator');
const DataProcessor = require('../../models/DataProcessor');

module.exports = (dependencies) => {
    const { apiClient } = dependencies;
    
    return async (req, res) => {
        const content = `
        <div class="tabs">
            <button class="tab active" onclick="openTab(event, 'logs')">📝 لاگ‌های سیستم</button>
            <button class="tab" onclick="openTab(event, 'debug')">🐛 دیباگ</button>
            <button class="tab" onclick="openTab(event, 'performance')">⚡ عملکرد</button>
            <button class="tab" onclick="openTab(event, 'config')">⚙️ تنظیمات</button>
        </div>

        <div id="logs" class="tab-content active">
            <div class="content-card">
                <h3>مشاهده لاگ‌های سیستم</h3>
                <div style="display: flex; gap: 10px; margin: 15px 0;">
                    <button class="btn" onclick="loadLogs('system')">لاگ سیستم</button>
                    <button class="btn" onclick="loadLogs('api')">لاگ API</button>
                    <button class="btn" onclick="loadLogs('error')">خطاها</button>
                    <button class="btn" onclick="clearLogs()">پاک کردن</button>
                </div>
                <div id="logContent" class="code-block" style="min-height: 300px;">
                    <div class="status-indicator">لاگ‌ها در اینجا نمایش داده می‌شوند</div>
                </div>
            </div>
        </div>

        <div id="debug" class="tab-content">
            <div class="content-card">
                <h3>تست و دیباگ API</h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0;">
                    <button class="btn" onclick="testAPI('health')">تست سلامت</button>
                    <button class="btn" onclick="testAPI('coins')">تست ارزها</button>
                    <button class="btn" onclick="testAPI('news')">تست اخبار</button>
                    <button class="btn" onclick="testAPI('markets')">تست بازار</button>
                    <button class="btn" onclick="testAllEndpoints()">تست کامل</button>
                </div>
                <div id="apiTestResult">
                    <div class="status-indicator">نتایج تست در اینجا نمایش داده می‌شود</div>
                </div>
            </div>
        </div>

        <div id="performance" class="tab-content">
            <div class="content-card">
                <h3>متریک‌های عملکرد</h3>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value" id="responseTime">-</div>
                        <div class="metric-label">میانگین پاسخ</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="requestCount">-</div>
                        <div class="metric-label">درخواست‌ها</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="errorRate">-</div>
                        <div class="metric-label">نرخ خطا</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="uptime">-</div>
                        <div class="metric-label">زمان فعالیت</div>
                    </div>
                </div>
                <button class="btn" onclick="loadPerformanceMetrics()">بروزرسانی متریک‌ها</button>
            </div>
        </div>

        <div id="config" class="tab-content">
            <div class="content-card">
                <h3>تنظیمات سیستم</h3>
                <div style="display: grid; gap: 15px; margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>بروزرسانی خودکار:</span>
                        <label class="switch">
                            <input type="checkbox" id="autoRefresh" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>نمایش نوتیفیکیشن:</span>
                        <label class="switch">
                            <input type="checkbox" id="showNotifications" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div>
                        <label>محدودیت داده‌ها:</label>
                        <select class="input-field" id="dataLimit">
                            <option value="50">50 آیتم</option>
                            <option value="100" selected>100 آیتم</option>
                            <option value="200">200 آیتم</option>
                            <option value="300">300 آیتم</option>
                        </select>
                    </div>
                    <button class="btn" onclick="saveSettings()">ذخیره تنظیمات</button>
                </div>
            </div>
        </div>

        <style>
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: #13BCFF;
        }

        input:checked + .slider:before {
            transform: translateX(26px);
        }
        </style>

        <script>
        async function loadLogs(logType = 'system') {
            setLoading('logContent', true);
            
            try {
                const response = await fetch('/api/system/logs?type=' + logType);
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                
                if (data.success && data.data) {
                    displayLogs(data.data, logType);
                } else {
                    throw new Error(data.error || 'خطا در دریافت لاگ‌ها');
                }
            } catch (error) {
                handleApiError(error, 'logContent');
            } finally {
                setLoading('logContent', false);
            }
        }

        function displayLogs(logs, logType) {
            if (!logs || logs.length === 0) {
                document.getElementById('logContent').innerHTML = 
                    '<div class="status-indicator warning">هیچ لاگی یافت نشد</div>';
                return;
            }

            let html = '<div style="font-family: monospace; font-size: 0.8rem;">';
            
            logs.forEach(log => {
                const logClass = log.level === 'error' ? 'error' : 
                               log.level === 'warn' ? 'warning' : 
                               log.level === 'info' ? 'success' : '';
                
                html += \`
                    <div class="log-entry \${logClass}">
                        [\${new Date(log.timestamp).toLocaleString('fa-IR')}] 
                        <strong>\${log.level?.toUpperCase() || 'INFO'}:</strong>
                        \${log.message}
                        \${log.service ? \`<span style="opacity: 0.6;">(\${log.service})</span>\` : ''}
                    </div>
                \`;
            });

            html += '</div>';
            document.getElementById('logContent').innerHTML = html;
        }

        async function testAPI(endpoint) {
            setLoading('apiTestResult', true);
            
            try {
                const testEndpoints = {
                    'health': '/api/health',
                    'coins': '/api/coins?limit=5',
                    'news': '/api/news?limit=3',
                    'markets': '/api/markets/summary'
                };

                const url = testEndpoints[endpoint] || '/api/health';
                const startTime = Date.now();
                
                const response = await fetch(url);
                const endTime = Date.now();
                const responseTime = endTime - startTime;

                const data = await response.json();
                
                const status = response.ok && data.success ? 'success' : 'error';
                const statusText = status === 'success' ? '✅ موفق' : '❌ خطا';

                const resultHTML = \`
                    <div class="log-entry \${status}">
                        <strong>\${endpoint.toUpperCase()}:</strong> 
                        \${statusText} - 
                        زمان پاسخ: \${responseTime}ms - 
                        وضعیت: \${response.status}
                        \${data.error ? \` - خطا: \${data.error}\` : ''}
                    </div>
                \`;

                document.getElementById('apiTestResult').innerHTML = resultHTML;
                
            } catch (error) {
                handleApiError(error, 'apiTestResult');
            } finally {
                setLoading('apiTestResult', false);
            }
        }

        async function testAllEndpoints() {
            setLoading('apiTestResult', true);
            document.getElementById('apiTestResult').innerHTML = '<div class="status-indicator">در حال تست تمام endpointها...</div>';
            
            try {
                const endpoints = ['health', 'coins', 'news', 'markets'];
                let results = [];
                let successCount = 0;

                for (const endpoint of endpoints) {
                    const startTime = Date.now();
                    try {
                        const response = await fetch(\`/api/\${endpoint === 'coins' ? 'coins?limit=5' : endpoint}\`);
                        const endTime = Date.now();
                        const responseTime = endTime - startTime;
                        
                        const data = await response.json();
                        const success = response.ok && data.success;
                        
                        if (success) successCount++;
                        
                        results.push({
                            endpoint,
                            success,
                            responseTime,
                            status: response.status
                        });
                    } catch (error) {
                        results.push({
                            endpoint,
                            success: false,
                            responseTime: 0,
                            status: 'ERROR'
                        });
                    }
                }

                let html = \`
                    <div class="status-indicator \${successCount === endpoints.length ? '' : 'warning'}">
                        تست کامل: \${successCount} از \${endpoints.length} موفق
                    </div>
                \`;

                results.forEach(result => {
                    html += \`
                        <div class="log-entry \${result.success ? 'success' : 'error'}">
                            <strong>\${result.endpoint.toUpperCase()}:</strong>
                            \${result.success ? '✅' : '❌'} - 
                            \${result.responseTime}ms - 
                            وضعیت: \${result.status}
                        </div>
                    \`;
                });

                document.getElementById('apiTestResult').innerHTML = html;
                
            } catch (error) {
                handleApiError(error, 'apiTestResult');
            } finally {
                setLoading('apiTestResult', false);
            }
        }

        async function loadPerformanceMetrics() {
            try {
                const response = await fetch('/api/system/stats');
                if (!response.ok) throw new Error('خطای شبکه');

                const data = await response.json();
                
                if (data.success && data.data) {
                    const stats = data.data.performance || data.data;
                    
                    document.getElementById('responseTime').textContent = 
                        stats.averageDuration || stats.avgResponseTime || 'N/A';
                    document.getElementById('requestCount').textContent = 
                        stats.totalRequests || '0';
                    document.getElementById('errorRate').textContent = 
                        stats.errorRate || ((stats.errorCount / stats.totalRequests) * 100).toFixed(1) + '%' || '0%';
                    document.getElementById('uptime').textContent = 
                        stats.uptime ? formatUptime(stats.uptime) : 'N/A';
                }
            } catch (error) {
                console.error('Error loading performance metrics:', error);
            }
        }

        function saveSettings() {
            const autoRefresh = document.getElementById('autoRefresh').checked;
            const showNotifications = document.getElementById('showNotifications').checked;
            const dataLimit = document.getElementById('dataLimit').value;

            // ذخیره در localStorage
            localStorage.setItem('vortexSettings', JSON.stringify({
                autoRefresh,
                showNotifications,
                dataLimit
            }));

            document.getElementById('apiTestResult').innerHTML = 
                '<div class="status-indicator success">✅ تنظیمات با موفقیت ذخیره شد</div>';
        }

        function loadSettings() {
            const saved = localStorage.getItem('vortexSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                document.getElementById('autoRefresh').checked = settings.autoRefresh;
                document.getElementById('showNotifications').checked = settings.showNotifications;
                document.getElementById('dataLimit').value = settings.dataLimit;
            }
        }

        async function clearLogs() {
            if (confirm('آیا از پاک کردن تمام لاگ‌ها اطمینان دارید؟')) {
                try {
                    const response = await fetch('/api/system/logs', { method: 'DELETE' });
                    if (response.ok) {
                        document.getElementById('logContent').innerHTML = 
                            '<div class="status-indicator success">✅ لاگ‌ها با موفقیت پاک شدند</div>';
                    }
                } catch (error) {
                    handleApiError(error, 'logContent');
                }
            }
        }

        // بارگذاری اولیه
        document.addEventListener('DOMContentLoaded', function() {
            loadSettings();
            loadPerformanceMetrics();
            loadLogs('system');
        });
        </script>`;

        res.send(generateModernPage("تنظیمات و دیباگ", content, 'settings'));
    };
};
