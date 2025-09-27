const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ استفاده از cors package (مهم!)
app.use(cors());

// ✅ middlewareهای ضروری
app.use(express.json());

// ✅ CORS headers اضافی برای اطمینان
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// ✅ صفحه اصلی
app.get('/', (req, res) => {
    res.json({ 
        message: 'سرور فعال است - CoinState Scanner Middleware',
        endpoints: {
            health: '/health',
            coins: '/coins?limit=100',
            test: '/test'
        },
        timestamp: new Date().toISOString()
    });
});

// ✅ endpoint سلامت
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'سرور میانی سالم است!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ✅ endpoint اصلی برای دریافت داده‌های ارزها
app.get('/coins', async (req, res) => {
    try {
        const limit = req.query.limit || 100;
        console.log('🌐 درخواست دریافت داده برای', limit, 'ارز...');
        
        // دریافت داده از CoinStats API
        const response = await axios.get(
            `https://api.coinstats.app/public/v1/coins?limit=${limit}`, 
            {
                timeout: 15000, // 15 ثانیه
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Crypto-Scanner/1.0)',
                    'Accept': 'application/json'
                }
            }
        );
        
        console.log('✅ داده دریافت شد:', response.data.coins.length, 'ارز');
        
        // ✅ ساختار ساده و استاندارد
        res.json({
            coins: response.data.coins,
            count: response.data.coins.length,
            timestamp: new Date().toISOString(),
            source: 'CoinStats API'
        });
        
    } catch (error) {
        console.error('❌ خطا در دریافت داده:', error.message);
        
        // ✅ بازگشت داده‌های نمونه در صورت خطا
        const sampleData = [
            {
                id: "bitcoin",
                name: "Bitcoin",
                symbol: "BTC",
                price: 45000 + (Math.random() * 10000 - 5000),
                priceChange1h: (Math.random() * 4 - 2).toFixed(2),
                priceChange1d: (Math.random() * 10 - 5).toFixed(2),
                priceChange1w: (Math.random() * 20 - 10).toFixed(2),
                marketCap: 880000000000,
                volume: 25000000000,
                totalSupply: 21000000,
                circulatingSupply: 19500000
            },
            {
                id: "ethereum",
                name: "Ethereum", 
                symbol: "ETH",
                price: 3000 + (Math.random() * 600 - 300),
                priceChange1h: (Math.random() * 4 - 2).toFixed(2),
                priceChange1d: (Math.random() * 10 - 5).toFixed(2),
                priceChange1w: (Math.random() * 20 - 10).toFixed(2),
                marketCap: 360000000000,
                volume: 15000000000,
                totalSupply: 120000000,
                circulatingSupply: 118000000
            }
        ];
        
        res.json({
            coins: sampleData,
            count: sampleData.length,
            timestamp: new Date().toISOString(),
            source: 'Sample Data (Fallback)',
            note: 'داده‌های نمونه به دلیل خطا در اتصال به CoinStats'
        });
    }
});

// ✅ endpoint تست
app.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'تست موفقیت‌آمیز بود!',
        data: {
            server: 'CoinState Middleware',
            status: 'active',
            timestamp: new Date().toISOString()
        }
    });
});

// ✅ مدیریت خطاهای 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint یافت نشد',
        available_endpoints: ['/', '/health', '/coins', '/test'],
        timestamp: new Date().toISOString()
    });
});

// ✅ راه‌اندازی سرور
app.listen(PORT, () => {
    console.log(`🚀 سرور میانی فعال روی پورت ${PORT}`);
    console.log(`📍 آدرس سرور: http://localhost:${PORT}`);
    console.log(`✅ سلامت سرور: http://localhost:${PORT}/health`);
    console.log(`💰 داده ارزها: http://localhost:${PORT}/coins?limit=10`);
});
