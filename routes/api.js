const express = require('express');
const { AdvancedCoinStatsAPIClient, apiDebugSystem } = require('./apiclient');
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

// تابع کمکی برای هندل کردن درخواست‌های API
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

    // ==================== دکمه ۱: داشبورد ====================
    
    // اسکن بازار - اصلی
    router.get("/scan", async (req, res) => {
        await handleApiRequest(
            apiClient.getCoins(parseInt(req.query.limit) || 100, 'USD', false),
            req, res, '/scan'
        );
    });
    
    // مارکت کپ جهانی
    router.get("/markets/cap", async (req, res) => {
        await handleApiRequest(
            apiClient.getMarketCap(false),
            req, res, '/markets/cap'
        );
    });
    
    // بینش‌های ترکیبی
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
    
    // آخرین اخبار برای داشبورد
    router.get("/dashboard/news", async (req, res) => {
        await handleApiRequest(
            apiClient.getNews({ limit: 10 }, false),
            req, res, '/dashboard/news'
        );
    });
    
    // برترین سودده‌ها برای داشبورد
    router.get("/dashboard/top-gainers", async (req, res) => {
        await handleApiRequest(
            apiClient.getTopGainers(parseInt(req.query.limit) || 5),
            req, res, '/dashboard/top-gainers'
        );
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

    // ==================== دکمه ۲: اسکن ====================
    
    // اسکن پیشرفته
    router.get("/scan/advanced", async (req, res) => {
        const limit = Math.min(parseInt(req.query.limit) || 100, 300);
        const filterType = req.query.filter || 'volume';
        
        try {
            const [apiResult, realtimeData] = await Promise.all([
                apiClient.getCoins(limit, 'USD', false),
                Promise.resolve(wsManager.getRealtimeData())
            ]);
            
            if (!apiResult.success) {
                throw new Error(apiResult.error);
            }
            
            let coins = apiResult.data || [];
            
            // ترکیب با داده real-time
            const enhancedCoins = coins.map(coin => {
                const symbol = `${coin.symbol.toLowerCase()}_usdt`;
                const realtime = realtimeData[symbol];
                return {
                    ...coin,
                    realtime_price: realtime?.price,
                    realtime_volume: realtime?.volume,
                    realtime_change: realtime?.change,
                    analysis: {
                        signal_strength: Math.random() * 100, // جایگزین با موتور تحلیل واقعی
                        trend: (coin.priceChange24h || 0) > 0 ? "up" : "down",
                        volatility: Math.random() * 100
                    }
                };
            });
            
            // فیلتر کردن
            switch (filterType) {
                case 'volume':
                    enhancedCoins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
                    break;
                case 'momentum':
                    enhancedCoins.sort((a, b) => Math.abs(b.priceChange24h || 0) - Math.abs(a.priceChange24h || 0));
                    break;
                case 'signal':
                    enhancedCoins.sort((a, b) => (b.analysis?.signal_strength || 0) - (a.analysis?.signal_strength || 0));
                    break;
            }
            
            res.json(createResponse(true, {
                coins: enhancedCoins.slice(0, limit),
                total_scanned: enhancedCoins.length,
                filter_applied: filterType,
                scan_mode: 'advanced'
            }, null, { endpoint: '/scan/advanced' }));
            
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });
    
    // اسکن ساده
    router.get("/scan/basic", async (req, res) => {
        await handleApiRequest(
            apiClient.getCoins(parseInt(req.query.limit) || 200, 'USD', false),
            req, res, '/scan/basic'
        );
    });
    
    // اسکن با فیلتر AI
    router.get("/scan/ai-signal", async (req, res) => {
        const limit = parseInt(req.query.limit) || 50;
        
        try {
            const apiResult = await apiClient.getCoins(100, 'USD', false);
            
            if (!apiResult.success) {
                throw new Error(apiResult.error);
            }
            
            let coins = apiResult.data || [];
            
            // شبیه‌سازی سیگنال AI
            const aiRatedCoins = coins.map(coin => ({
                ...coin,
                ai_signal: {
                    strength: Math.random() * 100,
                    confidence: Math.random() * 100,
                    recommendation: Math.random() > 0.5 ? 'BUY' : 'HOLD'
                }
            })).sort((a, b) => b.ai_signal.strength - a.ai_signal.strength);
            
            res.json(createResponse(true, {
                coins: aiRatedCoins.slice(0, limit),
                ai_model: 'VortexAI-Signal-v2',
                signal_threshold: 70
            }, null, { endpoint: '/scan/ai-signal' }));
            
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });
    
    // لیست کوین‌ها
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

    // ==================== دکمه ۳: انالیز ====================
    
    // تحلیل تکنیکال
    router.get("/analysis/technical", async (req, res) => {
        const { symbol, timeframe = '24h' } = req.query;
        
        if (!symbol) {
            return res.status(400).json(createResponse(false, null, 'Symbol parameter is required'));
        }
        
        try {
            const [coinData, historicalData] = await Promise.all([
                apiClient.getCoinDetails(symbol, 'USD', false),
                apiClient.getCoinCharts(symbol, timeframe, false)
            ]);
            
            if (!coinData.success || !historicalData.success) {
                throw new Error('Failed to fetch analysis data');
            }
            
            // شبیه‌سازی تحلیل تکنیکال
            const technicalAnalysis = {
                symbol: symbol,
                current_price: coinData.data?.price || 0,
                indicators: {
                    rsi: Math.random() * 100,
                    macd: { value: Math.random() * 2 - 1, signal: Math.random() * 2 - 1 },
                    bollinger_bands: {
                        upper: (coinData.data?.price || 0) * 1.1,
                        lower: (coinData.data?.price || 0) * 0.9,
                        middle: coinData.data?.price || 0
                    }
                },
                signals: {
                    trend: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
                    strength: Math.random() * 100,
                    confidence: Math.random() * 100
                },
                chart_data: historicalData.data,
                timeframe: timeframe
            };
            
            res.json(createResponse(true, technicalAnalysis, null, {
                endpoint: '/analysis/technical'
            }));
            
        } catch (error) {
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
    
    // جزییات کوین
    router.get("/coins/:id/details", async (req, res) => {
        const { id } = req.params;
        
        await handleApiRequest(
            apiClient.getCoinDetails(id, req.query.currency || 'USD', false),
            req, res, `/coins/${id}/details`
        );
    });
    
    // قیمت میانگین
    router.get("/analysis/average-price", async (req, res) => {
        const { coinId, timestamp } = req.query;
        
        await handleApiRequest(
            apiClient.getCoinAvgPrice(coinId, timestamp, false),
            req, res, '/analysis/average-price'
        );
    });
    
    // چارت چند کوین
    router.get("/analysis/multi-chart", async (req, res) => {
        const { coinIds, period = '7d' } = req.query;
        
        if (!coinIds) {
            return res.status(400).json(createResponse(false, null, 'coinIds parameter is required'));
        }
        
        const coinIdArray = coinIds.split(',').map(id => id.trim());
        
        await handleApiRequest(
            apiClient.getCoinsCharts(coinIdArray, period, false),
            req, res, '/analysis/multi-chart'
        );
    });

    // ==================== دکمه ۴: اخبار ====================
    
    // همه اخبار
    router.get("/news", async (req, res) => {
        await handleApiRequest(
            apiClient.getNews({
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                from: req.query.from,
                to: req.query.to
            }, false),
            req, res, '/news'
        );
    });
    
    // اخبار ترند
    router.get("/news/trending", async (req, res) => {
        await handleApiRequest(
            apiClient.getNewsByType('trending', {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 15
            }, false),
            req, res, '/news/trending'
        );
    });
    
    // اخبار منتخب
    router.get("/news/handpicked", async (req, res) => {
        await handleApiRequest(
            apiClient.getNewsByType('handpicked', {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 15
            }, false),
            req, res, '/news/handpicked'
        );
    });
    
    // جدیدترین اخبار
    router.get("/news/latest", async (req, res) => {
        await handleApiRequest(
            apiClient.getNewsByType('latest', {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            }, false),
            req, res, '/news/latest'
        );
    });
    
    // اخبار صعودی
    router.get("/news/bullish", async (req, res) => {
        await handleApiRequest(
            apiClient.getNewsByType('bullish', {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 15
            }, false),
            req, res, '/news/bullish'
        );
    });
    
    // اخبار نزولی
    router.get("/news/bearish", async (req, res) => {
        await handleApiRequest(
            apiClient.getNewsByType('bearish', {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 15
            }, false),
            req, res, '/news/bearish'
        );
    });
    
    // منابع خبری
    router.get("/news/sources", async (req, res) => {
        await handleApiRequest(
            apiClient.getNewsSources(false),
            req, res, '/news/sources'
        );
    });
    
    // جزییات خبر
    router.get("/news/detail/:id", async (req, res) => {
        const { id } = req.params;
        
        await handleApiRequest(
            apiClient.getNewsDetail(id, false),
            req, res, `/news/detail/${id}`
        );
    });

    return router;
};
