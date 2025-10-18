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
        // ==================== دکمه ۵: بینش های بازار ====================

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

    // نمودار ترس و طمع
    router.get("/insights/fear-greed-chart", async (req, res) => {
        await handleApiRequest(
            apiClient.getFearGreedChart(false),
            req, res, '/insights/fear-greed-chart'
        );
    });
  
    // نمودار رنگین‌کمان
    router.get("/insights/rainbow-chart", async (req, res) => {
        await handleApiRequest(
            apiClient.getRainbowChart(req.query.coin || 'bitcoin', false),
            req, res, '/insights/rainbow-chart'
        );
    });

    // داده جهانی
    router.get("/insights/global-data", async (req, res) => {
        await handleApiRequest(
            apiClient.getGlobalData(false),
            req, res, '/insights/global-data'
        );
    });

    // ارزها
    router.get("/insights/currencies", async (req, res) => {
        await handleApiRequest(
            apiClient.getCurrencies(false),
            req, res, '/insights/currencies'
        );
    });

    // ==================== دکمه ۶: مارکت کپ / مارکت ====================

    // مارکت کپ اصلی
    router.get("/markets/summary", async (req, res) => {
        await handleApiRequest(
            apiClient.getMarketCap(false),
            req, res, '/markets/summary'
        );
    });

    // صرافی‌ها
    router.get("/markets/exchanges", async (req, res) => {
        await handleApiRequest(
            apiClient.getTickerExchanges(false),
            req, res, '/markets/exchanges'
        );
    });

    // بازارها
    router.get("/markets/tickers", async (req, res) => {
        await handleApiRequest(
            apiClient.getTickerMarkets(false),
            req, res, '/markets/tickers'
        );
    });

    // قیمت تبادل
    router.get("/markets/exchange-price", async (req, res) => {
        const { exchange, from, to, timestamp } = req.query;
    
        if (!exchange || !from || !to) {
            return res.status(400).json(createResponse(false, null, 'exchange, from, and to parameters are required'));
        }
    
        await handleApiRequest(
            apiClient.getCoinExchangePrice(exchange, from, to, timestamp, false),
            req, res, '/markets/exchange-price'
        );
    });
 
    // تیکرهای صرافی
    router.get("/markets/exchange-tickers", async (req, res) => {
        // این اندپوینت نیاز به پیاده‌سازی جداگانه دارد
        // فعلاً از getTickerExchanges استفاده می‌کنیم
        await handleApiRequest(
            apiClient.getTickerExchanges(false),
            req, res, '/markets/exchange-tickers'
        );
    });

// ==================== دکمه ۷: سلامت ====================

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
                    timeframes_available: gistManager.getAvailableTimeframes(),
                    status: 'healthy'
                },
            
                api_status: {
                    requests_count: performanceStats.totalRequests,
                    success_rate: performanceStats.successRate,
                    average_response_time: performanceStats.averageDuration,
                    endpoint_health: endpointHealth.summary.healthPercentage,
                    status: performanceStats.successRate > 80 ? 'healthy' : 'degraded'
                },
              
                system_status: {
                    uptime: performanceStats.uptime,
                    memory_usage: performanceStats.memoryUsage,
                    node_version: process.version,
                    platform: process.platform
                }
            };

            res.json(createResponse(true, healthData, null, {
                endpoint: '/health/combined'
            }));
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });

    // وضعیت API
    router.get("/health/api-status", async (req, res) => {
        try {
            const wsStatus = wsManager.getConnectionStatus();
            const gistData = gistManager.getAllData();
            const performanceStats = apiDebugSystem.getPerformanceStats();

            const apiStatus = {
                websocket: {
                    connected: wsStatus.connected,
                    active_coins: wsStatus.active_coins,
                    total_subscribed: wsStatus.total_subscribed
                },
                database: {
                    total_coins: Object.keys(gistData.prices || {}).length,
                    last_updated: gistData.last_updated
                },
                performance: performanceStats,
                endpoints_available: [
                    "/scan", "/scan/advanced", "/scan/basic", "/scan/ai-signal",
                    "/analysis/technical", "/coin/:symbol/history/:timeframe", 
                    "/coins/:id/details", "/analysis/average-price", "/analysis/multi-chart",
                    "/news", "/news/trending", "/news/handpicked", "/news/latest",
                    "/news/bullish", "/news/bearish", "/news/sources", "/news/detail/:id",
                    "/insights/btc-dominance", "/insights/fear-greed", "/insights/fear-greed-chart",
                    "/insights/rainbow-chart", "/insights/global-data", "/insights/currencies",
                    "/markets/summary", "/markets/exchanges", "/markets/tickers",
                    "/markets/exchange-price", "/markets/exchange-tickers",
                    "/health", "/health/combined", "/health/api-status",
                    "/settings/timeframes", "/settings/test-endpoints", "/settings/debug"
                ]
            };

            res.json(createResponse(true, apiStatus, null, {
                endpoint: '/health/api-status'
            }));
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });

// ==================== دکمه ۸: تنظیمات ====================

    // تایم‌فریم‌ها
    router.get("/settings/timeframes", async (req, res) => {
        try {
            const timeframes = gistManager.getAvailableTimeframes();
        
            const timeframeData = {
                timeframes: timeframes,
                description: {
                   "1h": "1 hour history - 1 minute intervals",
                    "4h": "4 hours history - 5 minute intervals", 
                    "24h": "24 hours history - 15 minute intervals",
                    "7d": "7 days history - 1 hour intervals",
                    "30d": "30 days history - 4 hour intervals",
                    "180d": "180 days history - 1 day intervals"
                },
                default_timeframe: "24h",
                max_data_points: {
                    "1h": 60,
                    "4h": 48,
                    "24h": 96,
                    "7d": 168,
                    "30d": 180,
                    "180d": 180
                }
            };

            res.json(createResponse(true, timeframeData, null, {
                endpoint: '/settings/timeframes'
            }));
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });

    // تست اندپوینت‌ها
    router.get("/settings/test-endpoints", async (req, res) => {
        try {
            const healthReport = await apiDebugSystem.testAllCriticalConnections();
         
            res.json(createResponse(true, healthReport, null, {
                endpoint: '/settings/test-endpoints'
            }));
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });

    // دیباگ کوین‌استتس
    router.get("/settings/debug", async (req, res) => {
        try {
            const testUrl = "https://openapiv1.coinstats.app/coins?limit=3";
        
            const response = await fetch(testUrl, {
                headers: {
                    'X-API-KEY': process.env.COINSTATS_API_KEY || 'demo-key',
                    'Accept': 'application/json'
                }
            });

            const debugInfo = {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers),
                timestamp: new Date().toISOString()
            };

            if (response.ok) {
                const data = await response.json();
                debugInfo.data_sample = Array.isArray(data) ? data.slice(0, 2) : data;
            } else {
                const text = await response.text();
                debugInfo.error = text.substring(0, 500);
            }

            res.json(createResponse(true, debugInfo, null, {
                endpoint: '/settings/debug'
            }));
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });

// ==================== اندپوینت‌های کمکی ====================

    // وضعیت real-time WebSocket
    router.get("/websocket/status", async (req, res) => {
        try {
            const wsStatus = wsManager.getConnectionStatus();
            const realtimeData = wsManager.getRealtimeData();
        
            const statusData = {
                connected: wsStatus.connected,
                active_coins: wsStatus.active_coins,
                total_subscribed: wsStatus.total_subscribed,
                provider: "LBank",
                sample_data: Object.keys(realtimeData).slice(0, 5).map(symbol => ({
                    symbol,
                    price: realtimeData[symbol]?.price,
                    last_updated: realtimeData[symbol]?.last_updated
                })),
                timestamp: new Date().toISOString()
            };

            res.json(createResponse(true, statusData, null, {
                endpoint: '/websocket/status'
            }));
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });

    // آمار عملکرد سیستم
    router.get("/system/stats", async (req, res) => {
        try {
            const performanceStats = apiDebugSystem.getPerformanceStats();
            const errorAnalysis = apiDebugSystem.analyzeErrors();
        
            const systemStats = {
                performance: performanceStats,
                error_analysis: errorAnalysis,
                recent_activity: {
                    requests: apiDebugSystem.requests.slice(-10).map(req => ({
                        method: req.method,
                        endpoint: req.url,
                        status: req.status,
                        duration: req.duration
                    })),
                    errors: apiDebugSystem.errors.slice(-5).map(err => ({
                        endpoint: err.error.endpoint,
                        message: err.error.message,
                        timestamp: err.timestamp
                    }))
                },
                timestamp: new Date().toISOString()
            };

            res.json(createResponse(true, systemStats, null, {
                endpoint: '/system/stats'
            }));
        } catch (error) {
            res.status(500).json(createResponse(false, null, error.message));
        }
    });

// ==================== اندپوینت‌های داده خام (برای استفاده داخلی) ====================

    // داده خام تک کوین (فقط برای AI)
    router.get("/internal/raw/single/:symbol", async (req, res) => {
        const { symbol } = req.params;
        const { timeframe = "24h", limit = 500 } = req.query;
    
        // فقط برای استفاده داخلی - می‌تونی authentication اضافه کنی
        await handleApiRequest(
            apiClient.getCoinCharts(symbol, timeframe, true), // raw=true
            req, res, `/internal/raw/single/${symbol}`
        );
    });

    // داده خام چند کوین (فقط برای AI)
    router.get("/internal/raw/multi", async (req, res) => {
        const { symbols, period = '24h' } = req.query;
    
        if (!symbols) {
            return res.status(400).json(createResponse(false, null, 'symbols parameter is required'));
        }
     
        const coinIds = symbols.split(',').map(s => s.trim());
    
        await handleApiRequest(
            apiClient.getCoinsCharts(coinIds, period, true), // raw=true
            req, res, '/internal/raw/multi'
        );
    });

    // داده خام بازار (فقط برای AI)
    router.get("/internal/raw/market", async (req, res) => {
        await handleApiRequest(
            apiClient.getMarketCap(true), // raw=true
            req, res, '/internal/raw/market'
        );
    });

    module.exports = router;
