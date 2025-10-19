const { generateModernPage } = require('../page-generator');

module.exports = (dependencies) => {
    const { gistManager, wsManager, apiClient } = dependencies;

    return async (req, res) => {
        const content = `
        <div class="content-grid">
            <!-- بخش جدید: مجله خبری و ارزهای برتر -->
            <div class="content-card" style="grid-column: 1 / -1;">
                <div class="card-header">
                    <div class="card-icon">📰</div>
                    <h3>مجله بازار کریپتو</h3>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <!-- سمت چپ: جدیدترین خبر -->
                    <div>
                        <h4 style="margin-bottom: 15px;">📢 جدیدترین خبر</h4>
                        <div id="latestNews" style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; min-height: 120px;">
                            <div class="status-indicator">🔄 در حال دریافت آخرین اخبار...</div>
                        </div>
                    </div>
                    
                    <!-- سمت راست: سه ارز برتر بر اساس نوسان -->
                    <div>
                        <h4 style="margin-bottom: 15px;">🚀 ارزهای پرنوسان</h4>
                        <div id="topVolatileCoins" style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; min-height: 120px;">
                            <div class="status-indicator">🔄 در حال دریافت داده‌های بازار...</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- وضعیت سیستم (کوچک‌تر و پایین‌تر) -->
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">⚡</div>
                    <h3>وضعیت سیستم</h3>
                </div>
                <div id="systemStatus">
                    <div class="status-indicator">🔄 در حال بررسی...</div>
                </div>
                <button class="btn" onclick="loadSystemStatus()" style="margin-top: 10px; font-size: 0.8rem;">بروزرسانی</button>
            </div>

            <!-- آمار سریع -->
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📊</div>
                    <h3>آمار سریع</h3>
                </div>
                <div id="quickStats">
                    <div class="status-indicator">🔄 در حال دریافت...</div>
                </div>
                <button class="btn" onclick="loadQuickStats()" style="margin-top: 10px; font-size: 0.8rem;">بروزرسانی</button>
            </div>
        </div>

        <script>
        // توابع کمکی
        function formatNumber(num) {
            if (!num || isNaN(num)) return '0';
            const number = parseFloat(num);
            if (number >= 1000000000) return (number / 1000000000).toFixed(2) + 'B';
            if (number >= 1000000) return (number / 1000000).toFixed(2) + 'M';
            if (number >= 1000) return (number / 1000).toFixed(2) + 'K';
            return number.toLocaleString('en-US');
        }

        function formatPrice(price) {
            if (!price || isNaN(price)) return '$0.00';
            const num = parseFloat(price);
            if (num < 0.01) return '$' + num.toFixed(6);
            if (num < 1) return '$' + num.toFixed(4);
            return '$' + num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        function formatRelativeTime(timestamp) {
            if (!timestamp) return 'نامشخص';
            try {
                const now = new Date();
                const time = new Date(timestamp);
                const diffMs = now - time;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                
                if (diffMins < 1) return 'همین الان';
                if (diffMins < 60) return \\${diffMins} دقیقه پیش\;
                if (diffHours < 24) return \\${diffHours} ساعت پیش\;
                return time.toLocaleString('fa-IR');
            } catch (e) {
                return 'نامشخص';
            }
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
                    ❌ خطا در ارتباط
                    <div style="font-size: 0.7rem; margin-top: 5px; opacity: 0.7;">
                        \${error.message}
                    </div>
                </div>
            \`;
        }

        // توابع اصلی
        async function loadLatestNews() {
            try {
                const response = await fetch('/api/news/latest?limit=1');
                if (!response.ok) throw new Error('خطای شبکه');

                const data = await response.json();
                
                if (data.success && data.data && data.data.length > 0) {
                    const news = data.data[0];
                    const html = \`
                        <div style="line-height: 1.4;">
                            <strong style="font-size: 0.9rem;">\${news.title || 'بدون عنوان'}</strong>
                            <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 8px;">
                                \${news.description ? (news.description.length > 100 ? news.description.substring(0, 100) + '...' : news.description) : 'بدون توضیحات'}
                            </div>
                            <div style="font-size: 0.7rem; opacity: 0.6; margin-top: 8px;">
                                \${news.source || 'منبع نامشخص'} - \${formatRelativeTime(news.date || news.publishedAt)}
                            </div>
                        </div>
                    \`;
                    document.getElementById('latestNews').innerHTML = html;
                } else {
                    document.getElementById('latestNews').innerHTML = 
                        '<div class="status-indicator warning">📰 هیچ خبر جدیدی یافت نشد</div>';
                }
            } catch (error) {
                document.getElementById('latestNews').innerHTML = 
                    '<div class="status-indicator warning">📰 خطا در دریافت اخبار</div>';
            }
        }

        async function loadTopVolatileCoins() {
            try {
                const response = await fetch('/api/coins?limit=50');
                if (!response.ok) throw new Error('خطای شبکه');

                const data = await response.json();
                
                if (data.success && data.data) {
                    const coins = data.data.result || data.data;
                    // مرتب‌سازی بر اساس نوسان قیمت
                    const volatileCoins = coins
                        .filter(coin => coin.priceChange1d && Math.abs(coin.priceChange1d) > 2)
                        .sort((a, b) => Math.abs(b.priceChange1d) - Math.abs(a.priceChange1d))
                        .slice(0, 3);

                    if (volatileCoins.length > 0) {
                        let html = '';
                        volatileCoins.forEach(coin => {
                            const change = coin.priceChange1d || 0;
                            const changeClass = change >= 0 ? 'positive' : 'negative';
                            html += \`
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <div>
                                        <strong style="font-size: 0.8rem;">\${coin.symbol?.toUpperCase()}</strong>
                                        <div style="font-size: 0.7rem; opacity: 0.7;">\${formatPrice(coin.price)}</div>
                                    </div>
                                    <div class="coin-change \${changeClass}" style="font-size: 0.8rem;">
                                        \${change >= 0 ? '↗' : '↘'} \${Math.abs(change).toFixed(2)}%
                                    </div>
                                </div>
                            \`;
                        });
                        document.getElementById('topVolatileCoins').innerHTML = html;
                    } else {
                        document.getElementById('topVolatileCoins').innerHTML = 
                            '<div class="status-indicator warning">📊 نوسان قابل توجهی یافت نشد</div>';
                    }
                } else {
                    document.getElementById('topVolatileCoins').innerHTML = 
                        '<div class="status-indicator warning">📊 خطا در دریافت داده‌ها</div>';
                }
            } catch (error) {
                document.getElementById('topVolatileCoins').innerHTML = 
                    '<div class="status-indicator warning">📊 خطا در ارتباط</div>';
            }
        }

        async function loadSystemStatus() {
            setLoading('systemStatus', true);
            
            try {
                const response = await fetch('/api/health');
                if (!response.ok) throw new Error('خطای شبکه');

                const data = await response.json();
                
                if (data.success && data.data) {
                    const health = data.data;
                    const wsStatus = health.components?.websocket;
                    const apiStatus = health.components?.api;
                    
                    const html = \`
                        <div style="font-size: 0.8rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>WebSocket:</span>
                                <span class="\${wsStatus?.connected ? 'positive' : 'negative'}">\${wsStatus?.connected ? '🟢 متصل' : '🔴 قطع'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>API:</span>
                                <span class="\${apiStatus?.status === 'healthy' ? 'positive' : 'negative'}">\${apiStatus?.status === 'healthy' ? '🟢 سالم' : '🔴 مشکل'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>درخواست‌ها:</span>
                                <span>\${apiStatus?.request_count || 0}</span>
                            </div>
                        </div>
                    \`;
                    document.getElementById('systemStatus').innerHTML = html;
                }
            } catch (error) {
                handleApiError(error, 'systemStatus');
            } finally {
                setLoading('systemStatus', false);
            }
        }

        async function loadQuickStats() {
            setLoading('quickStats', true);
            
            try {
                const [marketResponse, statsResponse] = await Promise.all([
                    fetch('/api/markets/summary'),
                    fetch('/api/system/stats')
                ]);

                const marketData = await marketResponse.json();
                const statsData = await statsResponse.json();

                let html = '';

                if (marketData.success) {
                    const market = marketData.data;
                    html += \`
                        <div style="font-size: 0.8rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>مارکت کپ:</span>
                                <span>\${formatNumber(market.total_market_cap || market.totalMarketCap || 0)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>تسلط BTC:</span>
                                <span>\${market.btc_dominance || market.btcDominance || 0}%</span>
                            </div>
                        </div>
                    \`;
                }

                if (statsData.success) {
                    const stats = statsData.data;
                    html += \`
                        <div style="font-size: 0.8rem; margin-top: 10px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>آپتایم:</span>
                                <span>\${stats.system_info?.uptime ? Math.floor(stats.system_info.uptime / 60) + ' دقیقه' : 'N/A'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>حافظه:</span>
                                <span>\${stats.system_info?.memory_usage || 'N/A'}</span>
                            </div>
                        </div>
                    \`;
                }

                document.getElementById('quickStats').innerHTML = html || 
                    '<div class="status-indicator warning">⚠️ داده‌ای یافت نشد</div>';
            } catch (error) {
                handleApiError(error, 'quickStats');
            } finally {
                setLoading('quickStats', false);
            }
        }

        // بارگذاری اولیه
        document.addEventListener('DOMContentLoaded', function() {
            loadLatestNews();
            loadTopVolatileCoins();
            loadSystemStatus();
            loadQuickStats();

            // بروزرسانی خودکار هر 2 دقیقه
            setInterval(() => {
                loadLatestNews();
                loadTopVolatileCoins();
            }, 120000);
        });
        </script>`;

        res.send(generateModernPage("داشبورد اصلی", content, 'home'));
    };
};
