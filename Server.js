// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import Config
const { PORT } = require('./config/constants');

// Import Models
const GistManager = require('./models/GistManager');
const WebSocketManager = require('./models/WebSocketManager');
const AdvancedCoinStatsAPIClient = require('./models/DataAPIs/CoinStatsAPIClient');
const HistoricalDataAPI = require('./models/DataAPIs/HistoricalDataAPI');
const AdvancedDataAPI = require('./models/DataAPIs/AdvancedDataAPI');
const AdvancedMarketAnalysis = require('./models/TechnicalAnalysis/AdvancedMarketAnalysis');

// Import Routes
const scanRoutes = require('./routes/api/scan');
const coinRoutes = require('./routes/api/coin');
const healthRoutes = require('./routes/api/health');
const advancedRoutes = require('./routes/api/advanced');

// Import Pages
const dashboardPage = require('./routes/pages/dashboard');
const scannerPage = require('./routes/pages/scanner');
const analysisPage = require('./routes/pages/analysis');
const apiDataPage = require('./routes/pages/api-data');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// نمونه‌سازی مدیران
const gistManager = new GistManager();
const wsManager = new WebSocketManager();
const apiClient = new AdvancedCoinStatsAPIClient();
const historicalAPI = new HistoricalDataAPI();
const advancedDataAPI = new AdvancedDataAPI();
const advancedAnalysis = new AdvancedMarketAnalysis();

// Middleware برای اضافه کردن مدیران به request
app.use((req, res, next) => {
    req.gistManager = gistManager;
    req.wsManager = wsManager;
    req.apiClient = apiClient;
    req.historicalAPI = historicalAPI;
    req.advancedDataAPI = advancedDataAPI;
    req.advancedAnalysis = advancedAnalysis;
    next();
});

// ==================== Routes ====================

// API Routes
app.use('/api/scan', scanRoutes);
app.use('/api/coin', coinRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/advanced', advancedRoutes);

// Page Routes
app.use('/', dashboardPage);
app.use('/scan', scannerPage);
app.use('/analysis', analysisPage);
app.use('/api-data', apiDataPage);

// ==================== Basic Routes ====================

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'VortexAI Advanced Server',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// Root Redirect
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// ==================== Error Handling ====================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Global Error Handler
app.use((error, req, res, next) => {
    console.error('🚨 Global error handler:', error);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
});

// ==================== Startup ====================

async function startServer() {
    try {
        // راه‌اندازی اولیه
        console.log('🚀 Starting VortexAI Advanced Server...');
        
        // بررسی اتصال به APIها
        console.log('🔧 Initializing APIs...');
        
        // راه‌اندازی سرور
        app.listen(PORT, '0.0.0.0', () => {
            console.log(✅ VortexAI Advanced Server running on port ${PORT});
            console.log(📊 Dashboard: http://localhost:${PORT}/);
            console.log(🔍 Scanner: http://localhost:${PORT}/scan);
            console.log(📈 API Data: http://localhost:${PORT}/api-data);
            console.log(❤️ Health: http://localhost:${PORT}/health);
            console.log(🔬 Advanced: http://localhost:${PORT}/api/advanced/status);
            console.log('✨ All systems ready!');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful Shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, starting graceful shutdown...');
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, starting graceful shutdown...');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
