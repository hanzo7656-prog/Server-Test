const express = require('express');
const axios = require('axios');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ کلید API معتبر شما
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

// ✅ لیست کامل 300 جفت ارز برای LBank - فقط USDT
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

// ✅ کلاس WebSocketManager برای LBank با تمام 300 ارز
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
                
                // ✅ Subscribe به تمام 300 جفت ارز
                this.subscribeToAllPairs();
            });

            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    
                    // ✅ پردازش داده‌های tick از LBank
                    if (message.type === 'tick' && message.tick) {
                        const symbol = message.pair;
                        const tickData = message.tick;
                        
                        this.realtimeData[symbol] = {
                            price: tickData.latest,
                            high_24h: tickData.high,
                            low_24h: tickData.low,
                            volume: tickData.vol,
                            turnover: tickData.turnover,
                            change: tickData.change,
                            change_rate: tickData.change,
                            direction: tickData.dir,
                            usd_price: tickData.usd,
                            cny_price: tickData.cny,
                            timestamp: message.TS,
                            last_updated: new Date().toISOString()
                        };
                        
                        // ✅ آپدیت کش global
                        cache.realtimePrices = { ...this.realtimeData };
                    }
                    
                    // ✅ پردازش داده‌های trade
                    if (message.type === 'trade' && message.trade) {
                        const symbol = message.pair;
                        const tradeData = message.trade;
                        
                        if (!this.realtimeData[symbol]) {
                            this.realtimeData[symbol] = {};
                        }
                        
                        this.realtimeData[symbol].last_trade = {
                            price: tradeData.price,
                            volume: tradeData.volume,
                            amount: tradeData.amount,
                            direction: tradeData.direction,
                            timestamp: tradeData.TS
                        };
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
                
                // ✅ تلاش برای اتصال مجدد پس از 5 ثانیه
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

    // ✅ تابع برای subscribe کردن به تمام 300 جفت ارز
    subscribeToAllPairs() {
        if (this.connected && this.ws) {
            console.log(`📨 شروع Subscribe به ${ALL_TRADING_PAIRS.length} جفت ارز...`);
            
            // Subscribe به صورت دسته‌ای برای جلوگیری از overload
            const batchSize = 50;
            for (let i = 0; i < ALL_TRADING_PAIRS.length; i += batchSize) {
                setTimeout(() => {
                    const batch = ALL_TRADING_PAIRS.slice(i, i + batchSize);
                    this.subscribeBatch(batch);
                }, i * 100); // تأخیر 100ms بین هر دسته
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
    
    // ✅ تابع برای subscribe کردن به جفت ارزهای خاص
    subscribeToPairs(pairs) {
        if (this.connected && this.ws) {
            const newPairs = pairs.filter(pair => !this.subscribedPairs.has(pair));
            
            if (newPairs.length > 0) {
                this.subscribeBatch(newPairs);
            }
            
            return newPairs.length;
        }
        return 0;
    }
}

// ✅ راه‌اندازی WebSocket جدید با 300 ارز
const wsManager = new WebSocketManager();

// صفحه اصلی با endpointهای جدید
app.get('/', (req, res) => {
    res.json({ 
        message: 'سرور میانی فعال - CoinState Scanner Pro (LBank Version)',
        endpoints: {
            health: '/health',
            scan_all: '/scan-all?limit=100|200|300&filter=volume|price_change|signals',
            scan_custom: '/scan-custom?filters={...}',
            coins_list: '/api/coins/list',
            historical_data: '/api/coins/historical?coins=bitcoin,ethereum&period=1m',
            realtime_prices: '/api/coins/realtime',
            market_overview: '/api/market/overview',
            websocket_status: '/api/websocket/status'
        },
        scan_options: {
            basic: { limit: 100, description: 'اسکن پایه - ۱۰۰ ارز برتر' },
            advanced: { limit: 200, description: 'اسکن پیشرفته - ۲۰۰ ارز برتر' },
            pro: { limit: 300, description: 'اسکن حرفه‌ای - ۳۰۰ ارز برتر' }
        },
        websocket_provider: "LBank Exchange",
        total_pairs: ALL_TRADING_PAIRS.length,
        timestamp: new Date().toISOString()
    });
});

// سلامت سرور - آپدیت شده برای LBank
app.get('/health', (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    
    res.json({ 
        status: 'OK', 
        message: 'سرور میانی سالم است! (LBank WebSocket)',
        websocket_status: {
            connected: wsStatus.connected,
            active_coins: wsStatus.active_coins,
            total_subscribed: wsStatus.total_subscribed,
            target_pairs: ALL_TRADING_PAIRS.length,
            provider: "LBank"
        },
        cache_status: {
            coins_list: cache.coinsList.data ? 'cached' : 'empty',
            realtime_prices: Object.keys(cache.realtimePrices).length + ' coins'
        },
        timestamp: new Date().toISOString()
    });
});

// ✅ ۱. دریافت لیست تمام ارزها از CoinStats
app.get('/api/coins/list', async (req, res) => {
    try {
        const useCache = req.query.cache !== 'false';
        
        // بررسی کش
        if (useCache && cache.coinsList.data && cache.coinsList.timestamp) {
            const cacheAge = Date.now() - cache.coinsList.timestamp;
            if (cacheAge < 300000) { // 5 دقیقه کش
                return res.json({
                    success: true,
                    data: cache.coinsList.data,
                    total: cache.coinsList.data.length,
                    source: 'cache',
                    cache_age: Math.round(cacheAge / 1000) + ' seconds'
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

        const coinsData = response.data;
        
        // ذخیره در کش
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
        
        // fallback به کش در صورت خطا
        if (cache.coinsList.data) {
            res.json({
                success: true,
                data: cache.coinsList.data,
                total: cache.coinsList.data.length,
                source: 'cache_fallback',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message,
                note: 'No cached data available'
            });
        }
    }
});

// ✅ ۲. دریافت داده‌های تاریخی از CoinStats
app.get('/api/coins/historical', async (req, res) => {
    try {
        const coinIds = req.query.coins || 'bitcoin,ethereum';
        const period = req.query.period || '1m';
        const allowedPeriods = ['24h', '1w', '1m', '3m', '6m', '1y', 'all'];

        if (!allowedPeriods.includes(period)) {
            return res.status(400).json({
                success: false,
                error: 'Period not allowed. Use: 24h, 1w, 1m, 3m, 6m, 1y, all'
            });
        }

        console.log(`📊 دریافت داده‌های تاریخی برای ${coinIds} - دوره: ${period}`);

        const response = await axios.get(
            'https://openapiv1.coinstats.app/coins/charts',
            {
                headers: {
                    'X-API-KEY': COINSTATS_API_KEY
                },
                params: {
                    period: period,
                    coinIds: coinIds
                },
                timeout: 30000
            }
        );

        const historicalData = response.data;

        res.json({
            success: true,
            data: historicalData,
            parameters: {
                coins: coinIds,
                period: period,
                total_coins: historicalData.length
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ خطا در دریافت داده‌های تاریخی:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            parameters: req.query
        });
    }
});

// ✅ ۳. دریافت داده‌های لحظه‌ای از LBank WebSocket
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
            error: error.message,
            websocket_status: 'error'
        });
    }
});

// ✅ ۴. overview بازار (ترکیب داده‌ها)
app.get('/api/market/overview', async (req, res) => {
    try {
        const [coinsList, realtimeData] = await Promise.all([
            // دریافت لیست ارزها (با کش)
            axios.get(`http://localhost:${PORT}/api/coins/list`).catch(() => ({ data: { data: [] } })),
            // داده‌های لحظه‌ای
            Promise.resolve({ data: { data: wsManager.getRealtimeData() } })
        ]);

        const overview = {
            total_coins: coinsList.data.data.length,
            realtime_coins: Object.keys(realtimeData.data.data).length,
            websocket_status: wsManager.connected ? 'connected' : 'disconnected',
            top_coins: coinsList.data.data.slice(0, 10).map(coin => ({
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                price: coin.price,
                change_24h: coin.priceChange1d
            })),
            market_health: {
                up_coins: coinsList.data.data.filter(c => (c.priceChange1d || 0) > 0).length,
                down_coins: coinsList.data.data.filter(c => (c.priceChange1d || 0) < 0).length,
                total_volume: coinsList.data.data.reduce((sum, coin) => sum + (coin.volume || 0), 0)
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

// ✅ endpoint برای وضعیت WebSocket
app.get('/api/websocket/status', (req, res) => {
    try {
        const status = wsManager.getConnectionStatus();
        
        res.json({
            success: true,
            websocket_status: status.connected ? 'connected' : 'disconnected',
            active_coins: status.active_coins,
            total_subscribed: status.total_subscribed,
            target_pairs: ALL_TRADING_PAIRS.length,
            connected_coins: status.coins,
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

// ✅ endpoint برای subscribe کردن به جفت ارزهای جدید در LBank
app.post('/api/websocket/subscribe', (req, res) => {
    try {
        const { pairs } = req.body;
        
        if (!pairs || !Array.isArray(pairs)) {
            return res.status(400).json({
                success: false,
                error: 'پارامتر pairs الزامی است و باید آرایه باشد'
            });
        }
        
        const newPairsCount = wsManager.subscribeToPairs(pairs);
        
        res.json({
            success: true,
            message: `درخواست subscribe برای ${newPairsCount} جفت ارز جدید ارسال شد`,
            total_subscribed: wsManager.subscribedPairs.size,
            pairs: pairs,
            provider: "LBank"
        });
        
    } catch (error) {
        console.error('❌ خطا در subscribe کردن:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ endpoint اصلی با فیلترهای پیشرفته - آپدیت شده برای 100,200,300
app.get('/scan-all', async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 100;
        const filterType = req.query.filter || 'volume';
        
        // ✅ محدوده جدید: 100, 200, 300
        const allowedLimits = [100, 200, 300];
        if (!allowedLimits.includes(limit)) {
            limit = 100;
        }
        
        console.log('🌐 اسکن کامل بازار...', 'تعداد:', limit, 'ارز', 'فیلتر:', filterType);
        
        const response = await axios.get(
            'https://openapiv1.coinstats.app/coins',
            {
                headers: {
                    'X-API-KEY': COINSTATS_API_KEY
                },
                params: {
                    limit: limit,
                    currency: 'USD'
                },
                timeout: 45000
            }
        );
        
        let coins = response.data;
        coins = applyAdvancedFilters(coins, filterType, limit);
        
        console.log('✅ اسکن کامل بازار تکمیل شد:', coins.length, 'ارز', 'فیلتر:', filterType);
        
        const scanResults = coins.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            price: coin.price,
            priceChange24h: coin.priceChange1d || coin.priceChange24h,
            priceChange1h: coin.priceChange1h,
            marketCap: coin.marketCap,
            volume: coin.volume,
            high24h: coin.high24h,
            low24h: coin.low24h,
            rank: coin.rank,
            liquidity: coin.volume * coin.price,
            absoluteChange: Math.abs(coin.priceChange1d || 0)
        }));
        
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
                response_time: Date.now() - req.startTime + 'ms',
                websocket_provider: "LBank",
                websocket_pairs: ALL_TRADING_PAIRS.length
            }
        });
        
    } catch (error) {
        console.error('❌ خطا در اسکن کامل بازار:', error.message);
        
        const limit = parseInt(req.query.limit) || 100;
        const filterType = req.query.filter || 'volume';
        
        res.json({
            success: false,
            scan_results: generateFilteredSampleData(limit, filterType),
            total_coins: limit,
            scan_mode: getScanMode(limit),
            filter_applied: filterType,
            scan_time: new Date().toISOString(),
            error: error.message,
            note: 'اسکن با داده‌های نمونه انجام شد'
        });
    }
});

// ✅ endpoint جدید برای اسکن کاملاً سفارشی
app.get('/scan-custom', async (req, res) => {
    try {
        const { 
            limit = 100,
            min_volume,
            max_volume,
            min_price_change,
            max_price_change,
            min_market_cap,
            max_market_cap,
            sort_by = 'volume',
            sort_order = 'desc'
        } = req.query;

        console.log('🎛️ اسکن سفارشی با پارامترها:', req.query);
        
        const response = await axios.get(
            'https://openapiv1.coinstats.app/coins',
            {
                headers: {
                    'X-API-KEY': COINSTATS_API_KEY
                },
                params: {
                    limit: Math.min(parseInt(limit) || 100, 1000),
                    currency: 'USD'
                },
                timeout: 60000
            }
        );
        
        let coins = response.data;
        coins = applyCustomFilters(coins, req.query);
        
        res.json({
            success: true,
            scan_results: coins.map(coin => ({
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                price: coin.price,
                priceChange24h: coin.priceChange1d || coin.priceChange24h,
                priceChange1h: coin.priceChange1h,
                marketCap: coin.marketCap,
                volume: coin.volume,
                high24h: coin.high24h,
                low24h: coin.low24h,
                rank: coin.rank
            })),
            total_coins: coins.length,
            filters_applied: req.query,
            scan_time: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ خطا در اسکن سفارشی:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ توابع کمکی
function applyAdvancedFilters(coins, filterType, limit) {
    if (!coins || !coins.length) return coins;
    
    let filteredCoins = [...coins];
    
    switch(filterType) {
        case 'volume':
            filteredCoins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
            break;
        case 'liquidity':
            filteredCoins.sort((a, b) => {
                const liquidityA = (a.volume || 0) * (a.price || 0);
                const liquidityB = (b.volume || 0) * (b.price || 0);
                return liquidityB - liquidityA;
            });
            break;
        case 'price_change_24h':
            filteredCoins.sort((a, b) => {
                const changeA = Math.abs(a.priceChange1d || a.priceChange24h || 0);
                const changeB = Math.abs(b.priceChange1d || b.priceChange24h || 0);
                return changeB - changeA;
            });
            break;
        case 'market_cap':
            filteredCoins.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
            break;
        case 'signals':
            filteredCoins.forEach(coin => {
                const volatility = Math.abs(coin.priceChange1d || 0);
                const volumeStrength = Math.log10(coin.volume || 1);
                coin.technicalScore = volatility * volumeStrength;
            });
            filteredCoins.sort((a, b) => (b.technicalScore || 0) - (a.technicalScore || 0));
            break;
    }
    
    return filteredCoins.slice(0, limit);
}

function applyCustomFilters(coins, filters) {
    let filteredCoins = [...coins];
    
    if (filters.min_volume) {
        filteredCoins = filteredCoins.filter(coin => coin.volume >= parseFloat(filters.min_volume));
    }
    if (filters.max_volume) {
        filteredCoins = filteredCoins.filter(coin => coin.volume <= parseFloat(filters.max_volume));
    }
    
    if (filters.min_price_change) {
        filteredCoins = filteredCoins.filter(coin => 
            Math.abs(coin.priceChange1d || coin.priceChange24h || 0) >= parseFloat(filters.min_price_change)
        );
    }
    if (filters.max_price_change) {
        filteredCoins = filteredCoins.filter(coin => 
            Math.abs(coin.priceChange1d || coin.priceChange24h || 0) <= parseFloat(filters.max_price_change)
        );
    }
    
    if (filters.min_market_cap) {
        filteredCoins = filteredCoins.filter(coin => coin.marketCap >= parseFloat(filters.min_market_cap));
    }
    if (filters.max_market_cap) {
        filteredCoins = filteredCoins.filter(coin => coin.marketCap <= parseFloat(filters.max_market_cap));
    }
    
    const sortBy = filters.sort_by || 'volume';
    const sortOrder = filters.sort_order === 'asc' ? 1 : -1;
    
    filteredCoins.sort((a, b) => {
        const valueA = a[sortBy] || 0;
        const valueB = b[sortBy] || 0;
        return (valueB - valueA) * sortOrder;
    });
    
    return filteredCoins;
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
        'liquidity': 'ارزهای با بیشترین نقدینگی',
        'price_change_24h': 'ارزهای با بیشترین تغییرات قیمت',
        'market_cap': 'ارزهای با بزرگترین مارکت کپ',
        'signals': 'ارزهای با قوی‌ترین سیگنال‌های تکنیکال'
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
        
        sampleCoins.push({
            id: `${baseCoin.id}-${i}`,
            name: `${baseCoin.name} #${i+1}`,
            symbol: `${baseCoin.symbol}${i}`,
            price: price,
            priceChange24h: change24h,
            priceChange1h: (Math.random() * 4 - 2),
            marketCap: price * (1000000 + Math.random() * 10000000),
            volume: volume,
            high24h: price * (1 + Math.random() * 0.05),
            low24h: price * (1 - Math.random() * 0.05),
            rank: i + 1,
            liquidity: volume * price,
            absoluteChange: Math.abs(change24h)
        });
    }
    
    return applyAdvancedFilters(sampleCoins, filterType, limit);
}

// middleware برای اندازه‌گیری زمان پاسخ
app.use((req, res, next) => {
    req.startTime = Date.now();
    next();
});

app.listen(PORT, () => {
    console.log(`🚀 سرور میانی فعال روی پورت ${PORT}`);
    console.log(`🔑 API Key: فعال`);
    console.log(`📊 گزینه‌های اسکن جدید: 100, 200, 300 ارز`);
    console.log(`🌐 WebSocket: LBank فعال برای ${ALL_TRADING_PAIRS.length} جفت ارز`);
    console.log(`✅ سلامت: http://localhost:${PORT}/health`);
    console.log(`📋 لیست ارزها: http://localhost:${PORT}/api/coins/list`);
    console.log(`📊 داده تاریخی: http://localhost:${PORT}/api/coins/historical?coins=bitcoin,ethereum`);
    console.log(`⚡ داده لحظه‌ای LBank: http://localhost:${PORT}/api/coins/realtime`);
    console.log(`🔗 وضعیت WebSocket: http://localhost:${PORT}/api/websocket/status`);
});
