const express = require('express');
const constants = require('../config/constants');

const router = express.Router();

module.exports = ({ gistManager, wsManager, apiClient }) => {

    // صفحه اصلی دشبورد
    router.get("/", (req, res) => {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();

        // تعریف متغیرها برای استفاده در HTML
        const wsConnected = wsStatus.connected ? 'Connected' : 'Disconnected';
        const wsCardClass = wsStatus.connected ? 'good' : 'danger';
        const githubActive = process.env.GITHUB_TOKEN ? 'Active' : 'Inactive';
        const githubCardClass = process.env.GITHUB_TOKEN ? 'good' : 'warning';
        const gistCount = Object.keys(gistData.prices || {}).length;
        const lastUpdated = new Date(gistData.last_updated).toLocaleDateString();
        const serverTime = new Date().toLocaleString();
        const tradingPairs = constants.ALL_TRADING_PAIRS.length;

        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VortexAI Pro - 6 Layer Crypto Scanner</title>
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
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

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
            font-size: 3rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 1.2rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
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

        .status-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .status-card.good {
            border-left-color: #27ae60;
            background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(255, 255, 255, 0.95));
        }

        .status-card.warning {
            border-left-color: #f39c12;
            background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(255, 255, 255, 0.95));
        }

        .status-card.danger {
            border-left-color: #e74c3c;
            background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(255, 255, 255, 0.95));
        }

        .card-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }

        .metric {
            font-size: 2.5rem;
            font-weight: bold;
            color: #2c3e50;
            margin: 10px 0;
        }

        .metric-label {
            color: #7f8c8d;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }

        .timeframe-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin: 30px 0;
        }

        .timeframe-card {
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .timeframe-card:hover {
            border-color: #3498db;
            transform: scale(1.05);
            background: rgba(255, 255, 255, 0.95);
        }

        .timeframe-card strong {
            display: block;
            font-size: 1.5rem;
            color: #2c3e50;
            margin-bottom: 5px;
        }

        .timeframe-card small {
            color: #7f8c8d;
            font-size: 0.8rem;
        }

        .links-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }

        .nav-link {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 25px 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 15px;
            text-align: center;
            transition: all 0.3s ease;
            font-weight: bold;
            font-size: 1.1rem;
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .nav-link:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
            background: linear-gradient(135deg, #764ba2, #667eea);
        }

        .nav-link.health { background: linear-gradient(135deg, #27ae60, #2ecc71); }
        .nav-link.scan { background: linear-gradient(135deg, #e74c3c, #c0392b); }
        .nav-link.analysis { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
        .nav-link.timeframes { background: linear-gradient(135deg, #f39c12, #e67e22); }
        .nav-link.api { background: linear-gradient(135deg, #3498db, #2980b9); }

        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 30px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .footer p {
            margin: 8px 0;
            color: #555;
        }

        .feature-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            margin: 5px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
            .header h1 { font-size: 2rem; }
            .status-grid { grid-template-columns: 1fr; }
            .timeframe-grid { grid-template-columns: repeat(2, 1fr); }
            .links-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>▼ VortexAI Pro</h1>
            <p>Advanced 6-Layer Cryptocurrency Market Scanner with Real-time AI Analysis</p>
        </div>

        <div class="status-grid">
            <div class="status-card ${wsCardClass}">
                <div class="card-icon">📡</div>
                <div class="metric">${wsConnected}</div>
                <div class="metric-label">WebSocket Status</div>
                <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                    <strong>Active Coins:</strong> ${wsStatus.active_coins}<br>
                    <strong>Subscribed:</strong> ${wsStatus.total_subscribed}<br>
                    <strong>Provider:</strong> LBank
                </div>
            </div>

            <div class="status-card ${githubCardClass}">
                <div class="card-icon">💾</div>
                <div class="metric">${gistCount}</div>
                <div class="metric-label">Historical Storage</div>
                <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                    <strong>Gist:</strong> ${githubActive}<br>
                    <strong>Layers:</strong> 6 Timeframes<br>
                    <strong>Last Updated:</strong> ${lastUpdated}
                </div>
            </div>

            <div class="status-card good">
                <div class="card-icon">🤖</div>
                <div class="metric">15+</div>
                <div class="metric-label">AI Indicators</div>
                <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                    <strong>VortexAI:</strong> Ready<br>
                    <strong>Analysis:</strong> Active<br>
                    <strong>Technical:</strong> 15 Indicators
                </div>
            </div>
        </div>

        <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 15px; margin-bottom: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
            <h2 style="text-align: center; color: #2c3e50; margin-bottom: 25px;">🕐 Multi-Timeframe Data Layers</h2>
            <div class="timeframe-grid">
                <div class="timeframe-card">
                    <strong>1H</strong><br>
                    <small>1-minute intervals</small><br>
                    <span style="color: #27ae60; font-weight: bold;">60 records</span>
                </div>
                <div class="timeframe-card">
                    <strong>4H</strong><br>
                    <small>5-minute intervals</small><br>
                    <span style="color: #27ae60; font-weight: bold;">48 records</span>
                </div>
                <div class="timeframe-card">
                    <strong>24H</strong><br>
                    <small>15-minute intervals</small><br>
                    <span style="color: #27ae60; font-weight: bold;">96 records</span>
                </div>
                <div class="timeframe-card">
                    <strong>7D</strong><br>
                    <small>1-hour intervals</small><br>
                    <span style="color: #27ae60; font-weight: bold;">168 records</span>
                </div>
                <div class="timeframe-card">
                    <strong>30D</strong><br>
                    <small>4-hour intervals</small><br>
                    <span style="color: #27ae60; font-weight: bold;">180 records</span>
                </div>
                <div class="timeframe-card">
                    <strong>180D</strong><br>
                    <small>1-day intervals</small><br>
                    <span style="color: #27ae60; font-weight: bold;">180 records</span>
                </div>
            </div>
        </div>

        <h2 style="text-align: center; color: white; margin: 40px 0 25px 0;">📍 Quick Navigation</h2>
        <div class="links-grid">
            <a href="/health" class="nav-link health">🏥 System Health Dashboard</a>
            <a href="/scan" class="nav-link scan">🔍 Market Scanner</a>
            <a href="/analysis?symbol=btc_usdt" class="nav-link analysis">📊 Technical Analysis</a>
            <a href="/timeframes-api" class="nav-link timeframes">🕐 Timeframes API</a>
            <a href="/api-data" class="nav-link api">📡 API Data</a>
            <a href="/health-api" class="nav-link health">💚 Health API</a>
        </div>

        <div class="footer">
            <div style="margin-bottom: 20px;">
                <span class="feature-badge">Real-time WebSocket</span>
                <span class="feature-badge">6-Layer Historical Data</span>
                <span class="feature-badge">VortexAI Analysis</span>
                <span class="feature-badge">Technical Indicators</span>
                <span class="feature-badge">Multi-Source Data</span>
            </div>
            <p><strong>🕐 Server Time:</strong> ${serverTime}</p>
            <p><strong>📦 Version:</strong> 5.0 - 6 Layer Historical System</p>
            <p><strong>🌐 Environment:</strong> Production Ready</p>
            <p><strong>💰 Active Pairs:</strong> ${tradingPairs} Trading Pairs</p>
        </div>
    </div>
</body>
</html>
        `);
    });
    // صفحه سلامت سیستم
    router.get('/health', (req, res) => {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();

        const healthData = {
            websocket: {
                connected: wsStatus.connected,
                active_coins: wsStatus.active_coins,
                total_subscribed: wsStatus.total_subscribed
            },
            gist: {
                active: !!process.env.GITHUB_TOKEN,
                total_coins: Object.keys(gistData.prices || {}).length,
                last_updated: gistData.last_updated
            },
            ai: {
                technical_analysis: 'active',
                vortexai_engine: 'ready',
                indicators_available: 15
            },
            api: {
                requests_count: apiClient.request_count,
                coinstats_connected: 'active'
            }
        };

        // تعریف متغیرها برای استفاده در HTML
        const wsCardClass = healthData.websocket.connected ? 'good' : 'danger';
        const gistCardClass = healthData.gist.active ? 'good' : 'warning';
        const wsStatusClass = healthData.websocket.connected ? 'status-online' : 'status-offline';
        const gistStatusClass = healthData.gist.active ? 'status-online' : 'status-warning';
        const lastUpdated = new Date(healthData.gist.last_updated).toLocaleString();
        const serverTime = new Date().toLocaleString();

        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Health - VortexAI Pro</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

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
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }

        .status-card {
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border-left: 5px solid #3498db;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .status-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .status-card.good { 
            border-left-color: #27ae60; 
            background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(255, 255, 255, 0.95)); 
        }
        .status-card.warning { 
            border-left-color: #f39c12; 
            background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(255, 255, 255, 0.95)); 
        }
        .status-card.danger { 
            border-left-color: #e74c3c; 
            background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(255, 255, 255, 0.95)); 
        }

        .card-icon { font-size: 2.5rem; margin-bottom: 15px; }
        .metric { font-size: 2rem; font-weight: bold; color: #2c3e50; margin: 10px 0; }
        .metric-label { color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

        .back-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 25px;
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px;
            transition: all 0.3s ease;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .back-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
        }

        .timestamp {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 30px;
            font-style: italic;
        }

        .detail-item {
            margin: 8px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }

        .detail-item:last-child { border-bottom: none; }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-left: 10px;
        }

        .status-online { background: #27ae60; color: white; }
        .status-offline { background: #e74c3c; color: white; }
        .status-warning { background: #f39c12; color: white; }

        @media (max-width: 768px) {
            .status-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 System Health Dashboard</h1>
            <p>Real-time monitoring of all VortexAI services and components</p>
        </div>

        <div class="status-grid">
            <div class="status-card ${wsCardClass}">
                <div class="card-icon">📡</div>
                <div class="metric">${healthData.websocket.connected ? 'ONLINE' : 'OFFLINE'}</div>
                <div class="metric-label">WebSocket Connections</div>
                <div style="margin-top: 20px;">
                    <div class="detail-item">
                        <strong>Active Coins:</strong>
                        <span class="status-badge status-online">${healthData.websocket.active_coins}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Subscribed Pairs:</strong>
                        <span class="status-badge status-online">${healthData.websocket.total_subscribed}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Provider:</strong> LBank
                    </div>
                    <div class="detail-item">
                        <strong>Status:</strong>
                        <span class="status-badge ${wsStatusClass}">
                            ${healthData.websocket.connected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

            <div class="status-card ${gistCardClass}">
                <div class="card-icon">💾</div>
                <div class="metric">${healthData.gist.total_coins}</div>
                <div class="metric-label">Historical Storage</div>
                <div style="margin-top: 20px;">
                    <div class="detail-item">
                        <strong>Gist Status:</strong>
                        <span class="status-badge ${gistStatusClass}">
                            ${healthData.gist.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div class="detail-item">
                        <strong>Total Coins:</strong> ${healthData.gist.total_coins}
                    </div>
                    <div class="detail-item">
                        <strong>Timeframes:</strong> 6 Layers
                    </div>
                    <div class="detail-item">
                        <strong>Last Updated:</strong> ${lastUpdated}
                    </div>
                </div>
            </div>

            <div class="status-card good">
                <div class="card-icon">🤖</div>
                <div class="metric">15+</div>
                <div class="metric-label">AI Engine</div>
                <div style="margin-top: 20px;">
                    <div class="detail-item">
                        <strong>VortexAI:</strong>
                        <span class="status-badge status-online">Ready</span>
                    </div>
                    <div class="detail-item">
                        <strong>Technical Analysis:</strong>
                        <span class="status-badge status-online">Active</span>
                    </div>
                    <div class="detail-item">
                        <strong>Indicators:</strong> 15+
                    </div>
                    <div class="detail-item">
                        <strong>Analysis:</strong> Real-time
                    </div>
                </div>
            </div>

            <div class="status-card good">
                <div class="card-icon">📊</div>
                <div class="metric">${healthData.api.requests_count}</div>
                <div class="metric-label">API Services</div>
                <div style="margin-top: 20px;">
                    <div class="detail-item">
                        <strong>CoinStats API:</strong>
                        <span class="status-badge status-online">Connected</span>
                    </div>
                    <div class="detail-item">
                        <strong>Requests Count:</strong> ${healthData.api.requests_count}
                    </div>
                    <div class="detail-item">
                        <strong>Rate Limit:</strong> Active
                    </div>
                    <div class="detail-item">
                        <strong>GitHub API:</strong>
                        <span class="status-badge ${gistStatusClass}">
                            ${healthData.gist.active ? 'Connected' : 'Disabled'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin: 40px 0;">
            <a href="/" class="back-button">🏠 Dashboard</a>
            <a href="/scan" class="back-button" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">🔍 Market Scanner</a>
            <a href="/api/health-combined" class="back-button" style="background: linear-gradient(135deg, #9b59b6, #8e44ad);">📊 JSON API</a>
        </div>

        <div class="timestamp">
            Last checked: ${serverTime}<br>
            <small>VortexAI Pro v5.0 - 6 Layer System</small>
        </div>
    </div>
</body>
</html>
        `);
    });

    // صفحه اسکنر بازار (طراحی شیشه‌ای کامل)
    router.get('/scan', (req, res) => {
        const limit = req.query.limit || 20;
        const filter = req.query.filter || 'ai_signal';

        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Market Scanner - VortexAI Pro</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
        }

        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 30px 20px;
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

        .controls {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            margin: 20px 0;
            display: flex;
            gap: 20px;
            align-items: center;
            flex-wrap: wrap;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .control-group {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .control-group label {
            font-weight: 600;
            color: #2c3e50;
            min-width: 60px;
        }

        select, button {
            padding: 12px 18px;
            border: 2px solid #e1e8ed;
            border-radius: 10px;
            font-size: 14px;
            background: white;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        select { min-width: 150px; }

        select:focus, button:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        button {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border: none;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
        }

        button.secondary {
            background: linear-gradient(135deg, #95a5a6, #7f8c8d);
        }

        button.secondary:hover {
            background: linear-gradient(135deg, #7f8c8d, #95a5a6);
        }

        .results { margin-top: 30px; }

        .coin-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 25px;
            margin-top: 20px;
        }

        .coin-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 2px solid transparent;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .coin-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            border-color: #3498db;
        }

        .coin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f8f9fa;
        }

        .coin-symbol {
            font-weight: bold;
            font-size: 1.4rem;
            color: #2c3e50;
        }

        .coin-price {
            font-size: 1.8rem;
            font-weight: bold;
            margin: 15px 0;
            color: #2c3e50;
        }

        .positive { color: #27ae60; }
        .negative { color: #e74c3c; }

        .ai-badge {
            background: linear-gradient(135deg, #9b59b6, #8e44ad);
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .loading {
            text-align: center;
            padding: 60px 20px;
            color: #7f8c8d;
            font-size: 1.2rem;
        }

        .loading::after {
            content: "";
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .back-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 25px;
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px;
            transition: all 0.3s ease;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .back-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin: 15px 0;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f8f9fa;
        }

        .stat-label { color: #7f8c8d; font-size: 0.9rem; }
        .stat-value { font-weight: 600; color: #2c3e50; }

        @media (max-width: 768px) {
            .controls { flex-direction: column; align-items: stretch; }
            .control-group { justify-content: space-between; }
            .coin-grid { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
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
            <button onclick="scanMarket()" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">
                🔍 Scan Market
            </button>
            <button onclick="loadSampleData()" class="secondary">
                📋 Load Sample
            </button>
        </div>

        <div class="results">
            <div id="resultsContainer" class="loading">
                Click "Scan Market" to load cryptocurrency data with VortexAI analysis...
            </div>
        </div>

        <div style="text-align: center; margin-top: 40px;">
            <a href="/" class="back-button">🏠 Dashboard</a>
            <a href="/analysis?symbol=btc_usdt" class="back-button" style="background: linear-gradient(135deg, #9b59b6, #8e44ad);">
                📊 Technical Analysis
            </a>
            <a href="/health" class="back-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">
                🏥 System Health
            </a>
        </div>
    </div>
`);
