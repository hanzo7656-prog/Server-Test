const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ایمپورت ماژول ها
const constants = require('./config/constants');
const logger = require('./config/logger');
const GistManager = require('./models/GistManager');
const WebSocketManager = require('./models/WebSocketManager');
const { AdvancedCoinStatsAPIClient, apiDebugSystem } = require('./models/APIClients');

// ایمپورت ماژول های روتر
const apiRoutes = require('./routes/api');
const modernRoutes = require('./routes/modern-pages');

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

console.log('🚀 Initializing VortexAI Server...');
console.log('📋 Dependencies status:', {
  gistManager: !!gistManager,
  wsManager: !!wsManager,
  apiClient: !!apiClient
});

// --- REDIRECT ROUTES برای Frontend ---

app.get('/scan', (req, res) => {
  const limit = req.query.limit;
  const filter = req.query.filter;
  let redirectUrl = '/scan-page';

  if (limit || filter) {
    redirectUrl += '?' + new URLSearchParams(req.query).toString();
  }

  res.redirect(redirectUrl);
});

app.get('/analysis', (req, res) => {
  const symbol = req.query.symbol;
  if (symbol) {
    res.redirect('/analysis-page?symbol=' + symbol);
  } else {
    res.status(400).json({ error: "Symbol parameter required" });
  }
});

app.get('/timeframes-api', (req, res) => {
  res.redirect('/api/settings/timeframes');
});

app.get('/health-api', (req, res) => {
  res.redirect('/api/health');
});

app.get('/currencies', (req, res) => {
  res.redirect('/api/insights/currencies');
});

app.get('/api-data', (req, res) => {
  res.redirect('/api/health/api-status');
});

// ========== MAIN ROUTES ==========

// حالا این route ها کار می‌کن چون ماژول ها ایمپورت شدن
app.use('/api', apiRoutes({ gistManager, wsManager, apiClient }));
app.use('/', modernRoutes({ gistManager, wsManager, apiClient }));

// هندلرهای سلامت

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'VortexAI Crypto Scanner',
    version: '7.0 - Enhanced API'
  });
});

app.get('/health/ready', (req, res) => {
  const wsStatus = wsManager.getConnectionStatus();
  const gistData = gistManager.getAllData();

  const healthStatus = {
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    service: 'VortexAI Crypto Scanner',
    version: '7.0 - Enhanced API',
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

// تست route ساده
app.get('/test-simple', (req, res) => {
    res.json({
        success: true,
        message: '✅ Route Test Works!',
        timestamp: new Date().toISOString()
    });
});

// اطلاعات سرور
app.get('/server/info', (req, res) => {
    res.json({
        server: {
            url: constants.SERVER_URL,
            environment: process.env.NODE_ENV || 'development',
            port: PORT,
            started_at: new Date(Date.now() - process.uptime() * 1000).toISOString()
        },
        api: {
            base_url: constants.API_URLS.base,
            rate_limit: constants.API_CLIENT_CONFIG?.rateLimitDelay || 1000
        },
        features: {
            realtime_data: true,
            technical_analysis: true,
            news_aggregation: true,
            market_insights: true,
            health_monitoring: true
        }
    });
});

// هندل کردن خطاهای 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        requested_url: req.originalUrl,
        available_endpoints: {
            api: '/api/*',
            health: '/health',
            server_info: '/server/info',
            test: '/test-simple'
        },
        timestamp: new Date().toISOString()
    });
});

// هندلر خطاهای全局
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// راه‌اندازی سرور
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n=========================================');
  console.log('🚀 VortexAI Crypto Scanner Server Started');
  console.log('=========================================');
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌐 Server: ${constants.SERVER_URL}`);
  console.log(`🔄 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Node.js: ${process.version}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('=========================================\n');
  
  console.log('📊 Available Endpoints:');
  console.log('   • API Routes: /api/*');
  console.log('   • Health Check: /health');
  console.log('   • Server Info: /server/info');
  console.log('   • Test Route: /test-simple');
  console.log('');
  
  // وضعیت اولیه سیستم را چاپ کن
  setTimeout(async () => {
      try {
          const wsStatus = wsManager.getConnectionStatus();
          const gistStatus = gistManager.getStatus();
          
          console.log('🔍 Initial System Status:');
          console.log(`   • WebSocket: ${wsStatus.connected ? '🟢 Connected' : '🔴 Disconnected'}`);
          console.log(`   • Active Coins: ${wsStatus.active_coins}`);
          console.log(`   • Gist Database: ${gistStatus.active ? '🟢 Active' : '🔴 Inactive'}`);
          console.log(`   • Stored Coins: ${gistStatus.total_coins}`);
          console.log('');
          
      } catch (statusError) {
          console.log('⚠️  Could not fetch initial system status');
      }
  }, 2000);
});

// -- Graceful Shutdown -- //

async function gracefulShutdown(signal) {
  console.log(`🛑 ${signal} signal received: starting graceful shutdown`);
  
  let shutdownTimeout = setTimeout(() => {
    console.error('🛑 Force shutdown after 15 seconds timeout');
    process.exit(1);
  }, 15000);

  try {
    console.log('🛑 Stopping server from accepting new connections');
    server.close(() => {
      console.log('✅ HTTP server stopped accepting new connections');
    });

    // 2. بستن اتصالات WebSocket
    if (wsManager && wsManager.ws) {
      console.log("🔴 Closing WebSocket connections...");
      wsManager.ws.close();
      console.log("✅ WebSocket connections closed");
    }

    // 3. بستن اتصالات خارجی API
    console.log("🔴 Closing external API connections...");

    // 4. ذخیره داده‌های نهایی در Gist
    console.log("💾 Saving final data to Gist...");
    await gistManager.saveToGist();
    console.log("✅ Final data saved to Gist");

    // 5. graceful shutdown کامل
    clearTimeout(shutdownTimeout);
    console.log("✅ Graceful shutdown completed successfully");
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimeout);
    console.error("❌ Error during graceful shutdown:", error);
    process.exit(1);
  }
}

// event handler های مختلف برای سیگنال
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// مدیریت خطاهای unhandled
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;
