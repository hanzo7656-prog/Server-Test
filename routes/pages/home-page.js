const { generateModernPage } = require('../page-generator');

module.exports = (dependencies) => {
    const { gistManager, wsManager, apiClient } = dependencies;

    return async (req, res) => {
        const content = `
        <div class="content-grid">
            <!-- بخش اصلی: اخبار و ارزهای برتر -->
            <div class="content-card" style="grid-column: 1 / -1;">
                <div class="card-header">
                    <div class="card-icon">📰</div>
                    <h3>مجله بازار کریپتو</h3>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <!-- سمت چپ: اخبار ترند -->
                    <div>
                        <h4 style="margin-bottom: 15px;">🔥 اخبار ترند</h4>
                        <div id="trendingNews" style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; min-height: 200px;">
                            <div class="status-indicator">🔄 در حال دریافت اخبار...</div>
                        </div>
                    </div>
                    
                    <!-- سمت راست: ارزهای برتر -->
                    <div>
                        <h4 style="margin-bottom: 15px;">⭐ ارزهای برتر</h4>
                        <div id="topCoins" style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; min-height: 200px;">
                            <div class="status-indicator">🔄 در حال دریافت داده‌ها...</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- بخش آمار زنده -->
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📊</div>
                    <h3>آمار زنده</h3>
                </div>
                <div id="liveStats">
                    <div class="status-indicator">🔄 در حال دریافت...</div>
                </div>
                <button class="btn" onclick="loadLiveStats()" style="margin-top: 10px; font-size: 0.8rem;">بروزرسانی</button>
            </div>

            <!-- وضعیت سیستم (کوچک‌تر) -->
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
        </div>

        <script>
        // توابع کمکی
        function formatNumber(num) {
            if (num === null || num === undefined || isNaN(num)) return '0';
            const number = parseFloat(num);
            if (number >= 1000000000) return (number / 1000000000).toFixed(2) + 'B';
            if (number >= 1000000) return (number / 1000000).toFixed(2) + 'M';
            if (number >= 1000) return (number / 1000).toFixed(2) + 'K';
            return number.toLocaleString('en-US');
        }

        function formatPrice(price) {
            if (price === null || price === undefined || isNaN(price)) return '$0.00';
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
                if (diffMins < 60) return diffMins + ' دقیقه پیش';
                if (diffHours < 24) return diffHours + ' ساعت پیش';
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
        async function loadTrendingNews() {
            try {
                const response = await fetch('/api/news/trending?limit=2');
                if (!response.ok) throw new Error('خطای شبکه');

                const data = await response.json();
                
                if (data.success && data.data && data.data.length > 0) {
                    let html = '';
                    data.data.forEach((news, index) => {
                        html += \`
                            <div style="margin-bottom: \${index === data.data.length - 1 ? '0' : '15px'}; padding-bottom: \${index === data.data.length - 1 ? '0' : '15px'}; border-bottom: \${index === data.data.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.1)'};">
                                <strong style="font-size: 0.9rem; display: block; margin-bottom: 5px;">
                                    \${news.title || 'بدون عنوان'}
                                </strong>
                                <div style="font-size: 0.8rem; opacity: 0.8; margin-bottom: 5px;">
                                    \${news.description ? (news.description.length > 80 ? news.description.substring(0, 80) + '...' : news.description) : 'بدون توضیحات'}
                                </div>
                                <div style="font-size: 0.7rem; opacity: 0.6;">
                                    \${news.source || 'منبع نامشخص'} - \${formatRelativeTime(news.date || news.publishedAt)}
                                </div>
                            </div>
                        \`;
                    });
                    document.getElementById('trendingNews').innerHTML = html;
                } else {
                    document.getElementById('trendingNews').innerHTML = 
                        '<div class="status-indicator warning">📰 هیچ خبر ترندی یافت نشد</div>';
                }
            } catch (error) {
                document.getElementById('trendingNews').innerHTML = 
                    '<div class="status-indicator error">📰 خطا در دریافت اخبار</div>';
            }
        }

        async function loadTopCoins() {
            try {
                // ارزهای برتر: BTC, ETH, XRP, BNB, AVAX
                const topCoinSymbols = ['bitcoin', 'ethereum', 'ripple', 'binancecoin', 'avalanche'];
                let coinsData = [];

                // دریافت اطلاعات هر ارز
                for (const symbol of topCoinSymbols) {
                    try {
                        const response = await fetch(\`/api/coins/\${symbol}/details\`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.success && data.data) {
                                coinsData.push(data.data);
                            }
                        }
                    } catch (error) {
                        console.warn('Error fetching', symbol, error);
                    }
                }

                // اگر اطلاعات مستقیم دریافت نشد، از لیست کلی استفاده کن
                if (coinsData.length === 0) {
                    const response = await fetch('/api/coins?limit=10');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.data) {
                            const allCoins = data.data.result || data.data;
                            coinsData = allCoins.filter(coin => 
                                topCoinSymbols.includes(coin.id?.toLowerCase()) || 
                                topCoinSymbols.includes(coin.symbol?.toLowerCase())
                            ).slice(0, 5);
                        }
                    }
                }

                if (coinsData.length > 0) {
                    let html = '';
                    coinsData.forEach((coin, index) => {
                        const change = coin.priceChange1d || coin.priceChange24h || coin.price_change_percentage_24h || 0;
                        const changeClass = change >= 0 ? 'positive' : 'negative';
                        const price = coin.price || coin.current_price || 0;
                        const symbol = coin.symbol ? coin.symbol.toUpperCase() : 'N/A';
                        const name = coin.name || 'نامشخص';

                        html += \`
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: \${index === coinsData.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.1)'};">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    \${coin.icon ? \`
                                        <img src="\${coin.icon}" alt="\${name}" style="width: 24px; height: 24px; border-radius: 50%;">
                                    \` : \`
                                        <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 0.6rem;">
                                            \${symbol.substring(0, 3)}
                                        </div>
                                    \`}
                                    <div>
                                        <strong style="font-size: 0.8rem; display: block;">\${symbol}</strong>
                                        <div style="font-size: 0.7rem; opacity: 0.7;">\${name}</div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: bold; font-size: 0.8rem;">\${formatPrice(price)}</div>
                                    <div class="coin-change \${changeClass}" style="font-size: 0.7rem;">
                                        \${change >= 0 ? '↗' : '↘'} \${Math.abs(change).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        \`;
                    });
                    document.getElementById('topCoins').innerHTML = html;
                } else {
                    document.getElementById('topCoins').innerHTML = 
                        '<div class="status-indicator warning">⭐ اطلاعات ارزها در دسترس نیست</div>';
                }
            } catch (error) {
                document.getElementById('topCoins').innerHTML = 
                    '<div class="status-indicator error">⭐ خطا در دریافت داده‌ها</div>';
            }
        }

        async function loadLiveStats() {
            setLoading('liveStats', true);
            
            try {
                const [marketResponse, fearGreedResponse] = await Promise.all([
                    fetch('/api/markets/summary'),
                    fetch('/api/insights/fear-greed')
                ]);

                const marketData = await marketResponse.json();
                const fearGreedData = await fearGreedResponse.json();

                let html = '';

                if (marketData.success && marketData.data) {
                    const market = marketData.data;
                    const totalMarketCap = market.totalMarketCap || market.total_market_cap || market.market_cap || 0;
                    const totalVolume = market.totalVolume || market.total_volume || market.volume_24h || 0;
                    const btcDominance = market.btcDominance || market.btc_dominance || 0;

                    html += \`
                        <div style="font-size: 0.8rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>مارکت کپ کل:</span>
                                <span style="font-weight: bold;">\${formatNumber(totalMarketCap)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>حجم 24h:</span>
                                <span>\${formatNumber(totalVolume)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>تسلط بیت‌کوین:</span>
                                <span>\${btcDominance ? btcDominance.toFixed(1) + '%' : 'N/A'}</span>
                            </div>
                    \`;
                }

                if (fearGreedData.success && fearGreedData.data) {
                    const fg = fearGreedData.data;
                    const score = fg.value || fg.score || 0;
                    const status = getFearGreedStatus(score);
                    html += \`
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                                <span>شاخص ترس و طمع:</span>
                                <span style="color: \${status.color}; font-weight: bold;">\${status.emoji} \${score}</span>
                            </div>
                    \`;
                }

                html += '</div>';
                document.getElementById('liveStats').innerHTML = html;

            } catch (error) {
                handleApiError(error, 'liveStats');
            } finally {
                setLoading('liveStats', false);
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
                    const dbStatus = health.components?.database;
                    
                    const html = \`
                        <div style="font-size: 0.8rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>WebSocket:</span>
                                <span class="\${wsStatus?.connected ? 'positive' : 'negative'}">\${wsStatus?.connected ? '🟢 متصل' : '🔴 قطع'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>API:</span>
                                <span class="\${apiStatus?.status === 'healthy' ? 'positive' : 'negative'}">\${apiStatus?.status === 'healthy' ? '🟢 سالم' : '🟡 مشکل'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>دیتابیس:</span>
                                <span class="\${dbStatus?.status === 'healthy' ? 'positive' : 'negative'}">\${dbStatus?.status === 'healthy' ? '🟢 فعال' : '🔴 خطا'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.7rem; opacity: 0.8; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                                <span>آخرین بروزرسانی:</span>
                                <span>\${new Date().toLocaleTimeString('fa-IR')}</span>
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

        // تابع کمکی برای وضعیت شاخص ترس و طمع
        function getFearGreedStatus(score) {
            if (score >= 80) return { emoji: '😱', status: 'ترس شدید', color: '#ff4444' };
            if (score >= 60) return { emoji: '😨', status: 'ترس', color: '#ff8844' };
            if (score >= 40) return { emoji: '😐', status: 'خنثی', color: '#ffcc44' };
            if (score >= 20) return { emoji: '😊', status: 'طمع', color: '#88cc44' };
            return { emoji: '🤩', status: 'طمع شدید', color: '#44cc44' };
        }

        // بارگذاری اولیه
        document.addEventListener('DOMContentLoaded', function() {
            loadTrendingNews();
            loadTopCoins();
            loadLiveStats();
            loadSystemStatus();

            // بروزرسانی خودکار
            setInterval(() => {
                loadTrendingNews();
                loadTopCoins();
                loadLiveStats();
            }, 60000); // هر 1 دقیقه

            setInterval(() => {
                loadSystemStatus();
            }, 30000); // هر 30 ثانیه
        });
        </script>`;

        res.send(generateModernPage("داشبورد اصلی", content, 'home'));
    };
};
