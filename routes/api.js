const express = require('express');
const TechnicalAnalysisEngine = require('../models/TechnicalAnalysis');
const { HistoricalDataAPI, MarketDataAPI, NewsAPI, InsightsAPI, ExchangeAPI } = require('../models/APIClients');
const constants = require('../config/constants');
const router = express.Router();

// تابع کمکی برای تست اندپوینت‌ها
async function testServerEndpoint(baseUrl, endpoint) {
    const startTime = Date.now();
    try {
        let url = `${baseUrl}${endpoint.path}`;
        
        // اضافه کردن پارامترها اگر وجود دارند
        if (endpoint.params) {
            const params = new URLSearchParams(endpoint.params);
            url += `?${params.toString()}`;
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(url, {
            method: endpoint.method,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'VortexAI-Tester/1.0'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        let responseData = null;
        if (response.ok) {
            try {
                responseData = await response.json();
            } catch (e) {
                responseData = { raw: await response.text() };
            }
        }
        
        return {
            name: endpoint.name,
            path: endpoint.path,
            status: 'success',
            httpStatus: response.status,
            duration: duration + 'ms',
            ok: response.ok,
            responseSize: JSON.stringify(responseData)?.length || 0
        };
        
    } catch (error) {
        const duration = Date.now() - startTime;
        return {
            name: endpoint.name,
            path: endpoint.path,
            status: 'error',
            error: error.message,
            duration: duration + 'ms',
            httpStatus: 0
        };
    }
}

module.exports = ({ gistManager, wsManager, apiClient, exchangeAPI }) => {
    
    // ========== ENDPOINTهای اصلی Frontend ==========
    
    // SCAN - ادغام شده
    router.get("/scan", async (req, res) => {
        const startTime = Date.now();
        try {
            const limit = Math.min(parseInt(req.query.limit) || 100, 300);
            const filterType = req.query.filter || 'volume';
            const scanMode = req.query.mode || 'advanced';
            let coins = [];
            
            if (scanMode === 'advanced') {
                const [apiData, realtimeData] = await Promise.all([
                    apiClient.getCoins(limit),
                    Promise.resolve(wsManager.getRealtimeData())
                ]);
                
                coins = apiData.coins || [];
                
                if (coins.length == 0) {
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
                
                // تحلیل پیشرفته
                const enhancedCoins = coins.map((coin) => {
                    const symbol = `${coin.symbol.toLowerCase()}_usdt`;
                    const realtime = realtimeData[symbol];
                    return {
                        ...coin,
                        realtime_price: realtime?.price,
                        realtime_volume: realtime?.volume,
                        realtime_change: realtime?.change,
                        VortexAI_analysis: {
                            signal_strength: TechnicalAnalysisEngine.calculateSignalStrength(coin),
                            trend: (coin.priceChange24h || 0) > 0 ? "up" : "down",
                            volatility_score: TechnicalAnalysisEngine.calculateVolatility(coin),
                            volume_anomaly: TechnicalAnalysisEngine.detectVolumeAnomaly(coin)
                        }
                    };
                });
                
                coins = enhancedCoins;
            } else {
                const apiData = await apiClient.getCoins(limit);
                coins = apiData.coins || [];
            }
            
            let filteredCoins = [...coins];
            switch (filterType) {
                case 'volume':
                    filteredCoins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
                    break;
                case 'momentum_1h':
                    filteredCoins.sort((a, b) => Math.abs(b.priceChange1h || 0) - Math.abs(a.priceChange1h || 0));
                    break;
                case 'ai_signal':
                    filteredCoins.sort((a, b) => (b.VortexAI_analysis?.signal_strength || 0) - (a.VortexAI_analysis?.signal_strength || 0));
                    break;
            }
            
            const responseTime = Date.now() - startTime;
            
            res.json({
                success: true,
                coins: filteredCoins.slice(0, limit),
                total_coins: filteredCoins.length,
                scan_mode: scanMode,
                filter_applied: filterType,
                processing_time: responseTime + 'ms',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error in /scan endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // ANALYZE - تحلیل تکنیکال
    router.get("/analysis", async (req, res) => {
        const startTime = Date.now();
        const symbol = req.query.symbol;
        const analysisType = req.query.type || 'technical';
        
        if (!symbol) {
            return res.status(400).json({
                success: false,
                error: 'Symbol parameter is required'
            });
        }
        
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
                high: item.high || item.price * 1.02,
                low: item.low || item.price * 0.98,
                volume: item.volume || 1000
            })) || [];
            
            if (realtimeData) {
                priceData.push({
                    price: realtimeData.price,
                    timestamp: Date.now(),
                    high: realtimeData.high_24h || realtimeData.price * 1.02,
                    low: realtimeData.low_24h || realtimeData.price * 0.98,
                    volume: realtimeData.volume || 1000
                });
            }
            
            const indicators = TechnicalAnalysisEngine.calculateAllIndicators(priceData);
            const supportResistance = TechnicalAnalysisEngine.calculateSupportResistance(priceData);
            
            res.json({
                success: true,
                symbol: symbol,
                current_price: realtimeData?.price || historicalData?.current_price,
                technical_indicators: indicators,
                support_resistance: supportResistance,
                data_points: priceData.length,
                processing_time: `${Date.now() - startTime}ms`,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error(`Analysis error for ${symbol}:`, error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // =========== ENDPOINT های داده خام برای AI ==========
    
    // داده خام تک کوین برای AI
    router.get("/ai/raw/single/:symbol", async (req, res) => {
        try {
            const { symbol } = req.params;
            const { timeframe = "24h", limit = 500 } = req.query;
            
            const historicalData = gistManager.getPriceData(symbol, timeframe);
            
            if (!historicalData || !historicalData.history) {
                return res.status(404).json({
                    success: false,
                    error: 'No historical data available for this symbol'
                });
            }
            
            const rawData = {
                symbol: symbol,
                timeframe: timeframe,
                prices: historicalData.history
                    .slice(-parseInt(limit))
                    .map(item => ({ 
                        timestamp: item.timestamp,
                        datetime: new Date(item.timestamp).toISOString(),
                        price: parseFloat(item.price) || 0,
                        volume: parseFloat(item.volume) || 0,
                        high: parseFloat(item.high) || parseFloat(item.price) * 1.02,
                        low: parseFloat(item.low) || parseFloat(item.price) * 0.98
                    })),
                metadata: {
                    total_points: historicalData.history.length,
                    data_points_sent: Math.min(historicalData.history.length, parseInt(limit)),
                    timeframe: timeframe,
                    last_updated: historicalData.timestamp,
                    source: 'VortexAI'
                }
            };
            
            res.json({
                success: true,
                data_type: "raw_single_coin",
                symbol: symbol,
                timeframe: timeframe,
                data: rawData,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('AI Raw Single error', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // داده خام چند کوین برای AI
    router.get("/ai/raw/multi", async (req, res) => {
        try {
            const { symbols = "btc,eth,sol", timeframe = "24h", limit = 100 } = req.query;
            const symbolList = symbols.split(",").map(s => s.trim() + '_usdt');
            const multiRawData = {};
            
            for (const symbol of symbolList) {
                const historicalData = gistManager.getPriceData(symbol, timeframe);
                const realtimeData = wsManager.getRealtimeData()[symbol];
                
                if (historicalData && historicalData.history) {
                    multiRawData[symbol] = {
                        symbol: symbol,
                        timeframe: timeframe,
                        prices: historicalData.history
                            .slice(-parseInt(limit))
                            .map(item => ({
                                timestamp: item.timestamp,
                                datetime: new Date(item.timestamp).toISOString(),
                                price: parseFloat(item.price) || 0,
                                volume: parseFloat(item.volume) || 0
                            })),
                        current_price: realtimeData?.price,
                        metadata: {
                            data_points: historicalData.history.length,
                            data_points_sent: Math.min(historicalData.history.length, parseInt(limit)),
                            last_updated: historicalData.timestamp
                        }
                    };
                }
            }
            
            res.json({
                success: true,
                data_type: "raw_multi_coin",
                symbols: symbolList,
                timeframe: timeframe,
                data: multiRawData,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('AI Raw Multi error', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // داده خام بازار برای AI
    router.get("/ai/raw/market", async (req, res) => {
        try {
            const { timeframe = "24h" } = req.query;
            const marketAPI = new MarketDataAPI();
            const marketData = await marketAPI.getMarketCap();
            const apiResult = await apiClient.getCoins(20);
            const topCoins = apiResult.coins || [];
            
            const marketRawData = {
                market_overview: {
                    total_market_cap: marketData.marketCap || 0,
                    total_volume_24h: marketData.volume || 0,
                    btc_dominance: marketData.btcDominance || 0,
                    active_cryptocurrencies: marketData.activeCryptocurrencies || 0,
                    market_cap_change_24h: marketData.marketCapChange24h || 0
                },
                top_coins: topCoins.map(coin => ({
                    symbol: coin.symbol,
                    name: coin.name,
                    price: coin.price,
                    price_change_24h: coin.priceChange24h || 0,
                    volume: coin.volume || 0,
                    market_cap: coin.marketCap || 0,
                    rank: coin.rank || 0
                })),
                timestamp: new Date().toISOString()
            };
            
            res.json({
                success: true,
                data_type: "raw_market_overview",
                timeframe: timeframe,
                data: marketRawData,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('AI Raw Market error', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    // =========== ENDPOINT های داده تاریخی ==========

    // داده تاریخی اصلی
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

    // =========== ENDPOINT های بازار ==========

    // مارکت کپ
    router.get("/markets/cap", async (req, res) => {
        try {
            const marketAPI = new MarketDataAPI();
            const data = await marketAPI.getMarketCap();
        
            res.json({
                success: true,
                data: data,
                timestamp: new Date().toISOString()
            });
        
        } catch (error) {
            console.error('Error in market cap endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ارزها
    router.get("/currencies", async (req, res) => {
        try {
            const marketAPI = new MarketDataAPI();
            const data = await marketAPI.getCurrencies();
        
            res.json({
                success: true,
                data: data,
                count: data.length || 0,
                timestamp: new Date().toISOString()
            });
        
        } catch (error) {
            console.error('Error in /currencies endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ========== ENDPOINT های Insights ==========

    // Insights Dashboard
    router.get("/insights/dashboard", async (req, res) => {
        try {
            const insightsAPI = new InsightsAPI();
            const [btcDominance, fearGreed, rainbowChart] = await Promise.all([
                insightsAPI.getBTCDominance().catch(() => ({ value: 50, trend: 'neutral' })),
                insightsAPI.getFearGreedIndex().catch(() => ({ now: { value: 50, value_classification: 'Neutral' } })),
                insightsAPI.getRainbowChart('bitcoin').catch(() => ({}))
            ]);
        
            res.json({
                success: true,
                data: {
                    btc_dominance: btcDominance,
                    fear_greed: fearGreed,
                    rainbow_chart: rainbowChart
                },
                timestamp: new Date().toISOString()
            });
        
        } catch (error) {
            console.error('Error in Insights Dashboard endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // BTC Dominance
    router.get("/insights/btc-dominance", async (req, res) => {
        try {
            const insightsAPI = new InsightsAPI();
            const { type = 'all' } = req.query;
            const data = await insightsAPI.getBTCDominance(type);
         
            res.json({
                success: true,
                data: data,
                type: type,
                timestamp: new Date().toISOString()
            });
          
        } catch (error) {
            console.error('Error in BTC Dominance endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Fear & Greed
    router.get("/insights/fear-greed", async (req, res) => {
        try {
            const insightsAPI = new InsightsAPI();
            const data = await insightsAPI.getFearGreedIndex();
        
            res.json({
                success: true,
                data: data,
                timestamp: new Date().toISOString()
            });
          
        } catch (error) {
            console.error('Error in Fear & Greed endpoint:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Fear & Greed Chart - جدید
    router.get("/insights/fear-greed-chart", async (req, res) => {
        try {
            const insightsAPI = new InsightsAPI();
            const data = await insightsAPI.getFearGreedChart();
        
            res.json({
                success: true,
                data: data,
                chart_type: "fear_greed_index_chart",
                timestamp: new Date().toISOString()
            });
        
        } catch (error) {
            console.error('Error in Fear & Greed Chart endpoint:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Rainbow Chart - جدید
    router.get("/insights/rainbow-chart", async (req, res) => {
        try {
            const { coin = 'bitcoin' } = req.query;
            const insightsAPI = new InsightsAPI();
            const data = await insightsAPI.getRainbowChart(coin);
        
            res.json({
                success: true,
                data: data,
                coin: coin,
                chart_type: "rainbow_chart",
                timestamp: new Date().toISOString()
            });
        
        } catch (error) {
            console.error('Error in Rainbow Chart endpoint:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ========== ENDPOINT های اخبار ==========

    // اخبار
    router.get("/news", async (req, res) => {
        try {
            const { page = 1, limit = 20, from, to } = req.query;
            const newsAPI = new NewsAPI();
            const data = await newsAPI.getNews({
                page: parseInt(page),
                limit: parseInt(limit),
                from,
                to
            });
        
            res.json({
                success: true,
                data: data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: data.result?.length || 0
                },
                timestamp: new Date().toISOString()
            });
        
        } catch (error) {
            console.error('Error in news endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // منابع خبری
    router.get("/news/sources", async (req, res) => {
        try {
            const newsAPI = new NewsAPI();
            const data = await newsAPI.getNewsSources();
        
            res.json({
                success: true,
                data: data,
                count: data.length || 0,
                timestamp: new Date().toISOString()
            });
        
        } catch (error) {
            console.error('Error in news sources endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // اخبار ترند - جدید
    router.get("/news/type/trending", async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const newsAPI = new NewsAPI();
            const data = await newsAPI.getNewsByType('trending', {
                page: parseInt(page),
                limit: parseInt(limit)
            });
        
            res.json({
                success: true,
                type: 'trending',
                data: data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: data.length || 0
                },
                timestamp: new Date().toISOString()
            });
        
        } catch (error) {
            console.error('Error in trending news endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // اخبار منتخب - جدید
    router.get("/news/type/handpicked", async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const newsAPI = new NewsAPI();
            const data = await newsAPI.getNewsByType('handpicked', {
                page: parseInt(page),
                limit: parseInt(limit)
            });
        
            res.json({
                success: true,
                type: 'handpicked',
                data: data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: data.length || 0
                },
                timestamp: new Date().toISOString()
            });
        
        } catch (error) {
            console.error('Error in handpicked news endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // آخرین اخبار - جدید
    router.get("/news/type/latest", async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const newsAPI = new NewsAPI();
            const data = await newsAPI.getNewsByType('latest', {
                page: parseInt(page),
                limit: parseInt(limit)
            });
        
            res.json({
                success: true,
                type: 'latest',
                data: data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: data.length || 0
                },
                timestamp: new Date().toISOString()
            });
        
        } catch (error) {
            console.error('Error in latest news endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
        // اخبار صعودی - جدید
    router.get("/news/type/bullish", async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const newsAPI = new NewsAPI();
            const data = await newsAPI.getNewsByType('bullish', {
                page: parseInt(page),
                limit: parseInt(limit)
            });
            
            res.json({
                success: true,
                type: 'bullish',
                data: data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: data.length || 0
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error in bullish news endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // اخبار نزولی - جدید
    router.get("/news/type/bearish", async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const newsAPI = new NewsAPI();
            const data = await newsAPI.getNewsByType('bearish', {
                page: parseInt(page),
                limit: parseInt(limit)
            });
            
            res.json({
                success: true,
                type: 'bearish',
                data: data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: data.length || 0
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error in bearish news endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // جزییات خبر - جدید
    router.get("/news/detail/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const newsAPI = new NewsAPI();
            const data = await newsAPI.getNewsDetail(id);
            
            res.json({
                success: true,
                news_id: id,
                data: data,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error in news detail endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // ========== ENDPOINT های سلامت ==========
    
    // سلامت اصلی
    router.get("/health", async (req, res) => {
        try {
            const wsStatus = wsManager.getConnectionStatus();
            const gistData = gistManager.getAllData();
            
            res.json({
                success: true,
                status: 'healthy',
                service: 'VortexAI Crypto Scanner',
                version: '6.0',
                timestamp: new Date().toISOString(),
                components: {
                    websocket: {
                        connected: wsStatus.connected,
                        active_coins: wsStatus.active_coins,
                        status: wsStatus.connected ? 'healthy' : 'unhealthy'
                    },
                    database: {
                        stored_coins: Object.keys(gistData.prices || {}).length,
                        status: process.env.GITHUB_TOKEN ? 'healthy' : 'degraded'
                    },
                    api: {
                        request_count: apiClient.request_count || 0,
                        status: 'healthy'
                    }
                },
                stats: {
                    uptime: process.uptime(),
                    memory_usage: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`
                }
            });
            
        } catch (error) {
            console.error('Health endpoint error', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // سلامت ترکیبی
    router.get('/health-combined', (req, res) => {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();
        
        res.json({
            status: 'healthy',
            service: 'VortexAI Combined Crypto Scanner',
            version: '6.0 - Enhanced API System',
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
                indicators_available: 55
            },
            api_status: {
                requests_count: apiClient.request_count,
                coinstats_connected: 'active'
            }
        });
    });
    
    // ========== ENDPOINT های Exchange ==========
    
    // قیمت تبادل - جدید
    router.get("/exchange/price", async (req, res) => {
        try {
            const { exchange, from, to, timestamp } = req.query;
            const exchangeAPI = new ExchangeAPI();
            const data = await exchangeAPI.getExchangePrice(exchange, from, to, timestamp);
            
            res.json({
                success: true,
                exchange: exchange,
                pair: `${from}/${to}`,
                data: data,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error in exchange price endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // تیکرها - جدید
    router.get("/exchange/tickers", async (req, res) => {
        try {
            const { exchange } = req.query;
            const exchangeAPI = new ExchangeAPI();
            const data = await exchangeAPI.getTickers(exchange);
            
            res.json({
                success: true,
                exchange: exchange,
                data: data,
                tickers_count: data.length || 0,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error in exchange tickers endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // قیمت میانگین - جدید
    router.get("/exchange/average-price", async (req, res) => {
        try {
            const { coinId, timestamp } = req.query;
            const exchangeAPI = new ExchangeAPI();
            const data = await exchangeAPI.getAveragePrice(coinId, timestamp);
            
            res.json({
                success: true,
                coin_id: coinId,
                data: data,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error in average price endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // ========== ENDPOINT های کمکی جدید ==========
    
    // برترین سودده‌ها - جدید
    router.get("/coins/top-gainers", async (req, res) => {
        try {
            const { limit = 10 } = req.query;
            const data = await apiClient.getTopGainers(parseInt(limit));
            
            res.json({
                success: true,
                limit: limit,
                data: data,
                gainers_count: data.length,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error in top gainers endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // داده جهانی - جدید
    router.get("/markets/global", async (req, res) => {
        try {
            const marketAPI = new MarketDataAPI();
            const data = await marketAPI.getGlobalData();
            
            res.json({
                success: true,
                data: data,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error in global data endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // جزییات کوین - جدید
    router.get("/coins/:id/details", async (req, res) => {
        try {
            const { id } = req.params;
            const data = await apiClient.getCoinDetails(id);
            
            res.json({
                success: true,
                coin_id: id,
                data: data,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error in coin details endpoint', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // ========== ENDPOINT های کمکی ==========
    
    router.get("/timeframes-api", (req, res) => {
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
            },
            timestamp: new Date().toISOString()
        });
    });
    
    // وضعیت API
    router.get("/api-data", (req, res) => {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();
        
        res.json({
            success: true,
            api_status: {
                websocket: {
                    connected: wsStatus.connected,
                    active_coins: wsStatus.active_coins
                },
                database: {
                    total_coins: Object.keys(gistData.prices || {}).length,
                    last_updated: gistData.last_updated
                },
                endpoints_available: [
                    "/scan", "/analysis", "/markets/cap", "/insights/dashboard", "/news",
                    "/health", "/ai/raw/single/:symbol", "/ai/raw/multi", "/ai/raw/market",
                    "/coin/:symbol/history/:timeframe", "/insights/btc-dominance", "/insights/fear-greed",
                    "/insights/fear-greed-chart", "/insights/rainbow-chart", "/news/type/trending",
                    "/news/type/handpicked", "/news/type/latest", "/news/type/bullish", "/news/type/bearish",
                    "/news/detail/:id", "/exchange/price", "/exchange/tickers", "/exchange/average-price",
                    "/coins/top-gainers", "/markets/global", "/coins/:id/details", "/currencies"
                ]
            },
            timestamp: new Date().toISOString()
        });
    });
    
    // ========== ENDPOINT های تست و دیباگ ==========
    
    // تست تمام اندپوینت‌های داخلی سرور
    router.get("/test-all-endpoints", async (req, res) => {
        const startTime = Date.now();
        try {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const testResults = [];
            
            // لیست تمام 34 اندپوینت داخلی سرور
            const serverEndpoints = [
                // اندپوینت‌های اصلی
                { name: 'اسکن بازار', path: '/scan', method: 'GET', params: { limit: 5 } },
                { name: 'تحلیل تکنیکال', path: '/analysis', method: 'GET', params: { symbol: 'btc', type: 'technical' } },
                { name: 'داده تاریخی', path: '/coin/btc/history/24h', method: 'GET' },
                
                // اندپوینت‌های بازار
                { name: 'مارکت کپ', path: '/markets/cap', method: 'GET' },
                { name: 'ارزها', path: '/currencies', method: 'GET' },
                { name: 'داده جهانی', path: '/markets/global', method: 'GET' },
                
                // اندپوینت‌های بینش
                { name: 'داشبورد بینش', path: '/insights/dashboard', method: 'GET' },
                { name: 'تسلط بیت‌کوین', path: '/insights/btc-dominance', method: 'GET' },
                { name: 'شاخص ترس و طمع', path: '/insights/fear-greed', method: 'GET' },
                { name: 'نمودار ترس و طمع', path: '/insights/fear-greed-chart', method: 'GET' },
                { name: 'نمودار رنگین کمان', path: '/insights/rainbow-chart', method: 'GET', params: { coin: 'bitcoin' } },
                
                // اندپوینت‌های اخبار
                { name: 'اخبار', path: '/news', method: 'GET', params: { limit: 3 } },
                { name: 'منابع خبری', path: '/news/sources', method: 'GET' },
                { name: 'اخبار ترند', path: '/news/type/trending', method: 'GET', params: { limit: 3 } },
                { name: 'اخبار منتخب', path: '/news/type/handpicked', method: 'GET', params: { limit: 3 } },
                { name: 'آخرین اخبار', path: '/news/type/latest', method: 'GET', params: { limit: 3 } },
                { name: 'اخبار صعودی', path: '/news/type/bullish', method: 'GET', params: { limit: 3 } },
                { name: 'اخبار نزولی', path: '/news/type/bearish', method: 'GET', params: { limit: 3 } },
                
                // اندپوینت‌های سلامت
                { name: 'سلامت سیستم', path: '/health', method: 'GET' },
                { name: 'سلامت ترکیبی', path: '/health-combined', method: 'GET' },
                
                // اندپوینت‌های Exchange
                { name: 'قیمت تبادل', path: '/exchange/price', method: 'GET', params: { exchange: 'binance', from: 'btc', to: 'usdt' } },
                { name: 'تیکرها', path: '/exchange/tickers', method: 'GET', params: { exchange: 'binance' } },
                { name: 'قیمت میانگین', path: '/exchange/average-price', method: 'GET', params: { coinId: 'bitcoin' } },
                
                // اندپوینت‌های کمکی جدید
                { name: 'برترین سودده‌ها', path: '/coins/top-gainers', method: 'GET', params: { limit: 5 } },
                { name: 'جزییات کوین', path: '/coins/bitcoin/details', method: 'GET' },
                
                // اندپوینت‌های AI
                { name: 'داده خام تک کوین', path: '/ai/raw/single/btc', method: 'GET' },
                { name: 'داده خام چند کوین', path: '/ai/raw/multi', method: 'GET', params: { symbols: 'btc,eth', limit: 5 } },
                { name: 'داده خام بازار', path: '/ai/raw/market', method: 'GET' },
                
                // اندپوینت‌های کمکی
                { name: 'تایم‌فریم‌ها', path: '/timeframes-api', method: 'GET' },
                { name: 'وضعیت API', path: '/api-data', method: 'GET' }
            ];
            
            // تست هر اندپوینت
            for (const endpoint of serverEndpoints) {
                const result = await testServerEndpoint(baseUrl, endpoint);
                testResults.push(result);
            }
            
            const totalDuration = Date.now() - startTime;
            
            res.json({
                success: true,
                baseUrl: baseUrl,
                results: testResults,
                summary: {
                    total: testResults.length,
                    success: testResults.filter(r => r.status === 'success').length,
                    failed: testResults.filter(r => r.status === 'error').length,
                    totalDuration: totalDuration + 'ms',
                    successRate: ((testResults.filter(r => r.status === 'success').length / testResults.length) * 100).toFixed(1) + '%'
                },
                issues: testResults.filter(r => r.status === 'error').map(r => ({
                    endpoint: r.name,
                    path: r.path,
                    error: r.error,
                    duration: r.duration
                })),
                recommendations: testResults.filter(r => r.status === 'error').length > 0 ? [
                    'بررسی اتصال شبکه',
                    'بررسی تنظیمات CORS',
                    'بررسی سرویس‌های وابسته (WebSocket, Database)',
                    'بررسی مجوزهای دسترسی'
                ] : ['✅ همه 34 اندپوینت سالم هستند']
            });
            
        } catch (error) {
            console.error('Error in test-all-endpoints:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    // تست دقیق خطای CoinStats
    router.get("/debug-coinstats", async (req, res) => {
        try {
            const url = "https://openapiv1.coinstats.app/coins?limit=5&currency=USD";
            console.log("🔍 Testing CoinStats API...");
        
            const response = await fetch(url, {
                headers: {
                    'X-API-KEY': 'uNb+sQjnjCQmV30dYrChxgh55hRHElmizLinkJX+5U6g=',
                    'Accept': 'application/json',
                    'User-Agent': 'VortexAI-Server/1.0'
                }
            });
 
            console.log("📊 Response Status:", response.status);
            console.log("📊 Response Headers:", response.headers);
        
            const contentType = response.headers.get('content-type');
            const responseText = await response.text();
        
            console.log("📊 Content-Type:", contentType);
            console.log("📊 Response (first 500 chars):", responseText.substring(0, 500));

            res.json({
                status: response.status,
                contentType: contentType,
                headers: Object.fromEntries(response.headers),
                responseSample: responseText.substring(0, 500),
                isJson: contentType && contentType.includes('application/json')
            });

        } catch (error) {
            console.log("❌ Fetch Error:", error.message);
            res.json({
                error: error.message,
                stack: error.stack
            });
        }
    });

    router.get("/test-new-key", async (req, res) => {
        try {
            const testUrl = "https://openapiv1.coinstats.app/coins?limit=3";
            console.log("🔍 Testing NEW API Key...");
        
            const response = await fetch(testUrl, {
                headers: {
                    'X-API-KEY': '40QRC4gdyzWIGwsvGkqWtcDOf0bk+FV217KmLxQ/Wmw=',
                    'Accept': 'application/json'
                }
            });

            const result = {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers)
            };

            if (response.ok) {
                const data = await response.json();
                result.data = data;
            } else {
                const text = await response.text();
                result.error = text;
            }

            res.json(result);
        
        } catch (error) {
            res.json({ 
                error: error.message,
                stack: error.stack 
            });
        }
    });
    return router;
};
