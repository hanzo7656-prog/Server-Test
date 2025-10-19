const { getSafeValue } = require('../utils/validators');
const { formatNumber, formatPrice, formatPercentage, formatRelativeTime } = require('../utils/formatters');

class DataProcessor {
    /**
    * Process raw coin data from API
    */
    static processCoinData(coin, includeRaw = false) {
        if (!coin || typeof coin !== 'object') return null;

        const processed = {
            // Basic info
            id: getSafeValue(coin, 'id'),
            symbol: getSafeValue(coin, 'symbol'),
            name: getSafeValue(coin, 'name'),
            rank: getSafeValue(coin, 'rank', 0),

            // Price data
            price: formatPrice(getSafeValue(coin, 'price')),
            priceRaw: getSafeValue(coin, 'price', 0),

            // Changes
            change1h: formatPercentage(getSafeValue(coin, 'priceChange1h')),
            change1hRaw: getSafeValue(coin, 'priceChange1h', 0),
            change24h: formatPercentage(getSafeValue(coin, 'priceChange1d')),
            change24hRaw: getSafeValue(coin, 'priceChange1d', 0),
            change7d: formatPercentage(getSafeValue(coin, 'priceChange1w')),
            change7dRaw: getSafeValue(coin, 'priceChange1w', 0),

            // Market data
            marketCap: formatNumber(getSafeValue(coin, 'marketCap')),
            marketCapRaw: getSafeValue(coin, 'marketCap', 0),
            volume: formatNumber(getSafeValue(coin, 'volume')),
            volumeRaw: getSafeValue(coin, 'volume', 0),

            // Supply
            availableSupply: formatNumber(getSafeValue(coin, 'availableSupply')),
            totalSupply: formatNumber(getSafeValue(coin, 'totalSupply')),

            // Additional info
            icon: getSafeValue(coin, 'icon'),
            website: getSafeValue(coin, 'websiteUrl'),
            twitter: getSafeValue(coin, 'twitterUrl'),
            reddit: getSafeValue(coin, 'redditUrl'),

            // Analysis
            trend: getSafeValue(coin, 'priceChange1d', 0) > 0 ? 'up' : 'down',
            signalStrength: Math.min(Math.abs(getSafeValue(coin, 'priceChange1d', 0)) * 10, 100)
        };

        if (includeRaw) {
            processed.raw = coin;
        }

        return processed;
    }

    /**
    * Process news data from API
    */
    static processNewsData(news) {
        if (!news || typeof news !== 'object') return null;

        return {
            id: getSafeValue(news, 'id'),
            title: getSafeValue(news, 'title', 'بدون عنوان'),
            description: getSafeValue(news, 'description', 'بدون توضیحات'),
            source: getSafeValue(news, 'source', 'منبع نامشخص'),
            image: getSafeValue(news, 'imgUrl'),
            url: getSafeValue(news, 'link'),
            date: getSafeValue(news, 'feedDate'),
            relatedCoins: getSafeValue(news, 'relatedCoins', []),
            isFeatured: getSafeValue(news, 'isFeatured', false),

            // Formatted fields
            formattedDate: formatRelativeTime(getSafeValue(news, 'feedDate')),
            shortTitle: (getSafeValue(news, 'title', '')).substring(0, 100) + '...'
        };
    }

    /**
    * Process health data
    */
    static processHealthData(healthData) {
        if (!healthData || typeof healthData !== 'object') return null;

        return {
            status: getSafeValue(healthData, 'status', 'unknown'),
            service: getSafeValue(healthData, 'service', 'VortexAI Crypto Scanner'),
            version: getSafeValue(healthData, 'version', '1.0.0'),
            timestamp: getSafeValue(healthData, 'timestamp', new Date().toISOString()),

            // Components
            components: {
                websocket: {
                    connected: getSafeValue(healthData, 'components.websocket.connected', false),
                    activeCoins: getSafeValue(healthData, 'components.websocket.active_coins', 0),
                    status: getSafeValue(healthData, 'components.websocket.status', 'unknown')
                },
                database: {
                    storedCoins: getSafeValue(healthData, 'components.database.stored_coins', 0),
                    status: getSafeValue(healthData, 'components.database.status', 'unknown')
                },
                api: {
                    requestCount: getSafeValue(healthData, 'components.api.request_count', 0),
                    successRate: getSafeValue(healthData, 'components.api.success_rate', '0%'),
                    status: getSafeValue(healthData, 'components.api.status', 'unknown')
                }
            },

            // Performance
            performance: {
                totalRequests: getSafeValue(healthData, 'performance.totalRequests', 0),
                completedRequests: getSafeValue(healthData, 'performance.completedRequests', 0),
                successfulRequests: getSafeValue(healthData, 'performance.successfulRequests', 0),
                errorCount: getSafeValue(healthData, 'performance.errorCount', 0),
                averageDuration: getSafeValue(healthData, 'performance.averageDuration', '0ms'),
                successRate: getSafeValue(healthData, 'performance.successRate', '0%'),
                endpointCount: getSafeValue(healthData, 'performance.endpointCount', 0),
                uptime: getSafeValue(healthData, 'performance.uptime', '0s'),
                memoryUsage: getSafeValue(healthData, 'performance.memoryUsage', '0 MB')
            }
        };
    }

    /**
    * Process market data
    */
    static processMarketData(marketData) {
        if (!marketData || typeof marketData !== 'object') return null;

        return {
            totalMarketCap: formatNumber(getSafeValue(marketData, 'total_market_cap')),
            totalVolume: formatNumber(getSafeValue(marketData, 'total_volume')),
            btcDominance: getSafeValue(marketData, 'btc_dominance', 0) + '%',
            activeCryptocurrencies: getSafeValue(marketData, 'active_cryptocurrencies', 0),
            marketCapChange24h: formatPercentage(getSafeValue(marketData, 'market_cap_change_percentage_24h_usd', 0)),
            timestamp: getSafeValue(marketData, 'timestamp', new Date().toISOString())
        };
    }

    /**
    * Process technical analysis data
    */
    static processTechnicalAnalysis(analysisData) {
        if (!analysisData || typeof analysisData !== 'object') return null;

        return {
            symbol: getSafeValue(analysisData, 'symbol'),
            timeframe: getSafeValue(analysisData, 'timeframe'),
            currentPrice: formatPrice(getSafeValue(analysisData, 'current_price')),

            // Indicators
            indicators: {
                rsi: getSafeValue(analysisData, 'indicators.rsi', 0),
                macd: getSafeValue(analysisData, 'indicators.macd', 0),
                macdSignal: getSafeValue(analysisData, 'indicators.macd_signal', 0),
                macdHistogram: getSafeValue(analysisData, 'indicators.macd_hist', 0),
                bollingerUpper: formatPrice(getSafeValue(analysisData, 'indicators.bollinger_upper')),
                bollingerMiddle: formatPrice(getSafeValue(analysisData, 'indicators.bollinger_middle')),
                bollingerLower: formatPrice(getSafeValue(analysisData, 'indicators.bollinger_lower')),
                movingAverage20: formatPrice(getSafeValue(analysisData, 'indicators.moving_avg_20')),
                movingAverage50: formatPrice(getSafeValue(analysisData, 'indicators.moving_avg_50'))
            },

            // Signals
            signals: {
                trend: getSafeValue(analysisData, 'signals.trend', 'NEUTRAL'),
                strength: getSafeValue(analysisData, 'signals.strength', 0),
                confidence: getSafeValue(analysisData, 'signals.confidence', 0),
                recommendations: getSafeValue(analysisData, 'signals.recommendations', []),
                riskLevel: getSafeValue(analysisData, 'signals.risk_level', 'MEDIUM')
            },

            timestamp: getSafeValue(analysisData, 'analysis_timestamp', new Date().toISOString())
        };
    }

    /**
    * Process multiple coins for list display
    */
    static processCoinsList(coins, limit = 50) {
        if (!Array.isArray(coins)) return [];
        
        return coins
            .slice(0, limit)
            .map(coin => this.processCoinData(coin))
            .filter(coin => coin !== null);
    }

    /**
    * Process multiple news items
    */
    static processNewsList(newsItems, limit = 20) {
        if (!Array.isArray(newsItems)) return [];
        
        return newsItems
            .slice(0, limit)
            .map(news => this.processNewsData(news))
            .filter(news => news !== null);
    }

    /**
    * Process fear and greed index data
    */
    static processFearGreedData(fgData) {
        if (!fgData || typeof fgData !== 'object') return null;

        const value = getSafeValue(fgData, 'value', 0);
        const status = require('../utils/formatters').getFearGreedStatus(value);

        return {
            value: value,
            status: status.status,
            emoji: status.emoji,
            color: status.color,
            classification: getSafeValue(fgData, 'classification', 'Neutral'),
            timestamp: getSafeValue(fgData, 'timestamp', new Date().toISOString())
        };
    }
}

module.exports = DataProcessor; 
