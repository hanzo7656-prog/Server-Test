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
            async function loadAnalysis() {
                const symbol = document.getElementById('symbolInput').value;
                const timeframe = document.getElementById('timeframeSelect').value;
                
                if (!symbol) {
                    alert('لطفا نماد ارز را وارد کنید');
                    return;
                }
                
                setLoading('analysisResult', true);
                
                try {
                    const response = await fetch(\`/api/analysis/technical?symbol=\${encodeURIComponent(symbol)}&timeframe=\${timeframe}\`);
                    if (!response.ok) throw new Error('خطای شبکه: ' + response.status);
                    
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        displayAnalysis(data.data);
                    } else {
                        throw new Error(data.error || 'خطا در دریافت تحلیل');
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
                
                const html = \`
                    <div style="margin-top: 20px;">
                        <div class="status-indicator">✅ تحلیل بارگذاری شد - \${data.symbol}</div>
                        
                        <div class="metric-grid">
                            <div class="metric-card">
                                <div class="metric-value">\${formatPrice(data.current_price)}</div>
                                <div class="metric-label">قیمت فعلی</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">\${indicators.rsi?.toFixed(2) || 'N/A'}</div>
                                <div class="metric-label">RSI</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">\${signals.trend || 'NEUTRAL'}</div>
                                <div class="metric-label">روند</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">\${signals.strength || 0}%</div>
                                <div class="metric-label">قدرت سیگنال</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px;">
                            <h4>📊 اندیکاتورهای تکنیکال:</h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                                <div class="content-card">
                                    <strong>MACD</strong>
                                    <div>خط: \${indicators.macd?.toFixed(4) || 'N/A'}</div>
                                    <div>سیگنال: \${indicators.macd_signal?.toFixed(4) || 'N/A'}</div>
                                    <div>هیستوگرام: \${indicators.macd_hist?.toFixed(4) || 'N/A'}</div>
                                </div>
                                <div class="content-card">
                                    <strong>بولینگر باند</strong>
                                    <div>بالایی: \${formatPrice(indicators.bollinger_upper)}</div>
                                    <div>میانی: \${formatPrice(indicators.bollinger_middle)}</div>
                                    <div>پایینی: \${formatPrice(indicators.bollinger_lower)}</div>
                                </div>
                                <div class="content-card">
                                    <strong>میانگین متحرک</strong>
                                    <div>MA20: \${formatPrice(indicators.moving_avg_20)}</div>
                                    <div>MA50: \${formatPrice(indicators.moving_avg_50)}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px;">
                            <h4>💡 توصیه‌های معاملاتی:</h4>
                            <div class="content-card">
                                \${signals.recommendations && signals.recommendations.length > 0 ? 
                                    signals.recommendations.map(rec => \`<div>• \${rec}</div>\`).join('') : 
                                    'هیچ توصیه‌ای در حال حاضر موجود نیست'
                                }
                            </div>
                        </div>
                        
                        <div style="margin-top: 15px; font-size: 0.8rem; opacity: 0.7;">
                            آخرین بروزرسانی: \${new Date(data.analysis_timestamp || data.timestamp).toLocaleString('fa-IR')}
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
                    setTimeout(loadAnalysis, 500);
                }
            });
        </script>`;

        res.send(generateModernPage("تحلیل تکنیکال", content, 'analyze'));
    };
};
