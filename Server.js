const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ایمپورت ماژول‌ها
const constants = require('./config/constants');
const GistManager = require('./models/GistManager');
const WebSocketManager = require('./models/WebSocketManager');
const { AdvancedCoinStatsAPIClient, HistoricalDataAPI, ExchangeAPI } = require('./models/APIClients');
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');

const app = express();
const PORT = constants.PORT;

// میدلورها
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// نمونه‌سازی مدیران
const gistManager = new GistManager();
const wsManager = new WebSocketManager();
const apiClient = new AdvancedCoinStatsAPIClient();
const exchangeAPI = new ExchangeAPI();

// روت‌ها
app.use('/api', apiRoutes({ gistManager, wsManager, apiClient, exchangeAPI }));
app.use('/', pageRoutes({ gistManager, wsManager, apiClient }));

// هندلرهای سلامت
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'VortexAI Crypto Scanner'
  });
});

app.get('/health/ready', (req, res) => {
  const wsStatus = wsManager.getConnectionStatus();
  const gistData = gistManager.getAllData();

  const healthStatus = {
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    services: {
      websocket: {
        connected: wsStatus.connected,
        activeCoins: wsStatus.active_coins,
        status: wsStatus.connected ? 'Healthy' : 'Unhealthy'
      },
      database: {
        storedCoins: Object.keys(gistData.prices || {}).length,
        status: process.env.GITHUB_TOKEN ? 'Healthy' : 'Degraded'
      },
      api: {
        requestCount: apiClient.request_count,
        status: 'Healthy'
      }
    }
  };

  const allHealthy = wsStatus.connected && process.env.GITHUB_TOKEN;
  const statusCode = allHealthy ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// راه‌اندازی سرور
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(✔ VortexAI 6-Layer Server started on port ${PORT});
  console.log(✔ Dashboard: http://localhost:${PORT}/);
});

// Graceful Shutdown
async function gracefulShutdown(signal) {
  console.log(🔄 ${signal} signal received: starting graceful shutdown);
  
  let shutdownTimeout = setTimeout(() => {
    console.error('🛑 Force shutdown after 15 seconds timeout');
    process.exit(1);
  }, 15000);

  try {
    console.log('⏹️ Stopping server from accepting new connections');
    server.close(() => {
      console.log('✔ HTTP server stopped accepting new connections');
    });

    if (wsManager && wsManager.ws) {
      console.log('🔌 Closing WebSocket connections...');
      wsManager.ws.close();
      console.log('✔ WebSocket connections closed');
    }

    console.log('💾 Saving final data to Gist...');
    await gistManager.saveToGist();
    console.log('✔ Final data saved to Gist');

    clearTimeout(shutdownTimeout);
    console.log('✅ Graceful shutdown completed successfully');
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimeout);
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('⚠️ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;
