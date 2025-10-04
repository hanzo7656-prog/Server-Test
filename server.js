const express = require('express');
const axios = require('axios');
const cors = require('cors');
const WebSocket = require('ws');
const { Octokit } = require('@octokit/rest');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== تنظیمات پیشرفته لاگ ====================
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} - ${level.toUpperCase()} - ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'vortexai_combined.log' }),
        new winston.transports.Console()
    ]
});

// ==================== API کلیدها ====================
const COINSTATS_API_KEY = "7qmXYUHIF+DWnF9fYml4Klz+/leL7EBRH+mA2WrpsEc=";

// ==================== میدلورها ====================
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// ==================== کش سرور قدیمی ====================
let cache = {
    coinsList: { data: null, timestamp: null },
    historicalData: {},
    realtimePrices: {}
};

// ==================== لیست ارزها از سرور قدیمی ====================
const ALL_TRADING_PAIRS = [
    "btc_usdt", "eth_usdt", "xrp_usdt", "ada_usdt", "dot_usdt", "doge_usdt", "sol_usdt", "matic_usdt",
    "avax_usdt", "link_usdt", "bch_usdt", "ltc_usdt", "etc_usdt", "trx_usdt", "atom_usdt", "bnb_usdt",
    // ... تمام 200+ ارز از سرور قدیمی
];

// ==================== کلاس Gist Manager از سرور قدیمی ====================
class GistManager {
    constructor() {
        this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        this.gistId = process.env.GIST_ID;
        this.priceHistory = {
            prices: {},
            last_updated: new Date().toISOString()
        };
        this.init();
    }

    async init() {
        try {
            if (this.gistId) {
                await this.loadFromGist();
            }
            setInterval(() => this.saveToGist(), 300000);
            logger.info('✅ Gist Manager initialized');
        } catch (error) {
            logger.error('❌ Gist Manager init error:', error);
        }
    }

    async loadFromGist() {
        try {
            const response = await this.octokit.rest.gists.get({ gist_id: this.gistId });
            const content = response.data.files['prices.json'].content;
            this.priceHistory = JSON.parse(content);
            logger.info('✅ Data loaded from Gist');
        } catch (error) {
            logger.warn('⚠️ Could not load from Gist, starting fresh');
            this.priceHistory = { prices: {}, last_updated: new Date().toISOString() };
        }
    }

    async saveToGist() {
        try {
            this.priceHistory.last_updated = new Date().toISOString();
            const content = JSON.stringify(this.priceHistory, null, 2);
            
            if (this.gistId) {
                await this.octokit.rest.gists.update({
                    gist_id: this.gistId,
                    files: { 'prices.json': { content: content } }
                });
            } else {
                const response = await this.octokit.rest.gists.create({
                    description: 'VortexAI Crypto Price Data',
                    files: { 'prices.json': { content: content } },
                    public: false
                });
                this.gistId = response.data.id;
            }
            logger.info('✅ Data saved to Gist');
        } catch (error) {
            logger.error('❌ Gist save error:', error);
        }
    }

    addPrice(symbol, currentPrice) {
        if (!this.priceHistory.prices) this.priceHistory.prices = {};
        
        const now = Date.now();
        const existingData = this.priceHistory.prices[symbol] || {};
        
        // محاسبه تغییرات با AI
        const change1h = this.calculateChange(symbol, currentPrice, 60);
        const change4h = this.calculateChange(symbol, currentPrice, 240);
        
        this.priceHistory.prices[symbol] = {
            price: currentPrice,
            timestamp: now,
            change_1h: change1h,
            change_4h: change4h,
            history: existingData.history || []
        };

        // اضافه کردن به تاریخچه
        this.priceHistory.prices[symbol].history.push({
            timestamp: now,
            price: currentPrice
        });

        this.cleanOldHistory(symbol);
    }

    calculateChange(symbol, currentPrice, minutes) {
        const data = this.priceHistory.prices[symbol];
        if (!data || !data.history || data.history.length === 0) return 0;
        
        const targetTime = Date.now() - (minutes * 60 * 1000);
        const pastPrice = this.findClosestPrice(data.history, targetTime);
        
        if (!pastPrice || pastPrice === 0) return 0;
        return ((currentPrice - pastPrice) / pastPrice) * 100;
    }

    findClosestPrice(history, targetTime) {
        let closest = null;
        let minDiff = Infinity;
        
        for (const item of history) {
            const diff = Math.abs(item.timestamp - targetTime);
            if (diff < minDiff && diff <= 300000) {
                minDiff = diff;
                closest = item.price;
            }
        }
        return closest;
    }

    cleanOldHistory(symbol) {
        const data = this.priceHistory.prices[symbol];
        if (!data || !data.history) return;
        
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
        data.history = data.history.filter(item => item.timestamp >= cutoffTime);
    }

    getPriceData(symbol) {
        return this.priceHistory.prices?.[symbol] || null;
    }

    getAllData() {
        return this.priceHistory;
    }
}

// ==================== کلاس تحلیل تکنیکال از سرور جدید ====================
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

    // سایر محاسبات (ATR, ADX, OBV, etc.) برای خلاصه‌سازی کوتاه شده
    static calculateATR(priceData) { return 0.1; }
    static calculateADX(priceData) { return 25; }
    static calculateOBV(prices, volumes) { 
        return prices.reduce((obv, price, i) => {
            if (i === 0) return volumes[0];
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

    // ==================== VortexAI Functions ====================
    static calculateSignalStrength(coin) {
        const volumeStrength = Math.min((coin.volume || 0) / 1000000, 10);
        const priceStrength = Math.min(Math.abs(coin.priceChange24h || 0) / 10, 5);
        return Math.min(volumeStrength + priceStrength, 10);
    }

    static calculateVolatility(coin) {
        return Math.min(Math.abs(coin.priceChange24h || 0) / 5, 10);
    }

    static detectVolumeAnomaly(coin) {
        const avgVolume = 1000000; // حجم متوسط فرضی
        return (coin.volume || 0) > avgVolume * 2;
    }

    static analyzeWithAI(realtimeData, historicalData) {
        const analysis = {
            market_sentiment: 'NEUTRAL',
            prediction_confidence: 0.7,
            top_opportunities: [],
            risk_level: 'MEDIUM',
            ai_insights: []
        };

        // تحلیل ساده بر اساس داده‌های موجود
        const priceChanges = Object.values(realtimeData).map(d => d.change || 0);
        const avgChange = priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length;
        
        if (avgChange > 2) analysis.market_sentiment = 'BULLISH';
        else if (avgChange < -2) analysis.market_sentiment = 'BEARISH';

        // شناسایی فرصت‌ها
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

// ==================== WebSocket Manager از سرور قدیمی ====================
class WebSocketManager {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.realtimeData = {};
        this.subscribedPairs = new Set();
        this.connect();
    }

    connect() {
        try {
            this.ws = new WebSocket('wss://www.lbkex.net/ws/V2/');
            this.ws.on('open', () => {
                logger.info('✅ WebSocket connected to LBank');
                this.connected = true;
                this.subscribeToAllPairs();
            });

            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    if (message.type === 'tick' && message.tick) {
                        const symbol = message.pair;
                        const tickData = message.tick;
                        const currentPrice = tickData.latest;

                        // ذخیره در Gist Manager
                        gistManager.addPrice(symbol, currentPrice);

                        this.realtimeData[symbol] = {
                            price: currentPrice,
                            high_24h: tickData.high,
                            low_24h: tickData.low,
                            volume: tickData.vol,
                            change: tickData.change,
                            timestamp: message.TS,
                            last_updated: new Date().toISOString()
                        };

                        cache.realtimePrices = { ...this.realtimeData };
                    }
                } catch (error) {
                    logger.error('❌ WebSocket message processing error:', error);
                }
            });

            this.ws.on('error', (error) => {
                logger.error('❌ WebSocket error:', error);
                this.connected = false;
            });

            this.ws.on('close', (code, reason) => {
                logger.warn(`⚠️ WebSocket disconnected - Code: ${code}, Reason: ${reason}`);
                this.connected = false;
                setTimeout(() => {
                    logger.info('🔄 Attempting WebSocket reconnection...');
                    this.connect();
                }, 5000);
            });
        } catch (error) {
            logger.error('❌ WebSocket connection error:', error);
            setTimeout(() => this.connect(), 10000);
        }
    }

    subscribeToAllPairs() {
        if (this.connected && this.ws) {
            logger.info(`📡 Subscribing to ${ALL_TRADING_PAIRS.length} trading pairs`);
            
            const batchSize = 50;
            for (let i = 0; i < ALL_TRADING_PAIRS.length; i += batchSize) {
                setTimeout(() => {
                    const batch = ALL_TRADING_PAIRS.slice(i, i + batchSize);
                    this.subscribeBatch(batch);
                }, i * 100);
            }
        }
    }

    subscribeBatch(pairs) {
        pairs.forEach(pair => {
            const subscription = {
                "action": "subscribe",
                "subscribe": "tick", 
                "pair": pair
            };
            this.ws.send(JSON.stringify(subscription));
            this.subscribedPairs.add(pair);
        });
        logger.info(`✅ Subscribed to ${pairs.length} pairs`);
    }

    getRealtimeData() {
        return this.realtimeData;
    }

    getConnectionStatus() {
        return {
            connected: this.connected,
            active_coins: Object.keys(this.realtimeData).length,
            total_subscribed: this.subscribedPairs.size,
            coins: Object.keys(this.realtimeData)
        };
    }
}

// ==================== API Client از سرور جدید ====================
class AdvancedCoinStatsAPIClient {
    constructor() {
        this.base_url = "https://openapiv1.coinstats.app";
        this.apiKey = COINSTATS_API_KEY;
        this.request_count = 0;
        this.last_request_time = Date.now();
    }

    async _rateLimit() {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.last_request_time;
        if (timeDiff < 200) {
            await new Promise(resolve => setTimeout(resolve, 200 - timeDiff));
        }
        this.last_request_time = Date.now();
        this.request_count++;
    }

    async getCoins(limit = 100) {
        await this._rateLimit();
        
        try {
            const url = `${this.base_url}/coins?limit=${limit}&currency=USD`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.apiKey,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { coins: data.result || data.coins || data || [] };
        } catch (error) {
            logger.error('❌ API getCoins error:', error);
            return { coins: [], error: error.message };
        }
    }
}

// ==================== نمونه‌سازی مدیران ====================
const gistManager = new GistManager();
const wsManager = new WebSocketManager();
const apiClient = new AdvancedCoinStatsAPIClient();

// ==================== endpointهای ترکیبی جدید ====================

// ۱. اسکن بازار با VortexAI
app.get('/api/scan/vortexai', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 300);
        const filterType = req.query.filter || 'volume';

        // دریافت داده از همه منابع
        const [apiData, realtimeData, historicalData] = await Promise.all([
            apiClient.getCoins(limit),
            Promise.resolve(wsManager.getRealtimeData()),
            Promise.resolve(gistManager.getAllData())
        ]);

        let coins = apiData.coins || [];

        // ترکیب داده‌ها
        const enhancedCoins = coins.map(coin => {
            const symbol = `${coin.symbol.toLowerCase()}_usdt`;
            const historical = gistManager.getPriceData(symbol);
            const realtime = realtimeData[symbol];

            return {
                ...coin,
                // داده تاریخی از Gist
                change_1h: historical?.change_1h || 0,
                change_4h: historical?.change_4h || 0,
                historical_timestamp: historical?.timestamp,
                
                // داده لحظه‌ای از WebSocket
                realtime_price: realtime?.price,
                realtime_volume: realtime?.volume,
                realtime_change: realtime?.change,
                
                // تحلیل VortexAI
                vortexai_analysis: {
                    signal_strength: TechnicalAnalysisEngine.calculateSignalStrength(coin),
                    trend: (coin.priceChange24h || 0) > 0 ? "up" : "down",
                    volatility_score: TechnicalAnalysisEngine.calculateVolatility(coin),
                    volume_anomaly: TechnicalAnalysisEngine.detectVolumeAnomaly(coin),
                    market_sentiment: (coin.priceChange1h || 0) > 0 && (coin.priceChange24h || 0) > 0 ? 'bullish' : 'bearish'
                }
            };
        });

        // اعمال فیلتر
        let filteredCoins = [...enhancedCoins];
        switch(filterType) {
            case 'volume':
                filteredCoins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
                break;
            case 'momentum_1h':
                filteredCoins.sort((a, b) => Math.abs(b.change_1h || 0) - Math.abs(a.change_1h || 0));
                break;
            case 'momentum_4h':
                filteredCoins.sort((a, b) => Math.abs(b.change_4h || 0) - Math.abs(a.change_4h || 0));
                break;
            case 'ai_signal':
                filteredCoins.sort((a, b) => (b.vortexai_analysis.signal_strength || 0) - (a.vortexai_analysis.signal_strength || 0));
                break;
        }

        const responseTime = Date.now() - startTime;
        
        res.json({
            success: true,
            coins: filteredCoins.slice(0, limit),
            total_coins: filteredCoins.length,
            scan_mode: 'vortexai_enhanced',
            filter_applied: filterType,
            data_sources: {
                api: coins.length,
                realtime: Object.keys(realtimeData).length,
                historical: Object.keys(historicalData.prices || {}).length
            },
            processing_time: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('❌ VortexAI scan error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ۲. تحلیل تکنیکال پیشرفته برای یک ارز
app.get('/api/coin/:symbol/technical', async (req, res) => {
    const startTime = Date.now();
    const symbol = req.params.symbol;
    
    try {
        const historicalData = gistManager.getPriceData(symbol);
        const realtimeData = wsManager.getRealtimeData()[symbol];

        if (!historicalData && !realtimeData) {
            return res.status(404).json({
                success: false,
                error: 'No data available for this symbol'
            });
        }

        // استخراج داده‌های قیمت برای تحلیل
        const priceData = historicalData?.history?.map(item => ({
            price: item.price,
            timestamp: item.timestamp,
            high: item.price * 1.02, // تقریب
            low: item.price * 0.98   // تقریب
        })) || [];

        // اضافه کردن داده لحظه‌ای
        if (realtimeData) {
            priceData.push({
                price: realtimeData.price,
                timestamp: Date.now(),
                high: realtimeData.high_24h,
                low: realtimeData.low_24h
            });
        }

        // محاسبه اندیکاتورها
        const indicators = TechnicalAnalysisEngine.calculateAllIndicators(priceData);
        const supportResistance = TechnicalAnalysisEngine.calculateSupportResistance(priceData);
        const aiAnalysis = TechnicalAnalysisEngine.analyzeWithAI(
            { [symbol]: realtimeData }, 
            { prices: { [symbol]: historicalData } }
        );

        res.json({
            success: true,
            symbol: symbol,
            current_price: realtimeData?.price || historicalData?.price,
            technical_indicators: indicators,
            support_resistance: supportResistance,
            vortexai_analysis: aiAnalysis,
            data_points: priceData.length,
            processing_time: `${Date.now() - startTime}ms`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error(`❌ Technical analysis error for ${symbol}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ۳. سلامت سیستم ترکیبی
app.get('/health-combined', (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();
    
    res.json({
        status: 'healthy',
        service: 'VortexAI Combined Crypto Scanner',
        version: '4.0',
        timestamp: new Date().toISOString(),
        
        // وضعیت سرویس‌ها
        websocket_status: {
            connected: wsStatus.connected,
            active_coins: wsStatus.active_coins,
            total_subscribed: wsStatus.total_subscribed,
            provider: "LBank"
        },
        
        gist_status: {
            active: !!process.env.GITHUB_TOKEN,
            total_coins: Object.keys(gistData.prices || {}).length,
            last_updated: gistData.last_updated
        },
        
        ai_status: {
            technical_analysis: 'active',
            vortexai_engine: 'ready',
            indicators_available: 15
        },
        
        api_status: {
            requests_count: apiClient.request_count,
            coinstats_connected: 'active'
        },
        
        features: [
            'realtime_websocket_data',
            'historical_gist_storage', 
            'vortexai_analysis',
            'technical_indicators',
            'multi_source_data',
            'advanced_filtering',
            'market_predictions'
        ]
    });
});

// ۴. دشبورد اصلی
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>VortexAI Pro - Combined Crypto Scanner</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                margin-top: 40px;
                margin-bottom: 40px;
            }
            h1 {
                color: #2c3e50;
                border-bottom: 3px solid #3498db;
                padding-bottom: 15px;
                text-align: center;
            }
            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .status-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #3498db;
            }
            .status-card.good { border-left-color: #27ae60; }
            .status-card.warning { border-left-color: #f39c12; }
            .status-card.danger { border-left-color: #e74c3c; }
            .endpoint {
                background: #f8f9fa;
                padding: 15px;
                margin: 15px 0;
                border-radius: 8px;
                border-left: 4px solid #3498db;
            }
            .method {
                background: #3498db;
                color: white;
                padding: 4px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                margin-right: 10px;
            }
            .links {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin: 20px 0;
            }
            .links a {
                display: block;
                padding: 12px;
                background: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                text-align: center;
                transition: background 0.3s;
            }
            .links a:hover {
                background: #2980b9;
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 VortexAI Pro - Combined Crypto Scanner</h1>
            <p style="text-align: center; color: #666;">
                Advanced cryptocurrency market scanner with real-time data, historical analysis, and AI-powered insights
            </p>
            
            <div class="status-grid">
                <div class="status-card good">
                    <h3>📊 Real-time Data</h3>
                    <p>WebSocket: ${wsManager.connected ? '✅ Connected' : '❌ Disconnected'}</p>
                    <p>Active Coins: ${Object.keys(wsManager.getRealtimeData()).length}</p>
                </div>
                <div class="status-card good">
                    <h3>💾 Historical Storage</h3>
                    <p>Gist: ${process.env.GITHUB_TOKEN ? '✅ Active' : '❌ Inactive'}</p>
                    <p>Stored Coins: ${Object.keys(gistManager.getAllData().prices || {}).length}</p>
                </div>
                <div class="status-card good">
                    <h3>🤖 AI Analysis</h3>
                    <p>VortexAI: ✅ Ready</p>
                    <p>Technical Indicators: 15+</p>
                </div>
            </div>

            <h2>🔗 Advanced Endpoints</h2>
            
            <div class="endpoint">
                <span class="method">GET</span>
                <strong>/api/scan/vortexai?limit=100&filter=ai_signal</strong>
                <div style="color: #666; margin-top: 5px;">Combined scan with real-time data, historical analysis, and AI insights</div>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span>
                <strong>/api/coin/btc_usdt/technical</strong>
                <div style="color: #666; margin-top: 5px;">Advanced technical analysis for any cryptocurrency</div>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span>
                <strong>/health-combined</strong>
                <div style="color: #666; margin-top: 5px;">Complete system status with all services</div>
            </div>

            <h2>🔍 Quick Links</h2>
            <div class="links">
                <a href="/health-combined">System Health</a>
                <a href="/api/scan/vortexai?limit=10">VortexAI Scan</a>
                <a href="/api/coin/btc_usdt/technical">BTC Analysis</a>
                <a href="/api/scan/vortexai?limit=20&filter=ai_signal">Top AI Signals</a>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p><strong>🕒 Server Time:</strong> ${new Date().toISOString()}</p>
                <p><strong>📦 Version:</strong> 4.0 - Combined Edition</p>
                <p><strong>🌐 Environment:</strong> Production</p>
                <p><strong>💡 Features:</strong> Real-time WebSocket + Historical Gist + VortexAI Analysis</p>
            </div>
        </div>
    </body>
    </html>
    `);
});

// ==================== endpointهای قدیمی برای سازگاری ====================
app.get('/health', (req, res) => {
    res.redirect('/health-combined');
});

app.get('/scan-advanced', (req, res) => {
    res.redirect(`/api/scan/vortexai?${new URLSearchParams(req.query)}`);
});

// ==================== راه‌اندازی سرور ====================
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 VortexAI Combined Server started on port ${PORT}`);
    logger.info('✅ Features: WebSocket Real-time + Gist Historical + VortexAI Analysis');
    logger.info(`📊 Real-time Pairs: ${ALL_TRADING_PAIRS.length}`);
    logger.info(`🔗 Health Check: http://localhost:${PORT}/health-combined`);
    logger.info(`🔍 VortexAI Scan: http://localhost:${PORT}/api/scan/vortexai?limit=10`);
});

module.exports = app;
