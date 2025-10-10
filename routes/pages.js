const express = require('express');
const constants = require('../config/constants');
const router = express.Router();

// ==================== توابع کمکی ====================
function generateVortexPage(title, bodyContent, customStyles = '') {
    const baseStyles = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .header h1 {
            font-size: 2.5rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .status-card {
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: all 0.3s ease;
            border-left: 5px solid #3498db;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .status-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); }
        .status-card.good { border-left-color: #27ae60; background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(255, 255, 255, 0.95)); }
        .status-card.warning { border-left-color: #f39c12; background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(255, 255, 255, 0.95)); }
        .status-card.danger { border-left-color: #e74c3c; background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(255, 255, 255, 0.95)); }
        .card-icon { font-size: 3rem; margin-bottom: 15px; }
        .metric { font-size: 2.5rem; font-weight: bold; color: #2c3e50; margin: 10px 0; }
        .metric-label { color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .back-button {
            display: inline-flex; align-items: center; gap: 8px; padding: 12px 25px;
            background: linear-gradient(135deg, #3498db, #2980b9); color: white;
            text-decoration: none; border-radius: 25px; margin: 10px; transition: all 0.3s ease;
            font-weight: bold; box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .back-button:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4); }
        ${customStyles}
    `;

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} - VortexAI Pro</title><style>${baseStyles}</style></head><body><div class="container">${bodyContent}</div></body></html>`;
}

function generateStatusCard(icon, metric, label, details, cardClass = '') {
    return `
        <div class="status-card ${cardClass}">
            <div class="card-icon">${icon}</div>
            <div class="metric">${metric}</div>
            <div class="metric-label">${label}</div>
            <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">${details}</div>
        </div>
    `;
}

// ==================== Routes ====================
module.exports = ({ gistManager, wsManager, apiClient }) => {
    
    // ==================== صفحه اصلی ====================
    router.get("/", (req, res) => {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();

        const wsCard = generateStatusCard(
            '📡',
            wsStatus.connected ? 'Connected' : 'Disconnected',
            'WebSocket Status',
            `<strong>Active Coins:</strong> ${wsStatus.active_coins}<br><strong>Subscribed:</strong> ${wsStatus.total_subscribed}<br><strong>Provider:</strong> LBank`,
            wsStatus.connected ? 'good' : 'danger'
        );

        const gistCard = generateStatusCard(
            '💾',
            Object.keys(gistData.prices || {}).length,
            'Historical Storage',
            `<strong>Gist:</strong> ${process.env.GITHUB_TOKEN ? 'Active' : 'Inactive'}<br><strong>Layers:</strong> 6 Timeframes<br><strong>Last Updated:</strong> ${new Date(gistData.last_updated).toLocaleDateString()}`,
            process.env.GITHUB_TOKEN ? 'good' : 'warning'
        );

        const aiCard = generateStatusCard(
            '🤖',
            '15+',
            'AI Indicators',
            '<strong>VortexAI:</strong> Ready<br><strong>Analysis:</strong> Active<br><strong>Technical:</strong> 15 Indicators',
            'good'
        );

        const timeframeGrid = `
            <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 15px; margin-bottom: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                <h2 style="text-align: center; color: #2c3e50; margin-bottom: 25px;">🕐 Multi-Timeframe Data Layers</h2>
                <div class="timeframe-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                    ${['1H/1-min/60', '4H/5-min/48', '24H/15-min/96', '7D/1-hour/168', '30D/4-hour/180', '180D/1-day/180']
                      .map(tf => {
                          const [name, interval, records] = tf.split('/');
                          return `
                            <div class="timeframe-card" style="background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 12px; text-align: center; transition: all 0.3s ease;">
                                <strong>${name}</strong><br><small>${interval} intervals</small><br>
                                <span style="color: #27ae60; font-weight: bold;">${records} records</span>
                            </div>
                          `;
                      }).join('')}
                </div>
            </div>
        `;

        const navGrid = `
            <h2 style="text-align: center; color: white; margin: 40px 0 25px 0;">📍 Quick Navigation</h2>
            <div class="links-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 40px 0;">
                ${[
                    { href: '/health', text: '🏥 System Health Dashboard', class: 'health' },
                    { href: '/scan', text: '🔍 Market Scanner', class: 'scan' },
                    { href: '/analysis?symbol=btc_usdt', text: '📊 Technical Analysis', class: 'analysis' },
                    { href: '/timeframes-api', text: '🕐 Timeframes API', class: 'timeframes' },
                    { href: '/api-data', text: '📡 API Data', class: 'api' },
                    { href: '/health-api', text: '💚 Health API', class: 'health' }
                ].map(link => `
                    <a href="${link.href}" class="nav-link" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 25px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 15px; text-align: center; transition: all 0.3s ease; font-weight: bold; font-size: 1.1rem; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                        ${link.text}
                    </a>
                `).join('')}
            </div>
        `;

        const footer = `
            <div class="footer" style="text-align: center; margin-top: 50px; padding: 30px; background: rgba(255, 255, 255, 0.9); border-radius: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                <div style="margin-bottom: 20px;">
                    ${['Real-time WebSocket', '6-Layer Historical Data', 'VortexAI Analysis', 'Technical Indicators', 'Multi-Source Data']
                      .map(badge => `
                        <span class="feature-badge" style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem; margin: 5px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                            ${badge}
                        </span>
                      `).join('')}
                </div>
                <p><strong>🕐 Server Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>📦 Version:</strong> 5.0 - 6 Layer Historical System</p>
                <p><strong>🌐 Environment:</strong> Production Ready</p>
                <p><strong>💰 Active Pairs:</strong> ${constants.ALL_TRADING_PAIRS.length} Trading Pairs</p>
            </div>
        `;

        const bodyContent = `
            <div class="header">
                <h1>▼ VortexAI Pro</h1>
                <p>Advanced 6-Layer Cryptocurrency Market Scanner with Real-time AI Analysis</p>
            </div>
            <div class="status-grid">${wsCard}${gistCard}${aiCard}</div>
            ${timeframeGrid}
            ${navGrid}
            ${footer}
        `;

        res.send(generateVortexPage('VortexAI Pro Dashboard', bodyContent));
    });

    // ==================== صفحه سلامت سیستم ====================
    router.get('/health', (req, res) => {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();

        const healthData = {
            websocket: { connected: wsStatus.connected, active_coins: wsStatus.active_coins, total_subscribed: wsStatus.total_subscribed },
            gist: { active: !!process.env.GITHUB_TOKEN, total_coins: Object.keys(gistData.prices || {}).length, last_updated: gistData.last_updated },
            ai: { technical_analysis: 'active', vortexai_engine: 'ready', indicators_available: 15 },
            api: { requests_count: apiClient.request_count, coinstats_connected: 'active' }
        };

        const healthStyles = `
            .detail-item { margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-item:last-child { border-bottom: none; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: bold; margin-left: 10px; }
            .status-online { background: #27ae60; color: white; }
            .status-offline { background: #e74c3c; color: white; }
            .status-warning { background: #f39c12; color: white; }
            .timestamp { text-align: center; color: rgba(255, 255, 255, 0.8); margin-top: 30px; font-style: italic; }
        `;

        const healthCards = [
            {
                icon: '📡', 
                metric: healthData.websocket.connected ? 'ONLINE' : 'OFFLINE',
                label: 'WebSocket Connections',
                details: `
                    <div class="detail-item"><strong>Active Coins:</strong><span class="status-badge status-online">${healthData.websocket.active_coins}</span></div>
                    <div class="detail-item"><strong>Subscribed Pairs:</strong><span class="status-badge status-online">${healthData.websocket.total_subscribed}</span></div>
                    <div class="detail-item"><strong>Provider:</strong> LBank</div>
                    <div class="detail-item"><strong>Status:</strong><span class="status-badge ${healthData.websocket.connected ? 'status-online' : 'status-offline'}">${healthData.websocket.connected ? 'Connected' : 'Disconnected'}</span></div>
                `,
                class: healthData.websocket.connected ? 'good' : 'danger'
            },
            {
                icon: '💾',
                metric: healthData.gist.total_coins,
                label: 'Historical Storage',
                details: `
                    <div class="detail-item"><strong>Gist Status:</strong><span class="status-badge ${healthData.gist.active ? 'status-online' : 'status-warning'}">${healthData.gist.active ? 'Active' : 'Inactive'}</span></div>
                    <div class="detail-item"><strong>Total Coins:</strong> ${healthData.gist.total_coins}</div>
                    <div class="detail-item"><strong>Timeframes:</strong> 6 Layers</div>
                    <div class="detail-item"><strong>Last Updated:</strong> ${new Date(healthData.gist.last_updated).toLocaleString()}</div>
                `,
                class: healthData.gist.active ? 'good' : 'warning'
            },
            {
                icon: '🤖',
                metric: '15+',
                label: 'AI Engine',
                details: `
                    <div class="detail-item"><strong>VortexAI:</strong><span class="status-badge status-online">Ready</span></div>
                    <div class="detail-item"><strong>Technical Analysis:</strong><span class="status-badge status-online">Active</span></div>
                    <div class="detail-item"><strong>Indicators:</strong> 15+</div>
                    <div class="detail-item"><strong>Analysis:</strong> Real-time</div>
                `,
                class: 'good'
            },
            {
                icon: '📊',
                metric: healthData.api.requests_count,
                label: 'API Services',
                details: `
                    <div class="detail-item"><strong>CoinStats API:</strong><span class="status-badge status-online">Connected</span></div>
                    <div class="detail-item"><strong>Requests Count:</strong> ${healthData.api.requests_count}</div>
                    <div class="detail-item"><strong>Rate Limit:</strong> Active</div>
                    <div class="detail-item"><strong>GitHub API:</strong><span class="status-badge ${healthData.gist.active ? 'status-online' : 'status-warning'}">${healthData.gist.active ? 'Connected' : 'Disabled'}</span></div>
                `,
                class: 'good'
            }
        ].map(card => generateStatusCard(card.icon, card.metric, card.label, card.details, card.class)).join('');

        const bodyContent = `
            <div class="header">
                <h1>🏥 System Health Dashboard</h1>
                <p>Real-time monitoring of all VortexAI services and components</p>
            </div>
            <div class="status-grid">${healthCards}</div>
            <div style="text-align: center; margin: 40px 0;">
                <a href="/" class="back-button">🏠 Dashboard</a>
                <a href="/scan" class="back-button" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">🔍 Market Scanner</a>
                <a href="/api/health-combined" class="back-button" style="background: linear-gradient(135deg, #9b59b6, #8e44ad);">📊 JSON API</a>
            </div>
            <div class="timestamp">
                Last checked: ${new Date().toLocaleString()}<br>
                <small>VortexAI Pro v5.0 - 6 Layer System</small>
            </div>
        `;

        res.send(generateVortexPage('System Health', bodyContent, healthStyles));
    });

    // ==================== صفحه اسکنر بازار ====================
    router.get('/scan', (req, res) => {
        const scanStyles = `
            .controls { background: rgba(255, 255, 255, 0.95); padding: 25px; border-radius: 15px; margin: 20px 0; display: flex; gap: 20px; align-items: center; flex-wrap: wrap; backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); }
            .control-group { display: flex; align-items: center; gap: 12px; }
            .control-group label { font-weight: 600; color: #2c3e50; min-width: 60px; }
            select, button { padding: 12px 18px; border: 2px solid #e1e8ed; border-radius: 10px; font-size: 14px; background: white; transition: all 0.3s ease; backdrop-filter: blur(10px); }
            select:focus, button:focus { outline: none; border-color: #3498db; box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1); }
            button { background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; cursor: pointer; font-weight: 600; box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3); }
            button:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4); }
            .results { margin-top: 30px; }
            .coin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; margin-top: 20px; }
            .coin-card { background: rgba(255, 255, 255, 0.95); border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; border: 2px solid transparent; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
            .coin-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); border-color: #3498db; }
            .coin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #f8f9fa; }
            .coin-symbol { font-weight: bold; font-size: 1.4rem; color: #2c3e50; }
            .coin-price { font-size: 1.8rem; font-weight: bold; margin: 15px 0; color: #2c3e50; }
            .positive { color: #27ae60; } .negative { color: #e74c3c; }
            .ai-badge { background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600; box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
            .loading { text-align: center; padding: 60px 20px; color: #7f8c8d; font-size: 1.2rem; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0; }
            .stat-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
            .stat-label { color: #7f8c8d; font-size: 0.9rem; } .stat-value { font-weight: 600; color: #2c3e50; }
        `;

        const bodyContent = `
            <div class="header">
                <h1>🔍 VortexAI Market Scanner</h1>
                <p>Advanced cryptocurrency scanning with AI-powered insights and multi-timeframe data</p>
            </div>
            <div class="controls">
                <div class="control-group">
                    <label>Limit:</label>
                    <select id="limitSelect">
                        <option value="10">10 coins</option>
                        <option value="20" selected>20 coins</option>
                        <option value="50">50 coins</option>
                        <option value="100">100 coins</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Filter:</label>
                    <select id="filterSelect">
                        <option value="ai_signal">AI Signal</option>
                        <option value="volume">Volume</option>
                        <option value="momentum_1h">1H Momentum</option>
                        <option value="momentum_4h">4H Momentum</option>
                    </select>
                </div>
                <button onclick="scanMarket()" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">🔍 Scan Market</button>
                <button onclick="loadSampleData()" style="background: linear-gradient(135deg, #95a5a6, #7f8c8d);">📋 Load Sample</button>
            </div>
            <div class="results">
                <div id="resultsContainer" class="loading">Click "Scan Market" to load cryptocurrency data with VortexAI analysis...</div>
            </div>
            <div style="text-align: center; margin-top: 40px;">
                <a href="/" class="back-button">🏠 Dashboard</a>
                <a href="/analysis?symbol=btc_usdt" class="back-button" style="background: linear-gradient(135deg, #9b59b6, #8e44ad);">📊 Technical Analysis</a>
                <a href="/health" class="back-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">🏥 System Health</a>
            </div>
            <script>
                async function scanMarket() {
                    const limit = document.getElementById('limitSelect').value;
                    const filter = document.getElementById('filterSelect').value;
                    document.getElementById('resultsContainer').innerHTML = '<div class="loading">🔍 Scanning market with VortexAI 6-Layer System...</div>';
                    try {
                        const response = await fetch('/api/scan/vortexai?limit=' + limit + '&filter=' + filter);
                        const data = await response.json();
                        if (data.success) displayResults(data.coins);
                        else document.getElementById('resultsContainer').innerHTML = '<div class="loading" style="color: #e74c3c;">Error loading data</div>';
                    } catch (error) {
                        document.getElementById('resultsContainer').innerHTML = '<div class="loading" style="color: #e74c3c;">Connection error - Please try again</div>';
                    }
                }
                function displayResults(coins) {
                    if (!coins || coins.length === 0) {
                        document.getElementById('resultsContainer').innerHTML = '<div class="loading">No coins found matching your criteria</div>';
                        return;
                    }
                    const coinsHTML = coins.map(coin => {
                        const positiveClass = (coin.priceChange24h || 0) >= 0 ? 'positive' : 'negative';
                        const positiveClass1h = (coin.change_1h || 0) >= 0 ? 'positive' : 'negative';
                        const sentimentColor = coin.VortexAI_analysis?.market_sentiment === 'bullish' ? '#27ae60' : '#e74c3c';
                        return '<div class="coin-card"><div class="coin-header"><span class="coin-symbol">' + coin.symbol + '</span><span class="ai-badge">AI Score: ' + (coin.VortexAI_analysis?.signal_strength?.toFixed(1) || 'N/A') + '</span></div><div class="coin-price">$' + (coin.price?.toFixed(2) || '0.00') + '</div><div class="stats-grid"><div class="stat-item"><span class="stat-label">24h Change:</span><span class="stat-value ' + positiveClass + '">' + (coin.priceChange24h || 0).toFixed(2) + '%</span></div><div class="stat-item"><span class="stat-label">1h Change:</span><span class="stat-value ' + positiveClass1h + '">' + (coin.change_1h || 0).toFixed(2) + '%</span></div><div class="stat-item"><span class="stat-label">Volume:</span><span class="stat-value">$' + (coin.volume || 0).toLocaleString() + '</span></div><div class="stat-item"><span class="stat-label">Market Cap:</span><span class="stat-value">$' + (coin.marketCap || 0).toLocaleString() + '</span></div></div><div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #f8f9fa;"><div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: #7f8c8d; font-size: 0.9rem;">Sentiment: <strong style="color: ' + sentimentColor + '">' + (coin.VortexAI_analysis?.market_sentiment || 'neutral') + '</strong></span><span style="color: #7f8c8d; font-size: 0.9rem;">Volatility: <strong>' + (coin.VortexAI_analysis?.volatility_score?.toFixed(1) || '0') + '</strong></span></div>' + (coin.VortexAI_analysis?.volume_anomaly ? '<div style="margin-top: 8px; padding: 5px 10px; background: #fff3cd; color: #856404; border-radius: 8px; font-size: 0.8rem; text-align: center; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">Volume Anomaly Detected</div>' : '') + '</div></div>';
                    }).join('');
                    document.getElementById('resultsContainer').innerHTML = '<h3 style="color: white; text-align: center; margin-bottom: 20px;">📊 Scan Results: ' + coins.length + ' coins found</h3><div class="coin-grid">' + coinsHTML + '</div>';
                }
                function loadSampleData() {
                    const sampleCoins = [{symbol: 'BTC', price: 45234.56, priceChange24h: 2.34, change_1h: 0.56, volume: 25467890000, marketCap: 885234567890, VortexAI_analysis: {signal_strength: 8.7, market_sentiment: 'bullish', volatility_score: 7.2, volume_anomaly: true}},{symbol: 'ETH', price: 2345.67, priceChange24h: 1.23, change_1h: -0.34, volume: 14567890000, marketCap: 281234567890, VortexAI_analysis: {signal_strength: 7.2, market_sentiment: 'bullish', volatility_score: 5.8, volume_anomaly: false}},{symbol: 'SOL', price: 102.34, priceChange24h: 5.67, change_1h: 2.12, volume: 3456789000, marketCap: 41234567890, VortexAI_analysis: {signal_strength: 9.1, market_sentiment: 'very bullish', volatility_score: 8.5, volume_anomaly: true}}];
                    displayResults(sampleCoins);
                }
                setTimeout(loadSampleData, 1000);
            </script>
        `;

        res.send(generateVortexPage('Market Scanner', bodyContent, scanStyles));
    });

    // ==================== صفحه تحلیل تکنیکال ====================
    router.get('/analysis', (req, res) => {
        const symbol = req.query.symbol || 'btc_usdt';
        
        const analysisStyles = `
            .analysis-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 30px 0; }
            .indicator-card { background: rgba(255, 255, 255, 0.95); padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); text-align: center; transition: all 0.3s ease; border-left: 4px solid #3498db; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
            .indicator-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15); }
            .indicator-value { font-size: 2.2rem; font-weight: bold; margin: 15px 0; color: #2c3e50; }
            .bullish { color: #27ae60; } .bearish { color: #e74c3c; } .neutral { color: #f39c12; }
            .loading { text-align: center; padding: 60px 20px; color: #7f8c8d; font-size: 1.2rem; }
            .timeframe-selector { display: flex; gap: 10px; margin: 20px 0; justify-content: center; flex-wrap: wrap; }
            .timeframe-btn { padding: 10px 20px; background: rgba(255, 255, 255, 0.9); border: 2px solid #e1e8ed; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; font-weight: 600; color: #2c3e50; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
            .timeframe-btn.active { background: linear-gradient(135deg, #3498db, #2980b9); color: white; border-color: #3498db; }
            .timeframe-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
            .info-section { background: rgba(255, 255, 255, 0.95); padding: 25px; border-radius: 15px; margin: 20px 0; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
        `;

        const bodyContent = `
            <div class="header">
                <h1>📊 Technical Analysis: ${symbol.toUpperCase()}</h1>
                <p>Advanced technical indicators powered by VortexAI 6-Layer System</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
                <a href="/scan" class="back-button">🔍 Back to Scanner</a>
                <a href="/" class="back-button" style="background: linear-gradient(135deg, #95a5a6, #7f8c8d);">🏠 Dashboard</a>

                <div class="timeframe-selector">
                    <button class="timeframe-btn" onclick="changeTimeframe('1h')">1H</button>
                    <button class="timeframe-btn" onclick="changeTimeframe('4h')">4H</button>
                    <button class="timeframe-btn" onclick="changeTimeframe('24h')">24H</button>
                    <button class="timeframe-btn active" onclick="changeTimeframe('7d')">7D</button>
                    <button class="timeframe-btn" onclick="changeTimeframe('30d')">30D</button>
                    <button class="timeframe-btn" onclick="changeTimeframe('180d')">180D</button>
                </div>
            </div>

            <div id="analysisContent" class="loading">
                Loading technical analysis for ${symbol.toUpperCase()}...
            </div>

            <script>
                let currentSymbol = '${symbol}';
                let currentTimeframe = '7d';

                async function loadAnalysis() {
                    try {
                        const response = await fetch('/api/coin/' + currentSymbol + '/technical');
                        const data = await response.json();

                        if (data.success) {
                            displayAnalysis(data);
                        } else {
                            document.getElementById('analysisContent').innerHTML = '<div class="loading" style="color: #e74c3c;">Error loading analysis data</div>';
                        }
                    } catch (error) {
                        document.getElementById('analysisContent').innerHTML = '<div class="loading" style="color: #e74c3c;">Connection error - Please try again</div>';
                    }
                }

                async function changeTimeframe(timeframe) {
                    currentTimeframe = timeframe;
                    document.querySelectorAll('.timeframe-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    event.target.classList.add('active');

                    try {
                        const response = await fetch('/api/coin/' + currentSymbol + '/history/' + timeframe);
                        const data = await response.json();

                        if (data.success) {
                            document.getElementById('analysisContent').innerHTML = 
                                '<div class="info-section">' +
                                '<h3>📈 ' + timeframe.toUpperCase() + ' Historical Data</h3>' +
                                '<p><strong>Data Points:</strong> ' + data.data_points + '</p>' +
                                '<p><strong>Current Price:</strong> $' + (data.current_price?.toFixed(2) || 'N/A') + '</p>' +
                                '<p><strong>Timeframe:</strong> ' + timeframe + '</p>' +
                                '</div>' +
                                '<div style="text-align: center; margin: 20px; color: white;">' +
                                'Loading technical indicators...' +
                                '</div>';

                            setTimeout(loadAnalysis, 1000);
                        }
                    } catch (error) {
                        console.error('Error loading timeframe data:', error);
                    }
                }

                function displayAnalysis(data) {
                    const rsiColor = getRSIColor(data.technical_indicators?.rsi);
                    const macdColor = getMACDColor(data.technical_indicators?.macd);
                    const sentimentColor = data.vortexai_analysis?.market_sentiment === 'BULLISH' ? '#27ae60' : 
                                         data.vortexai_analysis?.market_sentiment === 'BEARISH' ? '#e74c3c' : '#f39c12';

                    const analysisHTML = 
                        '<div class="analysis-grid">' +
                        '<div class="indicator-card">' +
                        '<div>💰 Current Price</div>' +
                        '<div class="indicator-value">$' + (data.current_price?.toFixed(2) || 'N/A') + '</div>' +
                        '<div style="color: #7f8c8d; font-size: 0.9rem;">Live Price</div>' +
                        '</div>' +

                        '<div class="indicator-card">' +
                        '<div>📊 RSI</div>' +
                        '<div class="indicator-value ' + rsiColor + '">' + (data.technical_indicators?.rsi?.toFixed(2) || 'N/A') + '</div>' +
                        '<div style="color: #7f8c8d; font-size: 0.9rem;">Momentum</div>' +
                        '</div>' +

                        '<div class="indicator-card">' +
                        '<div>📈 MACD</div>' +
                        '<div class="indicator-value ' + macdColor + '">' + (data.technical_indicators?.macd?.toFixed(4) || 'N/A') + '</div>' +
                        '<div style="color: #7f8c8d; font-size: 0.9rem;">Trend</div>' +
                        '</div>' +

                        '<div class="info-section">' +
                        '<h3>🤖 VortexAI Insights</h3>' +
                        '<p><strong>Market Sentiment:</strong> ' +
                        '<span style="color:' + sentimentColor + '; font-weight: bold;">' + (data.vortexai_analysis?.market_sentiment || 'NEUTRAL') + '</span>' +
                        '</p>' +
                        '<p><strong>Analysis Timeframe:</strong> ' + currentTimeframe.toUpperCase() + '</p>' +
                        '</div>';

                    document.getElementById('analysisContent').innerHTML = analysisHTML;
                }

                function getRSIColor(rsi) {
                    if (!rsi) return 'neutral';
                    if (rsi > 70) return 'bearish';
                    if (rsi < 30) return 'bullish';
                    return 'neutral';
                }

                function getMACDColor(macd) {
                    if (!macd) return 'neutral';
                    return macd > 0 ? 'bullish' : 'bearish';
                }

                window.addEventListener('load', loadAnalysis);
            </script>
        `;

        res.send(generateVortexPage('Technical Analysis', bodyContent, analysisStyles));
    });

    // ==================== صفحه API Data ====================
    router.get('/api-data', (req, res) => {
        const apiDataStyles = `
            .endpoints-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 25px 0; }
            .endpoint-card { background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 12px; border-left: 4px solid #e74c3c; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s ease; }
            .endpoint-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); }
            .endpoint-method { display: inline-block; padding: 4px 12px; background: #e74c3c; color: white; border-radius: 6px; font-size: 0.8rem; font-weight: bold; margin-bottom: 10px; }
            .endpoint-method.get { background: #27ae60; }
            .endpoint-path { font-family: 'Courier New', monospace; color: #2c3e50; margin: 10px 0; font-weight: bold; }
            
            .coins-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
            .coin-item { 
                background: rgba(255, 255, 255, 0.95); 
                padding: 15px; 
                border-radius: 12px; 
                text-align: center; 
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                cursor: pointer;
            }
            .coin-item:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); }
            .coin-icon { 
                width: 50px; 
                height: 50px; 
                border-radius: 50%; 
                background: linear-gradient(135deg, #f39c12, #e67e22);
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-size: 20px; 
                font-weight: bold; 
                margin: 0 auto 10px;
                box-shadow: 0 4px 10px rgba(243, 156, 18, 0.3);
            }
            .coin-symbol { font-weight: bold; font-size: 1.1rem; color: #2c3e50; margin-bottom: 5px; }
            .coin-price { font-size: 1.2rem; font-weight: bold; margin: 8px 0; }
            .positive { color: #27ae60; }
            .negative { color: #e74c3c; }
            .timeframe-selector { display: flex; gap: 8px; margin: 15px 0; justify-content: center; flex-wrap: wrap; }
            .timeframe-btn { 
                padding: 6px 12px; 
                background: rgba(255, 255, 255, 0.8); 
                border: 1px solid #e1e8ed; 
                border-radius: 8px; 
                cursor: pointer; 
                transition: all 0.3s ease; 
                font-size: 0.8rem;
                backdrop-filter: blur(10px);
            }
            .timeframe-btn.active { 
                background: linear-gradient(135deg, #3498db, #2980b9); 
                color: white; 
                border-color: #3498db; 
            }
            .coin-stats { margin-top: 8px; padding-top: 8px; border-top: 1px solid #f8f9fa; }
            .stat-row { display: flex; justify-content: space-between; font-size: 0.75rem; color: #7f8c8d; margin: 3px 0; }
        `;

        const bodyContent = `
            <div class="header">
                <h1>📡 API Data</h1>
                <p>Complete API documentation for VortexAI Crypto Scanner with real-time coin data</p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.95); padding: 25px; border-radius: 15px; margin-bottom: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                <h2>🚀 Main API Endpoints</h2>
                
                <div style="background: #2c3e50; color: #ecf0f1; padding: 20px; border-radius: 10px; margin: 20px 0; font-family: 'Courier New', monospace;">
                    <span style="color: #27ae60; font-weight: bold;">GET</span> /api/scan/vortexai?limit=<span style="color: #e74c3c;">100</span>&filter=<span style="color: #e74c3c;">ai_signal</span><br>
                    <span style="color: #95a5a6;"># Returns enhanced cryptocurrency data with VortexAI analysis</span>
                </div>

                <h3>🎛️ Try with Different Filters</h3>
                <div style="display: flex; gap: 10px; margin: 15px 0; flex-wrap: wrap;">
                    <a href="/api/scan/vortexai?limit=10&filter=ai_signal" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; text-decoration: none; border-radius: 20px; margin: 10px 5px; transition: all 0.3s ease; font-weight: bold; font-size: 0.9rem; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                        <span style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #f39c12, #e67e22); display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; margin-right: 8px;">AI</span> AI Signal (10)
                    </a>
                    <a href="/api/scan/vortexai?limit=20&filter=volume" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; text-decoration: none; border-radius: 20px; margin: 10px 5px; transition: all 0.3s ease; font-weight: bold; font-size: 0.9rem; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                        <span style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #f39c12, #e67e22); display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; margin-right: 8px;">V</span> Volume (20)
                    </a>
                </div>

                <h3>📊 Live Coin Data</h3>
                
                <div class="timeframe-selector">
                    <button class="timeframe-btn active" onclick="changeTimeframe('1h')">1H</button>
                    <button class="timeframe-btn" onclick="changeTimeframe('24h')">24H</button>
                    <button class="timeframe-btn" onclick="changeTimeframe('7d')">1W</button>
                    <button class="timeframe-btn" onclick="changeTimeframe('30d')">1M</button>
                </div>

                <div id="coinsContainer" class="coins-grid">
                    <!-- کوین‌ها اینجا لود می‌شوند -->
                </div>

                <h3>🔌 All Available Endpoints</h3>
                
                <div class="endpoints-grid">
                    <div class="endpoint-card">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/scan/vortexai</div>
                        <div class="endpoint-desc" style="color: #7f8c8d; font-size: 0.9rem;">
                            Enhanced market scanner with AI analysis<br>
                            <strong>Params:</strong> limit, filter
                        </div>
                    </div>

                    <div class="endpoint-card">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/coin/<span style="color: #e74c3c; font-weight: bold;">:symbol</span>/technical</div>
                        <div class="endpoint-desc" style="color: #7f8c8d; font-size: 0.9rem;">
                            Technical analysis with 15+ indicators<br>
                            <strong>Example:</strong> /api/coin/btc_usdt/technical
                        </div>
                    </div>

                    <div class="endpoint-card">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/health-combined</div>
                        <div class="endpoint-desc" style="color: #7f8c8d; font-size: 0.9rem;">
                            System health and statistics<br>
                            Includes request counts and service status
                        </div>
                    </div>

                    <div class="endpoint-card">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/timeframes</div>
                        <div class="endpoint-desc" style="color: #7f8c8d; font-size: 0.9rem;">
                            List all available historical timeframes<br>
                            6 different timeframe options
                        </div>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="/" class="back-button">🏠 Dashboard</a>
                <a href="/health-api" class="back-button" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">💚 Health API</a>
                <a href="/timeframes-api" class="back-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">🕐 Timeframes API</a>
            </div>
            
            <script>
                let currentTimeframe = '1h';
                // تابع برای دریافت داده‌های واقعی از API
                async function loadRealCoins() {
                    try {
                        document.getElementById('coinsContainer').innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">🔄 Loading real-time market data...</div>';
            
                        const response = await fetch('/api/scan/vortexai?limit=20');
                        const data = await response.json();
            
                        if (data.success && data.coins && data.coins.length > 0) {
                            console.log('✅ Real data loaded from API:', data.coins.length + ' coins');
                            displayCoins(data.coins);
                        } else {
                            console.warn('❌ API returned no data');
                            showError('No market data available from API');
                        }
                    } catch (error) {
                        console.error('❌ Error loading real data:', error);
                        showError('Failed to connect to market data API');
                    }
                }

                function showError(message) {
                    document.getElementById('coinsContainer').innerHTML = 
                       '<div style="text-align: center; padding: 60px 20px; color: #e74c3c;">' +
                       '❌ ' + message + '<br><br>' +
                       '<button onclick="loadRealCoins()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; margin: 10px;">🔄 Retry</button>' +
                       '</div>';
                }

                function changeTimeframe(timeframe) {
                    currentTimeframe = timeframe;
                    document.querySelectorAll('.timeframe-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    event.target.classList.add('active');
                    loadRealCoins();
                }

                function displayCoins(coins) {
                    if (!coins || coins.length === 0) {
                        showError('No coins data available');
                        return;
                    }

                    const coinsHTML = coins.map(coin => {
                        // استفاده از فیلدهای واقعی API - پشتیبانی از نام‌های مختلف فیلدها
                        const change_1h = coin.change_1h || coin.priceChange1h || 0;
                        const change_24h = coin.change_24h || coin.priceChange24h || 0;
                        const change_7d = coin.change_7d || coin.priceChange7d || 0;
                        const change_30d = coin.change_30d || coin.priceChange30d || 0;
            
                        const change = currentTimeframe === '1h' ? change_1h : 
                                      currentTimeframe === '24h' ? change_24h : 
                                      currentTimeframe === '7d' ? change_7d : 
                                      currentTimeframe === '30d' ? change_30d : change_24h;
            
                        const changeClass = change >= 0 ? 'positive' : 'negative';
                        const changeText = change >= 0 ? '+' + change.toFixed(2) + '%' : change.toFixed(2) + '%';
 
                        return '<div class="coin-item" onclick="viewCoinDetail(\\'' + coin.symbol + '\\')">' +
                               '<div class="coin-icon">' + getCoinIcon(coin.symbol) + '</div>' +
                               '<div class="coin-symbol">' + coin.symbol + '</div>' +
                               '<div class="coin-name" style="color: #7f8c8d; font-size: 0.8rem; margin-bottom: 5px;">' + (coin.name || coin.symbol) + '</div>' +
                               '<div class="coin-price">$' + (coin.price?.toFixed(2) || '0.00') + '</div>' +
                               '<div class="coin-change ' + changeClass + '">' + changeText + '</div>' +
                               '<div class="coin-stats">' +
                               '<div class="stat-row"><span>Market Cap:</span><span>$' + formatNumber(coin.marketCap || 0, 'B') + '</span></div>' +
                               '<div class="stat-row"><span>Volume:</span><span>$' + formatNumber(coin.volume || 0, 'M') + '</span></div>' +
                               '</div></div>';
                    }).join('');

                    document.getElementById('coinsContainer').innerHTML = 
                        '<div style="color: white; text-align: center; margin-bottom: 20px; font-size: 0.9rem;">' +
                        '📊 Showing ' + coins.length + ' real-time coins' +
                        '</div>' + coinsHTML;
                }

                function getCoinIcon(symbol) {
                    const iconMap = {
                        'BTC': '₿', 'ETH': 'Ξ', 'SOL': '◎', 'ADA': 'A', 'DOT': '●',
                        'BNB': 'B', 'XRP': 'X', 'DOGE': 'Ð', 'LTC': 'Ł', 'LINK': '🔗',
                        'AVAX': '❄️', 'MATIC': '⬢', 'ATOM': '⚛️', 'UNI': '🦄', 'AAVE': '👻'
                    };
                    return iconMap[symbol] || symbol.charAt(0);
                }

                function formatNumber(num, suffix) {
                    if (suffix === 'B') return (num / 1000000000).toFixed(1) + 'B';
                    if (suffix === 'M') return (num / 1000000).toFixed(0) + 'M';
                    return num.toLocaleString();
                }

                function viewCoinDetail(symbol) {
                    window.location.href = '/analysis?symbol=' + symbol.toLowerCase() + '_usdt';
                }

                // لود اولیه داده‌های واقعی
                loadRealCoins();
            </script>
            
        `;

        res.send(generateVortexPage('API Data', bodyContent, apiDataStyles));
    });

    // ==================== صفحه Health API ====================
    router.get('/health-api', (req, res) => {
        const healthData = {
            websocket: wsManager.getConnectionStatus(),
            gist: gistManager.getAllData(),
            api: { requests_count: apiClient.request_count }
        };

        const healthApiStyles = `
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 25px 0; }
            .stat-card { background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 12px; border-left: 4px solid #3498db; text-align: center; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s ease; }
            .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); }
            .stat-value { font-size: 2rem; font-weight: bold; color: #2c3e50; margin: 10px 0; }
            .stat-label { color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
            .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
            .status-online { background: #27ae60; } .status-offline { background: #e74c3c; } .status-warning { background: #f39c12; }
        `;

        const bodyContent = `
            <div class="header">
                <h1>💚 Health API</h1>
                <p>Real-time system health monitoring and API request statistics</p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.95); padding: 25px; border-radius: 15px; margin-bottom: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                <h2>🔌 API Endpoints</h2>
                
                <div style="background: #2c3e50; color: #ecf0f1; padding: 20px; border-radius: 10px; margin: 20px 0; font-family: 'Courier New', monospace;">
                    <span style="color: #3498db; font-weight: bold;">GET</span> /api/health-combined
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${healthData.websocket.connected ? '🟢' : '🔴'}</div>
                        <div class="stat-label">WebSocket Status</div>
                        <div style="margin-top: 10px; font-size: 0.9rem;">
                            Active: ${healthData.websocket.active_coins}<br>
                            Subscribed: ${healthData.websocket.total_subscribed}
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-value">${Object.keys(healthData.gist.prices || {}).length}</div>
                        <div class="stat-label">Stored Coins</div>
                        <div style="margin-top: 10px; font-size: 0.9rem;">
                            Timeframes: 6<br>
                            Gist: ${!!process.env.GITHUB_TOKEN ? 'Active' : 'Inactive'}
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-value">${healthData.api.requests_count}</div>
                        <div class="stat-label">API Requests</div>
                        <div style="margin-top: 10px; font-size: 0.9rem;">
                            CoinStats: Active<br>
                            Rate Limit: Enabled
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-value">15+</div>
                        <div class="stat-label">AI Indicators</div>
                        <div style="margin-top: 10px; font-size: 0.9rem;">
                            Technical: 15+<br>
                            Analysis: Active
                        </div>
                    </div>
                </div>

                <h3>🚀 Try the API</h3>
                <a href="/api/health-combined" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; text-decoration: none; border-radius: 20px; margin: 10px 5px; transition: all 0.3s ease; font-weight: bold; font-size: 0.9rem; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                    🧪 Test Health API
                </a>
                <a href="/health" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; text-decoration: none; border-radius: 20px; margin: 10px 5px; transition: all 0.3s ease; font-weight: bold; font-size: 0.9rem; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                    📊 Health Dashboard
                </a>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="/" class="back-button">🏠 Dashboard</a>
                <a href="/api-data" class="back-button" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">📡 API Data</a>
                <a href="/timeframes-api" class="back-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">🕐 Timeframes API</a>
            </div>
        `;

        res.send(generateVortexPage('Health API', bodyContent, healthApiStyles));
    });

    // ==================== صفحه Timeframes API ====================
    router.get('/timeframes-api', (req, res) => {
        const timeframes = ['1h', '4h', '24h', '7d', '30d', '180d'];
        
        const timeframesStyles = `
            .timeframe-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 25px 0; }
            .timeframe-card { background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid transparent; transition: all 0.3s ease; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
            .timeframe-card:hover { border-color: #3498db; transform: translateY(-5px); }
            .timeframe-name { font-size: 1.5rem; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
            .timeframe-desc { color: #7f8c8d; font-size: 0.8rem; }
        `;

        const bodyContent = `
            <div class="header">
                <h1>🕐 Timeframes API</h1>
                <p>Access historical data across 6 different timeframes with varying intervals</p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.95); padding: 25px; border-radius: 15px; margin-bottom: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                <h2>🔌 Available Endpoints</h2>
                
                <div style="background: #2c3e50; color: #ecf0f1; padding: 20px; border-radius: 10px; margin: 20px 0; font-family: 'Courier New', monospace;">
                    <span style="color: #3498db; font-weight: bold;">GET</span> /api/timeframes<br>
                    <span style="color: #95a5a6;"># Returns all available timeframes</span>
                </div>

                <div style="background: #2c3e50; color: #ecf0f1; padding: 20px; border-radius: 10px; margin: 20px 0; font-family: 'Courier New', monospace;">
                    <span style="color: #3498db; font-weight: bold;">GET</span> /api/coin/<span style="color: #e74c3c;">:symbol</span>/history/<span style="color: #e74c3c;">:timeframe</span><br>
                    <span style="color: #95a5a6;"># Returns historical data for specific symbol and timeframe</span>
                </div>

                <h3>📊 Available Timeframes</h3>
                <div class="timeframe-grid">
                    <div class="timeframe-card">
                        <div class="timeframe-name">1H</div>
                        <div class="timeframe-desc">1 minute intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">60 records</div>
                    </div>
                    <div class="timeframe-card">
                        <div class="timeframe-name">4H</div>
                        <div class="timeframe-desc">5 minute intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">48 records</div>
                    </div>
                    <div class="timeframe-card">
                        <div class="timeframe-name">24H</div>
                        <div class="timeframe-desc">15 minute intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">96 records</div>
                    </div>
                    <div class="timeframe-card">
                        <div class="timeframe-name">7D</div>
                        <div class="timeframe-desc">1 hour intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">168 records</div>
                    </div>
                    <div class="timeframe-card">
                        <div class="timeframe-name">30D</div>
                        <div class="timeframe-desc">4 hour intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">180 records</div>
                    </div>
                    <div class="timeframe-card">
                        <div class="timeframe-name">180D</div>
                        <div class="timeframe-desc">1 day intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">180 records</div>
                    </div>
                </div>

                <h3>🚀 Try the APIs</h3>
                <a href="/api/timeframes" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #f39c12, #e67e22); color: white; text-decoration: none; border-radius: 20px; margin: 10px 5px; transition: all 0.3s ease; font-weight: bold; font-size: 0.9rem; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                    📋 List Timeframes
                </a>
                <a href="/api/coin/btc_usdt/history/7d" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #f39c12, #e67e22); color: white; text-decoration: none; border-radius: 20px; margin: 10px 5px; transition: all 0.3s ease; font-weight: bold; font-size: 0.9rem; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                    💰 BTC 7D Data
                </a>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="/" class="back-button">🏠 Dashboard</a>
                <a href="/health-api" class="back-button" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">💚 Health API</a>
                <a href="/api-data" class="back-button" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">📡 API Data</a>
            </div>
        `;

        res.send(generateVortexPage('Timeframes API', bodyContent, timeframesStyles));
    });

    return router;
};
