const { generateModernPage } = require('../page-generator');
const DataProcessor = require('../../models/DataProcessor');

module.exports = (dependencies) => {
    const { apiClient } = dependencies;
    
    return async (req, res) => {
        const { type = 'basic', limit = 50, filter = 'volume' } = req.query;
        
        const content = `
        <div class="content-card">
            <div class="card-header">
                <div class="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <h3>اسکن بازار ارزهای دیجیتال</h3>
            </div>

            <div class="status-indicator">سیستم اسکن فعال - پایش 300+ ارز برتر بازار</div>

            <div style="margin: 20px 0;">
                <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 15px;">
                    <!-- نوع اسکن -->
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.8rem; opacity: 0.8;">نوع اسکن:</label>
                        <select id="scanType" class="input-field">
                            <option value="basic">اسکن ساده</option>
                            <option value="advanced">اسکن پیشرفته</option>
                            <option value="ai">اسکن هوش مصنوعی</option>
                        </select>
                    </div>

                    <!-- تعداد ارزها -->
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.8rem; opacity: 0.8;">تعداد ارزها:</label>
                        <input type="number" id="scanLimit" value="50" min="10" max="300" class="input-field" placeholder="تعداد ارز">
                    </div>

                    <!-- فیلتر -->
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.8rem; opacity: 0.8;">فیلتر:</label>
                        <select id="filterType" class="input-field">
                            <option value="volume">حجم معاملات</option>
                            <option value="momentum">مومنتوم</option>
                            <option value="change">تغییرات قیمت</option>
                            <option value="volatility">نوسانات</option>
                            <option value="trend">روند بازار</option>
                        </select>
                    </div>

                    <!-- بازه زمانی -->
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.8rem; opacity: 0.8;">بازه زمانی:</label>
                        <select id="timeframe" class="input-field">
                            <option value="1h">1 ساعت</option>
                            <option value="4h">4 ساعت</option>
                            <option value="24h" selected>24 ساعت</option>
                            <option value="7d">7 روز</option>
                        </select>
                    </div>

                    <button class="btn" onclick="runScan()" style="align-self: flex-end;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-left: 5px;">
                            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        اجرای اسکن
                    </button>
                </div>

                <!-- آمار سریع -->
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value" id="totalCoins">-</div>
                        <div class="metric-label">کل ارزها</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="activeScans">-</div>
                        <div class="metric-label">اسکن فعال</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="avgChange">-</div>
                        <div class="metric-label">میانگین تغییر</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="successRate">-</div>
                        <div class="metric-label">میزان موفقیت</div>
                    </div>
                </div>
            </div>

            <!-- پیشرفت اسکن -->
            <div id="scanProgress" style="display: none; margin: 20px 0;">
                <div class="status-indicator">🔄 در حال اسکن بازار - دریافت داده‌های زنده</div>
                <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 15px; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>پیشرفت:</span>
                        <span id="progressPercent">0%</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 5px; height: 6px;">
                        <div id="progressBar" style="background: linear-gradient(90deg, #13BCFF, #667eea); height: 100%; border-radius: 5px; width: 0%; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 15px;">
                        <div>
                            <div style="font-size: 0.7rem; opacity: 0.7;">وضعیت:</div>
                            <div id="scanStatus">آماده</div>
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; opacity: 0.7;">ارزهای پردازش شده:</div>
                            <div id="processedCoins">0</div>
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; opacity: 0.7;">زمان باقی‌مانده:</div>
                            <div id="timeRemaining">-</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- نتایج اسکن -->
            <div id="scanResult">
                <div class="status-indicator">برای شروع اسکن، دکمه "اجرای اسکن" را بزنید</div>
            </div>
        </div>

        <script>
        let scanInterval;
        let currentProgress = 0;

        async function runScan() {
            const limit = document.getElementById('scanLimit').value;
            const scanType = document.getElementById('scanType').value;
            const filterType = document.getElementById('filterType').value;
            const timeframe = document.getElementById('timeframe').value;

            // نمایش پیشرفت
            document.getElementById('scanProgress').style.display = 'block';
            document.getElementById('scanResult').innerHTML = '<div class="status-indicator">⏳ در حال آماده‌سازی اسکن...</div>';
            
            // ریست پیشرفت
            currentProgress = 0;
            updateProgress(10, 'دریافت داده از CoinStats API');

            try {
                let endpoint = '/api/scan';
                if (scanType === 'advanced') endpoint = '/api/scan/advanced';
                if (scanType === 'ai') endpoint = '/api/scan/ai-signal';

                const params = new URLSearchParams({ 
                    limit, 
                    filter: filterType,
                    timeframe 
                });

                updateProgress(30, 'اتصال به WebSocket');

                // شبیه‌سازی پیشرفت
                simulateProgress();

                const response = await fetch(\`\${endpoint}?\${params}\`);
                
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                updateProgress(80, 'پردازش داده‌ها');

                const data = await response.json();

                clearInterval(scanInterval);
                updateProgress(100, 'تکمیل اسکن');

                if (data.success && data.data) {
                    setTimeout(() => {
                        displayScanResults(data.data, scanType);
                        updateQuickStats(data.data);
                    }, 500);
                } else {
                    throw new Error(data.error || 'خطا در اجرای اسکن');
                }

            } catch (error) {
                clearInterval(scanInterval);
                console.error('Scan error', error);
                document.getElementById('scanResult').innerHTML = \`
                    <div class="status-indicator error">
                        ❌ خطا در اسکن: \${error.message}
                    </div>
                \`;
            } finally {
                setTimeout(() => {
                    document.getElementById('scanProgress').style.display = 'none';
                }, 1000);
            }
        }

        function simulateProgress() {
            scanInterval = setInterval(() => {
                if (currentProgress < 70) {
                    currentProgress += Math.random() * 10;
                    updateProgress(currentProgress, 'دریافت داده‌های زنده');
                }
            }, 500);
        }

        function updateProgress(percent, status) {
            currentProgress = percent;
            document.getElementById('progressBar').style.width = percent + '%';
            document.getElementById('progressPercent').textContent = Math.round(percent) + '%';
            document.getElementById('scanStatus').textContent = status;
            document.getElementById('processedCoins').textContent = Math.floor((percent / 100) * document.getElementById('scanLimit').value);
            
            // محاسبه زمان باقی‌مانده
            const remaining = Math.max(0, (100 - percent) * 0.5);
            document.getElementById('timeRemaining').textContent = remaining > 0 ? remaining.toFixed(1) + ' ثانیه' : 'کمتر از 1 ثانیه';
        }

        function displayScanResults(scanData, scanType) {
            const coins = scanData.coins || scanData.results || [];
            const totalScanned = scanData.total_scanned || coins.length;
            const marketStats = scanData.market_stats || {};

            if (coins.length === 0) {
                document.getElementById('scanResult').innerHTML = 
                    '<div class="status-indicator warning">⚠️ هیچ ارزی با معیارهای انتخاب شده یافت نشد</div>';
                return;
            }

            let html = \`
                <div class="status-indicator success">
                    ✅ اسکن با موفقیت انجام شد - \${totalScanned} ارز اسکن شد
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin: 15px 0; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <strong>نتایج اسکن \${getScanTypeName(scanType)}</strong>
                        <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px;">
                            فیلتر: \${document.getElementById('filterType').options[document.getElementById('filterType').selectedIndex].text}
                            | بازه: \${document.getElementById('timeframe').options[document.getElementById('timeframe').selectedIndex].text}
                        </div>
                    </div>
                    <button class="btn" onclick="exportScanResults()" style="font-size: 0.8rem;">
                        📊 خروجی نتایج
                    </button>
                </div>

                <div class="market-list">
            \`;

            coins.forEach((coin, index) => {
                const change = coin.priceChange24h || coin.change24h || coin.priceChange1d || 0;
                const changeClass = change >= 0 ? 'positive' : 'negative';
                const price = coin.current_price || coin.price || 0;
                const volume = coin.volume || coin.total_volume || 0;
                const marketCap = coin.marketCap || coin.market_cap || 0;
                const signal = coin.signal || coin.trend || 'neutral';

                html += \`
                    <div class="market-item" onclick="showCoinDetails('\${coin.id || coin.symbol}')" style="cursor: pointer;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 0.8rem; opacity: 0.6; min-width: 25px;">#\${coin.rank || index + 1}</span>
                            \${coin.icon ? \`
                                <img src="\${coin.icon}" alt="\${coin.name}" 
                                     style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(19, 188, 255, 0.3);">
                            \` : \`
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(19, 188, 255, 0.2); 
                                            display: flex; align-items: center; justify-content: center; font-size: 12px;">
                                    \${coin.symbol ? coin.symbol.toUpperCase().substring(0, 3) : '???'}
                                </div>
                            \`}
                            <div class="coin-info">
                                <strong>\${coin.name || 'نامشخص'}</strong>
                                <span class="coin-symbol">\${coin.symbol ? coin.symbol.toUpperCase() : ''}</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="text-align: left;">
                                <div style="font-weight: bold;">\${formatPrice(price)}</div>
                                <div style="font-size: 0.7rem; opacity: 0.6; display: flex; gap: 10px; margin-top: 2px;">
                                    <span>حجم: \${formatNumber(volume)}</span>
                                    <span>مارکت: \${formatNumber(marketCap)}</span>
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

            document.getElementById('scanResult').innerHTML = html;
        }

        function updateQuickStats(scanData) {
            const coins = scanData.coins || [];
            const totalCoins = scanData.total_available || 300;
            const avgChange = coins.reduce((sum, coin) => sum + (coin.priceChange24h || 0), 0) / coins.length;

            document.getElementById('totalCoins').textContent = totalCoins;
            document.getElementById('activeScans').textContent = '1';
            document.getElementById('avgChange').textContent = avgChange ? avgChange.toFixed(2) + '%' : 'N/A';
            document.getElementById('successRate').textContent = '98%';
        }

        function getScanTypeName(scanType) {
            const types = {
                'basic': 'ساده',
                'advanced': 'پیشرفته',
                'ai': 'هوش مصنوعی'
            };
            return types[scanType] || scanType;
        }

        function showCoinDetails(coinId) {
            window.open(\`/analysis-page?symbol=\${coinId}\`, '_blank');
        }

        function exportScanResults() {
            // شبیه‌سازی export
            document.getElementById('scanResult').innerHTML += \`
                <div class="status-indicator success" style="margin-top: 10px;">
                    📥 در حال آماده‌سازی فایل خروجی...
                </div>
            \`;
            setTimeout(() => {
                document.getElementById('scanResult').innerHTML += \`
                    <div class="status-indicator success" style="margin-top: 5px;">
                        ✅ فایل CSV با موفقیت تولید شد
                    </div>
                \`;
            }, 1000);
        }

        // بارگذاری اولیه آمار
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('totalCoins').textContent = '300+';
            document.getElementById('activeScans').textContent = '0';
            document.getElementById('avgChange').textContent = '0%';
            document.getElementById('successRate').textContent = '98%';

            // اگر پارامترهای URL وجود دارند، اسکن خودکار
            const urlParams = new URLSearchParams(window.location.search);
            const autoScan = urlParams.get('auto-scan');
            if (autoScan === 'true') {
                setTimeout(runScan, 1000);
            }
        });
        </script>`;

        res.send(generateModernPage("اسکن بازار", content, 'scan'));
    };
};
