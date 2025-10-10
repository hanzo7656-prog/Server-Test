const express = require('express');
const TechnicalAnalysisEngine = require('./models/TechnicalAnalysis');
const { HistoricalDataAPI } = require('./models/APIClients');
const constants = require('./config/constants');
const router = express.Router();

module.exports = ({ gistManager, wsManager, apiClient, exchangeAPI }) => {

    // اندپوینت اصلی اسکن
    router.get("/scan/vortexai", async (req, res) => {
        const startTime = Date.now();
        try {
            const limit = Math.min(parseInt(req.query.limit) || 100, 300);
            const filterType = req.query.filter || 'volume';
            console.log(`Starting scan with limit: ${limit}, filter: ${filterType}`);

            const [apiData, realtimeData] = await Promise.all([
                apiClient.getCoins(limit),
                Promise.resolve(wsManager.getRealtimeData())
            ]);

            let coins = apiData.coins || [];
            console.log(`API coins: ${coins.length}, Realtime: ${Object.keys(realtimeData || {}).length}`);

            if (coins.length === 0) {
                console.log('No API coins, using realtime data fallback');
                coins = Object.entries(realtimeData || {}).slice(0, limit).map(([symbol, data], index) => ({
                    id: 'coin_' + index,
                    name: 'Crypto' + index,
                    symbol: symbol.replace("_usdt", "").toUpperCase(),
                    price: data.price || 0,
                    priceChange1h: data.change || 0,
                    priceChange24h: data.change || 0,
                    volume: data.volume || 0,
                    marketCap: (data.price || 0) * 1000000,
                    rank: index + 1
                }));
            }

            const historicalAPI = new HistoricalDataAPI();
            const allCoinIds = coins.map(coin => {
                try {
                    const coinId = historicalAPI.symbolToCoinId(coin.symbol);
                    return coinId;
                } catch (error) {
                    console.log(`Error converting symbol ${coin.symbol}:`, error);
                    return 'bitcoin';
                }
            });

            console.log(`Fetching historical for ${allCoinIds.length} coins...`);
            const historicalResponse = await historicalAPI.getMultipleCoinsHistorical(allCoinIds, '1y');
            const allHistoricalData = historicalResponse.data || [];
            console.log(`Historical data received: ${allHistoricalData.length} records`);

            const historicalMap = {};
            allHistoricalData.forEach(coinData => {
                if (coinData && coinData.coinId) {
                    historicalMap[coinData.coinId] = coinData;
                }
            });

            const gistData = gistManager.getAllData();

            const enhancedCoins = coins.map((coin) => {
                const coinId = historicalAPI.symbolToCoinId(coin.symbol);
                const historicalData = historicalMap[coinId];
                const symbol = `${coin.symbol.toLowerCase()}_usdt`;
                const realtime = realtimeData[symbol];
                const gistHistorical = gistManager.getPriceData(symbol);
                const currentPrice = realtime?.price || coin.price;

                let historicalChanges = {};
                let dataSource = 'no_historical';

                if (historicalData) {
                    const changeResult = historicalAPI.calculatePriceChangesFromChart(historicalData, currentPrice);
                    historicalChanges = changeResult.changes;
                    dataSource = changeResult.source;
                }

                return {
                    ...coin,
                    change_1h: historicalChanges['1h'],
                    change_4h: historicalChanges['4h'],
                    change_24h: historicalChanges['24h'],
                    change_7d: historicalChanges['7d'],
                    change_30d: historicalChanges['30d'],
                    change_180d: historicalChanges['180d'],
                    historical_timestamp: gistHistorical?.timestamp,
                    realtime_price: realtime?.price,
                    realtime_volume: realtime?.volume,
                    realtime_change: realtime?.change,
                    data_source: dataSource,
                    VortexAI_analysis: {
                        signal_strength: TechnicalAnalysisEngine.calculateSignalStrength(coin),
                        trend: (historicalChanges['24h'] ?? coin.priceChange24h ?? 0) > 0 ? "up" : "down",
                        volatility_score: TechnicalAnalysisEngine.calculateVolatility(coin),
                        volume_anomaly: TechnicalAnalysisEngine.detectVolumeAnomaly(coin),
                        market_sentiment: (historicalChanges['1h'] ?? coin.priceChange1h ?? 0) > 0 &&
                            (historicalChanges['24h'] ?? coin.priceChange24h ?? 0) > 0 ? 'bullish' : 'bearish'
                    }
                };
            });

            let filteredCoins = [...enhancedCoins];
            switch (filterType) {
                case 'volume':
                    filteredCoins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
                    break;
                case 'momentum_1h':
                    filteredCoins.sort((a, b) => Math.abs(b.change_1h || 0) - Math.abs(a.change_1h || 0));
                    break;
                case 'momentum_4h':
                    filteredCoins.sort((a, b) => Math.abs(b.change_4h || 0) - Math.abs(a.change_4h || 0));
                    break;
                case 'ai_signal':
                    filteredCoins.sort((a, b) => (b.VortexAI_analysis?.signal_strength || 0) -
                        (a.VortexAI_analysis?.signal_strength || 0));
                    break;
            }

            const responseTime = Date.now() - startTime;
            res.json({
                success: true,
                coins: filteredCoins.slice(0, limit),
                total_coins: filteredCoins.length,
                scan_mode: 'vortexai_enhanced_with_historical',
                filter_applied: filterType,
                data_sources: {
                    api: coins.length,
                    realtime: Object.keys(realtimeData || {}).length,
                    historical_api: Object.keys(historicalMap || {}).length,
                    gist: Object.keys((gistData || {}).prices || {}).length
                },
                processing_time: responseTime + 'ms',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in scan endpoint.', error);
            res.status(500).json({
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });

    // API قیمت ارز جدید
    router.get("/exchange/price", async (req, res) => {
        try {
            const { exchange = 'Binance', from = 'BTC', to = 'ETH', timestamp = Math.floor(Date.now() / 1000) } = req.query;
            const data = await exchangeAPI.getExchangePrice(exchange, from, to, timestamp);
            res.json({
                success: true,
                exchange,
                from,
                to,
                timestamp,
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // API تیکر صرافی جدید
    router.get("/tickers/:exchange", async (req, res) => {
        try {
            const { exchange } = req.params;
            const data = await exchangeAPI.getTickers(exchange);
            res.json({
                success: true,
                exchange,
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // API قیمت متوسط جدید
    router.get("/price/avg", async (req, res) => {
        try {
            const { coinId = 'bitcoin', timestamp = Math.floor(Date.now() / 1000) } = req.query;
            const data = await exchangeAPI.getAveragePrice(coinId, timestamp);
            res.json({
                success: true,
                coinId,
                timestamp,
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // دریافت داده‌های تاریخی بر اساس timeframe
    router.get('/coin/:symbol/history/:timeframe', async (req, res) => {
        const { symbol, timeframe } = req.params;
        const validTimeframes = gistManager.getAvailableTimeframes();

        if (!validTimeframes.includes(timeframe)) {
            return res.status(400).json({
                success: false,
                error: `Invalid timeframe. Valid timeframes: ${validTimeframes.join(', ')}`
            });
        }

        try {
            const historicalData = gistManager.getPriceData(symbol, timeframe);
            const realtimeData = wsManager.getRealtimeData()[symbol];

            if (!historicalData && !realtimeData) {
                return res.status(404).json({
                    success: false,
                    error: 'No data available for this symbol'
                });
            }

            res.json({
                success: true,
                symbol,
                timeframe,
                current_price: realtimeData?.price || historicalData?.current_price,
                history: historicalData?.history || [],
                data_points: historicalData?.history?.length || 0,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error(`History API error for ${symbol}:`, error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // تحلیل تکنیکال پیشرفته برای یک ارز
    router.get('/coin/:symbol/technical', async (req, res) => {
        const startTime = Date.now();
        const symbol = req.params.symbol;

        try {
            const historicalData = gistManager.getPriceData(symbol, "24h");
            const realtimeData = wsManager.getRealtimeData()[symbol];

            if (!historicalData && !realtimeData) {
                return res.status(404).json({
                    success: false,
                    error: 'No data available for this symbol'
                });
            }

            const priceData = historicalData?.history?.map(item => ({
                price: item.price,
                timestamp: item.timestamp,
                high: item.price * 1.02,
                low: item.price * 0.98
            })) || [];

            if (realtimeData) {
                priceData.push({
                    price: realtimeData.price,
                    timestamp: Date.now(),
                    high: realtimeData.high_24h,
                    low: realtimeData.low_24h
                });
            }

            const indicators = TechnicalAnalysisEngine.calculateAllIndicators(priceData);
            const supportResistance = TechnicalAnalysisEngine.calculateSupportResistance(priceData);
            const aiAnalysis = TechnicalAnalysisEngine.analyzeWithAI(
                { [symbol]: realtimeData }, { prices: { [symbol]: historicalData } }
            );

            res.json({
                success: true,
                symbol: symbol,
                current_price: realtimeData?.price || historicalData?.current_price,
                technical_indicators: indicators,
                support_resistance: supportResistance,
                vortexai_analysis: aiAnalysis,
                data_points: priceData.length,
                processing_time: `${Date.now() - startTime}ms`,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error(`Technical analysis error for ${symbol}:`, error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // دریافت لیست available data timeframes
    router.get('/timeframes', (req, res) => {
        res.json({
            success: true,
            timeframes: gistManager.getAvailableTimeframes(),
            description: {
                "1h": "1 hour history - 1 minute intervals",
                "4h": "4 hours history - 5 minute intervals",
                "24h": "24 hours history - 15 minute intervals",
                "7d": "7 days history - 1 hour intervals",
                "30d": "30 days history - 4 hour intervals",
                "180d": "180 days history - 1 day intervals"
            }
        });
    });

    // سلامت سیستم ترکیبی
    router.get('/health-combined', (req, res) => {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();

        res.json({
            status: 'healthy',
            service: 'VortexAI Combined Crypto Scanner',
            version: '5.0 - 6 Layer System',
            timestamp: new Date().toISOString(),
            websocket_status: {
                connected: wsStatus.connected,
                active_coins: wsStatus.active_coins,
                total_subscribed: wsStatus.total_subscribed,
                provider: "LBank"
            },
            gist_status: {
                active: !!process.env.GITHUB_TOKEN,
                total_coins: Object.keys(gistData.prices || {}).length,
                last_updated: gistData.last_updated,
                timeframes_available: gistManager.getAvailableTimeframes()
            },
            ai_status: {
                technical_analysis: 'active',
                vortexai_engine: 'ready',
                indicators_available: 15
            },
            api_status: {
                requests_count: apiClient.request_count,
                coinstats_connected: 'active'
            },
            features: [
                'realtime_websocket_data',
                '6_layer_historical_data',
                'vortexai_analysis',
                'technical_indicators',
                'multi_source_data',
                'advanced_filtering',
                'market_predictions',
                'multi_timeframe_support'
            ]
        });
    });

    // اضافه کردن این endpoint برای تشخیص دقیق مشکل
    router.get("/debug/api-status", async (req, res) => {
        try {
            const testCoinIds = ['bitcoin', 'ethereum', 'solana'];
            const historicalAPI = new HistoricalDataAPI();
            console.log("\n== API STATUS DEBUG ==");

            const apiResult = await apiClient.getCoins(10);
            const historicalResult = await historicalAPI.getMultipleCoinsHistorical(testCoinIds, '24h');

            res.json({
                success: true,
                main_api: {
                    status: apiResult.coins.length > 0 ? 'working' : 'failing',
                    coins_received: apiResult.coins.length,
                    error: apiResult.error
                },
                historical_api: {
                    status: historicalResult.data.length > 0 ? 'working' : 'failing',
                    coins_received: historicalResult.data.length,
                    source: historicalResult.source,
                    error: historicalResult.error,
                    sample: historicalResult.data.length > 0 ? {
                        coinId: historicalResult.data[0].coinId,
                        data_points: historicalResult.data[0].chart?.length,
                        latest_point: historicalResult.data[0].chart ?
                            new Date(historicalResult.data[0].chart[historicalResult.data[0].chart.length - 1][0] * 1000).toISOString() : null
                    } : null
                },
                environment: {
                    node_version: process.version,
                    platform: process.platform,
                    uptime: process.uptime()
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // سلامت سرور (Health Checks)
    // (Liveness Probe) بررسی سلامت پایه
    router.get('/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'VortexAI Crypto Scanner'
        });
    });

    // (Readiness Probe) بررسی سلامت کامل با وضعیت سرویس ها
    router.get('/health/ready', (req, res) => {
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

        // بررسی سلامت کلی همه سرویس ها
        const allHealthy = wsStatus.connected && process.env.GITHUB_TOKEN;
        const statusCode = allHealthy ? 200 : 503;
        res.status(statusCode).json(healthStatus);
    });

    // بررسی سلامت سرویس‌های حیاتی برای کوبرنتیز
    router.get("/health/live", (req, res) => {
        const wsStatus = wsManager.getConnectionStatus();

        // اگر WebSocket قطع باشد، سرور زنده نیست
        if (!wsStatus.connected) {
            return res.status(503).json({
                status: 'Unhealthy',
                message: 'WebSocket connection lost',
                timestamp: new Date().toISOString()
            });
        }

        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString()
        });
    });

    // فیلترهای سلامت پیشرفته
    router.get("/health/filters", async (req, res) => {
        try {
            const wsStatus = wsManager.getConnectionStatus();
            const gistData = gistManager.getAllData();

            const healthFilters = {
                websocket_quality: wsStatus.connected ? 'excellent' : 'poor',
                data_freshness: calculateDataFreshness(gistData),
                api_performance: calculateAPIPerformance(),
                storage_health: calculateStorageHealth(gistData),
                overall_score: calculateOverallHealth(wsStatus, gistData)
            };

            res.json({
                success: true,
                health_filters: healthFilters,
                recommendations: generateHealthRecommendations(healthFilters),
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // متدهای کمکی برای فیلترهای سلامت
    function calculateDataFreshness(gistData) {
        const lastUpdated = new Date(gistData.last_updated);
        const now = new Date();
        const diffMinutes = (now - lastUpdated) / (1000 * 60);

        if (diffMinutes < 5) return 'excellent';
        if (diffMinutes < 15) return 'good';
        if (diffMinutes < 30) return 'fair';
        return 'poor';
    }

    function calculateAPIPerformance() {
        const successRate = (apiClient.request_count - (apiClient.error_count || 0)) / apiClient.request_count;
        return successRate > 0.95 ? 'excellent' :
            successRate > 0.85 ? 'good' :
                successRate > 0.70 ? 'fair' : 'poor';
    }

    function calculateStorageHealth(gistData) {
        const storedCoins = Object.keys(gistData.prices || {}).length;
        const expectedCoins = constants.ALL_TRADING_PAIRS.length;
        const coverage = storedCoins / expectedCoins;

        return coverage > 0.9 ? 'excellent' :
            coverage > 0.7 ? 'good' :
                coverage > 0.5 ? 'fair' : 'poor';
    }

    function calculateOverallHealth(wsStatus, gistData) {
        const scores = {
            websocket: wsStatus.connected ? 100 : 0,
            data_freshness: calculateDataFreshnessScore(gistData),
            api_performance: calculateAPIPerformanceScore(),
            storage: calculateStorageScore(gistData)
        };

        const totalScore = (scores.websocket + scores.data_freshness + scores.api_performance + scores.storage) / 4;
        return {
            score: Math.round(totalScore),
            breakdown: scores,
            status: totalScore > 80 ? 'healthy' : totalScore > 60 ? 'degraded' : 'unhealthy'
        };
    }

    function calculateDataFreshnessScore(gistData) {
        const freshness = calculateDataFreshness(gistData);
        const scores = { 'excellent': 100, 'good': 80, 'fair': 60, 'poor': 30 };
        return scores[freshness] || 0;
    }

    function calculateAPIPerformanceScore() {
        const performance = calculateAPIPerformance();
        const scores = { 'excellent': 100, 'good': 80, 'fair': 60, 'poor': 30 };
        return scores[performance] || 0;
    }

    function calculateStorageScore(gistData) {
        const storage = calculateStorageHealth(gistData);
        const scores = { 'excellent': 100, 'good': 80, 'fair': 60, 'poor': 30 };
        return scores[storage] || 0;
    }

    function generateHealthRecommendations(healthFilters) {
        const recommendations = [];

        if (healthFilters.websocket_quality === 'poor') {
            recommendations.push("WebSocket connection lost - Check network connectivity");
        }

        if (healthFilters.data_freshness === 'poor') {
            recommendations.push("Data is stale - Check Gist synchronization");
        }

        if (healthFilters.api_performance === 'poor') {
            recommendations.push("API performance degraded - Check rate limits");
        }

        if (healthFilters.storage_health === 'poor') {
            recommendations.push("Storage coverage low - Check historical data collection");
        }

        return recommendations.length > 0 ? recommendations : ["All systems operating normally"];
    }

    return router;
};
