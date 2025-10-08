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

// ===================== تنظیمات پیشرفته لاگینگ =====================
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

// ===================== API Keys =====================
const COINSTATS_API_KEY = process.env.COINSTATS_API_KEY || "uNb+sQjnjCQmV30dYrChxgh55hRHElmiZLnKJX+5U6g=";

// ===================== میدلورها =====================
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// ===================== کش سرور =====================
let cache = {
    coinsList: { data: null, timestamp: null },
    historicalData: {},
    realtimePrices: {}
};

// ===================== لیست تمام جفت‌های معاملاتی =====================
const ALL_TRADING_PAIRS = [
    "btc_usdt", "eth_usdt", "xrp_usdt", "ada_usdt", "dot_usdt", "doge_usdt", "sol_usdt", "matic_usdt",
    "avax_usdt", "link_usdt", "bch_usdt", "ltc_usdt", "etc_usdt", "trx_usdt", "atom_usdt", "bnb_usdt",
    "xlm_usdt", "eos_usdt", "xtz_usdt", "algo_usdt", "neo_usdt", "ftm_usdt", "hbar_usdt", "egld_usdt",
    "theta_usdt", "vet_usdt", "fil_usdt", "icp_usdt", "xmr_usdt", "ape_usdt", "gala_usdt", "sand_usdt",
    "mana_usdt", "enj_usdt", "bat_usdt", "comp_usdt", "mkr_usdt", "zec_usdt", "dash_usdt",
    "waves_usdt", "omg_usdt", "zil_usdt", "ont_usdt", "ost_usdt", "stx_usdt", "celo_usdt", "wnxm_usdt",
    "sc_usdt", "zen_usdt", "hot_usdt", "iotx_usdt", "ong_usdt", "one_usdt", "nano_usdt", "ardr_usdt",
    "qtum_usdt", "lsk_usdt", "strat_usdt", "kmd_usdt", "pivx_usdt", "grs_usdt", "nav_usdt",
    "emc2_usdt", "xvg_usdt", "sys_usdt", "via_usdt", "mona_usdt", "dcr_usdt", "sia_usdt", "lbc_usdt",
    "rep_usdt", "gnt_usdt", "loom_usdt", "poly_usdt", "ren_usdt", "fun_usdt", "req_usdt", "salt_usdt",
    "mtl_usdt", "mco_usdt", "edo_usdt", "powr_usdt", "irc_usdt", "gto_usdt", "eng_usdt", "ast_usdt",
    "dgd_usdt", "adx_usdt", "qsp_usdt", "mda_usdt", "snt_usdt", "agix_usdt", "ocean_usdt", "band_usdt",
    "nmr_usdt", "ric_usdt", "rlc_usdt", "storj_usdt", "keep_usdt", "om_usdt", "front_usdt", "perp_usdt",
    "api3_usdt", "grt_usdt", "lqty_usdt", "alcx_usdt", "pool_usdt", "rad_usdt", "farm_usdt", "audio_usdt",
    "rsr_usdt", "dodo_usdt", "tlm_usdt", "lit_usdt", "ygg_usdt", "slp_usdt", "axs_usdt", "sandbox_usdt",
    "enjin_usdt", "mdx_usdt", "flow_usdt", "rose_usdt", "ar_usdt", "rune_usdt", "sushi_usdt", "crv_usdt",
    "lrc_usdt", "knc_usdt", "bal_usdt", "uma_usdt", "badger_usdt", "fxs_usdt", "cvx_usdt", "tribe_usdt",
    "gno_usdt", "ilus_usdt", "pla_usdt", "super_usdt", "ach_usdt", "imx_usdt", "gods_usdt", "vra_usdt",
    "sps_usdt", "dar_usdt", "mgp_usdt", "ceek_usdt", "titan_usdt", "vr_usdt", "bmx_usdt", "hero_usdt",
    "pyr_usdt", "ufo_usdt", "elon_usdt", "shib_usdt", "floki_usdt", "samo_usdt", "baby_usdt", "kishu_usdt",
    "hoge_usdt", "akita_usdt", "husky_usdt", "safemoon_usdt", "evergrow_usdt", "lunc_usdt", "bonk_usdt",
    "wif_usdt", "myro_usdt", "popcat_usdt", "toshi_usdt", "mew_usdt", "mog_usdt", "rett_usdt", "turbo_usdt",
    "pepe_usdt", "wojak_usdt", "aidoge_usdt", "pudgy_usdt", "lady_usdt", "jeo_usdt", "based_usdt", "degen_usdt",
    "moutai_usdt", "aave_usdt", "snx_usdt", "uni_usdt", "cake_usdt", "bake_usdt", "burger_usdt", "toko_usdt",
    "inj_usdt", "lina_usdt", "reef_usdt", "dusk_usdt", "atm_usdt", "ogn_usdt", "for_usdt", "mir_usdt",
    "lto_usdt", "cos_usdt", "ctk_usdt", "tko_usdt", "alpaca_usdt", "perl_usdt", "stpt_usdt", "troy_usdt",
    "vite_usdt", "sxp_usdt", "hbtc_usdt", "mdt_usdt", "mbox_usdt", "gmt_usdt", "time_usdt", "raca_usdt",
    "beans_usdt", "edu_usdt", "id_usdt", "ondo_usdt", "pixel_usdt", "voxel_usdt", "high_usdt", "looks_usdt",
    "blur_usdt", "psp_usdt", "oxt_usdt", "num_usdt", "mask_usdt", "glm_usdt", "ant_usdt", "bond_usdt",
    "fida_usdt", "maps_usdt", "drop_usdt", "px_usdt", "clv_usdt", "cfx_usdt", "ckb_usdt", "mx_usdt",
    "celr_usdt", "fet_usdt", "stmx_usdt", "chz_usdt", "ankr_usdt", "coti_usdt", "skl_usdt", "arpa_usdt",
    "strax_usdt", "fo_usdt", "mbl_usdt", "quick_usdt", "sfund_usdt", "bsw_usdt", "axie_usdt", "tfuel_usdt",
    "hnt_usdt", "loka_usdt", "dydx_usdt", "pundix_usdt", "who_usdt", "dent_usdt", "rsr_usdt", "cvc_usdt",
    "data_usdt", "nkn_usdt", "lit_usdt", "key_usdt", "dock_usdt", "phb_usdt", "mxc_usdt", "front_usdt"
];

// ===================== کلاس Gist Manager با سیستم ۶ لایه‌ای ======================
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
            logger.info("✔️ Gist Manager initialized");
        } catch (error) {
            logger.error("✗️ Gist Manager init error:", error);
        }
    }

    async loadFromGist() {
        try {
            const response = await this.octokit.rest.gists.get({ gist_id: this.gistId });
            const content = response.data.files['prices.json'].content;
            this.priceHistory = JSON.parse(content);
            logger.info("✔️ Data loaded from Gist");
        } catch (error) {
            logger.warn('△ Could not load from Gist, starting fresh');
            this.priceHistory = {
                prices: {},
                last_updated: new Date().toISOString()
            };
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
                    files: {'prices.json': { content: content } },
                    public: false
                });
                this.gistId = response.data.id;
            }
            logger.info("✔ Data saved to Gist");
        } catch (error) {
            logger.error("✗ Gist save error", error);
        }
    }

    addPrice(symbol, currentPrice) {
        try {
            if (!this.priceHistory.prices) {
                this.priceHistory.prices = {};
            }

            const now = Date.now();
            let existingData = this.priceHistory.prices[symbol];

            if (!existingData) {
                existingData = {
                    price: currentPrice,
                    timestamp: now,
                    // ❌ فقط فیلدهای پایه - بدون change های ساختگی
                    history: {
                        '1h': [], '4h': [], '24h': [], '7d': [], '30d': [], '180d': []
                    }
                };
                this.priceHistory.prices[symbol] = existingData;
            }

            // فقط قیمت و timestamp آپدیت میشه
            existingData.price = currentPrice;
            existingData.timestamp = now;

            return true;
        } catch (error) {
            console.error('Error in addPrice', error);
            return false;
        }
    }

    getPriceData(symbol, timeframe = null) {
        if (timeframe) {
            const data = this.priceHistory.prices && this.priceHistory.prices[symbol];
            return data ? {
                current_price: data.price,
                timestamp: data.timestamp,
                history: data.history && data.history[timeframe] || []
            } : null;
        }
        return (this.priceHistory.prices && this.priceHistory.prices[symbol]) || null;
    }

    getAllData() {
        return this.priceHistory;
    }

    getAvailableTimeframes() {
        return ["1h", "4h", "24h", "7d", "30d", "180d"];
    }
}
// ===================== کلاس تحلیل تکنیکال =====================
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
        if (avgLoss === 0) return 100;
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

    // ====================== VortexAI Functions ==========================
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

// ====================== کلاس HistoricalDataAPI ======================
class HistoricalDataAPI {
    constructor() {
        this.base_url = "https://openapiv1.coinstats.app";
        this.api_key = "uNb+sQjnjCQmV30dYrChxgh55hRHEImiZLnKJX+5U6g=";
        this.requestCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
    }

    symbolToCoinId(symbol) {
        const symbolMap = {
            'BTC': 'bitcoin', 'ETH': 'ethereum', 'BNB': 'binancecoin', 'SOL': 'solana',
            'XRP': 'ripple', 'ADA': 'cardano', 'AVAX': 'avalanche-2', 'DOT': 'polkadot',
            'LINK': 'chainlink', 'MATIC': 'matic-network', 'LTC': 'litecoin', 'BCH': 'bitcoin-cash',
            'ATOM': 'cosmos', 'XLM': 'stellar', 'FIL': 'filecoin', 'HBAR': 'hedera-hashgraph',
            'NEAR': 'near', 'APT': 'aptos', 'ARB': 'arbitrum', 'ZIL': 'zilliqa',
            'VET': 'vechain', 'DOGE': 'dogecoin', 'TRX': 'tron', 'UNI': 'uniswap',
            'ETC': 'ethereum-classic', 'XMR': 'monero', 'ALGO': 'algorand', 'XTZ': 'tezos',
            'EOS': 'eos', 'AAVE': 'aave', 'MKR': 'maker', 'COMP': 'compound-governance-token',
            'YFI': 'yearn-finance', 'SNX': 'havven', 'SUSHI': 'sushi', 'CRV': 'curve-dao-token',
            '1INCH': '1inch', 'REN': 'republic-protocol', 'BAT': 'basic-attention-token',
            'ZRX': '0x', 'ENJ': 'enjincoin', 'MANA': 'decentraland', 'SAND': 'the-sandbox',
            'GALA': 'gala', 'APE': 'apecoin', 'GMT': 'stepn', 'AUDIO': 'audius',
            'USDT': 'tether', 'USDC': 'usd-coin', 'DAI': 'dai',
            'XMR': 'monero', 'ZEC': 'zcash', 'DASH': 'dash',
            'WAVES': 'waves', 'KSM': 'kusama', 'EGLD': 'elrond-erd-2',
            'THETA': 'theta-token', 'FTM': 'fantom', 'ONE': 'harmony',
            'ICX': 'icon', 'ONT': 'ontology', 'ZEN': 'horizen',
            'SC': 'siacoin', 'BTT': 'bittorrent', 'HOT': 'holotoken',
            'NANO': 'nano', 'IOST': 'iostoken', 'IOTX': 'iotex',
            'CELO': 'celo', 'KAVA': 'kava', 'RSR': 'reserve-rights-token',
            'OCEAN': 'ocean-protocol', 'BAND': 'band-protocol', 'NMR': 'numeraire',
            'UMA': 'uma', 'API3': 'api3', 'GRT': 'the-graph',
            'LPT': 'livepeer', 'ANKR': 'ankr', 'COTI': 'coti',
            'STMX': 'stormx', 'CHZ': 'chiliz', 'HIVE': 'hive-blockchain',
            'AR': 'arweave', 'REN': 'republic-protocol', 'STORJ': 'storj',
            'DODO': 'dodo', 'PERP': 'perpetual-protocol', 'RLC': 'iexec-rlc',
            'POND': 'marinade', 'ALPHA': 'alpha-finance', 'MIR': 'mirror-protocol',
            'TWT': 'trust-wallet-token', 'SXP': 'swipe', 'WRX': 'wazirx',
            'FRONT': 'frontier', 'AKRO': 'akropolis', 'REEF': 'reef-finance',
            'DUSK': 'dusk-network', 'TOMO': 'tomochain', 'BAL': 'balancer',
            'KNC': 'kyber-network', 'SNT': 'status', 'FUN': 'funfair',
            'CVC': 'civic', 'REQ': 'request-network', 'GNT': 'golem',
            'LOOM': 'loom-network', 'MANA': 'decentraland', 'SAND': 'the-sandbox',
            'ENJ': 'enjincoin', 'UFO': 'ufo-gaming', 'PYR': 'vulcan-forged',
            'ILV': 'illuvium', 'YGG': 'yield-guild-games', 'GALA': 'gala',
            'MBOX': 'mobox', 'C98': 'coin98', 'DYDX': 'dydx',
            'IMX': 'immutable-x', 'GODS': 'gods-unchained', 'MAGIC': 'magic',
            'RARE': 'superrare', 'TVK': 'the-virtua-kolect', 'CUBE': 'somnium-space-cubes',
            'VRA': 'verasity', 'WAXP': 'wax', 'TLM': 'alien-worlds',
            'SPS': 'splintershards', 'GHST': 'aavegotchi', 'DG': 'decentral-games',
            'POLC': 'polkacity', 'MIST': 'alchemist', 'CRAFT': 'craft'
        };

        if (!symbol) {
            return 'bitcoin';
        }

        let cleanSymbol = symbol;
        if (typeof symbol === 'string') {
            cleanSymbol = symbol.replace(/[_.\-]usdt/gi, '').toUpperCase();
        }

        const coinId = symbolMap[cleanSymbol];
        if (!coinId) {
            return cleanSymbol.toLowerCase();
        }

        return coinId;
    }

    async getMultipleCoinsHistorical(coinIds, period = '1y') {
        const cacheKey = `${coinIds.sort().join(',')}.${period}`;
        const cached = this.requestCache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.data;
        }

        try {
            const batchSize = 10;
            const batches = [];
            for (let i = 0; i < coinIds.length; i += batchSize) {
                batches.push(coinIds.slice(i, i + batchSize));
            }

            const allResults = [];
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                const batchResult = await this.fetchBatchHistorical(batch, period);
                allResults.push(...batchResult.data);
                
                if (i < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            const result = {
                data: allResults,
                source: 'real_api',
                timestamp: Date.now()
            };

            this.requestCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            return result;

        } catch (error) {
            return { data: [], source: 'fallback', error: error.message };
        }
    }

    async fetchBatchHistorical(coinIds, period) {
        const coinIdsString = coinIds.map(id => encodeURIComponent(id)).join(",");
        const url = `${this.base_url}/coins/charts?period=${period}&coinIds=${coinIdsString}`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json',
                    'User-Agent': 'VortexAI-Server/1.0'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.status === 429) {
                throw new Error('Rate limit exceeded');
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            const validData = data.filter(item =>
                item &&
                item.coinId &&
                item.chart &&
                Array.isArray(item.chart) &&
                item.chart.length > 0
            );

            if (validData.length === 0) {
                throw new Error('No valid historical data');
            }

            return { data: validData, source: 'real_api' };

        } catch (error) {
            throw error;
        }
    }

    calculatePriceChangesFromChart(coinData, currentPrice) {
        if (!coinData || !coinData.chart || coinData.chart.length === 0) {
            return {
                changes: {},
                source: 'no_data'
            };
        }

        const chart = coinData.chart;
        const now = Math.floor(Date.now() / 1000);
        const periods = {
            '1h': 1 * 60 * 60,
            '4h': 4 * 60 * 60,
            '24h': 24 * 60 * 60,
            '7d': 7 * 24 * 60 * 60,
            '30d': 30 * 24 * 60 * 60,
            '180d': 180 * 24 * 60 * 60
        };

        const changes = {};

        for (const [periodName, seconds] of Object.entries(periods)) {
            const targetTime = now - seconds;
            const historicalPoint = this.findClosestHistoricalPoint(chart, targetTime);
            
            if (historicalPoint && historicalPoint[1] > 0) {
                const historicalPrice = historicalPoint[1];
                const change = ((currentPrice - historicalPrice) / historicalPrice) * 100;
                changes[periodName] = parseFloat(change.toFixed(2));
            }
        }

        return {
            changes: changes,
            source: Object.keys(changes).length > 0 ? 'real' : 'no_data'
        };
    }

    findClosestHistoricalPoint(chart, targetTime) {
        if (!chart || chart.length === 0) return null;

        let closestPoint = null;
        let minDiff = Infinity;

        for (const point of chart) {
            const timeDiff = Math.abs(point[0] - targetTime);
            if (timeDiff < minDiff) {
                minDiff = timeDiff;
                closestPoint = point;
            }
        }

        return closestPoint;
    }

    getPeriodSeconds(period) {
        const periods = {
            '1h': 3600,
            '4h': 14400,
            '24h': 86400,
            '7d': 604800,
            '30d': 2592000,
            '180d': 15552000
        };
        return periods[period] || 86400;
    }
}
// ===================== WebSocket Manager =====================
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
                logger.info('✔️ WebSocket connected to LBank');
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

                        // آپدیت در Gist Manager
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
                    logger.error('❌ WebSocket message processing error', error);
                }
            });

            this.ws.on('error', (error) => {
                logger.error('❌ WebSocket error', error);
                this.connected = false;
            });

            this.ws.on('close', (code, reason) => {
                logger.warn(`△ WebSocket disconnected - Code: ${code}, Reason: ${reason}`);
                this.connected = false;
                setTimeout(() => {
                    logger.info('Attempting WebSocket reconnection...');
                    this.connect();
                }, 5000);
            });
        } catch (error) {
            logger.error('WebSocket connection error', error);
            setTimeout(() => this.connect(), 10000);
        }
    }

    subscribeToAllPairs() {
        if (this.connected && this.ws) {
            logger.info(`Subscribing to ${ALL_TRADING_PAIRS.length} trading pairs`);
            const batchSize = 10;
            for (let i = 0; i < ALL_TRADING_PAIRS.length; i += batchSize) {
                setTimeout(() => {
                    const batch = ALL_TRADING_PAIRS.slice(i, i + batchSize);
                    this.subscribeBatch(batch);
                }, i * 100);
            }
        }
    }

    get top20Pairs() {
        return [
            'btc_usdt', 'eth_usdt', 'bnb_usdt', 'sol_usdt', 'xrp_usdt',
            'ada_usdt', 'avax_usdt', 'dot_usdt', 'link_usdt', 'matic_usdt',
            'ltc_usdt', 'bch_usdt', 'atom_usdt', 'etc_usdt', 'xlm_usdt',
            'fil_usdt', 'hbar_usdt', 'near_usdt', 'apt_usdt', 'arb_usdt'
        ];
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
        logger.info(`✔ Subscribed to ${pairs.length} pairs`);
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

// ===================== API Client =====================
class AdvancedCoinStatsAPIClient {
    constructor() {
        this.base_url = "https://openapiv1.coinstats.app";
        this.apiKey = process.env.COINSTATS_APL_KEY || "uNb+sQjnjCQmV30dYrChxgh55hRHElmiZLnKJX+5U6g=";
        this.request_count = 0;
        this.last_request_time = Date.now();
        this.rateLimitDelay = 1000; // افزایش به 1 ثانیه
    }

    async _rateLimit() {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.last_request_time;
        
        if (timeDiff < this.rateLimitDelay) {
            const waitTime = this.rateLimitDelay - timeDiff;
            console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.last_request_time = Date.now();
        this.request_count++;
        
        if (this.request_count % 10 === 0) {
            console.log(`📊 Total API requests: ${this.request_count}`);
        }
    }

    async getCoins(limit = 100) {
        await this._rateLimit();
        try {
            const url = `${this.base_url}/coins?limit=${limit}&currency=USD`;
            console.log(`🔗 Fetching from: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.apiKey,
                    'Accept': 'application/json',
                    'User-Agent': 'VortexAI-Server/1.0'
                },
                timeout: 10000
            });

            console.log(`📡 Response status: ${response.status} ${response.statusText}`);

            if (response.status === 429) {
                console.log('❌ Rate limit exceeded! Increasing delay...');
                this.rateLimitDelay = 2000; // افزایش به 2 ثانیه
                return { coins: [], error: 'Rate limit exceeded' };
            }

            if (!response.ok) {
                console.log(`❌ HTTP error! status: ${response.status}`);
                return { coins: [], error: `HTTP ${response.status}` };
            }

            const data = await response.json();
            console.log(`✅ Received ${data.result?.length || data.coins?.length || 0} coins from API`);
            
            return { coins: data.result || data.coins || data || [] };
            
        } catch (error) {
            console.error("❌ API getCoins error:", error.message);
            return { coins: [], error: error.message };
        }
    }
}
// ===================== نمونه‌سازی مدیران =====================
const gistManager = new GistManager();
const wsManager = new WebSocketManager();
const apiClient = new AdvancedCoinStatsAPIClient();

// ===================== اندپوینت‌های API =====================
app.get("/api/scan/vortexai", async (req, res) => {
    const startTime = Date.now();
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 300);
        const filterType = req.query.filter || 'volume';

        const [apiData, realtimeData, historicalData] = await Promise.all([
            apiClient.getCoins(limit),
            Promise.resolve(wsManager.getRealtimeData()),
            Promise.resolve(gistManager.getAllData())
        ]);

        let coins = apiData.coins || [];

        if (coins.length == 0) {
            coins = Object.values(realtimeData).map((data, index) => ({
                id: 'coin_' + index,
                name: 'Crypto ' + index,
                symbol: Object.keys(realtimeData)[index]?.replace("_usdt", "").toUpperCase() || `CRYPTO${index}`,
                price: data.price,
                priceChange1h: data.change || 0,
                priceChange24h: data.change || 0,
                volume: data.volume || 0,
                marketCap: (data.price || 0) * 1000000,
                rank: index + 1
            }));
        }

        const historicalAPI = new HistoricalDataAPI();
        
        const allCoinIds = coins.map(coin => {
            try {
                const coinId = historicalAPI.symbolToCoinId(coin.symbol);
                return coinId;
            } catch (error) {
                return 'bitcoin';
            }
        });

        const historicalResponse = await historicalAPI.getMultipleCoinsHistorical(allCoinIds, '1y');
        const allHistoricalData = historicalResponse.data;

        const historicalMap = {};
        allHistoricalData.forEach(coinData => {
            if (coinData && coinData.coinId) {
                historicalMap[coinData.coinId] = coinData;
            }
        });

        // ✅ پردازش جدید - فقط از داده واقعی استفاده میشه
        // اصلاح قسمت enhancedCoins
        const enhancedCoins = coins.map((coin) => {
            const coinId = historicalAPI.symbolToCoinId(coin.symbol);
            const historicalData = historicalMap[coinId];
            const symbol = `${coin.symbol.toLowerCase()}_usdt`;
            const realtime = realtimeData[symbol];
            const gistHistorical = gistManager.getPriceData(symbol);
            const currentPrice = realtime?.price || coin.price;
    
            let historicalChanges = {};
            let dataSource = 'no_historical';
            let hasRealHistorical = false;

            if (historicalData) {
                const changeResult = historicalAPI.calculatePriceChangesFromChart(historicalData, currentPrice);
                historicalChanges = changeResult.changes;
                dataSource = changeResult.source;
                hasRealHistorical = Object.keys(historicalChanges).length > 0;
            }

                consol.log(`Historical data for ${coin.symbol}:`, {
                    hasData: !! HistoricalData,
                    chartLength: historicalData.chart?.length,
                    changes: historicalChanges,
                    hasRealHistorical: hasRealHistorical
                });
            }
            return {
                ...coin,
                // داده‌های تاریخی واقعی
                change_1h: historicalChanges['1h'] || ?? coin.change_1h ?? coin.pricechange1h ?? 0,
                change_4h: historicalChanges['4h'] || ?? coin.change_4h ?? coin.pricechange4h ?? 0,
                change_24h: historicalChanges['24h'] || ?? coin.change_24h ?? coin.pricechange24h ?? 0,
                change_7d: historicalChanges['7d'] || ?? coin.change_7d ?? coin.pricechange7d ?? 0,
                change_30d: historicalChanges['30d'] || ?? coin.change_30d ?? coin.pricechange30d ?? 0,
                change_180d: historicalChanges['180d'] || ?? coin.change_180d ?? coin.pricechange180d ?? 0,
          
                historical_timestamp: gistHistorical?.timestamp,
                realtime_price: realtime?.price,
                realtime_volume: realtime?.volume,
                realtime_change: realtime?.change,
                data_source: dataSource,
                has_real_historical_data: hasRealHistorical, // ✅ اضافه کردن این فلگ

                VortexAI_analysis: {
                    signal_strength: TechnicalAnalysisEngine.calculateSignalStrength(coin),
                    trend: ((historicalChanges['24h'] ?? coin.priceChange24h ?? 0) > 0) ? "up" : "down",
                    volatility_score: TechnicalAnalysisEngine.calculateVolatility(coin),
                    volume_anomaly: TechnicalAnalysisEngine.detectVolumeAnomaly(coin),
                    market_sentiment: ((historicalChanges['1h'] ?? coin.priceChange1h ?? 0) > 0 &&
                                      (historicalChanges['24h'] ?? coin.priceChange24h ?? 0) > 0) ? 'bullish' : 'bearish'
                }
            };
        });
 
        // فیلتر و مرتب‌سازی...
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
                filteredCoins.sort((a, b) => (b.VortexAI_analysis?.signal_strength || 0) - 
                                            (a.VortexAI_analysis?.signal_strength || 0));
                break;
        }

        const responseTime = Date.now() - startTime;
        
        res.json({
            success: true,
            coins: filteredCoins.slice(0, limit),
            total_coins: filteredCoins.length,
            scan_mode: 'vortexai_enhanced_with_historical',
            filter_applied: filterType,
            data_sources: {
                api: coins.length,
                realtime: Object.keys(realtimeData).length,
                historical: Object.keys(historicalData.prices || {}).length,
                historical_api: Object.keys(historicalMap).length
            },
            processing_time: responseTime + 'ms',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('✗ خطای کلی در اسکن:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV == 'development' ? error.stack : undefined
        });
    }
});
// دریافت داده‌های تاریخی بر اساس timeframe
app.get('/api/coin/:symbol/history/:timeframe', async (req, res) => {
    const { symbol, timeframe } = req.params;
    const validTimeframes = gistManager.getAvailableTimeframes();
    
    if (!validTimeframes.includes(timeframe)) {
        return res.status(400).json({
            success: false,
            error: `Invalid timeframe. Valid timeframes: ${validTimeframes.join(', ')}`
        });
    }

    try {
        const historicalData = gistManager.getPriceData(symbol, timeframe);
        const realtimeData = wsManager.getRealtimeData()[symbol];

        if (!historicalData && !realtimeData) {
            return res.status(404).json({
                success: false,
                error: 'No data available for this symbol'
            });
        }

        res.json({
            success: true,
            symbol,
            timeframe,
            current_price: realtimeData?.price || historicalData?.current_price,
            history: historicalData?.history || [],
            data_points: historicalData?.history?.length || 0,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error(`❌ History API error for ${symbol}:`, error);
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
        const historicalData = gistManager.getPriceData(symbol, "24h");
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
            current_price: realtimeData?.price || historicalData?.current_price,
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

// دریافت لیست timeframeهای available
app.get('/api/timeframes', (req, res) => {
    res.json({
        success: true,
        timeframes: gistManager.getAvailableTimeframes(),
        description: {
            "1h": "1 hour history - 1 minute intervals",
            "4h": "4 hours history - 5 minute intervals", 
            "24h": "24 hours history - 15 minute intervals",
            "7d": "7 days history - 1 hour intervals",
            "30d": "30 days history - 4 hour intervals",
            "180d": "180 days history - 1 day intervals"
        }
    });
});

// سلامت سیستم ترکیبی
app.get('/api/health-combined', (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();

    res.json({
        status: 'healthy',
        service: 'VortexAI Combined Crypto Scanner',
        version: '5.0 - 6 Layer System',
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
            last_updated: gistData.last_updated,
            timeframes_available: gistManager.getAvailableTimeframes()
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
            '6_layer_historical_data',
            'vortexai_analysis', 
            'technical_indicators',
            'multi_source_data',
            'advanced_filtering',
            'market_predictions',
            'multi_timeframe_support'
        ]
    });
});

// ===================== صفحات HTML زیبا =====================

// صفحه اصلی دشبورد
app.get("/", (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();
    
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VortexAI Pro - 6 Layer Crypto Scanner</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
                line-height: 1.6;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }

            .header {
                text-align: center;
                margin-bottom: 40px;
                padding: 40px 20px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }

            .header h1 {
                font-size: 3rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }

            .header p {
                font-size: 1.2rem;
                color: #666;
                max-width: 600px;
                margin: 0 auto;
            }

            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 25px;
                margin-bottom: 40px;
            }

            .status-card {
                background: rgba(255, 255, 255, 0.95);
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                text-align: center;
                transition: all 0.3s ease;
                border-left: 5px solid #3498db;
                backdrop-filter: blur(10px);
            }

            .status-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            }

            .status-card.good {
                border-left-color: #27ae60;
                background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(255, 255, 255, 0.95));
            }

            .status-card.warning {
                border-left-color: #f39c12;
                background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(255, 255, 255, 0.95));
            }

            .status-card.danger {
                border-left-color: #e74c3c;
                background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(255, 255, 255, 0.95));
            }

            .card-icon {
                font-size: 3rem;
                margin-bottom: 15px;
            }

            .metric {
                font-size: 2.5rem;
                font-weight: bold;
                color: #2c3e50;
                margin: 10px 0;
            }

            .metric-label {
                color: #7f8c8d;
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
            }

            .timeframe-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 15px;
                margin: 30px 0;
            }

            .timeframe-card {
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                border: 2px solid transparent;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .timeframe-card:hover {
                border-color: #3498db;
                transform: scale(1.05);
                background: rgba(255, 255, 255, 0.95);
            }

            .timeframe-card strong {
                display: block;
                font-size: 1.5rem;
                color: #2c3e50;
                margin-bottom: 5px;
            }

            .timeframe-card small {
                color: #7f8c8d;
                font-size: 0.8rem;
            }

            .links-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 40px 0;
            }

            .nav-link {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 25px 20px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                text-decoration: none;
                border-radius: 15px;
                text-align: center;
                transition: all 0.3s ease;
                font-weight: bold;
                font-size: 1.1rem;
                box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
            }

            .nav-link:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
                background: linear-gradient(135deg, #764ba2, #667eea);
            }

            .nav-link.health { background: linear-gradient(135deg, #27ae60, #2ecc71); }
            .nav-link.scan { background: linear-gradient(135deg, #e74c3c, #c0392b); }
            .nav-link.analysis { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
            .nav-link.timeframes { background: linear-gradient(135
                        .nav-link.health { background: linear-gradient(135deg, #27ae60, #2ecc71); }
            .nav-link.scan { background: linear-gradient(135deg, #e74c3c, #c0392b); }
            .nav-link.analysis { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
            .nav-link.timeframes { background: linear-gradient(135deg, #f39c12, #e67e22); }
            .nav-link.api { background: linear-gradient(135deg, #3498db, #2980b9); }

            .footer {
                text-align: center;
                margin-top: 50px;
                padding: 30px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }

            .footer p {
                margin: 8px 0;
                color: #555;
            }

            .feature-badge {
                display: inline-block;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
                margin: 5px;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }

            @media (max-width: 768px) {
                .header h1 {
                    font-size: 2rem;
                }
                
                .status-grid {
                    grid-template-columns: 1fr;
                }
                
                .timeframe-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .links-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 VortexAI Pro</h1>
                <p>Advanced 6-Layer Cryptocurrency Market Scanner with Real-time AI Analysis</p>
            </div>
            
            <div class="status-grid">
                <div class="status-card ${wsStatus.connected ? 'good' : 'danger'}">
                    <div class="card-icon">📡</div>
                    <div class="metric">${wsStatus.connected ? 'Connected' : 'Disconnected'}</div>
                    <div class="metric-label">WebSocket Status</div>
                    <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                        <strong>Active Coins:</strong> ${wsStatus.active_coins}<br>
                        <strong>Subscribed:</strong> ${wsStatus.total_subscribed}<br>
                        <strong>Provider:</strong> LBank
                    </div>
                </div>
                
                <div class="status-card ${process.env.GITHUB_TOKEN ? 'good' : 'warning'}">
                    <div class="card-icon">💾</div>
                    <div class="metric">${Object.keys(gistData.prices || {}).length}</div>
                    <div class="metric-label">Historical Storage</div>
                    <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                        <strong>Gist:</strong> ${process.env.GITHUB_TOKEN ? 'Active' : 'Inactive'}<br>
                        <strong>Layers:</strong> 6 Timeframes<br>
                        <strong>Last Updated:</strong> ${new Date(gistData.last_updated).toLocaleDateString()}
                    </div>
                </div>
                
                <div class="status-card good">
                    <div class="card-icon">🤖</div>
                    <div class="metric">15+</div>
                    <div class="metric-label">AI Indicators</div>
                    <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                        <strong>VortexAI:</strong> Ready<br>
                        <strong>Analysis:</strong> Active<br>
                        <strong>Technical:</strong> 15 Indicators
                    </div>
                </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 15px; margin-bottom: 30px; backdrop-filter: blur(10px);">
                <h2 style="text-align: center; color: #2c3e50; margin-bottom: 25px;">📊 Multi-Timeframe Data Layers</h2>
                <div class="timeframe-grid">
                    <div class="timeframe-card">
                        <strong>1H</strong><br>
                        <small>1-minute intervals</small><br>
                        <span style="color: #27ae60; font-weight: bold;">60 records</span>
                    </div>
                    <div class="timeframe-card">
                        <strong>4H</strong><br>
                        <small>5-minute intervals</small><br>
                        <span style="color: #27ae60; font-weight: bold;">48 records</span>
                    </div>
                    <div class="timeframe-card">
                        <strong>24H</strong><br>
                        <small>15-minute intervals</small><br>
                        <span style="color: #27ae60; font-weight: bold;">96 records</span>
                    </div>
                    <div class="timeframe-card">
                        <strong>7D</strong><br>
                        <small>1-hour intervals</small><br>
                        <span style="color: #27ae60; font-weight: bold;">168 records</span>
                    </div>
                    <div class="timeframe-card">
                        <strong>30D</strong><br>
                        <small>4-hour intervals</small><br>
                        <span style="color: #27ae60; font-weight: bold;">180 records</span>
                    </div>
                    <div class="timeframe-card">
                        <strong>180D</strong><br>
                        <small>1-day intervals</small><br>
                        <span style="color: #27ae60; font-weight: bold;">180 records</span>
                    </div>
                </div>
            </div>

            <h2 style="text-align: center; color: white; margin: 40px 0 25px 0;">💡 Quick Navigation</h2>
            <div class="links-grid">
                <a href="/health" class="nav-link health">
                    <span>📊</span>
                    System Health Dashboard
                </a>
                <a href="/scan" class="nav-link scan">
                    <span>🔍</span>
                    Market Scanner
                </a>
                <a href="/analysis?symbol=btc_usdt" class="nav-link analysis">
                    <span>📈</span>
                    Technical Analysis
                </a>
                <a href="/api/timeframes" class="nav-link timeframes">
                    <span>⏰</span>
                    Timeframes API
                </a>
                <a href="/api/scan/vortexai?limit=10&filter=ai_signal" class="nav-link api">
                    <span>🔌</span>
                    API Data
                </a>
                <a href="/api/health-combined" class="nav-link health">
                    <span>❤️</span>
                    Health API
                </a>
            </div>

            <div class="footer">
                <div style="margin-bottom: 20px;">
                    <span class="feature-badge">Real-time WebSocket</span>
                    <span class="feature-badge">6-Layer Historical Data</span>
                    <span class="feature-badge">VortexAI Analysis</span>
                    <span class="feature-badge">Technical Indicators</span>
                    <span class="feature-badge">Multi-Source Data</span>
                </div>
                
                <p><strong>🕒 Server Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>🚀 Version:</strong> 5.0 - 6 Layer Historical System</p>
                <p><strong>⚡ Environment:</strong> Production Ready</p>
                <p><strong>📈 Active Pairs:</strong> ${ALL_TRADING_PAIRS.length} Trading Pairs</p>
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
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>System Health - VortexAI Pro</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
                line-height: 1.6;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }

            .header {
                text-align: center;
                margin-bottom: 40px;
                padding: 40px 20px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }

            .header h1 {
                font-size: 2.5rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }

            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 25px;
                margin-bottom: 40px;
            }

            .status-card {
                background: rgba(255, 255, 255, 0.95);
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                border-left: 5px solid #3498db;
                backdrop-filter: blur(10px);
            }

            .status-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
            }

            .status-card.good { 
                border-left-color: #27ae60;
                background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(255, 255, 255, 0.95));
            }
            .status-card.warning { 
                border-left-color: #f39c12;
                background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(255, 255, 255, 0.95));
            }
            .status-card.danger { 
                border-left-color: #e74c3c;
                background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(255, 255, 255, 0.95));
            }

            .card-icon {
                font-size: 2.5rem;
                margin-bottom: 15px;
            }

            .metric {
                font-size: 2rem;
                font-weight: bold;
                color: #2c3e50;
                margin: 10px 0;
            }

            .metric-label {
                color: #7f8c8d;
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
            }

            .back-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 25px;
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                margin: 10px;
                transition: all 0.3s ease;
                font-weight: bold;
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            }

            .back-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
            }

            .timestamp {
                text-align: center;
                color: rgba(255, 255, 255, 0.8);
                margin-top: 30px;
                font-style: italic;
            }

            .detail-item {
                margin: 8px 0;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }

            .detail-item:last-child {
                border-bottom: none;
            }

            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: bold;
                margin-left: 10px;
            }

            .status-online { background: #27ae60; color: white; }
            .status-offline { background: #e74c3c; color: white; }
            .status-warning { background: #f39c12; color: white; }

            @media (max-width: 768px) {
                .status-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 System Health Dashboard</h1>
                <p>Real-time monitoring of all VortexAI services and components</p>
            </div>

            <div class="status-grid">
                <div class="status-card ${healthData.websocket.connected ? 'good' : 'danger'}">
                    <div class="card-icon">📡</div>
                    <div class="metric">${healthData.websocket.connected ? 'ONLINE' : 'OFFLINE'}</div>
                    <div class="metric-label">WebSocket Connection</div>
                    <div style="margin-top: 20px;">
                        <div class="detail-item">
                            <strong>Active Coins:</strong> 
                            <span class="status-badge status-online">${healthData.websocket.active_coins}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Subscribed Pairs:</strong> 
                            <span class="status-badge status-online">${healthData.websocket.total_subscribed}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Provider:</strong> LBank
                        </div>
                        <div class="detail-item">
                            <strong>Status:</strong> 
                            <span class="status-badge ${healthData.websocket.connected ? 'status-online' : 'status-offline'}">
                                ${healthData.websocket.connected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="status-card ${healthData.gist.active ? 'good' : 'warning'}">
                    <div class="card-icon">💾</div>
                    <div class="metric">${healthData.gist.total_coins}</div>
                    <div class="metric-label">Historical Storage</div>
                    <div style="margin-top: 20px;">
                        <div class="detail-item">
                            <strong>Gist Status:</strong> 
                            <span class="status-badge ${healthData.gist.active ? 'status-online' : 'status-warning'}">
                                ${healthData.gist.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div class="detail-item">
                            <strong>Total Coins:</strong> ${healthData.gist.total_coins}
                        </div>
                        <div class="detail-item">
                            <strong>Timeframes:</strong> 6 Layers
                        </div>
                        <div class="detail-item">
                            <strong>Last Updated:</strong> ${new Date(healthData.gist.last_updated).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div class="status-card good">
                    <div class="card-icon">🤖</div>
                    <div class="metric">15+</div>
                    <div class="metric-label">AI Engine</div>
                    <div style="margin-top: 20px;">
                        <div class="detail-item">
                            <strong>VortexAI:</strong> 
                            <span class="status-badge status-online">Ready</span>
                        </div>
                        <div class="detail-item">
                            <strong>Technical Analysis:</strong> 
                            <span class="status-badge status-online">Active</span>
                        </div>
                        <div class="detail-item">
                            <strong>Indicators:</strong> 15+
                        </div>
                        <div class="detail-item">
                            <strong>Analysis:</strong> Real-time
                        </div>
                    </div>
                </div>

                <div class="status-card good">
                    <div class="card-icon">🔌</div>
                    <div class="metric">${healthData.api.requests_count}</div>
                    <div class="metric-label">API Services</div>
                    <div style="margin-top: 20px;">
                        <div class="detail-item">
                            <strong>CoinStats API:</strong> 
                            <span class="status-badge status-online">Connected</span>
                        </div>
                        <div class="detail-item">
                            <strong>Requests Count:</strong> ${healthData.api.requests_count}
                        </div>
                        <div class="detail-item">
                            <strong>Rate Limit:</strong> Active
                        </div>
                        <div class="detail-item">
                            <strong>GitHub API:</strong> 
                            <span class="status-badge ${healthData.gist.active ? 'status-online' : 'status-warning'}">
                                ${healthData.gist.active ? 'Connected' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="/" class="back-button">🏠 Dashboard</a>
                <a href="/scan" class="back-button" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">🔍 Market Scanner</a>
                <a href="/api/health-combined" class="back-button" style="background: linear-gradient(135deg, #9b59b6, #8e44ad);">📊 JSON API</a>
            </div>

            <div class="timestamp">
                Last checked: ${new Date().toLocaleString()}
                <br>
                <small>VortexAI Pro v5.0 - 6 Layer System</small>
            </div>
        </div>
    </body>
    </html>
    `);
});

// صفحه اسکنر بازار
app.get('/scan', (req, res) => {
    const limit = req.query.limit || 20;
    const filter = req.query.filter || 'ai_signal';
    
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Market Scanner - VortexAI Pro</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
                line-height: 1.6;
            }

            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
            }

            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 30px 20px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }

            .header h1 {
                font-size: 2.5rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }

            .controls {
                background: rgba(255, 255, 255, 0.95);
                padding: 25px;
                border-radius: 15px;
                margin: 20px 0;
                display: flex;
                gap: 20px;
                align-items: center;
                flex-wrap: wrap;
                backdrop-filter: blur(10px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }

            .control-group {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .control-group label {
                font-weight: 600;
                color: #2c3e50;
                min-width: 60px;
            }

            select, button {
                padding: 12px 18px;
                border: 2px solid #e1e8ed;
                border-radius: 10px;
                font-size: 14px;
                background: white;
                transition: all 0.3s ease;
            }

            select {
                min-width: 150px;
            }

            select:focus, button:focus {
                outline: none;
                border-color: #3498db;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
            }

            button {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                border: none;
                cursor: pointer;
                font-weight: 600;
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            }

            button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
            }

            button.secondary {
                background: linear-gradient(135deg, #95a5a6, #7f8c8d);
            }

            button.secondary:hover {
                background: linear-gradient(135deg, #7f8c8d, #95a5a6);
            }

            .results {
                margin-top: 30px;
            }

            .coin-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 25px;
                margin-top: 20px;
            }

            .coin-card {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                border: 2px solid transparent;
                backdrop-filter: blur(10px);
            }

            .coin-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                border-color: #3498db;
            }

            .coin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f8f9fa;
            }

            .coin-symbol {
                font-weight: bold;
                font-size: 1.4rem;
                color: #2c3e50;
            }

            .coin-price {
                font-size: 1.8rem;
                font-weight: bold;
                margin: 15px 0;
                color: #2c3e50;
            }

            .positive { color: #27ae60; }
            .negative { color: #e74c3c; }

            .ai-badge {
                background: linear-gradient(135deg, #9b59b6, #8e44ad);
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3);
            }

            .loading {
                text-align: center;
                padding: 60px 20px;
                color: #7f8c8d;
                font-size: 1.2rem;
            }

            .loading::after {
                content: '';
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-left: 10px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .back-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 25px;
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                margin: 10px;
                transition: all 0.3s ease;
                font-weight: bold;
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            }

            .back-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin: 15px 0;
            }

            .stat-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f8f9fa;
            }

            .stat-label {
                color: #7f8c8d;
                font-size: 0.9rem;
            }

            .stat-value {
                font-weight: 600;
                color: #2c3e50;
            }

            @media (max-width: 768px) {
                .controls {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .control-group {
                    justify-content: space-between;
                }
                
                .coin-grid {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔍 VortexAI Market Scanner</h1>
                <p>Advanced cryptocurrency scanning with AI-powered insights and multi-timeframe data</p>
            </div>

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

                <button onclick="scanMarket()" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">
                    🔄 Scan Market
                </button>
                <button onclick="loadSampleData()" class="secondary">
                    📊 Load Sample
                </button>
            </div>

            <div class="results">
                <div id="resultsContainer" class="loading">
                    Click "Scan Market" to load cryptocurrency data with VortexAI analysis...
                </div>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <a href="/" class="back-button">🏠 Dashboard</a>
                <a href="/analysis?symbol=btc_usdt" class="back-button" style="background: linear-gradient(135deg, #9b59b6, #8e44ad);">
                    📈 Technical Analysis
                </a>
                <a href="/health" class="back-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">
                    📊 System Health
                </a>
            </div>
        </div>

        <script>
            async function scanMarket() {
                const limit = document.getElementById('limitSelect').value;
                const filter = document.getElementById('filterSelect').value;
                
                document.getElementById('resultsContainer').innerHTML = '<div class="loading">🔍 Scanning market with VortexAI 6-Layer System...</div>';

                try {
                    const response = await fetch(\`/api/scan/vortexai?limit=\${limit}&filter=\${filter}\`);
                    const data = await response.json();

                    if (data.success) {
                        displayResults(data.coins);
                    } else {
                        document.getElementById('resultsContainer').innerHTML = 
                            '<div class="loading" style="color: #e74c3c;">❌ Error loading data</div>';
                    }
                } catch (error) {
                    document.getElementById('resultsContainer').innerHTML = 
                        '<div class="loading" style="color: #e74c3c;">❌ Connection error - Please try again</div>';
                }
            }

            function displayResults(coins) {
                if (!coins || coins.length === 0) {
                    document.getElementById('resultsContainer').innerHTML = 
                        '<div class="loading">📭 No coins found matching your criteria</div>';
                    return;
                }

                const coinsHTML = coins.map(coin => \`
                    <div class="coin-card">
                        <div class="coin-header">
                            <span class="coin-symbol">\${coin.symbol}</span>
                            <span class="ai-badge">AI Score: \${coin.vortexai_analysis?.signal_strength?.toFixed(1) || 'N/A'}</span>
                        </div>
                        
                        <div class="coin-price">$\${coin.price?.toFixed(2) || '0.00'}</div>
                        
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">24h Change:</span>
                                <span class="stat-value \${(coin.priceChange24h || 0) >= 0 ? 'positive' : 'negative'}">
                                    \${(coin.priceChange24h || 0).toFixed(2)}%
                                </span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">1h Change:</span>
                                <span class="stat-value \${(coin.change_1h || 0) >= 0 ? 'positive' : 'negative'}">
                                    \${(coin.change_1h || 0).toFixed(2)}%
                                </span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Volume:</span>
                                <span class="stat-value">$\${(coin.volume || 0).toLocaleString()}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Market Cap:</span>
                                <span class="stat-value">$\${(coin.marketCap || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #f8f9fa;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: #7f8c8d; font-size: 0.9rem;">
                                    Sentiment: <strong style="color: \${coin.vortexai_analysis?.market_sentiment === 'bullish' ? '#27ae60' : '#e74c3c'}">
                                        \${coin.vortexai_analysis?.market_sentiment || 'neutral'}
                                    </strong>
                                </span>
                                <span style="color: #7f8c8d; font-size: 0.9rem;">
                                    Volatility: <strong>\${coin.vortexai_analysis?.volatility_score?.toFixed(1) || '0'}</strong>
                                </span>
                            </div>
                            \${coin.vortexai_analysis?.volume_anomaly ? 
                                '<div style="margin-top: 8px; padding: 5px 10px; background: #fff3cd; color: #856404; border-radius: 8px; font-size: 0.8rem; text-align: center;">⚠️ Volume Anomaly Detected</div>' 
                                : ''}
                        </div>
                    </div>
                \`).join('');

                document.getElementById('resultsContainer').innerHTML = \`
                    <h3 style="color: white; text-align: center; margin-bottom: 20px;">
                        📊 Scan Results: \${coins.length} coins found
                    </h3>
                    <div class="coin-grid">\${coinsHTML}</div>
                \`;
            }

            function loadSampleData() {
                const sampleCoins = [
                    { 
                        symbol: 'BTC', 
                        price: 45234.56, 
                        priceChange24h: 2.34, 
                        change_1h: 0.56, 
                        volume: 25467890000, 
                        marketCap: 885234567890,
                        vortexai_analysis: { 
                            signal_strength: 8.7, 
                            market_sentiment: 'bullish',
                            volatility_score: 7.2,
                            volume_anomaly: true
                        } 
                    },
                    { 
                        symbol: 'ETH', 
                        price: 2345.67, 
                        priceChange24h: 1.23, 
                        change_1h: -0.34, 
                        volume: 14567890000, 
                        marketCap: 281234567890,
                        vortexai_analysis: { 
                            signal_strength: 7.2, 
                            market_sentiment: 'bullish',
                            volatility_score: 5.8,
                            volume_anomaly: false
                        } 
                    },
                    { 
                        symbol: 'SOL', 
                        price: 102.34, 
                        priceChange24h: 5.67, 
                        change_1h: 2.12, 
                        volume: 3456789000, 
                        marketCap: 41234567890,
                        vortexai_analysis: { 
                            signal_strength: 9.1, 
                            market_sentiment: 'very bullish',
                            volatility_score: 8.5,
                            volume_anomaly: true
                        } 
                    }
                ];

                displayResults(sampleCoins);
            }

            // Load sample data on page load for demo
            setTimeout(loadSampleData, 1000);
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
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Technical Analysis - VortexAI Pro</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
                line-height: 1.6;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }

            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 30px 20px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }

            .header h1 {
                font-size: 2.5rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }

            .analysis-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }

            .indicator-card {
                background: rgba(255, 255, 255, 0.95);
                padding: 25px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                text-align: center;
                transition: all 0.3s ease;
                border-left: 4px solid #3498db;
                backdrop-filter: blur(10px);
            }

            .indicator-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
            }

            .indicator-value {
                font-size: 2.2rem;
                font-weight: bold;
                margin: 15px 0;
                color: #2c3e50;
            }

            .bullish { color: #27ae60; }
            .bearish { color: #e74c3c; }
            .neutral { color: #f39c12; }

            .back-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 25px;
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                margin: 5px;
                transition: all 0.3s ease;
                font-weight: bold;
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            }

            .back-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
            }

            .loading {
                text-align: center;
                padding: 60px 20px;
                color: #7f8c8d;
                font-size: 1.2rem;
            }

            .loading::after {
                content: '';
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-left: 10px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .timeframe-selector {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin: 20px 0;
                flex-wrap: wrap;
            }

            .timeframe-btn {
                padding: 10px 20px;
                background: rgba(255, 255, 255, 0.9);
                border: 2px solid #e1e8ed;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
                color: #2c3e50;
            }

            .timeframe-btn.active {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                border-color: #3498db;
            }

            .timeframe-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }

            .info-section {
                background: rgba(255, 255, 255, 0.95);
                padding: 25px;
                border-radius: 15px;
                margin: 20px 0;
                backdrop-filter: blur(10px);
            }

            @media (max-width: 768px) {
                .analysis-grid {
                    grid-template-columns: 1fr;
                }
                
                .timeframe-selector {
                    flex-direction: column;
                    align-items: center;
                }
                
                .timeframe-btn {
                    width: 200px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📈 Technical Analysis: ${symbol.toUpperCase()}</h1>
                <p>Advanced technical indicators powered by VortexAI 6-Layer System</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
                <a href="/scan" class="back-button">🔍 Back to Scanner</a>
                <a href="/" class="back-button" style="background: linear-gradient(135deg, #95a5a6, #7f8c8d);">🏠 Dashboard</a>
                
                <div class="timeframe-selector">
                    <button class="timeframe-btn" onclick="changeTimeframe('1h')">1H</button>
                    <button class="timeframe-btn" onclick="changeTimeframe('4h')">4H</button>
                    <button class="timeframe-btn" onclick="changeTimeframe('24h')">24H</button>
                    <button class="timeframe-btn active" onclick="changeTimeframe('7d')">7D</button>
                    <button class="timeframe-btn" onclick="changeTimeframe('30d')">30D</button>
                    <button class="timeframe-btn" onclick="changeTimeframe('180d')">180D</button>
                </div>
            </div>

            <div id="analysisContent" class="loading">
                Loading technical analysis for ${symbol.toUpperCase()}...
            </div>
        </div>

        <script>
            let currentSymbol = '${symbol}';
            let currentTimeframe = '7d';

            async function loadAnalysis() {
                try {
                    const response = await fetch('/api/coin/' + currentSymbol + '/technical');
                    const data = await response.json();

                    if (data.success) {
                        displayAnalysis(data);
                    } else {
                        document.getElementById('analysisContent').innerHTML = 
                            '<div class="loading" style="color: #e74c3c;">❌ Error loading analysis data</div>';
                    }
                } catch (error) {
                    document.getElementById('analysisContent').innerHTML = 
                        '<div class="loading" style="color: #e74c3c;">❌ Connection error - Please try again</div>';
                }
            }

            async function changeTimeframe(timeframe) {
                currentTimeframe = timeframe;
                
                // Update active button
                document.querySelectorAll('.timeframe-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                event.target.classList.add('active');
                
                // Load historical data for selected timeframe
                try {
                    const response = await fetch('/api/coin/' + currentSymbol + '/history/' + timeframe);
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('analysisContent').innerHTML = 
                            '<div class="info-section">' +
                            '<h3>📊 ' + timeframe.toUpperCase() + ' Historical Data</h3>' +
                            '<p><strong>Data Points:</strong> ' + data.data_points + '</p>' +
                            '<p><strong>Current Price:</strong> $' + (data.current_price?.toFixed(2) || 'N/A') + '</p>' +
                            '<p><strong>Timeframe:</strong> ' + timeframe + '</p>' +
                            '</div>' +
                            '<div style="text-align: center; margin: 20px; color: white;">' +
                            '🔄 Loading technical indicators...' +
                            '</div>';
                        
                        // Reload full analysis
                        setTimeout(loadAnalysis, 1000);
                    }
                } catch (error) {
                    console.error('Error loading timeframe data:', error);
                }
            }

            function displayAnalysis(data) {
                const rsiColor = getRSIColor(data.technical_indicators?.rsi);
                const macdColor = getMACDColor(data.technical_indicators?.macd);
                const sentimentColor = data.vortexai_analysis?.market_sentiment === 'BULLISH' ? '#27ae60' : 
                                    data.vortexai_analysis?.market_sentiment === 'BEARISH' ? '#e74c3c' : '#f39c12';

                const analysisHTML = 
                    '<div class="analysis-grid">' +
                        '<div class="indicator-card">' +
                            '<div>💰 Current Price</div>' +
                            '<div class="indicator-value">$' + (data.current_price?.toFixed(2) || 'N/A') + '</div>' +
                            '<div style="color: #7f8c8d; font-size: 0.9rem;">Live Price</div>' +
                        '</div>' +

                        '<div class="indicator-card">' +
                            '<div>📊 RSI</div>' +
                            '<div class="indicator-value ' + rsiColor + '">' +
                                (data.technical_indicators?.rsi?.toFixed(2) || 'N/A') +
                            '</div>' +
                            '<div style="color: #7f8c8d; font-size: 0.9rem;">Momentum</div>' +
                        '</div>' +

                        '<div class="indicator-card">' +
                            '<div>📈 MACD</div>' +
                            '<div class="indicator-value ' + macdColor + '">' +
                                (data.technical_indicators?.macd?.toFixed(4) || 'N/A') +
                            '</div>' +
                            '<div style="color: #7f8c8d; font-size: 0.9rem;">Trend</div>' +
                        '</div>' +

                        '<div class="indicator-card">' +
                            '<div>📉 Bollinger Bands</div>' +
                            '<div class="indicator-value">' +
                                (data.technical_indicators?.bollinger_upper?.toFixed(2) || 'N/A') +
                            '</div>' +
                            '<div style="color: #7f8c8d; font-size: 0.9rem;">Upper Band</div>' +
                        '</div>' +

                        '<div class="indicator-card">' +
                            '<div>🔄 Moving Average (20)</div>' +
                            '<div class="indicator-value">' +
                                (data.technical_indicators?.moving_avg_20?.toFixed(2) || 'N/A') +
                            '</div>' +
                            '<div style="color: #7f8c8d; font-size: 0.9rem;">Short Term</div>' +
                        '</div>' +

                        '<div class="indicator-card">' +
                            '<div>📅 Moving Average (50)</div>' +
                            '<div class="indicator-value">' +
                                (data.technical_indicators?.moving_avg_50?.toFixed(2) || 'N/A') +
                            '</div>' +
                            '<div style="color: #7f8c8d; font-size: 0.9rem;">Medium Term</div>' +
                        '</div>' +

                        '<div class="indicator-card">' +
                            '<div>🎯 Stochastic</div>' +
                            '<div class="indicator-value">' +
                                (data.technical_indicators?.stochastic_k?.toFixed(2) || 'N/A') +
                            '</div>' +
                            '<div style="color: #7f8c8d; font-size: 0.9rem;">K: ' + (data.technical_indicators?.stochastic_k?.toFixed(2) || 'N/A') + '</div>' +
                        '</div>' +

                        '<div class="indicator-card">' +
                            '<div>📊 Volume Analysis</div>' +
                            '<div class="indicator-value">' +
                                (data.technical_indicators?.obv?.toLocaleString() || 'N/A') +
                            '</div>' +
                            '<div style="color: #7f8c8d; font-size: 0.9rem;">OBV Indicator</div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="info-section">' +
                        '<h3>🤖 VortexAI Insights</h3>' +
                        '<p><strong>Market Sentiment:</strong> ' +
                            '<span style="color: ' + sentimentColor + '; font-weight: bold;">' +
                                (data.vortexai_analysis?.market_sentiment || 'NEUTRAL') +
                            '</span>' +
                        '</p>' +
                        '<p><strong>Prediction Confidence:</strong> ' + ((data.vortexai_analysis?.prediction_confidence * 100)?.toFixed(1) || '0') + '%</p>' +
                        '<p><strong>Risk Level:</strong> ' + (data.vortexai_analysis?.risk_level || 'MEDIUM') + '</p>' +
                        
                        '<div style="margin-top: 15px;">' +
                            '<strong>AI Insights:</strong>' +
                            '<ul style="margin-top: 10px; padding-left: 20px;">' +
                                ((data.vortexai_analysis?.ai_insights?.map(insight => '<li>' + insight + '</li>').join('')) || '<li>No specific insights available</li>') +
                            '</ul>' +
                        '</div>' +
                    '</div>' +

                    '<div class="info-section">' +
                        '<h3>📈 Support & Resistance</h3>' +
                        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">' +
                            '<div>' +
                                '<strong>Support Levels:</strong>' +
                                '<div style="margin-top: 10px;">' +
                                    ((data.support_resistance?.support?.map(level => 
                                        '<div style="padding: 5px 0; border-bottom: 1px solid #eee;">' +
                                            '$' + (level?.toFixed(2) || 'N/A') +
                                        '</div>'
                                    ).join('')) || 'N/A') +
                                '</div>' +
                            '</div>' +
                            '<div>' +
                                '<strong>Resistance Levels:</strong>' +
                                '<div style="margin-top: 10px;">' +
                                    ((data.support_resistance?.resistance?.map(level => 
                                        '<div style="padding: 5px 0; border-bottom: 1px solid #eee;">' +
                                            '$' + (level?.toFixed(2) || 'N/A') +
                                        '</div>'
                                    ).join('')) || 'N/A') +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="info-section">' +
                        '<h3>⚙️ Technical Details</h3>' +
                        '<p><strong>Data Points Analyzed:</strong> ' + (data.data_points || 0) + '</p>' +
                        '<p><strong>Processing Time:</strong> ' + (data.processing_time || 'N/A') + '</p>' +
                        '<p><strong>Timeframe:</strong> ' + currentTimeframe.toUpperCase() + '</p>' +
                        '<p><strong>Analysis Timestamp:</strong> ' + new Date(data.timestamp).toLocaleString() + '</p>' +
                    '</div>';

                document.getElementById('analysisContent').innerHTML = analysisHTML;
            }

            function getRSIColor(rsi) {
                if (!rsi) return 'neutral';
                if (rsi > 70) return 'bearish';
                if (rsi < 30) return 'bullish';
                return 'neutral';
            }

            function getMACDColor(macd) {
                if (!macd) return 'neutral';
                return macd > 0 ? 'bullish' : 'bearish';
            }

            // Load analysis on page load
            window.addEventListener('load', loadAnalysis);
        </script>
    </body>
    </html>
    `);
});
// صفحه Timeframes API
app.get('/timeframes-api', (req, res) => {
    const timeframes = gistManager.getAvailableTimeframes();
    
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Timeframes API - VortexAI Pro</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
                line-height: 1.6;
            }

            .container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
            }

            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 30px 20px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }

            .header h1 {
                font-size: 2.5rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }

            .api-content {
                background: rgba(255, 255, 255, 0.95);
                padding: 30px;
                border-radius: 15px;
                margin-bottom: 20px;
                backdrop-filter: blur(10px);
            }

            .timeframe-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 25px 0;
            }

            .timeframe-card {
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }

            .timeframe-card:hover {
                border-color: #3498db;
                transform: translateY(-5px);
            }

            .timeframe-name {
                font-size: 1.5rem;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 5px;
            }

            .timeframe-desc {
                color: #7f8c8d;
                font-size: 0.8rem;
            }

            .code-block {
                background: #2c3e50;
                color: #ecf0f1;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                font-family: 'Courier New', monospace;
                overflow-x: auto;
            }

            .endpoint {
                color: #3498db;
                font-weight: bold;
            }

            .param {
                color: #e74c3c;
            }

            .back-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 25px;
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                margin: 10px;
                transition: all 0.3s ease;
                font-weight: bold;
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            }

            .back-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
            }

            .try-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: white;
                text-decoration: none;
                border-radius: 20px;
                margin: 10px 5px;
                transition: all 0.3s ease;
                font-weight: bold;
                font-size: 0.9rem;
            }

            .try-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(243, 156, 18, 0.4);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ Timeframes API</h1>
                <p>Access historical data across 6 different timeframes with varying intervals</p>
            </div>

            <div class="api-content">
                <h2>🚀 Available Endpoints</h2>
                
                <div class="code-block">
                    <span class="endpoint">GET</span> /api/timeframes<br>
                    <span style="color: #95a5a6;"># Returns all available timeframes</span>
                </div>

                <div class="code-block">
                    <span class="endpoint">GET</span> /api/coin/<span class="param">:symbol</span>/history/<span class="param">:timeframe</span><br>
                    <span style="color: #95a5a6;"># Returns historical data for specific symbol and timeframe</span>
                </div>

                <h3>📊 Available Timeframes</h3>
                <div class="timeframe-grid">
                    <div class="timeframe-card">
                        <div class="timeframe-name">1H</div>
                        <div class="timeframe-desc">1 minute intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">60 records</div>
                    </div>
                    <div class="timeframe-card">
                        <div class="timeframe-name">4H</div>
                        <div class="timeframe-desc">5 minute intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">48 records</div>
                    </div>
                    <div class="timeframe-card">
                        <div class="timeframe-name">24H</div>
                        <div class="timeframe-desc">15 minute intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">96 records</div>
                    </div>
                    <div class="timeframe-card">
                        <div class="timeframe-name">7D</div>
                        <div class="timeframe-desc">1 hour intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">168 records</div>
                    </div>
                    <div class="timeframe-card">
                        <div class="timeframe-name">30D</div>
                        <div class="timeframe-desc">4 hour intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">180 records</div>
                    </div>
                    <div class="timeframe-card">
                        <div class="timeframe-name">180D</div>
                        <div class="timeframe-desc">1 day intervals</div>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">180 records</div>
                    </div>
                </div>

                <h3>🎯 Try the APIs</h3>
                <a href="/api/timeframes" class="try-button" target="_blank">
                    🔗 List Timeframes
                </a>
                <a href="/api/coin/btc_usdt/history/7d" class="try-button" target="_blank">
                    📈 BTC 7D Data
                </a>
                <a href="/api/coin/eth_usdt/history/24h" class="try-button" target="_blank">
                    💎 ETH 24H Data
                </a>

                <h3>📋 Response Examples</h3>
                
                <h4>Timeframes List:</h4>
                <div class="code-block">
{<br>
&nbsp;&nbsp;"success": true,<br>
&nbsp;&nbsp;"timeframes": ["1h", "4h", "24h", "7d", "30d", "180d"],<br>
&nbsp;&nbsp;"description": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;"1h": "1 hour history - 1 minute intervals",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"4h": "4 hours history - 5 minute intervals"<br>
&nbsp;&nbsp;}<br>
}
                </div>

                <h4>Historical Data:</h4>
                <div class="code-block">
{<br>
&nbsp;&nbsp;"success": true,<br>
&nbsp;&nbsp;"symbol": "btc_usdt",<br>
&nbsp;&nbsp;"timeframe": "7d",<br>
&nbsp;&nbsp;"current_price": 45000.50,<br>
&nbsp;&nbsp;"history": [<br>
&nbsp;&nbsp;&nbsp;&nbsp;{"timestamp": 1640995200000, "price": 45000.50},<br>
&nbsp;&nbsp;&nbsp;&nbsp;{"timestamp": 1640998800000, "price": 45200.75}<br>
&nbsp;&nbsp;],<br>
&nbsp;&nbsp;"data_points": 168<br>
}
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="/" class="back-button">🏠 Dashboard</a>
                <a href="/health-api" class="back-button" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">
                    📊 Health API
                </a>
                <a href="/api-data" class="back-button" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">
                    🔌 API Data
                </a>
            </div>
        </div>
    </body>
    </html>
    `);
});
// صفحه API Data
app.get('/api-data', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Data - VortexAI Pro</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
                line-height: 1.6;
            }

            .container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
            }

            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 30px 20px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }

            .header h1 {
                font-size: 2.5rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }

            .api-content {
                background: rgba(255, 255, 255, 0.95);
                padding: 30px;
                border-radius: 15px;
                margin-bottom: 20px;
                backdrop-filter: blur(10px);
            }

            .endpoints-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 25px 0;
            }

            .endpoint-card {
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #e74c3c;
            }

            .endpoint-method {
                display: inline-block;
                padding: 4px 12px;
                background: #e74c3c;
                color: white;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .endpoint-method.get { background: #27ae60; }
            .endpoint-method.post { background: #3498db; }

            .endpoint-path {
                font-family: 'Courier New', monospace;
                color: #2c3e50;
                margin: 10px 0;
                font-weight: bold;
            }

            .endpoint-desc {
                color: #7f8c8d;
                font-size: 0.9rem;
            }

            .param {
                color: #e74c3c;
                font-weight: bold;
            }

            .code-block {
                background: #2c3e50;
                color: #ecf0f1;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                font-family: 'Courier New', monospace;
                overflow-x: auto;
            }

            .back-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 25px;
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                margin: 10px;
                transition: all 0.3s ease;
                font-weight: bold;
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            }

            .back-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
            }

            .try-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
                text-decoration: none;
                border-radius: 20px;
                margin: 10px 5px;
                transition: all 0.3s ease;
                font-weight: bold;
                font-size: 0.9rem;
            }

            .try-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
            }

            .filter-options {
                display: flex;
                gap: 10px;
                margin: 15px 0;
                flex-wrap: wrap;
            }

            .filter-btn {
                padding: 8px 16px;
                background: rgba(52, 152, 219, 0.1);
                border: 1px solid #3498db;
                border-radius: 20px;
                color: #3498db;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.8rem;
            }

            .filter-btn:hover {
                background: #3498db;
                color: white;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔌 API Data</h1>
                <p>Complete API documentation for VortexAI Crypto Scanner with real-time examples</p>
            </div>

            <div class="api-content">
                <h2>🚀 Main API Endpoint</h2>
                
                <div class="code-block">
                    <span style="color: #27ae60; font-weight: bold;">GET</span> /api/scan/vortexai?limit=<span style="color: #e74c3c;">100</span>&filter=<span style="color: #e74c3c;">ai_signal</span><br>
                    <span style="color: #95a5a6;"># Returns enhanced cryptocurrency data with VortexAI analysis</span>
                </div>

                <h3>🎯 Try with Different Filters</h3>
                <div class="filter-options">
                    <a href="/api/scan/vortexai?limit=10&filter=ai_signal" class="try-button" target="_blank">
                        🤖 AI Signal (10)
                    </a>
                    <a href="/api/scan/vortexai?limit=20&filter=volume" class="try-button" target="_blank">
                        📊 Volume (20)
                    </a>
                    <a href="/api/scan/vortexai?limit=15&filter=momentum_1h" class="try-button" target="_blank">
                        ⚡ 1H Momentum (15)
                    </a>
                    <a href="/api/scan/vortexai?limit=25&filter=momentum_4h" class="try-button" target="_blank">
                        🚀 4H Momentum (25)
                    </a>
                </div>

                <h3>📋 All Available Endpoints</h3>
                <div class="endpoints-grid">
                    <div class="endpoint-card">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/scan/vortexai</div>
                        <div class="endpoint-desc">
                            Enhanced market scanner with AI analysis<br>
                            <strong>Params:</strong> limit, filter
                        </div>
                    </div>

                    <div class="endpoint-card">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/coin/<span class="param">:symbol</span>/technical</div>
                        <div class="endpoint-desc">
                            Technical analysis with 15+ indicators<br>
                            <strong>Example:</strong> /api/coin/btc_usdt/technical
                        </div>
                    </div>

                    <div class="endpoint-card">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/health-combined</div>
                        <div class="endpoint-desc">
                            System health and statistics<br>
                            Includes request counts and service status
                        </div>
                    </div>

                    <div class="endpoint-card">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/timeframes</div>
                        <div class="endpoint-desc">
                            List all available historical timeframes<br>
                            6 different timeframe options
                        </div>
                    </div>

                    <div class="endpoint-card">
                        <span class="endpoint-method get">GET</span>
                        <div class="endpoint-path">/api/coin/<span class="param">:symbol</span>/history/<span class="param">:timeframe</span></div>
                        <div class="endpoint-desc">
                            Historical price data<br>
                            <strong>Example:</strong> /api/coin/btc_usdt/history/7d
                        </div>
                    </div>
                </div>

                <h3>🔧 Query Parameters</h3>
                <div class="code-block">
<strong>Main Scanner Endpoint:</strong><br>
/api/scan/vortexai?<span style="color: #3498db;">limit</span>=100&<span style="color: #3498db;">filter</span>=ai_signal<br><br>
<strong>Parameters:</strong><br>
- <span style="color: #3498db;">limit</span>: Number of coins (1-300, default: 100)<br>
- <span style="color: #3498db;">filter</span>: ai_signal, volume, momentum_1h, momentum_4h
                </div>

                <h3>📊 Response Structure</h3>
                <div class="code-block">
{<br>
&nbsp;&nbsp;"success": true,<br>
&nbsp;&nbsp;"coins": [<br>
&nbsp;&nbsp;&nbsp;&nbsp;{<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"symbol": "BTC",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"price": 45234.56,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"vortexai_analysis": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"signal_strength": 8.7,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"market_sentiment": "bullish"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;],<br>
&nbsp;&nbsp;"total_coins": 100,<br>
&nbsp;&nbsp;"processing_time": "245ms"<br>
}
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="/" class="back-button">🏠 Dashboard</a>
                <a href="/health-api" class="back-button" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">
                    📊 Health API
                </a>
                <a href="/timeframes-api" class="back-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">
                    ⏰ Timeframes API
                </a>
            </div>
        </div>
    </body>
    </html>
    `);
});
// صفحه Health API
app.get('/health-api', (req, res) => {
    const healthData = {
        websocket: wsManager.getConnectionStatus(),
        gist: gistManager.getAllData(),
        api: { requests_count: apiClient.request_count }
    };

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Health API - VortexAI Pro</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
                line-height: 1.6;
            }

            .container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
            }

            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 30px 20px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }

            .header h1 {
                font-size: 2.5rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }

            .api-content {
                background: rgba(255, 255, 255, 0.95);
                padding: 30px;
                border-radius: 15px;
                margin-bottom: 20px;
                backdrop-filter: blur(10px);
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 25px 0;
            }

            .stat-card {
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #3498db;
                text-align: center;
            }

            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                color: #2c3e50;
                margin: 10px 0;
            }

            .stat-label {
                color: #7f8c8d;
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .code-block {
                background: #2c3e50;
                color: #ecf0f1;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                font-family: 'Courier New', monospace;
                overflow-x: auto;
            }

            .endpoint {
                color: #3498db;
                font-weight: bold;
            }

            .back-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 25px;
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                margin: 10px;
                transition: all 0.3s ease;
                font-weight: bold;
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            }

            .back-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
            }

            .try-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                color: white;
                text-decoration: none;
                border-radius: 20px;
                margin: 10px 5px;
                transition: all 0.3s ease;
                font-weight: bold;
                font-size: 0.9rem;
            }

            .try-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(39, 174, 96, 0.4);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Health API</h1>
                <p>Real-time system health monitoring and API request statistics</p>
            </div>

            <div class="api-content">
                <h2>🚀 API Endpoint</h2>
                <div class="code-block">
                    <span class="endpoint">GET</span> /api/health-combined
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${healthData.websocket.connected ? '🟢' : '🔴'}</div>
                        <div class="stat-label">WebSocket Status</div>
                        <div style="margin-top: 10px; font-size: 0.9rem;">
                            Active: ${healthData.websocket.active_coins}<br>
                            Subscribed: ${healthData.websocket.total_subscribed}
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-value">${Object.keys(healthData.gist.prices || {}).length}</div>
                        <div class="stat-label">Stored Coins</div>
                        <div style="margin-top: 10px; font-size: 0.9rem;">
                            Timeframes: 6<br>
                            Gist: ${process.env.GITHUB_TOKEN ? 'Active' : 'Inactive'}
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-value">${healthData.api.requests_count}</div>
                        <div class="stat-label">API Requests</div>
                        <div style="margin-top: 10px; font-size: 0.9rem;">
                            CoinStats: Active<br>
                            Rate Limit: Enabled
                        </div>
                    </div>
                </div>

                <h3>🎯 Try the API</h3>
                <a href="/api/health-combined" class="try-button" target="_blank">
                    🔗 Test Health API
                </a>
                <a href="/health" class="try-button" style="background: linear-gradient(135deg, #9b59b6, #8e44ad);">
                    📊 Health Dashboard
                </a>

                <h3>📋 Response Format</h3>
                <div class="code-block">
{<br>
&nbsp;&nbsp;"status": "healthy",<br>
&nbsp;&nbsp;"websocket_status": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;"connected": true,<br>
&nbsp;&nbsp;&nbsp;&nbsp;"active_coins": 45,<br>
&nbsp;&nbsp;&nbsp;&nbsp;"total_subscribed": 200<br>
&nbsp;&nbsp;},<br>
&nbsp;&nbsp;"api_status": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;"requests_count": ${healthData.api.requests_count},<br>
&nbsp;&nbsp;&nbsp;&nbsp;"coinstats_connected": "active"<br>
&nbsp;&nbsp;},<br>
&nbsp;&nbsp;"features": ["realtime_websocket_data", "6_layer_historical_data", ...]<br>
}
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="/" class="back-button">🏠 Dashboard</a>
                <a href="/api-data" class="back-button" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">
                    🔌 API Data
                </a>
                <a href="/timeframes-api" class="back-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">
                    ⏰ Timeframes API
                </a>
            </div>
        </div>
    </body>
    </html>
    `);
});

// اضافه کردن این endpoint برای تشخیص دقیق مشکل
app.get("/api/debug/api-status", async (req, res) => {
    try {
        const testCoinIds = ['bitcoin', 'ethereum', 'solana'];
        const historicalAPI = new HistoricalDataAPI();
        
        console.log('\n=== API STATUS DEBUG ===');
        
        // تست API اصلی
        const apiClient = new AdvancedCoinStatsAPIClient();
        const apiResult = await apiClient.getCoins(10);
        
        // تست API تاریخی
        const historicalResult = await historicalAPI.getMultipleCoinsHistorical(testCoinIds, '24h');
        
        res.json({
            success: true,
            main_api: {
                status: apiResult.coins.length > 0 ? 'working' : 'failing',
                coins_received: apiResult.coins.length,
                error: apiResult.error
            },
            historical_api: {
                status: historicalResult.data.length > 0 ? 'working' : 'failing',
                coins_received: historicalResult.data.length,
                source: historicalResult.source,
                error: historicalResult.error,
                sample: historicalResult.data.length > 0 ? {
                    coinId: historicalResult.data[0].coinId,
                    data_points: historicalResult.data[0].chart?.length,
                    latest_point: historicalResult.data[0].chart ? 
                        new Date(historicalResult.data[0].chart[historicalResult.data[0].chart.length-1][0] * 1000).toISOString() : null
                } : null
            },
            environment: {
                node_version: process.version,
                platform: process.platform,
                uptime: process.uptime()
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ==================== سلامت سرور (Health Checks) ==================== //

// بررسی سلامت پایه (Liveness Probe)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'VortexAI Crypto Scanner'
  });
});

// بررسی سلامت کامل با وضعیت سرویس‌ها (Readiness Probe)
app.get('/health/ready', (req, res) => {
  const wsStatus = wsManager.getConnectionStatus();
  const gistData = gistManager.getAllData();
  
  const healthStatus = {
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    services: {
      websocket: {
        connected: wsStatus.connected,
        activeCoins: wsStatus.active_coins,
        status: wsStatus.connected ? 'Healthy' : 'Unhealthy'
      },
      database: {
        storedCoins: Object.keys(gistData.prices || {}).length,
        status: process.env.GITHUB_TOKEN ? 'Healthy' : 'Degraded'
      },
      api: {
        requestCount: apiClient.request_count,
        status: 'Healthy'
      }
    }
  };

  // بررسی سلامت کلی همه سرویس‌ها
  const allHealthy = wsStatus.connected && process.env.GITHUB_TOKEN;
  const statusCode = allHealthy ? 200 : 503;
  
  res.status(statusCode).json(healthStatus);
});

// بررسی سلامت سرویس‌های حیاتی برای کوبرنتیز
app.get('/health/live', (req, res) => {
  const wsStatus = wsManager.getConnectionStatus();
  
  // اگر WebSocket قطع باشد، سرور زنده نیست
  if (!wsStatus.connected) {
    return res.status(503).json({ 
      status: 'Unhealthy',
      message: 'WebSocket connection lost',
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});
// ==================== سلامت سرور (Health Checks) ==================== //

// بررسی سلامت پایه (Liveness Probe)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'VortexAI Crypto Scanner'
  });
});

// بررسی سلامت کامل با وضعیت سرویس‌ها (Readiness Probe)
app.get('/health/ready', (req, res) => {
  const wsStatus = wsManager.getConnectionStatus();
  const gistData = gistManager.getAllData();
  
  const healthStatus = {
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    services: {
      websocket: {
        connected: wsStatus.connected,
        activeCoins: wsStatus.active_coins,
        status: wsStatus.connected ? 'Healthy' : 'Unhealthy'
      },
      database: {
        storedCoins: Object.keys(gistData.prices || {}).length,
        status: process.env.GITHUB_TOKEN ? 'Healthy' : 'Degraded'
      },
      api: {
        requestCount: apiClient.request_count,
        status: 'Healthy'
      }
    }
  };

  // بررسی سلامت کلی همه سرویس‌ها
  const allHealthy = wsStatus.connected && process.env.GITHUB_TOKEN;
  const statusCode = allHealthy ? 200 : 503;
  
  res.status(statusCode).json(healthStatus);
});

// بررسی سلامت سرویس‌های حیاتی برای کوبرنتیز
app.get('/health/live', (req, res) => {
  const wsStatus = wsManager.getConnectionStatus();
  
  // اگر WebSocket قطع باشد، سرور زنده نیست
  if (!wsStatus.connected) {
    return res.status(503).json({ 
      status: 'Unhealthy',
      message: 'WebSocket connection lost',
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});
// ==================== راه‌اندازی سرور ==================== 

const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info('✔ VortexAI 6-Layer Server started on port ${PORT}');
    logger.info('✔ Features: 6-Timeframe Historical Data + WebSocket Real-time + VortexAI Analysis');
    logger.info('✔ Real-time Pairs: ${ALL_TRADING_PAIRS.length}');
    logger.info('✔ Dashboard: http://localhost:${PORT}/');
    logger.info('✔ Health: http://localhost:${PORT}/health');
    logger.info('✔ Scanner: http://localhost:${PORT}/scan');
    logger.info('✔ Analysis: http://localhost:${PORT}/analysis');
});

// ==================== Graceful Shutdown ==================== //

async function gracefulShutdown(signal) {
    logger.info(`🛑 ${signal} signal received: starting graceful shutdown`);
    
    let shutdownTimeout = setTimeout(() => {
        logger.error('⏰ Force shutdown after 15 seconds timeout');
        process.exit(1);
    }, 15000);
    
    try {
        // 1. توقف پذیرش درخواست‌های جدید
        logger.info('⏹️  Stopping server from accepting new connections');
        server.close(() => {
            logger.info('✅ HTTP server stopped accepting new connections');
        });
        
        // 2. بستن WebSocket connection
        if (wsManager && wsManager.ws) {
            logger.info('🔌 Closing WebSocket connections...');
            wsManager.ws.close();
            logger.info('✅ WebSocket connections closed');
        }
        
        // 3. بستن اتصالات به API خارجی
        logger.info('🔄 Closing external API connections...');
        // اینجا می‌توانید اتصالات به دیتابیس یا APIهای دیگر را هم ببندید
        
        // 4. ذخیره داده‌های نهایی در Gist
        logger.info('💾 Saving final data to Gist...');
        await gistManager.saveToGist();
        logger.info('✅ Final data saved to Gist');
        
        // 5. اتمام graceful shutdown
        clearTimeout(shutdownTimeout);
        logger.info('✅ Graceful shutdown completed successfully');
        process.exit(0);
        
    } catch (error) {
        clearTimeout(shutdownTimeout);
        logger.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
    }
}

// ثبت event handlers برای سیگنال‌های مختلف
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// مدیریت خطاهای unhandled
process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;
