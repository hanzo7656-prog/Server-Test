// routes/api/advanced.js
const express = require('express');
const router = express.Router();
const AdvancedMarketAnalysis = require('../../models/TechnicalAnalysis/AdvancedMarketAnalysis');
const AdvancedDataAPI = require('../../models/DataAPIs/AdvancedDataAPI');

// نمونه‌سازی
const advancedAnalysis = new AdvancedMarketAnalysis();
const advancedAPI = new AdvancedDataAPI();

/**
 * تحلیل پیشرفته برای یک کوین خاص
 */
router.get('/coin/:coinId', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { coinId } = req.params;
        const { currentPrice } = req.query;

        if (!coinId) {
            return res.status(400).json({
                success: false,
                error: 'Coin ID is required'
            });
        }

        console.log(🔬 Starting advanced analysis for: ${coinId});

        const price = currentPrice ? parseFloat(currentPrice) : await getCurrentPrice(coinId);
        
        if (!price) {
            return res.status(404).json({
                success: false,
                error: 'Could not determine current price for the coin'
            });
        }

        // تحلیل جامع
        const analysis = await advancedAnalysis.comprehensiveCoinAnalysis(coinId, price);

        const responseTime = Date.now() - startTime;

        res.json({
            success: true,
            coin_id: coinId,
            current_price: price,
            analysis: analysis,
            processing_time: ${responseTime}ms,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in advanced coin analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * تحلیل مقایسه‌ای چند کوین
 */
router.get('/compare', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { coins } = req.query;
        
        if (!coins) {
            return res.status(400).json({
                success: false,
                error: 'Coins parameter is required (comma-separated)'
            });
        }

        const coinList = coins.split(',').slice(0, 5); // حداکثر ۵ کوین
        console.log(📊 Starting comparative analysis for: ${coinList.join(', ')});

        const comparisons = await Promise.all(
            coinList.map(async (coinId) => {
                const price = await getCurrentPrice(coinId);
                if (price) {
                    const analysis = await advancedAnalysis.comprehensiveCoinAnalysis(coinId, price);
                    return {
                        coin_id: coinId,
                        current_price: price,
                        analysis: analysis
                    };
                }
                return null;
            })
        );

        const validComparisons = comparisons.filter(item => item !== null);
        
        // مقایسه نتایج
        const comparisonResults = {
            coins: validComparisons,
            rankings: {
                by_confidence: [...validComparisons].sort((a, b) => 
                    b.analysis.vortexai_enhanced.confidence_score - a.analysis.vortexai_enhanced.confidence_score
                ),
                by_risk: [...validComparisons].sort((a, b) => 
                    riskLevelToScore(a.analysis.vortexai_enhanced.risk_level) - riskLevelToScore(b.analysis.vortexai_enhanced.risk_level)
                ),
                by_performance: [...validComparisons].sort((a, b) => {
                    const aPerf = Object.values(a.analysis.historical_performance).reduce((sum, p) => sum + (p.price_change || 0), 0);
                    const bPerf = Object.values(b.analysis.historical_performance).reduce((sum, p) => sum + (p.price_change || 0), 0);

return bPerf - aPerf;
                })
            },
            summary: {
                total_coins: validComparisons.length,
                best_confidence: validComparisons.reduce((best, current) => 
                    current.analysis.vortexai_enhanced.confidence_score > best.analysis.vortexai_enhanced.confidence_score ? current : best
                ),
                lowest_risk: validComparisons.reduce((best, current) => 
                    riskLevelToScore(current.analysis.vortexai_enhanced.risk_level) < riskLevelToScore(best.analysis.vortexai_enhanced.risk_level) ? current : best
                )
            }
        };

        const responseTime = Date.now() - startTime;

        res.json({
            success: true,
            comparison: comparisonResults,
            processing_time: ${responseTime}ms,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in comparative analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * تحلیل آربیتراژ بین صرافی‌ها
 */
router.get('/arbitrage', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { coin, target } = req.query;
        const coinId = coin || 'bitcoin';
        const targetCoin = target || 'USDT';

        console.log(💱 Analyzing arbitrage for ${coinId}/${targetCoin});

        const exchangeData = await advancedAnalysis.analyzeExchangeData(coinId);
        const arbitrageOpportunities = exchangeData.arbitrage_opportunities;

        const responseTime = Date.now() - startTime;

        res.json({
            success: true,
            pair: ${coinId}/${targetCoin},
            arbitrage_opportunities: arbitrageOpportunities,
            total_opportunities: arbitrageOpportunities.length,
            best_opportunity: arbitrageOpportunities[0] || null,
            processing_time: ${responseTime}ms,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in arbitrage analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * دریافت داده‌های تاریخی دقیق
 */
router.get('/historical/:coinId', async (req, res) => {
    try {
        const { coinId } = req.params;
        const { timestamp } = req.query;

        if (!timestamp) {
            return res.status(400).json({
                success: false,
                error: 'Timestamp parameter is required'
            });
        }

        const historicalPrice = await advancedAPI.getHistoricalAvgPrice(coinId, parseInt(timestamp));

        if (!historicalPrice) {
            return res.status(404).json({
                success: false,
                error: 'Historical price not found'
            });
        }

        res.json({
            success: true,
            coin_id: coinId,
            timestamp: parseInt(timestamp),
            price: historicalPrice,
            date: new Date(parseInt(timestamp) * 1000).toISOString(),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error fetching historical data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * وضعیت APIهای پیشرفته
 */
router.get('/status', async (req, res) => {
    try {
        const apiStatus = advancedAPI.getAPIStatus();
        
        // تست اتصال به APIهای مختلف
        const testResults = await testAPIConnections();

        res.json({
            success: true,
            advanced_api_status: apiStatus,
            connection_tests: testResults,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in advanced status endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== توابع کمکی ====================

/**
 * دریافت قیمت فعلی کوین
 */
async function getCurrentPrice(coinId) {
    try {
        // شبیه‌سازی - در واقعیت از API اصلی استفاده کن
        const mockPrices = {
            'bitcoin': 45000,
            'ethereum': 3000,
            'solana': 100,
            'cardano': 0.5,
            'polkadot': 7
        };
        
        return mockPrices[coinId] || Math.random() * 1000;
    } catch (error) {
        console.error(Error getting current price for ${coinId}:, error);
        return null;
    }
}

/**
 * تبدیل سطح ریسک به امتیاز
 */
function riskLevelToScore(riskLevel) {
    const scores = {
        'low': 1,
        'low_medium': 2,
        'medium': 3,
        'medium_high': 4,
        'high': 5
    };
    return scores[riskLevel] || 3;
}

/**
 * تست اتصال به APIها
 */
async function testAPIConnections() {
    const tests = {};
    
    try {
        // تست API قیمت تاریخی
        const historicalTest = await advancedAPI.getHistoricalAvgPrice('bitcoin', Math.floor(Date.now() / 1000) - 86400);
        tests.historical_api = historicalTest ? 'OK' : 'FAILED';
        
        // تست API صرافی‌ها
        const exchangesTest = await advancedAPI.getExchangesTickers();
        tests.exchanges_api = exchangesTest ? 'OK' : 'FAILED';
        
        // تست API تبادل
        const exchangeTest = await advancedAPI.getExchangePrice('Binance', 'BTC', 'USDT', Math.floor(Date.now() / 1000));
        tests.exchange_price_api = exchangeTest ? 'OK' : 'FAILED';
        
    } catch (error) {
        tests.error = error.message;
    }
    
    return tests;
}

module.exports = router;
