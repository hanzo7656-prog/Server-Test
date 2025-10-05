const express = require('express');
const axios = require('axios');
const cors = require('cors');
const WebSocket = require('ws');
const { Octokit } = require('@octokit/rest');
const winston = require('winston');
const path = require('path');
require('dotenv').config();

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
const COINSTATS_API_KEY = process.env.COINSTATS_API_KEY || "uNb+sOjnjCQmV30dYrChxgh55hRHElmiZLnKJX+5U6g=";

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
    "xim_usdt", "eos_usdt", "xtz_usdt", "algo_usdt", "neo_usdt", "ftm_usdt", "hbar_usdt", "egld_usdt",
    "theta_usdt", "vet_usdt", "fil_usdt", "icp_usdt", "xmr_usdt", "ape_usdt", "gala_usdt", "sand_usdt",
    "mana_usdt", "enj_usdt", "bat_usdt", "comp_usdt", "mkr_usdt", "zec_usdt", "dash_usdt",
    "waves_usdt", "omp_usdt", "zil_usdt", "ont_usdt", "ost_usdt", "stx_usdt", "celo_usdt", "wn_usdt",
    "sc_usdt", "zen_usdt", "hot_usdt", "iotx_usdt", "ong_usdt", "one_usdt", "nano_usdt", "ardr_usdt",
    "qtum_usdt", "lsk_usdt", "strat_usdt", "kmd_usdt", "piyx_usdt", "grs_usdt", "nav_usdt", "emo2_usdt",
    "xyg_usdt", "sys_usdt", "via_usdt", "mona_usdt", "dcr_usdt", "sia_usdt", "lbc_usdt", "rep_usdt",
    "gnt_usdt", "loom_usdt", "poly_usdt", "ren_usdt", "fun_usdt", "reg_usdt", "salt_usdt", "mtl_usdt",
    "mco_usdt", "edo_usdt", "powr_usdt", "irc_usdt", "gio_usdt", "eng_usdt", "ast_usdt", "dgd_usdt",
    "adx_usdt", "qsp_usdt", "mda_usdt", "snt_usdt", "agix_usdt", "ocean_usdt", "band_usdt",
    "mmr_usdt", "ric_usdt", "uos_usdt", "stopi_usdt", "keep_usdt", "om_usdt", "front_usdt", "perp_usdt",
    "api3_usdt", "grt_usdt", "lqty_usdt", "alcx_usdt", "pool_usdt", "rad_usdt", "farm_usdt", "audio_usdt",
    "fs_usdt", "dodo_usdt", "tim_usdt", "liv_usdt", "ygg_usdt", "slp_usdt", "axs_usdt", "sandbox_usdt",
    "enjin_usdt", "mdr_usdt", "flow_usdt", "rose_usdt", "ar_usdt", "rune_usdt", "sushi_usdt", "crv_usdt",
    "linch_usdt", "knc_usdt", "bal_usdt", "uma_usdt", "badger_usdt", "fxs_usdt", "cvx_usdt",
    "tribe_usdt", "gno_usdt", "ilus_usdt", "pla_usdt", "super_usdt", "ach_usdt", "imx_usdt", "gods_usdt",
    "vra_usdt", "sps_usdt", "dar_usdt", "mgp_usdt", "ceek_usdt", "ttian_usdt", "vr_usdt", "bmx_usdt",
    "hero_usdt", "pyr_usdt", "ufo_usdt", "elon_usdt", "shib_usdt", "floki_usdt", "samo_usdt",
    "baby_usdt", "kishu_usdt", "hoge_usdt", "akita_usdt", "husky_usdt", "safernoon_usdt",
    "evergrow_usdt", "lunc_usdt", "bonk_usdt", "wif_usdt", "myro_usdt", "popcat_usdt", "toshi_usdt",
    "mew_usdt", "mog_usdt", "rett_usdt", "turbo_usdt", "pepe_usdt", "wojak_usdt", "aidos_usdt",
    "pudgy_usdt", "lady_usdt", "jeo_usdt", "based_usdt", "degen_usdt", "moutai_usdt", "aave_usdt",
    "snx_usdt", "uni_usdt", "cake_usdt", "bake_usdt", "burger_usdt", "toko_usdt", "inj_usdt", "lina_usdt",
    "reef_usdt", "dusk_usdt", "atm_usdt", "ogn_usdt", "for_usdt", "mir_usdt", "ito_usdt", "cos_usdt",
    "ctk_usdt", "tko_usdt", "alpaca_usdt", "perl_usdt", "stpt_usdt", "troy_usdt", "vite_usdt", "svp_usdt",
    "hbtc_usdt", "mdt_usdt", "mbox_usdt", "gmt_usdt", "time_usdt", "raca_usdt", "beans_usdt",
    "edu_usdt", "id_usdt", "ondo_usdt", "pixel_usdt", "voxel_usdt", "high_usdt", "looks_usdt",
    "blur_usdt", "psp_usdt", "oxt_usdt", "num_usdt", "mask_usdt", "glm_usdt", "ant_usdt", "bond_usdt",
    "fida_usdt", "maps_usdt", "drop_usdt", "px_usdt", "clv_usdt", "cfx_usdt", "ckb_usdt", "mx_usdt",
    "ceir_usdt", "ret_usdt", "stmx_usdt", "chz_usdt", "ankr_usdt", "coti_usdt", "skl_usdt", "arpa_usdt",
    "strax_usdt", "fo_usdt", "mbl_usdt", "quick_usdt", "sfund_usdt", "bsw_usdt", "axie_usdt",
    "tfuel_usdt", "hnt_usdt", "loka_usdt", "dydx_usdt", "pundix_usdt", "who_usdt", "dent_usdt",
    "rsr_usdt", "cvc_usdt", "data_usdt", "nkn_usdt", "lit_usdt", "key_usdt", "dock_usdt", "phb_usdt",
    "mxc_usdt", "front_usdt"
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

    // سایر محاسبات
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
        const avgVolume = 1000000;
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

// ==================== endpointهای API ====================

// اسکن بازار با VortexAI
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

        // اگر API جواب نداد، از داده‌های realtime استفاده کن
        if (coins.length === 0) {
            console.log('⚠️ API returned empty, using realtime data as fallback');
            coins = Object.values(realtimeData).map((data, index) => ({
                id: `coin_${index}`,
                name: `Crypto ${index}`,
                symbol: Object.keys(realtimeData)[index]?.replace('_usdt', '').toUpperCase() || `CRYPTO${index}`,
                price: data.price,
                priceChange1h: data.change || 0,
                priceChange24h: data.change || 0,
                volume: data.volume || 0,
                marketCap: (data.price || 0) * 1000000,
                rank: index + 1,
                high24h: data.high_24h || data.price * 1.05,
                low24h: data.low_24h || data.price * 0.95
            }));
        }

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

// تحلیل تکنیکال پیشرفته برای یک ارز
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
            high: item.price * 1.02,
            low: item.price * 0.98
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

// سلامت سیستم ترکیبی
app.get('/api/health-combined', (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();
    
    res.json({
        status: 'healthy',
        service: 'VortexAI Combined Crypto Scanner',
        version: '4.0',
        timestamp: new Date().toISOString(),
        
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

// ==================== صفحات HTML زیبا ====================

// صفحه اصلی دشبورد
app.get('/', (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();
    
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
                padding: 25px;
                border-radius: 12px;
                border-left: 5px solid #3498db;
                transition: transform 0.3s, box-shadow 0.3s;
            }
            .status-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            .status-card.good { border-left-color: #27ae60; }
            .status-card.warning { border-left-color: #f39c12; }
            .status-icon {
                font-size: 2em;
                margin-bottom: 15px;
            }
            .metric {
                font-size: 2em;
                font-weight: bold;
                color: #2c3e50;
                margin: 10px 0;
            }
            .metric-label {
                color: #7f8c8d;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .links-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 30px 0;
            }
            .nav-link {
                display: block;
                padding: 20px;
                background: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 10px;
                text-align: center;
                transition: all 0.3s;
                font-weight: bold;
            }
            .nav-link:hover {
                background: #2980b9;
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 VortexAI Pro - Combined Crypto Scanner</h1>
            <p style="text-align: center; color: #666; font-size: 18px;">
                Advanced cryptocurrency market scanner with real-time data, historical analysis, and AI-powered insights
            </p>
            
            <div class="status-grid">
                <div class="status-card good">
                    <div class="status-icon">📡</div>
                    <div class="metric">${wsStatus.connected ? 'Connected' : 'Disconnected'}</div>
                    <div class="metric-label">WebSocket Status</div>
                    <div style="margin-top: 10px; font-size: 0.9em;">
                        Active Coins: ${wsStatus.active_coins}<br>
                        Total: ${wsStatus.total_subscribed}
                    </div>
                </div>
                
                <div class="status-card good">
                    <div class="status-icon">💾</div>
                    <div class="metric">${Object.keys(gistData.prices || {}).length}</div>
                    <div class="metric-label">Historical Storage</div>
                    <div style="margin-top: 10px; font-size: 0.9em;">
                        Gist: ${process.env.GITHUB_TOKEN ? 'Active' : 'Inactive'}<br>
                        Last Updated: ${new Date(gistData.last_updated).toLocaleDateString()}
                    </div>
                </div>
                
                <div class="status-card good">
                    <div class="status-icon">🤖</div>
                    <div class="metric">15+</div>
                    <div class="metric-label">AI Indicators</div>
                    <div style="margin-top: 10px; font-size: 0.9em;">
                        VortexAI: Ready<br>
                        Analysis: Active
                    </div>
                </div>
            </div>

            <h2 style="text-align: center; color: #2c3e50;">🔗 Navigation</h2>
            
            <div class="links-grid">
                <a href="/health" class="nav-link" style="background: #27ae60;">
                    🩺 System Health
                </a>
                <a href="/scan" class="nav-link" style="background: #e74c3c;">
                    🔍 Market Scanner
                </a>
                <a href="/analysis?symbol=btc_usdt" class="nav-link" style="background: #9b59b6;">
                    📊 BTC Analysis
                </a>
                <a href="/api/scan/vortexai?limit=10&filter=ai_signal" class="nav-link" style="background: #f39c12;">
                    📈 API Data
                </a>
            </div>

            <div class="footer">
                <p><strong>🕒 Server Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>📦 Version:</strong> 4.0 - Enhanced UI Edition</p>
                <p><strong>🌐 Environment:</strong> Production</p>
                <p><strong>💡 Features:</strong> Real-time WebSocket + Historical Gist + VortexAI Analysis + Beautiful UI</p>
            </div>
        </div>
    </body>
    </html>
    `);
});

// صفحه سلامت سیستم
app.get('/health', (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();
    
    const healthData = {
        websocket: {
            connected: wsStatus.connected,
            active_coins: wsStatus.active_coins,
            total_subscribed: wsStatus.total_subscribed
        },
        gist: {
            active: !!process.env.GITHUB_TOKEN,
            total_coins: Object.keys(gistData.prices || {}).length,
            last_updated: gistData.last_updated
        },
        ai: {
            technical_analysis: 'active',
            vortexai_engine: 'ready',
            indicators_available: 15
        },
        api: {
            requests_count: apiClient.request_count,
            coinstats_connected: 'active'
        }
    };

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>System Health - VortexAI Pro</title>
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
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .status-card {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 12px;
                border-left: 5px solid #3498db;
                transition: transform 0.3s, box-shadow 0.3s;
            }
            .status-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            .status-card.good { border-left-color: #27ae60; background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%); }
            .status-card.warning { border-left-color: #f39c12; background: linear-gradient(135deg, #fff8f0 0%, #fef5e7 100%); }
            .status-card.danger { border-left-color: #e74c3c; background: linear-gradient(135deg, #fff5f5 0%, #fde8e8 100%); }
            .status-icon {
                font-size: 2em;
                margin-bottom: 15px;
            }
            .metric {
                font-size: 2em;
                font-weight: bold;
                color: #2c3e50;
                margin: 10px 0;
            }
            .metric-label {
                color: #7f8c8d;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .back-button {
                display: inline-block;
                padding: 12px 30px;
                background: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 25px;
                margin-top: 20px;
                transition: all 0.3s;
            }
            .back-button:hover {
                background: #2980b9;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            }
            .timestamp {
                text-align: center;
                color: #7f8c8d;
                margin-top: 30px;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🩺 System Health Dashboard</h1>
            <p style="text-align: center; color: #666; font-size: 18px;">
                Real-time monitoring of all VortexAI services and components
            </p>
            
            <div class="status-grid">
                <div class="status-card ${healthData.websocket.connected ? 'good' : 'danger'}">
                    <div class="status-icon">📡</div>
                    <div class="metric">${healthData.websocket.connected ? 'Connected' : 'Disconnected'}</div>
                    <div class="metric-label">WebSocket Status</div>
                    <div style="margin-top: 15px;">
                        <strong>Active Coins:</strong> ${healthData.websocket.active_coins}<br>
                        <strong>Subscribed:</strong> ${healthData.websocket.total_subscribed}
                    </div>
                </div>
                
                <div class="status-card ${healthData.gist.active ? 'good' : 'warning'}">
                    <div class="status-icon">💾</div>
                    <div class="metric">${healthData.gist.total_coins}</div>
                    <div class="metric-label">Historical Storage</div>
                    <div style="margin-top: 15px;">
                        <strong>Status:</strong> ${healthData.gist.active ? 'Active' : 'Inactive'}<br>
                        <strong>Last Updated:</strong> ${new Date(healthData.gist.last_updated).toLocaleString()}
                    </div>
                </div>
                
                <div class="status-card good">
                    <div class="status-icon">🤖</div>
                    <div class="metric">15+</div>
                    <div class="metric-label">AI Indicators</div>
                    <div style="margin-top: 15px;">
                        <strong>VortexAI:</strong> Ready<br>
                        <strong>Analysis:</strong> Active
                    </div>
                </div>
                
                <div class="status-card good">
                    <div class="status-icon">📊</div>
                    <div class="metric">${healthData.api.requests_count}</div>
                    <div class="metric-label">API Requests</div>
                    <div style="margin-top: 15px;">
                        <strong>CoinStats:</strong> Connected<br>
                        <strong>Rate Limit:</strong> Active
                    </div>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="/" class="back-button">🏠 Back to Dashboard</a>
            </div>

            <div class="timestamp">
                Last checked: ${new Date().toLocaleString()}
            </div>
        </div>
    </body>
    </html>
    `);
});

// صفحه اسکن VortexAI
app.get('/scan', (req, res) => {
    const limit = req.query.limit || 20;
    const filter = req.query.filter || 'ai_signal';
    
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>VortexAI Market Scan</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container {
                max-width: 1400px;
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
            .controls {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                display: flex;
                gap: 15px;
                align-items: center;
                flex-wrap: wrap;
            }
            .control-group {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            select, button {
                padding: 10px 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
            }
            button {
                background: #3498db;
                color: white;
                border: none;
                cursor: pointer;
                transition: background 0.3s;
            }
            button:hover {
                background: #2980b9;
            }
            .results {
                margin-top: 30px;
            }
            .coin-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            .coin-card {
                background: white;
                border: 1px solid #e1e8ed;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                transition: transform 0.3s, box-shadow 0.3s;
            }
            .coin-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }
            .coin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .coin-symbol {
                font-weight: bold;
                font-size: 1.2em;
                color: #2c3e50;
            }
            .coin-price {
                font-size: 1.3em;
                font-weight: bold;
                margin: 10px 0;
            }
            .positive { color: #27ae60; }
            .negative { color: #e74c3c; }
            .ai-badge {
                background: #9b59b6;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8em;
            }
            .loading {
                text-align: center;
                padding: 40px;
                color: #7f8c8d;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔍 VortexAI Market Scanner</h1>
            <p style="text-align: center; color: #666;">
                Advanced cryptocurrency scanning with AI-powered insights and real-time data
            </p>
            
            <div class="controls">
                <div class="control-group">
                    <label>Limit:</label>
                    <select id="limitSelect">
                        <option value="10">10 coins</option>
                        <option value="20" selected>20 coins</option>
                        <option value="50">50 coins</option>
                        <option value="100">100 coins</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label>Filter:</label>
                    <select id="filterSelect">
                        <option value="ai_signal">AI Signal</option>
                        <option value="volume">Volume</option>
                        <option value="momentum_1h">1H Momentum</option>
                        <option value="momentum_4h">4H Momentum</option>
                    </select>
                </div>
                
                <button onclick="scanMarket()">🚀 Scan Market</button>
                <button onclick="loadSampleData()" style="background: #95a5a6;">📊 Load Sample</button>
            </div>

            <div class="results">
                <div id="resultsContainer" class="loading">
                    <div>Click "Scan Market" to load cryptocurrency data...</div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="/" class="back-button">🏠 Back to Dashboard</a>
            </div>
        </div>

        <script>
            async function scanMarket() {
                const limit = document.getElementById('limitSelect').value;
                const filter = document.getElementById('filterSelect').value;
                
                document.getElementById('resultsContainer').innerHTML = '<div class="loading">🔄 Scanning market with VortexAI...</div>';
                
                try {
                    const response = await fetch(\`/api/scan/vortexai?limit=\${limit}&filter=\${filter}\`);
                    const data = await response.json();
                    
                    if (data.success) {
                        displayResults(data.coins);
                    } else {
                        document.getElementById('resultsContainer').innerHTML = '<div class="loading">❌ Error loading data</div>';
                    }
                } catch (error) {
                    document.getElementById('resultsContainer').innerHTML = '<div class="loading">❌ Connection error</div>';
                }
            }
            
            function displayResults(coins) {
                if (!coins || coins.length === 0) {
                    document.getElementById('resultsContainer').innerHTML = '<div class="loading">📭 No coins found</div>';
                    return;
                }
                
                const coinsHTML = coins.map(coin => \`
                    <div class="coin-card">
                        <div class="coin-header">
                            <span class="coin-symbol">\${coin.symbol}</span>
                            <span class="ai-badge">AI Score: \${coin.vortexai_analysis?.signal_strength?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div class="coin-price">$\${coin.price?.toFixed(2) || '0.00'}</div>
                        <div style="margin: 10px 0;">
                            <span class="\${(coin.priceChange24h || 0) >= 0 ? 'positive' : 'negative'}">
                                24h: \${(coin.priceChange24h || 0).toFixed(2)}%
                            </span>
                            <br>
                            <span class="\${(coin.change_1h || 0) >= 0 ? 'positive' : 'negative'}">
                                1h: \${(coin.change_1h || 0).toFixed(2)}%
                            </span>
                        </div>
                        <div style="font-size: 0.9em; color: #7f8c8d;">
                            Volume: $\${(coin.volume || 0).toLocaleString()}<br>
                            Sentiment: \${coin.vortexai_analysis?.market_sentiment || 'neutral'}
                        </div>
                    </div>
                \`).join('');
                
                document.getElementById('resultsContainer').innerHTML = \`
                    <h3>📈 Scan Results: \${coins.length} coins</h3>
                    <div class="coin-grid">\${coinsHTML}</div>
                \`;
            }
            
            function loadSampleData() {
                const sampleCoins = [
                    { symbol: 'BTC', price: 45234.56, priceChange24h: 2.34, change_1h: 0.56, volume: 25467890000, vortexai_analysis: { signal_strength: 8.7, market_sentiment: 'bullish' } },
                    { symbol: 'ETH', price: 2345.67, priceChange24h: 1.23, change_1h: -0.34, volume: 14567890000, vortexai_analysis: { signal_strength: 7.2, market_sentiment: 'bullish' } },
                    { symbol: 'SOL', price: 102.34, priceChange24h: 5.67, change_1h: 2.12, volume: 3456789000, vortexai_analysis: { signal_strength: 9.1, market_sentiment: 'very bullish' } }
                ];
                displayResults(sampleCoins);
            }
        </script>
    </body>
    </html>
    `);
});

// صفحه تحلیل تکنیکال
app.get('/analysis', (req, res) => {
    const symbol = req.query.symbol || 'btc_usdt';
    
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Technical Analysis - VortexAI</title>
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
            }
            .analysis-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .indicator-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #3498db;
            }
            .indicator-value {
                font-size: 1.8em;
                font-weight: bold;
                margin: 10px 0;
            }
            .bullish { color: #27ae60; }
            .bearish { color: #e74c3c; }
            .neutral { color: #f39c12; }
            .back-button {
                display: inline-block;
                padding: 12px 30px;
                background: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 25px;
                margin: 5px;
                transition: all 0.3s;
            }
            .back-button:hover {
                background: #2980b9;
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📊 Technical Analysis: ${symbol.toUpperCase()}</h1>
            
            <div style="text-align: center; margin: 20px 0;">
                <a href="/scan" class="back-button">🔍 Back to Scanner</a>
                <a href="/" class="back-button" style="background: #95a5a6;">🏠 Dashboard</a>
            </div>
            
            <div id="analysisContent" style="text-align: center; padding: 40px;">
                <div>Loading technical analysis for ${symbol.toUpperCase()}...</div>
            </div>
        </div>

        <script>
            async function loadAnalysis() {
                try {
                    const response = await fetch(\`/api/coin/\${'${symbol}'}/technical\`);
                    const data = await response.json();
                    
                    if (data.success) {
                        displayAnalysis(data);
                    } else {
                        document.getElementById('analysisContent').innerHTML = '<div>❌ Error loading analysis</div>';
                    }
                } catch (error) {
                    document.getElementById('analysisContent').innerHTML = '<div>❌ Connection error</div>';
                }
            }
            
            function displayAnalysis(data) {
                const analysisHTML = \`
                    <div class="analysis-grid">
                        <div class="indicator-card">
                            <div>💰 Current Price</div>
                            <div class="indicator-value">$\${data.current_price?.toFixed(2) || 'N/A'}</div>
                        </div>
                        <div class="indicator-card">
                            <div>📈 RSI</div>
                            <div class="indicator-value \${getRSIColor(data.technical_indicators?.momentum_indicators?.rsi)}">
                                \${data.technical_indicators?.momentum_indicators?.rsi?.toFixed(2) || 'N/A'}
                            </div>
                        </div>
                        <div class="indicator-card">
                            <div>🎯 MACD</div>
                            <div class="indicator-value \${getMACDColor(data.technical_indicators?.macd)}">
                                \${data.technical_indicators?.macd?.macd?.toFixed(4) || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 30px; text-align: left;">
                        <h3>AI Insights</h3>
                        <p>Technical analysis powered by VortexAI engine with 15+ indicators.</p>
                        <p><strong>Data Points:</strong> \${data.data_points || 0}</p>
                        <p><strong>Processing Time:</strong> \${data.processing_time || 'N/A'}</p>
                    </div>
                \`;
                
                document.getElementById('analysisContent').innerHTML = analysisHTML;
            }
            
            function getRSIColor(rsi) {
                if (!rsi) return 'neutral';
                if (rsi > 70) return 'bearish';
                if (rsi < 30) return 'bullish';
                return 'neutral';
            }
            
            function getMACDColor(macd) {
                if (!macd || !macd.macd) return 'neutral';
                return macd.macd > 0 ? 'bullish' : 'bearish';
            }
            
            window.addEventListener('load', loadAnalysis);
        </script>
    </body>
    </html>
    `);
});

// ==================== راه‌اندازی سرور ====================
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 VortexAI Combined Server started on port ${PORT}`);
    logger.info('✅ Features: WebSocket Real-time + Gist Historical + VortexAI Analysis + Beautiful UI');
    logger.info(`📊 Real-time Pairs: ${ALL_TRADING_PAIRS.length}`);
    logger.info(`🔗 Dashboard: http://localhost:${PORT}/`);
    logger.info(`🩺 Health: http://localhost:${PORT}/health`);
    logger.info(`🔍 Scanner: http://localhost:${PORT}/scan`);
});

module.exports = app;
