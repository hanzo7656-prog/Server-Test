// routes/pages/analysis.js
const express = require('express');
const router = express.Router();

/**
 * صفحه تحلیل تکنیکال پیشرفته
 */
router.get('/:symbol', async (req, res) => {
    const { symbol } = req.params;
    
    try {
        // دریافت داده از API
        const apiResponse = await fetch(http://localhost:${process.env.PORT || 3000}/api/coin/${symbol}/technical);
        const analysisData = await apiResponse.json();
        
        res.send(
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Technical Analysis - ${symbol.toUpperCase()} - VortexAI</title>
            <style>
                /* استایل‌های شیشه‌ای یکپارچه */
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh; padding: 20px;
                }

                .glass-container {
                    background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 24px;
                    padding: 30px; margin: 20px auto; max-width: 1400px;
                    position: relative; overflow: hidden;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }

                .indicators-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                    margin: 25px 0;
                }

                .indicator-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 20px;
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .indicator-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(255, 255, 255, 0.3);
                }

                .indicator-value {
                    font-size: 2rem;
                    font-weight: 800;
                    color: white;
                    margin: 10px 0;
                }

                .bullish { color: #00b894; }
                .bearish { color: #ff6b6b; }
                .neutral { color: #fdcb6e; }
            </style>
        </head>
        <body>
            <div class="glass-container">
                <div class="glass-header">
                    <div class="glass-icon">📈</div>
                    <h2 class="glass-title">Technical Analysis: ${symbol.toUpperCase()}</h2>
                    <div class="glass-badge">15+ INDICATORS</div>
                </div>

                ${analysisData.success ? 
                <div class="price-section">
                    <div class="current-price">$${analysisData.current_price?.toLocaleString() || 'N/A'}</div>
                </div>

                <div class="indicators-grid">
                    <div class="indicator-card">
                        <div>📊 RSI</div>
                        <div class="indicator-card ${getRSIColor(analysisData.technical_indicators?.rsi)}">
                            ${analysisData.technical_indicators?.rsi?.toFixed(2) || 'N/A'}
                        </div>
                        <div class="stat-label">Momentum</div>
                    </div>

                    <div class="indicator-card">
                        <div>⚡ MACD</div>
                        <div class="indicator-card ${analysisData.technical_indicators?.macd > 0 ? 'bullish' : 'bearish'}">
                            ${analysisData.technical_indicators?.macd?.toFixed(4) || 'N/A'}
                        </div>
                        <div class="stat-label">Trend</div>
                    </div>

<!-- بقیه اندیکاتورها -->
                </div>
                 : '<div class="error-message">Error loading analysis data</div>'}
            </div>

            <script>
                function getRSIColor(rsi) {
                    if (!rsi) return 'neutral';
                    if (rsi > 70) return 'bearish';
                    if (rsi < 30) return 'bullish';
                    return 'neutral';
                }
            </script>
        </body>
        </html>
        );
    } catch (error) {
        res.status(500).send('Error loading analysis page');
    }
});

module.exports = router;
