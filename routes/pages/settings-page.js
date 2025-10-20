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
                        <button class="btn" onclick="applyLogFilters()" style="font-size: 0.8rem;">اعمال فیلتر</button>
                    </div>
                </div>

                <!-- جستجوی پیشرفته -->
                <div style="margin: 15px 0;">
                    <input type="text" id="logSearch" class="input-field" placeholder="جستجو در لاگ‌ها (کلمه کلیدی)" style="width: 100%;">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn" onclick="searchLogs()">🔍 جستجو</button>
                        <button class="btn" onclick="exportLogs()">📤 خروجی JSON</button>
                        <button class="btn" onclick="clearLogs()" style="background: #ef4444;">🗑️ پاک کردن لاگ‌ها</button>
                    </div>
                </div>

                <!-- آمار لاگ‌ها -->
                <div id="logStats" class="metric-grid" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); margin: 15px 0;">
                    <!-- آمار به صورت داینامیک پر می‌شود -->
                </div>

                <!-- محتوای لاگ‌ها -->
                <div id="logContent" class="code-block" style="min-height: 400px; max-height: 500px; overflow-y: auto; font-family: 'Courier New', monospace;">
                    <div class="status-indicator">لاگ‌ها در اینجا نمایش داده می‌شوند</div>
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
                        <div>
                            <label>نوع کش:</label>
                            <select class="input-field" id="cacheStrategy">
                                <option value="memory">حافظه</option>
                                <option value="redis">Redis (اگر موجود باشد)</option>
                                <option value="hybrid">هیبرید</option>
                            </select>
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
                        <div>
                            <label>تعداد اتصالات همزمان:</label>
                            <input type="number" id="concurrentConnections" class="input-field" value="10" min="1" max="50">
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
                        <div>
                            <label>Provider پیشفرض:</label>
                            <select class="input-field" id="wsProvider">
                                <option value="lbank">LBank</option>
                                <option value="binance">Binance</option>
                                <option value="coinbase">Coinbase</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button class="btn" onclick="savePerformanceSettings()" style="margin-top: 20px;">💾 ذخیره تنظیمات عملکرد</button>
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
                                <option value="custom">سفارشی</option>
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
                        <div>
                            <label>ترتیب مرتب‌سازی جدول‌ها:</label>
                            <select class="input-field" id="tableSort">
                                <option value="rank">بر اساس رتبه</option>
                                <option value="name">بر اساس نام</option>
                                <option value="price">بر اساس قیمت</option>
                                <option value="change">بر اساس تغییرات</option>
                            </select>
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
                                <option value="IRR">ریال ایران (IRR)</option>
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
                        <div>
                            <label>منطقه زمانی:</label>
                            <select class="input-field" id="timezone">
                                <option value="auto">خودکار (براساس موقعیت)</option>
                                <option value="UTC">UTC</option>
                                <option value="tehran">تهران (IRST)</option>
                                <option value="newyork">نیویورک (EST)</option>
                                <option value="london">لندن (GMT)</option>
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

                <!-- تنظیمات انیمیشن و اثرات -->
                <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h4>✨ انیمیشن و اثرات بصری</h4>
                    <div style="display: grid; gap: 15px; margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>فعال‌سازی انیمیشن‌ها:</span>
                            <label class="switch">
                                <input type="checkbox" id="animationsEnabled" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>اثر Hover روی کارت‌ها:</span>
                            <label class="switch">
                                <input type="checkbox" id="hoverEffects" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>نمایش گرادیانت:</span>
                            <label class="switch">
                                <input type="checkbox" id="gradientEnabled" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div>
                            <label>سرعت انیمیشن:</label>
                            <select class="input-field" id="animationSpeed">
                                <option value="fast">سریع</option>
                                <option value="normal" selected>معمولی</option>
                                <option value="slow">آهسته</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- تنظیمات فونت و تایپوگرافی -->
                <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h4>🔤 تنظیمات فونت و متن</h4>
                    <div style="display: grid; gap: 15px; margin-top: 15px;">
                        <div>
                            <label>فونت پیشفرض:</label>
                            <select class="input-field" id="fontFamily">
                                <option value="system">سیستم</option>
                                <option value="vazir">Vazir (فارسی)</option>
                                <option value="samim">Samim (فارسی)</option>
                                <option value="arial">Arial</option>
                                <option value="georgia">Georgia</option>
                            </select>
                        </div>
                        <div>
                            <label>سایز فونت:</label>
                            <select class="input-field" id="fontSize">
                                <option value="small">کوچک</option>
                                <option value="medium" selected>متوسط</option>
                                <option value="large">بزرگ</option>
                                <option value="xlarge">خیلی بزرگ</option>
                            </select>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>فونت ضخیم برای عناوین:</span>
                            <label class="switch">
                                <input type="checkbox" id="boldHeadings" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <button class="btn" onclick="saveAppearanceSettings()" style="margin-top: 20px;">💾 ذخیره تنظیمات ظاهر</button>
                <button class="btn" onclick="resetAppearanceSettings()" style="margin-top: 10px; background: #6b7280;">🔄 بازنشانی به پیشفرض</button>
            </div>
        </div>

        <!-- تب‌های دیگر (دیباگ و تنظیمات پایه) -->
        <div id="debug" class="tab-content">
            <!-- محتوای تب دیباگ -->
        </div>

        <div id="config" class="tab-content">
            <!-- محتوای تب تنظیمات پایه -->
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
        </style>

        <script>
        // ==================== توابع لاگ‌های پیشرفته ====================
        async function applyLogFilters() {
            const level = document.getElementById('logLevel').value;
            const service = document.getElementById('logService').value;
            const timeRange = document.getElementById('logTimeRange').value;
            
            setLoading('logContent', true);
            try {
                const params = new URLSearchParams();
                if (level !== 'all') params.append('level', level);
                if (service !== 'all') params.append('service', service);
                if (timeRange !== 'all') params.append('timeRange', timeRange);
                
                const response = await fetch('/api/system/logs?' + params);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        displayLogs(data.data);
                        updateLogStats(data.stats);
                    }
                }
            } catch (error) {
                handleApiError(error, 'logContent');
            } finally {
                setLoading('logContent', false);
            }
        }

        async function searchLogs() {
            const searchTerm = document.getElementById('logSearch').value;
            if (!searchTerm.trim()) return;
            
            setLoading('logContent', true);
            try {
                const response = await fetch('/api/system/logs/search?q=' + encodeURIComponent(searchTerm));
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        displayLogs(data.results);
                        document.getElementById('logContent').innerHTML = 
                            '<div class="status-indicator success">' + data.results.length + ' نتیجه یافت شد</div>' + 
                            document.getElementById('logContent').innerHTML;
                    }
                }
            } catch (error) {
                handleApiError(error, 'logContent');
            } finally {
                setLoading('logContent', false);
            }
        }

        function updateLogStats(stats) {
            if (!stats) return;
            
            const html = \`
                <div class="metric-card">
                    <div class="metric-value">\${stats.total || 0}</div>
                    <div class="metric-label">کل لاگ‌ها</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #ef4444;">\${stats.errors || 0}</div>
                    <div class="metric-label">خطاها</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #f59e0b;">\${stats.warnings || 0}</div>
                    <div class="metric-label">هشدارها</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">\${new Date(stats.oldest).toLocaleDateString('fa-IR')}</div>
                    <div class="metric-label">قدیمی‌ترین</div>
                </div>
            \`;
            
            document.getElementById('logStats').innerHTML = html;
        }

        async function exportLogs() {
            try {
                const response = await fetch('/api/system/logs/export');
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'vortex-logs-' + new Date().toISOString() + '.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }
            } catch (error) {
                alert('خطا در export لاگ‌ها: ' + error.message);
            }
        }

        // ==================== توابع تنظیمات عملکرد ====================
        async function savePerformanceSettings() {
            const settings = {
                cache: {
                    enabled: document.getElementById('cacheEnabled').checked,
                    ttl: parseInt(document.getElementById('cacheTTL').value),
                    maxSize: parseInt(document.getElementById('cacheSize').value),
                    strategy: document.getElementById('cacheStrategy').value
                },
                rateLimit: {
                    requestsPerMinute: parseInt(document.getElementById('rateLimit').value),
                    timeout: parseInt(document.getElementById('requestTimeout').value),
                    concurrent: parseInt(document.getElementById('concurrentConnections').value)
                },
                websocket: {
                    interval: parseInt(document.getElementById('wsInterval').value),
                    reconnectAttempts: parseInt(document.getElementById('reconnectAttempts').value),
                    provider: document.getElementById('wsProvider').value
                }
            };
            
            localStorage.setItem('vortexPerformanceSettings', JSON.stringify(settings));
            showNotification('تنظیمات عملکرد با موفقیت ذخیره شد', 'success');
        }

        function loadPerformanceSettings() {
            const saved = localStorage.getItem('vortexPerformanceSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                // کش
                document.getElementById('cacheEnabled').checked = settings.cache.enabled;
                document.getElementById('cacheTTL').value = settings.cache.ttl;
                document.getElementById('cacheSize').value = settings.cache.maxSize;
                document.getElementById('cacheStrategy').value = settings.cache.strategy;
                
                // rate limit
                document.getElementById('rateLimit').value = settings.rateLimit.requestsPerMinute;
                document.getElementById('requestTimeout').value = settings.rateLimit.timeout;
                document.getElementById('concurrentConnections').value = settings.rateLimit.concurrent;
                
                // websocket
                document.getElementById('wsInterval').value = settings.websocket.interval;
                document.getElementById('reconnectAttempts').value = settings.websocket.reconnectAttempts;
                document.getElementById('wsProvider').value = settings.websocket.provider;
            }
        }

        // ==================== توابع شخصی‌سازی ظاهر ====================
        function selectTheme(theme) {
            // حذف انتخاب از همه themeها
            document.querySelectorAll('.theme-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            // انتخاب theme جدید
            event.currentTarget.classList.add('selected');
            
            // ذخیره theme
            const settings = getAppearanceSettings();
            settings.theme = theme;
            localStorage.setItem('vortexAppearanceSettings', JSON.stringify(settings));
            
            // اعمال theme
            applyTheme(theme);
        }

        function applyTheme(theme) {
            const root = document.documentElement;
            
            // حذف themeهای قبلی
            root.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-green');
            
            // اعمال theme جدید
            root.classList.add('theme-' + theme);
            
            // اعمال متغیرهای CSS براساس theme
            const themes = {
                dark: {
                    '--bg-primary': '#1a1a1a',
                    '--bg-secondary': '#2d2d2d',
                    '--text-primary': '#ffffff',
                    '--accent-color': '#13BCFF'
                },
                light: {
                    '--bg-primary': '#ffffff',
                    '--bg-secondary': '#f5f5f5', 
                    '--text-primary': '#333333',
                    '--accent-color': '#0066cc'
                },
                blue: {
                    '--bg-primary': '#0f172a',
                    '--bg-secondary': '#1e293b',
                    '--text-primary': '#f1f5f9',
                    '--accent-color': '#3b82f6'
                },
                green: {
                    '--bg-primary': '#052e16',
                    '--bg-secondary': '#14532d',
                    '--text-primary': '#f0fdf4',
                    '--accent-color': '#22c55e'
                }
            };
            
            const themeVars = themes[theme] || themes.dark;
            Object.entries(themeVars).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }

        function saveAppearanceSettings() {
            const settings = {
                theme: getSelectedTheme(),
                layout: {
                    order: document.getElementById('layoutOrder').value,
                    showMiniCards: document.getElementById('showMiniCards').checked,
                    showQuickMetrics: document.getElementById('showQuickMetrics').checked,
                    tableSort: document.getElementById('tableSort').value
                },
                display: {
                    currency: document.getElementById('defaultCurrency').value,
                    numberFormat: document.getElementById('numberFormat').value,
                    timezone: document.getElementById('timezone').value,
                    timeFormat24h: document.getElementById('timeFormat24h').checked
                },
                animation: {
                    enabled: document.getElementById('animationsEnabled').checked,
                    hoverEffects: document.getElementById('hoverEffects').checked,
                    gradient: document.getElementById('gradientEnabled').checked,
                    speed: document.getElementById('animationSpeed').value
                },
                typography: {
                    fontFamily: document.getElementById('fontFamily').value,
                    fontSize: document.getElementById('fontSize').value,
                    boldHeadings: document.getElementById('boldHeadings').checked
                }
            };
            
            localStorage.setItem('vortexAppearanceSettings', JSON.stringify(settings));
            applyAppearanceSettings(settings);
            showNotification('تنظیمات ظاهر با موفقیت ذخیره شد', 'success');
        }

        function getSelectedTheme() {
            const selected = document.querySelector('.theme-option.selected');
            return selected ? selected.querySelector('div:last-child').textContent.includes('تیره') ? 'dark' : 
                   selected.querySelector('div:last-child').textContent.includes('روشن') ? 'light' :
                   selected.querySelector('div:last-child').textContent.includes('آبی') ? 'blue' : 'green' : 'dark';
        }

        function loadAppearanceSettings() {
            const saved = localStorage.getItem('vortexAppearanceSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                // theme
                selectTheme(settings.theme);
                
                // layout
                document.getElementById('layoutOrder').value = settings.layout.order;
                document.getElementById('showMiniCards').checked = settings.layout.showMiniCards;
                document.getElementById('showQuickMetrics').checked = settings.layout.showQuickMetrics;
                document.getElementById('tableSort').value = settings.layout.tableSort;
                
                // display
                document.getElementById('defaultCurrency').value = settings.display.currency;
                document.getElementById('numberFormat').value = settings.display.numberFormat;
                document.getElementById('timezone').value = settings.display.timezone;
                document.getElementById('timeFormat24h').checked = settings.display.timeFormat24h;
                
                // animation
                document.getElementById('animationsEnabled').checked = settings.animation.enabled;
                document.getElementById('hoverEffects').checked = settings.animation.hoverEffects;
                document.getElementById('gradientEnabled').checked = settings.animation.gradient;
                document.getElementById('animationSpeed').value = settings.animation.speed;
                
                // typography
                document.getElementById('fontFamily').value = settings.typography.fontFamily;
                document.getElementById('fontSize').value = settings.typography.fontSize;
                document.getElementById('boldHeadings').checked = settings.typography.boldHeadings;
                
                applyAppearanceSettings(settings);
            }
        }

        function applyAppearanceSettings(settings) {
            // اعمال تنظیمات ظاهر به صفحه
            applyTheme(settings.theme);
            
            // اعمال فونت
            document.body.style.fontFamily = getFontFamily(settings.typography.fontFamily);
            document.body.style.fontSize = getFontSize(settings.typography.fontSize);
            
            // اعمال animations
            document.body.classList.toggle('no-animations', !settings.animation.enabled);
            document.body.classList.toggle('no-hover', !settings.animation.hoverEffects);
            document.body.classList.toggle('no-gradient', !settings.animation.gradient);
        }

        function getFontFamily(font) {
            const fonts = {
                'system': '-apple-system, BlinkMacSystemFont, sans-serif',
                'vazir': 'Vazir, sans-serif',
                'samim': 'Samim, sans-serif',
                'arial': 'Arial, sans-serif',
                'georgia': 'Georgia, serif'
            };
            return fonts[font] || fonts.system;
        }

        function getFontSize(size) {
            const sizes = {
                'small': '12px',
                'medium': '14px', 
                'large': '16px',
                'xlarge': '18px'
            };
            return sizes[size] || sizes.medium;
        }

        function getAppearanceSettings() {
            const saved = localStorage.getItem('vortexAppearanceSettings');
            return saved ? JSON.parse(saved) : {
                theme: 'dark',
                layout: { order: 'default', showMiniCards: true, showQuickMetrics: true, tableSort: 'rank' },
                display: { currency: 'USD', numberFormat: 'en', timezone: 'auto', timeFormat24h: false },
                animation: { enabled: true, hoverEffects: true, gradient: true, speed: 'normal' },
                typography: { fontFamily: 'system', fontSize: 'medium', boldHeadings: true }
            };
        }

        function resetAppearanceSettings() {
            if (confirm('آیا از بازنشانی تمام تنظیمات ظاهر به حالت پیشفرض اطمینان دارید؟')) {
                localStorage.removeItem('vortexAppearanceSettings');
                loadAppearanceSettings();
                showNotification('تنظیمات ظاهر به حالت پیشفرض بازنشانی شد', 'success');
            }
        }

        // ==================== توابع کمکی ====================
        function showNotification(message, type = 'info') {
            // ایجاد نوتیفیکیشن موقت
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

        function setLoading(elementId, isLoading) {
            const element = document.getElementById(elementId);
            if (isLoading) {
                element.innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری...</div>';
            }
        }

        function handleApiError(error, elementId) {
            console.error('API Error:', error);
            const element = document.getElementById(elementId);
            element.innerHTML = \`
                <div class="status-indicator error">
                    ❌ خطا در ارتباط: \${error.message}
                </div>
            \`;
        }

        // ==================== بارگذاری اولیه ====================
        document.addEventListener('DOMContentLoaded', function() {
            loadAppearanceSettings();
            loadPerformanceSettings();
            loadPerformanceMetrics();
            
            // بارگذاری لاگ‌ها
            applyLogFilters();
            
            // اجرای تشخیص پس از 2 ثانیه
            setTimeout(() => {
                runFullDiagnostics();
            }, 2000);
        });

        // توابع دیگر (runFullDiagnostics, displayLogs, testAPI, etc.) 
        // از نسخه قبلی کپی شوند...
        </script>`;

        res.send(generateModernPage("تنظیمات پیشرفته", content, 'settings'));
    };
};
