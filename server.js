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

// ✅ کلاس WebSocketManager اصلاح شده
class WebSocketManager {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.realtimeData = {};
        this.connect();
    }

    connect() {
        try {
            this.ws = new WebSocket('wss://api.upbit.com/websocket/v1');
            
            this.ws.on('open', () => {
                console.log('✅ WebSocket به Upbit متصل شد');
                this.connected = true;
                
                // ✅ فرمت صحیح درخواست Subscribe (آرایه از آبجکت‌ها)
                const subscription = [
                    {
                        "ticket": "scanner-app-" + Date.now()
                    },
                    {
                        "type": "ticker",
                        "codes": [
                            "KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-ADA", "KRW-DOT",
                            "KRW-DOGE", "KRW-SOL", "KRW-MATIC", "KRW-AVAX", "KRW-LINK",
                            "KRW-BCH", "KRW-LTC", "KRW-ETC", "KRW-TRX", "KRW-ATOM"
                        ]
                    },
                    {
                        "format": "DEFAULT"
                    }
                ];
                
                console.log('📨 ارسال درخواست Subscribe به Upbit...');
                this.ws.send(JSON.stringify(subscription));
            });

            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    
                    // ✅ پردازش داده‌های ticker با فیلدهای صحیح
                    if (message.type === 'ticker') {
                        const symbol = message.code;
                        
                        this.realtimeData[symbol] = {
                            // ✅ استفاده از فیلدهای کامل (نه مخفف‌ها)
                            price: message.trade_price,
                            opening_price: message.opening_price,
                            high_price: message.high_price,
                            low_price: message.low_price,
                            volume: message.acc_trade_volume_24h || message.acc_trade_volume,
                            change: message.change,
                            change_rate: message.change_rate,
                            change_price: message.change_price,
                            prev_closing_price: message.prev_closing_price,
                            acc_trade_price: message.acc_trade_price_24h || message.acc_trade_price,
                            trade_volume: message.trade_volume,
                            market_state: message.market_state,
                            timestamp: message.timestamp,
                            stream_type: message.stream_type,
                            last_updated: new Date().toISOString()
                        };
                        
                        // ✅ آپدیت کش global
                        cache.realtimePrices = { ...this.realtimeData };
                        
                        // لاگ برای debug (می‌تونی بعداً غیرفعال کنی)
                        if (Object.keys(this.realtimeData).length <= 5) {
                            console.log(`📊 داده دریافتی از ${symbol}:`, this.realtimeData[symbol].price);
                        }
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
            // تلاش مجدد پس از 10 ثانیه
            setTimeout(() => this.connect(), 10000);
        }
    }

    getRealtimeData() {
        return this.realtimeData;
    }
    
    getConnectionStatus() {
        return {
            connected: this.connected,
            active_coins: Object.keys(this.realtimeData).length,
            coins: Object.keys(this.realtimeData)
        };
    }
    
    // ✅ تابع برای subscribe کردن به ارزهای بیشتر
    subscribeToCoins(codes) {
        if (this.connected && this.ws) {
            const subscription = [
                {
                    "ticket": "scanner-app-add-" + Date.now()
                },
                {
                    "type": "ticker",
                    "codes": codes
                },
                {
                    "format": "DEFAULT"
                }
            ];
            
            this.ws.send(JSON.stringify(subscription));
            console.log(`✅ Subscribe به ${codes.length} ارز جدید`);
        }
    }
}

// ✅ راه‌اندازی WebSocket
const wsManager = new WebSocketManager();

// صفحه اصلی با endpointهای جدید
app.get('/', (req, res) => {
    res.json({ 
        message: 'سرور میانی فعال - CoinState Scanner Pro',
        endpoints: {
            health: '/health',
            scan_all: '/scan-all?limit=100|500|1000&filter=volume|price_change|signals',
            scan_custom: '/scan-custom?filters={...}',
            // ✅ endpointهای جدید
            coins_list: '/api/coins/list',
            historical_data: '/api/coins/historical?coins=bitcoin,ethereum&period=1m',
            realtime_prices: '/api/coins/realtime',
            market_overview: '/api/market/overview',
            websocket_status: '/api/websocket/status'
        },
        scan_options: {
            basic: { limit: 100, description: 'اسکن پایه - ۱۰۰ ارز برتر' },
            advanced: { limit: 500, description: 'اسکن پیشرفته - ۵۰۰ ارز برتر' },
            pro: { limit: 1000, description: 'اسکن حرفه‌ای - ۱۰۰۰ ارز برتر' }
        },
        timestamp: new Date().toISOString()
    });
});

// سلامت سرور - آپدیت شده
app.get('/health', (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    
    res.json({ 
        status: 'OK', 
        message: 'سرور میانی سالم است!',
        websocket_status: {
            connected: wsStatus.connected,
            active_coins: wsStatus.active_coins,
            coins_count: wsStatus.coins.length
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

// ✅ ۳. دریافت داده‌های لحظه‌ای از Upbit WebSocket
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

// ✅ endpoint برای subscribe کردن به ارزهای جدید
app.post('/api/websocket/subscribe', (req, res) => {
    try {
        const { codes } = req.body;
        
        if (!codes || !Array.isArray(codes)) {
            return res.status(400).json({
                success: false,
                error: 'پارامتر codes الزامی است و باید آرایه باشد'
            });
        }
        
        wsManager.subscribeToCoins(codes);
        
        res.json({
            success: true,
            message: `درخواست subscribe برای ${codes.length} ارز ارسال شد`,
            codes: codes
        });
        
    } catch (error) {
        console.error('❌ خطا در subscribe کردن:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ endpoint اصلی با فیلترهای پیشرفته (کد موجود)
app.get('/scan-all', async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 100;
        const filterType = req.query.filter || 'volume';
        
        const allowedLimits = [100, 500, 1000];
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
                response_time: Date.now() - req.startTime + 'ms'
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

// ✅ endpoint جدید برای اسکن کاملاً سفارشی (کد موجود)
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

// ✅ توابع کمکی موجود
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
        case 500: return 'advanced';
        case 1000: return 'pro';
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
    console.log(`📊 گزینه‌های اسکن: 100, 500, 1000 ارز`);
    console.log(`🌐 WebSocket: فعال برای داده‌های لحظه‌ای`);
    console.log(`✅ سلامت: http://localhost:${PORT}/health`);
    console.log(`📋 لیست ارزها: http://localhost:${PORT}/api/coins/list`);
    console.log(`📊 داده تاریخی: http://localhost:${PORT}/api/coins/historical?coins=bitcoin,ethereum`);
    console.log(`⚡ داده لحظه‌ای: http://localhost:${PORT}/api/coins/realtime`);
    console.log(`🔗 وضعیت WebSocket: http://localhost:${PORT}/api/websocket/status`);
});
