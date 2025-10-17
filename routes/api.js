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

  
