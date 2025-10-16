const express = require('express');
const router = express.Router();

// تابع تشخیص صفحه جاری
function detectCurrentPage() {
    if (typeof window !== 'undefined' && window.location) {
        const path = window.location.pathname;
        if (path === '/') return 'home';
        if (path.includes('/scan')) return 'scan';
        if (path.includes('/analysis')) return 'analyze';
        if (path.includes('/markets')) return 'market';
        if (path.includes('/insights')) return 'insights';
        if (path.includes('/news')) return 'news';
        if (path.includes('/health')) return 'health';
        if (path.includes('/settings')) return 'settings';
    }
    return 'home';
}

// تابع تولید نویگیشن بار
function generateClassNavigation(currentPage = 'home') {
    if (currentPage === "home") {
        currentPage = detectCurrentPage();
    }

    const navItems = [
        { id: 'home', label: 'DASH', page: '/', icon: 'D', context: ['all'], quickPeek: 'وضعیت کلی بازار' },
        { id: 'scan', label: 'SCAN', page: '/scan', icon: 'S', context: ['analysis', 'market'], quickPeek: 'اسکن بازارهای پرپتانسیل' },
        { id: 'analyze', label: 'ANALYZE', page: '/analysis?symbol=btc_usdt', icon: 'A', context: ['analysis', 'technical'], quickPeek: 'تحلیل تکنیکال' },
        { id: 'ai', label: 'AI', page: 'https://ai-test-2nxq.onrender.com/', icon: 'AI', ai: true, external: true, context: ['all'], quickPeek: 'تحلیل هوش مصنوعی' },
        { id: 'market', label: 'MARKET', page: '/markets/cap', icon: 'M', context: ['market', 'overview'], quickPeek: 'بازار و سرمایه' },
        { id: 'insights', label: 'INSIGHTS', page: '/insights/dashboard', icon: 'I', context: ['analysis', 'sentiment'], quickPeek: 'بینش‌های بازار' },
        { id: 'news', label: 'NEWS', page: '/news', icon: 'N', context: ['news', 'all'], quickPeek: 'اخبار زنده بازار' },
        { id: 'health', label: 'HEALTH', page: '/health', icon: 'H', context: ['system', 'all'], quickPeek: 'وضعیت سرورها' },
        { id: 'settings', label: 'SETTINGS', page: '/settings', icon: 'G', context: ['all'], quickPeek: 'تنظیمات کاربری' }
    ];

    function getContextAwareItems(allItems, currentPage) {
        const contextMap = {
            'home': ['all'], 'scan': ['analysis', 'market', 'all'], 'analyze': ['analysis', 'technical', 'all'],
            'market': ['market', 'overview', 'all'], 'insights': ['analysis', 'sentiment', 'all'], 'news': ['news', 'all'],
            'health': ['system', 'all'], 'settings': ['all']
        };
        const currentContext = contextMap[currentPage] || ['all'];
        return allItems.filter(item => item.context.some(context => currentContext.includes(context)));
    }

    const contextAwareItems = getContextAwareItems(navItems, currentPage);


    return `
    <!-- ناوبری شیشه‌ای هوشمند -->
    <div id="glassNav" class="glass-navigation">
        <!-- 1. دکمه شناور مایع -->
        <div class="nav-floater">
            <div class="liquid-button">
                <div class="nav-dot"></div>
                <div class="nav-dot"></div>
                <div class="nav-dot"></div>
            </div>
        </div>

        <!-- 2. کانتینر ناوبری -->
        <div class="nav-container" style="display: none;">
            <div class="nav-scroll" id="navScroll">
                ${contextAwareItems.map(item => `
                    <div class="nav-item ${item.id === currentPage ? 'active' : ''}"
                         data-page="${item.page}"
                         data-external="${item.external || false}"
                         data-ai="${item.ai || false}"
                         onmouseenter="showQuickPeek('${item.id}')"
                         onmouseleave="hideQuickPeek()"
                         ontouchstart="startPress('${item.id}')"
                         ontouchend="endPress('${item.id}')">
                        <div class="nav-icon animated-gradient">${item.icon}</div>
                        <div class="nav-text">${item.label}</div>
                    </div>
                `).join('')}
            </div>

            <!-- Command Palette -->
            <div class="command-palette" id="commandPalette">
                <input type="text" placeholder="...(s) btc analysis" onkeyup="searchCommands(event)">
                <div class="command-results" id="commandResults"></div>
            </div>
        </div>

        <!-- Quick Peek Overlay -->
        <div class="quick-peek-overlay" id="quickPeekOverlay">
            <div class="quick-peek-content" id="quickPeekContent"></div>
        </div>
    </div>

    <style>
        .glass-navigation {
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .nav-floater {
            width: 65px; height: 65px; background: linear-gradient(135deg, rgba(102,126,234,0.9), rgba(118,75,162,0.9));
            backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.3); border-radius: 25px;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            box-shadow: 0 15px 35px rgba(102,126,234,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.4s ease; position: relative; overflow: hidden;
        }
        .nav-floater:hover {
            transform: scale(1.1); box-shadow: 0 20px 45px rgba(102,126,234,0.7), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .liquid-button {
            position: relative; width: 30px; height: 30px; display: flex; align-items: center; 
            justify-content: center; gap: 3px;
        }
        .nav-dot {
            width: 5px; height: 5px; background: rgba(255,255,255,0.9); border-radius: 50%;
            animation: dotPulse 2s infinite ease-in-out; box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
        .nav-dot:nth-child(1) { animation-delay: 0s; }
        .nav-dot:nth-child(2) { animation-delay: 0.3s; }
        .nav-dot:nth-child(3) { animation-delay: 0.6s; }
        @keyframes dotPulse {
            0%,100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.3); opacity: 1; }
        }
        .nav-container {
            background: rgba(30,35,50,0.95); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.15);
            border-radius: 25px; padding: 20px; margin-bottom: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1); max-width: 400px;
        }
        .nav-scroll {
            display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, auto); gap: 12px;
            width: 100%; max-height: 250px; overflow-y: auto; scroll-behavior: smooth; scrollbar-width: none;
        }
        .nav-scroll::-webkit-scrollbar { display: none; }
        .nav-item {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 12px 8px; border-radius: 16px; cursor: pointer; transition: all 0.3s ease;
            background: rgba(255,255,255,0.08); border: 1px solid transparent; position: relative;
            overflow: hidden; min-height: 70px;
        }
        .nav-item::before {
            content: ""; position: absolute; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
            transform: translate(-50%, -50%); transition: all 0.6s ease; opacity: 0;
        }
        .nav-item:hover::before {
            width: 120px; height: 120px; opacity: 1; animation: liquidWave 0.6s ease-out;
        }
        @keyframes liquidWave {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        .nav-item:hover {
            background: rgba(255,255,255,0.15); transform: translateY(-2px);
            border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        .nav-item.active {
            background: linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3));
            border: 1px solid rgba(102,126,234,0.4); box-shadow: 0 8px 25px rgba(102,126,234,0.3);
        }
        .animated-gradient {
            background: linear-gradient(45deg, #667eea, #764ba2, #f093fb); background-size: 200% 200%;
            animation: gradientShift 3s ease infinite; -webkit-background-clip: text;
            -webkit-text-fill-color: transparent; background-clip: text;
        }
        @keyframes gradientShift {
            0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% }
        }
        .nav-text {
            font-size: 0.7rem; font-weight: 700; color: #f115f9; text-align: center; text-transform: uppercase;
            letter-spacing: 0.5px; text-shadow: 0 1px 2px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3);
            background: linear-gradient(135deg, #f115f9, #cbd5e1); -webkit-background-clip: text;
            -webkit-text-fill-color: transparent; background-clip: text;
        }
        .nav-item:hover .nav-text {
            background: linear-gradient(135deg, #ffffff, #e2e8f0); -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .nav-item.active .nav-text {
            background: linear-gradient(135deg, #667eea, #a855f7); -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .command-palette {
            display: none; position: absolute; top: -80px; left: 0; right: 0;
            background: rgba(30,35,50,0.98); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.2);
            border-radius: 15px; padding: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.4);
        }
        .quick-peek-overlay {
            display: none; position: fixed; bottom: 120px; left: 50%; transform: translateX(-50%);
            background: rgba(30,35,50,0.95); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.2);
            border-radius: 15px; padding: 15px; max-width: 300px; z-index: 1001;
            box-shadow: 0 15px 35px rgba(0,0,0,0.4);
        }
        @media (max-width: 400px) {
            .nav-container { max-width: 320px; padding: 15px; }
            .nav-scroll { gap: 10px; }
            .nav-item { padding: 10px 6px; min-height: 60px; }
            .nav-text { font-size: 0.65rem; }
            .nav-floater { width: 60px; height: 60px; }
        }
    </style>
    </script>
        // تابع toggle برای منو
        function toggleGlassNav() {
            console.log('Toggle navigation called');
            const nav = document.getElementById('glassNav');
            const container = document.querySelector('.nav-container');
            
            if (nav && container) {
                const isExpanded = nav.classList.contains('expanded');
                nav.classList.toggle('expanded');
                
                if (!isExpanded) {
                    container.style.display = 'block';
                } else {
                    container.style.display = 'none';
                }
            }
        }

        // وصل کردن event listener به دکمه شناور
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded - Setting up navigation...');
            
            const floater = document.querySelector('.nav-floater');
            if (floater) {
                floater.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleGlassNav();
                });
                console.log('✅ Floater event listener attached');
            }
        });
    </script>
`;
}

// تابع تولید صفحه مدرن
function generateModernPage(title, bodyContent, currentPage = 'home') {
    const baseStyles = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
        min-height: 100vh;
        color: #e2e8f0;
        line-height: 1.6;
        padding-bottom: 120px;
        position: relative;
        overflow-x: hidden;
    }
    body::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
            radial-gradient(circle at 20% 80%, rgba(120,119,198,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,119,198,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120,219,255,0.05) 0%, transparent 50%);
        pointer-events: none;
        z-index: -1;
        animation: backgroundShift 20s ease-in-out infinite;
    }
    @keyframes backgroundShift {
        0%,100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.1) rotate(180deg); }
    }
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        animation: fadeInUp 0.8s ease-out;
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .glass-card {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 25px;
        margin-bottom: 20px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    }
    .glass-card:hover {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    }
    .header {
        text-align: center;
        margin-bottom: 30px;
        padding: 40px 20px;
        position: relative;
    }
    .header::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #a855f7, #f093fb);
        border-radius: 2px;
    }
    .header h1 {
        font-size: 2.5rem;
        background: linear-gradient(135deg, #667eea, #a855f7, #f093fb);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 15px;
        font-weight: 700;
        text-shadow: 0 4px 20px rgba(102,126,234,0.3);
    }
    .header p {
        color: #94a3b8;
        font-size: 1.1rem;
        max-width: 600px;
        margin: 0 auto;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
    }
    @media (max-width: 768px) {
        .stats-grid { grid-template-columns: 1fr; }
    }
    .stat-card {
        background: rgba(255,255,255,0.05);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        border: 1px solid rgba(255,255,255,0.05);
    }
    .stat-card:hover {
        transform: translateY(-5px);
        background: rgba(255,255,255,0.08);
        box-shadow: 0 8px 30px rgba(0,0,0,0.25);
    }
    .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: #f115f9;
        margin-bottom: 8px;
        text-shadow: 0 2px 10px rgba(241,21,249,0.3);
    }
    .stat-label {
        font-size: 0.8rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .btn {
        background: linear-gradient(135deg, #667eea, #a855f7);
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        text-align: center;
        transition: all 0.3s ease;
    }
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102,126,234,0.4);
    }
    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        background: rgba(255,255,255,0.05);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .data-table th, .data-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .data-table th {
        color: #f115f9;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.8rem;
        background: rgba(255,255,255,0.05);
    }
    .data-table tr:hover {
        background: rgba(255,255,255,0.05);
    }
    `;

    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - VortexAI</title>
    <style>${baseStyles}</style>
</head>
<body>
    <div class="container">
        ${bodyContent}
    </div>
    ${generateClassNavigation(currentPage)}
</body>
</html>`;
}

// Routes
module.exports = (dependencies) => {
    const { gistManager, wsManager, apiClient } = dependencies;

        // Route اصلی
    router.get('/', async (req, res) => {
        try {
            const wsStatus = wsManager ? wsManager.getConnectionStatus() : null;
            const gistData = gistManager ? gistManager.getAllData() : null;
            
            const bodyContent = `
                <div class="header">
                    <h1>VortexAI Crypto Dashboard</h1>
                    <p>داده‌های زنده و بینش‌های هوشمند برای تحلیل بازارهای کریپتو</p>
                </div>
                
                <div class="glass-card">
                    <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">وضعیت سیستم</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${wsStatus?.connected ? 'فعال' : 'غیرفعال'}</div>
                            <div class="stat-label">اتصال WebSocket</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${wsStatus?.active_coins || 0}</div>
                            <div class="stat-label">ارزهای فعال</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${gistData?.prices ? Object.keys(gistData.prices).length : 0}</div>
                            <div class="stat-label">ارزهای ذخیره شده</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${Math.round(process.uptime() / 3600)}h</div>
                            <div class="stat-label">مدت فعالیت سیستم</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">اقدامات سریع</h2>
                    <div class="stats-grid">
                        <a href="/scan" class="btn">اسکن بازار</a>
                        <a href="/analysis?symbol=btc_usdt" class="btn">تحلیل تکنیکال</a>
                        <a href="/markets/cap" class="btn">داده‌های بازار</a>
                        <a href="/insights/dashboard" class="btn">بینش‌های بازار</a>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">آمار فوری</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">24/7</div>
                            <div class="stat-label">نظارت زنده</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">99.9%</div>
                            <div class="stat-label">دقت تحلیل</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">50+</div>
                            <div class="stat-label">شاخص فنی</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">0.1s</div>
                            <div class="stat-label">تأخیر داده</div>
                        </div>
                    </div>
                </div>
            `;
            res.send(generateModernPage('داشبورد', bodyContent, 'home'));
        } catch (error) {
            console.error('Dashboard error', error);
            res.status(500).send('خطا در بارگذاری داشبورد');
        }
    });

    // صفحه اسکن
    router.get('/scan', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const filter = req.query.filter || 'volume';
            
            let scanData = { coins: [] };
            if (apiClient) {
                scanData = await apiClient.getCoins(limit).catch(() => ({ coins: [] }));
            }

            const coins = scanData.coins || [];
            
            const bodyContent = `
                <div class="header">
                    <h1>اسکن بازار</h1>
                    <p>تحلیل زنده بازار ارزهای دیجیتال - شناسایی فرصت‌های سرمایه‌گذاری</p>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">پیکربندی اسکن</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${limit}</div>
                            <div class="stat-label">تعداد ارزها</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${filter.toUpperCase()}</div>
                            <div class="stat-label">فیلتر فعال</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${coins.length}</div>
                            <div class="stat-label">ارزهای یافت شده</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">فعال</div>
                            <div class="stat-label">وضعیت</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">نتایج اسکن</h2>
                    ${coins.length > 0 ? `
                        <div style="max-height: 400px; overflow-y: auto;">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>نماد</th>
                                        <th>قیمت (USDT)</th>
                                        <th>تغییرات 24h</th>
                                        <th>حجم</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${coins.slice(0, 15).map((coin, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td><strong>${coin.symbol || 'N/A'}</strong></td>
                                            <td>${coin.price ? parseFloat(coin.price).toFixed(4) : '0.0000'}</td>
                                            <td style="color: ${(coin.priceChange24h || 0) >= 0 ? '#10b981' : '#ef4444'}">
                                                ${coin.priceChange24h ? parseFloat(coin.priceChange24h).toFixed(2) + '%' : '0.00%'}
                                            </td>
                                            <td>${coin.volume ? (coin.volume / 1e6).toFixed(1) + 'M' : '0'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 40px; color: #94a3b8;">
                            <div style="font-size: 3rem; margin-bottom: 20px;">⏳</div>
                            <h3>در حال بارگذاری داده‌ها</h3>
                            <p>لطفاً چند لحظه صبر کنید</p>
                        </div>
                    `}
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">فیلترهای پیشرفته</h2>
                    <div class="stats-grid">
                        <button class="btn" onclick="applyFilter('volume')">حجم معاملات</button>
                        <button class="btn" onclick="applyFilter('gainers')">بازدهی مثبت</button>
                        <button class="btn" onclick="applyFilter('losers')">بازدهی منفی</button>
                        <button class="btn" onclick="applyFilter('trending')">پرطرفدار</button>
                    </div>
                </div>

                <script>
                    function applyFilter(filter) {
                        window.location.href = '/scan?filter=' + filter;
                    }
                </script>
            `;
            res.send(generateModernPage('اسکن بازار', bodyContent, 'scan'));
        } catch (error) {
            console.error('Scan page error', error);
            res.status(500).send('خطا در بارگذاری صفحه اسکن');
        }
    });

    // سایر Routes
    router.get('/analysis', async (req, res) => {
        const symbol = req.query.symbol || 'btc_usdt';
        const bodyContent = `
            <div class="header">
                <h1>تحلیل تکنیکال</h1>
                <p>شاخص‌های فنی پیشرفته برای ${symbol.toUpperCase()}</p>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">تحلیل بازار</h2>
                <p style="text-align: center;">داده‌های تحلیل در حال بارگذاری...</p>
            </div>
        `;
        res.send(generateModernPage(`تحلیل تکنیکال - ${symbol.toUpperCase()}`, bodyContent, 'analyze'));
    });

    router.get('/markets/cap', async (req, res) => {
        const bodyContent = `
            <div class="header">
                <h1>سرمایه بازار</h1>
                <p>داده‌های جهانی بازار ارزهای دیجیتال</p>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">آمار بازار</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">$2.1T</div>
                        <div class="stat-label">سرمایه کل بازار</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">$85.4B</div>
                        <div class="stat-label">حجم معاملات 24h</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">52.8%</div>
                        <div class="stat-label">تسلط بیت‌کوین</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">17.2%</div>
                        <div class="stat-label">تسلط اتریوم</div>
                    </div>
                </div>
            </div>
        `;
        res.send(generateModernPage('بازار سرمایه', bodyContent, 'market'));
    });

    // Routes اضافی
    router.get('/insights/dashboard', async (req, res) => {
        const bodyContent = `
            <div class="header">
                <h1>بینش‌های بازار</h1>
                <p>تحلیل‌های پیشرفته و بینش‌های هوشمند</p>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">شاخص‌های احساسات بازار</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">65</div>
                        <div class="stat-label">شاخص ترس و طمع</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">52.8%</div>
                        <div class="stat-label">تسلط بیت‌کوین</div>
                    </div>
                </div>
            </div>
        `;
        res.send(generateModernPage('بینش‌های بازار', bodyContent, 'insights'));
    });

    router.get('/news', async (req, res) => {
        const bodyContent = `
            <div class="header">
                <h1>اخبار کریپتو</h1>
                <p>آخرین اخبار و به‌روزرسانی‌های بازار</p>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">آخرین اخبار</h2>
                <p style="text-align: center;">در حال بارگذاری اخبار...</p>
            </div>
        `;
        res.send(generateModernPage('اخبار کریپتو', bodyContent, 'news'));
    });

    router.get('/health', async (req, res) => {
        const bodyContent = `
            <div class="header">
                <h1>سلامت سیستم</h1>
                <p>مانیتورینگ سرویس‌ها و عملکرد سرورها</p>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">وضعیت سرویس‌ها</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">✅</div>
                        <div class="stat-label">API اصلی</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">✅</div>
                        <div class="stat-label">WebSocket</div>
                    </div>
                </div>
            </div>
        `;
        res.send(generateModernPage('سلامت سیستم', bodyContent, 'health'));
    });

    router.get('/settings', async (req, res) => {
        const bodyContent = `
            <div class="header">
                <h1>تنظیمات پیشرفته</h1>
                <p>شخصی‌سازی محیط و تنظیمات کاربری</p>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">تنظیمات نمایش</h2>
                <p style="text-align: center;">صفحه تنظیمات در حال توسعه...</p>
            </div>
        `;
        res.send(generateModernPage('تنظیمات پیشرفته', bodyContent, 'settings'));
    });

    return router;
};
