class TechnicalIndicators {
    constructor(data = {}) {
        this.rsi = data.rsi || 50;
        this.macd = data.macd || 0;
        this.macd_signal = data.macd_signal || 0;
        this.macd_hist = data.macd_hist || 0;
        this.bollinger_upper = data.bollinger_upper || 0;
        this.bollinger_middle = data.bollinger_middle || 0;
        this.bollinger_lower = data.bollinger_lower || 0;
        this.moving_avg_20 = data.moving_avg_20 || 0;
        this.moving_avg_50 = data.moving_avg_50 || 0;
        this.moving_avg_200 = data.moving_avg_200 || 0;
        this.stochastic_k = data.stochastic_k || 50;
        this.stochastic_d = data.stochastic_d || 50;
        this.atr = data.atr || 0;
        this.adx = data.adx || 0;
        this.obv = data.obv || 0;
        this.mfi = data.mfi || 50;
        this.williams_r = data.williams_r || -50;
        this.cci = data.cci || 0;
        this.roc = data.roc || 0;
    }
}

class TechnicalAnalysisEngine {
    static calculateAllIndicators(priceData) {
        if (!priceData || priceData.length < 20) {
            return new TechnicalIndicators();
        }

        const prices = priceData.map(p => p.price);
        const volumes = priceData.map(p => p.volume || 1);

        return new TechnicalIndicators({
            rsi: this.calculateRSI(prices),
            macd: this.calculateMACD(prices).macd,
            macd_signal: this.calculateMACD(prices).signal,
            macd_hist: this.calculateMACD(prices).histogram,
            bollinger_upper: this.calculateBollingerBands(prices).upper,
            bollinger_middle: this.calculateBollingerBands(prices).middle,
            bollinger_lower: this.calculateBollingerBands(prices).lower,
            moving_avg_20: this.calculateMA(prices, 20),
            moving_avg_50: this.calculateMA(prices, 50),
            moving_avg_200: this.calculateMA(prices, 200),
            stochastic_k: this.calculateStochastic(priceData).k,
            stochastic_d: this.calculateStochastic(priceData).d,
            atr: this.calculateATR(priceData),
            adx: this.calculateADX(priceData),
            obv: this.calculateOBV(prices, volumes),
            mfi: this.calculateMFI(priceData),
            williams_r: this.calculateWilliamsR(priceData),
            cci: this.calculateCCI(priceData),
            roc: this.calculateROC(prices)
        });
    }

    static calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;
        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const difference = prices[i] - prices[i - 1];
            if (difference >= 0) gains += difference;
            else losses -= difference;
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss == 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    static calculateMACD(prices) {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macd = ema12 - ema26;
        const signal = this.calculateEMA([macd], 9);
        const histogram = macd - signal;
        return { macd, signal, histogram };
    }

    static calculateEMA(prices, period) {
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }
        return ema;
    }

    static calculateMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1];
        const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }

    static calculateBollingerBands(prices, period = 20) {
        const ma = this.calculateMA(prices, period);
        const stdDev = this.calculateStdDev(prices.slice(-period), ma);
        return {
            upper: ma + (stdDev * 2),
            middle: ma,
            lower: ma - (stdDev * 2)
        };
    }

static calculateStdDev(values, mean) {
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    }

    static calculateStochastic(priceData, period = 14) {
        if (priceData.length < period) return { k: 50, d: 50 };
        const recent = priceData.slice(-period);
        const high = Math.max(...recent.map(p => p.high || p.price));
        const low = Math.min(...recent.map(p => p.low || p.price));
        const current = recent[recent.length - 1].price;
        const k = ((current - low) / (high - low)) * 100;
        const d = this.calculateMA([k], 3);
        return { k, d };
    }

    static calculateSupportResistance(priceData) {
        const prices = priceData.map(p => p.price);
        const support = Math.min(...prices) * 0.98;
        const resistance = Math.max(...prices) * 1.02;
        return {
            support: [support, support * 0.99],
            resistance: [resistance, resistance * 1.01]
        };
    }

    static calculateATR(priceData) { return 0.1; }
    static calculateADX(priceData) { return 25; }

    static calculateOBV(prices, volumes) {
        return prices.reduce((obv, price, i) => {
            if (i == 0) return volumes[0];
            return obv + (price > prices[i-1] ? volumes[i] : -volumes[i]);
        }, 0);
    }

    static calculateMFI(priceData) { return 50; }
    static calculateWilliamsR(priceData) { return -50; }
    static calculateCCI(priceData) { return 0; }

    static calculateROC(prices) {
        if (prices.length < 2) return 0;
        return ((prices[prices.length-1] - prices[prices.length-2]) / prices[prices.length-2]) * 100;
    }

    static calculateSignalStrength(coin) {
        const volume = coin.volume || 0;
        const volumeStrength = Math.min(Math.log10(volume + 1) / 2, 5);

        const priceChanges = [
            Math.abs(coin.priceChange1h || 0),
            Math.abs(coin.priceChange24h || 0),
            Math.abs(coin.priceChange1w || 0)
        ].filter(change => change > 0);

        const avgPriceChange = priceChanges.length > 0
            ? priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length
            : 0;

        const priceStrength = Math.min(avgPriceChange / 2, 3);
        const volatilityStrength = Math.min((this.calculateVolatility(coin) || 0) / 2, 2);
        const totalStrength = volumeStrength + priceStrength + volatilityStrength;
        const result = Math.min(totalStrength, 10);

        console.log("Signal Strength Debug:", {
            symbol: coin.symbol,
            volumeStrength: volumeStrength.toFixed(2),
            priceStrength: priceStrength.toFixed(2),
            volatilityStrength: volatilityStrength.toFixed(2),
            total: totalStrength.toFixed(2),
            final: result.toFixed(2)
        });

        return result;
    }

    static calculateVolatility(coin) {
        const changes = [
            Math.abs(coin.priceChange1h || 0),
            Math.abs(coin.priceChange24h || 0),
            Math.abs(coin.priceChange1w || 0)
        ].filter(change => change > 0);

        console.log("volatility Debug - Changes:", changes);
        if (changes.length == 0) {
            console.log("No valid price changes for volatility calculation");
            return 0;
        }

        const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
        const maxChange = Math.max(...changes);
        const volatility = (avgChange * 0.7 + maxChange * 0.3) / 3;
        const result = Math.min(volatility, 10);

        console.log("volatility calculated:", {
            avgChange,
            maxChange,
            volatility,
            finalScore: result
        });

        return result;
    }

    static detectVolumeAnomaly(coin) {
        const volume = coin.volume || 0;
        const marketCap = coin.marketCap || 1;

console.log("Volume Anomaly Input", {  
            symbol: coin.symbol,  
            volume: volume,  
            marketCap: marketCap  
        });

        if (!volume  !marketCap  marketCap == 1) {
            return false;
        }

        const volumeToMarketCapRatio = volume / marketCap;
        let anomalyThreshold;
        
        if (marketCap > 50000000000) {
            anomalyThreshold = 0.08;
        } else if (marketCap > 10000000000) {
            anomalyThreshold = 0.12;
        } else if (marketCap > 1000000000) {
            anomalyThreshold = 0.20;
        } else {
            anomalyThreshold = 0.35;
        }

        const isAnomaly = volumeToMarketCapRatio > anomalyThreshold;

        console.log("📍 Volume Anomaly Debug:", {
            symbol: coin.symbol,
            volume: (volume / 1000000).toFixed(1) + 'M',
            marketCap: (marketCap / 1000000).toFixed(1) + 'M',
            ratio: (volumeToMarketCapRatio * 100).toFixed(2) + '%',
            threshold: (anomalyThreshold * 100).toFixed(2) + '%',
            isAnomaly: isAnomaly
        });

        return isAnomaly;
    }

    static analyzeWithAI(realtimeData, historicalData) {
        const analysis = {
            market_sentiment: 'NEUTRAL',
            prediction_confidence: 0.7,
            top_opportunities: [],
            risk_level: 'MEDIUM',
            ai_insights: []
        };

        const priceChanges = Object.values(realtimeData).map(d => d.change || 0);
        const avgChange = priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length;

        if (avgChange > 2) analysis.market_sentiment = 'BULLISH';
        else if (avgChange < -2) analysis.market_sentiment = 'BEARISH';

        analysis.top_opportunities = Object.entries(realtimeData)
            .filter(([symbol, data]) => Math.abs(data.change || 0) > 3)
            .slice(0, 5)
            .map(([symbol, data]) => ({
                symbol,
                change: data.change,
                signal: data.change > 0 ? 'BUY' : 'SELL',
                confidence: Math.min(Math.abs(data.change) / 10, 0.9)
            }));

        return analysis;
    }
}

module.exports = TechnicalAnalysisEngine;
