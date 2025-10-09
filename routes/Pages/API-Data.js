// routes/pages/api-data.js
const express = require('express');
const router = express.Router();

/**
 * صفحه API Data با طراحی شیشه‌ای یکپارچه
 */
router.get('/', (req, res) => {
    const wsStatus = req.wsManager.getConnectionStatus();
    const gistData = req.gistManager.getAllData();
    const apiStatus = req.advancedDataAPI ? req.advancedDataAPI.getAPIStatus() : { requestCount: 0, cacheSize: 0 };

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Data - VortexAI Pro</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
                line-height: 1.6;
                padding: 20px;
            }

            .glass-container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 24px;
                padding: 30px;
                margin: 20px auto;
                max-width: 1400px;
                position: relative;
                overflow: hidden;
                box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }

            .glass-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, 
                    transparent, 
                    rgba(255, 255, 255, 0.4), 
                    transparent
                );
            }

            .glass-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 30px;
            }

            .glass-icon {
                font-size: 2rem;
                filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
            }

            .glass-title {
                color: white;
                font-size: 1.8rem;
                font-weight: 700;
                margin: 0;
                background: linear-gradient(135deg, #fff, #a5b4fc);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .glass-badge {
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                padding: 6px 12px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 700;
                color: white;
                box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
            }

            /* شبکه کارت‌های API */
            .api-cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 25px;
                margin-bottom: 30px;
            }

            .glass-api-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 25px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                cursor: pointer;
            }

            .glass-api-card:hover {
                transform: translateY(-8px);
                border-color: rgba(255, 255, 255, 0.3);
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
            }

.card-glow {
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(135deg, #74b9ff, #0984e3);
                opacity: 0.1;
                border-radius: 50%;
                filter: blur(20px);
                z-index: 0;
            }

            .card-content {
                position: relative;
                z-index: 1;
            }

            .card-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }

            .coin-icon {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                background: linear-gradient(135deg, #f6d365, #fda085);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: bold;
                color: white;
                box-shadow: 0 4px 15px rgba(253, 160, 133, 0.3);
            }

            .coin-info {
                flex: 1;
            }

            .coin-symbol {
                color: white;
                font-size: 1.4rem;
                font-weight: 700;
                margin-bottom: 5px;
            }

            .coin-name {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9rem;
            }

            .price-section {
                margin-bottom: 20px;
            }

            .current-price {
                font-size: 2rem;
                font-weight: 800;
                color: white;
                margin-bottom: 10px;
                background: linear-gradient(135deg, #fff, #dfe6e9);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .timeframe-selector {
                display: flex;
                gap: 8px;
                margin-bottom: 15px;
            }

            .timeframe-btn {
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.8rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .timeframe-btn.active {
                background: linear-gradient(135deg, #74b9ff, #0984e3);
                color: white;
                border-color: #74b9ff;
                box-shadow: 0 4px 15px rgba(116, 185, 255, 0.3);
            }

            .timeframe-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }

            .price-change {
                display: inline-block;
                padding: 6px 12px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 0.9rem;
                margin-right: 10px;
            }

            .positive {
                background: rgba(0, 184, 148, 0.2);
                color: #00b894;
            }

            .negative {
                background: rgba(255, 107, 107, 0.2);
                color: #ff6b6b;
            }

            .market-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-top: 20px;
            }

            .stat-item {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 15px;
                text-align: center;
                transition: all 0.3s ease;
            }

            .stat-item:hover {
                border-color: rgba(255, 255, 255, 0.3);
                transform: translateY(-3px);
            }

.stat-label {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.8rem;
                margin-bottom: 5px;
            }

            .stat-value {
                color: white;
                font-size: 1.1rem;
                font-weight: 700;
            }

            .api-endpoints {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 20px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                margin-top: 30px;
            }

            .endpoint-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }

            .endpoint-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 20px;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .endpoint-card:hover {
                border-color: rgba(255, 255, 255, 0.3);
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }

            .endpoint-method {
                display: inline-block;
                padding: 4px 12px;
                background: #27ae60;
                color: white;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .endpoint-method.get { background: #27ae60; }
            .endpoint-method.post { background: #3498db; }
            .endpoint-method.put { background: #f39c12; }
            .endpoint-method.delete { background: #e74c3c; }

            .endpoint-path {
                font-family: 'Courier New', monospace;
                color: white;
                font-weight: 600;
                margin: 10px 0;
                font-size: 0.9rem;
                word-break: break-all;
            }

            .endpoint-desc {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.8rem;
                line-height: 1.4;
            }

            .nav-buttons {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 40px;
                flex-wrap: wrap;
            }

            .nav-button {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                padding: 14px 28px;
                border-radius: 16px;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 0.95rem;
            }

            .nav-button:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-3px);
                border-color: rgba(255, 255, 255, 0.3);
                box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
            }

            .live-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #00b894;
                font-size: 0.8rem;
                font-weight: 600;
            }

            .pulse-dot {
                width: 8px;
                height: 8px;
                background: #00b894;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
                100% { opacity: 1; transform: scale(1); }
            }

.section-title {
                color: white;
                font-size: 1.4rem;
                font-weight: 700;
                margin-bottom: 20px;
                background: linear-gradient(135deg, #fff, #a5b4fc);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            @media (max-width: 768px) {
                .api-cards-grid {
                    grid-template-columns: 1fr;
                }
                
                .endpoint-grid {
                    grid-template-columns: 1fr;
                }
                
                .market-stats {
                    grid-template-columns: 1fr;
                }
                
                .nav-buttons {
                    flex-direction: column;
                    align-items: center;
                }
                
                .nav-button {
                    width: 200px;
                    justify-content: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="glass-container">
            <div class="glass-header">
                <div class="glass-icon">🚀</div>
                <h2 class="glass-title">VortexAI API Data</h2>
                <div class="glass-badge">ADVANCED</div>
                <div class="live-indicator">
                    <div class="pulse-dot"></div>
                    LIVE DATA
                </div>
            </div>
            
            <!-- کارت‌های کوین‌های اصلی -->
            <div class="api-cards-grid">
                <!-- بیت‌کوین -->
                <div class="glass-api-card" onclick="window.open('/api/coin/bitcoin/technical', '_blank')">
                    <div class="card-glow"></div>
                    <div class="card-content">
                        <div class="card-header">
                            <div class="coin-icon">₿</div>
                            <div class="coin-info">
                                <div class="coin-symbol">BTC</div>
                                <div class="coin-name">Bitcoin</div>
                            </div>
                        </div>
                        
                        <div class="price-section">
                            <div class="current-price">$45,234.56</div>
                            
                            <div class="timeframe-selector">
                                <button class="timeframe-btn active" onclick="changeTimeframe(this, '1h')">1H</button>
                                <button class="timeframe-btn" onclick="changeTimeframe(this, '24h')">24H</button>
                                <button class="timeframe-btn" onclick="changeTimeframe(this, '7d')">7D</button>
                            </div>
                            
                            <div class="price-change positive">+2.34%</div>
                            <span style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">1H Change</span>
                        </div>

                        <div class="market-stats">
                            <div class="stat-item">
                                <div class="stat-label">Volume</div>
                                <div class="stat-value">$25.4B</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Market Cap</div>
                                <div class="stat-value">$885B</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- اتریوم -->
                <div class="glass-api-card" onclick="window.open('/api/coin/ethereum/technical', '_blank')">
                    <div class="card-glow" style="background: linear-gradient(135deg, #a29bfe, #6c5ce7);"></div>

<div class="card-content">
                        <div class="card-header">
                            <div class="coin-icon" style="background: linear-gradient(135deg, #a29bfe, #6c5ce7);">Ξ</div>
                            <div class="coin-info">
                                <div class="coin-symbol">ETH</div>
                                <div class="coin-name">Ethereum</div>
                            </div>
                        </div>
                        
                        <div class="price-section">
                            <div class="current-price">$3,245.67</div>
                            
                            <div class="timeframe-selector">
                                <button class="timeframe-btn active" onclick="changeTimeframe(this, '1h')">1H</button>
                                <button class="timeframe-btn" onclick="changeTimeframe(this, '24h')">24H</button>
                                <button class="timeframe-btn" onclick="changeTimeframe(this, '7d')">7D</button>
                            </div>
                            
                            <div class="price-change positive">+1.23%</div>
                            <span style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">1H Change</span>
                        </div>

                        <div class="market-stats">
                            <div class="stat-item">
                                <div class="stat-label">Volume</div>
                                <div class="stat-value">$14.8B</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Market Cap</div>
                                <div class="stat-value">$389B</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- سولانا -->
                <div class="glass-api-card" onclick="window.open('/api/coin/solana/technical', '_blank')">
                    <div class="card-glow" style="background: linear-gradient(135deg, #fd79a8, #e84393);"></div>
                    <div class="card-content">
                        <div class="card-header">
                            <div class="coin-icon" style="background: linear-gradient(135deg, #fd79a8, #e84393);">S</div>
                            <div class="coin-info">
                                <div class="coin-symbol">SOL</div>
                                <div class="coin-name">Solana</div>
                            </div>
                        </div>
                        
                        <div class="price-section">
                            <div class="current-price">$102.34</div>
                            
                            <div class="timeframe-selector">
                                <button class="timeframe-btn active" onclick="changeTimeframe(this, '1h')">1H</button>
                                <button class="timeframe-btn" onclick="changeTimeframe(this, '24h')">24H</button>
                                <button class="timeframe-btn" onclick="changeTimeframe(this, '7d')">7D</button>
                            </div>
                            
                            <div class="price-change positive">+5.67%</div>
                            <span style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">1H Change</span>
                        </div>

                        <div class="market-stats">
                            <div class="stat-item">
                                <div class="stat-label">Volume</div>
                                <div class="stat-value">$3.2B</div>
                            </div>
                            <div class="stat-item">

<div class="stat-label">Market Cap</div>
                                <div class="stat-value">$44.5B</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- endpointهای API -->
            <div class="api-endpoints">
                <h3 class="section-title">📡 API Endpoints</h3>
                <div class="endpoint-grid">
                    <div class="endpoint-card" onclick="window.open('/api/scan/vortexai?limit=10&filter=ai_signal', '_blank')">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/scan/vortexai</div>
                        <div class="endpoint-desc">اسکنر پیشرفته بازار با فیلتر سلامت و تحلیل VortexAI</div>
                    </div>
                    
                    <div class="endpoint-card" onclick="window.open('/api/advanced/coin/bitcoin', '_blank')">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/advanced/coin/:coinId</div>
                        <div class="endpoint-desc">تحلیل پیشرفته کوین با داده‌های تاریخی و صرافی</div>
                    </div>
                    
                    <div class="endpoint-card" onclick="window.open('/api/health-combined', '_blank')">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/health-combined</div>
                        <div class="endpoint-desc">وضعیت سلامت سیستم و آمار درخواست‌ها</div>
                    </div>
                    
                    <div class="endpoint-card" onclick="window.open('/api/advanced/arbitrage?coin=bitcoin&target=USDT', '_blank')">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/advanced/arbitrage</div>
                        <div class="endpoint-desc">تحلیل فرصت‌های آربیتراژ بین صرافی‌ها</div>
                    </div>
                </div>
            </div>

            <!-- ناوبری -->
            <div class="nav-buttons">
                <a href="/" class="nav-button">
                    <span>🏠</span>
                    Dashboard
                </a>
                <a href="/scan" class="nav-button">
                    <span>🔍</span>
                    Market Scanner
                </a>
                <a href="/analysis?symbol=btc_usdt" class="nav-button">
                    <span>📈</span>
                    Technical Analysis
                </a>
                <a href="/api/scan/vortexai?limit=10&filter=ai_signal" class="nav-button" target="_blank">
                    <span>🚀</span>
                    Live API Data
                </a>
            </div>
        </div>

        <script>
            function changeTimeframe(button, timeframe) {
                // غیرفعال کردن تمام دکمه‌ها
                document.querySelectorAll('.timeframe-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // فعال کردن دکمه انتخاب شده
                button.classList.add('active');
                
                // اینجا می‌تونی داده‌های جدید رو بر اساس timeframe لود کنی
                console.log('Changing timeframe to:', timeframe);
                
                // شبیه‌سازی تغییر قیمت
                const priceChange = document.querySelector('.price-change');
                const changeText = document.querySelector('.price-change + span');
                
                const changes = {
                    '1h': { value: '+2.34%', class: 'positive' },
                    '24h': { value: '+5.67%', class: 'positive' },

'7d': { value: '-1.23%', class: 'negative' }
                };
                
                if (changes[timeframe]) {
                    priceChange.textContent = changes[timeframe].value;
                    priceChange.className = 'price-change ' + changes[timeframe].class;
                    changeText.textContent = timeframe.toUpperCase() + ' Change';
                }
            }

            // کلیک روی کارت‌های کوین
            document.querySelectorAll('.glass-api-card').forEach(card => {
                card.addEventListener('click', function(e) {
                    if (!e.target.classList.contains('timeframe-btn')) {
                        // رفتن به صفحه تحلیل تکنیکال کوین
                        const symbol = this.querySelector('.coin-symbol').textContent;
                        window.open('/api/coin/' + symbol.toLowerCase() + '/technical', '_blank');
                    }
                });
            });
        </script>
    </body>
    </html>
    `);
});

module.exports = router;
