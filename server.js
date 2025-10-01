const express = require('express');
const axios = require('axios');
const cors = require('cors');
const WebSocket = require('ws');
const { Octokit } = require('@octokit/rest');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ کلید API معتبر
const COINSTATS_API_KEY = "7qmXYUHlF+DWnF9fYml4Klz+/leL7EBRH+mA2WrpsEc=";

app.use(cors());
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// ✅ کش برای داده‌ها
let cache = {
    coinsList: { data: null, timestamp: null },
    historicalData: {},
    realtimePrices: {}
};

// ✅ لیست کامل 300 جفت ارز برای LBank
const ALL_TRADING_PAIRS = [
    "btc_usdt", "eth_usdt", "xrp_usdt", "ada_usdt", "dot_usdt", "doge_usdt", "sol_usdt", "matic_usdt", "avax_usdt", "link_usdt",
    "bch_usdt", "ltc_usdt", "etc_usdt", "trx_usdt", "atom_usdt", "bnb_usdt", "xlm_usdt", "eos_usdt", "xtz_usdt", "algo_usdt",
    "neo_usdt", "ftm_usdt", "hbar_usdt", "egld_usdt", "theta_usdt", "vet_usdt", "fil_usdt", "icp_usdt", "xmr_usdt", "ape_usdt",
    "gala_usdt", "sand_usdt", "mana_usdt", "enj_usdt", "bat_usdt", "comp_usdt", "mkr_usdt", "zec_usdt", "dash_usdt", "waves_usdt",
    "omg_usdt", "zil_usdt", "ont_usdt", "iost_usdt", "stx_usdt", "celo_usdt", "rvn_usdt", "sc_usdt", "zen_usdt", "hot_usdt",
    "iotx_usdt", "ong_usdt", "one_usdt", "nano_usdt", "ardr_usdt", "qtum_usdt", "lsk_usdt", "strat_usdt", "kmd_usdt", "pivx_usdt",
    "grs_usdt", "nav_usdt", "emc2_usdt", "xvg_usdt", "sys_usdt", "via_usdt", "mona_usdt", "dcr_usdt", "sia_usdt", "lbc_usdt",
    "rep_usdt", "gnt_usdt", "loom_usdt", "poly_usdt", "ren_usdt", "fun_usdt", "req_usdt", "salt_usdt", "mtl_usdt", "mco_usdt",
    "edo_usdt", "powr_usdt", "lrc_usdt", "gto_usdt", "eng_usdt", "ast_usdt", "dgd_usdt", "adx_usdt", "qsp_usdt", "mda_usdt",
    "snt_usdt", "agix_usdt", "ocean_usdt", "band_usdt", "nmr_usdt", "rlc_usdt", "uos_usdt", "storj_usdt", "keep_usdt", "orn_usdt",
    "front_usdt", "perp_usdt", "api3_usdt", "grt_usdt", "lqty_usdt", "alcx_usdt", "pool_usdt", "rad_usdt", "farm_usdt", "audio_usdt",
    "fis_usdt", "dodo_usdt", "tlm_usdt", "ilv_usdt", "ygg_usdt", "slp_usdt", "axs_usdt", "sandbox_usdt", "enjin_usdt", "rndr_usdt",
    "flow_usdt", "rose_usdt", "ar_usdt", "rune_usdt", "sushi_usdt", "crv_usdt", "1inch_usdt", "knc_usdt", "bal_usdt", "uma_usdt",
    "badger_usdt", "fxs_usdt", "cvx_usdt", "tribe_usdt", "gno_usdt", "ilus_usdt", "pla_usdt", "super_usdt", "ach_usdt", "imx_usdt",
    "gods_usdt", "vra_usdt", "sps_usdt", "dar_usdt", "mgp_usdt", "ceek_usdt", "titan_usdt", "vr_usdt", "bnx_usdt", "hero_usdt",
    "pyr_usdt", "ufo_usdt", "elon_usdt", "shib_usdt", "floki_usdt", "samo_usdt", "baby_usdt", "kishu_usdt", "hoge_usdt", "akita_usdt",
    "husky_usdt", "safemoon_usdt", "evergrow_usdt", "lunc_usdt", "bonk_usdt", "wif_usdt", "myro_usdt", "popcat_usdt", "toshi_usdt",
    "mew_usdt", "mog_usdt", "rett_usdt", "turbo_usdt", "pepe_usdt", "wojak_usdt", "aidos_usdt", "pudgy_usdt", "lady_usdt", "jeo_usdt",
    "based_usdt", "degen_usdt", "moutai_usdt", "aave_usdt", "snx_usdt", "uni_usdt", "cake_usdt", "bake_usdt", "burger_usdt", "toko_usdt",
    "inj_usdt", "lina_usdt", "reef_usdt", "dusk_usdt", "atm_usdt", "ogn_usdt", "for_usdt", "mir_usdt", "lto_usdt", "cos_usdt",
    "ctk_usdt", "tko_usdt", "alpaca_usdt", "perl_usdt", "stpt_usdt", "troy_usdt", "vite_usdt", "sxp_usdt", "hbtc_usdt", "mdt_usdt",
    "mbox_usdt", "gmt_usdt", "time_usdt", "raca_usdt", "beans_usdt", "edu_usdt", "id_usdt", "ondo_usdt", "pixel_usdt", "voxel_usdt",
    "high_usdt", "looks_usdt", "blur_usdt", "psp_usdt", "oxt_usdt", "num_usdt", "mask_usdt", "glm_usdt", "ant_usdt", "bond_usdt",
    "fida_usdt", "maps_usdt", "drep_usdt", "pcx_usdt", "clv_usdt", "cfx_usdt", "ckb_usdt", "mx_usdt", "celr_usdt", "fet_usdt",
    "stmx_usdt", "chz_usdt", "ankr_usdt", "coti_usdt", "skl_usdt", "arpa_usdt", "strax_usdt", "fio_usdt", "mbl_usdt", "quick_usdt",
    "sfund_usdt", "bsw_usdt", "axie_usdt", "tfuel_usdt", "hnt_usdt", "loka_usdt", "dydx_usdt", "pundix_usdt", "vtho_usdt", "dent_usdt",
    "rsr_usdt", "cvc_usdt", "data_usdt", "nkn_usdt", "lit_usdt", "key_usdt", "dock_usdt", "phb_usdt", "mxc_usdt", "front_usdt"
];

// ✅ کلاس Gist Manager برای ذخیره‌سازی داده‌های تاریخی
class GistManager {
    constructor() {
        this.octokit = new Octokit({ 
            auth: process.env.GITHUB_TOKEN 
        });
        this.gistId = process.env.GIST_ID;
        this.priceHistory = { prices: {}, last_updated: new Date().toISOString() };
        this.init();
    }

    async init() {
        try {
            if (this.gistId) {
                await this.loadFromGist();
            }
            // ذخیره خودکار هر 5 دقیقه
            setInterval(() => this.saveToGist(), 300000);
            console.log('✅ Gist Manager راه‌اندازی شد');
        } catch (error) {
            console.error('❌ خطا در راه‌اندازی Gist Manager:', error);
        }
    }

    async loadFromGist() {
        try {
            const response = await this.octokit.rest.gists.get({
                gist_id: this.gistId
            });

            const content = response.data.files['prices.json'].content;
            this.priceHistory = JSON.parse(content);
            console.log('✅ داده‌ها از Gist بارگذاری شد');
        } catch (error) {
            console.log('ℹ️ Gist پیدا نشد، با داده خالی شروع میکنیم');
            this.priceHistory = { prices: {}, last_updated: new Date().toISOString() };
        }
    }

    async saveToGist() {
        try {
            this.priceHistory.last_updated = new Date().toISOString();
            const content = JSON.stringify(this.priceHistory, null, 2);

            if (!this.gistId) {
                // ایجاد Gist جدید
                const response = await this.octokit.rest.gists.create({
                    description: 'CryptoScanner Price Data - Historical 1h/4h Changes',
                    files: {
                        'prices.json': {
                            content: content
                        }
                    },
                    public: false
                });
                this.gistId = response.data.id;
                console.log('✅ Gist جدید ایجاد شد:', this.gistId);
            } else {
                // آپدیت Gist موجود
                await this.octokit.rest.gists.update({
                    gist_id: this.gistId,
                    files: {
                        'prices.json': {
                            content: content
                        }
                    }
                });
                console.log('💾 داده‌ها در Gist ذخیره شد');
            }
        } catch (error) {
            console.error('❌ خطا در ذخیره Gist:', error);
        }
    }

    // اضافه کردن قیمت جدید و محاسبه تغییرات
    addPrice(symbol, currentPrice) {
        if (!this.priceHistory.prices) this.priceHistory.prices = {};
        
        const now = Date.now();
        const existingData = this.priceHistory.prices[symbol] || {};
        
        // محاسبه تغییرات 1h و 4h
        const change1h = this.calculateChange(symbol, currentPrice, 60);
        const change4h = this.calculateChange(symbol, currentPrice, 240);
        
        this.priceHistory.prices[symbol] = {
            price: currentPrice,
            timestamp: now,
            change_1h: change1h,
            change_4h: change4h,
            history: existingData.history || []
        };
        
        // اضافه کردن به تاریخچه (حداکثر 24 ساعت)
        this.priceHistory.prices[symbol].history.push({
            timestamp: now,
            price: currentPrice
        });
        
        // حفظ فقط 24 ساعت داده
        this.cleanOldHistory(symbol);
    }

    // محاسبه تغییرات بر اساس تاریخچه
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
            if (diff < minDiff && diff <= 300000) { // 5 دقیقه tolerance
                minDiff = diff;
                closest = item.price;
            }
        }
        
        return closest;
    }

    cleanOldHistory(symbol) {
        const data = this.priceHistory.prices[symbol];
        if (!data || !data.history) return;
        
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 ساعت قبل
        data.history = data.history.filter(item => item.timestamp >= cutoffTime);
    }

    // گرفتن داده‌های تاریخی
    getPriceData(symbol) {
        return this.priceHistory.prices?.[symbol] || null;
    }

    // گرفتن تمام داده‌ها
    getAllData() {
        return this.priceHistory;
    }
}

// ✅ ایجاد Gist Manager
const gistManager = new GistManager();

// ✅ کلاس WebSocketManager برای LBank
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
                console.log('✅ WebSocket به LBank متصل شد');
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
                    console.error('❌ خطا در پردازش WebSocket message:', error);
                }
            });

            this.ws.on('error', (error) => {
                console.error('❌ WebSocket error:', error);
                this.connected = false;
            });

            this.ws.on('close', (code, reason) => {
                console.log(`🔌 WebSocket disconnected - Code: ${code}, Reason: ${reason}`);
                this.connected = false;
                setTimeout(() => {
                    console.log('🔄 تلاش برای اتصال مجدد WebSocket...');
                    this.connect();
                }, 5000);
            });

        } catch (error) {
            console.error('❌ خطا در اتصال WebSocket:', error);
            setTimeout(() => this.connect(), 10000);
        }
    }

    subscribeToAllPairs() {
        if (this.connected && this.ws) {
            console.log(`📨 شروع Subscribe به ${ALL_TRADING_PAIRS.length} جفت ارز...`);
            
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
        console.log(`✅ Subscribe به ${pairs.length} جفت ارز انجام شد`);
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

// ✅ راه‌اندازی WebSocket
const wsManager = new WebSocketManager();

// ==================== ENDPOINTهای اصلی ====================

// صفحه اصلی
app.get('/', (req, res) => {
    res.json({ 
        message: 'سرور میانی فعال - CryptoScanner Pro v3.0',
        endpoints: {
            health: '/health',
            scan_all: '/scan-all?limit=100|200|300&filter=volume|momentum|breakout|oversold|overbought',
            scan_advanced: '/scan-advanced?limit=100|200|300&filter=volume|momentum_1h|momentum_4h|breakout|oversold|overbought',
            coins_list: '/api/coins/list',
            realtime_prices: '/api/coins/realtime',
            market_overview: '/api/market/overview',
            websocket_status: '/api/websocket/status',
            gist_status: '/api/gist/status'
        },
        features: {
            historical_data: true,
            gist_storage: true,
            realtime_updates: true,
            multi_timeframe: true
        },
        timestamp: new Date().toISOString()
    });
});

// سلامت سرور
app.get('/health', (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();
    
    res.json({ 
        status: 'OK', 
        message: 'سرور میانی سالم است!',
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
        timestamp: new Date().toISOString()
    });
});

// ✅ endpoint اصلی اسکن - نسخه پیشرفته
app.get('/scan-advanced', async (req, res) => {
    const startTime = Date.now();
    
    try {
        let limit = parseInt(req.query.limit) || 100;
        const filterType = req.query.filter || 'volume';
        
        // ✅ تطبیق فیلترها با فرانت‌اند
        const filterMapping = {
            'volume': 'volume',
            'momentum_1h': 'momentum_1h',
            'momentum_4h': 'momentum_4h', 
            'breakout': 'signals',
            'oversold': 'price_change_24h',
            'overbought': 'price_change_24h'
        };
        
        const serverFilter = filterMapping[filterType] || 'volume';
        
        console.log('🌐 اسکن پیشرفته بازار...', 'تعداد:', limit, 'فیلتر:', filterType);
        
        // دریافت داده از CoinStats API
        const response = await axios.get(
            'https://openapiv1.coinstats.app/coins',
            {
                headers: {
                    'X-API-KEY': COINSTATS_API_KEY
                },
                params: {
                    limit: Math.min(limit, 300),
                    currency: 'USD'
                },
                timeout: 30000
            }
        );
        
        let coins = response.data.result || response.data;
        
        if (!coins || !Array.isArray(coins)) {
            throw new Error('داده دریافتی از API معتبر نیست');
        }
        
        console.log(`✅ دریافت ${coins.length} ارز از API`);
        
        // اضافه کردن داده‌های تاریخی از Gist
        const enhancedCoins = coins.map(coin => {
            const symbol = `${coin.symbol.toLowerCase()}_usdt`;
            const historicalData = gistManager.getPriceData(symbol);
            
            return {
                ...coin,
                change_1h: historicalData?.change_1h || 0,
                change_4h: historicalData?.change_4h || 0,
                has_historical_data: !!historicalData,
                historical_timestamp: historicalData?.timestamp
            };
        });
        
        // اعمال فیلترهای پیشرفته
        coins = applyAdvancedFilters(enhancedCoins, serverFilter, limit);
        
        // ساخت پاسخ نهایی
        const scanResults = coins.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            price: coin.price || 0,
            priceChange24h: coin.priceChange1d || coin.priceChange24h || 0,
            priceChange1h: coin.change_1h || 0,  // از Gist
            priceChange4h: coin.change_4h || 0,  // از Gist
            marketCap: coin.marketCap || 0,
            volume: coin.volume || 0,
            high24h: coin.high24h || 0,
            low24h: coin.low24h || 0,
            rank: coin.rank || 999,
            liquidity: (coin.volume || 0) * (coin.price || 0),
            absoluteChange: Math.abs(coin.priceChange1d || coin.priceChange24h || 0),
            hasHistoricalData: coin.has_historical_data || false
        }));
        
        const responseTime = Date.now() - startTime;
        
        console.log(`✅ اسکن پیشرفته کامل: ${scanResults.length} ارز در ${responseTime}ms`);
        
        res.json({
            success: true,
            scan_results: scanResults,
            total_coins: scanResults.length,
            scan_mode: getScanMode(limit),
            filter_applied: filterType,
            filter_description: getFilterDescription(filterType),
            scan_time: new Date().toISOString(),
            features: {
                has_1h_data: true,
                has_4h_data: true,
                data_source: 'CoinStats + Gist Historical',
                historical_coins: scanResults.filter(c => c.hasHistoricalData).length
            },
            performance: {
                request_limit: limit,
                actual_results: scanResults.length,
                filter_type: filterType,
                response_time: `${responseTime}ms`
            }
        });
        
    } catch (error) {
        console.error('❌ خطا در اسکن پیشرفته بازار:', error.message);
        
        const limit = parseInt(req.query.limit) || 100;
        const filterType = req.query.filter || 'volume';
        
        // ✅ فال‌بک با داده‌های نمونه
        const sampleData = generateFilteredSampleData(limit, filterType);
        
        res.json({
            success: true,
            scan_results: sampleData,
            total_coins: sampleData.length,
            scan_mode: getScanMode(limit),
            filter_applied: filterType,
            scan_time: new Date().toISOString(),
            note: 'اسکن با داده‌های نمونه انجام شد',
            error: error.message
        });
    }
});

// ✅ endpoint اصلی اسکن - نسخه معمولی (برای سازگاری)
app.get('/scan-all', async (req, res) => {
    const startTime = Date.now();
    
    try {
        let limit = parseInt(req.query.limit) || 100;
        const filterType = req.query.filter || 'volume';
        
        const filterMapping = {
            'volume': 'volume',
            'momentum': 'price_change_24h', 
            'breakout': 'signals',
            'oversold': 'price_change_24h',
            'overbought': 'price_change_24h'
        };
        
        const serverFilter = filterMapping[filterType] || 'volume';
        
        console.log('🌐 اسکن بازار...', 'تعداد:', limit, 'فیلتر:', filterType);
        
        const response = await axios.get(
            'https://openapiv1.coinstats.app/coins',
            {
                headers: {
                    'X-API-KEY': COINSTATS_API_KEY
                },
                params: {
                    limit: Math.min(limit, 300),
                    currency: 'USD'
                },
                timeout: 30000
            }
        );
        
        let coins = response.data.result || response.data;
        
        if (!coins || !Array.isArray(coins)) {
            throw new Error('داده دریافتی از API معتبر نیست');
        }
        
        console.log(`✅ دریافت ${coins.length} ارز از API`);
        
        // اعمال فیلترهای پیشرفته
        coins = applyAdvancedFilters(coins, serverFilter, limit);
        
        // ساخت پاسخ نهایی
        const scanResults = coins.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            price: coin.price || 0,
            priceChange24h: coin.priceChange1d || coin.priceChange24h || 0,
            priceChange1h: coin.priceChange1h || 0,
            marketCap: coin.marketCap || 0,
            volume: coin.volume || 0,
            high24h: coin.high24h || 0,
            low24h: coin.low24h || 0,
            rank: coin.rank || 999,
            liquidity: (coin.volume || 0) * (coin.price || 0),
            absoluteChange: Math.abs(coin.priceChange1d || coin.priceChange24h || 0)
        }));
        
        const responseTime = Date.now() - startTime;
        
        console.log(`✅ اسکن کامل: ${scanResults.length} ارز در ${responseTime}ms`);
        
        res.json({
            success: true,
            scan_results: scanResults,
            total_coins: scanResults.length,
            scan_mode: getScanMode(limit),
            filter_applied: filterType,
            filter_description: getFilterDescription(filterType),
            scan_time: new Date().toISOString(),
            performance: {
                request_limit: limit,
                actual_results: scanResults.length,
                filter_type: filterType,
                response_time: `${responseTime}ms`
            }
        });
        
    } catch (error) {
        console.error('❌ خطا در اسکن کامل بازار:', error.message);
        
        const limit = parseInt(req.query.limit) || 100;
        const filterType = req.query.filter || 'volume';
        
        const sampleData = generateFilteredSampleData(limit, filterType);
        
        res.json({
            success: true,
            scan_results: sampleData,
            total_coins: sampleData.length,
            scan_mode: getScanMode(limit),
            filter_applied: filterType,
            scan_time: new Date().toISOString(),
            note: 'اسکن با داده‌های نمونه انجام شد',
            error: error.message
        });
    }
});

// ==================== ENDPOINTهای کمکی ====================

// دریافت لیست ارزها
app.get('/api/coins/list', async (req, res) => {
    try {
        const useCache = req.query.cache !== 'false';
        
        if (useCache && cache.coinsList.data && cache.coinsList.timestamp) {
            const cacheAge = Date.now() - cache.coinsList.timestamp;
            if (cacheAge < 300000) {
                return res.json({
                    success: true,
                    data: cache.coinsList.data,
                    total: cache.coinsList.data.length,
                    source: 'cache'
                });
            }
        }

        console.log('📋 دریافت لیست ارزها از CoinStats...');
        
        const response = await axios.get(
            'https://openapiv1.coinstats.app/coins',
            {
                headers: {
                    'X-API-KEY': COINSTATS_API_KEY
                },
                timeout: 15000
            }
        );

        const coinsData = response.data.result || response.data;
        
        cache.coinsList = {
            data: coinsData,
            timestamp: Date.now()
        };

        res.json({
            success: true,
            data: coinsData,
            total: coinsData.length,
            source: 'api',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ خطا در دریافت لیست ارزها:', error.message);
        
        if (cache.coinsList.data) {
            res.json({
                success: true,
                data: cache.coinsList.data,
                total: cache.coinsList.data.length,
                source: 'cache_fallback',
                error: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
});

// داده‌های لحظه‌ای از WebSocket
app.get('/api/coins/realtime', (req, res) => {
    try {
        const realtimeData = wsManager.getRealtimeData();
        
        res.json({
            success: true,
            data: realtimeData,
            total_coins: Object.keys(realtimeData).length,
            websocket_status: wsManager.connected ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ خطا در دریافت داده‌های لحظه‌ای:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// وضعیت Gist
app.get('/api/gist/status', (req, res) => {
    try {
        const gistData = gistManager.getAllData();
        
        res.json({
            success: true,
            gist_id: gistManager.gistId,
            total_coins: Object.keys(gistData.prices || {}).length,
            last_updated: gistData.last_updated,
            storage_used: JSON.stringify(gistData).length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ خطا در دریافت وضعیت Gist:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// overview بازار
app.get('/api/market/overview', async (req, res) => {
    try {
        const [coinsList, realtimeData, gistStatus] = await Promise.all([
            axios.get(`http://localhost:${PORT}/api/coins/list`).catch(() => ({ data: { data: [] } })),
            Promise.resolve({ data: { data: wsManager.getRealtimeData() } }),
            Promise.resolve({ data: { data: gistManager.getAllData() } })
        ]);

        const coins = coinsList.data.data || [];
        
        const overview = {
            total_coins: coins.length,
            realtime_coins: Object.keys(realtimeData.data.data).length,
            historical_coins: Object.keys(gistStatus.data.data.prices || {}).length,
            websocket_status: wsManager.connected ? 'connected' : 'disconnected',
            gist_status: !!gistManager.gistId,
            top_coins: coins.slice(0, 10).map(coin => ({
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                price: coin.price,
                change_24h: coin.priceChange1d
            })),
            market_health: {
                up_coins: coins.filter(c => (c.priceChange1d || 0) > 0).length,
                down_coins: coins.filter(c => (c.priceChange1d || 0) < 0).length,
                total_volume: coins.reduce((sum, coin) => sum + (coin.volume || 0), 0)
            },
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: overview
        });

    } catch (error) {
        console.error('❌ خطا در دریافت overview بازار:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// وضعیت WebSocket
app.get('/api/websocket/status', (req, res) => {
    try {
        const status = wsManager.getConnectionStatus();
        
        res.json({
            success: true,
            websocket_status: status.connected ? 'connected' : 'disconnected',
            active_coins: status.active_coins,
            total_subscribed: status.total_subscribed,
            target_pairs: ALL_TRADING_PAIRS.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ خطا در دریافت وضعیت WebSocket:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== توابع کمکی ====================

function applyAdvancedFilters(coins, filterType, limit) {
    if (!coins || !coins.length) return [];
    
    let filteredCoins = [...coins];
    
    switch(filterType) {
        case 'volume':
            filteredCoins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
            break;
        case 'price_change_24h':
            filteredCoins.sort((a, b) => {
                const changeA = Math.abs(a.priceChange1d || a.priceChange24h || 0);
                const changeB = Math.abs(b.priceChange1d || b.priceChange24h || 0);
                return changeB - changeA;
            });
            break;
        case 'momentum_1h':
            filteredCoins.sort((a, b) => Math.abs(b.change_1h || 0) - Math.abs(a.change_1h || 0));
            break;
        case 'momentum_4h':
            filteredCoins.sort((a, b) => Math.abs(b.change_4h || 0) - Math.abs(a.change_4h || 0));
            break;
        case 'signals':
            filteredCoins.forEach(coin => {
                const volatility = Math.abs(coin.priceChange1d || 0);
                const volumeStrength = Math.log10(coin.volume || 1);
                coin.technicalScore = volatility * volumeStrength;
            });
            filteredCoins.sort((a, b) => (b.technicalScore || 0) - (a.technicalScore || 0));
            break;
        default:
            filteredCoins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
    }
    
    return filteredCoins.slice(0, limit);
}

function getScanMode(limit) {
    switch(limit) {
        case 100: return 'basic';
        case 200: return 'advanced'; 
        case 300: return 'pro';
        default: return 'custom';
    }
}

function getFilterDescription(filterType) {
    const descriptions = {
        'volume': 'ارزهای با بیشترین حجم معاملات',
        'momentum': 'ارزهای با حرکت قیمت قوی',
        'momentum_1h': 'ارزهای با حرکت 1 ساعته قوی',
        'momentum_4h': 'ارزهای با حرکت 4 ساعته قوی',
        'breakout': 'ارزهای با سیگنال‌های تکنیکال قوی',
        'oversold': 'ارزهای با بیشترین تغییرات قیمت',
        'overbought': 'ارزهای با بیشترین تغییرات قیمت'
    };
    return descriptions[filterType] || 'بدون فیلتر';
}

function generateFilteredSampleData(limit, filterType) {
    const sampleCoins = [];
    const baseCoins = [
        { id: "bitcoin", name: "Bitcoin", symbol: "BTC", basePrice: 45000, baseVolume: 25000000000 },
        { id: "ethereum", name: "Ethereum", symbol: "ETH", basePrice: 3000, baseVolume: 15000000000 },
        { id: "binancecoin", name: "Binance Coin", symbol: "BNB", basePrice: 600, baseVolume: 5000000000 },
    ];
    
    for (let i = 0; i < limit; i++) {
        const baseCoin = baseCoins[i % baseCoins.length];
        const price = baseCoin.basePrice * (1 + Math.random() * 0.1 - 0.05);
        const volume = baseCoin.baseVolume * (1 + Math.random() * 0.5 - 0.25);
        const change24h = (Math.random() * 20 - 10);
        const change1h = (Math.random() * 8 - 4);
        const change4h = (Math.random() * 15 - 7.5);
        
        sampleCoins.push({
            id: `${baseCoin.id}-${i}`,
            name: `${baseCoin.name} #${i+1}`,
            symbol: `${baseCoin.symbol}${i}`,
            price: price,
            priceChange24h: change24h,
            priceChange1h: change1h,
            priceChange4h: change4h,
            marketCap: price * (1000000 + Math.random() * 10000000),
            volume: volume,
            high24h: price * (1 + Math.random() * 0.05),
            low24h: price * (1 - Math.random() * 0.05),
            rank: i + 1,
            liquidity: volume * price,
            absoluteChange: Math.abs(change24h),
            hasHistoricalData: Math.random() > 0.3
        });
    }
    
    return applyAdvancedFilters(sampleCoins, filterType, limit);
}

// middleware برای اندازه‌گیری زمان پاسخ
app.use((req, res, next) => {
    req.startTime = Date.now();
    next();
});

// راه‌اندازی سرور
app.listen(PORT, () => {
    console.log(`🚀 سرور میانی فعال روی پورت ${PORT}`);
    console.log(`🔑 API Key: فعال`);
    console.log(`🔗 Gist Storage: ${process.env.GITHUB_TOKEN ? 'فعال' : 'غیرفعال'}`);
    console.log(`📊 گزینه‌های اسکن: 100, 200, 300 ارز`);
    console.log(`🌐 WebSocket: LBank فعال برای ${ALL_TRADING_PAIRS.length} جفت ارز`);
    console.log(`⏰ ویژگی‌های جدید: تغییرات 1h/4h با ذخیره‌سازی Gist`);
    console.log(`✅ سلامت: http://localhost:${PORT}/health`);
    console.log(`🎯 اسکن اصلی: http://localhost:${PORT}/scan-all?limit=100&filter=volume`);
    console.log(`🚀 اسکن پیشرفته: http://localhost:${PORT}/scan-advanced?limit=100&filter=momentum_1h`);
});
