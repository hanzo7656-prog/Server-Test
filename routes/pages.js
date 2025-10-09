const express = require('express');
const constants = require('../config/constants');

const router = express.Router();

module.exports = ({ gistManager, wsManager, apiClient }) => {

    // صفحه اصلی دشبورد
    router.get("/", (req, res) => {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();

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
            <div class="status-card ${wsStatus.connected ? 'good' : 'danger'}">
                <div class="card-icon">📡</div>
                <div class="metric">${wsStatus.connected ? 'Connected' : 'Disconnected'}</div>
                <div class="metric-label">WebSocket Status</div>

<div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                    <strong>Active Coins:</strong> ${wsStatus.active_coins}<br>
                    <strong>Subscribed:</strong> ${wsStatus.total_subscribed}<br>
                    <strong>Provider:</strong> LBank
                </div>
            </div>

            <div class="status-card ${process.env.GITHUB_TOKEN ? 'good' : 'warning'}">
                <div class="card-icon">💾</div>
                <div class="metric">${Object.keys(gistData.prices || {}).length}</div>
                <div class="metric-label">Historical Storage</div>
                <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                    <strong>Gist:</strong> ${process.env.GITHUB_TOKEN ? 'Active' : 'Inactive'}<br>
                    <strong>Layers:</strong> 6 Timeframes<br>
                    <strong>Last Updated:</strong> ${new Date(gistData.last_updated).toLocaleDateString()}
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

<a href="/api/timeframes" class="nav-link timeframes">🕐 Timeframes API</a>
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
            <p><strong>🕐 Server Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>📦 Version:</strong> 5.0 - 6 Layer Historical System</p>
            <p><strong>🌐 Environment:</strong> Production Ready</p>
            <p><strong>💰 Active Pairs:</strong> ${constants.ALL_TRADING_PAIRS.length} Trading Pairs</p>
        </div>
    </div>
</body>
</html>
        );
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

        res.send(
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

.status-card.good { border-left-color: #27ae60; background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(255, 255, 255, 0.95)); }
        .status-card.warning { border-left-color: #f39c12; background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(255, 255, 255, 0.95)); }
        .status-card.danger { border-left-color: #e74c3c; background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(255, 255, 255, 0.95)); }

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
            <div class="status-card ${healthData.websocket.connected ? 'good' : 'danger'}">
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
                        <span class="status-badge ${healthData.websocket.connected ? 'status-online' : 'status-offline'}">
                            ${healthData.websocket.connected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

<div class="status-card ${healthData.gist.active ? 'good' : 'warning'}">
                <div class="card-icon">💾</div>
                <div class="metric">${healthData.gist.total_coins}</div>
                <div class="metric-label">Historical Storage</div>
                <div style="margin-top: 20px;">
                    <div class="detail-item">
                        <strong>Gist Status:</strong>
                        <span class="status-badge ${healthData.gist.active ? 'status-online' : 'status-warning'}">
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
                        <strong>Last Updated:</strong> ${new Date(healthData.gist.last_updated).toLocaleString()}
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
                        <span class="status-badge ${healthData.gist.active ? 'status-online' : 'status-warning'}">
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
            Last checked: ${new Date().toLocaleString()}<br>
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

    <script>
        async function scanMarket() {
            const limit = document.getElementById('limitSelect').value;
            const filter = document.getElementById('filterSelect').value;

            document.getElementById('resultsContainer').innerHTML = '<div class="loading">🔍 Scanning market with VortexAI 6-Layer System...</div>';

            try {
                const response = await fetch(\/api/scan/vortexai?limit=\${limit}&filter=\${filter}\);
                const data = await response.json();

                if (data.success) {
                    displayResults(data.coins);
                } else {
                    document.getElementById('resultsContainer').innerHTML = '<div class="loading" style="color: #e74c3c;">Error loading data</div>';
                }
            } catch (error) {
                document.getElementById('resultsContainer').innerHTML = '<div class="loading" style="color: #e74c3c;">Connection error - Please try again</div>';
            }
        }

        function displayResults(coins) {
            if (!coins || coins.length === 0) {
                document.getElementById('resultsContainer').innerHTML = '<div class="loading">No coins found matching your criteria</div>';
                return;
            }

            const coinsHTML = coins.map(coin => \`
                <div class="coin-card">
                    <div class="coin-header">
                        <span class="coin-symbol">\${coin.symbol}</span>
                        <span class="ai-badge">AI Score: \${coin.VortexAI_analysis?.signal_strength?.toFixed(1) || 'N/A'}</span>
                    </div>

                    <div class="coin-price">$\${coin.price?.toFixed(2) || '0.00'}</div>

                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">24h Change:</span>
                            <span class="stat-value \${(coin.priceChange24h || 0) >= 0 ? 'positive' : 'negative'}">
                                \${(coin.priceChange24h || 0).toFixed(2)}%
                            </span>
                        </div>

                        <div class="stat-item">
                            <span class="stat-label">1h Change:</span>
                            <span class="stat-value \${(coin.change_1h || 0) >= 0 ? 'positive' : 'negative'}">
                                \${(coin.change_1h || 0).toFixed(2)}%
                            </span>
                        </div>

<div class="stat-item">
                            <span class="stat-label">Volume:</span>
                            <span class="stat-value">$\${(coin.volume || 0).toLocaleString()}</span>
                        </div>

                        <div class="stat-item">
                            <span class="stat-label">Market Cap:</span>
                            <span class="stat-value">$\${(coin.marketCap || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #f8f9fa;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #7f8c8d; font-size: 0.9rem;">
                                Sentiment: <strong style="color: \${coin.VortexAI_analysis?.market_sentiment === 'bullish' ? '#27ae60' : '#e74c3c'}">
                                    \${coin.VortexAI_analysis?.market_sentiment || 'neutral'}
                                </strong>
                            </span>
                            <span style="color: #7f8c8d; font-size: 0.9rem;">
                                Volatility: <strong>\${coin.VortexAI_analysis?.volatility_score?.toFixed(1) || '0'}</strong>
                            </span>
                        </div>
                        \${coin.VortexAI_analysis?.volume_anomaly ? '<div style="margin-top: 8px; padding: 5px 10px; background: #fff3cd; color: #856404; border-radius: 8px; font-size: 0.8rem; text-align: center; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">Volume Anomaly Detected</div>' : ''}
                    </div>
                </div>
            \).join('');

            document.getElementById('resultsContainer').innerHTML = \
                <h3 style="color: white; text-align: center; margin-bottom: 20px;">📊 Scan Results: \${coins.length} coins found</h3>
                <div class="coin-grid">\${coinsHTML}</div>
            \;
        }

        function loadSampleData() {
            const sampleCoins = [
                {
                    symbol: 'BTC',
                    price: 45234.56,
                    priceChange24h: 2.34,
                    change_1h: 0.56,
                    volume: 25467890000,
                    marketCap: 885234567890,
                    VortexAI_analysis: {
                        signal_strength: 8.7,
                        market_sentiment: 'bullish',
                        volatility_score: 7.2,
                        volume_anomaly: true
                    }
                },
                {
                    symbol: 'ETH',
                    price: 2345.67,
                    priceChange24h: 1.23,
                    change_1h: -0.34,
                    volume: 14567890000,
                    marketCap: 281234567890,
                    VortexAI_analysis: {
                        signal_strength: 7.2,
                        market_sentiment: 'bullish',
                        volatility_score: 5.8,
                        volume_anomaly: false
                    }
                },
                {
                    symbol: 'SOL',
                    price: 102.34,
                    priceChange24h: 5.67,
                    change_1h: 2.12,
                    volume: 3456789000,
                    marketCap: 41234567890,
                    VortexAI_analysis: {
                        signal_strength: 9.1,
                        market_sentiment: 'very bullish',
                        volatility_score: 8.5,
                        volume_anomaly: true
                    }
                }
            ];
            displayResults(sampleCoins);
        }

        // Load sample data on page load for demo
        setTimeout(loadSampleData, 1000);
    </script>
</body>
</html>
    `);
});

router.get('/analysis', (req, res) => {
    const symbol = req.query.symbol || 'btc_usdt';
    
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Technical Analysis - VortexAI Pro</title>
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

        .analysis-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }

        .indicator-card {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: all 0.3s ease;
            border-left: 4px solid #3498db;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .indicator-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .indicator-value {
            font-size: 2.2rem;
            font-weight: bold;
            margin: 15px 0;
            color: #2c3e50;
        }

        .bullish { color: #27ae60; }
        .bearish { color: #e74c3c; }
        .neutral { color: #f39c12; }

        .back-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 25px;
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin: 5px;
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

        .timeframe-selector {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin: 20px 0;
            flex-wrap: wrap;
        }

        .timeframe-btn {
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid #e1e8ed;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            color: #2c3e50;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .timeframe-btn.active {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border-color: #3498db;
        }

        .timeframe-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .info-section {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
            .analysis-grid {
                grid-template-columns: 1fr;
            }
            .timeframe-selector {
                flex-direction: column;
                align-items: center;
            }
            .timeframe-btn {
                width: 200px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
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

            // Update active button
            document.querySelectorAll('.timeframe-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            // Load historical data for selected timeframe
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

                    // Reload full analysis
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

                '<div class="indicator-card">' +
                '<div>📏 Bollinger Upper</div>' +
                '<div class="indicator-value">' + (data.technical_indicators?.bollinger_upper?.toFixed(2) || 'N/A') + '</div>' +
                '<div style="color: #7f8c8d; font-size: 0.9rem;">Upper Band</div>' +
                '</div>' +

                '<div class="indicator-card">' +
                '<div>📐 Moving Average (20)</div>' +
                '<div class="indicator-value">' + (data.technical_indicators?.moving_avg_20?.toFixed(2) || 'N/A') + '</div>' +
                '<div style="color: #7f8c8d; font-size: 0.9rem;">Short Term</div>' +
                '</div>' +

                '<div class="indicator-card">' +
                '<div>📐 Moving Average (50)</div>' +
                '<div class="indicator-value">' + (data.technical_indicators?.moving_avg_50?.toFixed(2) || 'N/A') + '</div>' +
                '<div style="color: #7f8c8d; font-size: 0.9rem;">Medium Term</div>' +
                '</div>' +

                '<div class="indicator-card">' +
                '<div>🎯 Stochastic</div>' +
                '<div class="indicator-value">' + (data.technical_indicators?.stochastic_k?.toFixed(2) || 'N/A') + '</div>' +
                '<div style="color: #7f8c8d; font-size: 0.9rem;">K: ' + (data.technical_indicators?.stochastic_k?.toFixed(2) || 'N/A') + '</div>' +
                '</div>' +

                '<div class="indicator-card">' +
                '<div>📊 Volume Analysis</div>' +
                '<div class="indicator-value">' + (data.technical_indicators?.obv?.toLocaleString() || 'N/A') + '</div>' +
                '<div style="color: #7f8c8d; font-size: 0.9rem;">OBV Indicator</div>' +
                '</div>' +
                '</div>' +

                '<div class="info-section">' +
                '<h3>🤖 VortexAI Insights</h3>' +
                '<p><strong>Market Sentiment:</strong> ' +
                '<span style="color:' + sentimentColor + '; font-weight: bold;">' + (data.vortexai_analysis?.market_sentiment || 'NEUTRAL') + '</span>' +
                '</p>' +
                '<p><strong>Prediction Confidence:</strong> ' + ((data.vortexai_analysis?.prediction_confidence * 100)?.toFixed(1) || '0') + '%</p>' +
                '<p><strong>Risk Level:</strong> ' + (data.vortexai_analysis?.risk_level || 'MEDIUM') + '</p>' +
                '<div style="margin-top: 15px;">' +
                '<strong>AI Insights:</strong>' +
                '<ul style="margin-top: 10px; padding-left: 20px;">' + ((data.vortexai_analysis?.ai_insights?.map(insight => '<li>' + insight + '</li>').join('')) || '<li>No specific insights available</li>') + '</ul>' +
                '</div>' +
                '</div>' +

                '<div class="info-section">' +
                '<h3>⚖️ Support & Resistance</h3>' +
                '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">' +
                '<div>' +
                '<strong>Support Levels:</strong>' +
                '<div style="margin-top: 10px;">' + ((data.support_resistance?.support?.map(level => '<div style="padding: 5px 0; border-bottom: 1px solid #eee;">$' + (level?.toFixed(2) || 'N/A') + '</div>').join('')) || 'N/A') + '</div>' +
                '</div>' +
                '<div>' +
                '<strong>Resistance Levels:</strong>' +
                '<div style="margin-top: 10px;">' + ((data.support_resistance?.resistance?.map(level => '<div style="padding: 5px 0; border-bottom: 1px solid #eee;">$' + (level?.toFixed(2) || 'N/A') + '</div>').join('')) || 'N/A') + '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +

                '<div class="info-section">' +
                '<h3>📋 Technical Details</h3>' +
                '<p><strong>Data Points Analyzed:</strong> ' + (data.data_points || 0) + '</p>' +
                '<p><strong>Processing Time:</strong> ' + (data.processing_time || 'N/A') + '</p>' +
                '<p><strong>Timeframe:</strong> ' + currentTimeframe.toUpperCase() + '</p>' +
                '<p><strong>Analysis Timestamp:</strong> ' + new Date(data.timestamp).toLocaleString() + '</p>' +
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

        // Load analysis on page load
        window.addEventListener('load', loadAnalysis);
    </script>
</body>
</html>
    `);
});
router.get('/timeframes-api', (req, res) => {
    const timeframes = gistManager.getAvailableTimeframes();
    
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Timeframes API - VortexAI Pro</title>
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
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }

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

        .api-content {
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .timeframe-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 25px 0;
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
            transform: translateY(-5px);
        }

        .timeframe-name {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }

        .timeframe-desc {
            color: #7f8c8d;
            font-size: 0.8rem;
        }

        .code-block {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .endpoint {
            color: #3498db;
            font-weight: bold;
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

        .try-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            text-decoration: none;
            border-radius: 20px;
            margin: 10px 5px;
            transition: all 0.3s ease;
            font-weight: bold;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .try-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(243, 156, 18, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🕐 Timeframes API</h1>
            <p>Access historical data across 6 different timeframes with varying intervals</p>
        </div>

        <div class="api-content">
            <h2>🔌 Available Endpoints</h2>
            
            <div class="code-block">
                <span class="endpoint">GET</span> /api/timeframes<br>
                <span style="color: #95a5a6;"># Returns all available timeframes</span>
            </div>

            <div class="code-block">
                <span class="endpoint">GET</span> /api/coin/<span style="color: #e74c3c;">:symbol</span>/history/<span style="color: #e74c3c;">:timeframe</span><br>
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
            <a href="/api/timeframes" class="try-button" target="_blank">📋 List Timeframes</a>
            <a href="/api/coin/btc_usdt/history/7d" class="try-button" target="_blank">💰 BTC 7D Data</a>
            <a href="/api/coin/eth_usdt/history/24h" class="try-button" target="_blank">🔷 ETH 24H Data</a>

            <h3>📄 Response Examples</h3>
            
            <h4>Timeframes List:</h4>
            <div class="code-block">
{<br>
&nbsp;&nbsp;"success": true,<br>
&nbsp;&nbsp;"timeframes": ["1h", "4h", "24h", "7d", "30d", "180d"],<br>
&nbsp;&nbsp;"description": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;"1h": "1 hour history - 1 minute intervals",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"4h": "4 hours history - 5 minute intervals"<br>
&nbsp;&nbsp;}<br>
}
            </div>

            <h4>Historical Data:</h4>
            <div class="code-block">
{<br>
&nbsp;&nbsp;"success": true,<br>
&nbsp;&nbsp;"symbol": "btc_usdt",<br>
&nbsp;&nbsp;"timeframe": "7d",<br>
&nbsp;&nbsp;"current_price": 45000.50,<br>
&nbsp;&nbsp;"history": [<br>
&nbsp;&nbsp;&nbsp;&nbsp;{"timestamp": 1640995200000, "price": 45000.50},<br>
&nbsp;&nbsp;&nbsp;&nbsp;{"timestamp": 1640998800000, "price": 45200.75}<br>
&nbsp;&nbsp;],<br>
&nbsp;&nbsp;"data_points": 168<br>
}
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="back-button">🏠 Dashboard</a>
            <a href="/health-api" class="back-button" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">💚 Health API</a>
            <a href="/api-data" class="back-button" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">📡 API Data</a>
        </div>
    </div>
</body>
</html>
    `);
});
router.get('/api-data', (req, res) => {
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
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }

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

        .api-content {
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .endpoints-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 25px 0;
        }

        .endpoint-card {
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #e74c3c;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }

        .endpoint-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .endpoint-method {
            display: inline-block;
            padding: 4px 12px;
            background: #e74c3c;
            color: white;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .endpoint-method.get { background: #27ae60; }
        .endpoint-method.post { background: #3498db; }

        .endpoint-path {
            font-family: 'Courier New', monospace;
            color: #2c3e50;
            margin: 10px 0;
            font-weight: bold;
        }

        .endpoint-desc {
            color: #7f8c8d;
            font-size: 0.9rem;
        }

        .param {
            color: #e74c3c;
            font-weight: bold;
        }

        .code-block {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
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

        .try-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            text-decoration: none;
            border-radius: 20px;
            margin: 10px 5px;
            transition: all 0.3s ease;
            font-weight: bold;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .try-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
        }

        .filter-options {
            display: flex;
            gap: 10px;
            margin: 15px 0;
            flex-wrap: wrap;
        }

        .filter-btn {
            padding: 8px 16px;
            background: rgba(52, 152, 219, 0.1);
            border: 1px solid #3498db;
            border-radius: 20px;
            color: #3498db;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.8rem;
            backdrop-filter: blur(10px);
        }

        .filter-btn:hover {
            background: #3498db;
            color: white;
        }

        .coin-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f39c12, #e67e22);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📡 API Data</h1>
            <p>Complete API documentation for VortexAI Crypto Scanner with real-time examples</p>
        </div>

        <div class="api-content">
            <h2>🚀 Main API Endpoints</h2>
            
            <div class="code-block">
                <span style="color: #27ae60; font-weight: bold;">GET</span> /api/scan/vortexai?limit=<span style="color: #e74c3c;">100</span>&filter=<span style="color: #e74c3c;">ai_signal</span><br>
                <span style="color: #95a5a6;"># Returns enhanced cryptocurrency data with VortexAI analysis</span>
            </div>

            <h3>🎛️ Try with Different Filters</h3>
            <div class="filter-options">
                <a href="/api/scan/vortexai?limit=10&filter=ai_signal" class="try-button" target="_blank">
                    <span class="coin-icon">AI</span> AI Signal (10)
                </a>
                <a href="/api/scan/vortexai?limit=20&filter=volume" class="try-button" target="_blank">
                    <span class="coin-icon">V</span> Volume (20)
                </a>
                <a href="/api/scan/vortexai?limit=15&filter=momentum_1h" class="try-button" target="_blank">
                    <span class="coin-icon">1H</span> 1H Momentum (15)
                </a>
                <a href="/api/scan/vortexai?limit=25&filter=momentum_4h" class="try-button" target="_blank">
                    <span class="coin-icon">4H</span> 4H Momentum (25)
                </a>
            </div>

            <h3>🔌 All Available Endpoints</h3>
            
            <div class="endpoints-grid">
                <div class="endpoint-card">
                    <span class="endpoint-method get">GET</span>
                    <div class="endpoint-path">/api/scan/vortexai</div>
                    <div class="endpoint-desc">
                        Enhanced market scanner with AI analysis<br>
                        <strong>Params:</strong> limit, filter
                    </div>
                </div>

                <div class="endpoint-card">
                    <span class="endpoint-method get">GET</span>
                    <div class="endpoint-path">/api/coin/<span class="param">:symbol</span>/technical</div>
                    <div class="endpoint-desc">
                        Technical analysis with 15+ indicators<br>
                        <strong>Example:</strong> /api/coin/btc_usdt/technical
                    </div>
                </div>

                <div class="endpoint-card">
                    <span class="endpoint-method get">GET</span>
                    <div class="endpoint-path">/api/health-combined</div>
                    <div class="endpoint-desc">
                        System health and statistics<br>
                        Includes request counts and service status
                    </div>
                </div>

                <div class="endpoint-card">
                    <span class="endpoint-method get">GET</span>
                    <div class="endpoint-path">/api/timeframes</div>
                    <div class="endpoint-desc">
                        List all available historical timeframes<br>
                        6 different timeframe options
                    </div>
                </div>

                <div class="endpoint-card">
                    <span class="endpoint-method get">GET</span>
                    <div class="endpoint-path">/api/coin/<span class="param">:symbol</span>/history/<span class="param">:timeframe</span></div>
                    <div class="endpoint-desc">
                        Historical price data<br>
                        <strong>Example:</strong> /api/coin/btc_usdt/history/7d
                    </div>
                </div>

                <div class="endpoint-card">
                    <span class="endpoint-method get">GET</span>
                    <div class="endpoint-path">/api/exchange/price</div>
                    <div class="endpoint-desc">
                        Exchange rate between coins<br>
                        <strong>Params:</strong> exchange, from, to, timestamp
                    </div>
                </div>

                <div class="endpoint-card">
                    <span class="endpoint-method get">GET</span>
                    <div class="endpoint-path">/api/tickers/<span class="param">:exchange</span></div>
                    <div class="endpoint-desc">
                        Exchange tickers data<br>
                        <strong>Example:</strong> /api/tickers/Binance
                    </div>
                </div>

                <div class="endpoint-card">
                    <span class="endpoint-method get">GET</span>
                    <div class="endpoint-path">/api/price/avg</div>
                    <div class="endpoint-desc">
                        Historical average price<br>
                        <strong>Params:</strong> coinId, timestamp
                    </div>
                </div>
            </div>

            <h3>🔧 Query Parameters</h3>
            <div class="code-block">
                <strong>Main Scanner Endpoint:</strong><br>
                /api/scan/vortexai?<span style="color: #3498db;">limit</span>=100&<span style="color: #3498db;">filter</span>=ai_signal<br><br>
                <strong>Parameters:</strong><br>
                - <span style="color: #3498db;">limit</span>: Number of coins (1-300, default: 100)<br>
                - <span style="color: #3498db;">filter</span>: ai_signal, volume, momentum_1h, momentum_4h
            </div>

            <h3>📊 Response Structure</h3>
            <div class="code-block">
{<br>
&nbsp;&nbsp;"success": true,<br>
&nbsp;&nbsp;"coins": [<br>
&nbsp;&nbsp;&nbsp;&nbsp;{<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"symbol": "BTC",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"price": 45234.56,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"priceChange1h": 0.56,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"priceChange24h": 2.34,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"volume": 25467890000,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"marketCap": 885234567890,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"VortexAI_analysis": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"signal_strength": 8.7,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"market_sentiment": "bullish",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"volatility_score": 7.2,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"volume_anomaly": true<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;],<br>
&nbsp;&nbsp;"total_coins": 100,<br>
&nbsp;&nbsp;"processing_time": "245ms"<br>
}
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="back-button">🏠 Dashboard</a>
            <a href="/health-api" class="back-button" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">💚 Health API</a>
            <a href="/timeframes-api" class="back-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">🕐 Timeframes API</a>
        </div>
    </div>
</body>
</html>
    `);
});
router.get('/health-api', (req, res) => {
    const healthData = {
        websocket: wsManager.getConnectionStatus(),
        gist: gistManager.getAllData(),
        api: { requests_count: apiClient.request_count }
    };

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health API - VortexAI Pro</title>
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
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }

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

        .api-content {
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 25px 0;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #3498db;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #2c3e50;
            margin: 10px 0;
        }

        .stat-label {
            color: #7f8c8d;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .code-block {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .endpoint {
            color: #3498db;
            font-weight: bold;
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

        .try-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            text-decoration: none;
            border-radius: 20px;
            margin: 10px 5px;
            transition: all 0.3s ease;
            font-weight: bold;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .try-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(39, 174, 96, 0.4);
        }

        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .status-online { background: #27ae60; }
        .status-offline { background: #e74c3c; }
        .status-warning { background: #f39c12; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💚 Health API</h1>
            <p>Real-time system health monitoring and API request statistics</p>
        </div>

        <div class="api-content">
            <h2>🔌 API Endpoints</h2>
            
            <div class="code-block">
                <span class="endpoint">GET</span> /api/health-combined
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
                        Gist: ${process.env.GITHUB_TOKEN ? 'Active' : 'Inactive'}
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
            <a href="/api/health-combined" class="try-button" target="_blank">🧪 Test Health API</a>
            <a href="/health" class="try-button" style="background: linear-gradient(135deg, #9b59b6, #8e44ad);">📊 Health Dashboard</a>
            <a href="/api/debug/api-status" class="try-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">🐛 Debug API</a>

            <h3>📄 Response Format</h3>
            <div class="code-block">
{<br>
&nbsp;&nbsp;"status": "healthy",<br>
&nbsp;&nbsp;"service": "VortexAI Combined Crypto Scanner",<br>
&nbsp;&nbsp;"version": "5.0 - 6 Layer System",<br>
&nbsp;&nbsp;"timestamp": "${new Date().toISOString()}",<br>
&nbsp;&nbsp;"websocket_status": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;"connected": ${healthData.websocket.connected},<br>
&nbsp;&nbsp;&nbsp;&nbsp;"active_coins": ${healthData.websocket.active_coins},<br>
&nbsp;&nbsp;&nbsp;&nbsp;"total_subscribed": ${healthData.websocket.total_subscribed},<br>
&nbsp;&nbsp;&nbsp;&nbsp;"provider": "LBank"<br>
&nbsp;&nbsp;},<br>
&nbsp;&nbsp;"gist_status": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;"active": ${!!process.env.GITHUB_TOKEN},<br>
&nbsp;&nbsp;&nbsp;&nbsp;"total_coins": ${Object.keys(healthData.gist.prices || {}).length},<br>
&nbsp;&nbsp;&nbsp;&nbsp;"last_updated": "${healthData.gist.last_updated}",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"timeframes_available": ${JSON.stringify(gistManager.getAvailableTimeframes())}<br>
&nbsp;&nbsp;},<br>
&nbsp;&nbsp;"ai_status": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;"technical_analysis": "active",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"vortexai_engine": "ready",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"indicators_available": 15<br>
&nbsp;&nbsp;},<br>
&nbsp;&nbsp;"api_status": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;"requests_count": ${healthData.api.requests_count},<br>
&nbsp;&nbsp;&nbsp;&nbsp;"coinstats_connected": "active"<br>
&nbsp;&nbsp;},<br>
&nbsp;&nbsp;"features": [<br>
&nbsp;&nbsp;&nbsp;&nbsp;"realtime_websocket_data",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"6_layer_historical_data",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"vortexai_analysis",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"technical_indicators",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"multi_source_data",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"advanced_filtering",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"market_predictions",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"multi_timeframe_support"<br>
&nbsp;&nbsp;]<br>
}
            </div>

            <h3>🔧 Health Endpoints</h3>
            <div class="code-block">
                <span class="endpoint">GET</span> /health<br>
                <span style="color: #95a5a6;"># Basic health check</span><br><br>
                
                <span class="endpoint">GET</span> /health/ready<br>
                <span style="color: #95a5a6;"># Full service readiness check</span><br><br>
                
                <span class="endpoint">GET</span> /health/live<br>
                <span style="color: #95a5a6;"># Kubernetes liveness probe</span><br><br>
                
                <span class="endpoint">GET</span> /api/debug/api-status<br>
                <span style="color: #95a5a6;"># Detailed API connectivity debug</span>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="back-button">🏠 Dashboard</a>
            <a href="/api-data" class="back-button" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">📡 API Data</a>
            <a href="/timeframes-api" class="back-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">🕐 Timeframes API</a>
        </div>
    </div>
</body>
</html>
    `);
});
module.exports = router;
