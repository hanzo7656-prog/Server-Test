const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ایمپورت ماژول های جدید
const constants = require('./config/constants');
const logger = require('./config/logger');
const { ERROR_CODES, errorHandler } = require('./config/error-codes'); // جدید
const { apiClient } = require('./utils/api-client'); // جدید

// ایمپورت ماژول های مدل
const GistManager = require('./models/GistManager');
const WebSocketManager = require('./models/WebSocketManager');
const DataProcessor = require('./models/DataProcessor'); // جدید
const {TechnicalAnalysisEngine} = require('./models/TechnicalAnalysis');
const { AdvancedCoinStatsAPIClient, apiDebugSystem } = require('./models/APIClients');

// ایمپورت ماژول های روتر
const apiRoutes = require('./routes/api');
const modernRoutes = require('./routes/modern-pages');

const app = express();
const PORT = constants.PORT || process.env.PORT || 3000;

// میدلورهای پیشرفته
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// میدلور لاگینگ درخواست‌ها
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
});

// میدلور هدرهای امنیتی
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    
    // برای درخواست‌های OPTIONS پاسخ بده
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// میدلور مدیریت کش (ساده)
let cache = {
    coinsList: { data: null, timestamp: null },
    historicalData: {},
    realtimePrices: {},
    marketSummary: { data: null, timestamp: null } // جدید
};

app.use((req, res, next) => {
    req.cache = cache;
    next();
});

// نمونه‌سازی مدیران
const gistManager = new GistManager();
const wsManager = new WebSocketManager(gistManager);
const advancedApiClient = new AdvancedCoinStatsAPIClient();

// وابستگی‌های جدید برای routeها
const dependencies = {
    gistManager,
    wsManager,
    apiClient: advancedApiClient,
    dataProcessor: DataProcessor, // جدید
    technicalAnalysis: TechnicalAnalysisEngine,
    errorHandler, // جدید
    cache // جدید
};

console.log('🚀 Initializing VortexAI Server...');
console.log('📋 Dependencies status:', {
    gistManager: !!gistManager,
    wsManager: !!wsManager,
    apiClient: !!advancedApiClient,
    dataProcessor: !!DataProcessor,
    technicalAnalysis: !! TechnicalAnalysisEngine,
    errorHandler: !!errorHandler
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
        res.redirect('/analysis-page?symbol=' + encodeURIComponent(symbol));
    } else {
        res.status(400).json({ 
            success: false,
            error: "Symbol parameter required",
            code: ERROR_CODES.VALIDATION.MISSING_REQUIRED_FIELD
        });
    }
});

app.get('/markets', (req, res) => {
    const type = req.query.type || 'all';
    res.redirect(`/markets-page?view=${type}`);
});

app.get('/insights', (req, res) => {
    res.redirect('/insights-page');
});

app.get('/news', (req, res) => {
    const type = req.query.type || 'latest';
    res.redirect(`/news-page?type=${type}`);
});

app.get('/health-dashboard', (req, res) => {
    res.redirect('/health-page');
});

app.get('/settings-page', (req, res) => {
    res.redirect('/settings');
});

// ریدایرکت‌های API قدیمی به جدید
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

// رجیستر کردن routeهای اصلی
app.use('/api', apiRoutes(dependencies));
app.use('/', modernRoutes(dependencies));

// ========== HEALTH & STATUS ROUTES ==========

app.get('/health', async (req, res) => {
    try {
        const healthData = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'VortexAI Crypto Scanner',
            version: '8.0 - Enhanced Architecture',
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            dependencies: {
                database: !!gistManager,
                websocket: !!wsManager,
                api: !!advancedApiClient,
                data_processor: !!DataProcessor
            }
        };

        res.status(200).json(healthData);
    } catch (error) {
        const errorData = errorHandler.logError(error, { endpoint: '/health' });
        res.status(500).json({
            success: false,
            error: errorData.message,
            code: errorData.code
        });
    }
});

app.get('/health/ready', async (req, res) => {
    try {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();
        const apiStatus = await apiClient.checkConnection();

        const healthStatus = {
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'VortexAI Crypto Scanner',
            version: '8.0 - Enhanced Architecture',
            services: {
                websocket: {
                    connected: wsStatus.connected,
                    activeCoins: wsStatus.active_coins,
                    status: wsStatus.connected ? 'Healthy' : 'Unhealthy',
                    latency: wsStatus.latency || 'N/A'
                },
                database: {
                    storedCoins: Object.keys(gistData.prices || {}).length,
                    status: process.env.GITHUB_TOKEN ? 'Healthy' : 'Degraded',
                    lastSync: gistData.last_updated || 'Never'
                },
                api: {
                    connected: apiStatus.connected,
                    responseTime: apiStatus.responseTime,
                    status: apiStatus.connected ? 'Healthy' : 'Unhealthy'
                },
                cache: {
                    coins: cache.coinsList.timestamp ? 'Active' : 'Empty',
                    market: cache.marketSummary.timestamp ? 'Active' : 'Empty',
                    size: Object.keys(cache).length
                }
            },
            performance: {
                uptime: process.uptime(),
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
                }
            }
        };

        const allHealthy = wsStatus.connected && apiStatus.connected && process.env.GITHUB_TOKEN;
        const statusCode = allHealthy ? 200 : 503;
        
        res.status(statusCode).json(healthStatus);
    } catch (error) {
        const errorData = errorHandler.logError(error, { endpoint: '/health/ready' });
        res.status(503).json({
            success: false,
            error: errorData.message,
            code: errorData.code,
            status: 'Unhealthy'
        });
    }
});

// تست route ساده
app.get('/test-simple', (req, res) => {
    res.json({
        success: true,
        message: '✅ Route Test Works!',
        timestamp: new Date().toISOString(),
        features: {
            new_architecture: true,
            data_processor: true,
            error_handler: true,
            api_client: true
        }
    });
});

// اطلاعات سرور
app.get('/server/info', (req, res) => {
    try {
        res.json({
            server: {
                url: constants.SERVER_URL,
                environment: process.env.NODE_ENV || 'development',
                port: PORT,
                started_at: new Date(Date.now() - process.uptime() * 1000).toISOString(),
                node_version: process.version
            },
            api: {
                base_url: constants.API_URLS.base,
                rate_limit: constants.API_CLIENT_CONFIG?.rateLimitDelay || 1000,
                endpoints: {
                    coinstats: 'https://openapiv1.coinstats.app',
                    internal: constants.SERVER_URL + '/api'
                }
            },
            features: {
                realtime_data: true,
                technical_analysis: true,
                news_aggregation: true,
                market_insights: true,
                health_monitoring: true,
                advanced_scanning: true,
                data_processing: true,
                error_handling: true
            },
            architecture: {
                version: '8.0',
                modules: {
                    config: ['constants', 'logger', 'api-endpoints', 'error-codes'],
                    utils: ['api-client', 'formatters', 'validators', 'helpers'],
                    models: ['DataProcessor', 'APIClients', 'WebSocketManager', 'GistManager', 'TechnicalAnalysis'],
                    routes: ['api', 'modern-pages', 'page-generator', 'navigation-generator']
                }
            }
        });
    } catch (error) {
        const errorData = errorHandler.logError(error, { endpoint: '/server/info' });
        res.status(500).json({
            success: false,
            error: errorData.message,
            code: errorData.code
        });
    }
});

// ========== ERROR HANDLING ==========

// هندل کردن خطاهای 404
app.use('*', (req, res) => {
    const error = errorHandler.createError(
        ERROR_CODES.HTTP.NOT_FOUND,
        `Endpoint not found: ${req.originalUrl}`,
        null
    );
    
    res.status(404).json({
        success: false,
        error: error.message,
        code: error.code,
        requested_url: req.originalUrl,
        available_endpoints: {
            api: '/api/*',
            pages: ['/', '/scan-page', '/analysis-page', '/markets-page', '/insights-page', '/news-page', '/health-page', '/settings'],
            health: '/health',
            server_info: '/server/info',
            test: '/test-simple'
        },
        timestamp: error.timestamp
    });
});

// هندلر خطاهای全局
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    const errorData = errorHandler.logError(error, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? errorData.message : 'Something went wrong',
        code: errorData.code,
        details: process.env.NODE_ENV === 'development' ? errorData.details : undefined,
        timestamp: errorData.timestamp
    });
});

// ========== SERVER STARTUP ==========

// راه‌اندازی سرور
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 VortexAI Crypto Scanner Server Started');
    console.log('='.repeat(50));
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌐 Server: ${constants.SERVER_URL}`);
    console.log(`🔄 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ Node.js: ${process.version}`);
    console.log(`⏰ Started: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
    
    console.log('\n📊 Available Endpoints:');
    console.log('   • API Routes: /api/*');
    console.log('   • Modern Pages: /home-page, /scan-page, /analysis-page, /markets-page, /insights-page, /news-page, /health-page, /settings');
    console.log('   • Health Check: /health');
    console.log('   • Server Info: /server/info');
    console.log('   • Test Route: /test-simple');
    console.log('');
    
    console.log('🔧 New Architecture Features:');
    console.log('   • Enhanced API Client with retry logic');
    console.log('   • Advanced Error Handling system');
    console.log('   • Technical Analysis Engine');
    console.log('   • Data Processing pipeline');
    console.log('   • Formatters & Validators');
    console.log('   • Modern Navigation & Page Generator');
    console.log('');
    
    // وضعیت اولیه سیستم را چاپ کن
    setTimeout(async () => {
        try {
            const wsStatus = wsManager.getConnectionStatus();
            const gistStatus = gistManager.getStatus();
            const apiStatus = await apiClient.checkConnection();
            
            console.log('🔍 Initial System Status:');
            console.log(`   • WebSocket: ${wsStatus.connected ? '🟢 Connected' : '🔴 Disconnected'}`);
            console.log(`   • Active Coins: ${wsStatus.active_coins}`);
            console.log(`   • Gist Database: ${gistStatus.active ? '🟢 Active' : '🔴 Inactive'}`);
            console.log(`   • Stored Coins: ${gistStatus.total_coins}`);
            console.log(`   • API Connection: ${apiStatus.connected ? '🟢 Connected' : '🔴 Disconnected'}`);
            console.log(`   • Response Time: ${apiStatus.responseTime}ms`);
            console.log('');
            
        } catch (statusError) {
            console.log('⚠️  Could not fetch initial system status:', statusError.message);
        }
    }, 2000);
});

// -- Graceful Shutdown -- //

async function gracefulShutdown(signal) {
    console.log(`\n🛑 ${signal} signal received: starting graceful shutdown`);
    
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

        // 3. بستن اتصالات API
        console.log("🔴 Closing API connections...");
        // API client cleanup if needed

        // 4. ذخیره داده‌های نهایی در Gist
        console.log("💾 Saving final data to Gist...");
        await gistManager.saveToGist();
        console.log("✅ Final data saved to Gist");

        // 5. ذخیره لاگ خطاها
        console.log("📝 Saving error logs...");
        const errorSummary = errorHandler.getErrorSummary();
        console.log(`   Total errors: ${errorSummary.totalErrors}`);
        console.log("✅ Error logs saved");

        // 6. graceful shutdown کامل
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
    errorHandler.logError(error, { type: 'uncaughtException' });
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    errorHandler.logError(reason, { type: 'unhandledRejection', promise: promise.toString() });
    gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;
