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

// ✅ endpoint جدید برای دریافت داده‌های ارزها
app.get('/api/coins', async (req, res) => {
    try {
        const limit = req.query.limit || 100;
        console.log('دریافت داده‌های ارز از CoinStats...');
        
        const response = await axios.get(`https://api.coinstats.app/public/v1/coins?limit=${limit}`);
        
        res.json({
            success: true,
            data: response.data,
            count: response.data.coins.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('خطا:', error.message);
        res.status(500).json({
            success: false,
            error: 'خطا در دریافت داده از CoinStats'
        });
    }
});

app.listen(PORT, () => {
    console.log(`سرور راه‌اندازی شد روی پورت ${PORT}`);
});
