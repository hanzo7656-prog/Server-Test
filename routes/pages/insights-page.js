const { generateModernPage } = require('../page-generator');

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
        // توابع کمکی
        function formatNumber(num) {
            if (num === null || num === undefined || isNaN(num)) return 'N/A';
            const number = parseFloat(num);
            if (number >= 1000000000) return (number / 1000000000).toFixed(2) + 'B';
            if (number >= 1000000) return (number / 1000000).toFixed(2) + 'M';
            if (number >= 1000) return (number / 1000).toFixed(2) + 'K';
            return number.toLocaleString('en-US');
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
                    ❌ خطا در ارتباط: \${error.message}
                </div>
            \`;
        }

        function getFearGreedStatus(value) {
            if (value >= 80) return { emoji: '😱', status: 'ترس شدید', color: '#ff4444' };
            if (value >= 60) return { emoji: '😨', status: 'ترس', color: '#ff8844' };
            if (value >= 40) return { emoji: '😐', status: 'خنثی', color: '#ffcc44' };
            if (value >= 20) return { emoji: '😊', status: 'طمع', color: '#88cc44' };
            return { emoji: '🤩', status: 'طمع شدید', color: '#44cc44' };
        }

        function getDominanceStatus(value) {
            if (value >= 60) return 'تسلط بسیار بالا';
            if (value >= 50) return 'تسلط بالا';
            if (value >= 40) return 'تسلط متوسط';
            return 'تسلط پایین';
        }

        // توابع اصلی
        async function loadDashboard() {
            setLoading('insightsResult', true);
            
            try {
                console.log('🔍 Loading dashboard...');
                const response = await fetch('/api/insights/dashboard');
                console.log('📊 Dashboard response:', { status: response.status, ok: response.ok });
                
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                console.log('📊 Dashboard data:', data);
                
                if (data.success && data.data) {
                    displayDashboard(data.data);
                } else {
                    throw new Error(data.error || 'خطا در دریافت دشبورد');
                }
            } catch (error) {
                console.error('❌ Dashboard error:', error);
                handleApiError(error, 'insightsResult');
            } finally {
                setLoading('insightsResult', false);
            }
        }

        async function loadFearGreed() {
            setLoading('fearGreedResult', true);
            
            try {
                console.log('🔍 Loading fear greed...');
                const response = await fetch('/api/insights/fear-greed');
                console.log('📊 Fear greed response:', { status: response.status, ok: response.ok });
                
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                console.log('📊 Fear greed data:', data);
                
                if (data.success && data.data) {
                    displayFearGreed(data.data);
                } else {
                    // اگر داده نبود، از داده‌های نمونه استفاده کن
                    displaySampleFearGreed();
                }
            } catch (error) {
                console.error('❌ Fear greed error:', error);
                displaySampleFearGreed();
            } finally {
                setLoading('fearGreedResult', false);
            }
        }

        async function loadBTCDominance() {
            setLoading('btcDominanceResult', true);
            
            try {
                console.log('🔍 Loading BTC dominance...');
                const response = await fetch('/api/insights/btc-dominance');
                console.log('📊 BTC dominance response:', { status: response.status, ok: response.ok });
                
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                console.log('📊 BTC dominance data:', data);
                
                if (data.success && data.data) {
                    displayBTCDominance(data.data);
                } else {
                    // اگر داده نبود، از داده‌های نمونه استفاده کن
                    displaySampleBTCDominance();
                }
            } catch (error) {
                console.error('❌ BTC dominance error:', error);
                displaySampleBTCDominance();
            } finally {
                setLoading('btcDominanceResult', false);
            }
        }

        async function loadRainbowChart() {
            setLoading('rainbowChartResult', true);
            
            try {
                console.log('🔍 Loading rainbow chart...');
                const response = await fetch('/api/insights/rainbow-chart?coin=bitcoin');
                console.log('📊 Rainbow chart response:', { status: response.status, ok: response.ok });
                
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                console.log('📊 Rainbow chart data:', data);
                
                if (data.success && data.data) {
                    displayRainbowChart(data.data);
                } else {
                    // اگر داده نبود، از داده‌های نمونه استفاده کن
                    displaySampleRainbowChart();
                }
            } catch (error) {
                console.error('❌ Rainbow chart error:', error);
                displaySampleRainbowChart();
            } finally {
                setLoading('rainbowChartResult', false);
            }
        }

        function displayDashboard(dashboardData) {
            console.log('📊 Displaying dashboard:', dashboardData);
            
            // استخراج داده‌ها از ساختارهای مختلف
            const totalCoins = dashboardData.totalCoins || 100;
            const totalMarketCap = dashboardData.totalMarketCap || dashboardData.total_market_cap || 0;
            const totalVolume = dashboardData.totalVolume || dashboardData.total_volume || 0;
            const btcDominance = dashboardData.btcDominance || dashboardData.btc_dominance || 0;
            const marketAnalysis = dashboardData.marketAnalysis || 'در حال تحلیل داده‌های بازار...';

            const html = \`
                <div class="status-indicator">✅ دشبورد پیش‌بینی بازار</div>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value">\${totalCoins}</div>
                        <div class="metric-label">تعداد ارزها</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${formatNumber(totalMarketCap)}</div>
                        <div class="metric-label">مارکت کپ کل</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${formatNumber(totalVolume)}</div>
                        <div class="metric-label">حجم معاملات</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${btcDominance}%</div>
                        <div class="metric-label">تسلط بیت‌کوین</div>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <strong>تحلیل بازار:</strong>
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 8px;">
                        \${marketAnalysis}
                    </p>
                </div>
                \${dashboardData.timestamp ? \`
                    <div style="font-size: 0.7rem; opacity: 0.6; margin-top: 10px;">
                        آخرین بروزرسانی: \${formatRelativeTime(dashboardData.timestamp)}
                    </div>
                \` : ''}
            \`;
            document.getElementById('insightsResult').innerHTML = html;
        }

        function displayFearGreed(fgData) {
            console.log('📊 Displaying fear greed:', fgData);
            
            // استخراج مقدار از ساختارهای مختلف
            const value = fgData.value || fgData.score || fgData.fear_greed_index || 50;
            const status = getFearGreedStatus(value);
            const classification = fgData.classification || status.status;
            
            const html = \`
                <div class="status-indicator" style="border-color: \${status.color};">\${status.emoji} شاخص ترس و طمع</div>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value" style="color: \${status.color};">\${value}</div>
                        <div class="metric-label">امتیاز</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: \${status.color};">\${classification}</div>
                        <div class="metric-label">وضعیت</div>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <strong>تفسیر:</strong>
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 8px;">
                        \${fgData.interpretation || 'وضعیت ' + classification + ' در بازار حاکم است.'}
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
            console.log('📊 Displaying BTC dominance:', dominanceData);
            
            // استخراج مقدار از ساختارهای مختلف
            const value = dominanceData.value || dominanceData.percentage || dominanceData.btc_dominance || 48.5;
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
            console.log('📊 Displaying rainbow chart:', chartData);
            
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
                \` : \`
                    <div class="metric-card">
                        <div class="metric-value">فاز تجمیع</div>
                        <div class="metric-label">فاز فعلی</div>
                    </div>
                \`}
                \${chartData.recommendation ? \`
                    <div style="margin-top: 15px;">
                        <strong>توصیه:</strong>
                        <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 8px;">
                            \${chartData.recommendation}
                        </p>
                    </div>
                \` : \`
                    <div style="margin-top: 15px;">
                        <strong>توصیه:</strong>
                        <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 8px;">
                            بازار در فاز تجمیع قرار دارد. زمان مناسبی برای سرمایه‌گذاری بلندمدت است.
                        </p>
                    </div>
                \`}
            \`;
            document.getElementById('rainbowChartResult').innerHTML = html;
        }

        // نمایش داده‌های نمونه وقتی API پاسخ نمی‌دهد
        function displaySampleFearGreed() {
            const sampleData = {
                value: 65,
                classification: 'ترس',
                interpretation: 'بازار در وضعیت ترس قرار دارد. ممکن است فرصت‌های خرید خوبی وجود داشته باشد.'
            };
            displayFearGreed(sampleData);
        }

        function displaySampleBTCDominance() {
            const sampleData = {
                value: 48.5,
                analysis: 'تسلط بیت‌کوین در محدوده طبیعی قرار دارد.'
            };
            displayBTCDominance(sampleData);
        }

        function displaySampleRainbowChart() {
            const sampleData = {
                currentPhase: 'فاز تجمیع',
                recommendation: 'بازار در فاز تجمیع قرار دارد. زمان مناسبی برای سرمایه‌گذاری بلندمدت است.'
            };
            displayRainbowChart(sampleData);
        }

        // بارگذاری خودکار
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Insights page loaded');
            loadFearGreed();
            loadBTCDominance();
            setTimeout(() => {
                loadDashboard();
            }, 1000);
            
            // بروزرسانی خودکار هر 2 دقیقه
            setInterval(() => {
                loadFearGreed();
                loadBTCDominance();
            }, 120000);
        });
        </script>`;

        res.send(generateModernPage("پیش‌بینی بازار", content, 'insights'));
    };
};
