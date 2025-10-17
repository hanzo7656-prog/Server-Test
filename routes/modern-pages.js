const express = require('express');
const router = express.Router();

// تابع تولید صفحه ساده
function generateSimplePage(title, content) {
    return `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - VortexAI</title>
        <style>
            body {
                font-family: Tahoma, sans-serif;
                background: #0f0f1a;
                color: white;
                margin: 0;
                padding: 20px;
                text-align: center;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
            }
            h1 {
                color: #f115f9;
                margin: 20px 0;
            }
            .nav {
                margin: 30px 0;
            }
            .nav a {
                color: #667eea;
                text-decoration: none;
                margin: 0 15px;
                padding: 10px 20px;
                border: 1px solid #667eea;
                border-radius: 5px;
                display: inline-block;
            }
            .nav a:hover {
                background: #667eea;
                color: white;
            }
            .content {
                background: rgba(255,255,255,0.05);
                padding: 30px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .status {
                color: #10b981;
                font-weight: bold;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 VortexAI</h1>
            <div class="nav">
                <a href="/">داشبورد</a>
                <a href="/scan-page">اسکن</a>
                <a href="/analysis-page">تحلیل</a>
                <a href="/markets-page">بازار</a>
                <a href="/insights-page">بینش‌ها</a>
                <a href="/news-page">اخبار</a>
                <a href="/health-page">سلامت</a>
                <a href="/settings">تنظیمات</a>
            </div>
            <div class="content">
                ${content}
            </div>
        </div>
    </body>
    </html>`;
}

module.exports = (dependencies) => {
    const { gistManager, wsManager, apiClient } = dependencies;

    // صفحه اصلی
    router.get("/", (req, res) => {
        const content = `
            <h2>داشبورد VortexAI</h2>
            <p>سیستم تحلیل بازار کریپتو فعال شده است</p>
            <div class="status">✅ سیستم آماده به کار</div>
            <p>از منوی بالا برای دسترسی به بخش‌های مختلف استفاده کنید</p>
        `;
        res.send(generateSimplePage("داشبورد", content));
    });

    // صفحه اسکن
    router.get("/scan-page", (req, res) => {
        const content = `
            <h2>🔍 اسکن بازار</h2>
            <p>بررسی 300 ارز برتر بازار</p>
            <div class="status">🔄 در حال توسعه</div>
            <p>این بخش به زودی راه‌اندازی خواهد شد</p>
        `;
        res.send(generateSimplePage("اسکن بازار", content));
    });

    // صفحه تحلیل
    router.get("/analysis-page", (req, res) => {
        const content = `
            <h2>📊 تحلیل تکنیکال</h2>
            <p>تحلیل پیشرفته با اندیکاتورهای حرفه‌ای</p>
            <div class="status">🔄 در حال توسعه</div>
            <p>این بخش به زودی راه‌اندازی خواهد شد</p>
        `;
        res.send(generateSimplePage("تحلیل تکنیکال", content));
    });

    // صفحه بازار
    router.get("/markets-page", (req, res) => {
        const content = `
            <h2>📈 بازار سرمایه</h2>
            <p>داده‌های جامع بازارهای کریپتو</p>
            <div class="status">🔄 در حال توسعه</div>
            <p>این بخش به زودی راه‌اندازی خواهد شد</p>
        `;
        res.send(generateSimplePage("بازار سرمایه", content));
    });

    // صفحه بینش‌ها
    router.get("/insights-page", (req, res) => {
        const content = `
            <h2>💡 بینش‌های بازار</h2>
            <p>تحلیل احساسات و روندهای کلان</p>
            <div class="status">🔄 در حال توسعه</div>
            <p>این بخش به زودی راه‌اندازی خواهد شد</p>
        `;
        res.send(generateSimplePage("بینش‌های بازار", content));
    });

    // صفحه اخبار
    router.get("/news-page", (req, res) => {
        const content = `
            <h2>📰 اخبار کریپتو</h2>
            <p>آخرین اخبار و تحولات بازار</p>
            <div class="status">🔄 در حال توسعه</div>
            <p>این بخش به زودی راه‌اندازی خواهد شد</p>
        `;
        res.send(generateSimplePage("اخبار کریپتو", content));
    });

    // صفحه سلامت
    router.get("/health-page", (req, res) => {
        const content = `
            <h2>❤️ سلامت سیستم</h2>
            <p>بررسی وضعیت سرویس VortexAI</p>
            <div class="status">🔄 در حال توسعه</div>
            <p>این بخش به زودی راه‌اندازی خواهد شد</p>
        `;
        res.send(generateSimplePage("سلامت سیستم", content));
    });

    // صفحه تنظیمات
    router.get("/settings", (req, res) => {
        const content = `
            <h2>⚙️ تنظیمات سیستم</h2>
            <p>مدیریت و مانیتورینگ سرویس</p>
            <div class="status">🔄 در حال توسعه</div>
            <p>این بخش به زودی راه‌اندازی خواهد شد</p>
        `;
        res.send(generateSimplePage("تنظیمات", content));
    });

    return router;
};
