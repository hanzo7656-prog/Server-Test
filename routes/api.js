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

            // دریافت داده‌های بازار
            const marketData = await apiClient.getCoins(200, 'USD', false);
        
            if (!marketData.success) {
                throw new Error(`Failed to fetch market data: ${marketData.error}`);
            }
 
            const coins = marketData.data?.result || marketData.data || [];
            const targetCoin = coins.find(coin => 
                coin.id === symbol || 
                coin.symbol?.toLowerCase() === symbol.toLowerCase()
            );

            if (!targetCoin) {
                throw new Error(`Coin "${symbol}" not found`);
            }

            console.log('📊 Coin Data:', {
                name: targetCoin.name,
                price: targetCoin.price,
                change24h: targetCoin.priceChange1d
            });

            // ساخت تحلیل بر اساس داده‌های موجود
            const analysis = await this.generateAnalysisFromCoinData(targetCoin, timeframe);
          
            res.json(createResponse(true, analysis, null, {
                endpoint: '/analysis/technical',
                data_source: 'market_data'
            }));

        } catch (error) {
            console.error('❌ Technical Analysis Error:', error);
            res.status(500).json(createResponse(false, null, error.message));
        }
    });

    // تابع جدید برای تحلیل از داده‌های کوین
    async function generateAnalysisFromCoinData(coin, timeframe) {
        const basePrice = coin.price || 1;
        const priceChange = coin.priceChange1d || coin.priceChange24h || 0;
        const volume = coin.volume || 0;
        const marketCap = coin.marketCap || 0;
    
        // محاسبه اندیکاتورهای ساده از داده‌های موجود
        const rsi = this.calculateSimpleRSI(priceChange);
        const trend = this.analyzeSimpleTrend(priceChange, volume);
    
        return {
            symbol: coin.symbol,
            name: coin.name,
            timeframe: timeframe,
            current_price: basePrice,
            price_change_24h: priceChange,
            volume: volume,
            market_cap: marketCap,
            indicators: {
                rsi: rsi,
                trend_strength: trend.strength,
                volume_power: this.calculateVolumePower(volume, marketCap),
                momentum: Math.abs(priceChange) / 2
            },
            signals: this.generateSimpleSignals(rsi, priceChange, trend),
            trend: {
                direction: trend.direction,
                strength: trend.strength,
                description: trend.description
            },
            support_resistance: this.calculateSimpleSupportResistance(basePrice, priceChange),
            analysis_timestamp: new Date().toISOString(),
            note: "تحلیل بر اساس داده‌های فعلی بازار - داده‌های تاریخی در دسترس نیست"
        };
    }

// توابع کمکی ساده
    function calculateSimpleRSI(priceChange) {
    // RSI ساده بر اساس تغییرات قیمت
        if (priceChange > 10) return 75; // اشباع خرید
        if (priceChange > 5) return 65;  // نزدیک به اشباع خرید
        if (priceChange < -10) return 25; // اشباع فروش
        if (priceChange < -5) return 35;  // نزدیک به اشباع فروش
        return 50; // خنثی
    }

    function analyzeSimpleTrend(priceChange, volume) {
        if (priceChange > 3 && volume > 1000000) {
            return { direction: 'BULLISH', strength: 0.8, description: 'روند صعودی قوی' };
        } else if (priceChange > 1) {
            return { direction: 'BULLISH', strength: 0.6, description: 'روند صعودی' };
        } else if (priceChange < -3 && volume > 1000000) {
            return { direction: 'BEARISH', strength: 0.8, description: 'روند نزولی قوی' };
        } else if (priceChange < -1) {
            return { direction: 'BEARISH', strength: 0.6, description: 'روند نزولی' };
        } else {
            return { direction: 'NEUTRAL', strength: 0.4, description: 'روند خنثی' };
        }
    }

    function generateSimpleSignals(rsi, priceChange, trend) {
        const signals = [];
    
        if (rsi < 30) signals.push('RSI_OVERSOLD');
        if (rsi > 70) signals.push('RSI_OVERBOUGHT');
        if (trend.direction === 'BULLISH') signals.push('TREND_BULLISH');
        if (trend.direction === 'BEARISH') signals.push('TREND_BEARISH');
        if (priceChange > 8) signals.push('STRONG_UPTREND');
        if (priceChange < -8) signals.push('STRONG_DOWNTREND');
    
        return {
            buy_signals: signals.filter(s => s.includes('BULLISH') || s.includes('OVERSOLD')),
            sell_signals: signals.filter(s => s.includes('BEARISH') || s.includes('OVERBOUGHT')),
            all_signals: signals,
            signal_strength: Math.min(Math.abs(priceChange) / 20, 1.0)
        };
    }

    function calculateSimpleSupportResistance(price, change) {
        const support = price * (1 - Math.max(Math.abs(change) / 100, 0.05));
        const resistance = price * (1 + Math.max(Math.abs(change) / 100, 0.05));
    
        return {
            support: [support, support * 0.98],
            resistance: [resistance, resistance * 1.02],
            current_price: price
        };
    }

    function calculateVolumePower(volume, marketCap) {
        if (!volume || !marketCap) return 0;
        const ratio = volume / marketCap;
        return Math.min(ratio * 1000, 1.0);
    }

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
