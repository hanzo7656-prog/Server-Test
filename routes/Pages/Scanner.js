// routes/pages/scanner.js
const express = require('express');
const router = express.Router();

/**
 * صفحه اسکنر پیشرفته با طراحی شیشه‌ای
 */
router.get('/', async (req, res) => {
    try {
        // دریافت داده از API
        const apiResponse = await fetch(http://localhost:${process.env.PORT || 3000}/api/scan/vortexai?limit=20&filter=ai_signal);
        const scanData = await apiResponse.json();
        
        res.send(
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Advanced Scanner - VortexAI</title>
            <style>
                /* استایل‌های شیشه‌ای یکپارچه */
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh; color: #333; line-height: 1.6; padding: 20px;
                }

                .glass-container {
                    background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 24px;
                    padding: 30px; margin: 20px auto; max-width: 1400px;
                    position: relative; overflow: hidden;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }

                /* بقیه استایل‌های یکپارچه... */
                
                /* طراحی کارت کوین‌ها مشابه api-data اما با اطلاعات اسکن */
                .scan-results {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                    margin-top: 25px;
                }

                .coin-scan-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 20px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .coin-scan-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(255, 255, 255, 0.3);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }

                .ai-score {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: linear-gradient(135deg, #fd79a8, #e84393);
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.9rem;
                }
            </style>
        </head>
        <body>
            <div class="glass-container">
                <div class="glass-header">
                    <div class="glass-icon">🔍</div>
                    <h2 class="glass-title">Advanced Market Scanner</h2>
                    <div class="glass-badge">VORTEXAI</div>
                </div>

                <!-- فیلترها و کنترل‌ها -->
                <div class="controls-section">
                    <!-- طراحی فیلترها مشابه api-data -->
                </div>

                <!-- نتایج اسکن -->
                <div class="scan-results">
                    ${scanData.success ? scanData.coins.map(coin => 
                        <div class="coin-scan-card" onclick="viewCoinAnalysis('${coin.symbol}')">

<div class="ai-score">${Math.round(coin.VortexAI_analysis?.signal_strength || 0)}</div>
                            <div class="card-header">
                                <div class="coin-icon">${coin.symbol.charAt(0)}</div>
                                <div class="coin-info">
                                    <div class="coin-symbol">${coin.symbol}</div>
                                    <div class="coin-name">${coin.name || 'Crypto'}</div>
                                </div>
                            </div>
                            <div class="current-price">$${(coin.price || 0).toLocaleString()}</div>
                            <div class="market-stats">
                                <div class="stat-item">
                                    <div class="stat-label">AI Signal</div>
                                    <div class="stat-value">${(coin.VortexAI_analysis?.signal_strength || 0).toFixed(1)}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Health</div>
                                    <div class="stat-value">${coin.health_status?.score || 0}</div>
                                </div>
                            </div>
                        </div>
                    ).join('') : '<div class="error-message">Error loading scan data</div>'}
                </div>
            </div>

            <script>
                function viewCoinAnalysis(symbol) {
                    window.open('/analysis/' + symbol.toLowerCase(), '_blank');
                }
            </script>
        </body>
        </html>
        );
    } catch (error) {
        res.status(500).send('Error loading scanner page');
    }
});

module.exports = router;
