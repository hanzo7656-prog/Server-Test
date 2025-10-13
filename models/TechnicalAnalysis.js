class TechnicalIndicators {
  constructor(data = {}) {
    // اندیکاتورهای موجود
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
    
    // اندیکاتورهای جدید
    this.ichimoku_conversion = data.ichimoku_conversion || 0;
    this.ichimoku_base = data.ichimoku_base || 0;
    this.ichimoku_span_a = data.ichimoku_span_a || 0;
    this.ichimoku_span_b = data.ichimoku_span_b || 0;
    this.parabolic_sar = data.parabolic_sar || 0;
    this.fibonacci_236 = data.fibonacci_236 || 0;
    this.fibonacci_382 = data.fibonacci_382 || 0;
    this.fibonacci_500 = data.fibonacci_500 || 0;
    this.fibonacci_618 = data.fibonacci_618 || 0;
    this.fibonacci_786 = data.fibonacci_786 || 0;
    this.vwap = data.vwap || 0;
    this.pivot_point = data.pivot_point || 0;
    this.pivot_r1 = data.pivot_r1 || 0;
    this.pivot_r2 = data.pivot_r2 || 0;
    this.pivot_s1 = data.pivot_s1 || 0;
    this.pivot_s2 = data.pivot_s2 || 0;
    this.awesome_oscillator = data.awesome_oscillator || 0;
    this.kdj_k = data.kdj_k || 50;
    this.kdj_d = data.kdj_d || 50;
    this.kdj_j = data.kdj_j || 50;
    this.ultimate_oscillator = data.ultimate_oscillator || 50;
    this.chaikin_oscillator = data.chaikin_oscillator || 0;
    this.volume_profile = data.volume_profile || 0;
    this.accumulation_distribution = data.accumulation_distribution || 0;
    this.zigzag = data.zigzag || 0;
    this.price_channel_upper = data.price_channel_upper || 0;
    this.price_channel_lower = data.price_channel_lower || 0;
    this.donchian_upper = data.donchian_upper || 0;
    this.donchian_lower = data.donchian_lower || 0;
    this.keltner_upper = data.keltner_upper || 0;
    this.keltner_lower = data.keltner_lower || 0;
    this.supertrend = data.supertrend || 0;
    
    // الگوهای جدید
    this.pattern_flag = data.pattern_flag || false;
    this.pattern_triangle_ascending = data.pattern_triangle_ascending || false;
    this.pattern_triangle_descending = data.pattern_triangle_descending || false;
    this.pattern_triangle_symmetrical = data.pattern_triangle_symmetrical || false;
    this.pattern_wedge_ascending = data.pattern_wedge_ascending || false;
    this.pattern_wedge_descending = data.pattern_wedge_descending || false;
    this.pattern_rectangle = data.pattern_rectangle || false;
    this.pattern_pennant = data.pattern_pennant || false;
    this.pattern_double_top = data.pattern_double_top || false;
    this.pattern_double_bottom = data.pattern_double_bottom || false;
    this.pattern_triple_top = data.pattern_triple_top || false;
    this.pattern_triple_bottom = data.pattern_triple_bottom || false;
    this.pattern_head_shoulders = data.pattern_head_shoulders || false;
    this.pattern_head_shoulders_inverse = data.pattern_head_shoulders_inverse || false;
    this.pattern_hammer = data.pattern_hammer || false;
    this.pattern_shooting_star = data.pattern_shooting_star || false;
    this.pattern_engulfing_bullish = data.pattern_engulfing_bullish || false;
    this.pattern_engulfing_bearish = data.pattern_engulfing_bearish || false;
    this.pattern_harami = data.pattern_harami || false;
    this.pattern_doji = data.pattern_doji || false;
    this.pattern_dark_cloud_cover = data.pattern_dark_cloud_cover || false;
    this.pattern_piercing_line = data.pattern_piercing_line || false;
    this.pattern_gartley = data.pattern_gartley || false;
    this.pattern_butterfly = data.pattern_butterfly || false;
    this.pattern_bat = data.pattern_bat || false;
    this.pattern_crab = data.pattern_crab || false;
  }
}

class TechnicalAnalysisEngine {
  
  static calculateAllIndicators(priceData) {
    if (!priceData || priceData.length < 20) {
      return new TechnicalIndicators();
    }

    const prices = priceData.map(p => p.price);
    const highs = priceData.map(p => p.high || p.price * 1.02);
    const lows = priceData.map(p => p.low || p.price * 0.98);
    const volumes = priceData.map(p => p.volume || 1);
    const opens = priceData.map(p => p.open || p.price * 0.99);

    return new TechnicalIndicators({
      // اندیکاتورهای موجود
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
      roc: this.calculateROC(prices),
      
      // اندیکاتورهای جدید
      ichimoku_conversion: this.calculateIchimoku(highs, lows).conversion,
      ichimoku_base: this.calculateIchimoku(highs, lows).base,
      ichimoku_span_a: this.calculateIchimoku(highs, lows).spanA,
      ichimoku_span_b: this.calculateIchimoku(highs, lows).spanB,
      parabolic_sar: this.calculateParabolicSAR(highs, lows),
      fibonacci_236: this.calculateFibonacci(prices).level_236,
      fibonacci_382: this.calculateFibonacci(prices).level_382,
      fibonacci_500: this.calculateFibonacci(prices).level_500,
      fibonacci_618: this.calculateFibonacci(prices).level_618,
      fibonacci_786: this.calculateFibonacci(prices).level_786,
      vwap: this.calculateVWAP(prices, volumes),
      pivot_point: this.calculatePivotPoints(highs, lows, opens).pivot,
      pivot_r1: this.calculatePivotPoints(highs, lows, opens).r1,
      pivot_r2: this.calculatePivotPoints(highs, lows, opens).r2,
      pivot_s1: this.calculatePivotPoints(highs, lows, opens).s1,
      pivot_s2: this.calculatePivotPoints(highs, lows, opens).s2,
      awesome_oscillator: this.calculateAwesomeOscillator(highs, lows),
      kdj_k: this.calculateKDJ(highs, lows, prices).k,
      kdj_d: this.calculateKDJ(highs, lows, prices).d,
      kdj_j: this.calculateKDJ(highs, lows, prices).j,
      ultimate_oscillator: this.calculateUltimateOscillator(highs, lows, prices),
      chaikin_oscillator: this.calculateChaikinOscillator(highs, lows, prices, volumes),
      volume_profile: this.calculateVolumeProfile(prices, volumes),
      accumulation_distribution: this.calculateAccumulationDistribution(highs, lows, prices, volumes),
      zigzag: this.calculateZigZag(prices),
      price_channel_upper: this.calculatePriceChannel(highs, lows).upper,
      price_channel_lower: this.calculatePriceChannel(highs, lows).lower,
      donchian_upper: this.calculateDonchianChannel(highs, lows).upper,
      donchian_lower: this.calculateDonchianChannel(highs, lows).lower,
      keltner_upper: this.calculateKeltnerChannel(highs, lows, prices).upper,
      keltner_lower: this.calculateKeltnerChannel(highs, lows, prices).lower,
      supertrend: this.calculateSuperTrend(highs, lows, prices),
      
      // الگوهای جدید
      pattern_flag: this.detectFlagPattern(prices),
      pattern_triangle_ascending: this.detectTriangleAscending(highs, lows),
      pattern_triangle_descending: this.detectTriangleDescending(highs, lows),
      pattern_triangle_symmetrical: this.detectTriangleSymmetrical(highs, lows),
      pattern_wedge_ascending: this.detectWedgeAscending(highs, lows),
      pattern_wedge_descending: this.detectWedgeDescending(highs, lows),
      pattern_rectangle: this.detectRectanglePattern(highs, lows),
      pattern_pennant: this.detectPennantPattern(prices),
      pattern_double_top: this.detectDoubleTop(highs),
      pattern_double_bottom: this.detectDoubleBottom(lows),
      pattern_triple_top: this.detectTripleTop(highs),
      pattern_triple_bottom: this.detectTripleBottom(lows),
      pattern_head_shoulders: this.detectHeadShoulders(highs),
      pattern_head_shoulders_inverse: this.detectInverseHeadShoulders(lows),
      pattern_hammer: this.detectHammer(opens, highs, lows, prices),
      pattern_shooting_star: this.detectShootingStar(opens, highs, lows, prices),
      pattern_engulfing_bullish: this.detectBullishEngulfing(opens, highs, lows, prices),
      pattern_engulfing_bearish: this.detectBearishEngulfing(opens, highs, lows, prices),
      pattern_harami: this.detectHarami(opens, highs, lows, prices),
      pattern_doji: this.detectDoji(opens, highs, lows, prices),
      pattern_dark_cloud_cover: this.detectDarkCloudCover(opens, highs, lows, prices),
      pattern_piercing_line: this.detectPiercingLine(opens, highs, lows, prices),
      pattern_gartley: this.detectGartleyPattern(prices),
      pattern_butterfly: this.detectButterflyPattern(prices),
      pattern_bat: this.detectBatPattern(prices),
      pattern_crab: this.detectCrabPattern(prices)
    });
  }

  // ========== متدهای موجود ==========
  
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

  static calculateATR(priceData) { 
    if (priceData.length < 2) return 0.1;
    let totalRange = 0;
    for (let i = 1; i < priceData.length; i++) {
      const high = priceData[i].high || priceData[i].price;
      const low = priceData[i].low || priceData[i].price;
      const prevClose = priceData[i-1].price;
      const trueRange = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      totalRange += trueRange;
    }
    return totalRange / (priceData.length - 1);
  }

  static calculateADX(priceData) { 
    return 25; // پیاده‌سازی ساده
  }

  static calculateOBV(prices, volumes) {
    return prices.reduce((obv, price, i) => {
      if (i == 0) return volumes[0];
      return obv + (price > prices[i-1] ? volumes[i] : -volumes[i]);
    }, 0);
  }

  static calculateMFI(priceData) { 
    return 50; // پیاده‌سازی ساده
  }

  static calculateWilliamsR(priceData) { 
    return -50; // پیاده‌سازی ساده
  }

  static calculateCCI(priceData) { 
    return 0; // پیاده‌سازی ساده
  }

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

    console.log("\nVolume Anomaly Input", {
      symbol: coin.symbol,
      volume: volume,
      marketCap: marketCap
    });

    if (!volume || !marketCap || marketCap == 1) {
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

    console.log("📊 Volume Anomaly Debug:", {
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

  // ========== اندیکاتورهای جدید ==========

  static calculateIchimoku(highs, lows, conversionPeriod = 9, basePeriod = 26, spanPeriod = 52) {
    if (highs.length < spanPeriod) return { conversion: 0, base: 0, spanA: 0, spanB: 0 };
    
    const conversion = (Math.max(...highs.slice(-conversionPeriod)) + Math.min(...lows.slice(-conversionPeriod))) / 2;
    const base = (Math.max(...highs.slice(-basePeriod)) + Math.min(...lows.slice(-basePeriod))) / 2;
    const spanA = (conversion + base) / 2;
    const spanB = (Math.max(...highs.slice(-spanPeriod)) + Math.min(...lows.slice(-spanPeriod))) / 2;
    
    return { conversion, base, spanA, spanB };
  }

  static calculateParabolicSAR(highs, lows, acceleration = 0.02, maximum = 0.2) {
    if (highs.length < 2) return 0;
    return (highs[highs.length - 1] + lows[lows.length - 1]) / 2;
  }

  static calculateFibonacci(prices) {
    if (prices.length < 2) return { level_236: 0, level_382: 0, level_500: 0, level_618: 0, level_786: 0 };
    
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const diff = high - low;
    
    return {
      level_236: high - (diff * 0.236),
      level_382: high - (diff * 0.382),
      level_500: high - (diff * 0.5),
      level_618: high - (diff * 0.618),
      level_786: high - (diff * 0.786)
    };
  }

  static calculateVWAP(prices, volumes) {
    if (prices.length === 0) return 0;
    let totalVolume = 0;
    let totalValue = 0;
    
    for (let i = 0; i < prices.length; i++) {
      totalValue += prices[i] * volumes[i];
      totalVolume += volumes[i];
    }
    
    return totalValue / totalVolume;
  }

  static calculatePivotPoints(highs, lows, opens) {
    if (highs.length === 0) return { pivot: 0, r1: 0, r2: 0, s1: 0, s2: 0 };
    
    const high = Math.max(...highs);
    const low = Math.min(...lows);
    const close = opens[opens.length - 1] || highs[highs.length - 1];
    
    const pivot = (high + low + close) / 3;
    const r1 = (2 * pivot) - low;
    const r2 = pivot + (high - low);
    const s1 = (2 * pivot) - high;
    const s2 = pivot - (high - low);
    
    return { pivot, r1, r2, s1, s2 };
  }

  static calculateAwesomeOscillator(highs, lows, fastPeriod = 5, slowPeriod = 34) {
    if (highs.length < slowPeriod) return 0;
    
    const fastMA = (this.calculateMA(highs, fastPeriod) + this.calculateMA(lows, fastPeriod)) / 2;
    const slowMA = (this.calculateMA(highs, slowPeriod) + this.calculateMA(lows, slowPeriod)) / 2;
    
    return fastMA - slowMA;
  }

  static calculateKDJ(highs, lows, closes, period = 9) {
    if (highs.length < period) return { k: 50, d: 50, j: 50 };
    
    const high = Math.max(...highs.slice(-period));
    const low = Math.min(...lows.slice(-period));
    const close = closes[closes.length - 1];
    
    const rsv = ((close - low) / (high - low)) * 100;
    const k = (rsv + 50) / 2; // ساده‌سازی
    const d = this.calculateMA([k], 3);
    const j = (3 * k) - (2 * d);
    
    return { k, d, j };
  }

  static calculateUltimateOscillator(highs, lows, closes, period1 = 7, period2 = 14, period3 = 28) {
    return 50; // پیاده‌سازی ساده
  }

  static calculateChaikinOscillator(highs, lows, closes, volumes) {
    return 0; // پیاده‌سازی ساده
  }

  static calculateVolumeProfile(prices, volumes) {
    return this.calculateVWAP(prices, volumes);
  }

  static calculateAccumulationDistribution(highs, lows, closes, volumes) {
    let ad = 0;
    for (let i = 0; i < closes.length; i++) {
      const mfm = ((closes[i] - lows[i]) - (highs[i] - closes[i])) / (highs[i] - lows[i]) || 0;
      ad += mfm * volumes[i];
    }
    return ad;
  }

  static calculateZigZag(prices, depth = 12) {
    if (prices.length < depth) return 0;
    return prices[prices.length - 1];
  }

  static calculatePriceChannel(highs, lows, period = 20) {
    if (highs.length < period) return { upper: 0, lower: 0 };
    return {
      upper: Math.max(...highs.slice(-period)),
      lower: Math.min(...lows.slice(-period))
    };
  }

  static calculateDonchianChannel(highs, lows, period = 20) {
    return this.calculatePriceChannel(highs, lows, period);
  }

  static calculateKeltnerChannel(highs, lows, closes, period = 20, multiplier = 2) {
    if (highs.length < period) return { upper: 0, lower: 0 };
    
    const ema = this.calculateEMA(closes, period);
    const atr = this.calculateATR(highs.map((h, i) => ({ high: h, low: lows[i], price: closes[i] })));
    
    return {
      upper: ema + (multiplier * atr),
      lower: ema - (multiplier * atr)
    };
  }

  static calculateSuperTrend(highs, lows, closes, period = 10, multiplier = 3) {
    if (highs.length < period) return 0;
    return (highs[highs.length - 1] + lows[lows.length - 1]) / 2;
  }

  // ========== الگوهای جدید ==========

  static detectFlagPattern(prices) {
    if (prices.length < 10) return false;
    const recent = prices.slice(-10);
    const variance = this.calculateStdDev(recent, this.calculateMA(recent, 10));
    return variance < (prices[prices.length - 1] * 0.02);
  }

  static detectTriangleAscending(highs, lows) {
    if (highs.length < 10) return false;
    const recentHighs = highs.slice(-10);
    const recentLows = lows.slice(-10);
    return Math.max(...recentHighs) - Math.min(...recentHighs) < Math.max(...recentLows) - Math.min(...recentLows);
  }

  static detectTriangleDescending(highs, lows) {
    if (highs.length < 10) return false;
    const recentHighs = highs.slice(-10);
    const recentLows = lows.slice(-10);
    return Math.max(...recentHighs) - Math.min(...recentHighs) > Math.max(...recentLows) - Math.min(...recentLows);
  }

  static detectTriangleSymmetrical(highs, lows) {
    if (highs.length < 10) return false;
    const recentHighs = highs.slice(-10);
    const recentLows = lows.slice(-10);
    const highRange = Math.max(...recentHighs) - Math.min(...recentHighs);
    const lowRange = Math.max(...recentLows) - Math.min(...recentLows);
    return Math.abs(highRange - lowRange) < (highRange * 0.1);
  }

  static detectWedgeAscending(highs, lows) {
    return this.detectTriangleAscending(highs, lows);
  }

  static detectWedgeDescending(highs, lows) {
    return this.detectTriangleDescending(highs, lows);
  }

  static detectRectanglePattern(highs, lows) {
    if (highs.length < 10) return false;
    const recentHighs = highs.slice(-10);
    const recentLows = lows.slice(-10);
    const highVariance = this.calculateStdDev(recentHighs, this.calculateMA(recentHighs, 10));
    const lowVariance = this.calculateStdDev(recentLows, this.calculateMA(recentLows, 10));
    return highVariance < (recentHighs[0] * 0.01) && lowVariance < (recentLows[0] * 0.01);
  }

  static detectPennantPattern(prices) {
    return this.detectFlagPattern(prices);
  }

  static detectDoubleTop(highs) {
    if (highs.length < 10) return false;
    const recent = highs.slice(-10);
    const max1 = Math.max(...recent.slice(0, 5));
    const max2 = Math.max(...recent.slice(5));
    return Math.abs(max1 - max2) < (max1 * 0.02);
  }

  static detectDoubleBottom(lows) {
    if (lows.length < 10) return false;
    const recent = lows.slice(-10);
    const min1 = Math.min(...recent.slice(0, 5));
    const min2 = Math.min(...recent.slice(5));
    return Math.abs(min1 - min2) < (min1 * 0.02);
  }

  static detectTripleTop(highs) {
    if (highs.length < 15) return false;
    const recent = highs.slice(-15);
    const max1 = Math.max(...recent.slice(0, 5));
    const max2 = Math.max(...recent.slice(5, 10));
    const max3 = Math.max(...recent.slice(10));
    return Math.abs(max1 - max2) < (max1 * 0.02) && Math.abs(max2 - max3) < (max1 * 0.02);
  }

  static detectTripleBottom(lows) {
    if (lows.length < 15) return false;
    const recent = lows.slice(-15);
    const min1 = Math.min(...recent.slice(0, 5));
    const min2 = Math.min(...recent.slice(5, 10));
    const min3 = Math.min(...recent.slice(10));
    return Math.abs(min1 - min2) < (min1 * 0.02) && Math.abs(min2 - min3) < (min1 * 0.02);
  }

  static detectHeadShoulders(highs) {
    if (highs.length < 10) return false;
    const recent = highs.slice(-10);
    // ساده‌سازی تشخیص الگو
    return recent[4] > recent[2] && recent[4] > recent[6] && recent[2] > recent[0] && recent[6] > recent[8];
  }

  static detectInverseHeadShoulders(lows) {
    if (lows.length < 10) return false;
    const recent = lows.slice(-10);
    // ساده‌سازی تشخیص الگو
    return recent[4] < recent[2] && recent[4] < recent[6] && recent[2] < recent[0] && recent[6] < recent[8];
  }

  static detectHammer(opens, highs, lows, closes) {
    if (opens.length < 1) return false;
    const i = opens.length - 1;
    const body = Math.abs(closes[i] - opens[i]);
    const lowerShadow = opens[i] - lows[i];
    const upperShadow = highs[i] - opens[i];
    return lowerShadow > (body * 2) && upperShadow < (body * 0.5);
  }

  static detectShootingStar(opens, highs, lows, closes) {
    if (opens.length < 1) return false;
    const i = opens.length - 1;
    const body = Math.abs(closes[i] - opens[i]);
    const lowerShadow = opens[i] - lows[i];
    const upperShadow = highs[i] - opens[i];
    return upperShadow > (body * 2) && lowerShadow < (body * 0.5);
  }

  static detectBullishEngulfing(opens, highs, lows, closes) {
    if (opens.length < 2) return false;
    const i = opens.length - 1;
    return closes[i] > opens[i] && opens[i] < closes[i-1] && closes[i] > opens[i-1];
  }

  static detectBearishEngulfing(opens, highs, lows, closes) {
    if (opens.length < 2) return false;
    const i = opens.length - 1;
    return closes[i] < opens[i] && opens[i] > closes[i-1] && closes[i] < opens[i-1];
  }

  static detectHarami(opens, highs, lows, closes) {
    if (opens.length < 2) return false;
    const i = opens.length - 1;
    return Math.abs(opens[i] - closes[i]) < Math.abs(opens[i-1] - closes[i-1]) * 0.5;
  }

  static detectDoji(opens, highs, lows, closes) {
    if (opens.length < 1) return false;
    const i = opens.length - 1;
    return Math.abs(closes[i] - opens[i]) < (highs[i] - lows[i]) * 0.1;
  }

  static detectDarkCloudCover(opens, highs, lows, closes) {
    if (opens.length < 2) return false;
    const i = opens.length - 1;
    return closes[i] < opens[i] && closes[i] > (opens[i-1] + closes[i-1]) / 2;
  }

  static detectPiercingLine(opens, highs, lows, closes) {
    if (opens.length < 2) return false;
    const i = opens.length - 1;
    return closes[i] > opens[i] && closes[i] < (opens[i-1] + closes[i-1]) / 2;
  }

  // قرار بگیرد detectGartleyPattern جای متد 
  static detectGartleyPattern(prices) {
    if (prices.length < 10) return false;
    
    // نقاط X, A, B, C, D
    const X = prices[prices.length - 10]; // نقطه شروع
    const A = prices[prices.length - 8];  // اولین سقف/کف
    const B = prices[prices.length - 6];  // اصلاح
    const C = prices[prices.length - 4];  // ادامه روند
    const D = prices[prices.length - 2];  // نقطه بازگشت
    
    const XA = Math.abs(A - X);
    const AB = Math.abs(B - A);
    const BC = Math.abs(C - B);
    const CD = Math.abs(D - C);
    
    // نسبت‌های فیبوناچی برای الگوی گارتلی
    const AB_ratio = AB / XA;
    const BC_ratio = BC / AB;
    const CD_ratio = CD / BC;
    
    // بررسی نسبت‌های استاندارد گارتلی
    const validAB = Math.abs(AB_ratio - 0.618) < 0.1;  // 0.618
    const validBC = Math.abs(BC_ratio - 0.382) < 0.1 || Math.abs(BC_ratio - 0.886) < 0.1;
    const validCD = Math.abs(CD_ratio - 1.272) < 0.1;  // 1.272
    
    return validAB && validBC && validCD;
  }

  // قرار بگیرد detectButterflyPattern جای متد 
  static detectButterflyPattern(prices) {
      if (prices.length < 10) return false;
    
      const X = prices[prices.length - 10];
      const A = prices[prices.length - 8];
      const B = prices[prices.length - 6];
      const C = prices[prices.length - 4];
      const D = prices[prices.length - 2];
    
      const XA = Math.abs(A - X);
      const AB = Math.abs(B - A);
      const BC = Math.abs(C - B);
      const CD = Math.abs(D - C);
    
      const AB_ratio = AB / XA;
      const BC_ratio = BC / AB;
      const CD_ratio = CD / BC;
     
      // نسبت‌های استاندارد باترفلای
      const validAB = Math.abs(AB_ratio - 0.786) < 0.1;
      const validBC = Math.abs(BC_ratio - 0.382) < 0.1 || Math.abs(BC_ratio - 0.886) < 0.1;
      const validCD = Math.abs(CD_ratio - 1.618) < 0.1 || Math.abs(CD_ratio - 2.618) < 0.1;
    
      return validAB && validBC && validCD;
  }

  // اضافه کنید TechnicalAnalysisEngine داخل کلاس 
  static detectThreeBlackCrows(opens, highs, lows, closes) {
      if (closes.length < 3) return false;
    
      const candle1 = closes[closes.length - 3] < opens[opens.length - 3];
      const candle2 = closes[closes.length - 2] < opens[opens.length - 2];
      const candle3 = closes[closes.length - 1] < opens[opens.length - 1];
    
      const body1 = opens[opens.length - 3] - closes[closes.length - 3];
      const body2 = opens[opens.length - 2] - closes[closes.length - 2];
      const body3 = opens[opens.length - 1] - closes[closes.length - 1];
    
      const consecutive = candle1 && candle2 && candle3;
      const increasing = body3 > body2 && body2 > body1;
      const smallShadows = 
          (highs[highs.length - 1] - opens[opens.length - 1]) < (body3 * 0.3) &&
          (closes[closes.length - 1] - lows[lows.length - 1]) < (body3 * 0.3);
    
      return consecutive && increasing && smallShadows;
  }

  // اضافه کنید TechnicalAnalysisEngine داخل کلاس 
  static detectCupAndHandle(prices, volumes, period = 30) {
      if (prices.length < period) return false;
    
      const recentPrices = prices.slice(-period);
      const recentVolumes = volumes.slice(-period);
    
      // پیدا کردن کف (کاپ)
      const minPrice = Math.min(...recentPrices);
      const minIndex = recentPrices.indexOf(minPrice);
    
      // بررسی شکل کاپ (U-shaped)
      const leftSide = recentPrices.slice(0, minIndex);
      const rightSide = recentPrices.slice(minIndex);
    
      const leftDecline = this.isMonotonicallyDecreasing(leftSide);
      const rightRise = this.isMonotonicallyIncreasing(rightSide);
    
      // بررسی هندل (اصلاح کوچک)
      const handleStart = Math.floor(rightSide.length * 0.7);
      const handle = rightSide.slice(handleStart);
      const handleDecline = this.isMonotonicallyDecreasing(handle) && 
                           Math.max(...handle) - Math.min(...handle) < (minPrice * 0.1);
    
      // بررسی حجم در شکست
      const volumeIncrease = recentVolumes[recentVolumes.length - 1] > 
                            recentVolumes.slice(-5).reduce((a, b) => a + b) / 5;
    
      return leftDecline && rightRise && handleDecline && volumeIncrease;
  }

  // توابع کمکی
  static isMonotonicallyIncreasing(arr) {
      for (let i = 1; i < arr.length; i++) {
          if (arr[i] < arr[i - 1]) return false;
      }
      return true;
  }

static isMonotonicallyDecreasing(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > arr[i - 1]) return false;
    }
    return true;
}
module.exports = TechnicalAnalysisEngine;
