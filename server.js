const express = require('express');
const axios = require('axios');
const cors = require('cors');
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

// صفحه اصلی با گزینه‌های جدید
app.get('/', (req, res) => {
    res.json({ 
        message: 'سرور میانی فعال - CoinState Scanner Pro',
        endpoints: {
            health: '/health',
            scan_all: '/scan-all?limit=100|500|1000&filter=volume|price_change|signals',
            scan_custom: '/scan-custom?filters={...}' // ✅ اسکن سفارشی
        },
        scan_options: {
            basic: { limit: 100, description: 'اسکن پایه - ۱۰۰ ارز برتر' },
            advanced: { limit: 500, description: 'اسکن پیشرفته - ۵۰۰ ارز برتر' },
            pro: { limit: 1000, description: 'اسکن حرفه‌ای - ۱۰۰۰ ارز برتر' }
        },
        filter_options: {
            volume: 'حجم معاملات بالا',
            liquidity: 'نقدینگی بالا', 
            price_change_24h: 'تغییرات قیمت ۲۴h',
            market_cap: 'مارکت کپ بالا',
            signals: 'بر اساس سیگنال‌های تکنیکال'
        },
        timestamp: new Date().toISOString()
    });
});

// سلامت سرور
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'سرور میانی سالم است!',
        scan_options: [100, 500, 1000],
        filter_options: ['volume', 'liquidity', 'price_change_24h', 'market_cap', 'signals'],
        timestamp: new Date().toISOString()
    });
});

// ✅ endpoint اصلی با فیلترهای پیشرفته
app.get('/scan-all', async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 100;
        const filterType = req.query.filter || 'volume'; // ✅ فیلتر پیش‌فرض: حجم معاملات
        
        // ✅ محدودیت‌های مجاز
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
        
        // ✅ اعمال فیلترهای پیشرفته
        coins = applyAdvancedFilters(coins, filterType, limit);
        
        console.log('✅ اسکن کامل بازار تکمیل شد:', coins.length, 'ارز', 'فیلتر:', filterType);
        
        // ساختار بهینه برای اسکنر
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
            // ✅ داده‌های اضافی برای فیلترها
            liquidity: coin.volume * coin.price, // نقدینگی تقریبی
            absoluteChange: Math.abs(coin.priceChange1d || 0) // تغییرات مطلق
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
        
        // داده‌های نمونه با فیلتر
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
        
        // ✅ اعمال فیلترهای سفارشی
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

// ✅ تابع اعمال فیلترهای پیشرفته
function applyAdvancedFilters(coins, filterType, limit) {
    if (!coins || !coins.length) return coins;
    
    let filteredCoins = [...coins];
    
    switch(filterType) {
        case 'volume':
            // ✅ حجم معاملات بالا
            filteredCoins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
            break;
            
        case 'liquidity':
            // ✅ نقدینگی بالا (حجم × قیمت)
            filteredCoins.sort((a, b) => {
                const liquidityA = (a.volume || 0) * (a.price || 0);
                const liquidityB = (b.volume || 0) * (b.price || 0);
                return liquidityB - liquidityA;
            });
            break;
            
        case 'price_change_24h':
            // ✅ بیشترین/کمترین تغییرات قیمت
            filteredCoins.sort((a, b) => {
                const changeA = Math.abs(a.priceChange1d || a.priceChange24h || 0);
                const changeB = Math.abs(b.priceChange1d || b.priceChange24h || 0);
                return changeB - changeA;
            });
            break;
            
        case 'market_cap':
            // ✅ مارکت کپ بالا
            filteredCoins.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
            break;
            
        case 'signals':
            // ✅ شبیه‌سازی سیگنال‌های تکنیکال (بر اساس نوسان + حجم)
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

// ✅ تابع اعمال فیلترهای سفارشی
function applyCustomFilters(coins, filters) {
    let filteredCoins = [...coins];
    
    // فیلتر حجم معاملات
    if (filters.min_volume) {
        filteredCoins = filteredCoins.filter(coin => coin.volume >= parseFloat(filters.min_volume));
    }
    if (filters.max_volume) {
        filteredCoins = filteredCoins.filter(coin => coin.volume <= parseFloat(filters.max_volume));
    }
    
    // فیلتر تغییرات قیمت
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
    
    // فیلتر مارکت کپ
    if (filters.min_market_cap) {
        filteredCoins = filteredCoins.filter(coin => coin.marketCap >= parseFloat(filters.min_market_cap));
    }
    if (filters.max_market_cap) {
        filteredCoins = filteredCoins.filter(coin => coin.marketCap <= parseFloat(filters.max_market_cap));
    }
    
    // مرتب‌سازی
    const sortBy = filters.sort_by || 'volume';
    const sortOrder = filters.sort_order === 'asc' ? 1 : -1;
    
    filteredCoins.sort((a, b) => {
        const valueA = a[sortBy] || 0;
        const valueB = b[sortBy] || 0;
        return (valueB - valueA) * sortOrder;
    });
    
    return filteredCoins;
}

// ✅ توابع کمکی
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
        // ... (لیست کامل‌تر)
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
    
    // اعمال فیلتر روی داده‌های نمونه
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
    console.log(`🎛️ فیلترهای پیشرفته: volume, liquidity, price_change, market_cap, signals`);
    console.log(`✅ سلامت: http://localhost:${PORT}/health`);
    console.log(`🌐 اسکن پایه: http://localhost:${PORT}/scan-all?limit=100&filter=volume`);
    console.log(`🌐 اسکن پیشرفته: http://localhost:${PORT}/scan-all?limit=500&filter=liquidity`);
    console.log(`🌐 اسکن حرفه‌ای: http://localhost:${PORT}/scan-all?limit=1000&filter=signals`);
});
