const { generateModernPage } = require('../page-generator');
const DataProcessor = require('../../models/DataProcessor');

module.exports = (dependencies) => {
    const { apiClient } = dependencies;
    
    return async (req, res) => {
        const content = `
        <div class="content-grid">
            <!-- کارت اصلی بازار -->
            <div class="content-card" style="grid-column: 1 / -1;">
                <div class="card-header">
                    <div class="card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3V21H21M7 16L10 8L13 12L17 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <h3>داده‌های بازار جهانی</h3>
                </div>

                <div style="display: flex; gap: 15px; flex-wrap: wrap; margin: 15px 0;">
                    <button class="btn" onclick="loadMarketData('all')">بازار کلی</button>
                    <button class="btn" onclick="loadMarketData('gainers')">برترین سودها</button>
                    <button class="btn" onclick="loadMarketData('losers')">برترین ضررها</button>
                    <button class="btn" onclick="loadMarketData('volume')">پر حجم‌ترین‌ها</button>
                    <button class="btn" onclick="loadGlobalData()">مارکت کپ جهانی</button>
                    <button class="btn" onclick="loadExchanges()">صرافی‌ها</button>
                </div>

                <!-- فیلترهای پیشرفته -->
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 10px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.8rem; opacity: 0.8;">مرتب‌سازی:</label>
                        <select id="sortBy" class="input-field" onchange="applyFilters()">
                            <option value="rank">رتبه</option>
                            <option value="price">قیمت</option>
                            <option value="change">تغییرات</option>
                            <option value="volume">حجم</option>
                            <option value="market_cap">مارکت کپ</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.8rem; opacity: 0.8;">ترتیب:</label>
                        <select id="sortOrder" class="input-field" onchange="applyFilters()">
                            <option value="desc">نزولی</option>
                            <option value="asc">صعودی</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.8rem; opacity: 0.8;">تعداد:</label>
                        <select id="resultsLimit" class="input-field" onchange="applyFilters()">
                            <option value="20">20</option>
                            <option value="50" selected>50</option>
                            <option value="100">100</option>
                            <option value="200">200</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.8rem; opacity: 0.8;">جستجو:</label>
                        <input type="text" id="searchCoin" class="input-field" placeholder="نام یا نماد ارز" onkeyup="applyFilters()" style="width: 150px;">
                    </div>
                </div>

                <div id="marketResult">
                    <div class="status-indicator">برای مشاهده داده‌ها، یکی از دکمه‌های بالا را انتخاب کنید</div>
                </div>
            </div>

            <!-- کارت داده‌های لحظه‌ای -->
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2L13 3M13 21L13 22M3 12H2M21 12H22M5.6 5.6L4.9 4.9M18.4 5.6L19.1 4.9M5.6 18.4L4.9 19.1M18.4 18.4L19.1 19.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <h3>داده‌های لحظه‌ای</h3>
                </div>

                <div id="realtimeData">
                    <div class="status-indicator">...در حال دریافت داده‌های زنده</div>
                </div>
                <button class="btn" onclick="loadRealtimeData()">بروزرسانی</button>
            </div>

            <!-- کارت وضعیت WebSocket -->
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M21 3L15 9M21 3L15 9M21 3V9M15 3L9 9M15 3V9M9 3L3 9M9 3V9M3 3V9M3 15L9 21M3 15H9M3 15V21M9 15L15 21M9 15H15M9 15V21M15 15L21 21M15 15H21M15 15V21M21 15V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <h3>وضعیت WebSocket</h3>
                </div>

                <div id="websocketStatus">
                    <div class="status-indicator">...در حال بررسی اتصال</div>
                </div>
                <button class="btn" onclick="checkWebSocketStatus()">بررسی وضعیت</button>
            </div>
        </div>

        <script>
        let currentMarketData = [];
        let currentView = 'all';

        async function loadMarketData(view = 'all') {
            currentView = view;
            setLoading('marketResult', true);
            
            try {
                let endpoint = '/api/coins';
                const params = new URLSearchParams({
                    limit: document.getElementById('resultsLimit').value || '50'
                });

                if (view === 'gainers') {
                    params.append('sort', 'priceChange1d');
                    params.append('order', 'desc');
                } else if (view === 'losers') {
                    params.append('sort', 'priceChange1d');
                    params.append('order', 'asc');
                } else if (view === 'volume') {
                    params.append('sort', 'volume');
                    params.append('order', 'desc');
                }

                const response = await fetch(\`\${endpoint}?\${params}\`);
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                
                if (data.success && data.data) {
                    currentMarketData = data.data;
                    applyFilters();
                } else {
                    throw new Error(data.error || 'خطا در دریافت داده‌های بازار');
                }
            } catch (error) {
                handleApiError(error, 'marketResult');
            } finally {
                setLoading('marketResult', false);
            }
        }

        function applyFilters() {
            if (currentMarketData.length === 0) return;

            let filteredData = [...currentMarketData];
            const searchTerm = document.getElementById('searchCoin').value.toLowerCase();
            const sortBy = document.getElementById('sortBy').value;
            const sortOrder = document.getElementById('sortOrder').value;

            // فیلتر جستجو
            if (searchTerm) {
                filteredData = filteredData.filter(coin => 
                    coin.name.toLowerCase().includes(searchTerm) || 
                    coin.symbol.toLowerCase().includes(searchTerm)
                );
            }

            // مرتب‌سازی
            filteredData.sort((a, b) => {
                let aValue, bValue;

                switch (sortBy) {
                    case 'price':
                        aValue = a.price || a.current_price || 0;
                        bValue = b.price || b.current_price || 0;
                        break;
                    case 'change':
                        aValue = a.priceChange1d || a.priceChange24h || 0;
                        bValue = b.priceChange1d || b.priceChange24h || 0;
                        break;
                    case 'volume':
                        aValue = a.volume || a.total_volume || 0;
                        bValue = b.volume || b.total_volume || 0;
                        break;
                    case 'market_cap':
                        aValue = a.marketCap || a.market_cap || 0;
                        bValue = b.marketCap || b.market_cap || 0;
                        break;
                    default: // rank
                        aValue = a.rank || 9999;
                        bValue = b.rank || 9999;
                }

                if (sortOrder === 'desc') {
                    return bValue - aValue;
                } else {
                    return aValue - bValue;
                }
            });

            displayMarketData(filteredData, currentView);
        }

        function displayMarketData(coins, view) {
            if (!coins || coins.length === 0) {
                document.getElementById('marketResult').innerHTML = 
                    '<div class="status-indicator warning">هیچ داده‌ای یافت نشد</div>';
                return;
            }

            const viewTitles = {
                'all': 'بازار کلی',
                'gainers': 'برترین سودها',
                'losers': 'برترین ضررها',
                'volume': 'پر حجم‌ترین‌ها'
            };

            let html = \`
                <div class="status-indicator">
                    \${viewTitles[view] || 'داده‌های بازار'} - \${coins.length} ارز
                </div>
                <div class="market-list">
            \`;

            coins.forEach((coin, index) => {
                const change = coin.priceChange1d || coin.priceChange24h || 0;
                const changeClass = change >= 0 ? 'positive' : 'negative';
                const price = coin.price || coin.current_price || 0;
                const volume = coin.volume || coin.total_volume || 0;
                const marketCap = coin.marketCap || coin.market_cap || 0;

                html += \`
                    <div class="market-item" onclick="showCoinDetails('\${coin.id || coin.symbol}')" style="cursor: pointer;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 0.8rem; opacity: 0.6; min-width: 25px;">#\${coin.rank || index + 1}</span>
                            \${coin.icon ? \`
                                <img src="\${coin.icon}" alt="\${coin.name}" 
                                     style="width: 32px; height: 32px; border-radius: 50%;">
                            \` : ''}
                            <div class="coin-info">
                                <strong>\${coin.name || 'نامشخص'}</strong>
                                <span class="coin-symbol">\${coin.symbol ? coin.symbol.toUpperCase() : ''}</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="text-align: left;">
                                <div style="font-weight: bold;">\${formatPrice(price)}</div>
                                <div style="font-size: 0.7rem; opacity: 0.6;">
                                    حجم: \${formatNumber(volume)}
                                </div>
                            </div>
                            <div class="coin-change \${changeClass}">
                                \${change >= 0 ? '↗' : '↘'}\${Math.abs(change).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                \`;
            });

            html += \`
                </div>
                <div style="margin-top: 15px; font-size: 0.8rem; opacity: 0.7; text-align: center;">
                    آخرین بروزرسانی: \${new Date().toLocaleString('fa-IR')}
                </div>
            \`;

            document.getElementById('marketResult').innerHTML = html;
        }

        async function loadGlobalData() {
            setLoading('marketResult', true);
            
            try {
                const response = await fetch('/api/markets/summary');
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                
                if (data.success && data.data) {
                    displayGlobalData(data.data);
                } else {
                    throw new Error(data.error || 'خطا در دریافت داده‌های جهانی');
                }
            } catch (error) {
                handleApiError(error, 'marketResult');
            } finally {
                setLoading('marketResult', false);
            }
        }

        function displayGlobalData(globalData) {
            const html = \`
                <div class="status-indicator">📊 مارکت کپ جهانی</div>
                <div class="metric-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); margin: 20px 0;">
                    <div class="metric-card">
                        <div class="metric-value">\${formatNumber(globalData.total_market_cap)}</div>
                        <div class="metric-label">مارکت کپ کل</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${formatNumber(globalData.total_volume)}</div>
                        <div class="metric-label">حجم معاملات</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${globalData.btc_dominance || 0}%</div>
                        <div class="metric-label">تسلط بیت‌کوین</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${globalData.active_cryptocurrencies || 0}</div>
                        <div class="metric-label">ارزهای فعال</div>
                    </div>
                </div>
                \${globalData.market_cap_change_percentage_24h_usd ? \`
                    <div class="status-indicator \${globalData.market_cap_change_percentage_24h_usd >= 0 ? 'positive' : 'negative'}">
                        تغییر 24h: \${globalData.market_cap_change_percentage_24h_usd.toFixed(2)}%
                    </div>
                \` : ''}
            \`;

            document.getElementById('marketResult').innerHTML = html;
        }

        async function loadExchanges() {
            setLoading('marketResult', true);
            
            try {
                const response = await fetch('/api/markets/exchanges');
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                
                if (data.success && data.data) {
                    displayExchanges(data.data);
                } else {
                    throw new Error(data.error || 'خطا در دریافت داده‌های صرافی‌ها');
                }
            } catch (error) {
                handleApiError(error, 'marketResult');
            } finally {
                setLoading('marketResult', false);
            }
        }

        function displayExchanges(exchanges) {
            let html = \`
                <div class="status-indicator">🏦 صرافی‌های برتر</div>
                <div class="market-list">
            \`;

            exchanges.slice(0, 20).forEach((exchange, index) => {
                html += \`
                    <div class="market-item">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 0.8rem; opacity: 0.6; min-width: 25px;">#\${index + 1}</span>
                            <div class="coin-info">
                                <strong>\${exchange.name || 'نامشخص'}</strong>
                                <span class="coin-symbol">\${exchange.country || 'بین‌المللی'}</span>
                            </div>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold;">\${formatNumber(exchange.trade_volume_24h_btc || 0)} BTC</div>
                            <div style="font-size: 0.7rem; opacity: 0.6;">
                                حجم 24h
                            </div>
                        </div>
                    </div>
                \`;
            });

            html += '</div>';
            document.getElementById('marketResult').innerHTML = html;
        }

        async function loadRealtimeData() {
            setLoading('realtimeData', true);
            
            try {
                const [marketResponse, fearGreedResponse] = await Promise.all([
                    fetch('/api/markets/summary'),
                    fetch('/api/insights/fear-greed')
                ]);

                const marketData = await marketResponse.json();
                const fearGreedData = await fearGreedResponse.json();

                let realtimeHTML = '';

                if (marketData.success) {
                    const market = marketData.data;
                    realtimeHTML += \`
                        <div style="margin-bottom: 15px;">
                            <div class="metric-grid">
                                <div class="metric-card">
                                    <div class="metric-value">\${formatNumber(market.total_market_cap)}</div>
                                    <div class="metric-label">مارکت کپ</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">\${market.btc_dominance || 0}%</div>
                                    <div class="metric-label">تسلط BTC</div>
                                </div>
                            </div>
                        </div>
                    \`;
                }

                if (fearGreedData.success) {
                    const fg = fearGreedData.data;
                    const status = getFearGreedStatus(fg.value || fg.score);
                    realtimeHTML += \`
                        <div class="status-indicator" style="border-color: \${status.color}; color: \${status.color};">
                            \${status.emoji} شاخص ترس و طمع: \${status.status} (\${fg.value || fg.score})
                        </div>
                    \`;
                }

                document.getElementById('realtimeData').innerHTML = realtimeHTML || 
                    '<div class="status-indicator warning">داده‌ای در دسترس نیست</div>';

            } catch (error) {
                handleApiError(error, 'realtimeData');
            } finally {
                setLoading('realtimeData', false);
            }
        }

        async function checkWebSocketStatus() {
            setLoading('websocketStatus', true);
            
            try {
                const response = await fetch('/api/websocket/status');
                if (!response.ok) throw new Error('خطای شبکه');

                const data = await response.json();
                
                if (data.success && data.data) {
                    const ws = data.data;
                    const statusHTML = \`
                        <div class="status-indicator \${ws.connected ? 'success' : 'error'}">
                            \${ws.connected ? '✅ متصل' : '❌ قطع'}
                        </div>
                        <div style="margin-top: 10px; font-size: 0.8rem;">
                            <div>ارزهای فعال: \${ws.active_coins || 0}</div>
                            <div>اتصالات: \${ws.connections || 0}</div>
                            \${ws.last_update ? \`
                                <div>آخرین بروزرسانی: \${formatRelativeTime(ws.last_update)}</div>
                            \` : ''}
                        </div>
                    \`;
                    document.getElementById('websocketStatus').innerHTML = statusHTML;
                }
            } catch (error) {
                handleApiError(error, 'websocketStatus');
            } finally {
                setLoading('websocketStatus', false);
            }
        }

        function showCoinDetails(coinId) {
            window.open(\`/analysis-page?symbol=\${coinId}\`, '_blank');
        }

        // بارگذاری اولیه
        document.addEventListener('DOMContentLoaded', function() {
            loadMarketData('all');
            loadRealtimeData();
            checkWebSocketStatus();

            // بروزرسانی خودکار هر 30 ثانیه
            setInterval(() => {
                loadRealtimeData();
            }, 30000);
        });
        </script>`;

        res.send(generateModernPage("بازار سرمایه", content, 'market'));
    };
};
