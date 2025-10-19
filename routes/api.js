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
    router.get("/analysis/technical", async (req, res) => {
        const { symbol, timeframe = '24h' } = req.query;

        if (!symbol) {
            return res.status(400).json(createResponse(false, null, 'Symbol parameter is required'));
        }

        try {
            console.log('🔍 Technical Analysis Request:', { symbol, timeframe });
  
            // دریافت داده‌های تاریخی
            const historicalData = await apiClient.getCoinCharts(symbol, timeframe, false);
        
            if (!historicalData.success) {
                throw new Error(`Failed to fetch chart data: ${historicalData.error}`);
            }

            // بررسی ساختار داده
            if (!historicalData.data || !historicalData.data.chart) {
                throw new Error('No chart data available');
            }

            console.log('📈 Chart data received:', {
                dataPoints: historicalData.data.chart.length,
                sample: historicalData.data.chart.slice(0, 3)
            });

            // آماده‌سازی داده برای تحلیل
            const priceData = historicalData.data.chart.map(point => ({
                price: point[1], // قیمت close
                timestamp: point[0]
            }));

            // محاسبه اندیکاتورها
            const indicators = TechnicalAnalysisEngine.calculateAllIndicators(priceData);
        
            // تولید سیگنال‌ها
            const signals = TechnicalAnalysisEngine.generateTradingSignals(indicators, priceData);
        
            // تحلیل روند
            const trend = TechnicalAnalysisEngine.analyzeTrend(indicators, priceData);
        
            // سطوح حمایت و مقاومت
            const supportResistance = TechnicalAnalysisEngine.calculateSupportResistance(priceData);

            const analysisResult = {
                symbol: symbol,
                timeframe: timeframe,
                current_price: priceData[priceData.length - 1].price,
                indicators: indicators.toJSON(),
                signals: signals,
                trend: trend,
                support_resistance: supportResistance,
                analysis_timestamp: new Date().toISOString()
            };

            console.log('✅ Technical Analysis Completed:', {
                symbol: symbol,
                signals: signals.all_signals.length,
                trend: trend.trend
            });

            res.json(createResponse(true, analysisResult, null, {
                endpoint: '/analysis/technical'
            }));

        } catch (error) {
            console.error('❌ Technical Analysis Error:', error);
            res.status(500).json(createResponse(false, null, error.message));
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
