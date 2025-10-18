const express = require('express');
const router = express.Router();
const { generateNavigationHTML } = require('../navigation-generator');

// تابع تولید صفحه
function generateModernPage(title, content, currentPage = 'home') {
    return `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - VortexAI</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: Tahoma, sans-serif;
                background: linear-gradient(135deg, #0f0f1a, #1a1a2e);
                color: white;
                min-height: 100vh;
            }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title {
                font-size: 2.5rem;
                background: linear-gradient(135deg, #667eea, #f115f9);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }
            .content-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .content-card {
                background: rgba(255,255,255,0.05);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 15px;
                padding: 20px;
                transition: all 0.3s ease;
            }
            .content-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(102,126,234,0.3);
            }
            .card-header {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .card-icon { font-size: 20px; margin-left: 10px; }
            .status-indicator {
                display: inline-block;
                padding: 8px 15px;
                background: rgba(16,185,129,0.2);
                border: 1px solid rgba(16,185,129,0.4);
                border-radius: 20px;
                color: #10b981;
                font-size: 0.8rem;
                margin: 5px 0;
            }
            .btn {
                display: inline-block;
                padding: 10px 20px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border: none;
                border-radius: 8px;
                color: white;
                text-decoration: none;
                margin: 5px;
                cursor: pointer;
            }
            .data-table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
                font-size: 0.8rem;
            }
            .data-table th, .data-table td {
                padding: 8px 10px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                text-align: right;
            }
            .tabs { display: flex; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .tab {
                padding: 10px 20px;
                background: none;
                border: none;
                color: rgba(255,255,255,0.6);
                cursor: pointer;
                border-bottom: 2px solid transparent;
            }
            .tab.active {
                color: #667eea;
                border-bottom-color: #667eea;
            }
            .tab-content { display: none; }
            .tab-content.active { display: block; }
            .code-block {
                background: rgba(0,0,0,0.3);
                border-radius: 8px;
                padding: 15px;
                margin: 10px 0;
                font-family: monospace;
                font-size: 0.8rem;
                max-height: 200px;
                overflow-y: auto;
            }
            @media (max-width: 768px) {
                .content-grid { grid-template-columns: 1fr; }
                .title { font-size: 2rem; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="title">🚀 VortexAI</h1>
                <p>${title}</p>
            </div>
            ${content}
        </div>
        ${generateNavigationHTML(currentPage)}
    </body>
    </html>`;
}

module.exports = (dependencies) => {
    const { gistManager, wsManager, apiClient } = dependencies;

    // صفحه اصلی
    router.get("/", (req, res) => {
        const content = `
            <div class="content-grid">
                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">📊</div>
                        <h3>وضعیت سیستم</h3>
                    </div>
                    <div class="status-indicator">✅ سیستم فعال</div>
                    <div style="margin-top: 15px;">
                        <div>🟢 WebSocket: متصل</div>
                        <div>🟢 API: فعال</div>
                        <div>🟢 دیتابیس: آماده</div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">⚡</div>
                        <h3>دسترسی سریع</h3>
                    </div>
                    <div style="margin-top: 15px;">
                        <a href="/scan-page" class="btn">🔍 اسکن</a>
                        <a href="/analysis-page" class="btn">📊 تحلیل</a>
                        <a href="/markets-page" class="btn">📈 بازار</a>
                        <a href="/settings" class="btn">⚙️ تنظیمات</a>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">📈</div>
                        <h3>آمار زنده</h3>
                    </div>
                    <div style="margin-top: 15px;">
                        <div>📊 300+ ارز فعال</div>
                        <div>⚡ 40+ اندیکاتور</div>
                        <div>🔗 50+ اندپوینت</div>
                        <div>❤️ 100% سلامت</div>
                    </div>
                </div>
            </div>
        `;
        res.send(generateModernPage("داشبورد", content, 'home'));
    });

    // صفحه اسکن
    router.get("/scan-page", (req, res) => {
        const content = `
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">🔍</div>
                    <h3>اسکن بازار ارزها</h3>
                </div>
                <div class="status-indicator">🔄 در حال توسعه</div>
                <p style="margin: 15px 0; color: rgba(255,255,255,0.7);">
                    سیستم اسکن پیشرفته 300 ارز برتر بازار
                </p>
                <div>
                    <button class="btn" onclick="runScan()">اجرای اسکن</button>
                    <button class="btn">تنظیمات فیلتر</button>
                </div>
            </div>

            <script>
                function runScan() {
                    alert('سیستم اسکن به زودی راه‌اندازی می‌شود');
                }
            </script>
        `;
        res.send(generateModernPage("اسکن بازار", content, 'scan'));
    });

    // صفحه تحلیل
    router.get("/analysis-page", (req, res) => {
        const symbol = req.query.symbol || 'bitcoin';
        const content = `
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📊</div>
                    <h3>تحلیل تکنیکال</h3>
                </div>
                <div style="margin: 15px 0;">
                    <input type="text" id="symbolInput" value="${symbol}" placeholder="نماد ارز (مثال: bitcoin)" 
                           style="padding: 8px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; width: 200px;">
                    <button class="btn" onclick="loadAnalysis()">بارگذاری تحلیل</button>
                </div>
                <div id="analysisResult">
                    <div class="status-indicator">لطفا نماد ارز را وارد کنید</div>
                </div>
            </div>

            <script>
                async function loadAnalysis() {
                    const symbol = document.getElementById('symbolInput').value;
                    if (!symbol) return;
                    
                    document.getElementById('analysisResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری...</div>';
                    
                    try {
                        const response = await fetch('/api/analysis/technical?symbol=' + symbol);
                        const data = await response.json();
                        
                        if (data.success) {
                            displayAnalysis(data.data);
                        } else {
                            document.getElementById('analysisResult').innerHTML = '<div class="status-indicator error">❌ خطا: ' + data.error + '</div>';
                        }
                    } catch (error) {
                        document.getElementById('analysisResult').innerHTML = '<div class="status-indicator error">❌ خطا در ارتباط</div>';
                    }
                }

                function displayAnalysis(data) {
                    const html = \`
                        <div style="margin-top: 15px;">
                            <div class="status-indicator">✅ تحلیل بارگذاری شد</div>
                            <div>💰 قیمت: \${data.current_price} USD</div>
                            <div>📈 RSI: \${data.indicators.rsi}</div>
                            <div>🎯 سیگنال: \${data.signals.trend}</div>
                            <div>💪 قدرت: \${data.signals.strength}%</div>
                        </div>
                    \`;
                    document.getElementById('analysisResult').innerHTML = html;
                }

                // اگر نماد در URL وجود دارد
                ${symbol !== 'bitcoin' ? `setTimeout(loadAnalysis, 500);` : ''}
            </script>
        `;
        res.send(generateModernPage("تحلیل تکنیکال", content, 'analyze'));
    });

    // صفحه تنظیمات (تمام دیباگ و لاگ‌ها)
    router.get("/settings", (req, res) => {
        const content = `
            <div class="tabs">
                <button class="tab active" onclick="openTab(event, 'logs')">📝 لاگ‌ها</button>
                <button class="tab" onclick="openTab(event, 'debug')">🐛 دیباگ</button>
                <button class="tab" onclick="openTab(event, 'health')">❤️ سلامت</button>
                <button class="tab" onclick="openTab(event, 'performance')">📊 عملکرد</button>
            </div>

            <!-- تب لاگ‌ها -->
            <div id="logs" class="tab-content active">
                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">📝</div>
                        <h3>لاگ‌های سیستم</h3>
                    </div>
                    <button class="btn" onclick="loadLogs()">بارگذاری لاگ‌ها</button>
                    <div id="logContent" class="code-block">
                        لاگ‌ها در اینجا نمایش داده می‌شوند...
                    </div>
                </div>
            </div>

            <!-- تب دیباگ -->
            <div id="debug" class="tab-content">
                <div class="content-grid">
                    <div class="content-card">
                        <div class="card-header">
                            <div class="card-icon">🔧</div>
                            <h3>تست API</h3>
                        </div>
                        <button class="btn" onclick="testAPI()">اجرای تست‌ها</button>
                        <div id="apiTestResult" style="margin-top: 10px;"></div>
                    </div>

                    <div class="content-card">
                        <div class="card-header">
                            <div class="card-icon">📡</div>
                            <h3>وضعیت WebSocket</h3>
                        </div>
                        <div id="wsStatus">در حال بارگذاری...</div>
                    </div>
                </div>
            </div>

            <!-- تب سلامت -->
            <div id="health" class="tab-content">
                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">❤️</div>
                        <h3>سلامت سیستم</h3>
                    </div>
                    <button class="btn" onclick="checkHealth()">بررسی سلامت</button>
                    <div id="healthResult" style="margin-top: 15px;"></div>
                </div>
            </div>

            <!-- تب عملکرد -->
            <div id="performance" class="tab-content">
                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">📊</div>
                        <h3>آمار عملکرد</h3>
                    </div>
                    <button class="btn" onclick="loadPerformance()">بارگذاری آمار</button>
                    <div id="performanceResult" style="margin-top: 15px;"></div>
                </div>
            </div>

            <script>
                // مدیریت تب‌ها
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

                // لاگ‌ها
                async function loadLogs() {
                    try {
                        const response = await fetch('/api/system/stats');
                        const data = await response.json();
                        
                        if (data.success) {
                            let logHTML = '';
                            data.data.recent_activity.errors.forEach(error => {
                                logHTML += \`❌ \${new Date(error.timestamp).toLocaleString('fa-IR')} - \${error.message}\\n\`;
                            });
                            data.data.recent_activity.requests.forEach(req => {
                                logHTML += \`📡 \${req.method} \${req.endpoint} - \${req.status}\\n\`;
                            });
                            
                            document.getElementById('logContent').textContent = logHTML || 'هیچ لاگی یافت نشد';
                        }
                    } catch (error) {
                        document.getElementById('logContent').textContent = 'خطا در بارگذاری لاگ‌ها';
                    }
                }

                // تست API
                async function testAPI() {
                    document.getElementById('apiTestResult').innerHTML = '<div class="status-indicator">🔄 در حال تست...</div>';
                    
                    try {
                        const response = await fetch('/api/health');
                        const data = await response.json();
                        
                        if (data.success) {
                            document.getElementById('apiTestResult').innerHTML = '<div class="status-indicator">✅ API فعال است</div>';
                        }
                    } catch (error) {
                        document.getElementById('apiTestResult').innerHTML = '<div class="status-indicator error">❌ API مشکل دارد</div>';
                    }
                }

                // سلامت
                async function checkHealth() {
                    document.getElementById('healthResult').innerHTML = '<div class="status-indicator">🔄 در حال بررسی...</div>';
                    
                    try {
                        const response = await fetch('/api/health/combined');
                        const data = await response.json();
                        
                        if (data.success) {
                            let healthHTML = '';
                            healthHTML += \`<div>🔗 WebSocket: \${data.data.websocket_status.status}</div>\`;
                            healthHTML += \`<div>💾 دیتابیس: \${data.data.gist_status.status}</div>\`;
                            healthHTML += \`<div>🌐 API: \${data.data.api_status.status}</div>\`;
                            
                            document.getElementById('healthResult').innerHTML = healthHTML;
                        }
                    } catch (error) {
                        document.getElementById('healthResult').innerHTML = '<div class="status-indicator error">❌ خطا در بررسی سلامت</div>';
                    }
                }

                // عملکرد
                async function loadPerformance() {
                    document.getElementById('performanceResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری...</div>';
                    
                    try {
                        const response = await fetch('/api/system/stats');
                        const data = await response.json();
                        
                        if (data.success) {
                            const perf = data.data.performance;
                            let perfHTML = \`
                                <div>📊 درخواست‌ها: \${perf.totalRequests}</div>
                                <div>✅ موفق: \${perf.successfulRequests}</div>
                                <div>❌ خطا: \${perf.errorCount}</div>
                                <div>⚡ زمان متوسط: \${perf.averageDuration}</div>
                                <div>📈 نرخ موفقیت: \${perf.successRate}</div>
                            \`;
                            
                            document.getElementById('performanceResult').innerHTML = perfHTML;
                        }
                    } catch (error) {
                        document.getElementById('performanceResult').innerHTML = '<div class="status-indicator error">❌ خطا در بارگذاری آمار</div>';
                    }
                }

                // بارگذاری اولیه
                document.addEventListener('DOMContentLoaded', function() {
                    loadLogs();
                    loadPerformance();
                });
            </script>
        `;
        res.send(generateModernPage("تنظیمات و دیباگ", content, 'settings'));
    });

    // صفحات دیگر
    const simplePages = [
        { path: '/markets-page', title: 'بازار سرمایه', icon: '📈', desc: 'داده‌های جامع بازار' },
        { path: '/insights-page', title: 'بینش‌ها', icon: '💡', desc: 'تحلیل احساسات بازار' },
        { path: '/news-page', title: 'اخبار', icon: '📰', desc: 'آخرین اخبار کریپتو' },
        { path: '/health-page', title: 'سلامت', icon: '❤️', desc: 'بررسی وضعیت سیستم' }
    ];

    simplePages.forEach(page => {
        router.get(page.path, (req, res) => {
            const content = `
                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">${page.icon}</div>
                        <h3>${page.title}</h3>
                    </div>
                    <div class="status-indicator">🔄 در حال توسعه</div>
                    <p style="margin: 15px 0; color: rgba(255,255,255,0.7);">
                        ${page.desc}
                    </p>
                    <div>
                        <button class="btn" onclick="alert('به زودی راه‌اندازی می‌شود')">مشاهده</button>
                    </div>
                </div>
            `;
            res.send(generateModernPage(page.title, content, page.path.replace('-page', '').replace('/', '')));
        });
    });

    return router;
};
