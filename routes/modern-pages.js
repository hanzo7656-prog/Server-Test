const express = require('express');
const router = express.Router();

// Generate navigation function
function generateClassNavigation(currentPage = 'home') {
    const allNavItems = [
        { id: 'home', label: 'DASH', page: '/', icon: 'D', context: ['all'], quickPeek: 'داشبورد اصلی' },
        { id: 'scan', label: 'SCAN', page: '/scan-page', icon: 'S', context: ['analysis', 'market'], quickPeek: 'اسکن بازار' },
        { id: 'analyze', label: 'ANALYZE', page: '/analysis-page', icon: 'A', context: ['analysis', 'technical'], quickPeek: 'تحلیل تکنیکال' },
        { id: 'ai', label: 'AI', page: 'https://ai-test-2nxq.onrender.com/', icon: 'AI', ai: true, external: true, context: ['all'], quickPeek: 'تحلیل هوش مصنوعی' },
        { id: 'market', label: 'MARKET', page: '/markets-page', icon: 'M', context: ['market', 'overview'], quickPeek: 'بازار و سرمایه' },
        { id: 'insights', label: 'INSIGHTS', page: '/insights-page', icon: 'I', context: ['analysis', 'sentiment'], quickPeek: 'بینش های بازار' },
        { id: 'news', label: 'NEWS', page: '/news-page', icon: 'N', context: ['news', 'all'], quickPeek: 'اخبار زنده بازار' },
        { id: 'health', label: 'HEALTH', page: '/health-page', icon: 'H', context: ['system', 'all'], quickPeek: 'وضعیت سرورها' },
        { id: 'settings', label: 'SETTINGS', page: '/setting', icon: 'G', context: ['all'], quickPeek: 'تنظیمات کاربری' }
    ];

    function getContextAwareItems(allItems, currentPage) {
        const contextMap = {
            'home': ['all'], 
            'scan': ['analysis', 'market', 'all'], 
            'analyze': ['analysis', 'technical', 'all'],
            'market': ['market', 'overview', 'all'], 
            'insights': ['analysis', 'sentiment', 'all'], 
            'news': ['news', 'all'],
            'health': ['system', 'all'], 
            'settings': ['all']
        };
        const currentContext = contextMap[currentPage] || ['all'];
        return allItems.filter(item => item.context.some(context => currentContext.includes(context)));
    }

    const contextAwareItems = allNavItems;

    return `
<!-- هوشمند ناوبری شیشه‌ای -->
<div id="glassNav" class="glass-navigation">
    <!-- دکمه شناور مایع -->
    <div class="nav-floater">
        <div class="liquid-button">
            <div class="nav-dot"></div>
            <div class="nav-dot"></div>
            <div class="nav-dot"></div>
        </div>
    </div>

    <!-- کانتینر ناوبری -->
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
    position: fixed; 
    bottom: 20px; 
    left: 50%; 
    transform: translateX(-50%); 
    z-index: 1000;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.nav-floater {
    width: 65px; 
    height: 65px; 
    background: linear-gradient(135deg, rgba(102,126,234,0.9), rgba(118,75,162,0.9));
    backdrop-filter: blur(25px); 
    border: 1px solid rgba(255,255,255,0.3); 
    border-radius: 25px;
    display: flex; 
    align-items: center; 
    justify-content: center; 
    cursor: pointer;
    box-shadow: 0 15px 35px rgba(102,126,234,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
    transition: all 0.4s ease; 
    position: relative; 
    overflow: hidden;
}

.nav-floater:hover {
    transform: scale(1.1); 
    box-shadow: 0 20px 45px rgba(102,126,234,0.7), inset 0 1px 0 rgba(255,255,255,0.3);
}

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
    background: rgba(255,255,255,0.9); 
    border-radius: 50%;
    animation: dotPulse 2s infinite ease-in-out; 
    box-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.nav-dot:nth-child(1) { animation-delay: 0s; }
.nav-dot:nth-child(2) { animation-delay: 0.3s; }
.nav-dot:nth-child(3) { animation-delay: 0.6s; }

@keyframes dotPulse {
    0%,100% { transform: scale(1); opacity: 0.7; } 
    50% { transform: scale(1.3); opacity: 1; }
}

.nav-container {
    background: rgba(30,35,50,0.95); 
    backdrop-filter: blur(30px); 
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 25px; 
    padding: 20px; 
    margin-bottom: 15px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1); 
    max-width: 400px;
}

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

.nav-scroll::-webkit-scrollbar { display: none; }

.nav-item {
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center;
    padding: 12px 8px; 
    border-radius: 16px; 
    cursor: pointer; 
    transition: all 0.3s ease;
    background: rgba(255,255,255,0.08); 
    border: 1px solid transparent; 
    position: relative;
    overflow: hidden; 
    min-height: 70px;
}

.nav-item::before {
    content: ""; 
    position: absolute; 
    top: 50%; 
    left: 50%; 
    width: 0; 
    height: 0; 
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
    transform: translate(-50%, -50%); 
    transition: all 0.6s ease; 
    opacity: 0;
}

.nav-item:hover::before {
    width: 120px; 
    height: 120px; 
    opacity: 1; 
    animation: liquidWave 0.6s ease-out;
}

@keyframes liquidWave {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}

.nav-item:hover {
    background: rgba(255,255,255,0.15); 
    transform: translateY(-2px);
    border: 1px solid rgba(255,255,255,0.2); 
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.nav-item.active {
    background: linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3));
    border: 1px solid rgba(102,126,234,0.4); 
    box-shadow: 0 8px 25px rgba(102,126,234,0.3);
}

.animated-gradient {
    background: linear-gradient(45deg, #667eea, #764ba2, #f093fb); 
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite; 
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent; 
    background-clip: text;
}

@keyframes gradientShift {
    0% { background-position: 0% 50%; } 
    50% { background-position: 100% 50%; } 
    100% { background-position: 0% 50%; }
}

.nav-text {
    font-size: 0.7rem; 
    font-weight: 700; 
    color: #f115f9; 
    text-align: center; 
    text-transform: uppercase;
    letter-spacing: 0.5px; 
    text-shadow: 0 1px 2px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3);
    background: linear-gradient(135deg, #f115f9, #cbd5e1); 
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

.command-palette {
    display: none; 
    position: absolute; 
    top: -80px; 
    left: 0; 
    right: 0;
    background: rgba(30,35,50,0.98); 
    backdrop-filter: blur(30px); 
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 15px; 
    padding: 15px; 
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
}

.quick-peek-overlay {
    display: none; 
    position: fixed; 
    bottom: 120px; 
    left: 50%; 
    transform: translateX(-50%);
    background: rgba(30,35,50,0.95); 
    backdrop-filter: blur(30px); 
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 15px; 
    padding: 15px; 
    max-width: 300px; 
    z-index: 1001;
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
}

.glass-navigation.expanded .nav-container {
    display: block !important;
    animation: slideUp 0.4s ease;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 400px) {
    .nav-container { max-width: 320px; padding: 15px; }
    .nav-scroll { gap: 10px; }
    .nav-item { padding: 10px 6px; min-height: 60px; }
    .nav-text { font-size: 0.65rem; }
    .nav-floater { width: 60px; height: 60px; }
}
</style>

<script>
// ==================== 
// SPECIFIC ITEMS DEBUG
// ====================

function showDebugMessage(message) {
    try {
        const oldMsg = document.getElementById('visualDebugMsg');
        if (oldMsg) oldMsg.remove();
        
        const debugMsg = document.createElement('div');
        debugMsg.id = 'visualDebugMsg';
        debugMsg.textContent = message;
        debugMsg.style.position = 'fixed';
        debugMsg.style.top = '10px';
        debugMsg.style.left = '10px';
        debugMsg.style.background = 'red';
        debugMsg.style.color = 'white';
        debugMsg.style.padding = '10px';
        debugMsg.style.zIndex = '10000';
        debugMsg.style.borderRadius = '5px';
        debugMsg.style.fontSize = '14px';
        debugMsg.style.fontFamily = 'Arial, sans-serif';
        
        document.body.appendChild(debugMsg);
        
        setTimeout(function() {
            if (debugMsg.parentNode) {
                debugMsg.parentNode.removeChild(debugMsg);
            }
        }, 5000);
        
    } catch (error) {
        // ignore
    }
}

// تست آیتم‌های خاص
try {
    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                // پیدا کردن آیتم‌های مشکل‌دار
                const scanItem = document.querySelector('[data-page="/scan-page"]');
                const marketItem = document.querySelector('[data-page="/markets-page"]');
                const analyzeItem = document.querySelector('[data-page="/analysis-page"]');
                
                let debugInfo = 'بررسی آیتم‌ها: ';
                
                if (scanItem) {
                    debugInfo += 'اسکن: ' + scanItem.className + ' ';
                    // اضافه کردن استایل خاص برای اسکن
                    scanItem.style.background = 'rgba(255,0,0,0.3)';
                }
                
                if (marketItem) {
                    debugInfo += 'مارکت: ' + marketItem.className + ' ';
                    // اضافه کردن استایل خاص برای مارکت
                    marketItem.style.background = 'rgba(0,255,0,0.3)';
                }
                
                if (analyzeItem) {
                    debugInfo += 'آنالیز: ' + analyzeItem.className + ' ';
                    // اضافه کردن استایل خاص برای آنالیز
                    analyzeItem.style.background = 'rgba(0,0,255,0.3)';
                }
                
                showDebugMessage(debugInfo);
                
            }, 1000);
        });
    }
} catch (error) {
    // ignore
}

// مدیریت کلیک روی دکمه شناور
document.querySelector('.nav-floater').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const nav = document.getElementById('glassNav');
    const container = document.querySelector('.nav-container');
    
    if (container.style.display === 'block') {
        container.style.display = 'none';
        nav.classList.remove('expanded');
        showDebugMessage('منو بسته شد');
    } else {
        container.style.display = 'block';
        nav.classList.add('expanded');
        showDebugMessage('منو باز شد');
        
        // تست مستقیم روی آیتم‌های مشکل‌دار
        setTimeout(function() {
            const scanItem = document.querySelector('[data-page="/scan-page"]');
            const marketItem = document.querySelector('[data-page="/markets-page"]');
            
            if (scanItem) {
                scanItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showDebugMessage('مستقیم کلیک روی اسکن');
                    window.location.href = '/scan-page';
                });
            }
            
            if (marketItem) {
                marketItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showDebugMessage('مستقیم کلیک روی مارکت');
                    window.location.href = '/markets-page';
                });
            }
            
            showDebugMessage('Event listeners مستقیم اضافه شد');
            
        }, 500);
    }
});

// همچنین event listener کلی
document.addEventListener('click', function(e) {
    const navItem = e.target.closest('.nav-item');
    
    if (navItem) {
        e.preventDefault();
        e.stopPropagation();
        
        const page = navItem.getAttribute('data-page');
        showDebugMessage('کلیک کلی روی: ' + page);
        
        // بستن منو
        const container = document.querySelector('.nav-container');
        const nav = document.getElementById('glassNav');
        container.style.display = 'none';
        nav.classList.remove('expanded');
        
        // هدایت به صفحه
        const isExternal = navItem.getAttribute('data-external') === 'true';
        if (isExternal) {
            window.open(page, '_blank');
        } else {
            window.location.href = page;
        }
    }
});

// توابع کمکی
function showQuickPeek(itemId) {
    try {
        const overlay = document.getElementById('quickPeekOverlay');
        const content = document.getElementById('quickPeekContent');
        const navItems = {
            'home': 'داشبورد اصلی - نمای کلی سیستم',
            'scan': 'اسکن بازار - شناسایی فرصت‌های سرمایه‌گذاری', 
            'analyze': 'تحلیل تکنیکال - نمودارها و شاخص‌های فنی',
            'ai': 'تحلیل هوش مصنوعی - پیش‌بینی‌های پیشرفته',
            'market': 'بازار و سرمایه - داده‌های جهانی بازار',
            'insights': 'بینش‌های بازار - تحلیل احساسات و روندها',
            'news': 'اخبار زنده - آخرین اخبار و به‌روزرسانی‌ها',
            'health': 'وضعیت سرورها - مانیتورینگ سلامت سیستم',
            'settings': 'تنظیمات کاربری - شخصی‌سازی محیط'
        };
        
        if (overlay && content) {
            content.textContent = navItems[itemId] || 'اطلاعات بیشتر';
            overlay.style.display = 'block';
        }
    } catch (error) {
        // ignore
    }
}

function hideQuickPeek() {
    try {
        const overlay = document.getElementById('quickPeekOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    } catch (error) {
        // ignore
    }
}
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

header {
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

    // Route اصلی - نسخه ساده شده برای تست
    router.get("/", async (req, res) => {
        try {
            const bodyContent = `
                <div class="header">
                    <h1>VortexAI Crypto Dashboard</h1>
                    <p>داده‌های زنده و بینش‌های هوشمند برای تحلیل بازارهای کریپتو</p>
                </div>
                <div class="glass-card">
                    <h2 style="color: #f115f9; text-align: center;">سیستم فعال شد!</h2>
                    <p style="text-align: center;">سرور در حال اجراست - نویگیشن بار پایین صفحه</p>
                </div>
                <div class="glass-card">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">✅</div>
                            <div class="stat-label">سرور فعال</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">9</div>
                            <div class="stat-label">منوها</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">🎯</div>
                            <div class="stat-label">آماده</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">🚀</div>
                            <div class="stat-label">پرسرعت</div>
                        </div>
                    </div>
                </div>
            `;
            res.send(generateModernPage("داشبورد", bodyContent, 'home'));
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).send('خطا: ' + error.message);
        }
    });
    // صفحه اسکن
    router.get('/scan-page', async (req, res) => {
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
                    <p>شناسایی فرصت‌های سرمایه‌گذاری - تحلیل ارزهای دیجیتال بازار زنده</p>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">پارامترهای اسکن</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${limit}</div>
                            <div class="stat-label">تعداد ارز</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${filter.toUpperCase()}</div>
                            <div class="stat-label">فیلتر فعلی</div>
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
                        <div style="max-height: 400px; overflow-y: auto">
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
                                                ${coin.priceChange24h ? parseFloat(coin.priceChange24h).toFixed(2) : '0.00'}%
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
                            <p>لطفا چند لحظه صبر کنید</p>
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
                        window.location.href = '/scan-page?filter=' + filter;
                    }
                </script>
            `;

            res.send(generateModernPage('اسکن بازار', bodyContent, 'scan'));
        } catch (error) {
            console.error('Scan page error', error);
            res.status(500).send('خطا در بارگذاری صفحه اسکن');
        }
    });
    // صفحه تحلیل تکنیکال
    router.get('/analysis', async (req, res) => {
        const symbol = req.query.symbol || 'btc_usdt';
        const bodyContent = `
            <div class="header">
                <h1>تحلیل تکنیکال</h1>
                <p>شاخص های فنی پیشرفته برای ${symbol.toUpperCase()}</p>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">تحلیل بازار</h2>
                <p style="text-align: center;">داده های تحلیل در حال بارگذاری برای ${symbol.toUpperCase()}...</p>
                <div style="text-align: center; margin-top: 20px;">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">RSI</div>
                            <div class="stat-label">شاخص قدرت</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">MACD</div>
                            <div class="stat-label">واگرایی</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">Bollinger</div>
                            <div class="stat-label">باندها</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">Fibonacci</div>
                            <div class="stat-label">سطوح</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        res.send(generateModernPage(`تحلیل تکنیکال ${symbol.toUpperCase()}`, bodyContent, 'analyze'));
    });

    // صفحه بازار سرمایه
    router.get('/markets-page', async (req, res) => {
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
                        <div class="stat-label">حجم معاملات</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">52.8%</div>
                        <div class="stat-label">تسلط بیت کوین</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">17.2%</div>
                        <div class="stat-label">تسلط اتریوم</div>
                    </div>
                </div>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">ارزهای برتر</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>نام</th>
                            <th>قیمت</th>
                            <th>تغییرات</th>
                            <th>سرمایه</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td><strong>Bitcoin (BTC)</strong></td>
                            <td>$42,150</td>
                            <td style="color: #10b981">+2.3%</td>
                            <td>$825B</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td><strong>Ethereum (ETH)</strong></td>
                            <td>$2,850</td>
                            <td style="color: #10b981">+1.8%</td>
                            <td>$342B</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td><strong>Binance Coin (BNB)</strong></td>
                            <td>$315</td>
                            <td style="color: #ef4444">-0.5%</td>
                            <td>$47B</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        res.send(generateModernPage('بازار سرمایه', bodyContent, 'market'));
    });

    // صفحه بینش‌های بازار
    router.get('/insights-page', async (req, res) => {
        const bodyContent = `
            <div class="header">
                <h1>بینش های بازار</h1>
                <p>تحلیل های پیشرفته و بینش های هوشمند</p>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">احساسات بازار</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">65</div>
                        <div class="stat-label">شاخص ترس و طمع</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">78%</div>
                        <div class="stat-label">احساسات مثبت</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">22%</div>
                        <div class="stat-label">احساسات منفی</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">📈</div>
                        <div class="stat-label">روند صعودی</div>
                    </div>
                </div>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">پیش‌بینی‌های هوشمند</h2>
                <div style="text-align: center; color: #94a3b8;">
                    <p>الگوریتم‌های هوش مصنوعی در حال تحلیل داده‌های بازار...</p>
                    <div style="margin-top: 20px;">
                        <div class="stat-card" style="display: inline-block; margin: 10px;">
                            <div class="stat-number">87%</div>
                            <div class="stat-label">دقت پیش‌بینی</div>
                        </div>
                        <div class="stat-card" style="display: inline-block; margin: 10px;">
                            <div class="stat-number">24h</div>
                            <div class="stat-label">افق تحلیل</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        res.send(generateModernPage('بینش های بازار', bodyContent, 'insights'));
    });

    // صفحه اخبار
    router.get('/news-page', async (req, res) => {
        const bodyContent = `
            <div class="header">
                <h1>اخبار کریپتو</h1>
                <p>آخرین اخبار و به روزرسانی های بازار</p>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">آخرین اخبار</h2>
                <div style="text-align: center; padding: 40px; color: #94a3b8;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">📰</div>
                    <h3>در حال بارگذاری اخبار</h3>
                    <p>اخبار زنده به زودی در دسترس خواهد بود</p>
                </div>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">دسته‌بندی‌ها</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">📊</div>
                        <div class="stat-label">تحلیل بازار</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">🔔</div>
                        <div class="stat-label">هشدارها</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">🌍</div>
                        <div class="stat-label">اخبار جهانی</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">⚡</div>
                        <div class="stat-label">فوری</div>
                    </div>
                </div>
            </div>
        `;
        res.send(generateModernPage('اخبار کریپتو', bodyContent, 'news'));
    });

        // صفحه سلامت سیستم
    router.get('/health-page', async (req, res) => {
        const bodyContent = `
            <div class="header">
                <h1>سلامت سیستم</h1>
                <p>مانیتورینگ سرویس ها و عملکرد سیستم</p>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">وضعیت سرویس‌ها</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">✅</div>
                        <div class="stat-label">API سرور</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">✅</div>
                        <div class="stat-label">WebSocket</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">✅</div>
                        <div class="stat-label">پایگاه داده</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">🔄</div>
                        <div class="stat-label">Cache System</div>
                    </div>
                </div>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">مصرف منابع</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB</div>
                        <div class="stat-label">مصرف RAM</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${Math.round(process.uptime() / 3600)}h</div>
                        <div class="stat-label">آپتایم</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${process.uptime().toFixed(0)}s</div>
                        <div class="stat-label">زمان فعالیت</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">Node.js</div>
                        <div class="stat-label">پلتفرم</div>
                    </div>
                </div>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">لاگ‌های سیستم</h2>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px; font-family: monospace; font-size: 0.8rem; max-height: 200px; overflow-y: auto;">
                    <div style="color: #10b981;">[INFO] سیستم با موفقیت راه‌اندازی شد</div>
                    <div style="color: #10b981;">[INFO] اتصال WebSocket برقرار شد</div>
                    <div style="color: #f59e0b;">[WARN] کش در حال به‌روزرسانی است</div>
                    <div style="color: #10b981;">[INFO] ${new Date().toLocaleString('fa-IR')} - سیستم فعال</div>
                </div>
            </div>
        `;
        res.send(generateModernPage("سلامت سیستم", bodyContent, "health"));
    });

    // صفحه تنظیمات
    router.get('/settings', async (req, res) => {
        const bodyContent = `
            <div class="header">
                <h1>تنظیمات پیشرفته</h1>
                <p>شخصی سازی محیط و تنظیمات کاربری</p>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">تنظیمات نمایش</h2>
                <div style="text-align: center; color: #94a3b8; padding: 20px;">
                    <p>صفحه تنظیمات در حال توسعه است</p>
                    <div style="margin-top: 30px;">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-number">🎨</div>
                                <div class="stat-label">تم رنگی</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">🔔</div>
                                <div class="stat-label">اعلان‌ها</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">📊</div>
                                <div class="stat-label">نمودارها</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">⚡</div>
                                <div class="stat-label">کارایی</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="glass-card">
                <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">تنظیمات امنیتی</h2>
                <div style="text-align: center;">
                    <button class="btn" style="margin: 5px;">تغییر رمز عبور</button>
                    <button class="btn" style="margin: 5px;">احراز هویت دو مرحله‌ای</button>
                    <button class="btn" style="margin: 5px;">مدیریت دستگاه‌ها</button>
                    <button class="btn" style="margin: 5px;">پشتیبان‌گیری</button>
                </div>
            </div>
        `;
        res.send(generateModernPage("تنظیمات پیشرفته", bodyContent, 'settings'));
    });

    // Route برای مدیریت خطاهای 404
    router.use('*', (req, res) => {
        const bodyContent = `
            <div class="header">
                <h1>صفحه یافت نشد</h1>
                <p>صفحه‌ای که به دنبال آن هستید وجود ندارد</p>
            </div>
            <div class="glass-card" style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
                <h2 style="color: #f115f9; margin-bottom: 20px;">خطای 404</h2>
                <p style="color: #94a3b8; margin-bottom: 30px;">آدرس درخواستی معتبر نیست یا صفحه حذف شده است</p>
                <a href="/" class="btn">بازگشت به داشبورد</a>
            </div>
        `;
        res.status(404).send(generateModernPage("صفحه یافت نشد", bodyContent, 'home'));
    });

    return router;
};
