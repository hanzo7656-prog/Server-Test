const express = require('express');
const TechnicalAnalysisEngine = require('../models/TechnicalAnalysis');
const { HistoricalDataAPI } = require('../models/APIClients');
const constants = require('../config/constants');

const router = express.Router();

module.exports = ({ gistManager, wsManager, apiClient, exchangeAPI }) => {
    
    // اندپوینت اصلی اسکن
    router.get("/scan/vortexai", async (req, res) => {
        const startTime = Date.now();
        try {
            const limit = Math.min(parseInt(req.query.limit) || 100, 300);
            const filterType = req.query.filter || 'volume';
            console.log(Starting scan with limit: ${limit}, filter: ${filterType});

            const [apiData, realtimeData] = await Promise.all([
                apiClient.getCoins(limit),
                Promise.resolve(wsManager.getRealtimeData())
            ]);

            let coins = apiData.coins || [];
            console.log(API coins: ${coins.length}, Realtime: ${Object.keys(realtimeData || {}).length});

            if (coins.length === 0) {
                console.log('No API coins, using realtime data fallback');
                coins = Object.entries(realtimeData || {}).slice(0, limit).map(([symbol, data], index) => ({
                    id: 'coin_' + index,
                    name: 'Crypto' + index,
                    symbol: symbol.replace("_usdt","").toUpperCase(),
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
                    console.log(Error converting symbol ${coin.symbol}:, error);
                    return 'bitcoin';
                }
            });

            console.log(Fetching historical for ${allCoinIds.length} coins...);
            const historicalResponse = await historicalAPI.getMultipleCoinsHistorical(allCoinIds, '1y');
            const allHistoricalData = historicalResponse.data || [];
            console.log(Historical data received: ${allHistoricalData.length} records);

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
                const symbol = ${coin.symbol.toLowerCase()}_usdt;
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
            switch(filterType) {
                case 'volume':
                    filteredCoins.sort((a, b) => (b.volume  0) - (a.volume  0));
                    break;
                case 'momentum_1h':
                    filteredCoins.sort((a, b) => Math.abs(b.change_1h  0) - Math.abs(a.change_1h  0));
                    break;
                case 'momentum_4h':
                    filteredCoins.sort((a, b) => Math.abs(b.change_4h  0) - Math.abs(a.change_4h  0));
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
                    gist: Object.keys((gistData  {}).prices  {}).length
                },
                processing_time: responseTime + 'ms',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in scan endpoint:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });

    // API جدید: تبادل ارز
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

    // API جدید: تیکرهای صرافی

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

    // API جدید: قیمت متوسط
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

    // بقیه اندپوینت‌ها مانند فایل اصلی...
    router.get('/coin/:symbol/history/:timeframe', async (req, res) => {
        const { symbol, timeframe } = req.params;
        const validTimeframes = gistManager.getAvailableTimeframes();

        if (!validTimeframes.includes(timeframe)) {
            return res.status(400).json({
                success: false,
                error: Invalid timeframe. Valid timeframes: ${validTimeframes.join(', ')}
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
            console.error(History API error for ${symbol}:, error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

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
                { [symbol]: realtimeData },
                { prices: { [symbol]: historicalData } }
            );

res.json({
                success: true,
                symbol: symbol,
                current_price: realtimeData?.price || historicalData?.current_price,
                technical_indicators: indicators,
                support_resistance: supportResistance,
                vortexai_analysis: aiAnalysis,
                data_points: priceData.length,
                processing_time: ${Date.now() - startTime}ms,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error(Technical analysis error for ${symbol}:, error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

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
                            new Date(historicalResult.data[0].chart[historicalResult.data[0].chart.length-1][0] * 1000).toISOString() : null
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

    return router;
};
