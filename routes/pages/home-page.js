const { generateModernPage } = require('../page-generator');
const DataProcessor = require('../../models/DataProcessor');

module.exports = (dependencies) => {
    const { gistManager, wsManager, apiClient } = dependencies;

    return async (req, res) => {
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
                <div id="liveStats" style="margin-top: 15px">
                    <div class="status-indicator">🔄 در حال بارگذاری...</div>
                </div>
                <button class="btn" onclick="loadLiveStats()">بروزرسانی آمار زنده</button>
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

            async function loadLiveStats() {
                try {
                    document.getElementById('liveStats').innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری...</div>';
                    
                    const [marketResponse, newsResponse, healthResponse] = await Promise.all([
                        fetch('/api/markets/cap'),
                        fetch('/api/dashboard/news?limit=3'),
                        fetch('/api/health')
                    ]);

                    const marketData = await marketResponse.json();
                    const newsData = await newsResponse.json();
                    const healthData = await healthResponse.json();

                    let statsHTML = '';
                    
                    if (marketData.success) {
                        const market = marketData.data;
                        statsHTML += \`
                            <div>💰 مارکت کپ: \${formatNumber(market.total_market_cap)}</div>
                            <div>📊 حجم معاملات: \${formatNumber(market.total_volume)}</div>
                            <div>₿ تسلط بیت‌کوین: \${market.btc_dominance || 'N/A'}%</div>
                        \`;
                    }

                    if (newsData.success) {
                        statsHTML += \`<div>📰 آخرین اخبار: \${newsData.data?.length || 0} مورد</div>\`;
                    }

                    if (healthData.success) {
                        const wsStatus = healthData.data.components?.websocket;
                        statsHTML += \`<div>🔗 WebSocket: \${wsStatus?.connected ? '🟢 متصل' : '🔴 قطع'}</div>\`;
                    }

                    document.getElementById('liveStats').innerHTML = statsHTML || '<div class="status-indicator warning">⚠️ هیچ داده‌ای یافت نشد</div>';
                    
                } catch (error) {
                    console.error('Error loading live stats:', error);
                    document.getElementById('liveStats').innerHTML = 
                        '<div class="status-indicator error">❌ خطا در بارگذاری آمار زنده</div>';
                }
            }

            // بارگذاری اولیه
            document.addEventListener('DOMContentLoaded', function() {
                loadSystemStats();
                loadLiveStats();
                
                // بروزرسانی خودکار هر 30 ثانیه
                setInterval(loadSystemStats, 30000);
                setInterval(loadLiveStats, 30000);
            });
        </script>`;

        res.send(generateModernPage("داشبورد اصلی", content, 'home'));
    };
};
