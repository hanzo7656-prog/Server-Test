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
    <title>${title} - VortexA!</title>
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
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102,126,234,0.4);
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
        
        /* استایل‌های جدید */
        .news-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .news-item {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .news-image {
            height: 160px;
            background: rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .news-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .no-image {
            font-size: 2rem;
            opacity: 0.5;
        }
        .news-content {
            padding: 15px;
        }
        .news-content h4 {
            margin-bottom: 8px;
            font-size: 1rem;
        }
        .news-content p {
            font-size: 0.8rem;
            opacity: 0.8;
            margin-bottom: 10px;
        }
        .news-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.7rem;
            opacity: 0.6;
        }
        .news-link {
            color: #667eea;
            text-decoration: none;
            font-size: 0.8rem;
        }
        .trending-news {
            margin-top: 15px;
        }
        .trending-item {
            display: flex;
            align-items: center;
            padding: 10px;
            background: rgba(255,255,255,0.03);
            border-radius: 8px;
            margin-bottom: 8px;
        }
        .trend-rank {
            margin-left: 10px;
            font-size: 1.2rem;
        }
        .trend-content {
            flex: 1;
        }
        .trend-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.7rem;
            opacity: 0.6;
            margin-top: 5px;
        }
        .market-list, .gainers-list {
            margin-top: 15px;
        }
        .market-item, .gainer-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: rgba(255,255,255,0.03);
            border-radius: 8px;
            margin-bottom: 8px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .coin-info, .gainer-info {
            flex: 1;
        }
        .coin-symbol, .gainer-symbol {
            font-size: 0.7rem;
            opacity: 0.6;
            display: block;
        }
        .coin-change, .gainer-change {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .positive {
            background: rgba(16,185,129,0.2);
            color: #10b981;
        }
        .negative {
            background: rgba(239,68,68,0.2);
            color: #ef4444;
        }
        .gainer-rank {
            margin-left: 10px;
            font-size: 1rem;
        }
        .gainer-item {
            background: rgba(16,185,129,0.1);
        }
        .input-field {
            padding: 10px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.1);
            color: white;
            margin: 5px;
            font-family: Tahoma, sans-serif;
        }
        .input-field:focus {
            outline: none;
            border-color: #667eea;
        }

        @media (max-width: 768px) {
            .content-grid { grid-template-columns: 1fr; }
            .title { font-size: 2rem; }
            .tabs { flex-direction: column; }
            .tab { text-align: right; }
            .news-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">VortexA!</h1>
            <p>${title}</p>
        </div>
        ${content}
    </div>

    ${generateNavigationHTML(currentPage)}

    <script>
        // تابع مدیریت تب‌ها
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

        // توابع کمکی عمومی
        function formatNumber(num) {
            if (!num || isNaN(num)) return 'N/A';
            if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
            if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
            if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
            if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
            return num.toString();
        }

        function formatPrice(price) {
            if (!price || isNaN(price)) return 'N/A';
            if (price < 1) return '$' + price.toFixed(4);
            if (price < 10) return '$' + price.toFixed(3);
            if (price < 1000) return '$' + price.toFixed(2);
            return '$' + price.toFixed(0);
        }

        function formatDate(dateString) {
            if (!dateString) return 'تاریخ نامشخص';
            try {
                return new Date(dateString).toLocaleDateString('fa-IR');
            } catch {
                return 'تاریخ نامشخص';
            }
        }

        function getFearGreedStatus(value) {
            const numValue = Number(value);
            if (isNaN(numValue)) return '💀 نامشخص';
            if (numValue >= 80) return '😊 طمع شدید';
            if (numValue >= 60) return '😐 طمع';
            if (numValue >= 40) return '😐 خنثی';
            if (numValue >= 20) return '😨 ترس';
            return '💀 ترس شدید';
        }

        function getDominanceStatus(value) {
            const numValue = Number(value);
            if (isNaN(numValue)) return 'نامشخص';
            if (numValue >= 60) return 'قوی بیت‌کوین';
            if (numValue >= 45) return 'متوازن';
            return 'ضعیف بیت‌کوین';
        }

        // تابع برای استخراج ایمن داده‌های تو در تو
        function getSafeValue(obj, path, defaultValue = 'N/A') {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
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
                <div class="status-indicator">✔ سیستم فعال و پایدار</div>
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
                        <div class="metric-label">میزان موفقیت</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="memory">--</div>
                        <div class="metric-label">مصرف حافظه</div>
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
                    <a href="/analysis-page" class="btn">📈 تحلیل تکنیکال</a>
                    <a href="/markets-page" class="btn">📊 مشاهده بازار</a>
                    <a href="/insights-page" class="btn">🔮 بینش‌های بازار</a>
                    <a href="/news-page" class="btn">📰 اخبار کریپتو</a>
                    <a href="/health-page" class="btn">❤️ سلامت سیستم</a>
                    <a href="/settings" class="btn">⚙️ تنظیمات</a>
                </div>
            </div>

            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📈</div>
                    <h3>آمار زنده</h3>
                </div>
                <div style="margin-top: 15px">
                    <div>• سیستم تحلیل بازار</div>
                    <div>• داده‌های لحظه‌ای</div>
                    <div>• ابزارهای پیشرفته</div>
                    <div>• پشتیبانی 24/7</div>
                </div>
            </div>
        </div>

        <script>
            async function loadSystemStats() {
                try {
                    const response = await fetch('/api/system/stats');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const perf = data.data.performance || data.data;
                        document.getElementById('uptime').textContent = perf.uptime || 'N/A';
                        document.getElementById('requestCount').textContent = perf.totalRequests || '0';
                        document.getElementById('successRate').textContent = (perf.successRate || '0') + '%';
                        document.getElementById('memory').textContent = perf.memoryUsage || 'N/A';
                    } else {
                        throw new Error(data.error || 'خطا در دریافت آمار');
                    }
                } catch (error) {
                    console.error('Error loading stats:', error);
                    document.getElementById('uptime').textContent = 'خطا';
                    document.getElementById('requestCount').textContent = 'خطا';
                    document.getElementById('successRate').textContent = 'خطا';
                    document.getElementById('memory').textContent = 'خطا';
                }
            }

            // بارگذاری اولیه
            loadSystemStats();
        </script>`;

        res.send(generateModernPage("داشبورد اصلی", content, 'home'));
    });

    // صفحه اسکن
    router.get("/scan-page", (req, res) => {
        const content = `
        <div class="content-card">
            <div class="card-header">
                <div class="card-icon">🔍</div>
                <h3>اسکن بازار ارزها</h3>
            </div>
            <div class="status-indicator">سیستم اسکن فعال</div>
            <div style="margin: 15px 0;">
                <input type="number" id="scanLimit" value="50" min="10" max="300" class="input-field">
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
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const scanData = data.data;
                        const coins = Array.isArray(scanData) ? scanData : scanData.coins || scanData.results || [];
                        
                        if (coins.length > 0) {
                            document.getElementById('scanResult').innerHTML = \`
                                <div class="status-indicator">✅ اسکن کامل شد</div>
                                <div style="margin-top: 10px">
                                    <div>تعداد ارزها: \${coins.length}</div>
                                    <div>اولین ارز: \${coins[0]?.name || coins[0]?.symbol || 'N/A'}</div>
                                    <div>قیمت: \${coins[0]?.price ? formatPrice(coins[0].price) : 'N/A'}</div>
                                    <div>تغییر 24h: \${coins[0]?.priceChange24h ? coins[0].priceChange24h + '%' : 'N/A'}</div>
                                </div>
                            \`;
                        } else {
                            document.getElementById('scanResult').innerHTML = 
                                '<div class="status-indicator warning">⚠️ هیچ داده‌ای یافت نشد</div>';
                        }
                    } else {
                        throw new Error(data.error || 'خطا در اسکن');
                    }
                } catch (error) {
                    console.error('Scan error:', error);
                    document.getElementById('scanResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در اسکن: ' + error.message + '</div>';
                }
            }
        </script>`;

        res.send(generateModernPage("اسکن بازار", content, 'scan'));
    });

    // صفحه تحلیل تکنیکال
    router.get("/analysis-page", (req, res) => {
        const symbol = req.query.symbol || 'bitcoin';
        const content = `
        <div class="content-card">
            <div class="card-header">
                <div class="card-icon">📈</div>
                <h3>تحلیل تکنیکال پیشرفته</h3>
            </div>
            <div style="margin: 15px 0;">
                <input type="text" id="symbolInput" value="${symbol}" placeholder="نماد ارز (bitcoin, ethereum...)" class="input-field" style="width: 250px;">
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
                    const response = await fetch('/api/analysis/technical?symbol=' + encodeURIComponent(symbol));
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        displayAnalysis(data.data);
                    } else {
                        throw new Error(data.error || 'خطا در دریافت تحلیل');
                    }
                } catch (error) {
                    console.error('Analysis error:', error);
                    document.getElementById('analysisResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در ارتباط: ' + error.message + '</div>';
                }
            }

            function displayAnalysis(data) {
                const currentPrice = getSafeValue(data, 'current_price', 0);
                const rsi = getSafeValue(data, 'indicators.rsi', getSafeValue(data, 'rsi', 0));
                const trend = getSafeValue(data, 'signals.trend', getSafeValue(data, 'trend', 'NEUTRAL'));
                const strength = getSafeValue(data, 'signals.strength', getSafeValue(data, 'strength', 0));
                
                const html = \`
                    <div style="margin-top: 15px;">
                        <div class="status-indicator">✅ تحلیل بارگذاری شد</div>
                        <div class="metric-grid">
                            <div class="metric-card">
                                <div class="metric-value">\${formatPrice(currentPrice)}</div>
                                <div class="metric-label">قیمت (USD)</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">\${rsi}</div>
                                <div class="metric-label">RSI</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">\${trend}</div>
                                <div class="metric-label">روند</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">\${strength}%</div>
                                <div class="metric-label">قدرت سیگنال</div>
                            </div>
                        </div>
                    </div>
                \`;
                document.getElementById('analysisResult').innerHTML = html;
            }

            ${symbol !== 'bitcoin' ? 'setTimeout(loadAnalysis, 500)' : ''}
        </script>`;

        res.send(generateModernPage("تحلیل تکنیکال", content, 'analyze'));
    });

    // صفحه بازار
    router.get("/markets-page", (req, res) => {
        const content = `
        <div class="content-grid">
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📊</div>
                    <h3>داده‌های بازار</h3>
                </div>
                <div class="status-indicator">داده‌های زنده فعال</div>
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
                    <div class="card-icon">🌍</div>
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
                    const response = await fetch('/api/coins?limit=15');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const coins = Array.isArray(data.data) ? data.data : data.data.coins || data.data.results || [];
                        
                        if (coins.length > 0) {
                            let html = '<div class="status-indicator">✅ داده‌های بازار</div><div class="market-list">';
                            
                            coins.forEach(coin => {
                                const change = coin.price_change_percentage_24h || coin.change24h || coin.priceChange24h || 0;
                                const changeClass = change >= 0 ? 'positive' : 'negative';
                                const price = coin.current_price || coin.price || 0;
                                
                                html += \`
                                    <div class="market-item">
                                        <div class="coin-info">
                                            <strong>\${coin.name || coin.symbol || 'نامشخص'}</strong>
                                            <span class="coin-symbol">\${coin.symbol ? coin.symbol.toUpperCase() : ''}</span>
                                        </div>
                                        <div class="coin-price">
                                            \${formatPrice(price)}
                                        </div>
                                        <div class="coin-change \${changeClass}">
                                            \${change >= 0 ? '📈' : '📉'} \${Math.abs(change).toFixed(2)}%
                                        </div>
                                    </div>
                                \`;
                            });
                            
                            html += '</div>';
                            document.getElementById('marketResult').innerHTML = html;
                        } else {
                            document.getElementById('marketResult').innerHTML = 
                                '<div class="status-indicator warning">⚠️ هیچ داده‌ای یافت نشد</div>';
                        }
                    } else {
                        throw new Error(data.error || 'خطا در دریافت داده‌ها');
                    }
                } catch (error) {
                    console.error('Market data error:', error);
                    document.getElementById('marketResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در بارگذاری داده‌ها: ' + error.message + '</div>';
                }
            }

            async function loadTopGainers() {
                try {
                    document.getElementById('marketResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری برترین سودها...</div>';
                    const response = await fetch('/api/markets/top-gainers?limit=8');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const gainers = Array.isArray(data.data) ? data.data : data.data.gainers || data.data.results || [];
                        
                        if (gainers.length > 0) {
                            let html = '<div class="status-indicator">🚀 برترین سودها</div><div class="gainers-list">';
                            
                            gainers.forEach((coin, index) => {
                                const change = coin.price_change_percentage_24h || coin.change24h || coin.priceChange24h || 0;
                                const rank = index + 1;
                                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🔸';
                                const price = coin.current_price || coin.price || 0;
                                
                                html += \`
                                    <div class="gainer-item">
                                        <span class="gainer-rank">\${medal} \${rank}</span>
                                        <div class="gainer-info">
                                            <strong>\${coin.name || coin.symbol || 'نامشخص'}</strong>
                                            <span class="gainer-symbol">\${coin.symbol ? coin.symbol.toUpperCase() : ''}</span>
                                        </div>
                                        <div class="gainer-change positive">
                                            +\${Math.abs(change).toFixed(2)}%
                                        </div>
                                        <div class="gainer-price">
                                            \${formatPrice(price)}
                                        </div>
                                    </div>
                                \`;
                            });
                            
                            html += '</div>';
                            document.getElementById('marketResult').innerHTML = html;
                        } else {
                            document.getElementById('marketResult').innerHTML = 
                                '<div class="status-indicator warning">⚠️ هیچ داده‌ای یافت نشد</div>';
                        }
                    } else {
                        throw new Error(data.error || 'خطا در دریافت برترین سودها');
                    }
                } catch (error) {
                    console.error('Top gainers error:', error);
                    document.getElementById('marketResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در بارگذاری برترین سودها: ' + error.message + '</div>';
                }
            }

            async function loadMarketCap() {
                try {
                    document.getElementById('marketCapResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری مارکت کپ...</div>';
                    const response = await fetch('/api/markets/global');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const globalData = data.data;
                        const marketCap = globalData.total_market_cap || globalData.market_cap || globalData.total_market_cap_usd;
                        const volume = globalData.total_volume || globalData.volume_24h || globalData.total_volume_usd;
                        const dominance = globalData.btc_dominance || globalData.bitcoin_dominance;
                        const activeCoins = globalData.active_cryptocurrencies || globalData.active_crypto;
                        
                        document.getElementById('marketCapResult').innerHTML = \`
                            <div class="status-indicator">✅ مارکت کپ جهانی</div>
                            <div style="margin-top: 10px;">
                                <div>💰 مارکت کپ: \${formatNumber(marketCap)}</div>
                                <div>📊 حجم معاملات: \${formatNumber(volume)}</div>
                                <div>🏪 تسلط بیت‌کوین: \${dominance || 'N/A'}%</div>
                                <div>📈 تعداد ارزها: \${activeCoins || 'N/A'}</div>
                            </div>
                        \`;
                    } else {
                        throw new Error(data.error || 'خطا در دریافت مارکت کپ');
                    }
                } catch (error) {
                    console.error('Market cap error:', error);
                    document.getElementById('marketCapResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در بارگذاری مارکت کپ: ' + error.message + '</div>';
                }
            }
        </script>`;

        res.send(generateModernPage("بازار سرمایه", content, 'market'));
    });

    // صفحه بینش‌ها
    router.get("/insights-page", (req, res) => {
        const content = `
        <div class="content-grid">
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">🔮</div>
                    <h3>پیش‌بینی بازار</h3>
                </div>
                <div class="status-indicator">تحلیل‌های هوشمند فعال</div>
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
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const dashboard = data.data;
                        
                        const btcDominance = getSafeValue(dashboard, 'btc_dominance.value', 
                            getSafeValue(dashboard, 'btc_dominance', 
                            getSafeValue(dashboard, 'btcDominance', 
                            getSafeValue(dashboard, 'bitcoin_dominance', 'N/A'))));
                            
                        const fearGreed = getSafeValue(dashboard, 'fear_greed.value', 
                            getSafeValue(dashboard, 'fear_greed', 
                            getSafeValue(dashboard, 'fearGreedIndex', 
                            getSafeValue(dashboard, 'fear_greed_index', 'N/A'))));
                            
                        const marketCap = getSafeValue(dashboard, 'market_cap.total', 
                            getSafeValue(dashboard, 'market_cap', 
                            getSafeValue(dashboard, 'total_market_cap', 
                            getSafeValue(dashboard, 'market_cap_usd', 'N/A'))));
                        
                        document.getElementById('insightsResult').innerHTML = \`
                            <div class="status-indicator">✅ دشبورد بارگذاری شد</div>
                            <div style="margin-top: 10px;">
                                <div>₿ تسلط بیت‌کوین: \${btcDominance}%</div>
                                <div>😨 شاخص ترس و طمع: \${fearGreed}</div>
                                <div>💰 مارکت کپ: \${formatNumber(marketCap)}</div>
                            </div>
                        \`;
                    } else {
                        throw new Error(data.error || 'خطا در بارگذاری دشبورد');
                    }
                } catch (error) {
                    console.error('Dashboard error:', error);
                    document.getElementById('insightsResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا: ' + error.message + '</div>';
                }
            }

            async function loadFearGreed() {
                try {
                    document.getElementById('insightsResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری شاخص ترس و طمع...</div>';
                    const response = await fetch('/api/insights/fear-greed');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const value = getSafeValue(data.data, 'value', 
                            getSafeValue(data.data, 'fear_greed_value', 
                            getSafeValue(data.data, 'score', data.data)));
                            
                        const status = getFearGreedStatus(Number(value));
                        
                        document.getElementById('insightsResult').innerHTML = \`
                            <div class="status-indicator">✅ شاخص ترس و طمع</div>
                            <div style="margin-top: 10px;">
                                <div>📊 مقدار: \${value}</div>
                                <div>🎯 وضعیت: \${status}</div>
                            </div>
                        \`;
                    } else {
                        throw new Error(data.error || 'خطا در بارگذاری شاخص');
                    }
                } catch (error) {
                    console.error('Fear greed error:', error);
                    document.getElementById('insightsResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا: ' + error.message + '</div>';
                }
            }

            async function loadBTCDominance() {
                try {
                    document.getElementById('btcDominanceResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری...</div>';
                    const response = await fetch('/api/insights/btc-dominance');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const dominance = getSafeValue(data.data, 'value', 
                            getSafeValue(data.data, 'dominance', 
                            getSafeValue(data.data, 'btc_dominance', data.data)));
                            
                        const status = getDominanceStatus(Number(dominance));
                        
                        document.getElementById('btcDominanceResult').innerHTML = \`
                            <div class="status-indicator">✅ تسلط بیت‌کوین</div>
                            <div style="margin-top: 10px;">
                                <div>₿ تسلط: \${dominance}%</div>
                                <div>📈 وضعیت بازار: \${status}</div>
                            </div>
                        \`;
                    } else {
                        throw new Error(data.error || 'خطا در بارگذاری تسلط');
                    }
                } catch (error) {
                    console.error('BTC dominance error:', error);
                    document.getElementById('btcDominanceResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا: ' + error.message + '</div>';
                }
            }
        </script>`;

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
            <div class="status-indicator">سیستم اخبار فعال</div>
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
                    const response = await fetch('/api/news?limit=10');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const newsItems = Array.isArray(data.data) ? data.data : data.data.news || data.data.results || [];
                        
                        if (newsItems.length > 0) {
                            let html = '<div class="status-indicator">✅ اخبار بارگذاری شد</div><div class="news-grid">';
                            
                            newsItems.forEach((news, index) => {
                                if (index < 6) {
                                    html += \`
                                        <div class="news-item">
                                            <div class="news-image">
                                                \${news.image ? 
                                                    '<img src="' + news.image + '" alt="' + (news.title || '') + '" onerror="this.style.display=\\'none\\'">' : 
                                                    '<div class="no-image">📰</div>'
                                                }
                                            </div>
                                            <div class="news-content">
                                                <h4>\${news.title || 'بدون عنوان'}</h4>
                                                <p>\${news.description || 'بدون توضیحات'}</p>
                                                <div class="news-meta">
                                                    <span class="source">\${news.source || 'منبع نامشخص'}</span>
                                                    <span class="date">\${formatDate(news.date || news.published_at)}</span>
                                                </div>
                                                \${news.url ? '<a href="' + news.url + '" target="_blank" class="news-link">مشاهده کامل</a>' : ''}
                                            </div>
                                        </div>
                                    \`;
                                }
                            });
                            
                            html += '</div>';
                            document.getElementById('newsResult').innerHTML = html;
                        } else {
                            document.getElementById('newsResult').innerHTML = 
                                '<div class="status-indicator warning">⚠️ خبری یافت نشد</div>';
                        }
                    } else {
                        throw new Error(data.error || 'خطا در دریافت اخبار');
                    }
                } catch (error) {
                    console.error('News error:', error);
                    document.getElementById('newsResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در بارگذاری اخبار: ' + error.message + '</div>';
                }
            }

            async function loadTrendingNews() {
                try {
                    document.getElementById('newsResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری اخبار ترند...</div>';
                    const response = await fetch('/api/news/trending?limit=5');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const trendingNews = Array.isArray(data.data) ? data.data : data.data.trending || data.data.results || [];
                        
                        if (trendingNews.length > 0) {
                            let html = '<div class="status-indicator">🔥 اخبار ترند</div><div class="trending-news">';
                            
                            trendingNews.forEach((news, index) => {
                                const trendIcon = index < 3 ? ['🥇', '🥈', '🥉'][index] : '🔸';
                                html += \`
                                    <div class="trending-item">
                                        <span class="trend-rank">\${trendIcon}</span>
                                        <div class="trend-content">
                                            <strong>\${news.title || 'بدون عنوان'}</strong>
                                            <div class="trend-meta">
                                                <span>\${news.source || 'منبع نامشخص'}</span>
                                                <span>\${formatDate(news.date || news.published_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                \`;
                            });
                            
                            html += '</div>';
                            document.getElementById('newsResult').innerHTML = html;
                        } else {
                            document.getElementById('newsResult').innerHTML = 
                                '<div class="status-indicator warning">⚠️ خبر ترندی یافت نشد</div>';
                        }
                    } else {
                        throw new Error(data.error || 'خطا در دریافت اخبار ترند');
                    }
                } catch (error) {
                    console.error('Trending news error:', error);
                    document.getElementById('newsResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در بارگذاری اخبار ترند: ' + error.message + '</div>';
                }
            }
        </script>`;

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
                <div class="status-indicator">سیستم در حال اجرا</div>
                <button class="btn" onclick="checkSystemHealth()">بررسی سلامت</button>
                <div id="healthResult" style="margin-top: 15px">
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
                        <div class="metric-label">مصرف حافظه</div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            async function checkSystemHealth() {
                try {
                    document.getElementById('healthResult').innerHTML = '<div class="status-indicator">🔄 در حال بررسی سلامت...</div>';
                    const response = await fetch('/api/health/combined');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const health = data.data;
                        document.getElementById('healthResult').innerHTML = \`
                            <div class="status-indicator">✅ سیستم سالم است</div>
                            <div style="margin-top: 15px;">
                                <div>🟢 وضعیت کل: \${health.overall_status || health.status || 'نامشخص'}</div>
                                <div>🟢 WebSocket: \${getSafeValue(health, 'websocket_status.status', 'نامشخص')}</div>
                                <div>🟢 دیتابیس: \${getSafeValue(health, 'gist_status.status', 'نامشخص')}</div>
                                <div>🟡 API: \${getSafeValue(health, 'api_status.status', 'نامشخص')}</div>
                                <div>🟢 سیستم: \${getSafeValue(health, 'system_status.status', 'نامشخص')}</div>
                            </div>
                        \`;
                    } else {
                        throw new Error(data.error || 'خطا در بررسی سلامت');
                    }
                } catch (error) {
                    console.error('Health check error:', error);
                    document.getElementById('healthResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در بررسی سلامت: ' + error.message + '</div>';
                }
            }

            async function updateLiveStatus() {
                try {
                    const response = await fetch('/api/system/stats');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();

                    if (data.success && data.data) {
                        const perf = data.data.performance || data.data;
                        document.getElementById('liveUptime').textContent = perf.uptime || 'N/A';
                        document.getElementById('liveRequests').textContent = perf.totalRequests || '0';
                        document.getElementById('liveSuccess').textContent = (perf.successRate || '0') + '%';
                        document.getElementById('liveMemory').textContent = perf.memoryUsage || 'N/A';
                    }
                } catch (error) {
                    console.error('Error updating live status', error);
                }
            }

            // بارگذاری اولیه
            document.addEventListener('DOMContentLoaded', function() {
                updateLiveStatus();
                setInterval(updateLiveStatus, 10000);
            });
        </script>`;

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

        <!-- تب لاگ ها -->
        <div id="logs" class="tab-content active">
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📋</div>
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
                    <h3>تست API</h3>
                </div>
                <button class="btn" onclick="testAPI()">تست API</button>
                <div id="apiTestResult" style="margin-top: 15px">
                    <div class="status-indicator">آماده تست</div>
                </div>
            </div>
        </div>

        <!-- تب عملکرد -->
        <div id="performance" class="tab-content">
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📈</div>
                    <h3>آمار عملکرد</h3>
                </div>
                <button class="btn" onclick="loadPerformance()">بارگذاری آمار</button>
                <div id="performanceResult" style="margin-top: 15px">
                    <div class="status-indicator">آماده بارگذاری</div>
                </div>
            </div>
        </div>

        <!-- تب سلامت -->
        <div id="health" class="tab-content">
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">🩺</div>
                    <h3>بررسی سلامت</h3>
                </div>
                <button class="btn" onclick="checkHealth()">بررسی سلامت</button>
                <div id="healthTabResult" style="margin-top: 15px">
                    <div class="status-indicator">آماده بررسی</div>
                </div>
            </div>
        </div>

        <script>
            async function loadLogs() {
                try {
                    document.getElementById('logContent').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری لاگ‌ها...</div>';
                    const response = await fetch('/api/system/logs');
                    if (!response.ok) {
                        // اگر endpoint لاگ وجود ندارد، از endpoint stats استفاده کن
                        const statsResponse = await fetch('/api/system/stats');
                        if (!statsResponse.ok) throw new Error('خطای شبکه: ' + statsResponse.status);
                        
                        const statsData = await statsResponse.json();
                        if (statsData.success && statsData.data) {
                            const activity = statsData.data.recent_activity || {};
                            let logHTML = "";
                            
                            if (activity.errors && activity.errors.length > 0) {
                                activity.errors.forEach(error => {
                                    logHTML += \`
                                        <div class="log-entry error">
                                            <strong>\${error.endpoint || 'نامشخص'}</strong><br>
                                            \${error.message || 'بدون پیام'}<br>
                                            <small>\${formatDate(error.timestamp)}</small>
                                        </div>
                                    \`;
                                });
                            }
                            
                            if (activity.requests && activity.requests.length > 0) {
                                activity.requests.forEach(req => {
                                    const statusClass = req.status === 'error' ? 'error' : 'success';
                                    logHTML += \`
                                        <div class="log-entry \${statusClass}">
                                            <strong>\${req.method || 'GET'} \${req.endpoint || '/'}</strong><br>
                                            مدت: \${req.duration || 'N/A'}ms | وضعیت: \${req.status || 'unknown'}
                                        </div>
                                    \`;
                                });
                            }
                            
                            document.getElementById('logContent').innerHTML = logHTML || '<div class="status-indicator">✅ هیچ لاگی یافت نشد</div>';
                        } else {
                            throw new Error('داده‌ای برای نمایش وجود ندارد');
                        }
                    } else {
                        const data = await response.json();
                        if (data.success && data.data) {
                            const logs = data.data.recent_activity || data.data;
                            let logHTML = "";
                            
                            if (logs.errors && logs.errors.length > 0) {
                                logs.errors.forEach(error => {
                                    logHTML += \`
                                        <div class="log-entry error">
                                            <strong>\${error.endpoint || 'نامشخص'}</strong><br>
                                            \${error.message || 'بدون پیام'}<br>
                                            <small>\${formatDate(error.timestamp)}</small>
                                        </div>
                                    \`;
                                });
                            }
                            
                            if (logs.requests && logs.requests.length > 0) {
                                logs.requests.forEach(req => {
                                    const statusClass = req.status === 'error' ? 'error' : 'success';
                                    logHTML += \`
                                        <div class="log-entry \${statusClass}">
                                            <strong>\${req.method || 'GET'} \${req.endpoint || '/'}</strong><br>
                                            مدت: \${req.duration || 'N/A'}ms | وضعیت: \${req.status || 'unknown'}
                                        </div>
                                    \`;
                                });
                            }
                            
                            document.getElementById('logContent').innerHTML = logHTML || '<div class="status-indicator">✅ هیچ لاگی یافت نشد</div>';
                        } else {
                            throw new Error(data.error || 'خطا در دریافت لاگ‌ها');
                        }
                    }
                } catch (error) {
                    console.error('Logs error:', error);
                    document.getElementById('logContent').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در بارگذاری لاگ‌ها: ' + error.message + '</div>';
                }
            }

            async function testAPI() {
                try {
                    document.getElementById('apiTestResult').innerHTML = '<div class="status-indicator">🔄 در حال تست API...</div>';
                    const response = await fetch('/api/health');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('apiTestResult').innerHTML = \`
                            <div class="status-indicator">✅ API فعال است</div>
                            <div style="margin-top: 10px;">
                                <div>📊 وضعیت: \${data.data?.status || data.status || 'healthy'}</div>
                                <div>🛠️ سرویس: \${data.data?.service || 'VortexA API'}</div>
                                <div>🔢 نسخه: \${data.data?.version || '1.0.0'}</div>
                                <div>⏰ زمان پاسخ: \${data.data?.response_time || 'N/A'}ms</div>
                            </div>
                        \`;
                    } else {
                        throw new Error(data.error || 'API پاسخ نامعتبر داد');
                    }
                } catch (error) {
                    console.error('API test error:', error);
                    document.getElementById('apiTestResult').innerHTML = 
                        '<div class="status-indicator error">❌ API مشکل دارد: ' + error.message + '</div>';
                }
            }

            async function loadPerformance() {
                try {
                    document.getElementById('performanceResult').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری آمار...</div>';
                    const response = await fetch('/api/system/stats');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const perf = data.data.performance || data.data;
                        document.getElementById('performanceResult').innerHTML = \`
                            <div class="metric-grid">
                                <div class="metric-card">
                                    <div class="metric-value">\${perf.totalRequests || '0'}</div>
                                    <div class="metric-label">درخواست‌ها</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">\${perf.successRate || '0'}%</div>
                                    <div class="metric-label">موفقیت</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">\${perf.averageDuration || '0'}ms</div>
                                    <div class="metric-label">زمان متوسط</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">\${perf.memoryUsage || 'N/A'}</div>
                                    <div class="metric-label">مصرف حافظه</div>
                                </div>
                            </div>
                        \`;
                    } else {
                        throw new Error(data.error || 'خطا در دریافت آمار');
                    }
                } catch (error) {
                    console.error('Performance error:', error);
                    document.getElementById('performanceResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در بارگذاری آمار: ' + error.message + '</div>';
                }
            }

            async function checkHealth() {
                try {
                    document.getElementById('healthTabResult').innerHTML = '<div class="status-indicator">🔄 در حال بررسی سلامت...</div>';
                    const response = await fetch('/api/health/combined');
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        document.getElementById('healthTabResult').innerHTML = \`
                            <div class="status-indicator">✅ سیستم سالم است</div>
                            <div style="margin-top: 10px;">
                                <div>🟢 وضعیت کل: \${data.data.overall_status || data.data.status || 'نامشخص'}</div>
                                <div>🟢 WebSocket: \${getSafeValue(data.data, 'websocket_status.status', 'نامشخص')}</div>
                                <div>🟢 API: \${getSafeValue(data.data, 'api_status.status', 'نامشخص')}</div>
                                <div>🟢 دیتابیس: \${getSafeValue(data.data, 'gist_status.status', 'نامشخص')}</div>
                            </div>
                        \`;
                    } else {
                        throw new Error(data.error || 'خطا در بررسی سلامت');
                    }
                } catch (error) {
                    console.error('Health tab error:', error);
                    document.getElementById('healthTabResult').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در بررسی سلامت: ' + error.message + '</div>';
                }
            }

            // بارگذاری اولیه
            document.addEventListener('DOMContentLoaded', function() {
                loadLogs();
                loadPerformance();
            });
        </script>`;

        res.send(generateModernPage("تنظیمات و دیباگ", content, 'settings'));
    });

    return router;
};
