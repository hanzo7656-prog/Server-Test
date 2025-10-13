const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ایمپورت ماژول‌ها
const constants = require('./config/constants');
const logger = require('./config/logger');
const GistManager = require('./models/GistManager');
const WebSocketManager = require('./models/WebSocketManager');
const { AdvancedCoinStatsAPIClient, HistoricalDataAPI, ExchangeAPI, InsightsAPI } = require('./models/APIClients');
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

// کش سرور
let cache = {
  coinsList: { data: null, timestamp: null },
  historicalData: {},
  realtimePrices: {}
};

// نمونه‌سازی مدیران
const gistManager = new GistManager();
const wsManager = new WebSocketManager(gistManager);
const apiClient = new AdvancedCoinStatsAPIClient();
const exchangeAPI = new ExchangeAPI();
const insightsAPI = new InsightsAPI();

// ========== REDIRECT ROUTES برای Frontend ==========

// Redirect از root به /api
app.get('/scan', (req, res) => {
  const limit = req.query.limit;
  const filter = req.query.filter;
  let redirectUrl = '/api/scan/vortexai';
  if (limit || filter) {
    redirectUrl += '?' + new URLSearchParams(req.query).toString();
  }
  res.redirect(redirectUrl);
});

app.get('/analysis', (req, res) => {
  const symbol = req.query.symbol;
  if (symbol) {
    res.redirect(`/api/coin/${symbol}/technical`);
  } else {
    res.status(400).json({ error: "Symbol parameter required" });
  }
});

app.get('/timeframes-api', (req, res) => {
  res.redirect('/api/timeframes');
});

app.get('/health-api', (req, res) => {
  res.redirect('/api/health');
});

app.get('/currencies', (req, res) => {
  res.redirect('/api/currencies');
});

app.get('/api-data', (req, res) => {
  res.redirect('/api/health-combined');
});

// سپس خط اصلی API
app.use('/api', apiRoutes({ gistManager, wsManager, apiClient, exchangeAPI }));
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
  logger.info(`✔ VortexAI 6-Layer Server started on port ${PORT}`);
  logger.info('✔ Features: 6-Timeframe Historical Data + WebSocket Real-time + VortexAI Analysis');
  logger.info(`✔ Real-time Pairs: ${constants.ALL_TRADING_PAIRS.length}`);
  logger.info(`✔ Dashboard: http://localhost:${PORT}/`);
  logger.info(`✔ Health: http://localhost:${PORT}/health`);
  logger.info(`✔ Scanner: http://localhost:${PORT}/scan`);
  logger.info(`✔ Analysis: http://localhost:${PORT}/analysis`);
});

// --- Graceful Shutdown --- //
async function gracefulShutdown(signal) {
  logger.info(`🔄 ${signal} signal received: starting graceful shutdown`);
  
  let shutdownTimeout = setTimeout(() => {
    logger.error('🛑 Force shutdown after 15 seconds timeout');
    process.exit(1);
  }, 15000);

  try {
    logger.info('⏹️ Stopping server from accepting new connections');
    server.close(() => {
      logger.info('✔ HTTP server stopped accepting new connections');
    });

    // 2. بستن اتصالات WebSocket
    if (wsManager && wsManager.ws) {
      logger.info('🔌 Closing WebSocket connections...');
      wsManager.ws.close();
      logger.info('✔ WebSocket connections closed');
    }

    // 3. بستن اتصالات به APIهای خارجی
    logger.info('🔌 Closing external API connections...');
    // اینجا می‌توانید اتصالات به دیتابیس یا APIهای دیگر را هم ببندید

    // 4. ذخیره داده‌های نهایی در Gist
    logger.info('💾 Saving final data to Gist...');
    await gistManager.saveToGist();
    logger.info('✔ Final data saved to Gist');

    // 5. تکمیل graceful shutdown
    clearTimeout(shutdownTimeout);
    logger.info('✅ Graceful shutdown completed successfully');
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimeout);
    logger.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// event handlers برای سیگنال‌های مختلف
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// مدیریت خطاهای unhandled
process.on('uncaughtException', (error) => {
  logger.error('⚠️ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;
