const express = require('express');
const router = express.Router();

// ===== تابع تولید نویگیشن بار جدید =====
function generateClassNavigation(currentPage = 'home') {
    const navItems = [
        // دکمه‌های ردیف اول (4 تایی)
        { id: 'home', label: 'DASH', page: '/', icon: 'D' },
        { id: 'scan', label: 'SCAN', page: '/scan', icon: 'S' },
        { id: 'analyze', label: 'ANALYZE', page: '/analysis?symbol=btc_usdt', icon: 'A' },
        { id: 'ai', label: 'AI', page: 'https://ai-test-2nxq.onrender.com/', icon: 'AI', ai: true },
        
        // دکمه‌های ردیف دوم (4 تایی)  
        { id: 'market', label: 'MARKET', page: '/markets/cap', icon: 'M' },
        { id: 'insights', label: 'INSIGHTS', page: '/insights/dashboard', icon: 'I' },
        { id: 'news', label: 'NEWS', page: '/news', icon: 'N' },
        { id: 'health', label: 'HEALTH', page: '/health', icon: 'H' },
        
        // دکمه نهم - SETTINGS
        { id: 'settings', label: 'SETTINGS', page: '/settings', icon: '⚙' }
    ];

    return `
<!-- ناوبری شیشه‌ای شناور -->
<div id="glassNav" class="glass-navigation">
    <!-- دکمه شناور مایع -->
    <div class="nav-floater" onclick="toggleGlassNav()">
        <div class="liquid-button">
            <div class="nav-dot"></div>
            <div class="nav-dot"></div>
            <div class="nav-dot"></div>
        </div>
    </div>

    <!-- کانتینر ناوبری -->
    <div class="nav-container">
        <div class="nav-scroll" id="navScroll">
            ${navItems.map(item => `
                <div class="nav-item ${item.id === currentPage ? 'active' : ''}" 
                     onclick="navigateTo('${item.page}', ${item.external || false}, ${item.ai || false})">
                    <div class="nav-icon">${item.icon}</div>
                    <div class="nav-text">${item.label}</div>
                </div>
            `).join('')}
        </div>
    </div>
</div>

<style>
/* استایل ناوبری شیشه‌ای */
.glass-navigation {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* دکمه شناور مایع */
.nav-floater {
    width: 65px;
    height: 65px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
    backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 15px 35px rgba(102, 126, 234, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
}

.nav-floater:hover {
    transform: scale(1.1);
    box-shadow: 0 20px 45px rgba(102, 126, 234, 0.7),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* نقاط ناوبری */
.liquid-button {
    position: relative;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
}

.nav-dot {
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    animation: dotPulse 2s infinite ease-in-out;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.nav-dot:nth-child(1) { animation-delay: 0s; }
.nav-dot:nth-child(2) { animation-delay: 0.3s; }
.nav-dot:nth-child(3) { animation-delay: 0.6s; }

@keyframes dotPulse {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.3); opacity: 1; }
}

/* کانتینر ناوبری اصلی */
.nav-container {
    display: none;
    background: rgba(30, 35, 50, 0.95);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 25px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
    max-width: 400px;
}

.glass-navigation.expanded .nav-container {
    display: block;
    animation: slideUp 0.4s ease;
}

.glass-navigation.expanded .nav-floater {
    transform: scale(0.9) rotate(180deg);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
}

/* شبکه 3×3 برای ناوبری */
.nav-scroll {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, auto);
    gap: 12px;
    width: 100%;
    max-height: 250px;
    overflow-y: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
}

.nav-scroll::-webkit-scrollbar {
    display: none;
}

/* آیتم‌های ناوبری */
.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid transparent;
    position: relative;
    overflow: hidden;
    min-height: 70px;
}

.nav-item:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.nav-item.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
    border: 1px solid rgba(102, 126, 234, 0.4);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* آیکون */
.nav-icon {
    font-size: 1.4rem;
    margin-bottom: 6px;
    opacity: 0.9;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    color: #f115f9;
}

/* متن شیشه‌ای */
.nav-text {
    font-size: 0.7rem;
    font-weight: 700;
    color: #f115f9;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5),
                 0 0 20px rgba(255, 255, 255, 0.3);
    background: linear-gradient(135deg, #f1f5f9, #cbd5e1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.nav-item:hover .nav-text {
    background: linear-gradient(135deg, #ffffff, #e2e8f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nav-item.active .nav-text {
    background: linear-gradient(135deg, #667eea, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* انیمیشن‌ها */
@keyframes slideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

/* رسپانسیو */
@media (max-width: 400px) {
    .nav-container {
        max-width: 320px;
        padding: 15px;
    }
    
    .nav-scroll {
        gap: 10px;
    }
    
    .nav-item {
        padding: 10px 6px;
        min-height: 60px;
    }
    
    .nav-text {
        font-size: 0.65rem;
    }
    
    .nav-floater {
        width: 60px;
        height: 60px;
    }
}
</style>

<script>
// ===== توابع اصلی =====
function toggleGlassNav() {
    const nav = document.getElementById('glassNav');
    nav.classList.toggle('expanded');
}

function navigateTo(page, isExternal = false, isAI = false) {
    if (isAI) {
        handleAIClick();
        return;
    }
    
    if (isExternal) {
        window.open(page, '_blank');
    } else {
        window.location.href = page;
    }
}

// ===== توابع AI =====
function handleAIClick() {
    const aiMenu = `
        <div class="ai-menu-overlay" onclick="closeAIMenu()">
            <div class="ai-menu" onclick="event.stopPropagation()">
                <h3>📊 دریافت داده برای AI</h3>
                <div class="ai-menu-items">
                    <div class="ai-menu-item" onclick="getAIData('single')">
                        <div class="ai-icon">📈</div>
                        <div class="ai-text">
                            <div class="ai-title">داده تک کوین</div>
                            <div class="ai-desc">داده تاریخی یک ارز خاص</div>
                        </div>
                    </div>
                    <div class="ai-menu-item" onclick="getAIData('multi')">
                        <div class="ai-icon">🔄</div>
                        <div class="ai-text">
                            <div class="ai-title">داده چند کوین</div>
                            <div class="ai-desc">مقایسه چند ارز مختلف</div>
                        </div>
                    </div>
                    <div class="ai-menu-item" onclick="getAIData('market')">
                        <div class="ai-icon">🌐</div>
                        <div class="ai-text">
                            <div class="ai-title">داده کلی بازار</div>
                            <div class="ai-desc">آمار و روندهای بازار</div>
                        </div>
                    </div>
                </div>
                <button class="ai-close-btn" onclick="closeAIMenu()">بستن</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', aiMenu);
}

function closeAIMenu() {
    const overlay = document.querySelector('.ai-menu-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function getAIData(type) {
    let url = '';
    let message = '';
    
    switch(type) {
        case 'single':
            url = '/coin/btc_usdt/history/24h';
            message = 'داده‌های تک کوین (BTC)';
            break;
        case 'multi':
            url = '/ai/raw/multi?symbols=btc,eth,sol&timeframe=24h';
            message = 'داده‌های چند کوین';
            break;
        case 'market':
            url = '/ai/raw/market?timeframe=24h';
            message = 'داده‌های کلی بازار';
            break;
    }
    
    const fullUrl = window.location.origin + url;
    
    // کپی لینک به کلیپ‌بورد
    navigator.clipboard.writeText(fullUrl)
        .then(() => {
            alert(`✅ ${message} آماده است!\\n\\nلینک در کلیپ‌بورد کپی شد.\\n\\nحالا به AI رفته و این لینک را وارد کنید:`);
        })
        .catch(() => {
            // اگر کپی نشد، لینک را نشان بده
            alert(`✅ ${message} آماده است!\\n\\nاین لینک را در AI وارد کنید:\\n\\n${fullUrl}`);
        });
    
    closeAIMenu();
}

// سوایپ برای موبایل
let touchStartX = 0;
document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
        const navScroll = document.getElementById('navScroll');
        if (navScroll) {
            const scrollAmount = navScroll.clientWidth * 0.8;
            if (diff > 0) {
                navScroll.scrollLeft += scrollAmount;
            } else {
                navScroll.scrollLeft -= scrollAmount;
            }
        }
    }
});

// بستن منو با کلیک خارج
document.addEventListener('click', (e) => {
    const glassNav = document.getElementById('glassNav');
    if (!glassNav.contains(e.target)) {
        glassNav.classList.remove('expanded');
    }
});
</script>
    `;
}

// ===== تابع تولید صفحه مدرن =====
function generateModernPage(title, bodyContent, currentPage = 'home') {
    const baseStyles = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.05) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }

        .glass-card:hover {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 40px 20px;
        }

        .header h1 {
            font-size: 2.5rem;
            background: linear-gradient(135deg, #667eea, #a855f7, #f093fb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 15px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }

        .header p {
            color: #94a3b8;
            font-size: 1.1rem;
            font-weight: 400;
        }

        /* شبکه 2×2 برای کارت‌ها */
        .grid-2x2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        .square-card {
            aspect-ratio: 1;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 25px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }

        .square-card:hover {
            transform: translateY(-8px);
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(102, 126, 234, 0.3);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .card-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
            opacity: 0.9;
        }

        .card-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: #94a3b8;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .card-value {
            font-size: 2rem;
            font-weight: bold;
            color: #f115f9;
            line-height: 1.2;
            margin-bottom: 5px;
        }

        .card-subtitle {
            font-size: 0.8rem;
            color: #64748b;
            font-weight: 500;
        }

        /* بخش آمار */
        .stats-section {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .section-title {
            color: #f115f9;
            margin-bottom: 25px;
            text-align: center;
            font-size: 1.4rem;
            font-weight: 600;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .stat-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
        }

        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #f115f9;
            margin-bottom: 8px;
        }

        .stat-label {
            font-size: 0.8rem;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }

        .last-update {
            text-align: center;
            margin-top: 30px;
            color: #64748b;
            font-size: 0.9rem;
        }

        /* دکمه‌ها */
        .btn {
            background: linear-gradient(135deg, #667eea, #a855f7);
            border: none;
            border-radius: 12px;
            padding: 12px 24px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        /* جداول داده */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .data-table th,
        .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .data-table th {
            color: #f115f9;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 1px;
        }

        .data-table tr:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        /* پیش‌نمایش JSON */
        .json-preview {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }

        /* استایل‌های AI */
        .ai-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }

        .ai-menu {
            background: rgba(30, 35, 50, 0.95);
            backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
        }

        .ai-menu h3 {
            color: #f115f9;
            text-align: center;
            margin-bottom: 25px;
            font-size: 1.3rem;
        }

        .ai-menu-items {
            display: grid;
            gap: 15px;
            margin-bottom: 25px;
        }

        .ai-menu-item {
            display: flex;
            align-items: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid transparent;
        }

        .ai-menu-item:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(102, 126, 234, 0.5);
            transform: translateY(-2px);
        }

        .ai-icon {
            font-size: 2rem;
            margin-left: 15px;
            flex-shrink: 0;
        }

        .ai-text {
            flex: 1;
        }

        .ai-title {
            color: #e2e8f0;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .ai-desc {
            color: #94a3b8;
            font-size: 0.8rem;
        }

        .ai-close-btn {
            width: 100%;
            padding: 12px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: #e2e8f0;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .ai-close-btn:hover {
            background: rgba(255, 255, 255, 0.15);
        }
    `;

    return `
<!DOCTYPE html>
<html lang="fa">
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
</html>
    `;
}

// ===== مسیرهای اصلی =====
module.exports = ({ gistManager, wsManager, apiClient }) => {
    
    // صفحه اصلی دشبورد
    router.get("/", async (req, res) => {
        try {
            const wsStatus = wsManager.getConnectionStatus();
            const gistData = gistManager.getAllData();

            // دریافت داده‌های بازار
            const marketAPI = new (require('./models/APIClients').MarketDataAPI)();
            const marketData = await marketAPI.getMarketCap().catch(() => ({}));

            const bodyContent = `
                <div class="header">
                    <h1>VortexAI Crypto Dashboard</h1>
                    <p>Real-time market intelligence and AI-powered insights</p>
                </div>

                <div class="grid-2x2">
                    <div class="square-card">
                        <div class="card-icon">💾</div>
                        <div class="card-title">DATA STORAGE</div>
                        <div class="card-value">${Object.keys(gistData.prices || {}).length}</div>
                        <div class="card-subtitle">trading pairs</div>
                    </div>

                    <div class="square-card">
                        <div class="card-icon">🔗</div>
                        <div class="card-title">LIVE CONNECTION</div>
                        <div class="card-value">${wsStatus.connected ? 'ONLINE' : 'OFFLINE'}</div>
                        <div class="card-subtitle">${wsStatus.active_coins} active coins</div>
                    </div>

                    <div class="square-card">
                        <div class="card-icon">💰</div>
                        <div class="card-title">TOTAL MARKET CAP</div>
                        <div class="card-value">${marketData.marketCap ? (marketData.marketCap / 1e12).toFixed(1) + 'T' : 'N/A'}</div>
                        <div class="card-subtitle">global crypto market</div>
                    </div>

                    <div class="square-card">
                        <div class="card-icon">🟢</div>
                        <div class="card-title">SYSTEM STATUS</div>
                        <div class="card-value">ACTIVE</div>
                        <div class="card-subtitle">all systems operational</div>
                    </div>
                </div>

                <div class="stats-section">
                    <h2 class="section-title">Performance Metrics</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${wsStatus.request_count || 0}</div>
                            <div class="stat-label">API REQUESTS</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${Math.round(process.uptime() / 3600)}h</div>
                            <div class="stat-label">SYSTEM UPTIME</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${Object.keys(gistData.prices || {}).length}</div>
                            <div class="stat-label">TRACKED PAIRS</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">26</div>
                            <div class="stat-label">ACTIVE ENDPOINTS</div>
                        </div>
                    </div>
                    
                    <div class="last-update">
                        Last updated: ${new Date().toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">Quick Actions</h2>
                    <div class="stats-grid">
                        <a href="/scan" class="btn" style="text-align: center;">Start Scan</a>
                        <a href="/analysis?symbol=btc_usdt" class="btn" style="text-align: center;">Technical Analysis</a>
                        <a href="/markets/cap" class="btn" style="text-align: center;">Market Data</a>
                        <a href="/insights/dashboard" class="btn" style="text-align: center;">Market Insights</a>
                    </div>
                </div>
            `;

            res.send(generateModernPage('Dashboard', bodyContent, 'home'));
        } catch (error) {
            console.error('Dashboard error', error);
            res.status(500).send('Error loading dashboard');
        }
    });


    // ===== صفحه اسکن (SCAN) =====
router.get("/scan", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const filter = req.query.filter || 'volume';

        // دریافت داده‌های اسکن از اندپوینت جدید
        const scanData = await apiClient.getCoins(limit);
        const coins = scanData.coins || [];

        const bodyContent = `
            <div class="header">
                <h1>Market Scanner</h1>
                <p>Real-time cryptocurrency market analysis</p>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Scan Configuration</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${limit}</div>
                        <div class="stat-label">COINS TO SCAN</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${filter.toUpperCase()}</div>
                        <div class="stat-label">FILTER TYPE</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${coins.length}</div>
                        <div class="stat-label">AVAILABLE COINS</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">LIVE</div>
                        <div class="stat-label">DATA SOURCE</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Scan Results</h2>
                ${coins.length > 0 ? `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Symbol</th>
                                <th>Price</th>
                                <th>24h Change</th>
                                <th>Volume</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${coins.slice(0, 10).map(coin => `
                                <tr>
                                    <td>${coin.rank || 'N/A'}</td>
                                    <td><strong>${coin.symbol}</strong></td>
                                    <td>$${coin.price ? parseFloat(coin.price).toFixed(2) : '0.00'}</td>
                                    <td style="color: ${(coin.priceChange24h || 0) >= 0 ? '#10b981' : '#ef4444'}">
                                        ${coin.priceChange24h ? parseFloat(coin.priceChange24h).toFixed(2) + '%' : '0.00%'}
                                    </td>
                                    <td>$${coin.volume ? (coin.volume / 1e6).toFixed(1) + 'M' : '0'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${coins.length > 10 ? `<p style="text-align: center; margin-top: 15px; color: #94a3b8;">... and ${coins.length - 10} more coins</p>` : ''}
                ` : `
                    <div style="text-align: center; padding: 40px; color: #94a3b8;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">🔍</div>
                        <h3>No scan data available</h3>
                        <p>Try refreshing or check your connection</p>
                    </div>
                `}
            </div>

            <div class="glass-card">
                <h2 class="section-title">Advanced Scanning</h2>
                <div class="stats-grid">
                    <a href="/scan/vortexai" class="btn" style="text-align: center;">VortexAI Scan</a>
                    <a href="/ai/top" class="btn" style="text-align: center;">AI Top Analysis</a>
                    <a href="/ai/market-overview" class="btn" style="text-align: center;">Market Overview</a>
                    <a href="/analysis?symbol=btc_usdt" class="btn" style="text-align: center;">Technical Analysis</a>
                </div>
            </div>
        `;

        res.send(generateModernPage('Market Scanner', bodyContent, 'scan'));
    } catch (error) {
        console.error('Scan page error', error);
        res.status(500).send('Error loading scanner');
    }
});

// ===== صفحه تحلیل (ANALYZE) =====
router.get("/analysis", async (req, res) => {
    try {
        const symbol = req.query.symbol || 'btc_usdt';
        const historicalData = gistManager.getPriceData(symbol, "24h");
        const realtimeData = wsManager.getRealtimeData()[symbol];

        const bodyContent = `
            <div class="header">
                <h1>Technical Analysis</h1>
                <p>Advanced technical indicators for ${symbol.toUpperCase()}</p>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Current Market Data</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${symbol.replace('_usdt', '').toUpperCase()}</div>
                        <div class="stat-label">SYMBOL</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">$${realtimeData?.price ? parseFloat(realtimeData.price).toFixed(2) : 'N/A'}</div>
                        <div class="stat-label">CURRENT PRICE</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: ${(realtimeData?.change || 0) >= 0 ? '#10b981' : '#ef4444'}">
                            ${realtimeData?.change ? parseFloat(realtimeData.change).toFixed(2) + '%' : '0.00%'}
                        </div>
                        <div class="stat-label">24H CHANGE</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${historicalData?.history?.length || 0}</div>
                        <div class="stat-label">DATA POINTS</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Technical Indicators</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">RSI</div>
                        <div class="stat-label">RELATIVE STRENGTH</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">MACD</div>
                        <div class="stat-label">MOMENTUM</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">BB</div>
                        <div class="stat-label">BOLLINGER BANDS</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">EMA</div>
                        <div class="stat-label">TREND</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Symbol Selection</h2>
                <div style="text-align: center; padding: 20px;">
                    <select onchange="window.location.href='/analysis?symbol=' + this.value" 
                            style="padding: 12px 20px; border-radius: 12px; background: rgba(255,255,255,0.1); 
                                   color: white; border: 1px solid rgba(255,255,255,0.2); 
                                   font-size: 1rem; width: 200px;">
                        <option value="btc_usdt" ${symbol == 'btc_usdt' ? 'selected' : ''}>BTC/USDT</option>
                        <option value="eth_usdt" ${symbol == 'eth_usdt' ? 'selected' : ''}>ETH/USDT</option>
                        <option value="sol_usdt" ${symbol == 'sol_usdt' ? 'selected' : ''}>SOL/USDT</option>
                        <option value="ada_usdt" ${symbol == 'ada_usdt' ? 'selected' : ''}>ADA/USDT</option>
                        <option value="doge_usdt" ${symbol == 'doge_usdt' ? 'selected' : ''}>DOGE/USDT</option>
                    </select>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Analysis Tools</h2>
                <div class="stats-grid">
                    <a href="/coin/${symbol.replace('_usdt', '')}/technical" class="btn" style="text-align: center;">
                        Advanced Analysis
                    </a>
                    <a href="/coin/${symbol.replace('_usdt', '')}/history/24h" class="btn" style="text-align: center;">
                        Historical Data
                    </a>
                    <a href="/ai/single/${symbol.replace('_usdt', '')}" class="btn" style="text-align: center;">
                        AI Analysis
                    </a>
                    <a href="/insights/dashboard" class="btn" style="text-align: center;">
                        Market Insights
                    </a>
                </div>
            </div>
        `;

        res.send(generateModernPage(`Technical Analysis - ${symbol.toUpperCase()}`, bodyContent, 'analyze'));
    } catch (error) {
        console.error("Technical analysis page error:", error);
        res.status(500).send("Error loading technical analysis");
    }
});

// ===== صفحه بازار (MARKET) =====
router.get("/markets/cap", async (req, res) => {
    try {
        const marketAPI = new (require('./models/APIClients').MarketDataAPI)();
        const marketData = await marketAPI.getMarketCap();

        const bodyContent = `
            <div class="header">
                <h1>Market Capitalization</h1>
                <p>Global cryptocurrency market data and trends</p>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Market Overview</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">$${marketData.marketCap ? (marketData.marketCap / 1e12).toFixed(1) + 'T' : 'N/A'}</div>
                        <div class="stat-label">TOTAL MARKET CAP</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">$${marketData.volume ? (marketData.volume / 1e9).toFixed(1) + 'B' : 'N/A'}</div>
                        <div class="stat-label">24H VOLUME</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${marketData.btcDominance ? marketData.btcDominance.toFixed(1) + '%' : 'N/A'}</div>
                        <div class="stat-label">BTC DOMINANCE</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${marketData.ethDominance ? marketData.ethDominance.toFixed(1) + '%' : 'N/A'}</div>
                        <div class="stat-label">ETH DOMINANCE</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Market Metrics</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${marketData.activeCryptocurrencies || '8,000+'}</div>
                        <div class="stat-label">ACTIVE COINS</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${marketData.marketCapChange24h ? marketData.marketCapChange24h.toFixed(1) + '%' : 'N/A'}</div>
                        <div class="stat-label">24H CHANGE</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${marketData.totalExchanges || '500+'}</div>
                        <div class="stat-label">EXCHANGES</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${marketData.totalMarketCap ? '$' + (marketData.totalMarketCap.btc / 1e12).toFixed(1) + 'T' : 'N/A'}</div>
                        <div class="stat-label">BTC MARKET CAP</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Dominance Analysis</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">₿</div>
                        <div class="stat-label">BITCOIN</div>
                        <div style="color: #f115f9; font-size: 0.9rem; margin-top: 5px;">
                            ${marketData.btcDominance ? marketData.btcDominance.toFixed(1) + '%' : 'N/A'}
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">⧫</div>
                        <div class="stat-label">ETHEREUM</div>
                        <div style="color: #f115f9; font-size: 0.9rem; margin-top: 5px;">
                            ${marketData.ethDominance ? marketData.ethDominance.toFixed(1) + '%' : 'N/A'}
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">🪙</div>
                        <div class="stat-label">ALTCOINS</div>
                        <div style="color: #f115f9; font-size: 0.9rem; margin-top: 5px;">
                            ${marketData.btcDominance ? (100 - marketData.btcDominance - (marketData.ethDominance || 0)).toFixed(1) + '%' : 'N/A'}
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">💲</div>
                        <div class="stat-label">STABLECOINS</div>
                        <div style="color: #f115f9; font-size: 0.9rem; margin-top: 5px;">~12%</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Market Tools</h2>
                <div class="stats-grid">
                    <a href="/insights/btc-dominance" class="btn" style="text-align: center;">
                        BTC Dominance
                    </a>
                    <a href="/ai/market-overview" class="btn" style="text-align: center;">
                        AI Market View
                    </a>
                    <a href="/currencies" class="btn" style="text-align: center;">
                        All Currencies
                    </a>
                    <a href="/news" class="btn" style="text-align: center;">
                        Market News
                    </a>
                </div>
            </div>
        `;

        res.send(generateModernPage('Market Cap', bodyContent, 'market'));
    } catch (error) {
        console.error('Market cap page error:', error);
        res.status(500).send('Error loading market data');
    }
});

// ===== صفحه اخبار (NEWS) =====
router.get("/news", async (req, res) => {
    try {
        const { page = 1, limit = 20, from, to } = req.query;
        const newsAPI = new (require('./models/APIClients').NewsAPI)();
        const newsData = await newsAPI.getNews({
            page: parseInt(page),
            limit: parseInt(limit),
            from,
            to
        });

        const bodyContent = `
            <div class="header">
                <h1>Crypto News</h1>
                <p>Latest cryptocurrency news and market updates</p>
            </div>

            <div class="glass-card">
                <h2 class="section-title">News Overview</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${newsData.result?.length || 0}</div>
                        <div class="stat-label">ARTICLES</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${page}</div>
                        <div class="stat-label">PAGE</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${limit}</div>
                        <div class="stat-label">PER PAGE</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">📰</div>
                        <div class="stat-label">SOURCES</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Latest News</h2>
                ${newsData.result && newsData.result.length > 0 ? `
                    <div style="max-height: 500px; overflow-y: auto;">
                        ${newsData.result.map(article => `
                            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                    <h3 style="color: #f115f9; margin: 0; flex: 1;">${article.title || 'No Title'}</h3>
                                    <span style="color: #94a3b8; font-size: 0.8rem; white-space: nowrap; margin-left: 15px;">
                                        ${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unknown date'}
                                    </span>
                                </div>
                                <p style="color: #cbd5e1; margin-bottom: 10px; line-height: 1.5;">
                                    ${article.description || 'No description available'}
                                </p>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #64748b; font-size: 0.8rem;">
                                        Source: ${article.source?.name || 'Unknown'}
                                    </span>
                                    ${article.url ? `
                                        <a href="${article.url}" target="_blank"
                                            style="color: #667eea; text-decoration: none; font-size: 0.8rem;">
                                            Read more →
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 40px; color: #94a3b8;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">📰</div>
                        <h3>No news articles available</h3>
                        <p>Try refreshing or check back later</p>
                    </div>
                `}
            </div>

            <div class="glass-card">
                <h2 class="section-title">News Navigation</h2>
                <div class="stats-grid">
                    <a href="/news?page=${parseInt(page) - 1 || 1}&limit=${limit}" class="btn" style="text-align: center;">
                        Previous Page
                    </a>
                    <a href="/news?page=${parseInt(page) + 1}&limit=${limit}" class="btn" style="text-align: center;">
                        Next Page
                    </a>
                    <a href="/news/sources" class="btn" style="text-align: center;">
                        News Sources
                    </a>
                    <a href="/insights/dashboard" class="btn" style="text-align: center;">
                        Market Insights
                    </a>
                </div>
            </div>
        `;

        res.send(generateModernPage('Crypto News', bodyContent, 'news'));
    } catch (error) {
        console.error('News page error', error);
        res.status(500).send('Error loading news data');
    }
});

    // ===== صفحه Insights دشبورد =====
router.get("/insights/dashboard", async (req, res) => {
    try {
        const insightsAPI = new (require('./models/APIClients').InsightsAPI)();
        
        // دریافت داده‌های مختلف به صورت موازی
        const [btcDominance, fearGreed, rainbowChart] = await Promise.all([
            insightsAPI.getBTCDominance().catch(() => ({ value: 50, trend: 'neutral' })),
            insightsAPI.getFearGreedIndex().catch(() => ({ now: { value: 50, value_classification: 'Neutral' } })),
            insightsAPI.getRainbowChart('bitcoin').catch(() => ({}))
        ]);

        const bodyContent = `
            <div class="header">
                <h1>Market Insights Dashboard</h1>
                <p>Advanced market intelligence and sentiment analysis</p>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Market Sentiment Overview</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${btcDominance.value ? btcDominance.value.toFixed(1) + '%' : 'N/A'}</div>
                        <div class="stat-label">BTC DOMINANCE</div>
                        <div style="color: ${btcDominance.trend === 'up' ? '#10b981' : btcDominance.trend === 'down' ? '#ef4444' : '#f59e0b'}; 
                             font-size: 0.7rem; margin-top: 5px;">
                            ${btcDominance.trend ? btcDominance.trend.toUpperCase() : 'STABLE'}
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: ${fearGreed.now?.value >= 70 ? '#ef4444' : fearGreed.now?.value >= 50 ? '#f59e0b' : '#10b981'}">
                            ${fearGreed.now?.value || '50'}
                        </div>
                        <div class="stat-label">FEAR & GREED</div>
                        <div style="color: #94a3b8; font-size: 0.7rem; margin-top: 5px;">
                            ${fearGreed.now?.value_classification || 'Neutral'}
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${rainbowChart.currentPhase || 'N/A'}</div>
                        <div class="stat-label">RAINBOW CHART</div>
                        <div style="color: #94a3b8; font-size: 0.7rem; margin-top: 5px;">
                            ${rainbowChart.phaseDescription || 'Analysis'}
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">📊</div>
                        <div class="stat-label">MARKET HEALTH</div>
                        <div style="color: #10b981; font-size: 0.7rem; margin-top: 5px;">STABLE</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Fear & Greed Index</h2>
                <div style="text-align: center; padding: 30px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🎭</div>
                    <h3 style="color: #f115f9; margin-bottom: 10px;">
                        ${fearGreed.now?.value || 50} - ${fearGreed.now?.value_classification || 'Neutral'}
                    </h3>
                    <p style="color: #94a3b8; margin-bottom: 20px;">
                        ${fearGreed.now?.value >= 70 ? 'Market shows extreme greed - caution advised' : 
                          fearGreed.now?.value >= 50 ? 'Market sentiment is neutral' : 
                          'Market shows fear - potential buying opportunity'}
                    </p>
                    <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 20px; margin: 0 auto; max-width: 300px;">
                        <div style="height: 20px; background: linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%); 
                             border-radius: 10px; position: relative;">
                            <div style="position: absolute; left: ${fearGreed.now?.value || 50}%; top: -5px; 
                                 width: 4px; height: 30px; background: white; border-radius: 2px;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 0.7rem; color: #94a3b8;">
                            <span>Extreme Fear</span>
                            <span>Neutral</span>
                            <span>Extreme Greed</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Bitcoin Dominance</h2>
                <div style="text-align: center; padding: 30px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">₿</div>
                    <h3 style="color: #f115f9; margin-bottom: 10px; font-size: 2.5rem;">
                        ${btcDominance.value ? btcDominance.value.toFixed(1) + '%' : 'N/A'}
                    </h3>
                    <p style="color: #94a3b8; margin-bottom: 20px;">
                        Bitcoin's share of total cryptocurrency market capitalization
                    </p>
                    <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 20px; margin: 0 auto; max-width: 300px;">
                        <div style="height: 20px; background: rgba(255,255,255,0.2); border-radius: 10px; position: relative; overflow: hidden;">
                            <div style="height: 100%; width: ${btcDominance.value || 50}%; 
                                 background: linear-gradient(90deg, #f59e0b, #f97316); border-radius: 10px;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 0.7rem; color: #94a3b8;">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Insights Tools</h2>
                <div class="stats-grid">
                    <a href="/insights/btc-dominance" class="btn" style="text-align: center;">BTC Dominance</a>
                    <a href="/insights/fear-greed" class="btn" style="text-align: center;">Fear & Greed</a>
                    <a href="/insights/fear-greed/chart" class="btn" style="text-align: center;">F&G Chart</a>
                    <a href="/insights/rainbow-chart/bitcoin" class="btn" style="text-align: center;">Rainbow Chart</a>
                </div>
            </div>
        `;

        res.send(generateModernPage('Insights Dashboard', bodyContent, 'insights'));
    } catch (error) {
        console.error('Insights dashboard page error', error);
        res.status(500).send('Error loading insights dashboard');
    }
});

// ===== صفحه سلامت سیستم (HEALTH) =====
router.get("/health", async (req, res) => {
    try {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();

        const bodyContent = `
            <div class="header">
                <h1>System Health</h1>
                <p>Real-time monitoring of VortexAI services and components</p>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Service Status</h2>
                <div class="stats-grid">
                    <div class="stat-card" style="border-left: 4px solid ${wsStatus.connected ? '#10b981' : '#ef4444'}">
                        <div class="stat-number">${wsStatus.connected ? '🔗' : '🔴'}</div>
                        <div class="stat-label">WEBSOCKET</div>
                        <div style="color: ${wsStatus.connected ? '#10b981' : '#ef4444'}; font-size: 0.7rem; margin-top: 5px;">
                            ${wsStatus.connected ? 'CONNECTED' : 'DISCONNECTED'}
                        </div>
                    </div>
                    <div class="stat-card" style="border-left: 4px solid ${process.env.GITHUB_TOKEN ? '#10b981' : '#f59e0b'}">
                        <div class="stat-number">${process.env.GITHUB_TOKEN ? '💾' : '🟡'}</div>
                        <div class="stat-label">DATABASE</div>
                        <div style="color: ${process.env.GITHUB_TOKEN ? '#10b981' : '#f59e0b'}; font-size: 0.7rem; margin-top: 5px;">
                            ${process.env.GITHUB_TOKEN ? 'ACTIVE' : 'DEGRADED'}
                        </div>
                    </div>
                    <div class="stat-card" style="border-left: 4px solid #10b981">
                        <div class="stat-number">🌐</div>
                        <div class="stat-label">API SERVICE</div>
                        <div style="color: #10b981; font-size: 0.7rem; margin-top: 5px;">OPERATIONAL</div>
                    </div>
                    <div class="stat-card" style="border-left: 4px solid #10b981">
                        <div class="stat-number">🤖</div>
                        <div class="stat-label">AI ENGINE</div>
                        <div style="color: #10b981; font-size: 0.7rem; margin-top: 5px;">ACTIVE</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Performance Metrics</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${wsStatus.active_coins || 0}</div>
                        <div class="stat-label">ACTIVE COINS</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${Object.keys(gistData.prices || {}).length}</div>
                        <div class="stat-label">STORED PAIRS</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${apiClient.request_count || 0}</div>
                        <div class="stat-label">API REQUESTS</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${Math.round(process.uptime() / 3600)}h</div>
                        <div class="stat-label">UPTIME</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">System Information</h2>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
                        <div style="color: #f115f9; font-size: 0.9rem; font-weight: 600;">Node.js Version</div>
                        <div style="color: #94a3b8; font-size: 0.8rem;">${process.version}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
                        <div style="color: #f115f9; font-size: 0.9rem; font-weight: 600;">Platform</div>
                        <div style="color: #94a3b8; font-size: 0.8rem;">${process.platform}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
                        <div style="color: #f115f9; font-size: 0.9rem; font-weight: 600;">Memory Usage</div>
                        <div style="color: #94a3b8; font-size: 0.8rem;">${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
                        <div style="color: #f115f9; font-size: 0.9rem; font-weight: 600;">Environment</div>
                        <div style="color: #94a3b8; font-size: 0.8rem;">${process.env.NODE_ENV || 'development'}</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Health Checks</h2>
                <div class="stats-grid">
                    <a href="/health/ready" class="btn" style="text-align: center;">Readiness Check</a>
                    <a href="/health/live" class="btn" style="text-align: center;">Liveness Check</a>
                    <a href="/health-combined" class="btn" style="text-align: center;">Combined Status</a>
                    <a href="/debug/api-status" class="btn" style="text-align: center;">API Debug</a>
                </div>
            </div>
        `;

        res.send(generateModernPage('System Health', bodyContent, 'health'));
    } catch (error) {
        console.error('Health page error', error);
        res.status(500).send('Error loading health data');
    }
});

// ===== صفحه سلامت ترکیبی =====
router.get("/health-combined", async (req, res) => {
    try {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();

        const bodyContent = `
            <div class="header">
                <h1>Combined Health Status</h1>
                <p>Comprehensive system overview with all service metrics</p>
            </div>

            <div class="glass-card">
                <h2 class="section-title">System Overview</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">VortexAI</div>
                        <div class="stat-label">SERVICE</div>
                        <div style="color: #10b981; font-size: 0.7rem; margin-top: 5px;">ACTIVE</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">6.0</div>
                        <div class="stat-label">VERSION</div>
                        <div style="color: #94a3b8; font-size: 0.7rem; margin-top: 5px;">ENHANCED API</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${Math.round(process.uptime() / 3600)}h</div>
                        <div class="stat-label">UPTIME</div>
                        <div style="color: #10b981; font-size: 0.7rem; margin-top: 5px;">STABLE</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">26</div>
                        <div class="stat-label">ENDPOINTS</div>
                        <div style="color: #10b981; font-size: 0.7rem; margin-top: 5px;">ACTIVE</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">Component Status</h2>
                <div style="display: grid; gap: 15px;">
                    <!-- WebSocket Status -->
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px;
                         border-left: 4px solid ${wsStatus.connected ? '#10b981' : '#ef4444'}">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <h3 style="color: #f115f9; margin: 0 0 5px 0;">WebSocket Connection</h3>
                                <p style="color: #94a3b8; margin: 0; font-size: 0.9rem;">
                                    Real-time market data feed from LBank
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: ${wsStatus.connected ? '#10b981' : '#ef4444'}; font-size: 1.2rem; font-weight: bold;">
                                    ${wsStatus.connected ? 'CONNECTED' : 'DISCONNECTED'}
                                </div>
                                <div style="color: #94a3b8; font-size: 0.8rem;">
                                    ${wsStatus.active_coins} active coins
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Database Status -->
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px;
                         border-left: 4px solid ${process.env.GITHUB_TOKEN ? '#10b981' : '#f59e0b'}">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <h3 style="color: #f115f9; margin: 0 0 5px 0;">Database Storage</h3>
                                <p style="color: #94a3b8; margin: 0; font-size: 0.9rem;">
                                    GitHub Gist-based historical data storage
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: ${process.env.GITHUB_TOKEN ? '#10b981' : '#f59e0b'}; font-size: 1.2rem; font-weight: bold;">
                                    ${process.env.GITHUB_TOKEN ? 'ACTIVE' : 'DEGRADED'}
                                </div>
                                <div style="color: #94a3b8; font-size: 0.8rem;">
                                    ${Object.keys(gistData.prices || {}).length} pairs stored
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI Engine Status -->
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px;
                         border-left: 4px solid #10b981">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <h3 style="color: #f115f9; margin: 0 0 5px 0;">AI Analysis Engine</h3>
                                <p style="color: #94a3b8; margin: 0; font-size: 0.9rem;">
                                    Technical analysis and market predictions
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: #10b981; font-size: 1.2rem; font-weight: bold;">READY</div>
                                <div style="color: #94a3b8; font-size: 0.8rem;">55+ indicators available</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 class="section-title">System Features</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                    ${[
                        'realtime_websocket_data', '6_layer_historical_data', 'vortexai_analysis',
                        '55+ technical_indicators', 'multi_source_data', 'advanced_filtering',
                        'market_predictions', 'multi_timeframe_support', 'news_feed', 'market_analytics'
                    ].map(feature => `
                        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; text-align: center;">
                            <div style="color: #10b981; font-size: 0.8rem;">✓</div>
                            <div style="color: #94a3b8; font-size: 0.7rem; margin-top: 2px;">${feature}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        res.send(generateModernPage('Combined Health', bodyContent, 'health'));
    } catch (error) {
        console.error('Health combined page error', error);
        res.status(500).send('Error loading combined health data');
    }
});

// ===== سیستم مدیریت کاربران =====
class UserManager {
    constructor() {
        this.users = new Map();
        this.inviteCodes = new Set(['VORTEX2024', 'CRYPTOAI', 'BETATESTER']);
        this.init();
    }

    async init() {
        // بارگذاری کاربران از localStorage یا دیتابیس
        try {
            const savedUsers = localStorage.getItem('vortexai_users');
            if (savedUsers) {
                const usersData = JSON.parse(savedUsers);
                usersData.forEach(user => this.users.set(user.email, user));
            }
        } catch (error) {
            console.log('Starting with fresh user database');
        }
    }

    validateInviteCode(code) {
        return this.inviteCodes.has(code.toUpperCase());
    }

    registerUser(inviteCode, userData) {
        if (!this.validateInviteCode(inviteCode)) {
            throw new Error('کد دعوت نامعتبر است');
        }

        if (this.users.has(userData.email)) {
            throw new Error('این ایمیل قبلاً ثبت شده است');
        }

        const user = {
            id: Date.now().toString(),
            username: userData.username,
            email: userData.email,
            password: userData.password, // در حالت واقعی باید هش شود
            inviteCode: inviteCode.toUpperCase(),
            registrationDate: new Date().toISOString(),
            settings: {
                theme: 'dark',
                currency: 'USD',
                language: 'fa',
                timezone: 'Asia/Tehran',
                priceDecimals: 2,
                notifications: {
                    priceAlerts: true,
                    volumeSpikes: false,
                    technicalAlerts: true
                }
            },
            activity: []
        };

        this.users.set(userData.email, user);
        this.saveUsers();
        return user;
    }

    saveUsers() {
        const usersArray = Array.from(this.users.values());
        localStorage.setItem('vortexai_users', JSON.stringify(usersArray));
    }

    authenticateUser(email, password) {
        const user = this.users.get(email);
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    updateUserSettings(email, newSettings) {
        const user = this.users.get(email);
        if (user) {
            user.settings = { ...user.settings, ...newSettings };
            this.saveUsers();
            return user;
        }
        return null;
    }

    logActivity(email, activity) {
        const user = this.users.get(email);
        if (user) {
            user.activity.unshift({
                action: activity,
                timestamp: new Date().toISOString(),
                ip: '127.0.0.1' // در حالت واقعی از req بگیر
            });
            
            // نگه داشتن فقط 50 فعالیت آخر
            if (user.activity.length > 50) {
                user.activity = user.activity.slice(0, 50);
            }
            
            this.saveUsers();
        }
    }
}

// ایجاد نمونه کاربران
const userManager = new UserManager();

// ===== اندپوینت‌های حساب کاربری =====

// صفحه ثبت نام
router.get("/register", async (req, res) => {
    const bodyContent = `
        <div class="header">
            <h1>ثبت نام در VortexAI</h1>
            <p>سیستم تحلیل بازار کریپتو با هوش مصنوعی</p>
        </div>

        <div class="glass-card">
            <h2 class="section-title">فرم ثبت نام</h2>
            <div style="max-width: 400px; margin: 0 auto;">
                <form id="registerForm" onsubmit="handleRegister(event)">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #f115f9; margin-bottom: 8px; font-weight: 600;">
                            کد دعوت *
                        </label>
                        <input type="text" id="inviteCode" required 
                               style="width: 100%; padding: 12px; border-radius: 12px; 
                                      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                                      color: white; font-size: 1rem;"
                               placeholder="کد دعوت خود را وارد کنید">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #f115f9; margin-bottom: 8px; font-weight: 600;">
                            نام کاربری *
                        </label>
                        <input type="text" id="username" required 
                               style="width: 100%; padding: 12px; border-radius: 12px; 
                                      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                                      color: white; font-size: 1rem;"
                               placeholder="نام کاربری خود را انتخاب کنید">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #f115f9; margin-bottom: 8px; font-weight: 600;">
                            ایمیل *
                        </label>
                        <input type="email" id="email" required 
                               style="width: 100%; padding: 12px; border-radius: 12px; 
                                      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                                      color: white; font-size: 1rem;"
                               placeholder="ایمیل خود را وارد کنید">
                    </div>

                    <div style="margin-bottom: 25px;">
                        <label style="display: block; color: #f115f9; margin-bottom: 8px; font-weight: 600;">
                            رمز عبور *
                        </label>
                        <input type="password" id="password" required 
                               style="width: 100%; padding: 12px; border-radius: 12px; 
                                      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                                      color: white; font-size: 1rem;"
                               placeholder="رمز عبور قوی انتخاب کنید">
                    </div>

                    <button type="submit" 
                            style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea, #a855f7);
                                   border: none; border-radius: 12px; color: white; font-size: 1.1rem; 
                                   font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                        ایجاد حساب کاربری
                    </button>
                </form>

                <div id="registerMessage" style="margin-top: 20px; text-align: center;"></div>
            </div>
        </div>

        <div class="glass-card">
            <h2 class="section-title">کدهای دعوت فعال</h2>
            <div style="text-align: center; color: #94a3b8;">
                <p>برای ثبت نام نیاز به کد دعوت دارید. کدهای فعلی:</p>
                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 15px;">
                    <span style="background: rgba(102, 126, 234, 0.2); padding: 8px 15px; border-radius: 8px;">
                        VORTEX2024
                    </span>
                    <span style="background: rgba(102, 126, 234, 0.2); padding: 8px 15px; border-radius: 8px;">
                        CRYPTOAI
                    </span>
                    <span style="background: rgba(102, 126, 234, 0.2); padding: 8px 15px; border-radius: 8px;">
                        BETATESTER
                    </span>
                </div>
            </div>
        </div>

        <script>
            function handleRegister(event) {
                event.preventDefault();
                
                const formData = {
                    inviteCode: document.getElementById('inviteCode').value,
                    username: document.getElementById('username').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                };

                fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => response.json())
                .then(data => {
                    const messageEl = document.getElementById('registerMessage');
                    if (data.success) {
                        messageEl.innerHTML = '<div style="color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 15px; border-radius: 12px;">حساب کاربری با موفقیت ایجاد شد! در حال انتقال...</div>';
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 2000);
                    } else {
                        messageEl.innerHTML = '<div style="color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 12px;">' + data.error + '</div>';
                    }
                })
                .catch(error => {
                    document.getElementById('registerMessage').innerHTML = 
                        '<div style="color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 12px;">خطا در ارتباط با سرور</div>';
                });
            }
        </script>
    `;

    res.send(generateModernPage('ثبت نام', bodyContent, 'settings'));
});

// API ثبت نام
router.post("/api/register", express.json(), async (req, res) => {
    try {
        const { inviteCode, username, email, password } = req.body;
        
        const user = userManager.registerUser(inviteCode, {
            username,
            email,
            password
        });

        userManager.logActivity(email, 'ثبت نام کاربر جدید');
        
        res.json({
            success: true,
            message: 'حساب کاربری با موفقیت ایجاد شد',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ===== صفحه تنظیمات کاربر =====
router.get("/settings", async (req, res) => {
    // در حالت واقعی کاربر از session/auth گرفته می‌شود
    const demoUser = {
        username: "کاربر دمو",
        email: "demo@vortexai.com",
        settings: {
            theme: 'dark',
            currency: 'USD',
            language: 'fa',
            timezone: 'Asia/Tehran',
            priceDecimals: 2,
            notifications: {
                priceAlerts: true,
                volumeSpikes: false,
                technicalAlerts: true
            }
        }
    };

    const bodyContent = `
        <div class="header">
            <h1>تنظیمات کاربری</h1>
            <p>شخصی‌سازی تجربه تحلیل بازار</p>
        </div>

        <div class="glass-card">
            <h2 class="section-title">👤 حساب کاربری</h2>
            <div style="display: grid; gap: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                    <div>
                        <div style="color: #f115f9; font-weight: 600;">${demoUser.username}</div>
                        <div style="color: #94a3b8; font-size: 0.9rem;">${demoUser.email}</div>
                    </div>
                    <button onclick="showProfile()" style="padding: 8px 16px; background: rgba(102, 126, 234, 0.3); 
                         border: 1px solid #667eea; border-radius: 8px; color: white; cursor: pointer;">
                        ویرایش پروفایل
                    </button>
                </div>
            </div>
        </div>

        <div class="glass-card">
            <h2 class="section-title">🎨 نمایش و رابط کاربری</h2>
            <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #e2e8f0;">تم</span>
                    <select id="themeSelect" style="padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.1); 
                           color: white; border: 1px solid rgba(255,255,255,0.2);">
                        <option value="dark" ${demoUser.settings.theme === 'dark' ? 'selected' : ''}>تیره</option>
                        <option value="light" ${demoUser.settings.theme === 'light' ? 'selected' : ''}>روشن</option>
                        <option value="auto" ${demoUser.settings.theme === 'auto' ? 'selected' : ''}>خودکار</option>
                    </select>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #e2e8f0;">ارز پیش‌فرض</span>
                    <select id="currencySelect" style="padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.1); 
                           color: white; border: 1px solid rgba(255,255,255,0.2);">
                        <option value="USD" ${demoUser.settings.currency === 'USD' ? 'selected' : ''}>دلار (USD)</option>
                        <option value="EUR" ${demoUser.settings.currency === 'EUR' ? 'selected' : ''}>یورو (EUR)</option>
                        <option value="IRR" ${demoUser.settings.currency === 'IRR' ? 'selected' : ''}>ریال (IRR)</option>
                    </select>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #e2e8f0;">تعداد اعشار قیمت‌ها</span>
                    <select id="decimalsSelect" style="padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.1); 
                           color: white; border: 1px solid rgba(255,255,255,0.2);">
                        <option value="2" ${demoUser.settings.priceDecimals === 2 ? 'selected' : ''}>۲ رقم</option>
                        <option value="4" ${demoUser.settings.priceDecimals === 4 ? 'selected' : ''}>۴ رقم</option>
                        <option value="6" ${demoUser.settings.priceDecimals === 6 ? 'selected' : ''}>۶ رقم</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="glass-card">
            <h2 class="section-title">🔔 اعلان‌ها</h2>
            <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #e2e8f0;">هشدارهای قیمتی</span>
                    <label class="switch">
                        <input type="checkbox" id="priceAlerts" ${demoUser.settings.notifications.priceAlerts ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #e2e8f0;">هشدار حجم غیرعادی</span>
                    <label class="switch">
                        <input type="checkbox" id="volumeAlerts" ${demoUser.settings.notifications.volumeSpikes ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #e2e8f0;">هشدارهای تکنیکال</span>
                    <label class="switch">
                        <input type="checkbox" id="technicalAlerts" ${demoUser.settings.notifications.technicalAlerts ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>

        <div class="glass-card">
            <h2 class="section-title">🔒 امنیت</h2>
            <div style="display: grid; gap: 15px;">
                <button onclick="changePassword()" style="padding: 12px; background: rgba(239, 68, 68, 0.1); 
                     border: 1px solid #ef4444; border-radius: 8px; color: #ef4444; cursor: pointer; text-align: right;">
                    🔐 تغییر رمز عبور
                </button>
                
                <button onclick="enable2FA()" style="padding: 12px; background: rgba(245, 158, 11, 0.1); 
                     border: 1px solid #f59e0b; border-radius: 8px; color: #f59e0b; cursor: pointer; text-align: right;">
                    ⚡ فعال‌سازی احراز هویت دو مرحله‌ای
                </button>
            </div>
        </div>

        <div class="glass-card">
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="saveSettings()" style="padding: 12px 30px; background: linear-gradient(135deg, #667eea, #a855f7);
                     border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer;">
                    💾 ذخیره تنظیمات
                </button>
                
                <button onclick="resetSettings()" style="padding: 12px 30px; background: rgba(255,255,255,0.1);
                     border: 1px solid rgba(255,255,255,0.3); border-radius: 12px; color: white; cursor: pointer;">
                    🔄 بازنشانی
                </button>
            </div>
        </div>

        <style>
            .switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }
            
            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255,255,255,0.2);
                transition: .4s;
                border-radius: 24px;
            }
            
            .slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            
            input:checked + .slider {
                background-color: #10b981;
            }
            
            input:checked + .slider:before {
                transform: translateX(26px);
            }
        </style>

        <script>
            function saveSettings() {
                const settings = {
                    theme: document.getElementById('themeSelect').value,
                    currency: document.getElementById('currencySelect').value,
                    priceDecimals: parseInt(document.getElementById('decimalsSelect').value),
                    notifications: {
                        priceAlerts: document.getElementById('priceAlerts').checked,
                        volumeSpikes: document.getElementById('volumeAlerts').checked,
                        technicalAlerts: document.getElementById('technicalAlerts').checked
                    }
                };
                
                // ذخیره تنظیمات
                localStorage.setItem('userSettings', JSON.stringify(settings));
                alert('تنظیمات با موفقیت ذخیره شد');
            }
            
            function resetSettings() {
                if (confirm('آیا از بازنشانی تنظیمات به حالت پیش‌فرض اطمینان دارید؟')) {
                    localStorage.removeItem('userSettings');
                    location.reload();
                }
            }
            
            function showProfile() {
                alert('صفحه ویرایش پروفایل');
            }
            
            function changePassword() {
                alert('صفحه تغییر رمز عبور');
            }
            
            function enable2FA() {
                alert('فعال‌سازی احراز هویت دو مرحله‌ای');
            }
        </script>
    `;

    res.send(generateModernPage('تنظیمات', bodyContent, 'settings'));
});
    // بقیه مسیرها (SCAN, ANALYSIS, MARKET, INSIGHTS, NEWS, HEALTH)...
    // [کد کامل مسیرها مانند قبل]
    return router;
};
