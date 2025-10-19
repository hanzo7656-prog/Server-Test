const { generateModernPage } = require('../page-generator');
const DataProcessor = require('../../models/DataProcessor');

module.exports = (dependencies) => {
    const { apiClient } = dependencies;
    
    return async (req, res) => {
        const content = `
        <div class="content-grid">
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">🔮</div>
                    <h3>پیش‌بینی بازار</h3>
                </div>
                <button class="btn" onclick="loadDashboard()">بارگذاری دشبورد</button>
                <div id="insightsResult">
                    <div class="status-indicator">آماده بارگذاری</div>
                </div>
            </div>

            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">😨</div>
                    <h3>شاخص ترس و طمع</h3>
                </div>
                <div id="fearGreedResult">
                    <div class="status-indicator">...در حال دریافت</div>
                </div>
                <button class="btn" onclick="loadFearGreed()">بروزرسانی</button>
            </div>

            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">₿</div>
                    <h3>تسلط بیت‌کوین</h3>
                </div>
                <div id="btcDominanceResult">
                    <div class="status-indicator">...در حال دریافت</div>
                </div>
                <button class="btn" onclick="loadBTCDominance()">بروزرسانی</button>
            </div>

            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">🌈</div>
                    <h3>چارت رنگین‌کمان</h3>
                </div>
                <div id="rainbowChartResult">
                    <div class="status-indicator">...در حال دریافت</div>
                </div>
                <button class="btn" onclick="loadRainbowChart()">بارگذاری</button>
            </div>
        </div>

        <script>
        async function loadDashboard() {
            setLoading('insightsResult', true);
            
            try {
                const response = await fetch('/api/insights/dashboard');
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                
                if (data.success && data.data) {
                    displayDashboard(data.data);
                } else {
                    throw new Error(data.error || 'خطا در دریافت دشبورد');
                }
            } catch (error) {
                handleApiError(error, 'insightsResult');
            } finally {
                setLoading('insightsResult', false);
            }
        }

        async function loadFearGreed() {
            setLoading('fearGreedResult', true);
            
            try {
                const response = await fetch('/api/insights/fear-greed');
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                
                if (data.success && data.data) {
                    displayFearGreed(data.data);
                } else {
                    throw new Error(data.error || 'خطا در دریافت شاخص ترس و طمع');
                }
            } catch (error) {
                handleApiError(error, 'fearGreedResult');
            } finally {
                setLoading('fearGreedResult', false);
            }
        }

        async function loadBTCDominance() {
            setLoading('btcDominanceResult', true);
            
            try {
                const response = await fetch('/api/insights/btc-dominance');
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                
                if (data.success && data.data) {
                    displayBTCDominance(data.data);
                } else {
                    throw new Error(data.error || 'خطا در دریافت تسلط بیت‌کوین');
                }
            } catch (error) {
                handleApiError(error, 'btcDominanceResult');
            } finally {
                setLoading('btcDominanceResult', false);
            }
        }

        async function loadRainbowChart() {
            setLoading('rainbowChartResult', true);
            
            try {
                const response = await fetch('/api/insights/rainbow-chart');
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                
                if (data.success && data.data) {
                    displayRainbowChart(data.data);
                } else {
                    throw new Error(data.error || 'خطا در دریافت چارت رنگین‌کمان');
                }
            } catch (error) {
                handleApiError(error, 'rainbowChartResult');
            } finally {
                setLoading('rainbowChartResult', false);
            }
        }

        function displayDashboard(dashboardData) {
            const html = \`
                <div class="status-indicator">✅ دشبورد پیش‌بینی بازار</div>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value">\${dashboardData.totalCoins || 0}</div>
                        <div class="metric-label">تعداد ارزها</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${formatNumber(dashboardData.totalMarketCap || 0)}</div>
                        <div class="metric-label">مارکت کپ کل</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${formatNumber(dashboardData.totalVolume || 0)}</div>
                        <div class="metric-label">حجم معاملات</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${dashboardData.btcDominance || 0}%</div>
                        <div class="metric-label">تسلط بیت‌کوین</div>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <strong>تحلیل بازار:</strong>
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 8px;">
                        \${dashboardData.marketAnalysis || 'در حال تحلیل داده‌های بازار...'}
                    </p>
                </div>
            \`;
            document.getElementById('insightsResult').innerHTML = html;
        }

        function displayFearGreed(fgData) {
            const value = fgData.value || fgData.score || 0;
            const status = getFearGreedStatus(value);
            const classification = fgData.classification || 'خنثی';
            
            const html = \`
                <div class="status-indicator" style="border-color: \${status.color};">\${status.emoji} شاخص ترس و طمع</div>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value" style="color: \${status.color};">\${value}</div>
                        <div class="metric-label">امتیاز</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: \${status.color};">\${status.status}</div>
                        <div class="metric-label">وضعیت</div>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <strong>تفسیر:</strong>
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 8px;">
                        \${fgData.interpretation || 'وضعیت ' + status.status + ' در بازار حاکم است.'}
                    </p>
                </div>
                \${fgData.timestamp ? \`
                    <div style="font-size: 0.7rem; opacity: 0.6; margin-top: 10px;">
                        آخرین بروزرسانی: \${formatRelativeTime(fgData.timestamp)}
                    </div>
                \` : ''}
            \`;
            document.getElementById('fearGreedResult').innerHTML = html;
        }

        function displayBTCDominance(dominanceData) {
            const value = dominanceData.value || dominanceData.percentage || 0;
            const status = getDominanceStatus(value);
            
            const html = \`
                <div class="status-indicator">₿ تسلط بیت‌کوین</div>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value">\${value}%</div>
                        <div class="metric-label">درصد تسلط</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${status}</div>
                        <div class="metric-label">وضعیت</div>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <strong>تحلیل:</strong>
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 8px;">
                        \${dominanceData.analysis || 'تسلط بیت‌کوین نشان‌دهنده سهم بازار بیت‌کوین نسبت به کل بازار است.'}
                    </p>
                </div>
                \${dominanceData.timestamp ? \`
                    <div style="font-size: 0.7rem; opacity: 0.6; margin-top: 10px;">
                        آخرین بروزرسانی: \${formatRelativeTime(dominanceData.timestamp)}
                    </div>
                \` : ''}
            \`;
            document.getElementById('btcDominanceResult').innerHTML = html;
        }

        function displayRainbowChart(chartData) {
            const html = \`
                <div class="status-indicator">🌈 چارت رنگین‌کمان</div>
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🌈</div>
                    <p style="font-size: 0.9rem; opacity: 0.8;">
                        چارت رنگین‌کمان برای تحلیل بلندمدت قیمت بیت‌کوین
                    </p>
                </div>
                \${chartData.currentPhase ? \`
                    <div class="metric-card">
                        <div class="metric-value">\${chartData.currentPhase}</div>
                        <div class="metric-label">فاز فعلی</div>
                    </div>
                \` : ''}
                \${chartData.recommendation ? \`
                    <div style="margin-top: 15px;">
                        <strong>توصیه:</strong>
                        <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 8px;">
                            \${chartData.recommendation}
                        </p>
                    </div>
                \` : ''}
            \`;
            document.getElementById('rainbowChartResult').innerHTML = html;
        }

        // بارگذاری خودکار
        document.addEventListener('DOMContentLoaded', function() {
            loadFearGreed();
            loadBTCDominance();
            setTimeout(() => {
                loadDashboard();
            }, 1000);
        });
        </script>`;

        res.send(generateModernPage("پیش‌بینی بازار", content, 'insights'));
    };
};
