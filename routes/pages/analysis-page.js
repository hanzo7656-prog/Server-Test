const { generateModernPage } = require('../page-generator');

module.exports = (dependencies) => {
    return async (req, res) => {
        const symbol = req.query.symbol || 'bitcoin';
        const content = `
        <div class="content-card">
            <div class="card-header">
                <div class="card-icon">📈</div>
                <h3>تحلیل تکنیکال پیشرفته</h3>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                    <input type="text" id="symbolInput" value="${symbol}" placeholder="نماد ارز (bitcoin, ethereum...)" class="input-field">
                    <select id="timeframeSelect" class="input-field">
                        <option value="1h">1 ساعت</option>
                        <option value="4h">4 ساعت</option>
                        <option value="24h" selected>24 ساعت</option>
                        <option value="7d">7 روز</option>
                    </select>
                    <button class="btn" onclick="loadAnalysis()">بارگذاری تحلیل</button>
                </div>
            </div>
            
            <div id="analysisResult">
                <div class="status-indicator">لطفا نماد ارز را وارد کنید</div>
            </div>
        </div>

        <script>
            // توابع کمکی
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

            function setLoading(elementId, isLoading) {
                const element = document.getElementById(elementId);
                if (isLoading) {
                    element.innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری تحلیل...</div>';
                }
            }

            function handleApiError(error, elementId) {
                console.error('Analysis error:', error);
                const element = document.getElementById(elementId);
                element.innerHTML = \`
                    <div class="status-indicator error">
                        ❌ خطا در بارگذاری تحلیل: \${error.message}
                        <div style="font-size: 0.7rem; margin-top: 5px; opacity: 0.7;">
                            لطفا اتصال اینترنت را بررسی کرده و مجدد تلاش کنید
                        </div>
                    </div>
                \`;
            }

            function getSignalColor(signal) {
                if (signal.includes('BULLISH') || signal.includes('OVERSOLD')) return '#22c55e';
                if (signal.includes('BEARISH') || signal.includes('OVERBOUGHT')) return '#ef4444';
                return '#6b7280';
            }

            function getSignalText(signal) {
                const signals = {
                    'RSI_OVERSOLD': 'RSI اشباع فروش',
                    'RSI_OVERBOUGHT': 'RSI اشباع خرید',
                    'MACD_BULLISH_CROSSOVER': 'MACD صعودی',
                    'MACD_BEARISH_CROSSOVER': 'MACD نزولی',
                    'TREND_BULLISH': 'روند صعودی',
                    'TREND_BEARISH': 'روند نزولی',
                    'BOLLINGER_OVERSOLD': 'بولینگر اشباع فروش',
                    'BOLLINGER_OVERBOUGHT': 'بولینگر اشباع خرید'
                };
                return signals[signal] || signal;
            }

            async function loadAnalysis() {
                const symbol = document.getElementById('symbolInput').value.trim().toLowerCase();
                const timeframe = document.getElementById('timeframeSelect').value;
                
                if (!symbol) {
                    alert('لطفا نماد ارز را وارد کنید');
                    return;
                }
                
                console.log('🔍 Loading analysis for:', { symbol, timeframe });
                setLoading('analysisResult', true);
                
                try {
                    const response = await fetch(\`/api/analysis/technical?symbol=\${encodeURIComponent(symbol)}&timeframe=\${timeframe}\`);
                    
                    console.log('📡 API Response:', {
                        status: response.status,
                        ok: response.ok
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('❌ API Error:', errorText);
                        throw new Error(\`خطای سرور: \${response.status}\`);
                    }
                    
                    const data = await response.json();
                    console.log('📊 Analysis Data:', {
                        success: data.success,
                        hasData: !!data.data,
                        structure: Object.keys(data)
                    });
                    
                    if (data.success && data.data) {
                        displayAnalysis(data.data);
                    } else {
                        throw new Error(data.error || 'خطا در دریافت تحلیل از سرور');
                    }
                } catch (error) {
                    handleApiError(error, 'analysisResult');
                } finally {
                    setLoading('analysisResult', false);
                }
            }

            function displayAnalysis(data) {
                const indicators = data.indicators || {};
                const signals = data.signals || {};
                const trend = data.trend || {};
                const supportResistance = data.support_resistance || {};
                
                console.log('🎯 Displaying analysis:', {
                    indicators: Object.keys(indicators),
                    signals: signals,
                    trend: trend
                });

                const html = \`
                    <div style="margin-top: 20px;">
                        <div class="status-indicator success">
                            ✅ تحلیل بارگذاری شد - \${data.symbol.toUpperCase()}
                        </div>
                        
                        <!-- آمار اصلی -->
                        <div class="metric-grid">
                            <div class="metric-card">
                                <div class="metric-value">\${formatPrice(data.current_price)}</div>
                                <div class="metric-label">قیمت فعلی</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value \${(indicators.rsi || 50) < 30 ? 'positive' : (indicators.rsi || 50) > 70 ? 'negative' : ''}">
                                    \${(indicators.rsi || 0).toFixed(2)}
                                </div>
                                <div class="metric-label">RSI</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value \${trend.trend === 'BULLISH' ? 'positive' : trend.trend === 'BEARISH' ? 'negative' : ''}">
                                    \${trend.trend === 'BULLISH' ? 'صعودی' : trend.trend === 'BEARISH' ? 'نزولی' : 'خنثی'}
                                </div>
                                <div class="metric-label">روند</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">\${Math.round((signals.signal_strength || 0) * 100)}%</div>
                                <div class="metric-label">قدرت سیگنال</div>
                            </div>
                        </div>
                        
                        <!-- سیگنال‌ها -->
                        <div style="margin-top: 20px;">
                            <h4>🚦 سیگنال‌های معاملاتی:</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                                \${signals.all_signals && signals.all_signals.length > 0 ? 
                                    signals.all_signals.map(signal => \`
                                        <div style="padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; 
                                                    background: \${getSignalColor(signal)}20; 
                                                    color: \${getSignalColor(signal)};
                                                    border: 1px solid \${getSignalColor(signal)}40;">
                                            \${getSignalText(signal)}
                                        </div>
                                    \`).join('') : 
                                    '<div class="status-indicator">⚠️ هیچ سیگنال فعالی شناسایی نشد</div>'
                                }
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                                <div class="content-card">
                                    <strong>📈 سیگنال‌های خرید (\${signals.buy_signals ? signals.buy_signals.length : 0})</strong>
                                    <div style="margin-top: 8px;">
                                        \${signals.buy_signals && signals.buy_signals.length > 0 ? 
                                            signals.buy_signals.map(signal => \`
                                                <div style="color: #22c55e; font-size: 0.8rem; margin: 4px 0;">
                                                    • \${getSignalText(signal)}
                                                </div>
                                            \`).join('') : 
                                            '<div style="font-size: 0.8rem; opacity: 0.7;">هیچ سیگنال خریدی وجود ندارد</div>'
                                        }
                                    </div>
                                </div>
                                <div class="content-card">
                                    <strong>📉 سیگنال‌های فروش (\${signals.sell_signals ? signals.sell_signals.length : 0})</strong>
                                    <div style="margin-top: 8px;">
                                        \${signals.sell_signals && signals.sell_signals.length > 0 ? 
                                            signals.sell_signals.map(signal => \`
                                                <div style="color: #ef4444; font-size: 0.8rem; margin: 4px 0;">
                                                    • \${getSignalText(signal)}
                                                </div>
                                            \`).join('') : 
                                            '<div style="font-size: 0.8rem; opacity: 0.7;">هیچ سیگنال فروشی وجود ندارد</div>'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- اندیکاتورها -->
                        <div style="margin-top: 20px;">
                            <h4>📊 اندیکاتورهای تکنیکال:</h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; margin-top: 10px;">
                                <div class="content-card">
                                    <strong>📈 MACD</strong>
                                    <div style="margin-top: 8px;">
                                        <div>خط MACD: <strong>\${(indicators.macd || 0).toFixed(4)}</strong></div>
                                        <div>خط سیگنال: <strong>\${(indicators.macd_signal || 0).toFixed(4)}</strong></div>
                                        <div>هیستوگرام: <strong class="\${(indicators.macd_hist || 0) >= 0 ? 'positive' : 'negative'}">\${(indicators.macd_hist || 0).toFixed(4)}</strong></div>
                                    </div>
                                </div>
                                
                                <div class="content-card">
                                    <strong>📊 بولینگر باند</strong>
                                    <div style="margin-top: 8px;">
                                        <div>باند بالایی: <strong>\${formatPrice(indicators.bollinger_upper)}</strong></div>
                                        <div>باند میانی: <strong>\${formatPrice(indicators.bollinger_middle)}</strong></div>
                                        <div>باند پایینی: <strong>\${formatPrice(indicators.bollinger_lower)}</strong></div>
                                    </div>
                                </div>
                                
                                <div class="content-card">
                                    <strong>📉 میانگین متحرک</strong>
                                    <div style="margin-top: 8px;">
                                        <div>MA20: <strong>\${formatPrice(indicators.moving_avg_20)}</strong></div>
                                        <div>MA50: <strong>\${formatPrice(indicators.moving_avg_50)}</strong></div>
                                        <div>MA200: <strong>\${formatPrice(indicators.moving_avg_200)}</strong></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- سطوح حمایت و مقاومت -->
                        <div style="margin-top: 20px;">
                            <h4>🛡️ سطوح حمایت و مقاومت:</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                                <div class="content-card">
                                    <strong>📈 مقاومت</strong>
                                    <div style="margin-top: 8px;">
                                        <div>مقاومت ۱: <strong>\${formatPrice(supportResistance.resistance ? supportResistance.resistance[0] : 0)}</strong></div>
                                        <div>مقاومت ۲: <strong>\${formatPrice(supportResistance.resistance ? supportResistance.resistance[1] : 0)}</strong></div>
                                    </div>
                                </div>
                                <div class="content-card">
                                    <strong>📉 حمایت</strong>
                                    <div style="margin-top: 8px;">
                                        <div>حمایت ۱: <strong>\${formatPrice(supportResistance.support ? supportResistance.support[0] : 0)}</strong></div>
                                        <div>حمایت ۲: <strong>\${formatPrice(supportResistance.support ? supportResistance.support[1] : 0)}</strong></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 15px; font-size: 0.8rem; opacity: 0.7; text-align: center;">
                            آخرین بروزرسانی: \${new Date(data.analysis_timestamp).toLocaleString('fa-IR')}
                        </div>
                    </div>
                \`;
                
                document.getElementById('analysisResult').innerHTML = html;
            }

            // بارگذاری خودکار اگر symbol در URL وجود دارد
            document.addEventListener('DOMContentLoaded', function() {
                const urlParams = new URLSearchParams(window.location.search);
                const symbol = urlParams.get('symbol');
                if (symbol) {
                    document.getElementById('symbolInput').value = symbol;
                    setTimeout(() => {
                        console.log('🔍 Auto-loading analysis for:', symbol);
                        loadAnalysis();
                    }, 1000);
                }
            });
        </script>`;

        res.send(generateModernPage("تحلیل تکنیکال", content, 'analyze'));
    };
};
