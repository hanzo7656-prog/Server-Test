const express = require('express');
const router = express.Router();
const { generateNavigationHTML } = require('./navigation-generator');

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
            .status-indicator.error {
                background: rgba(239,68,68,0.2);
                border-color: rgba(239,68,68,0.4);
                color: #ef4444;
            }
            .status-indicator.warning {
                background: rgba(245,158,11,0.2);
                border-color: rgba(245,158,11,0.4);
                color: #f59e0b;
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
                font-size: 0.9rem;
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
            .tabs { display: flex; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); flex-wrap: wrap; }
            .tab {
                padding: 10px 20px;
                background: none;
                border: none;
                color: rgba(255,255,255,0.6);
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.3s ease;
            }
            .tab.active {
                color: #667eea;
                border-bottom-color: #667eea;
                background: rgba(102,126,234,0.1);
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
                white-space: pre-wrap;
            }
            .log-entry {
                padding: 8px 12px;
                margin: 5px 0;
                border-radius: 6px;
                border-right: 3px solid #667eea;
                background: rgba(255,255,255,0.05);
            }
            .log-entry.error {
                border-right-color: #ef4444;
                background: rgba(239,68,68,0.1);
            }
            .log-entry.success {
                border-right-color: #10b981;
                background: rgba(16,185,129,0.1);
            }
            .metric-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 10px;
                margin: 15px 0;
            }
            .metric-card {
                background: rgba(255,255,255,0.03);
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                border: 1px solid rgba(255,255,255,0.05);
            }
            .metric-value {
                font-size: 1.4rem;
                font-weight: bold;
                background: linear-gradient(135deg, #667eea, #f115f9);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 5px;
            }
            .metric-label {
                font-size: 0.7rem;
                color: rgba(255,255,255,0.6);
            }
            @media (max-width: 768px) {
                .content-grid { grid-template-columns: 1fr; }
                .title { font-size: 2rem; }
                .tabs { flex-direction: column; }
                .tab { text-align: right; }
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
        
        <script>
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

            document.addEventListener('DOMContentLoaded', function() {
                const firstTab = document.querySelector('.tab');
                if (firstTab) firstTab.click();
            });
        </script>
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
                    <div class="status-indicator">✅ سیستم فعال و پایدار</div>
                    <div class="metric-grid">
                        <div class="metric-card">
                            <div class="metric-value" id="uptime">--</div>
                            <div class="metric-label">زمان فعالیت</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="requestCount">--</div>
                            <div class="metric-label">درخواست‌ها</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="successRate">--%</div>
                            <div class="metric-label">موفقیت</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="memory">--</div>
                            <div class="metric-label">حافظه</div>
                        </div>
                    </div>
                    <button class="btn" onclick="loadSystemStats()">بروزرسانی آمار</button>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">⚡</div>
                        <h3>دسترسی سریع</h3>
                    </div>
                    <div style="margin-top: 15px;">
                        <a href="/scan-page" class="btn">🔍 اسکن بازار</a>
                        <a href="/analysis-page" class="btn">📊 تحلیل تکنیکال</a>
                        <a href="/markets-page" class="btn">📈 مشاهده بازار</a>
                        <a href="/settings" class="btn">⚙️ تنظیمات</a>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">📈</div>
                        <h3>آمار زنده</h3>
                    </div>
                    <div style="margin-top: 15px;">
                        <div>🔗 300+ ارز فعال</div>
                        <div>📊 40+ اندیکاتور</div>
                        <div>🌐 50+ اندپوینت</div>
                        <div>❤️ 100% سلامت</div>
                    </div>
                </div>
            </div>

            <script>
                async function loadSystemStats() {
                    try {
                        const response = await fetch('/api/system/stats');
                        const data = await response.json();
                        
                        if (data.success) {
                            const perf = data.data.performance;
                            document.getElementById('uptime').textContent = perf.uptime;
                            document.getElementById('requestCount').textContent = perf.totalRequests;
                            document.getElementById('successRate').textContent = perf.successRate;
                            document.getElementById('memory').textContent = perf.memoryUsage;
                        }
                    } catch (error) {
                        console.error('Error loading stats:', error);
                    }
                }
                loadSystemStats();
            </script>
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
                <div class="status-indicator">🔄 سیستم اسکن فعال</div>
                <div style="margin: 15px 0;">
                    <input type="number" id="scanLimit" value="100" min="10" max="300" 
                           style="padding: 8px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; width: 100px;">
                    <button class="btn" onclick="runScan()">اجرای اسکن</button>
                </div>
                <div id="scanResult">
                    <div class="status-indicator">برای اسکن بازار دکمه بالا را بزنید</div>
                </div>
            </div>

            <script>
                async function runScan() {
                    const limit = document.getElementById('scanLimit').value;
                    document.getElementById('scanResult').innerHTML = '<div class="status-indicator">🔄 در حال اسکن بازار...</div>';
                    
                    try {
                        const response = await fetch('/api/scan?limit=' + limit);
                        const data = await response.json();
                        
                        if (data.success) {
                            document.getElementById('scanResult').innerHTML = \`
                                <div class="status-indicator">✅ اسکن کامل شد</div>
                                <div style="margin-top: 10px;">
                                    <div>📊 تعداد ارزها: \${data.data.length}</div>
                                    <div>💰 اولین ارز: \${data.data[0]?.name || 'N/A'}</div>
                                    <div>💎 قیمت: \${data.data[0]?.price || 'N/A'} USD</div>
                                </div>
                            \`;
                        } else {
                            document.getElementById('scanResult').innerHTML = '<div class="status-indicator error">❌ خطا در اسکن</div>';
                        }
                    } catch (error) {
                        document.getElementById('scanResult').innerHTML = '<div class="status-indicator error">❌ خطا در ارتباط</div>';
                    }
                }
            </script>
        `;
        res.send(generateModernPage("اسکن بازار", content, 'scan'));
    });

    // صفحه تحلیل تکنیکال
    router.get("/analysis-page", (req, res) => {
        const symbol = req.query.symbol || 'bitcoin';
        const content = `
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📊</div>
                    <h3>تحلیل تکنیکال پیشرفته</h3>
                </div>
                <div style="margin: 15px 0;">
                    <input type="text" id="symbolInput" value="${symbol}" placeholder="نماد ارز (bitcoin, ethereum...)" 
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
                    
                    document.getElementById('analysisResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری تحلیل...</div>';
                    
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
                            <div class="metric-grid">
                                <div class="metric-card">
                                    <div class="metric-value">\${data.current_price?.toFixed(2) || '0'}</div>
                                    <div class="metric-label">قیمت (USD)</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">\${data.indicators?.rsi || '0'}</div>
                                    <div class="metric-label">RSI</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">\${data.signals?.trend || 'NEUTRAL'}</div>
                                    <div class="metric-label">سیگنال</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">\${data.signals?.strength || '0'}%</div>
                                    <div class="metric-label">قدرت</div>
                                </div>
                            </div>
                        </div>
                    \`;
                    document.getElementById('analysisResult').innerHTML = html;
                }

                ${symbol !== 'bitcoin' ? `setTimeout(loadAnalysis, 500);` : ''}
            </script>
        `;
        res.send(generateModernPage("تحلیل تکنیکال", content, 'analyze'));
    });

    // صفحه بازار
    router.get("/markets-page", (req, res) => {
        const content = `
            <div class="content-grid">
                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">📈</div>
                        <h3>داده‌های بازار</h3>
                    </div>
                    <div class="status-indicator">🔄 داده‌های زنده فعال</div>
                    <div style="margin: 15px 0;">
                        <button class="btn" onclick="loadMarketData()">بارگذاری داده‌ها</button>
                        <button class="btn" onclick="loadTopGainers()">برترین سودها</button>
                    </div>
                    <div id="marketResult">
                        <div class="status-indicator">برای مشاهده داده‌ها دکمه بالا را بزنید</div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">💰</div>
                        <h3>مارکت کپ جهانی</h3>
                    </div>
                    <button class="btn" onclick="loadMarketCap()">بارگذاری مارکت کپ</button>
                    <div id="marketCapResult" style="margin-top: 15px;">
                        <div class="status-indicator">آماده بارگذاری</div>
                    </div>
                </div>
            </div>

            <script>
                async function loadMarketData() {
                    try {
                        document.getElementById('marketResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری داده‌ها...</div>';
                        
                        const response = await fetch('/api/coins?limit=10');
                        const data = await response.json();
                        
                        if (data.success) {
                            let html = '<div class="status-indicator">✅ داده‌ها بارگذاری شد</div><div style="margin-top: 10px;">';
                            data.data.forEach(coin => {
                                html += \`<div style="margin: 5px 0; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 5px;">
                                    <strong>\${coin.name}</strong>: \${coin.price} USD
                                </div>\`;
                            });
                            html += '</div>';
                            document.getElementById('marketResult').innerHTML = html;
                        }
                    } catch (error) {
                        document.getElementById('marketResult').innerHTML = '<div class="status-indicator error">❌ خطا در بارگذاری</div>';
                    }
                }

                async function loadTopGainers() {
                    try {
                        document.getElementById('marketResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری برترین‌ها...</div>';
                        
                        const response = await fetch('/api/dashboard/top-gainers?limit=5');
                        const data = await response.json();
                        
                        if (data.success) {
                            let html = '<div class="status-indicator">✅ برترین سودها</div><div style="margin-top: 10px;">';
                            data.data.forEach(coin => {
                                html += \`<div style="margin: 5px 0; padding: 8px; background: rgba(16,185,129,0.1); border-radius: 5px;">
                                    <strong>\${coin.name}</strong>: +\${coin.priceChange24h}%
                                </div>\`;
                            });
                            html += '</div>';
                            document.getElementById('marketResult').innerHTML = html;
                        }
                    } catch (error) {
                        document.getElementById('marketResult').innerHTML = '<div class="status-indicator error">❌ خطا در بارگذاری</div>';
                    }
                }

                async function loadMarketCap() {
                    try {
                        document.getElementById('marketCapResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری...</div>';
                        
                        const response = await fetch('/api/markets/cap');
                        const data = await response.json();
                        
                        if (data.success) {
                            document.getElementById('marketCapResult').innerHTML = \`
                                <div class="status-indicator">✅ مارکت کپ بارگذاری شد</div>
                                <div style="margin-top: 10px;">
                                    <div>💰 مارکت کپ جهانی: \${data.data[0]?.market_cap || 'N/A'}</div>
                                    <div>📊 حجم معاملات: \${data.data[0]?.volume || 'N/A'}</div>
                                </div>
                            \`;
                        }
                    } catch (error) {
                        document.getElementById('marketCapResult').innerHTML = '<div class="status-indicator error">❌ خطا در بارگذاری</div>';
                    }
                }
            </script>
        `;
        res.send(generateModernPage("بازار سرمایه", content, 'market'));
    });

    // صفحه بینش‌ها
    router.get("/insights-page", (req, res) => {
        const content = `
            <div class="content-grid">
                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">💡</div>
                        <h3>بینش‌های بازار</h3>
                    </div>
                    <div class="status-indicator">🔄 تحلیل‌های هوشمند فعال</div>
                    <div style="margin: 15px 0;">
                        <button class="btn" onclick="loadDashboard()">بارگذاری دشبورد</button>
                        <button class="btn" onclick="loadFearGreed()">شاخص ترس و طمع</button>
                    </div>
                    <div id="insightsResult">
                        <div class="status-indicator">برای مشاهده بینش‌ها دکمه بالا را بزنید</div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">₿</div>
                        <h3>تسلط بیت‌کوین</h3>
                    </div>
                    <button class="btn" onclick="loadBTCDominance()">بارگذاری تسلط</button>
                    <div id="btcDominanceResult" style="margin-top: 15px;">
                        <div class="status-indicator">آماده بارگذاری</div>
                    </div>
                </div>
            </div>

            <script>
                async function loadDashboard() {
                    try {
                        document.getElementById('insightsResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری دشبورد...</div>';
                        
                        const response = await fetch('/api/insights/dashboard');
                        const data = await response.json();
                        
                        if (data.success) {
                            const dashboard = data.data;
                            document.getElementById('insightsResult').innerHTML = \`
                                <div class="status-indicator">✅ دشبورد بارگذاری شد</div>
                                <div style="margin-top: 10px;">
                                    <div>₿ تسلط بیت‌کوین: \${dashboard.btc_dominance || 'N/A'}%</div>
                                    <div>😨 شاخص ترس و طمع: \${dashboard.fear_greed || 'N/A'}</div>
                                    <div>💰 مارکت کپ: \${dashboard.market_cap || 'N/A'}</div>
                                </div>
                            \`;
                        }
                    } catch (error) {
                        document.getElementById('insightsResult').innerHTML = '<div class="status-indicator error">❌ خطا در بارگذاری</div>';
                    }
                }

                async function loadFearGreed() {
                    try {
                        document.getElementById('insightsResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری شاخص...</div>';
                        
                        const response = await fetch('/api/insights/fear-greed');
                        const data = await response.json();
                        
                        if (data.success) {
                            document.getElementById('insightsResult').innerHTML = \`
                                <div class="status-indicator">✅ شاخص ترس و طمع</div>
                                <div style="margin-top: 10px;">
                                    <div>🎯 مقدار: \${data.data || 'N/A'}</div>
                                    <div>📊 وضعیت: \${getFearGreedStatus(data.data)}</div>
                                </div>
                            \`;
                        }
                    } catch (error) {
                        document.getElementById('insightsResult').innerHTML = '<div class="status-indicator error">❌ خطا در بارگذاری</div>';
                    }
                }

                async function loadBTCDominance() {
                    try {
                        document.getElementById('btcDominanceResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری...</div>';
                        
                        const response = await fetch('/api/insights/btc-dominance');
                        const data = await response.json();
                        
                        if (data.success) {
                            document.getElementById('btcDominanceResult').innerHTML = \`
                                <div class="status-indicator">✅ تسلط بیت‌کوین</div>
                                <div style="margin-top: 10px;">
                                    <div>₿ تسلط: \${data.data || 'N/A'}%</div>
                                    <div>📈 وضعیت بازار: \${getDominanceStatus(data.data)}</div>
                                </div>
                            \`;
                        }
                    } catch (error) {
                        document.getElementById('btcDominanceResult').innerHTML = '<div class="status-indicator error">❌ خطا در بارگذاری</div>';
                    }
                }

                function getFearGreedStatus(value) {
                    if (value >= 80) return '💀 طمع شدید';
                    if (value >= 60) return '😊 طمع';
                    if (value >= 40) return '😐 خنثی';
                    if (value >= 20) return '😨 ترس';
                    return '💀 ترس شدید';
                }

                function getDominanceStatus(value) {
                    if (value >= 60) return 'قوی بیت‌کوین';
                    if (value >= 45) return 'متوازن';
                    return 'ضعیف بیت‌کوین';
                }
            </script>
        `;
        res.send(generateModernPage("بینش‌های بازار", content, 'insights'));
    });

    // صفحه اخبار
    router.get("/news-page", (req, res) => {
        const content = `
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📰</div>
                    <h3>اخبار کریپتو</h3>
                </div>
                <div class="status-indicator">🔄 سیستم اخبار فعال</div>
                <div style="margin: 15px 0;">
                    <button class="btn" onclick="loadNews()">بارگذاری اخبار</button>
                    <button class="btn" onclick="loadTrendingNews()">اخبار ترند</button>
                </div>
                <div id="newsResult">
                    <div class="status-indicator">برای مشاهده اخبار دکمه بالا را بزنید</div>
                </div>
            </div>

            <script>
                async function loadNews() {
                    try {
                        document.getElementById('newsResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری اخبار...</div>';
                        
                        const response = await fetch('/api/news?limit=5');
                        const data = await response.json();
                        
                        if (data.success) {
                            let html = '<div class="status-indicator">✅ اخبار بارگذاری شد</div><div style="margin-top: 10px;">';
                            data.data.forEach((news, index) => {
                                if (index < 3) {
                                    html += \`<div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                                        <strong>\${news.title || 'بدون عنوان'}</strong><br>
                                        <small>\${news.description || 'بدون توضیح'}</small>
                                    </div>\`;
                                }
                            });
                            html += '</div>';
                            document.getElementById('newsResult').innerHTML = html;
                        }
                    } catch (error) {
                        document.getElementById('newsResult').innerHTML = '<div class="status-indicator error">❌ خطا در بارگذاری اخبار</div>';
                    }
                }

                async function loadTrendingNews() {
                    try {
                        document.getElementById('newsResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری اخبار ترند...</div>';
                        
                        const response = await fetch('/api/news/trending?limit=3');
                        const data = await response.json();
                        
                        if (data.success) {
                            let html = '<div class="status-indicator">✅ اخبار ترند</div><div style="margin-top: 10px;">';
                            data.data.forEach(news => {
                                html += \`<div style="margin: 10px 0; padding: 10px; background: rgba(102,126,234,0.1); border-radius: 8px;">
                                    <strong>🔥 \${news.title || 'بدون عنوان'}</strong><br>
                                    <small>\${news.description || 'بدون توضیح'}</small>
                                </div>\`;
                            });
                            html += '</div>';
                            document.getElementById('newsResult').innerHTML = html;
                        }
                    } catch (error) {
                        document.getElementById('newsResult').innerHTML = '<div class="status-indicator error">❌ خطا در بارگذاری</div>';
                    }
                }
            </script>
        `;
        res.send(generateModernPage("اخبار کریپتو", content, 'news'));
    });

    // صفحه سلامت
    router.get("/health-page", (req, res) => {
        const content = `
            <div class="content-grid">
                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">❤️</div>
                        <h3>سلامت سیستم</h3>
                    </div>
                    <div class="status-indicator">🔄 مانیتورینگ فعال</div>
                    <button class="btn" onclick="checkSystemHealth()">بررسی سلامت</button>
                    <div id="healthResult" style="margin-top: 15px;">
                        <div class="status-indicator">برای بررسی سلامت دکمه بالا را بزنید</div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">📊</div>
                        <h3>آمار لحظه‌ای</h3>
                    </div>
                    <div class="metric-grid">
                        <div class="metric-card">
                            <div class="metric-value" id="liveUptime">--</div>
                            <div class="metric-label">آپتایم</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="liveRequests">--</div>
                            <div class="metric-label">درخواست‌ها</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="liveSuccess">--%</div>
                            <div class="metric-label">موفقیت</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="liveMemory">--</div>
                            <div class="metric-label">حافظه</div>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                async function checkSystemHealth() {
                    try {
                        document.getElementById('healthResult').innerHTML = '<div class="status-indicator">🔄 در حال بررسی سلامت...</div>';
                        
                        const response = await fetch('/api/health/combined');
                        const data = await response.json();
                        
                        if (data.success) {
                            const health = data.data;
                            document.getElementById('healthResult').innerHTML = \`
                                <div class="status-indicator">✅ سیستم سالم است</div>
                                <div style="margin-top: 15px;">
                                    <div>🟢 وضعیت کلی: \${health.status}</div>
                                    <div>🟢 WebSocket: \${health.websocket_status.status}</div>
                                    <div>🟢 دیتابیس: \${health.gist_status.status}</div>
                                    <div>🟢 API: \${health.api_status.status}</div>
                                    <div>🟢 سرور: \${health.system_status?.status || 'سالم'}</div>
                                </div>
                            \`;
                        }
                    } catch (error) {
                        document.getElementById('healthResult').innerHTML = '<div class="status-indicator error">❌ خطا در بررسی سلامت</div>';
                    }
                }

                async function updateLiveStatus() {
                    try {
                        const response = await fetch('/api/system/stats');
                        const data = await response.json();
                        
                        if (data.success) {
                            const perf = data.data.performance;
                            document.getElementById('liveUptime').textContent = perf.uptime;
                            document.getElementById('liveRequests').textContent = perf.totalRequests;
                            document.getElementById('liveSuccess').textContent = perf.successRate;
                            document.getElementById('liveMemory').textContent = perf.memoryUsage;
                        }
                    } catch (error) {
                        console.error('Error updating live status:', error);
                    }
                }

                // بارگذاری اولیه
                document.addEventListener('DOMContentLoaded', function() {
                    updateLiveStatus();
                    setInterval(updateLiveStatus, 10000);
                });
            </script>
        `;
        res.send(generateModernPage("سلامت سیستم", content, 'health'));
    });

    // صفحه تنظیمات
    router.get("/settings", (req, res) => {
        const content = `
            <div class="tabs">
                <button class="tab active" onclick="openTab(event, 'logs')">📝 لاگ‌ها</button>
                <button class="tab" onclick="openTab(event, 'debug')">🐛 دیباگ</button>
                <button class="tab" onclick="openTab(event, 'performance')">📊 عملکرد</button>
                <button class="tab" onclick="openTab(event, 'health')">❤️ سلامت</button>
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
                        برای مشاهده لاگ‌ها دکمه بالا را بزنید
                    </div>
                </div>
            </div>

            <!-- تب دیباگ -->
            <div id="debug" class="tab-content">
                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">🔧</div>
                        <h3>تست سیستم</h3>
                    </div>
                    <button class="btn" onclick="testAPI()">تست API</button>
                    <div id="apiTestResult" style="margin-top: 15px;">
                        <div class="status-indicator">آماده تست</div>
                    </div>
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
                    <div id="performanceResult" style="margin-top: 15px;">
                        <div class="status-indicator">آماده بارگذاری</div>
                    </div>
                </div>
            </div>

            <!-- تب سلامت -->
            <div id="health" class="tab-content">
                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">❤️</div>
                        <h3>بررسی سلامت</h3>
                    </div>
                    <button class="btn" onclick="checkHealth()">بررسی سلامت</button>
                    <div id="healthResult" style="margin-top: 15px;">
                        <div class="status-indicator">آماده بررسی</div>
                    </div>
                </div>
            </div>

            <script>
                async function loadLogs() {
                    try {
                        document.getElementById('logContent').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری لاگ‌ها...</div>';
                        
                        const response = await fetch('/api/system/stats');
                        const data = await response.json();
                        
                        if (data.success) {
                            let logHTML = '';
                            
                            if (data.data.recent_activity && data.data.recent_activity.errors) {
                                data.data.recent_activity.errors.forEach(error => {
                                    logHTML += \`<div class="log-entry error">
                                        <strong>\${error.endpoint}</strong><br>
                                        \${error.message}<br>
                                        <small>\${new Date(error.timestamp).toLocaleString('fa-IR')}</small>
                                    </div>\`;
                                });
                            }
                            
                            if (data.data.recent_activity && data.data.recent_activity.requests) {
                                data.data.recent_activity.requests.forEach(req => {
                                    const statusClass = req.status === 'error' ? 'error' : 'success';
                                    logHTML += \`<div class="log-entry \${statusClass}">
                                        <strong>\${req.method} \${req.endpoint}</strong><br>
                                        وضعیت: \${req.status} | زمان: \${req.duration || 'N/A'}
                                    </div>\`;
                                });
                            }
                            
                            document.getElementById('logContent').innerHTML = logHTML || '<div class="status-indicator">✅ هیچ لاگی یافت نشد</div>';
                        }
                    } catch (error) {
                        document.getElementById('logContent').innerHTML = '<div class="status-indicator error">❌ خطا در بارگذاری لاگ‌ها</div>';
                    }
                }

                async function testAPI() {
                    try {
                        document.getElementById('apiTestResult').innerHTML = '<div class="status-indicator">🔄 در حال تست API...</div>';
                        
                        const response = await fetch('/api/health');
                        const data = await response.json();
                        
                        if (data.success) {
                            document.getElementById('apiTestResult').innerHTML = \`
                                <div class="status-indicator">✅ API فعال است</div>
                                <div style="margin-top: 10px;">
                                    <div>🟢 وضعیت: \${data.status}</div>
                                    <div>🟢 سرویس: \${data.service}</div>
                                    <div>🟢 نسخه: \${data.version}</div>
                                </div>
                            \`;
                        }
                    } catch (error) {
                        document.getElementById('apiTestResult').innerHTML = '<div class="status-indicator error">❌ API مشکل دارد</div>';
                    }
                }

                async function loadPerformance() {
                    try {
                        document.getElementById('performanceResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری آمار...</div>';
                        
                        const response = await fetch('/api/system/stats');
                        const data = await response.json();
                        
                        if (data.success) {
                            const perf = data.data.performance;
                            document.getElementById('performanceResult').innerHTML = \`
                                <div class="metric-grid">
                                    <div class="metric-card">
                                        <div class="metric-value">\${perf.totalRequests}</div>
                                        <div class="metric-label">درخواست‌ها</div>
                                    </div>
                                    <div class="metric-card">
                                        <div class="metric-value">\${perf.successRate}</div>
                                        <div class="metric-label">موفقیت</div>
                                    </div>
                                    <div class="metric-card">
                                        <div class="metric-value">\${perf.averageDuration}</div>
                                        <div class="metric-label">زمان متوسط</div>
                                    </div>
                                    <div class="metric-card">
                                        <div class="metric-value">\${perf.memoryUsage}</div>
                                        <div class="metric-label">حافظه</div>
                                    </div>
                                </div>
                            \`;
                        }
                    } catch (error) {
                        document.getElementById('performanceResult').innerHTML = '<div class="status-indicator error">❌ خطا در بارگذاری آمار</div>';
                    }
                }

                async function checkHealth() {
                    try {
                        document.getElementById('healthResult').innerHTML = '<div class="status-indicator">🔄 در حال بررسی سلامت...</div>';
                        
                        const response = await fetch('/api/health/combined');
                        const data = await response.json();
                        
                        if (data.success) {
                            document.getElementById('healthResult').innerHTML = \`
                                <div class="status-indicator">✅ سیستم سالم است</div>
                                <div style="margin-top: 10px;">
                                    <div>🟢 وضعیت کلی: \${data.data.status}</div>
                                    <div>🟢 WebSocket: \${data.data.websocket_status.status}</div>
                                    <div>🟢 API: \${data.data.api_status.status}</div>
                                </div>
                            \`;
                        }
                    } catch (error) {
                        document.getElementById('healthResult').innerHTML = '<div class="status-indicator error">❌ خطا در بررسی سلامت</div>';
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

    return router;
};
