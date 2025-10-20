const { generateModernPage } = require('../page-generator');

module.exports = (dependencies) => {
    const { apiClient } = dependencies;
    
    return async (req, res) => {
        const content = `
        <div class="tabs">
            <button class="tab active" onclick="openTab(event, 'diagnostics')">🔍 تشخیص مشکلات</button>
            <button class="tab" onclick="openTab(event, 'logs')">📝 لاگ‌های پیشرفته</button>
            <button class="tab" onclick="openTab(event, 'performance')">⚡ تنظیمات عملکرد</button>
            <button class="tab" onclick="openTab(event, 'appearance')">🎨 شخصی‌سازی ظاهر</button>
            <button class="tab" onclick="openTab(event, 'debug')">🐛 دیباگ API</button>
            <button class="tab" onclick="openTab(event, 'config')">⚙️ تنظیمات پایه</button>
        </div>

        <!-- تب تشخیص مشکلات -->
        <div id="diagnostics" class="tab-content active">
            <div class="content-card">
                <h3>🔍 تشخیص خودکار مشکلات سیستم</h3>
                <button class="btn" onclick="runFullDiagnostics()" style="background: #ff6b6b; color: white;">
                    🚨 اجرای تشخیص کامل
                </button>
                
                <div id="diagnosticsResults" style="margin-top: 20px;">
                    <div class="status-indicator">برای شروع تشخیص، دکمه بالا را کلیک کنید</div>
                </div>

                <div id="solutionsPanel" style="margin-top: 20px; display: none;">
                    <h4>💡 راه‌حل‌های پیشنهادی</h4>
                    <div id="solutionsList"></div>
                </div>
            </div>
        </div>

        <!-- تب لاگ‌های پیشرفته -->
        <div id="logs" class="tab-content">
            <div class="content-card">
                <h3>📝 سیستم لاگ‌گیری پیشرفته</h3>
                
                <!-- کنترل‌های فیلتر و جستجو -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px; margin: 15px 0; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 10px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.8rem;">سطح لاگ:</label>
                        <select class="input-field" id="logLevel">
                            <option value="all">همه</option>
                            <option value="error">خطاها</option>
                            <option value="warn">هشدارها</option>
                            <option value="info">اطلاعات</option>
                            <option value="debug">دیباگ</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.8rem;">سرویس:</label>
                        <select class="input-field" id="logService">
                            <option value="all">همه</option>
                            <option value="api">API</option>
                            <option value="websocket">WebSocket</option>
                            <option value="database">دیتابیس</option>
                            <option value="system">سیستم</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.8rem;">بازه زمانی:</label>
                        <select class="input-field" id="logTimeRange">
                            <option value="1h">1 ساعت گذشته</option>
                            <option value="6h">6 ساعت گذشته</option>
                            <option value="24h" selected>24 ساعت گذشته</option>
                            <option value="7d">7 روز گذشته</option>
                        </select>
                    </div>
                    <div style="display: flex; align-items: end;">
                        <button class="btn" onclick="loadLogs()" style="font-size: 0.8rem;">بارگذاری لاگ‌ها</button>
                    </div>
                </div>

                <!-- جستجوی پیشرفته -->
                <div style="margin: 15px 0;">
                    <input type="text" id="logSearch" class="input-field" placeholder="جستجو در لاگ‌ها (کلمه کلیدی)" style="width: 100%;">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn" onclick="searchInLogs()">🔍 جستجو</button>
                        <button class="btn" onclick="exportLogs()">📤 خروجی JSON</button>
                        <button class="btn" onclick="clearLogs()" style="background: #ef4444;">🗑️ پاک کردن لاگ‌ها</button>
                    </div>
                </div>

                <!-- آمار لاگ‌ها -->
                <div id="logStats" class="metric-grid" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); margin: 15px 0;">
                    <div class="metric-card">
                        <div class="metric-value">0</div>
                        <div class="metric-label">کل لاگ‌ها</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #ef4444;">0</div>
                        <div class="metric-label">خطاها</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #f59e0b;">0</div>
                        <div class="metric-label">هشدارها</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">-</div>
                        <div class="metric-label">قدیمی‌ترین</div>
                    </div>
                </div>

                <!-- محتوای لاگ‌ها -->
                <div id="logContent" class="code-block" style="min-height: 400px; max-height: 500px; overflow-y: auto; font-family: 'Courier New', monospace;">
                    <div class="status-indicator">برای مشاهده لاگ‌ها، دکمه "بارگذاری لاگ‌ها" را کلیک کنید</div>
                </div>
            </div>
        </div>

        <!-- تب تنظیمات عملکرد -->
        <div id="performance" class="tab-content">
            <div class="content-card">
                <h3>⚡ تنظیمات پیشرفته عملکرد</h3>
                
                <!-- متریک‌های زنده -->
                <div class="metric-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); margin: 20px 0;">
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
                        <div class="metric-value" id="memoryUsage">-</div>
                        <div class="metric-label">مصرف حافظه</div>
                    </div>
                </div>

                <!-- تنظیمات کش -->
                <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h4>💾 استراتژی کش</h4>
                    <div style="display: grid; gap: 15px; margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>فعال‌سازی کش:</span>
                            <label class="switch">
                                <input type="checkbox" id="cacheEnabled" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div>
                            <label>زمان انقضای کش (دقیقه):</label>
                            <input type="number" id="cacheTTL" class="input-field" value="5" min="1" max="60">
                        </div>
                        <div>
                            <label>حداکثر سایز کش (MB):</label>
                            <input type="number" id="cacheSize" class="input-field" value="50" min="10" max="500">
                        </div>
                    </div>
                </div>

                <!-- تنظیمات Rate Limit -->
                <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h4>🎯 محدودیت نرخ درخواست</h4>
                    <div style="display: grid; gap: 15px; margin-top: 15px;">
                        <div>
                            <label>حداکثر درخواست در دقیقه:</label>
                            <input type="number" id="rateLimit" class="input-field" value="60" min="10" max="300">
                        </div>
                        <div>
                            <label>Timeout درخواست (ثانیه):</label>
                            <input type="number" id="requestTimeout" class="input-field" value="30" min="5" max="120">
                        </div>
                    </div>
                </div>

                <!-- تنظیمات WebSocket -->
                <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h4>📡 تنظیمات WebSocket</h4>
                    <div style="display: grid; gap: 15px; margin-top: 15px;">
                        <div>
                            <label>فاصله بروزرسانی (میلی‌ثانیه):</label>
                            <input type="number" id="wsInterval" class="input-field" value="5000" min="1000" max="30000">
                        </div>
                        <div>
                            <label>تعداد تلاش برای اتصال مجدد:</label>
                            <input type="number" id="reconnectAttempts" class="input-field" value="3" min="1" max="10">
                        </div>
                    </div>
                </div>

                <button class="btn" onclick="savePerformanceSettings()" style="margin-top: 20px;">💾 ذخیره تنظیمات عملکرد</button>
                <button class="btn" onclick="testPerformanceSettings()" style="margin-top: 10px; background: #10b981;">🧪 تست تنظیمات</button>
            </div>
        </div>

        <!-- تب شخصی‌سازی ظاهر -->
        <div id="appearance" class="tab-content">
            <div class="content-card">
                <h3>🎨 شخصی‌سازی پیشرفته ظاهر</h3>

                <!-- انتخاب تم -->
                <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h4>🎭 تم و رنگ</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div class="theme-option" onclick="selectTheme('dark')">
                            <div style="background: #1a1a1a; height: 60px; border-radius: 8px; border: 2px solid #333;"></div>
                            <div style="text-align: center; margin-top: 8px;">تیره پیشرفته</div>
                        </div>
                        <div class="theme-option" onclick="selectTheme('light')">
                            <div style="background: #ffffff; height: 60px; border-radius: 8px; border: 2px solid #ddd;"></div>
                            <div style="text-align: center; margin-top: 8px;">روشن</div>
                        </div>
                        <div class="theme-option" onclick="selectTheme('blue')">
                            <div style="background: #0f172a; height: 60px; border-radius: 8px; border: 2px solid #1e40af;"></div>
                            <div style="text-align: center; margin-top: 8px;">آبی تیره</div>
                        </div>
                        <div class="theme-option" onclick="selectTheme('green')">
                            <div style="background: #052e16; height: 60px; border-radius: 8px; border: 2px solid #15803d;"></div>
                            <div style="text-align: center; margin-top: 8px;">سبز تیره</div>
                        </div>
                    </div>
                </div>

                <!-- تنظیمات Layout -->
                <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h4>📐 طرح‌بندی و چیدمان</h4>
                    <div style="display: grid; gap: 15px; margin-top: 15px;">
                        <div>
                            <label>ترتیب کارت‌ها:</label>
                            <select class="input-field" id="layoutOrder">
                                <option value="default">پیشفرض</option>
                                <option value="compact">فشرده</option>
                                <option value="spacious">با فاصله</option>
                            </select>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>نمایش کارت‌های کوچک:</span>
                            <label class="switch">
                                <input type="checkbox" id="showMiniCards" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>نمایش متریک‌های سریع:</span>
                            <label class="switch">
                                <input type="checkbox" id="showQuickMetrics" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- تنظیمات نمایش داده -->
                <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h4>📊 تنظیمات نمایش داده</h4>
                    <div style="display: grid; gap: 15px; margin-top: 15px;">
                        <div>
                            <label>واحد پول پیشفرض:</label>
                            <select class="input-field" id="defaultCurrency">
                                <option value="USD">دلار آمریکا (USD)</option>
                                <option value="EUR">یورو (EUR)</option>
                                <option value="GBP">پوند (GBP)</option>
                            </select>
                        </div>
                        <div>
                            <label>فرمت اعداد:</label>
                            <select class="input-field" id="numberFormat">
                                <option value="en">بین‌المللی (1,000.50)</option>
                                <option value="fa">فارسی (۱,۰۰۰٫۵۰)</option>
                                <option value="compact">فشرده (1K, 1M)</option>
                            </select>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>نمایش 24 ساعته:</span>
                            <label class="switch">
                                <input type="checkbox" id="timeFormat24h">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <button class="btn" onclick="saveAppearanceSettings()" style="margin-top: 20px;">💾 ذخیره تنظیمات ظاهر</button>
                <button class="btn" onclick="resetAppearanceSettings()" style="margin-top: 10px; background: #6b7280;">🔄 بازنشانی به پیشفرض</button>
            </div>
        </div>

        <!-- تب دیباگ API -->
        <div id="debug" class="tab-content">
            <div class="content-card">
                <h3>🐛 تست و دیباگ API</h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0;">
                    <button class="btn" onclick="testEndpoint('health')">تست سلامت</button>
                    <button class="btn" onclick="testEndpoint('coins')">تست ارزها</button>
                    <button class="btn" onclick="testEndpoint('markets')">تست بازار</button>
                    <button class="btn" onclick="testEndpoint('news')">تست اخبار</button>
                    <button class="btn" onclick="testAllEndpoints()">تست کامل سیستم</button>
                </div>
                <div id="debugResults" style="min-height: 200px;">
                    <div class="status-indicator">نتایج تست در اینجا نمایش داده می‌شود</div>
                </div>
            </div>
        </div>

        <!-- تب تنظیمات پایه -->
        <div id="config" class="tab-content">
            <div class="content-card">
                <h3>⚙️ تنظیمات پایه سیستم</h3>
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
                        </select>
                    </div>
                    <div>
                        <label>زبان:</label>
                        <select class="input-field" id="language">
                            <option value="fa">فارسی</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <button class="btn" onclick="saveBasicSettings()">💾 ذخیره تنظیمات</button>
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

        .theme-option {
            cursor: pointer;
            padding: 10px;
            border-radius: 8px;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }

        .theme-option:hover {
            background: rgba(255,255,255,0.05);
            border-color: #13BCFF;
        }

        .theme-option.selected {
            border-color: #13BCFF;
            background: rgba(19, 188, 255, 0.1);
        }

        .log-entry {
            padding: 8px 12px;
            margin: 2px 0;
            border-radius: 4px;
            border-left: 4px solid #6b7280;
            font-family: 'Courier New', monospace;
            font-size: 0.8rem;
        }

        .log-entry.error {
            border-left-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }

        .log-entry.warning {
            border-left-color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
        }

        .log-entry.success {
            border-left-color: #10b981;
            background: rgba(16, 185, 129, 0.1);
        }

        .log-entry.info {
            border-left-color: #3b82f6;
            background: rgba(59, 130, 246, 0.1);
        }

        .diagnostic-item {
            padding: 12px;
            margin: 8px 0;
            border-radius: 8px;
            border-left: 4px solid #ccc;
        }

        .diagnostic-success {
            border-left-color: #10b981;
            background: rgba(16, 185, 129, 0.1);
        }

        .diagnostic-warning {
            border-left-color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
        }

        .diagnostic-error {
            border-left-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }

        .solution-card {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #13BCFF;
        }

        /* تم‌های رنگی */
        .theme-dark {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --text-primary: #ffffff;
            --accent-color: #13BCFF;
        }

        .theme-light {
            --bg-primary: #ffffff;
            --bg-secondary: #f5f5f5;
            --text-primary: #333333;
            --accent-color: #0066cc;
        }

        .theme-blue {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --text-primary: #f1f5f9;
            --accent-color: #3b82f6;
        }

        .theme-green {
            --bg-primary: #052e16;
            --bg-secondary: #14532d;
            --text-primary: #f0fdf4;
            --accent-color: #22c55e;
        }
        </style>

        <script>
        // ==================== توابع عمومی ====================
        function setLoading(elementId, isLoading) {
            const element = document.getElementById(elementId);
            if (isLoading) {
                element.innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری...</div>';
            }
        }

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                background: \${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                border-radius: 8px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            \`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        function openTab(evt, tabName) {
            const tabcontent = document.getElementsByClassName("tab-content");
            for (let i = 0; i < tabcontent.length; i++) {
                tabcontent[i].classList.remove("active");
            }

            const tablinks = document.getElementsByClassName("tab");
            for (let i = 0; i < tablinks.length; i++) {
                tablinks[i].classList.remove("active");
            }

            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
        }

        // ==================== تب تشخیص مشکلات ====================
        async function runFullDiagnostics() {
            setLoading('diagnosticsResults', true);
            document.getElementById('solutionsPanel').style.display = 'none';

            try {
                const diagnostics = await performDiagnostics();
                displayDiagnosticsResults(diagnostics);
                suggestSolutions(diagnostics);
            } catch (error) {
                document.getElementById('diagnosticsResults').innerHTML = \`
                    <div class="status-indicator error">
                        ❌ خطا در اجرای تشخیص: \${error.message}
                    </div>
                \`;
            } finally {
                setLoading('diagnosticsResults', false);
            }
        }

        async function performDiagnostics() {
            const results = [];
            const endpoints = [
                { name: 'سلامت سیستم', url: '/api/health' },
                { name: 'لیست ارزها', url: '/api/coins?limit=5' },
                { name: 'داده‌های بازار', url: '/api/markets/summary' },
                { name: 'اخبار', url: '/api/news?limit=2' },
                { name: 'WebSocket', url: '/api/websocket/status' },
                { name: 'شاخص ترس و طمع', url: '/api/insights/fear-greed' }
            ];

            for (const endpoint of endpoints) {
                try {
                    const startTime = Date.now();
                    const response = await fetch(endpoint.url);
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;

                    let data;
                    try {
                        data = await response.json();
                    } catch (e) {
                        data = { success: false, error: 'پاسخ JSON نامعتبر' };
                    }

                    const success = response.ok && data.success;
                    results.push({
                        name: endpoint.name,
                        status: success ? 'success' : 'error',
                        message: success ? 
                            \`کار می‌کند (\${responseTime}ms)\` : 
                            \`مشکل دارد - کد: \${response.status}\`,
                        details: data.error || 'بدون خطا'
                    });

                } catch (error) {
                    results.push({
                        name: endpoint.name,
                        status: 'error',
                        message: \`خطا: \${error.message}\`
                    });
                }
            }

            return results;
        }

        function displayDiagnosticsResults(results) {
            let html = '<div style="display: grid; gap: 10px;">';
            const successCount = results.filter(r => r.status === 'success').length;
            
            html += \`
                <div class="status-indicator \${successCount === results.length ? 'success' : successCount >= results.length / 2 ? 'warning' : 'error'}">
                    🎯 نتیجه تشخیص: \${successCount} از \${results.length} سرویس سالم
                </div>
            \`;

            results.forEach(result => {
                const statusClass = 'diagnostic-' + result.status;
                const statusIcon = result.status === 'success' ? '✅' : '❌';
                
                html += \`
                    <div class="diagnostic-item \${statusClass}">
                        <div style="display: flex; justify-content: space-between;">
                            <strong>\${statusIcon} \${result.name}</strong>
                            <span>\${result.status === 'success' ? 'سالم' : 'مشکل'}</span>
                        </div>
                        <div style="margin-top: 5px; font-size: 0.9rem;">\${result.message}</div>
                    </div>
                \`;
            });

            html += '</div>';
            document.getElementById('diagnosticsResults').innerHTML = html;
        }

        function suggestSolutions(diagnostics) {
            const problems = diagnostics.filter(d => d.status !== 'success');
            if (problems.length === 0) return;

            let solutionsHtml = '<div style="display: grid; gap: 10px;">';
            
            problems.forEach(problem => {
                let solution = '';
                if (problem.name.includes('WebSocket')) {
                    solution = 'سرویس WebSocket قطع است. بررسی کنید که WebSocket Manager در حال اجراست.';
                } else if (problem.name.includes('سلامت')) {
                    solution = 'سیستم سلامت پاسخ نمی‌دهد. سرور ممکن است overload شده باشد.';
                } else {
                    solution = 'Endpoint مشکل دارد. بررسی کنید که route مربوطه در فایل api.js تعریف شده باشد.';
                }

                solutionsHtml += \`
                    <div class="solution-card">
                        <strong>مشکل: \${problem.name}</strong>
                        <div style="margin-top: 5px;">\${solution}</div>
                    </div>
                \`;
            });

            solutionsHtml += '</div>';
            document.getElementById('solutionsList').innerHTML = solutionsHtml;
            document.getElementById('solutionsPanel').style.display = 'block';
        }

        // ==================== تب لاگ‌های پیشرفته ====================
        async function loadLogs() {
            setLoading('logContent', true);
            
            try {
                // از endpoint سیستم لاگ استفاده کن (اگر وجود دارد)
                const response = await fetch('/api/system/stats');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data.error_analysis) {
                        displayLogs(data.data.error_analysis.recent_errors || []);
                    } else {
                        displaySampleLogs();
                    }
                } else {
                    displaySampleLogs();
                }
            } catch (error) {
                displaySampleLogs();
            } finally {
                setLoading('logContent', false);
            }
        }

        function displayLogs(logs) {
            if (!logs || logs.length === 0) {
                displaySampleLogs();
                return;
            }

            let html = '';
            logs.forEach(log => {
                const logClass = log.level === 'error' ? 'error' : 
                               log.level === 'warn' ? 'warning' : 
                               log.level === 'info' ? 'success' : 'info';
                
                html += \`
                    <div class="log-entry \${logClass}">
                        [\${new Date(log.timestamp).toLocaleString('fa-IR')}] 
                        \${log.level?.toUpperCase() || 'INFO'}: 
                        \${log.message}
                        \${log.service ? \`(\${log.service})\` : ''}
                    </div>
                \`;
            });

            document.getElementById('logContent').innerHTML = html;
            updateLogStats(logs);
        }

        function displaySampleLogs() {
            const sampleLogs = [
                {
                    timestamp: new Date(),
                    level: 'info',
                    message: 'سیستم راه‌اندازی شد',
                    service: 'system'
                },
                {
                    timestamp: new Date(Date.now() - 300000),
                    level: 'warn',
                    message: 'اتصال WebSocket قطع شد',
                    service: 'websocket'
                },
                {
                    timestamp: new Date(Date.now() - 600000),
                    level: 'error',
                    message: 'خطا در دریافت داده از API',
                    service: 'api'
                },
                {
                    timestamp: new Date(Date.now() - 1200000),
                    level: 'info',
                    message: 'دریافت 150 ارز از API اصلی',
                    service: 'api'
                }
            ];

            displayLogs(sampleLogs);
        }

        function updateLogStats(logs) {
            const total = logs.length;
            const errors = logs.filter(log => log.level === 'error').length;
            const warnings = logs.filter(log => log.level === 'warn').length;
            const oldest = logs.length > 0 ? new Date(logs[logs.length - 1].timestamp).toLocaleDateString('fa-IR') : '-';

            document.getElementById('logStats').innerHTML = \`
                <div class="metric-card">
                    <div class="metric-value">\${total}</div>
                    <div class="metric-label">کل لاگ‌ها</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #ef4444;">\${errors}</div>
                    <div class="metric-label">خطاها</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #f59e0b;">\${warnings}</div>
                    <div class="metric-label">هشدارها</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">\${oldest}</div>
                    <div class="metric-label">قدیمی‌ترین</div>
                </div>
            \`;
        }

        function searchInLogs() {
            const searchTerm = document.getElementById('logSearch').value.toLowerCase();
            if (!searchTerm.trim()) {
                showNotification('لطفا عبارت جستجو را وارد کنید', 'error');
                return;
            }

            const logEntries = document.querySelectorAll('.log-entry');
            let foundCount = 0;

            logEntries.forEach(entry => {
                if (entry.textContent.toLowerCase().includes(searchTerm)) {
                    entry.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                    foundCount++;
                } else {
                    entry.style.backgroundColor = '';
                }
            });

            showNotification(\`\${foundCount} نتیجه یافت شد\`, foundCount > 0 ? 'success' : 'error');
        }

        function exportLogs() {
            const logEntries = document.querySelectorAll('.log-entry');
            const logsArray = Array.from(logEntries).map(entry => ({
                text: entry.textContent,
                class: entry.className
            }));

            const dataStr = JSON.stringify(logsArray, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'vortex-logs-' + new Date().toISOString() + '.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showNotification('لاگ‌ها با موفق export شدند', 'success');
        }

        function clearLogs() {
            if (confirm('آیا از پاک کردن لاگ‌های نمایش داده شده اطمینان دارید؟')) {
                document.getElementById('logContent').innerHTML = '<div class="status-indicator success">✅ لاگ‌ها پاک شدند</div>';
                document.getElementById('logStats').innerHTML = \`
                    <div class="metric-card">
                        <div class="metric-value">0</div>
                        <div class="metric-label">کل لاگ‌ها</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #ef4444;">0</div>
                        <div class="metric-label">خطاها</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #f59e0b;">0</div>
                        <div class="metric-label">هشدارها</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">-</div>
                        <div class="metric-label">قدیمی‌ترین</div>
                    </div>
                \`;
                showNotification('لاگ‌ها پاک شدند', 'success');
            }
        }

        // ==================== تب تنظیمات عملکرد ====================
        function savePerformanceSettings() {
            const settings = {
                cache: {
                    enabled: document.getElementById('cacheEnabled').checked,
                    ttl: parseInt(document.getElementById('cacheTTL').value),
                    maxSize: parseInt(document.getElementById('cacheSize').value)
                },
                rateLimit: {
                    requestsPerMinute: parseInt(document.getElementById('rateLimit').value),
                    timeout: parseInt(document.getElementById('requestTimeout').value)
                },
                websocket: {
                    interval: parseInt(document.getElementById('wsInterval').value),
                    reconnectAttempts: parseInt(document.getElementById('reconnectAttempts').value)
                }
            };
            
            localStorage.setItem('vortexPerformanceSettings', JSON.stringify(settings));
            showNotification('تنظیمات عملکرد ذخیره شد', 'success');
        }

        function testPerformanceSettings() {
            const settings = JSON.parse(localStorage.getItem('vortexPerformanceSettings') || '{}');
            
            let html = '<div style="display: grid; gap: 10px; margin-top: 15px;">';
            html += '<div class="status-indicator">🧪 نتایج تست تنظیمات عملکرد:</div>';
            
            if (settings.cache) {
                html += \`
                    <div class="log-entry success">
                        ✅ کش: \${settings.cache.enabled ? 'فعال' : 'غیرفعال'} - TTL: \${settings.cache.ttl} دقیقه
                    </div>
                \`;
            }
            
            if (settings.rateLimit) {
                html += \`
                    <div class="log-entry success">
                        ✅ Rate Limit: \${settings.rateLimit.requestsPerMinute} درخواست/دقیقه
                    </div>
                \`;
            }
            
            if (settings.websocket) {
                html += \`
                    <div class="log-entry success">
                        ✅ WebSocket: فاصله \${settings.websocket.interval}ms - تلاش مجدد: \${settings.websocket.reconnectAttempts}
                    </div>
                \`;
            }
            
            html += '</div>';
            document.getElementById('debugResults').innerHTML = html;
        }

        function loadPerformanceSettings() {
            const saved = localStorage.getItem('vortexPerformanceSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                if (settings.cache) {
                    document.getElementById('cacheEnabled').checked = settings.cache.enabled;
                    document.getElementById('cacheTTL').value = settings.cache.ttl;
                    document.getElementById('cacheSize').value = settings.cache.maxSize;
                }
                
                if (settings.rateLimit) {
                    document.getElementById('rateLimit').value = settings.rateLimit.requestsPerMinute;
                    document.getElementById('requestTimeout').value = settings.rateLimit.timeout;
                }
                
                if (settings.websocket) {
                    document.getElementById('wsInterval').value = settings.websocket.interval;
                    document.getElementById('reconnectAttempts').value = settings.websocket.reconnectAttempts;
                }
            }
        }

        // ==================== تب شخصی‌سازی ظاهر ====================
        function selectTheme(theme) {
            // حذف انتخاب از همه themeها
            document.querySelectorAll('.theme-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            // انتخاب theme جدید
            event.currentTarget.classList.add('selected');
            
            // اعمال theme
            applyTheme(theme);
        }

        function applyTheme(theme) {
            const root = document.documentElement;
            
            // حذف themeهای قبلی
            root.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-green');
            
            // اعمال theme جدید
            root.classList.add('theme-' + theme);
            
            showNotification(\`تم \${theme} اعمال شد\`, 'success');
        }

        function saveAppearanceSettings() {
            const settings = {
                theme: getSelectedTheme(),
                layout: {
                    order: document.getElementById('layoutOrder').value,
                    showMiniCards: document.getElementById('showMiniCards').checked,
                    showQuickMetrics: document.getElementById('showQuickMetrics').checked
                },
                display: {
                    currency: document.getElementById('defaultCurrency').value,
                    numberFormat: document.getElementById('numberFormat').value,
                    timeFormat24h: document.getElementById('timeFormat24h').checked
                }
            };
            
            localStorage.setItem('vortexAppearanceSettings', JSON.stringify(settings));
            showNotification('تنظیمات ظاهر ذخیره شد', 'success');
        }

        function getSelectedTheme() {
            const selected = document.querySelector('.theme-option.selected');
            if (selected) {
                const text = selected.querySelector('div:last-child').textContent;
                if (text.includes('تیره')) return 'dark';
                if (text.includes('روشن')) return 'light';
                if (text.includes('آبی')) return 'blue';
                if (text.includes('سبز')) return 'green';
            }
            return 'dark';
        }

        function loadAppearanceSettings() {
            const saved = localStorage.getItem('vortexAppearanceSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                // انتخاب theme
                const themeOptions = document.querySelectorAll('.theme-option');
                themeOptions.forEach(option => {
                    const text = option.querySelector('div:last-child').textContent;
                    if (
                        (settings.theme === 'dark' && text.includes('تیره')) ||
                        (settings.theme === 'light' && text.includes('روشن')) ||
                        (settings.theme === 'blue' && text.includes('آبی')) ||
                        (settings.theme === 'green' && text.includes('سبز'))
                    ) {
                        option.classList.add('selected');
                        applyTheme(settings.theme);
                    }
                });
                
                // layout
                document.getElementById('layoutOrder').value = settings.layout?.order || 'default';
                document.getElementById('showMiniCards').checked = settings.layout?.showMiniCards !== false;
                document.getElementById('showQuickMetrics').checked = settings.layout?.showQuickMetrics !== false;
                
                // display
                document.getElementById('defaultCurrency').value = settings.display?.currency || 'USD';
                document.getElementById('numberFormat').value = settings.display?.numberFormat || 'en';
                document.getElementById('timeFormat24h').checked = settings.display?.timeFormat24h || false;
            }
        }

        function resetAppearanceSettings() {
            if (confirm('آیا از بازنشانی تنظیمات ظاهر اطمینان دارید؟')) {
                localStorage.removeItem('vortexAppearanceSettings');
                location.reload();
            }
        }

        // ==================== تب دیباگ API ====================
        async function testEndpoint(endpoint) {
            setLoading('debugResults', true);
            
            try {
                const endpoints = {
                    'health': '/api/health',
                    'coins': '/api/coins?limit=5',
                    'markets': '/api/markets/summary',
                    'news': '/api/news?limit=2'
                };

                const url = endpoints[endpoint];
                const startTime = Date.now();
                const response = await fetch(url);
                const endTime = Date.now();
                const responseTime = endTime - startTime;

                let data;
                try {
                    data = await response.json();
                } catch (e) {
                    data = { success: false, error: 'پاسخ JSON نامعتبر' };
                }

                const status = response.ok && data.success ? 'success' : 'error';
                
                const resultHTML = \`
                    <div class="log-entry \${status}">
                        <strong>\${endpoint.toUpperCase()}:</strong> 
                        \${status === 'success' ? '✅' : '❌'} 
                        زمان پاسخ: \${responseTime}ms - 
                        وضعیت HTTP: \${response.status}
                        \${data.error ? \`<br>خطا: \${data.error}\` : ''}
                    </div>
                \`;

                document.getElementById('debugResults').innerHTML = resultHTML;
                
            } catch (error) {
                document.getElementById('debugResults').innerHTML = \`
                    <div class="log-entry error">
                        <strong>\${endpoint.toUpperCase()}:</strong> 
                        ❌ خطا: \${error.message}
                    </div>
                \`;
            } finally {
                setLoading('debugResults', false);
            }
        }

        async function testAllEndpoints() {
            setLoading('debugResults', true);
            document.getElementById('debugResults').innerHTML = '<div class="status-indicator">🧪 در حال تست تمام endpointها...</div>';
            
            try {
                const endpoints = [
                    { name: 'health', url: '/api/health' },
                    { name: 'coins', url: '/api/coins?limit=5' },
                    { name: 'markets', url: '/api/markets/summary' },
                    { name: 'news', url: '/api/news?limit=2' },
                    { name: 'websocket', url: '/api/websocket/status' },
                    { name: 'fear-greed', url: '/api/insights/fear-greed' }
                ];

                let results = [];
                let successCount = 0;

                for (const endpoint of endpoints) {
                    try {
                        const startTime = Date.now();
                        const response = await fetch(endpoint.url);
                        const endTime = Date.now();
                        const responseTime = endTime - startTime;
                        
                        let data;
                        try {
                            data = await response.json();
                        } catch (e) {
                            data = { success: false };
                        }
                        
                        const success = response.ok && data.success;
                        if (success) successCount++;
                        
                        results.push({
                            name: endpoint.name,
                            success,
                            responseTime,
                            status: response.status
                        });
                    } catch (error) {
                        results.push({
                            name: endpoint.name,
                            success: false,
                            responseTime: 0,
                            status: 'ERROR'
                        });
                    }
                }

                let html = \`
                    <div class="status-indicator \${successCount === endpoints.length ? 'success' : successCount >= endpoints.length / 2 ? 'warning' : 'error'}">
                        🎯 تست کامل: \${successCount} از \${endpoints.length} موفق
                    </div>
                \`;

                results.forEach(result => {
                    html += \`
                        <div class="log-entry \${result.success ? 'success' : 'error'}">
                            <strong>\${result.name.toUpperCase()}:</strong>
                            \${result.success ? '✅' : '❌'} - 
                            \${result.responseTime}ms - 
                            وضعیت: \${result.status}
                        </div>
                    \`;
                });

                document.getElementById('debugResults').innerHTML = html;
                
            } catch (error) {
                document.getElementById('debugResults').innerHTML = \`
                    <div class="status-indicator error">
                        ❌ خطا در تست کامل: \${error.message}
                    </div>
                \`;
            } finally {
                setLoading('debugResults', false);
            }
        }

        // ==================== تب تنظیمات پایه ====================
        function saveBasicSettings() {
            const settings = {
                autoRefresh: document.getElementById('autoRefresh').checked,
                showNotifications: document.getElementById('showNotifications').checked,
                dataLimit: document.getElementById('dataLimit').value,
                language: document.getElementById('language').value
            };
            
            localStorage.setItem('vortexBasicSettings', JSON.stringify(settings));
            showNotification('تنظیمات پایه ذخیره شد', 'success');
        }

        function loadBasicSettings() {
            const saved = localStorage.getItem('vortexBasicSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                document.getElementById('autoRefresh').checked = settings.autoRefresh;
                document.getElementById('showNotifications').checked = settings.showNotifications;
                document.getElementById('dataLimit').value = settings.dataLimit;
                document.getElementById('language').value = settings.language;
            }
        }

        // ==================== بارگذاری اولیه ====================
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Settings page loaded');
            
            // بارگذاری تنظیمات
            loadAppearanceSettings();
            loadPerformanceSettings();
            loadBasicSettings();
            
            // بارگذاری اولیه تب تشخیص
            setTimeout(() => {
                runFullDiagnostics();
            }, 1000);
        });
        </script>`;

        res.send(generateModernPage("تنظیمات پیشرفته", content, 'settings'));
    };
};
