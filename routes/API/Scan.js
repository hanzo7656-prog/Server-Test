// routes/api/scan.js
const express = require('express');
const router = express.Router();
const { coinStatsHealthCheck, filterCoinsByHealth } = require('../../models/HealthFilter');
const AdvancedMarketAnalysis = require('../../models/TechnicalAnalysis/AdvancedMarketAnalysis');
const { TechnicalAnalysisEngine } = require('../../models/TechnicalAnalysis/TechnicalAnalysisEngine');

// نمونه‌سازی
const advancedAnalysis = new AdvancedMarketAnalysis();

/**
 * endpoint اصلی اسکن با فیلتر سلامت و تحلیل پیشرفته
 */
router.get('/vortexai', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 300);
        const filterType = req.query.filter || 'volume';
        const includeAdvanced = req.query.advanced === 'true';

        console.log(🚀 Starting advanced scan with limit: ${limit}, filter: ${filterType});

        // دریافت داده‌ها از API اصلی
        const [apiData, realtimeData] = await Promise.all([
            req.apiClient.getCoins(limit),
            Promise.resolve(req.wsManager.getRealtimeData())
        ]);

        let coins = apiData.coins || [];
        console.log(📊 API coins: ${coins.length}, Realtime: ${Object.keys(realtimeData || {}).length});

        // اعمال فیلتر سلامت
        const healthResults = filterCoinsByHealth(coins);
        coins = healthResults.healthy;

        console.log(🩺 Health filter: ${healthResults.stats.total} -> ${coins.length} coins);
        console.log(📈 Health stats: ${healthResults.stats.average_score} avg score, ${healthResults.stats.healthy_count} healthy);

        // فال‌بک اگر کوین سالمی نبود
        if (coins.length === 0) {
            console.log('⚠️ No healthy coins found, using realtime data fallback');
            coins = Object.entries(realtimeData || {}).slice(0, limit).map(([symbol, data], index) => ({
                id: 'coin_' + index,
                name: 'Crypto' + index,
                symbol: symbol.replace("_usdt", "").toUpperCase(),
                price: data.price || 0,
                priceChange1h: data.change || 0,
                priceChange24h: data.change || 0,
                volume: data.volume || 0,
                marketCap: (data.price || 0) * 1000000,
                rank: index + 1,
                health_status: {
                    is_healthy: true,
                    tier: 'fallback',
                    reasons: [],
                    score: 50,
                    warnings: ['FALLBACK_DATA']
                }
            }));
        }

        // پردازش تاریخی و تحلیل VortexAI
        const historicalData = await req.historicalAPI.getMultipleCoinsHistorical(
            coins.map(coin => req.historicalAPI.symbolToCoinId(coin.symbol)), 
            '24h'
        );

        const historicalMap = {};
        historicalData.data.forEach(coinData => {
            if (coinData && coinData.coinId) {
                historicalMap[coinData.coinId] = coinData;
            }
        });

        // تحلیل پیشرفته (اگر درخواست شده)
        let advancedAnalyses = {};
        if (includeAdvanced) {
            console.log('🔬 Starting advanced analysis...');
            const analysisPromises = coins.slice(0, 10).map(async (coin) => {
                const coinId = req.historicalAPI.symbolToCoinId(coin.symbol);
                return {
                    symbol: coin.symbol,
                    analysis: await advancedAnalysis.comprehensiveCoinAnalysis(coinId, coin.price)
                };
            });

            const analyses = await Promise.all(analysisPromises);
            analyses.forEach(item => {
                advancedAnalyses[item.symbol] = item.analysis;
            });
        }

        // پردازش نهایی کوین‌ها
        const enhancedCoins = coins.map((coin) => {

const coinId = req.historicalAPI.symbolToCoinId(coin.symbol);
            const historicalData = historicalMap[coinId];
            const symbol = ${coin.symbol.toLowerCase()}_usdt;
            const realtime = realtimeData[symbol];
            const currentPrice = realtime?.price || coin.price;

            let historicalChanges = {};
            let dataSource = 'no_historical';

            if (historicalData) {
                const changeResult = req.historicalAPI.calculatePriceChangesFromChart(historicalData, currentPrice);
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
                },

                // تحلیل پیشرفته اگر موجود باشد
                ...(includeAdvanced && advancedAnalyses[coin.symbol] && {
                    advanced_analysis: advancedAnalyses[coin.symbol]
                })
            };
        });

        // فیلتر نهایی
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
            case 'health_score':
                filteredCoins.sort((a, b) => (b.health_status?.score  0) - (a.health_status?.score  0));
                break;
        }

        const responseTime = Date.now() - startTime;

        // پاسخ نهایی
        res.json({
            success: true,
            coins: filteredCoins.slice(0, limit),
            total_coins: filteredCoins.length,
            scan_mode: 'vortexai_enhanced_with_health_filter',
            filter_applied: filterType,
            health_metrics: healthResults.stats,
            data_sources: {
                api: apiData.coins?.length || 0,
                realtime: Object.keys(realtimeData || {}).length,
                historical_api: Object.keys(historicalMap || {}).length,
                gist: Object.keys((req.gistManager.getAllData()  {}).prices  {}).length
            },
            processing_time: responseTime + 'ms',
            includes_advanced_analysis: includeAdvanced,
            timestamp: new Date().toISOString()
        });

} catch (error) {
        console.error('❌ Error in advanced scan endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * endpoint گزارش سلامت
 */
router.get('/health-report', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 500);
        
        const apiData = await req.apiClient.getCoins(limit);
        const coins = apiData.coins || [];
        
        const healthReport = generateHealthReport(coins);
        
        res.json({
            success: true,
            report: healthReport,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in health report endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
