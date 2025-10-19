class TechnicalIndicators {
    constructor(data = {}) {
        this.rsi = data.rsi || 50;
        this.macd = data.macd || 0;
        this.macd_signal = data.macd_signal || 0;
        this.macd_hist = data.macd_hist || 0;
        this.moving_avg_20 = data.moving_avg_20 || 0;
        this.moving_avg_50 = data.moving_avg_50 || 0;
        this.moving_avg_200 = data.moving_avg_200 || 0;
        this.bollinger_upper = data.bollinger_upper || 0;
        this.bollinger_middle = data.bollinger_middle || 0;
        this.bollinger_lower = data.bollinger_lower || 0;
    }

    toJSON() {
        return {
            rsi: this.rsi,
            macd: this.macd,
            macd_signal: this.macd_signal,
            macd_hist: this.macd_hist,
            moving_avg_20: this.moving_avg_20,
            moving_avg_50: this.moving_avg_50,
            moving_avg_200: this.moving_avg_200,
            bollinger_upper: this.bollinger_upper,
            bollinger_middle: this.bollinger_middle,
            bollinger_lower: this.bollinger_lower
        };
    }
}

class TechnicalAnalysisEngine {
    
    /**
     * محاسبه تمام اندیکاتورهای ساده
     */
    static calculateAllIndicators(priceData) {
        if (!priceData || priceData.length < 50) {
            return new TechnicalIndicators();
        }

        const prices = priceData.map(p => p.price || p);

        return new TechnicalIndicators({
            rsi: this.calculateRSI(prices),
            ...this.calculateMACD(prices),
            moving_avg_20: this.calculateMA(prices, 20),
            moving_avg_50: this.calculateMA(prices, 50),
            moving_avg_200: this.calculateMA(prices, 200),
            ...this.calculateBollingerBands(prices)
        });
    }

    /**
     * محاسبه RSI
     */
    static calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const difference = prices[i] - prices[i - 1];
            if (difference >= 0) {
                gains += difference;
            } else {
                losses -= difference;
            }
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;

        if (avgLoss === 0) return 100;

        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    /**
     * محاسبه MACD
     */
    static calculateMACD(prices) {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macd = ema12 - ema26;
        const signal = this.calculateEMA([macd], 9);
        const histogram = macd - signal;

        return { macd, macd_signal: signal, macd_hist: histogram };
    }

    /**
     * محاسبه میانگین متحرک نمایی (EMA)
     */
    static calculateEMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1] || 0;

        const multiplier = 2 / (period + 1);
        let ema = prices[0];

        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }

        return ema;
    }

    /**
     * محاسبه میانگین متحرک ساده (MA)
     */
    static calculateMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1] || 0;
        
        const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }

    /**
     * محاسبه بولینگر باند
     */
    static calculateBollingerBands(prices, period = 20) {
        const ma = this.calculateMA(prices, period);
        const stdDev = this.calculateStdDev(prices.slice(-period), ma);

        return {
            bollinger_upper: ma + (stdDev * 2),
            bollinger_middle: ma,
            bollinger_lower: ma - (stdDev * 2)
        };
    }

    /**
     * محاسبه انحراف معیار
     */
    static calculateStdDev(values, mean) {
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * محاسبه سطوح حمایت و مقاومت
     */
    static calculateSupportResistance(priceData) {
        const prices = priceData.map(p => p.price || p);
        const high = Math.max(...prices);
        const low = Math.min(...prices);
        const current = prices[prices.length - 1];

        return {
            support: [low * 0.98, low * 0.95],
            resistance: [high * 1.02, high * 1.05],
            current_price: current
        };
    }

    /**
     * تولید سیگنال‌های معاملاتی
     */
    static generateTradingSignals(indicators, priceData) {
        const signals = [];
        const currentPrice = priceData[priceData.length - 1]?.price || priceData[priceData.length - 1] || 0;

        // سیگنال RSI
        if (indicators.rsi < 30) {
            signals.push('RSI_OVERSOLD');
        } else if (indicators.rsi > 70) {
            signals.push('RSI_OVERBOUGHT');
        }

        // سیگنال MACD
        if (indicators.macd > indicators.macd_signal && indicators.macd_hist > 0) {
            signals.push('MACD_BULLISH_CROSSOVER');
        } else if (indicators.macd < indicators.macd_signal && indicators.macd_hist < 0) {
            signals.push('MACD_BEARISH_CROSSOVER');
        }

        // سیگنال میانگین متحرک
        if (currentPrice > indicators.moving_avg_20 && indicators.moving_avg_20 > indicators.moving_avg_50) {
            signals.push('TREND_BULLISH');
        } else if (currentPrice < indicators.moving_avg_20 && indicators.moving_avg_20 < indicators.moving_avg_50) {
            signals.push('TREND_BEARISH');
        }

        // سیگنال بولینگر باند
        if (currentPrice < indicators.bollinger_lower) {
            signals.push('BOLLINGER_OVERSOLD');
        } else if (currentPrice > indicators.bollinger_upper) {
            signals.push('BOLLINGER_OVERBOUGHT');
        }

        return {
            buy_signals: signals.filter(s => s.includes('BULLISH') || s.includes('OVERSOLD')),
            sell_signals: signals.filter(s => s.includes('BEARISH') || s.includes('OVERBOUGHT')),
            neutral_signals: signals.filter(s => !s.includes('BULLISH') && !s.includes('BEARISH')),
            all_signals: signals,
            signal_strength: this.calculateSignalStrength(indicators, signals)
        };
    }

    /**
     * محاسبه قدرت سیگنال
     */
    static calculateSignalStrength(indicators, signals) {
        let strength = 0;

        // قدرت بر اساس تعداد سیگنال‌ها
        strength += Math.min(signals.all_signals.length * 0.1, 0.5);

        // قدرت بر اساس RSI شدید
        if (indicators.rsi < 20 || indicators.rsi > 80) {
            strength += 0.3;
        }

        // قدرت بر اساس MACD قوی
        if (Math.abs(indicators.macd_hist) > 0.5) {
            strength += 0.2;
        }

        return Math.min(strength, 1.0);
    }

    /**
     * تحلیل روند
     */
    static analyzeTrend(indicators, priceData) {
        const prices = priceData.map(p => p.price || p);
        const currentPrice = prices[prices.length - 1];
        const ma20 = indicators.moving_avg_20;
        const ma50 = indicators.moving_avg_50;

        let trend = 'NEUTRAL';
        let strength = 0;

        if (currentPrice > ma20 && ma20 > ma50) {
            trend = 'BULLISH';
            strength = 0.8;
        } else if (currentPrice < ma20 && ma20 < ma50) {
            trend = 'BEARISH';
            strength = 0.8;
        } else if (currentPrice > ma20) {
            trend = 'BULLISH';
            strength = 0.5;
        } else if (currentPrice < ma20) {
            trend = 'BEARISH';
            strength = 0.5;
        }

        return {
            trend,
            strength,
            moving_averages: {
                above_20: currentPrice > ma20,
                above_50: currentPrice > ma50,
                ma20_above_ma50: ma20 > ma50
            }
        };
    }
}

module.exports = {
    TechnicalAnalysisEngine,
    TechnicalIndicators
};
