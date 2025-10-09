// routes/pages/health-dashboard.js
const express = require('express');
const router = express.Router();

/**
 * صفحه سلامت سیستم پیشرفته
 */
router.get('/', async (req, res) => {
    try {
        const apiResponse = await fetch(http://localhost:${process.env.PORT || 3000}/api/health-combined);
        const healthData = await apiResponse.json();
        
        res.send(
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>System Health - VortexAI</title>
            <style>
                .health-metrics {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin: 25px 0;
                }

                .metric-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 20px;
                    text-align: center;
                }

                .status-online { color: #00b894; }
                .status-offline { color: #ff6b6b; }
                .status-warning { color: #fdcb6e; }
            </style>
        </head>
        <body>
            <div class="glass-container">
                <div class="glass-header">
                    <div class="glass-icon">❤️</div>
                    <h2 class="glass-title">System Health Dashboard</h2>
                    <div class="glass-badge">REAL-TIME</div>
                </div>

                <div class="health-metrics">
                    <div class="metric-card">
                        <div class="stat-value ${healthData.websocket_status.connected ? 'status-online' : 'status-offline'}">
                            ${healthData.websocket_status.connected ? 'ONLINE' : 'OFFLINE'}
                        </div>
                        <div class="stat-label">WebSocket</div>
                    </div>

                    <div class="metric-card">
                        <div class="stat-value status-online">${healthData.api_status.requests_count}</div>
                        <div class="stat-label">API Requests</div>
                    </div>

                    <div class="metric-card">
                        <div class="stat-value status-online">${healthData.gist_status.total_coins}</div>
                        <div class="stat-label">Stored Coins</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        );
    } catch (error) {
        res.status(500).send('Error loading health dashboard');
    }
});

module.exports = router;
