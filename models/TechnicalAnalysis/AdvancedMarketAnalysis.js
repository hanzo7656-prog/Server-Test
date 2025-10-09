// models/TechnicalAnalysis/AdvancedMarketAnalysis.js
const AdvancedDataAPI = require('../DataAPIs/AdvancedDataAPI');
const { TIMEFRAMES, EXCHANGES, MAJOR_COINS } = require('../../config/constants');

class AdvancedMarketAnalysis {
    constructor() {
        this.dataAPI = new AdvancedDataAPI();
    }

    /**
     * تحلیل جامع کوین با تمام داده‌های پیشرفته
     */
    async comprehensiveCoinAnalysis(coinId, currentPrice) {
        const analysis = {
            historical_performance: {},
            exchange_analysis: {},
            market_structure: {},
            vortexai_enhanced: {},
            timestamp: new Date().toISOString()
        };

        try {
            // ۱. تحلیل عملکرد تاریخی
            analysis.historical_performance = await this.analyzeHistoricalPerformance(coinId, currentPrice);
            
            // ۲. تحلیل داده‌های صرافی
            analysis.exchange_analysis = await this.analyzeExchangeData(coinId);
            
            // ۳. تحلیل ساختار بازار
            analysis.market_structure = await this.analyzeMarketStructure(coinId);
            
            // ۴. بهبود سیگنال‌های VortexAI
            analysis.vortexai_enhanced = await this.enhanceVortexAISignals(coinId, currentPrice, analysis);

            analysis.success = true;

        } catch (error) {
            analysis.success = false;
            analysis.error = error.message;
            console.error(❌ Comprehensive analysis error for ${coinId}:, error);
        }

        return analysis;
    }

    /**
     * تحلیل عملکرد تاریخی
     */
    async analyzeHistoricalPerformance(coinId, currentPrice) {
        const now = Math.floor(Date.now() / 1000);
        const performance = {};

        for (const [period, seconds] of Object.entries(TIMEFRAMES)) {
            const timestamp = now - seconds;
            const historicalPrice = await this.dataAPI.getHistoricalAvgPrice(coinId, timestamp);
            
            if (historicalPrice && historicalPrice.USD && currentPrice) {
                const change = ((currentPrice - historicalPrice.USD) / historicalPrice.USD) * 100;
                performance[period] = {
                    price_change: parseFloat(change.toFixed(2)),
                    historical_price: historicalPrice.USD,
                    current_price: currentPrice,
                    performance: change > 0 ? 'positive' : 'negative',
                    magnitude: this._getChangeMagnitude(change),
                    trend_strength: this._calculateTrendStrength(change, period)
                };
            }
        }

        performance.overall_trend = this._determineOverallTrend(performance);
        return performance;
    }

    /**
     * تحلیل داده‌های صرافی
     */
    async analyzeExchangeData(coinId) {
        const exchanges = await this.dataAPI.getExchangesTickers();
        const analysis = {
            available_exchanges: [],
            liquidity_metrics: {},
            arbitrage_opportunities: [],
            volume_distribution: {}
        };

        if (exchanges) {
            analysis.available_exchanges = this._findCoinExchanges(exchanges, coinId);
            analysis.liquidity_metrics = this._calculateLiquidityMetrics(analysis.available_exchanges);
            analysis.arbitrage_opportunities = await this._findArbitrageOpportunities(coinId, analysis.available_exchanges);
            analysis.volume_distribution = this._calculateVolumeDistribution(analysis.available_exchanges);
        }

        return analysis;
    }

    /**
     * یافتن فرصت‌های آربیتراژ
     */
    async _findArbitrageOpportunities(coinId, exchanges) {
        const opportunities = [];
        const now = Math.floor(Date.now() / 1000);
        
        // بررسی برای کوین‌های اصلی
        for (const targetCoin of MAJOR_COINS.slice(0, 3)) {

if (coinId.toUpperCase() !== targetCoin) {
                const prices = [];
                
                // دریافت قیمت از صرافی‌های مختلف
                for (const exchange of EXCHANGES.slice(0, 3)) {
                    const priceData = await this.dataAPI.getExchangePrice(
                        exchange, 
                        coinId.toUpperCase(), 
                        targetCoin, 
                        now
                    );
                    
                    if (priceData && priceData.USD) {
                        prices.push({
                            exchange,
                            price: priceData.USD,
                            timestamp: now
                        });
                    }
                }

                // محاسبه اختلاف قیمت
                if (prices.length > 1) {
                    const minPrice = Math.min(...prices.map(p => p.price));
                    const maxPrice = Math.max(...prices.map(p => p.price));
                    const spread = ((maxPrice - minPrice) / minPrice) * 100;

                    if (spread > 0.5) { // اختلاف بیشتر از 0.5%
                        opportunities.push({
                            pair: ${coinId}/${targetCoin},
                            spread: parseFloat(spread.toFixed(2)),
                            best_buy: prices.find(p => p.price === minPrice),
                            best_sell: prices.find(p => p.price === maxPrice),
                            potential_profit: parseFloat((spread * 0.8).toFixed(2)), // بعد از کارمزد
                            opportunity_level: this._getOpportunityLevel(spread)
                        });
                    }
                }
            }
        }

        return opportunities.sort((a, b) => b.spread - a.spread);
    }

    /**
     * تحلیل ساختار بازار
     */
    async analyzeMarketStructure(coinId) {
        return {
            market_sentiment: await this._calculateMarketSentiment(coinId),
            volatility_analysis: await this._analyzeVolatility(coinId),
            support_resistance: await this._findSupportResistance(coinId),
            volume_analysis: await this._analyzeVolumePatterns(coinId)
        };
    }

    /**
     * بهبود سیگنال‌های VortexAI
     */
    async enhanceVortexAISignals(coinId, currentPrice, historicalAnalysis) {
        const enhancedSignals = {
            confidence_score: 0,
            risk_factors: [],
            opportunity_factors: [],
            final_recommendation: '',
            risk_level: 'medium',
            time_horizon: 'medium_term'
        };

        try {
            // محاسبه امتیاز اطمینان
            const historicalConfidence = this._calculateHistoricalConfidence(historicalAnalysis.historical_performance);
            const exchangeConfidence = this._calculateExchangeConfidence(historicalAnalysis.exchange_analysis);
            const marketConfidence = this._calculateMarketConfidence(historicalAnalysis.market_structure);
            
            enhancedSignals.confidence_score = Math.round(
                (historicalConfidence * 0.4) + 
                (exchangeConfidence * 0.3) + 
                (marketConfidence * 0.3)
            );

            // شناسایی فاکتورهای ریسک و فرصت
            enhancedSignals.risk_factors = this._identifyRiskFactors(historicalAnalysis);
            enhancedSignals.opportunity_factors = this._identifyOpportunityFactors(historicalAnalysis);
            
            // سطح ریسک
            enhancedSignals.risk_level = this._determineRiskLevel(
                enhancedSignals.risk_factors, 
                enhancedSignals.opportunity_factors
            );

            // افق زمانی پیشنهادی
            enhancedSignals.time_horizon = this._determineTimeHorizon(historicalAnalysis.historical_performance);
            
            // توصیه نهایی
            enhancedSignals.final_recommendation = this._generateRecommendation(enhancedSignals);

} catch (error) {
            console.error(❌ Signal enhancement error for ${coinId}:, error);
            enhancedSignals.error = error.message;
        }

        return enhancedSignals;
    }

    // ==================== متدهای کمکی ====================

    _findCoinExchanges(exchangesData, coinId) {
        // شبیه‌سازی - در واقعیت باید با داده‌های واقعی پر شود
        return EXCHANGES.map(exchange => ({
            name: exchange,
            supports_coin: true,
            volume_rank: Math.floor(Math.random() * 10) + 1,
            liquidity_score: Math.floor(Math.random() * 100) + 1
        })).slice(0, 5);
    }

    _calculateLiquidityMetrics(exchanges) {
        return {
            total_exchanges: exchanges.length,
            average_liquidity_score: exchanges.reduce((sum, ex) => sum + ex.liquidity_score, 0) / exchanges.length,
            top_exchanges: exchanges.sort((a, b) => b.liquidity_score - a.liquidity_score).slice(0, 3),
            liquidity_health: 'good' // بر اساس محاسبات واقعی
        };
    }

    _calculateVolumeDistribution(exchanges) {
        return {
            total_volume: exchanges.reduce((sum, ex) => sum + (ex.volume_rank || 0), 0),
            volume_concentration: 'medium',
            dominant_exchanges: exchanges.filter(ex => ex.volume_rank <= 3)
        };
    }

    _getChangeMagnitude(change) {
        const absChange = Math.abs(change);
        if (absChange > 15) return 'high';
        if (absChange > 7) return 'medium';
        if (absChange > 3) return 'low';
        return 'very_low';
    }

    _calculateTrendStrength(change, period) {
        const absChange = Math.abs(change);
        let strength = 'weak';
        
        if (period === '1h' && absChange > 2) strength = 'strong';
        else if (period === '24h' && absChange > 5) strength = 'strong';
        else if (period === '7d' && absChange > 10) strength = 'strong';
        else if (absChange > 3) strength = 'medium';
        
        return strength;
    }

    _determineOverallTrend(performance) {
        const positivePeriods = Object.values(performance).filter(p => p.performance === 'positive').length;
        const totalPeriods = Object.keys(performance).length;
        
        if (positivePeriods / totalPeriods > 0.7) return 'strong_bullish';
        if (positivePeriods / totalPeriods > 0.5) return 'bullish';
        if (positivePeriods / totalPeriods > 0.3) return 'neutral';
        return 'bearish';
    }

    _getOpportunityLevel(spread) {
        if (spread > 2) return 'high';
        if (spread > 1) return 'medium';
        return 'low';
    }

    _calculateHistoricalConfidence(performance) {
        if (!performance.overall_trend) return 50;
        
        const trendScores = {
            'strong_bullish': 80,
            'bullish': 65,
            'neutral': 50,
            'bearish': 35
        };
        
        return trendScores[performance.overall_trend] || 50;
    }

    _calculateExchangeConfidence(exchangeAnalysis) {
        const liquidityScore = exchangeAnalysis.liquidity_metrics?.average_liquidity_score || 50;
        const exchangeCount = exchangeAnalysis.available_exchanges?.length || 0;
        
        return Math.min((liquidityScore * 0.7) + (exchangeCount * 5), 100);
    }

    _calculateMarketConfidence(marketStructure) {
        return 60; // شبیه‌سازی - در واقعیت با داده‌های واقعی
    }

    _identifyRiskFactors(analysis) {
        const risks = [];
        
        if (analysis.historical_performance.overall_trend === 'bearish') {
            risks.push('downtrend');
        }
        
        if (analysis.exchange_analysis.liquidity_metrics?.average_liquidity_score < 30) {
            risks.push('low_liquidity');
        }
        
        if (analysis.exchange_analysis.available_exchanges?.length < 3) {
            risks.push('limited_exchanges');
        }
        
        return risks;
    }

_identifyOpportunityFactors(analysis) {
        const opportunities = [];
        
        if (analysis.historical_performance.overall_trend === 'strong_bullish') {
            opportunities.push('strong_uptrend');
        }
        
        if (analysis.exchange_analysis.arbitrage_opportunities?.length > 0) {
            opportunities.push('arbitrage_opportunities');
        }
        
        if (analysis.exchange_analysis.liquidity_metrics?.average_liquidity_score > 70) {
            opportunities.push('high_liquidity');
        }
        
        return opportunities;
    }

    _determineRiskLevel(riskFactors, opportunityFactors) {
        const riskScore = riskFactors.length;
        const opportunityScore = opportunityFactors.length;
        
        if (riskScore >= 3) return 'high';
        if (riskScore >= 2 && opportunityScore <= 1) return 'medium_high';
        if (riskScore === opportunityScore) return 'medium';
        if (opportunityScore > riskScore) return 'low_medium';
        return 'low';
    }

    _determineTimeHorizon(performance) {
        const shortTerm = performance['1h']?.trend_strength === 'strong' || performance['24h']?.trend_strength === 'strong';
        const longTerm = performance['7d']?.trend_strength === 'strong' || performance['30d']?.trend_strength === 'strong';
        
        if (shortTerm && longTerm) return 'all_terms';
        if (shortTerm) return 'short_term';
        if (longTerm) return 'long_term';
        return 'medium_term';
    }

    _generateRecommendation(signals) {
        if (signals.confidence_score >= 80 && signals.risk_level === 'low') return 'STRONG_BUY';
        if (signals.confidence_score >= 70 && signals.risk_level <= 'medium') return 'BUY';
        if (signals.confidence_score >= 50) return 'HOLD';
        if (signals.confidence_score >= 30) return 'WATCH';
        return 'AVOID';
    }

    // متدهای شبیه‌سازی برای تحلیل‌های آینده
    async _calculateMarketSentiment(coinId) {
        return 'neutral';
    }

    async _analyzeVolatility(coinId) {
        return { current: 'medium', trend: 'stable' };
    }

    async _findSupportResistance(coinId) {
        return { support: [], resistance: [] };
    }

    async _analyzeVolumePatterns(coinId) {
        return { pattern: 'normal', anomaly: false };
    }
}

module.exports = AdvancedMarketAnalysis;
