const express = require('express');
const { AdvancedCoinStatsAPIClient, apiDebugSystem } = require('../models/APIClients');
const TechnicalAnalysisEngine = require('../models/TechnicalAnalysis');
const constants = require('../config/constants');

const router = express.Router();

// تابع کمکی برای ساخت پاسخ استاندارد
function createResponse(success, data = null, error = null, metadata = {}) {
    return {
        success,
        data,
        error,
        metadata: {
            timestamp: new Date().toISOString(),
            ...metadata
        }
    };
}

// تابع کمکی برای هندل کردن درخواست های API
async function handleApiRequest(apiCall, req, res, endpointName) {
    const startTime = Date.now();
    const request = apiDebugSystem.logRequest('GET', endpointName, req.query);
    
    try {
        const result = await apiCall;
        const duration = Date.now() - startTime;
        
        if (result.success) {
            apiDebugSystem.logResponse(request, { dataSize: JSON.stringify(result.data).length }, duration);
            res.json(createResponse(true, result.data, null, {
                processingTime: `${duration}ms`,
                endpoint: endpointName
            }));
        } else {
            apiDebugSystem.logError(request, new Error(result.error));
            res.status(500).json(createResponse(false, null, result.error, {
                processingTime: `${duration}ms`,
                endpoint: endpointName
            }));
        }
    } catch (error) {
        const duration = Date.now() - startTime;
        apiDebugSystem.logError(request, error, error.stack);
        res.status(500).json(createResponse(false, null, error.message, {
            processingTime: `${duration}ms`,
            endpoint: endpointName
        }));
    }
}

module.exports = ({ gistManager, wsManager }) => {
    const apiClient = new AdvancedCoinStatsAPIClient();

    // ==================== ENDPOINT اصلی اسکن ====================
    router.get("/scan", async (req, res) => {
        try {
            const { limit = 100, filter = 'volume', timeframe = '24h' } = req.query;
            
            console.log('🔍 Scanning market with params:', { limit, filter, timeframe });
            
            // دریافت داده از API اصلی
            const result = await apiClient.getCoins(parseInt(limit), 'USD', false);
            
            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: result.error || 'Failed to fetch market data',
                    code: 'API_ERROR'
                });
            }

            // تطبیق ساختار داده - استفاده از "result" که در API اصلی وجود دارد
            let coins = result.data?.result || result.data || [];
            
            console.log('📊 Raw data structure analysis:', {
                hasResult: !!result.data?.result,
                hasData: !!result.data,
                dataIsArray: Array.isArray(result.data),
                coinsCount: coins.length
            });

            // اعمال فیلترها
            if (filter === 'volume') {
                coins = coins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
            } else if (filter === 'momentum') {
                // استفاده از priceChange1d که در API اصلی وجود دارد
                coins = coins.sort((a, b) => (b.priceChange1d || 0) - (a.priceChange1d || 0));
            } else if (filter === 'change') {
                coins = coins.sort((a, b) => Math.abs(b.priceChange1d || 0) - Math.abs(a.priceChange1d || 0));
            }

            // محدود کردن نتایج
            coins = coins.slice(0, parseInt(limit));

            // ساخت پاسخ با ساختار مورد انتظار front-end
            const response = {
                success: true,
                data: {
                    coins: coins.map(coin => ({
                        // تطبیق فیلدها با front-end
                        id: coin.id,
                        symbol: coin.symbol,
                        name: coin.name,
                        price: coin.price,
                        priceChange24h: coin.priceChange1d, // استفاده از priceChange1d که در داده اصلی است
                        volume: coin.volume,
                        marketCap: coin.marketCap,
                        rank: coin.rank,
                        icon: coin.icon
                    })),
                    total_scanned: coins.length,
                    total_available: coins.length,
                    market_stats: {
                        total_market_cap: coins.reduce((sum, coin) => sum + (coin.marketCap || 0), 0),
                        average_change: coins.reduce((sum, coin) => sum + (coin.priceChange1d || 0), 0) / coins.length,
                        top_gainer: coins[0]?.name || 'N/A',
                        scan_type: 'basic'
                    },
                    timestamp: new Date().toISOString(),
                    scan_params: { limit, filter, timeframe }
                }
            };

            console.log('✅ Scan completed:', { 
                coins: coins.length,
                firstCoin: response.data.coins[0]?.name
            });
            
            res.json(response);

        } catch (error) {
            console.error('❌ Scan error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'SCAN_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    });

    // ==================== ENDPOINT تست اسکن ====================
    router.get("/scan/test", async (req, res) => {
        try {
            // تست مستقیم API Client
            const testResult = await apiClient.getCoins(3, 'USD', false);
            
            // بررسی ساختار داده
            const dataStructure = {
                hasSuccess: testResult.hasOwnProperty('success'),
                hasData: testResult.hasOwnProperty('data'),
                dataHasResult: testResult.data?.hasOwnProperty('result'),
                dataIsArray: Array.isArray(testResult.data),
                rawKeys: testResult.data ? Object.keys(testResult.data) : [],
                resultIsArray: Array.isArray(testResult.data?.result)
            };
            
            // نمونه داده برای بررسی
            const sampleData = testResult.data?.result?.[0] || testResult.data?.[0] || testResult.data || 'No data';
            
            res.json({
                success: true,
                api_client_working: testResult.success,
                data_structure: dataStructure,
                sample_data: sampleData,
                timestamp: new Date().toISOString(),
                message: 'Scan test endpoint is working'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                api_client_status: 'ERROR',
                timestamp: new Date().toISOString()
            });
        }
    });

    // ==================== سایر endpointهای موجود ====================
    
    // مارکت کپ جهانی
    router.get("/markets/cap", async (req, res) => {
        await handleApiRequest(
            apiClient.getMarketCap(false),
            req, res, '/markets/cap'
        );
    });

    // دشبورد بینش ترکیبی
    router.get("/insights/dashboard", async (req, res) => {
        try {
            const [btcDominance, fearGreed, marketCap] = await Promise.all([
                apiClient.getBTCDominance('all', false),
                apiClient.getFearGreedIndex(false),
                apiClient.getMarketCap(false)
            ]);

            const dashboardData = {
                btc_dominance: btcDominance.success ? btcDominance.data : null,
                fear_greed: fearGreed.success ? fearGreed.data : null,
                market_cap: marketCap.success ? marketCap.data : null,
                timestamp: new Date().toISOString()
            };

            res.json(createResponse(true, dashboardData, null, {
                endpoint: '/insights/dashboard'
            }));
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });

    // سلامت سیستم
    router.get("/health", async (req, res) => {
        try {
            const wsStatus = wsManager.getConnectionStatus();
            const gistData = gistManager.getAllData();
            const performanceStats = apiDebugSystem.getPerformanceStats();

            const healthData = {
                status: 'healthy',
                service: 'VortexAI Crypto Scanner',
                version: '7.0 - Enhanced API',
                components: {
                    websocket: {
                        connected: wsStatus.connected,
                        active_coins: wsStatus.active_coins,
                        status: wsStatus.connected ? 'healthy' : 'unhealthy'
                    },
                    database: {
                        stored_coins: Object.keys(gistData.prices || {}).length,
                        status: 'healthy'
                    },
                    api: {
                        request_count: performanceStats.totalRequests,
                        success_rate: performanceStats.successRate,
                        status: 'healthy'
                    }
                },
                performance: performanceStats
            };

            res.json(createResponse(true, healthData, null, {
                endpoint: '/health'
            }));
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });

    // لیست کوین ها
    router.get("/coins", async (req, res) => {
        await handleApiRequest(
            apiClient.getCoins(
                parseInt(req.query.limit) || 100,
                req.query.currency || 'USD',
                false
            ),
            req, res, '/coins'
        );
    });

    // تحلیل تکنیکال
     // در routes/api.js - endpoint تحلیل تکنیکال رو با این کد جایگزین کنید:

    router.get("/analysis/technical", async (req, res) => {
        const { symbol, timeframe = '24h' } = req.query;

        if (!symbol) {
            return res.status(400).json(createResponse(false, null, 'Symbol parameter is required'));
        }

        try {
            console.log('🔍 Technical Analysis Request:', { symbol, timeframe });

            // تست اول: بررسی API Client
            const coinData = await apiClient.getCoinDetails(symbol, 'USD', false);
            console.log('📊 Coin Data Result:', {
                success: coinData.success,
                hasData: !!coinData.data,
                error: coinData.error
             });

            if (!coinData.success) {
                throw new Error(`Failed to fetch coin data: ${coinData.error}`);
            }

            // تست دوم: دریافت داده‌های تاریخی
            const historicalData = await apiClient.getCoinCharts(symbol, timeframe, false);
            console.log('📈 Historical Data Result:', {
                success: historicalData.success,
                hasData: !!historicalData.data,
                dataStructure: historicalData.data ? Object.keys(historicalData.data) : 'no data',
                chartData: historicalData.data?.chart ? historicalData.data.chart.slice(0, 3) : 'no chart',
                error: historicalData.error
            });

            if (!historicalData.success) {
                throw new Error(`Failed to fetch historical data: ${historicalData.error}`);
            }

            // بررسی ساختار داده‌های تاریخی
            if (!historicalData.data || !historicalData.data.chart || !Array.isArray(historicalData.data.chart)) {
                throw new Error('No valid chart data available for analysis');
            }

            // تست سوم: بررسی موتور تحلیل تکنیکال
            console.log('⚙️ Technical Analysis Engine Check:', {
                engineExists: !!TechnicalAnalysisEngine,
                functions: TechnicalAnalysisEngine ? Object.keys(TechnicalAnalysisEngine) : 'not found'
            });

            if (!TechnicalAnalysisEngine) {
                throw new Error('Technical Analysis Engine not available');
            }
   
            // آماده‌سازی داده برای تحلیل تکنیکال - ساختار ساده
            const priceData = historicalData.data.chart.map((point, index) => {
                if (Array.isArray(point) && point.length >= 2) {                 
                    return {
                        timestamp: point[0],
                        price: point[1], // قیمت close
                        // برای اندیکاتورهای پیشرفته‌تر می‌تونیم high/low/open رو شبیه‌سازی کنیم
                        high: point[1] * 1.02,
                        low: point[1] * 0.98,
                        open: point[1] * 0.99,
                        volume: point[2] || 1000 // اگر حجم وجود داره استفاده کن، در غیر این صورت مقدار پیش‌فرض
                    };
                }
                return {
                    timestamp: Date.now() - (index * 3600000),
                    price: point,
                    high: point * 1.02,
                    low: point * 0.98,
                    open: point * 0.99,
                    volume: 1000
                };
            }).filter(point => point !== null && point.price > 0);

            console.log('📋 Prepared Price Data:', {
                dataPoints: priceData.length,
                sample: priceData.slice(0, 3)
            });

            if (priceData.length < 20) {
                throw new Error(`Insufficient data points for analysis. Only ${priceData.length} points available. Need at least 20.`);
            }

        // محاسبه اندیکاتورها
            let technicalIndicators;
            try {
                technicalIndicators = TechnicalAnalysisEngine.calculateAllIndicators(priceData);
                console.log('📊 Indicators Calculated:', {
                    rsi: technicalIndicators.rsi,
                    macd: technicalIndicators.macd,
                    macd_signal: technicalIndicators.macd_signal,
                    moving_avg_20: technicalIndicators.moving_avg_20,
                    indicatorsCount: Object.keys(technicalIndicators).length
                });
            } catch (engineError) {
                console.error('❌ Engine Calculation Error:', engineError);
                throw new Error(`Analysis engine error: ${engineError.message}`);
            }

            // تولید سیگنال‌ها
            let signals;
            try {
                signals = TechnicalAnalysisEngine.generateTradingSignals(technicalIndicators, priceData);
                console.log('🚦 Signals Generated:', {
                    buySignals: signals.buy_signals?.length || 0,
                    sellSignals: signals.sell_signals?.length || 0,
                    allSignals: signals.all_signals?.length || 0
                });
            } catch (signalError) {
                console.error('❌ Signal Generation Error:', signalError);
                signals = {
                    buy_signals: [],
                    sell_signals: [],
                    neutral_signals: [],
                    all_signals: [],
                    signal_strength: 0
                };
            }

            // تحلیل روند
            let trendAnalysis;
            try {
                trendAnalysis = TechnicalAnalysisEngine.analyzeTrend(technicalIndicators, priceData);
                console.log('📈 Trend Analysis:', trendAnalysis);
            } catch (trendError) {
                console.error('❌ Trend Analysis Error:', trendError);
                trendAnalysis = {
                    trend: 'NEUTRAL',
                    strength: 0,
                    moving_averages: {
                        above_20: false,
                        above_50: false,
                        ma20_above_ma50: false
                    }
                };
            }

        // سطوح حمایت و مقاومت
            let supportResistance;
            try {
                supportResistance = TechnicalAnalysisEngine.calculateSupportResistance(priceData);
                console.log('🛡️ Support/Resistance:', supportResistance);
            } catch (srError) {
                console.error('❌ Support/Resistance Error:', srError);
                supportResistance = {
                    support: [0, 0],
                    resistance: [0, 0],
                    current_price: priceData[priceData.length - 1].price
                };
            }

            // ساخت پاسخ نهایی
            const technicalAnalysis = {
                symbol: symbol,
                timeframe: timeframe,
                current_price: priceData[priceData.length - 1].price,
                indicators: technicalIndicators.toJSON ? technicalIndicators.toJSON() : technicalIndicators,
                signals: signals,
                trend: trendAnalysis,
                support_resistance: supportResistance,
                analysis_timestamp: new Date().toISOString()
            };

            console.log('✅ Technical Analysis Completed Successfully');
        
            res.json(createResponse(true, technicalAnalysis, null, {
                endpoint: '/analysis/technical',
                data_points: priceData.length,
                processing_time: 'completed'
            }));

        } catch (error) {
            console.error('❌ Technical Analysis Error:', error);
            res.status(500).json(createResponse(false, null, error.message, {
                endpoint: '/analysis/technical',
                error_type: 'analysis_failed'
            }));
        }
    });

    // داده تاریخی
    router.get("/coin/:symbol/history/:timeframe", async (req, res) => {
        const { symbol, timeframe } = req.params;
        await handleApiRequest(
            apiClient.getCoinCharts(symbol, timeframe, false),
            req, res, `/coin/${symbol}/history/${timeframe}`
        );
    });

    // جزئیات کوین
    router.get("/coins/:id/details", async (req, res) => {
        const { id } = req.params;
        await handleApiRequest(
            apiClient.getCoinDetails(id, req.query.currency || 'USD', false),
            req, res, `/coins/${id}/details`
        );
    });

    // همه اخبار
    router.get("/news", async (req, res) => {
        await handleApiRequest(
            apiClient.getNews({
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            }, false),
            req, res, '/news'
        );
    });

    // تسلط بیت‌کوین
    router.get("/insights/btc-dominance", async (req, res) => {
        await handleApiRequest(
            apiClient.getBTCDominance(req.query.type || 'all', false),
            req, res, '/insights/btc-dominance'
        );
    });

    // شاخص ترس و طمع
    router.get("/insights/fear-greed", async (req, res) => {
        await handleApiRequest(
            apiClient.getFearGreedIndex(false),
            req, res, '/insights/fear-greed'
        );
    });

    // مارکت کپ اصلی
    router.get("/markets/summary", async (req, res) => {
        await handleApiRequest(
            apiClient.getMarketCap(false),
            req, res, '/markets/summary'
        );
    });

    // سلامت ترکیبی
    router.get("/health/combined", async (req, res) => {
        try {
            const wsStatus = wsManager.getConnectionStatus();
            const gistData = gistManager.getAllData();
            const performanceStats = apiDebugSystem.getPerformanceStats();
            const endpointHealth = apiDebugSystem.checkAllEndpointsHealth();

            const healthData = {
                status: 'healthy',
                service: 'VortexAI Combined System',
                version: '7.0 - Enhanced API',
                timestamp: new Date().toISOString(),
                websocket_status: {
                    connected: wsStatus.connected,
                    active_coins: wsStatus.active_coins,
                    total_subscribed: wsStatus.total_subscribed,
                    provider: "LBank",
                    status: wsStatus.connected ? 'healthy' : 'unhealthy'
                },
                gist_status: {
                    active: true,
                    total_coins: Object.keys(gistData.prices || {}).length,
                    last_updated: gistData.last_updated,
                    status: 'healthy'
                },
                api_status: {
                    requests_count: performanceStats.totalRequests,
                    success_rate: performanceStats.successRate,
                    average_response_time: performanceStats.averageDuration,
                    endpoint_health: endpointHealth.summary.healthPercentage,
                    status: performanceStats.successRate > 80 ? 'healthy' : 'degraded'
                }
            };

            res.json(createResponse(true, healthData, null, {
                endpoint: '/health/combined'
            }));
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });

    return router;
};
