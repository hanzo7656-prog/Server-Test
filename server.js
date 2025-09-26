const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// سلامت - خیلی ساده
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'سلام من کار می‌کنم!' });
});

// صفحه اصلی
app.get('/', (req, res) => {
    res.json({ message: 'سرور فعال است' });
});

app.listen(PORT, () => {
    console.log('سرور راه‌اندازی شد');
});
