const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

// صفحه اصلی
app.get('/', (req, res) => {
    res.json({ message: 'سرور فعال است' });
});

// تست سلامت
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'سلام من کار می‌کنم!' });
});

// endpoint بهبود یافته برای دریافت داده‌های ارزها
app.get('/api/coins', async (req, res) => {
    try {
        const limit = req.query.limit || 100;
        console.log('🌐 Connecting to CoinStats API...');
        
        // اضافه کردن timeout و headers
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
        
        console.log('✅ Data received successfully');
        
        res.json({
            success: true,
            data: response.data,
            count: response.data.coins.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error details:', error.message);
        
        // خطای دقیق‌تر
        if (error.code === 'ECONNABORTED') {
            res.status(408).json({
                success: false,
                error: 'اتصال به CoinStats timeout خورد'
            });
        } else if (error.response) {
            res.status(502).json({
                success: false,
                error: `CoinStats API error: ${error.response.status}`
            });
        } else {
            res.status(500).json({
                success: false,
                error: `خطا در اتصال: ${error.message}`
            });
        }
    }
});

// endpoint تست ساده (بدون اتصال به خارج)
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'این یک تست داخلی است',
        testData: {
            bitcoin: { price: 45000, change: 2.5 },
            ethereum: { price: 3000, change: 1.8 }
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 سرور راه‌اندازی شد روی پورت ${PORT}`);
});
