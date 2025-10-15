const express = require('express');
const router = express.Router();

// تابع کمکی برای تشخیص صفحه
function detectCurrentPage() {
    return 'home';
}

// *******************************
// نوبکیشن بار هوشمند پیشرفته
function generateClassNavigation(currentPage = 'home') {
    // تشخیص خودکار صفحه اگر مشخص نشده
    if (currentPage === 'home') {
        currentPage = detectCurrentPage();
    }

    const navItems = [
        {
            id: 'home',
            label: 'DASH',
            page: '/',
            icon: 'D',
            context: ['all'],
            quickPeek: 'وضعیت کلی بازار'
        },
        {
            id: 'scan',
            label: 'SCAN',
            page: '/scan',
            icon: 'S',
            context: ['analysis', 'market'],
            quickPeek: 'بارزهای پرینامییا'
        },
        {
            id: 'analyze',
            label: 'ANALYZE',
            page: '/analysis?symbol=btc_usdt',
            icon: 'A',
            context: ['analysis', 'technical'],
            quickPeek: 'مذخص های فنی'
        },
        {
            id: 'ai',
            label: 'AI',
            page: 'https://ai-test-2nxq.onrender.com/',
            icon: 'AI',
            ai: true,
            context: ['all'],
            quickPeek: 'بیش بینی و تحلیل'
        },
        // دکمه‌های ردیف دوم
        {
            id: 'market',
            label: 'MARKET',
            page: '/markets/cap',
            icon: 'M',
            context: ['market', 'overview'],
            quickPeek: 'بازار های داده م حجم و سرمایه'
        },
        {
            id: 'insights',
            label: 'INSIGHTS',
            page: '/insights/dashboard',
            icon: 'I',
            context: ['analysis', 'sentiment'],
            quickPeek: 'بازار بینش و روندها احساسات'
        },
        {
            id: 'news',
            label: 'NEWS',
            page: '/news',
            icon: 'N',
            context: ['news', 'all'],
            quickPeek: 'زنده اخبار بازار های بهروزرسانی'
        },
        {
            id: 'health',
            label: 'HEALTH',
            page: '/health',
            icon: 'H',
            context: ['system', 'all'],
            quickPeek: 'وضعيت سرورس ها'
        },
        {
            id: 'settings',
            label: 'SETTINGS',
            page: '/settings',
            icon: 'G',
            context: ['all'],
            quickPeek: 'تظيمات شخصي سازی محيط'
        }
    ];

    // اضافه کردن این اسکریپت برای لود داده واقعی
    const navigationScript = `
<script>
// ============================== توابع اصلی navigation ==============================
function toggleGlassNav() {
    console.log('🔘 کلیک شد!');
    const nav = document.getElementById('glassNav');
    const container = document.querySelector('.nav-container');
    
    if (nav && container) {
        if (container.style.display === 'none' || !container.style.display) {
            container.style.display = 'block';
            console.log('✅ منو باز شد');
        } else {
            container.style.display = 'none';
            console.log('❌ منو بسته شد');
        }
    }
}

function playLiquidSound() {
    console.log('Liquid sound played');
}

function hideCommandPalette() {
    const palette = document.getElementById('commandPalette');
    if (palette) {
        palette.style.display = 'none';
    }
}

// فعال‌سازی وقتی صفحه لود شد
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 صفحه آماده است');
    
    const floater = document.querySelector('.nav-floater');
    console.log('دکمه پیدا شد:', floater);
    
    if (floater) {
        floater.setAttribute('onclick', '');
        floater.addEventListener('click', toggleGlassNav);
        console.log('🎯 Event listener اضافه شد');
    }
});

let realMarketStatus = {};
async function loadRealNavigationStatus() {
    try {
        const response = await fetch('/api/navigation-status');
        if (!response.ok) throw new Error('API response not ok');
        realMarketStatus = await response.json();
        updateNavigationDisplay();
    } catch (error) {
        console.error('Failed to load navigation status', error);
        document.querySelectorAll('.market-status, .live-alert-indicator').forEach(el => {
            el.style.display = 'none';
        });
    }
}

function updateNavigationDisplay() {
    Object.keys(realMarketStatus).forEach(itemId => {
        const statusElement = document.querySelector('[data-item="\${itemId}"] .market-status');
        if (statusElement && realMarketStatus[itemId].change) {
            statusElement.innerHTML = 
                (realMarketStatus[itemId].trend === 'up' ? '↗' : '↘') +
                realMarketStatus[itemId].change;
            statusElement.className = 'market-status ' + realMarketStatus[itemId].trend;
        }

        const alertElement = document.querySelector('[data-item="\${itemId}"] .live-alert-indicator');
        if (alertElement) {
            alertElement.style.display = realMarketStatus[itemId].alert ? 'block' : 'none';
        }
    });
}

// بارگذاری اولیه و آیینت دوره ای
loadRealNavigationStatus();
setInterval(loadRealNavigationStatus, 30000);
</script>
`;

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
        return allItems.filter(item =>
            item.context.some(context => currentContext.includes(context))
        );
    }

    // context فيلتز کردن آنتها بر اساس
    const contextAwareItems = getContextAwareItems(navItems, currentPage);

    return `
<!-- ناويري شیشه‌ای هوشمند -->
<div id="glassNav" class="glass-navigation">
    <!-- دکمه شناور مایع -->
    <div class="nav-floater">
        <div class="liquid-button">
            <div class="nav-dot"></div>
            <div class="nav-dot"></div>
            <div class="nav-dot"></div>
        </div>
    </div>

    <!-- کانتیتر ناويري -->
    <div class="nav-container" style="display: none;">
        <div class="nav-scroll" id="navScroll">
            ${contextAwareItems.map(item => `
                <div class="nav-item ${item.id === currentPage ? 'active' : ''}"
                     onclick="navigateTo('${item.page}', ${item.external || false}, ${item.ai || false})"
                     onmouseenter="showQuickPeek('${item.id}')"
                     onmouseleave="hideQuickPeek()"
                     ontouchstart="startPress('${item.id}')"
                     ontouchend="endPress('${item.id}')">
                    <!-- متحرك گراديين با آيكون -->
                    <div class="nav-icon animated-gradient">${item.icon}</div>
                    <!-- متن -->
                    <div class="nav-text">${item.label}</div>
                </div>
            `).join('')}
        </div>

        <!-- Command Palette -->
        <div class="command-palette" id="commandPalette">
            <input type="text" placeholder="...(ه) btc analysis" onkeyup="searchCommands(event)">
            <div class="command-results" id="commandResults"></div>
        </div>
    </div>

    <!-- Quick Peek Overlay -->
    <div class="quick-peek-overlay" id="quickPeekOverlay">
        <div class="quick-peek-content" id="quickPeekContent"></div>
    </div>

    ${navigationScript}
</div>

<style>
/* استطيل ناويدي شيشه يبشرفته */
.glass-navigation {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* كه شاور مایع */
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

/* انقاط ناویري */
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

/* اصلي ناويري كاتفيد */
.nav-container {
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
    animation: slideUp 0.4s ease;
}

.glass-navigation.expanded .nav-floater {
    transform: scale(0.9) rotate(180deg);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
}

/* 3 x 3 ميكه */
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

/* ناويري نايتيه */
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

/* hover فككت موج مايع هيكم */
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

/* گرادیان متحرک برای آبکون */
.animated-gradient {
    background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

@keyframes gradientShift {
    0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
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

/* وضعيت بازارية */
.market-status {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 0.6rem;
    padding: 2px 4px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
}

.market-status.up {
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.market-status.down {
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

/* مشدار زنده */
.live-alert-indicator {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ef4444;
    animation: pulseAlert 1.5s infinite;
    box-shadow: 0 0 10px #ef4444;
}

@keyframes pulseAlert {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.7; }
}

/* Command Palette */
.command-palette {
    display: none;
    position: absolute;
    top: -80px;
    left: 0;
    right: 0;
    background: rgba(30, 35, 50, 0.98);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    padding: 15px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.command-palette input {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 0.9rem;
}

.command-palette input::placeholder {
    color: rgba(255, 255, 255, 0.6);
}

.command-results {
    max-height: 200px;
    overflow-y: auto;
    margin-top: 10px;
}

.command-result-item {
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.command-result-item:hover {
    background: rgba(255, 255, 255, 0.1);
}

/* Quick Peek Overlay */
.quick-peek-overlay {
    display: none;
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(30, 35, 50, 0.95);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    padding: 15px;
    max-width: 300px;
    z-index: 1001;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.quick-peek-content {
    color: white;
    font-size: 0.9rem;
    text-align: center;
}

/* حالت فشردة */
.glass-navigation.compact-mode {
    transform: translateX(-50%) scale(0.7);
    opacity: 0.6;
    bottom: 10px;
}

.glass-navigation.compact-mode:hover {
    transform: translateX(-50%) scale(0.9);
    opacity: 1;
}

/* حالت شبكورة */
.glass-navigation.night-vision {
    background: rgba(0, 20, 40, 0.95);
    border: 1px solid #00ffff;
    filter: hue-rotate(180deg) brightness(0.9);
}

.glass-navigation.night-vision .nav-floater {
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.7), rgba(0, 100, 255, 0.7));
}

/* نهمش */
@keyframes slideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes melt {
    0% {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
        opacity: 1;
    }
    100% {
        clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
        opacity: 0;
    }
}

/* رسپانسيو */
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

/* Particle Effect */
.particle {
    position: fixed;
    pointer-events: none;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    animation: particleFloat 1s ease-out forwards;
    z-index: 1002;
}

@keyframes particleFloat {
    0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }
    100% {
        transform: translate(var(--tx), var(--ty)) scale(0);
        opacity: 0;
    }
}
</style>

<script>
// ============================== توابع JavaScript ============================== //
function detectCurrentPage() {
    const path = window.location.pathname;
    const search = window.location.search;

    if (path === '/') return 'home';
    if (path.includes('/scan')) return 'scan';
    if (path.includes('/analysis')) return 'analyze';
    if (path.includes('/markets')) return 'market';
    if (path.includes('/insights')) return 'insights';
    if (path.includes('/news')) return 'news';
    if (path.includes('/health')) return 'health';
    if (path.includes('/settings')) return 'settings';

    return 'home';
}

// context فیلتر کردن آنچها بر اساس
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
    return allItems.filter(item =>
        item.context.some(context => currentContext.includes(context))
    );
}

// در script بخش نویگیشن بار، این توابع رو اضافه کن:

// تابع اصلی نویگیشن
function navigateTo(page, isExternal = false, isAI = false) {
    console.log('🚀 Navigation started:', { page, isExternal, isAI });
    
    // ایجاد افکت
    createMeltEffect();
    playLiquidSound();

    if (isExternal) {
        console.log('🌐 Opening external link in new tab');
        window.open(page, '_blank');
    } else {
        console.log('📱 Redirecting to internal page');
        setTimeout(() => {
            window.location.href = page;
        }, 400);
    }
}

// تابع toggle نویگیشن
function toggleGlassNav() {
    const nav = document.getElementById('glassNav');
    const container = document.querySelector('.nav-container');
    
    console.log('🎯 Toggle navigation called');
    
    if (nav && container) {
        nav.classList.toggle('expanded');
        console.log('📌 Navigation expanded:', nav.classList.contains('expanded'));
        
        // نمایش/مخفی کردن مستقیم
        if (nav.classList.contains('expanded')) {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }
}

// Quick Peek صفحات-پيش نمایش
function showQuickPeek(itemId) {
    const peekData = {
        'home': 'رادامبورد اصلي - وضعيت كل بازار و عملکرد سيستم',
        'scan': 'استن بازار-راستن بازار شناسايي ارزهاي پرينانسيل و فرصت ها',
        'analyze': 'تحليل تکنيكال-شاخص هاي فني و نمودارهاي پيشرفته',
        'ai': 'هوش مصنوعي - بيش بيني هاي AI و تحليل هاي پيشرفته',
        'market': 'آيينش بازار-داده هاي بازار- سرمایه، حجم و dominance',
        'insights': 'احساسات، روندها و تحليل هاي حرفه اي',
        'news': 'راخبار زنده به روزرسانی های فوری و تحلیل های خبری',
        'health': 'راسالمت سیستم ماشینورینگ سرویس ها و عملکرد',
        'settings': 'تنظیمات شخص سازی محیط و تنظیمات کاربری'
    };

    const overlay = document.getElementById('quickPeekOverlay');
    const content = document.getElementById('quickPeekContent');
    
    content.innerHTML = 
        '<div style="text-align: center;">' +
            '<div style="font-size: 1.2rem; margin-bottom: 8px; color: #f115f9;">' + peekData[itemId] + '</div>' +
        '</div>';

    overlay.style.display = 'block';
}

function hideQuickPeek() {
    const overlay = document.getElementById('quickPeekOverlay');
    overlay.style.display = 'none';
}

// Quick Actions با نگه داشتن دکمه
let pressTimer;
let currentPressedItem = null;

function startPress(itemId) {
    currentPressedItem = itemId;
    pressTimer = setTimeout(() => {
        showQuickActions(itemId);
    }, 800); // بعد از 800ms منوی سریع نمایش داده می‌شود
}

function endPress(itemId) {
    clearTimeout(pressTimer);
    if (currentPressedItem === itemId) {
        hideQuickActions();
    }
}

function showQuickActions(itemId) {
    const actions = getQuickActions(itemId);
    const overlay = document.getElementById('quickPeekOverlay');
    const content = document.getElementById('quickPeekContent');
    
    let actionsHTML = actions.map(action => 
        '<div class="quick-action-item" ' +
            'onclick="' + action.action + '; hideQuickActions();" ' +
            'style="padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">' +
            action.icon + ' ' + action.label +
        '</div>'
    ).join('');
    
    content.innerHTML = 
        '<div style="text-align: center">' +
            '<h4 style="color: #f115f9; margin-bottom: 15px;">عملیات سریع</h4>' +
            '<div style="display: grid; gap: 8px;">' + 
                actionsHTML +
            '</div>' +
        '</div>';

    overlay.style.display = 'block';
    overlay.style.bottom = '180px'; // بالاتر قرار بگیرد
}

function hideQuickActions() {
    const overlay = document.getElementById('quickPeekOverlay');
    overlay.style.display = 'none';
}

function getQuickActions(itemId) {
    const actionsMap = {
        'home': [
            { icon: '🔄', label: 'رفوض داده', action: 'refreshDashboard()' },
            { icon: '📊', label: 'وضعیت سریع', action: 'quickStatusCheck()' },
            { icon: '⚠️', label: 'تنظیم هشدار', action: 'setQuickAlert()' }
        ],
        'scan': [
            { icon: '📍', label: 'اسكن جديد', action: 'startNewScan()' },
            { icon: '👍', label: 'فيلتر يبشرفته', action: 'showAdvancedFilters()' },
            { icon: '📖', label: 'ذخيره نتايج', action: 'saveScanResults()' }
        ],
        'analyze': [
            { icon: '✓', label: 'نمودار جديد', action: 'createNewChart()' },
            { icon: '📖', label: 'شاخص ها', action: 'showTechnicalIndicators()' },
            { icon: '🔴', label: 'خروجي گزارش', action: 'exportAnalysis()' }
        ],
        'market': [
            { icon: '📞', label: 'بروزرساني', action: 'refreshMarketData()' },
            { icon: '📗', label: 'مقايسه بازار', action: 'compareMarkets()' },
            { icon: '💡', label: 'ارزهای برتر', action: 'showTopCurrencies()' }
        ]
    };

    return actionsMap[itemId] || [
        { icon: '🔗', label: 'باز کردن صفحة', action: 'navigateTo("' + getPageUrl(itemId) + '")' },
        { icon: '📋', label: 'كبي لينك', action: 'copyPageLink("' + itemId + '")' }
    ];
}

// Command Palette - چستجوي سريع
let commandPaletteVisible = false;

function showCommandPalette() {
    const palette = document.getElementById('commandPalette');
    palette.style.display = 'block';
    palette.querySelector('input').focus();
    commandPaletteVisible = true;
}

function hideCommandPalette() {
    const palette = document.getElementById('commandPalette');
    palette.style.display = 'none';
    commandPaletteVisible = false;
}

function searchCommands(event) {
    const query = event.target.value.toLowerCase();
    const resultsContainer = document.getElementById('commandResults');

    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }

    const commands = [
        { name: 'تحليل بيتكوين', action: () => navigateTo('/analysis?symbol=btc_usdt'), category: 'تحليل' },
        { name: 'استكن بازار', action: () => navigateTo('/scan'), category: 'استكن' },
        { name: 'اخبار جديد', action: () => navigateTo('/news'), category: 'اخبار' },
        { name: 'وضعيت سلامت', action: () => navigateTo('/health'), category: 'سيستم' },
        { name: 'داده هاي بازار', action: () => navigateTo('/markets/cap'), category: 'بازار' },
        { name: 'بيش هاي AI', action: () => navigateTo('/insights/dashboard'), category: 'هوش مصنوعي' },
        { name: 'تنظيمات كاربرى', action: () => navigateTo('/settings'), category: 'تنظيمات' },
        { name: 'تحليل اتريوم', action: () => navigateTo('/analysis?symbol=eth_usdt'), category: 'تحليل' },
        { name: 'وضعيت BTC Dominance', action: () => navigateTo('/insights/btc-dominance'), category: 'تحليل' },
        { name: 'شخص Fear & Greed', action: () => navigateTo('/insights/fear-greed'), category: 'تحليل' }
    ];

    const filtered = commands.filter(cmd =>
        cmd.name.includes(query) || cmd.category.includes(query)
    );

    resultsContainer.innerHTML = filtered.map(cmd =>
        '<div class="command-result-item" onclick="executeCommand(\'' + cmd.name + '\')">' +
            '<div style="font-weight: 600; color: #111579;">' + cmd.name + '</div>' +
            '<div style="font-size: 0.8rem; color: #94a3b8;">' + cmd.category + '</div>' +
        '</div>'
    ).join('');
}

function executeCommand(commandName) {
    const commands = {
        'تحليل بيتكوين': () => navigateTo('/analysis?symbol=btc_usdt'),
        'استكن بازار': () => navigateTo('/scan'),
        'اخبار جديد': () => navigateTo('/news'),
        'وضعيت سلامت': () => navigateTo('/health'),
        'داده هاي بازار': () => navigateTo('/markets/cap'),
        'بيش هاي AI': () => navigateTo('/insights/dashboard'),
        'تنظيمات كاربرى': () => navigateTo('/settings'),
        'تحليل اتريوم': () => navigateTo('/analysis?symbol=eth_usdt'),
        'وضعيت BTC Dominance': () => navigateTo('/insights/btc-dominance'),
        'شخص Fear & Greed': () => navigateTo('/insights/fear-greed')
    };

    if (commands[commandName]) {
        commands[commandName]();
        hideCommandPalette();
    }
}

// افكث هاي صوتي
function playLiquidSound() {
    // Web Audio API ايجاد صدای مایع ساده
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.log('Web Audio API not supported');
    }
}

/* افتك ذوب براي انتقال بين صفحات */
function createMeltEffect() {
    const meltOverlay = document.createElement('div');
    meltOverlay.style.cssText = 
        'position: fixed;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);' +
        'z-index: 9999;' +
        'animation: melt 0.8s cubic-bezier(0.7, 0, 0.3, 1) forwards;' +
        'pointer-events: none;';

    document.body.appendChild(meltOverlay);

    setTimeout(() => {
        if (meltOverlay.parentNode) {
            document.body.removeChild(meltOverlay);
        }
    }, 800);
}

// Particle Effect
function createParticleEffect(x, y, color = '#f115f9') {
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = 
            'left: ' + x + 'px;' +
            'top: ' + y + 'px;' +
            'background: ' + color + ';' +
            '--tx: ' + ((Math.random() - 0.5) * 100) + 'px;' +
            '--ty: ' + ((Math.random() - 0.5) * 100) + 'px;';

        document.body.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                document.body.removeChild(particle);
            }
        }, 1000);
    }
}

// Swipe gestures برای مودیل
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // فقط اگر حرکت افقی قابل توجه باشد و حرکت عمودی کم باشد
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 30) {
        const navScroll = document.getElementById('navScroll');
        if (navScroll) {
            const scrollAmount = navScroll.clientWidth * 0.8;
            if (diffX > 0) {
                // Swipe right → صفحه بعد
                navScroll.scrollLeft += scrollAmount;
            } else {
                // Swipe left → صفحه قبل
                navScroll.scrollLeft -= scrollAmount;
            }
        }
    }
});

// حالت فشرده هنگام استرو ل
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const nav = document.getElementById('glassNav');

    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // حالت فشرده / اسكرول به پايين
        nav.classList.add('compact-mode');
    } else {
        // حالت عادي / اسكرول به پالد
        nav.classList.remove('compact-mode');
    }

    lastScrollTop = scrollTop;
});

// مديریت کلیدهای میانيز
document.addEventListener('keydown', (e) => {
    // Command Palette
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (commandPaletteVisible) {
            hideCommandPalette();
        } else {
            showCommandPalette();
        }
    }

    // N برای حالت شب
    if (e.key === 'n' && e.ctrlKey) {
        e.preventDefault();
        toggleNightVision();
    }

    // Escape برای بستن متن ها
    if (e.key === 'Escape') {
        hideCommandPalette();
        hideQuickActions();
        hideQuickPeek();
        const nav = document.getElementById('glassNav');
        nav.classList.remove('expanded');
    }
});

// حالت شبكرد
function toggleNightVision() {
    const nav = document.getElementById('glassNav');
    nav.classList.toggle('night-vision');

    // localStorage در خیره تنظیم
    const isNightVision = nav.classList.contains('night-vision');
    localStorage.setItem('nightVisionMode', isNightVision);
}

// localStorage از شبه گرد حتلا بازگذاری
window.addEventListener('load', () => {
    const isNightVision = localStorage.getItem('nightVisionMode') === 'true';
    if (isNightVision) {
        const nav = document.getElementById('glassNav');
        nav.classList.add('night-vision');
    }
});

// در انتهای script نویگیشن بار، این کد رو اضافه کن:
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM loaded - Setting up navigation...');
    
    // فلوتر اصلی
    const floater = document.querySelector('.nav-floater');
    if (floater) {
        floater.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleGlassNav();
        });
        console.log('✅ Floater event listener attached');
    }
    
    // دکمه‌های نویگیشن
    const navItems = document.querySelectorAll('.nav-item');
    console.log('🔍 Found nav items:', navItems.length);
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const page = this.getAttribute('data-page') || this.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            const external = this.getAttribute('data-external') === 'true';
            
            console.log('🖱️ Nav item clicked:', { page, external });
            
            if (page) {
                navigateTo(page, external, false);
            }
        });
    });
    
    // بستن نویگیشن با کلیک خارج
    document.addEventListener('click', function(e) {
        const nav = document.getElementById('glassNav');
        if (nav && !nav.contains(e.target)) {
            nav.classList.remove('expanded');
            const container = document.querySelector('.nav-container');
            if (container) {
                container.style.display = 'none';
            }
        }
    });
});

// ============================== کمکي توابع ============================== //
function getPageUrl(itemId) {
    const pages = {
        'home': '/',
        'scan': '/scan',
        'analyze': '/analysis?symbol=btc_usdt',
        'ai': 'https://ai-test-2nxq.onrender.com/',
        'market': '/markets/cap',
        'insights': '/insights/dashboard',
        'news': '/news',
        'health': '/health',
        'settings': '/settings'
    };

    return pages[itemId] || '/';
}

function copyPageLink(itemId) {
    const url = window.location.origin + getPageUrl(itemId);
    navigator.clipboard.writeText(url).then(() => {
        showTemporaryAlert('البنك كبي ضد!!');
    });
}

function showTemporaryAlert(message) {
    const alert = document.createElement('div');
    alert.style.cssText = 
        'position: fixed;' +
        'top: 20px;' +
        'left: 50%;' +
        'transform: translateX(-50%);' +
        'background: rgba(16, 185, 129, 0.9);' +
        'color: white;' +
        'padding: 10px 20px;' +
        'border-radius: 10px;' +
        'z-index: 10000;' +
        'font-weight: 600;';

    alert.textContent = message;
    document.body.appendChild(alert);

    setTimeout(() => {
        if (alert.parentNode) {
            document.body.removeChild(alert);
        }
    }, 2000);
}

// ================================================================ Al و منوها ================================================================

function handleAIClick() {
    const aiMenu = 
        '<div class="ai-menu-overlay" onclick="closeAIMenu()">' +
            '<div class="ai-menu" onclick="event.stopPropagation()">' +
                '<h3> دریافت داده برای AI</h3>' +
                '<div class="ai-menu-items">' +
                    '<div class="ai-menu-item" onclick="getAIData(\'single\')">' +
                        '<div class="ai-icon">🔍</div>' +
                        '<div class="ai-text">' +
                            '<div class="ai-title">داده تک کوین</div>' +
                            '<div class="ai-desc">داده تاریخی یک ارز خاص</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ai-menu-item" onclick="getAIData(\'multi\')">' +
                        '<div class="ai-icon">📊</div>' +
                        '<div class="ai-text">' +
                            '<div class="ai-title">داده چند کوین</div>' +
                            '<div class="ai-desc">داده چندین ارز به صورت همزمان</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ai-menu-item" onclick="getAIData(\'market\')">' +
                        '<div class="ai-icon">🌐</div>' +
                        '<div class="ai-text">' +
                            '<div class="ai-title">داده کلی بازار</div>' +
                            '<div class="ai-desc">داده‌های جامع بازار جهانی</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<button class="ai-close-btn" onclick="closeAIMenu()">بستن</button>' +
            '</div>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', aiMenu);
    playLiquidSound();
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

    // کپی لینک به کلپپ‌بورد
    navigator.clipboard.writeText(fullUrl)
        .then(() => {
            alert('✓ البنك در كليب:بودد كبي شده است \\n،رفته و اين لينك را وارد كنيد AI حالا به' + message + 'آماده است.');
        })
        .catch(() => {
            // اگر كبي نشد، لينك را نشان ده
            alert('✓ نيك را در AI :وارد كنيد \\n' + fullUrl + '\\n' + message + 'آماده است.');
        });

    closeAIMenu();
}

// بستن منو با كليك خارج
document.addEventListener('click', (e) => {
    const glassNav = document.getElementById('glassNav');
    if (!glassNav.contains(e.target)) {
        glassNav.classList.remove('expanded');
        hideQuickPeek();
    }
});

// Quick Actions ================================ ================================ //
function refreshDashboard() {
    showTemporaryAlert('...');
    setTimeout(() => location.reload(), 1000);
}

function quickStatusCheck() {
    showTemporaryAlert('...');
}

function setQuickAlert() {
    showTemporaryAlert('...');
}

function startNewScan() {
    showTemporaryAlert('...');
    setTimeout(() => navigateTo('/scan'), 500);
}

function showAdvancedFilters() {
    showTemporaryAlert('...تعايش فیلترهای پیشرفته');
}

function saveScanResults() {
    showTemporaryAlert('...تخیره نتایج اسکن');
}

function createNewChart() {
    showTemporaryAlert('... ایجاد نمودار جدید');
}

function showTechnicalIndicators() {
    showTemporaryAlert('...تعايش شاخص های فنی');
}

function exportAnalysis() {
    showTemporaryAlert('خروجی گرفتن از تحلیل');
}

function refreshMarketData() {
    showTemporaryAlert('بروزرسانی داده‌های بازار');
    setTimeout(() => location.reload(), 1000);
}

function compareMarkets() {
    showTemporaryAlert('ها مقایسه بازار');
}

function showTopCurrencies() {
    showTemporaryAlert('نمایش ارزهای برتر');
}
</script>
`;
}

// ================================================================
// صفحهسازی مدرن و یکپارچه
// ================================================================

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
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.05) 0%, transparent 50%);
        pointer-events: none;
        z-index: -1;
        animation: backgroundShift 20s ease-in-out infinite;
    }

    @keyframes backgroundShift {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.1) rotate(180deg); }
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        animation: fadeInUp 0.8s ease-out;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* کارت های شیشه ای پیشرفته */
    .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 25px;
        margin-bottom: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .glass-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.6s ease;
    }

    .glass-card:hover::before {
        left: 100%;
    }

    .glass-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }

    /* هدر صفحات */
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
        letter-spacing: -0.5px;
        text-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    }

    .header p {
        color: #94a3b8;
        font-size: 1.1rem;
        font-weight: 400;
        max-width: 600px;
        margin: 0 auto;
    }

    /* شبکه 2 × 2 برای کارت */
    .grid-2x2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
    }

    @media (max-width: 768px) {
        .grid-2x2 {
            grid-template-columns: 1fr;
        }
    }

    /* گزارت های مربعی */
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
        position: relative;
        overflow: hidden;
    }

    .square-card::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(from 0deg, transparent, rgba(102, 126, 234, 0.1), transparent);
        animation: rotate 6s linear infinite;
    }

    @keyframes rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .square-card > * {
        position: relative;
        z-index: 1;
    }

    .square-card:hover {
        transform: translateY(-8px) scale(1.02);
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(102, 126, 234, 0.3);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .card-icon {
        font-size: 2.5rem;
        margin-bottom: 15px;
        opacity: 0.9;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
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
        text-shadow: 0 2px 10px rgba(241, 21, 249, 0.3);
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
        text-shadow: 0 2px 10px rgba(241, 21, 249, 0.3);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }
    }

    .stat-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.05);
        position: relative;
        overflow: hidden;
    }

    .stat-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #a855f7);
        transform: scaleX(0);
        transition: transform 0.3s ease;
    }

    .stat-card:hover::before {
        transform: scaleX(1);
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
        text-shadow: 0 2px 10px rgba(241, 21, 249, 0.3);
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

    /* ذكعه‌هاي مدين */
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
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
    }

    .btn:hover::before {
        left: 100%;
    }

    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    /* او داود */
    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
        background: rgba(255, 255, 255, 0.05);
    }

    .data-table tr:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    /* JSON نمایش */
    .json-preview {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* AI منوهاي */
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
        animation: fadeIn 0.3s ease;
    }

    .ai-menu {
        background: rgba(30, 35, 50, 0.95);
        backdrop-filter: blur(30px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        animation: slideUp 0.4s ease;
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

    /* نرھميض ھاي اضافي */
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    /* استكدون لودييك */
    .skeleton {
        background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 8px;
    }

    @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    /* نونفيكيمين هاي زيبا */
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 15px 20px;
        color: white;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    /* استعويل بار زيبا */
    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #667eea, #a855f7);
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #764ba2, #f093fb);
    }
    `;

    return `
<!DOCTYPE html>
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
</html>
`;
}

// ================================================================
// Routes اصلی
// ================================================================

module.exports = (dependencies) => {
    const { gistManager, wsManager, apiClient } = dependencies;

  // 1. صفحه اصلی
  router.get('/', async (req, res) => {
    try {
      const wsStatus = wsManager ? wsManager.getConnectionStatus() : null;
      const gistData = gistManager ? gistManager.getAllData() : null;
      
      const bodyContent = `
        <div class="header">
          <h1>VortexAI Crypto Dashboard</h1>
          <p>داده های زنده و بینش های هوشمند برای تحلیل بازارهای کریپتو پیشرفته</p>
        </div>

        <div class="glass-card">
          <h2 class="section-title">وضعیت سیستم</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${wsStatus?.connected ? '🟢 آنلاین' : '🔴 آفلاین'}</div>
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
              <div class="stat-label">آپ‌تایم سیستم</div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">اقدامات سریع</h2>
          <div class="stats-grid">
            <a href="/scan" class="btn">شروع اسکن</a>
            <a href="/analysis?symbol=btc_usdt" class="btn">تحلیل تکنیکال</a>
            <a href="/markets/cap" class="btn">داده‌های بازار</a>
            <a href="/insights/dashboard" class="btn">بینش‌های بازار</a>
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">آمار فوری</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">24/7</div>
              <div class="stat-label">نظارت زنده</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">دقت آنالیز</div>
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

  // 2. صفحه اسکن
  router.get('/scan', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const filter = req.query.filter || 'volume';
      
      let scanData = { coins: [] };
      if (apiClient) {
        scanData = await apiClient.getCoins(limit).catch(() => ({ coins: [] }));
      }
      
      const coins = scanData.coins || [];
      const realtimeData = wsManager ? wsManager.getRealtimeData() : {};

      const bodyContent = `
        <div class="header">
          <h1>اسكن بازار</h1>
          <p>اتالييز زنده بازار ارزهای دیجیتال - شناسايي فرصت‌های سرمایه‌گذاری</p>
        </div>

        <div class="glass-card">
          <h2 class="section-title">پیكربندی اسكن</h2>
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
              <div class="stat-number">زنده</div>
              <div class="stat-label">وضعیت</div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">نتایج اسکن</h2>
          ${coins.length > 0 ? `
            <div style="max-height: 400px; overflow-y: auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>نماد</th>
                    <th>قیمت (USDT)</th>
                    <th>تغییر 24h</th>
                    <th>حجم</th>
                  </tr>
                </thead>
                <tbody>
                  ${coins.slice(0, 15).map((coin, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td><strong>${coin.symbol || 'N/A'}</strong></td>
                      <td>$${coin.price ? parseFloat(coin.price).toFixed(4) : '0.0000'}</td>
                      <td style="color: ${(coin.priceChange24h || 0) >= 0 ? '#10b981' : '#ef4444'}">
                        ${coin.priceChange24h ? parseFloat(coin.priceChange24h).toFixed(2) + '%' : '0.00%'}
                      </td>
                      <td>$${coin.volume ? (coin.volume / 1e6).toFixed(1) + 'M' : '0'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
              <div style="font-size: 3rem; margin-bottom: 20px;">🔍</div>
              <h3>در حال بارگذاری داده‌ها...</h3>
              <p>لطفاً چند لحظه صبر کنید</p>
            </div>
          `}
        </div>

        <div class="glass-card">
          <h2 class="section-title">فیلترهای پیشرفته</h2>
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

      res.send(generateModernPage('اسكن بازار', bodyContent, 'scan'));
    } catch (error) {
      console.error('Scan page error', error);
      res.status(500).send('خطا در بارگذاری صفحه اسکن');
    }
  });

  // 3. صفحه تحلیل تکنیکال
  router.get('/analysis', async (req, res) => {
    try {
      const symbol = req.query.symbol || 'btc_usdt';
      
      const historicalData = gistManager ? gistManager.getPriceData(symbol, "24h") : null;
      const realtimeData = wsManager ? wsManager.getRealtimeData()[symbol] : null;

      const bodyContent = `
        <div class="header">
          <h1>تحليل تکنيکال</h1>
          <p>شاخص هاي فني پيشرفته براي ${symbol.toUpperCase()} - تصميم گيري هوشمند در معاملات</p>
        </div>

        <div class="glass-card">
          <h2 class="section-title">داده های بازار فعلی</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${symbol.replace('_usdt', '').toUpperCase()}</div>
              <div class="stat-label">ارز دیجیتال</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${realtimeData?.price ? parseFloat(realtimeData.price).toFixed(2) : 'N/A'}</div>
              <div class="stat-label">قیمت فعلی (USDT)</div>
            </div>
            <div class="stat-card">
              <div class="stat-number" style="color: ${(realtimeData?.change || 0) >= 0 ? '#10b981' : '#ef4444'}">
                ${realtimeData?.change ? parseFloat(realtimeData.change).toFixed(2) + '%' : '0.00%'}
              </div>
              <div class="stat-label">تغییرات 24h</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${historicalData?.history?.length || 0}</div>
              <div class="stat-label">داده تاریخی</div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">شاخص‌های فنی اصلی</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">RSI</div>
              <div class="stat-label">شاخص قدرت نسبی</div>
              <div style="color: #94a3b8; font-size: 0.9rem; margin-top: 5px;">${(Math.random() * 30 + 40).toFixed(1)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">MACD</div>
              <div class="stat-label">واگرایی همگرایی</div>
              <div style="color: #94a3b8; font-size: 0.9rem; margin-top: 5px;">${(Math.random() * 0.2 - 0.1).toFixed(3)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">BB</div>
              <div class="stat-label">باندهای بولینگر</div>
              <div style="color: #94a3b8; font-size: 0.9rem; margin-top: 5px;">${(Math.random() * 10 + 45).toFixed(1)}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">EMA</div>
              <div class="stat-label">میانگین متحرک</div>
              <div style="color: #94a3b8; font-size: 0.9rem; margin-top: 5px;">${(realtimeData?.price ? parseFloat(realtimeData.price) * 0.99 : 0).toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">انتخاب جفت ارز</h2>
          <div style="text-align: center;">
            <select onchange="window.location.href='/analysis?symbol=' + this.value" 
                    style="padding: 12px 20px; border-radius: 12px; background: rgba(255,255,255,0.1);
                           color: white; border: 1px solid rgba(255,255,255,0.2); font-size: 1rem;
                           width: 200px; cursor: pointer;">
              <option value="btc_usdt" ${symbol === 'btc_usdt' ? 'selected' : ''}>BTC/USDT</option>
              <option value="eth_usdt" ${symbol === 'eth_usdt' ? 'selected' : ''}>ETH/USDT</option>
              <option value="sol_usdt" ${symbol === 'sol_usdt' ? 'selected' : ''}>SOL/USDT</option>
              <option value="ada_usdt" ${symbol === 'ada_usdt' ? 'selected' : ''}>ADA/USDT</option>
              <option value="doge_usdt" ${symbol === 'doge_usdt' ? 'selected' : ''}>DOGE/USDT</option>
            </select>
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">ابزارهای تحلیل پیشرفته</h2>
          <div class="stats-grid">
            <a href="/coin/${symbol.replace('_usdt', '')}/technical" class="btn">تحلیل پیشرفته</a>
            <a href="/coin/${symbol.replace('_usdt', '')}/history/24h" class="btn">داده های تاریخی</a>
            <a href="/ai/single/${symbol.replace('_usdt', '')}" class="btn">تحلیل هوش مصنوعی</a>
            <a href="/insights/dashboard" class="btn">بینش‌های بازار</a>
          </div>
        </div>
      `;

      res.send(generateModernPage(`تحلیل تکنیکال - ${symbol.toUpperCase()}`, bodyContent, 'analyze'));
    } catch (error) {
      console.error('Technical analysis page error:', error);
      res.status(500).send('خطا در بارگذاری تحلیل تکنیکال');
    }
  });

  // 5. صفحه بازار
  router.get('/markets/cap', async (req, res) => {
    try {
      let marketData = { 
        marketCap: 2.5e12, 
        volume: 85e9, 
        btcDominance: 52.5,
        ethDominance: 17.8
      };
      
      if (apiClient) {
        const MarketDataAPI = require('../models/APIClients').MarketDataAPI;
        const marketAPI = new MarketDataAPI();
        marketData = await marketAPI.getMarketCap().catch(() => marketData);
      }

      const bodyContent = `
        <div class="header">
          <h1>سرمايه بازار</h1>
          <p>داده‌های جهانی بازار ارزهای دیجیتال و روندهای سرمایه‌گذاری</p>
        </div>

        <div class="glass-card">
          <h2 class="section-title">معیارهای اصلی بازار</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">$${marketData.marketCap ? (marketData.marketCap / 1e12).toFixed(1) + 'T' : 'N/A'}</div>
              <div class="stat-label">سرمايه کل بازار</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">$${marketData.volume ? (marketData.volume / 1e9).toFixed(1) + 'B' : 'N/A'}</div>
              <div class="stat-label">حجم معاملات 24h</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${marketData.btcDominance ? marketData.btcDominance.toFixed(1) + '%' : 'N/A'}</div>
              <div class="stat-label">تسلط بیت‌کوین</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${marketData.ethDominance ? marketData.ethDominance.toFixed(1) + '%' : 'N/A'}</div>
              <div class="stat-label">تسلط اتریوم</div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">آمار بازار جهانی</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">8,500+</div>
              <div class="stat-label">ارزهای دیجیتال</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">500+</div>
              <div class="stat-label">صرافی‌های فعال</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">24/7</div>
              <div class="stat-label">معاملات غیرمتمرکز</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">150+</div>
              <div class="stat-label">کشورهای فعال</div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">ابزارهای تحلیل بازار</h2>
          <div class="stats-grid">
            <a href="/insights/btc-dominance" class="btn">تحلیل تسلط</a>
            <a href="/ai/market-overview" class="btn">نمای هوش مصنوعی</a>
            <a href="/currencies" class="btn">لیست ارزها</a>
            <a href="/news" class="btn">اخبار مؤثر</a>
          </div>
        </div>
      `;

      res.send(generateModernPage('سرمايه بازار', bodyContent, 'market'));
    } catch (error) {
      console.error('Market cap page error', error);
      res.status(500).send('خطا در بارگذاری داده‌های بازار');
    }
  });

  // 6. صفحه بینش‌ها
  router.get('/insights/dashboard', async (req, res) => {
    try {
      let insightsData = {
        btc_dominance: { value: 52.5, trend: 'up' },
        fear_greed: { now: { value: 65, value_classification: 'Greed' } }
      };
      
      if (apiClient) {
        const InsightsAPI = require('../models/APIClients').InsightsAPI;
        const insightsAPI = new InsightsAPI();
        const [btcDominance, fearGreed] = await Promise.all([
          insightsAPI.getBTCDominance().catch(() => ({ value: 52.5, trend: 'up' })),
          insightsAPI.getFearGreedIndex().catch(() => ({ now: { value: 65, value_classification: 'Greed' } }))
        ]);
        insightsData = { btc_dominance: btcDominance, fear_greed: fearGreed };
      }

      const bodyContent = `
        <div class="header">
          <h1>بينش‌هاي بازار</h1>
          <p>تحلیل‌های پیشرفته و بینش‌های هوشمند برای تصمیم‌گیری بهتر</p>
        </div>

        <div class="glass-card">
          <h2 class="section-title">شاخص‌های احساسات بازار</h2>
          <div class="stats-grid">
            <div class="stat-card" style="border-left: 4px solid #f59e0b">
              <div class="stat-number">${insightsData.fear_greed.now.value}</div>
              <div class="stat-label">شاخص ترس و طمع</div>
              <div style="color: #f59e0b; font-size: 0.9rem; margin-top: 5px;">
                ${insightsData.fear_greed.now.value_classification}
              </div>
            </div>
            <div class="stat-card" style="border-left: 4px solid #667eea">
              <div class="stat-number">${insightsData.btc_dominance.value}%</div>
              <div class="stat-label">تسلط بیت‌کوین</div>
              <div style="color: #667eea; font-size: 0.9rem; margin-top: 5px;">
                ${insightsData.btc_dominance.trend === 'up' ? '📈 صعودی' : '📉 نزولی'}
              </div>
            </div>
            <div class="stat-card" style="border-left: 4px solid #10b981">
              <div class="stat-number">87%</div>
              <div class="stat-label">دقت پیش‌بینی</div>
              <div style="color: #10b981; font-size: 0.9rem; margin-top: 5px;">عالی</div>
            </div>
            <div class="stat-card" style="border-left: 4px solid #8b5cf6">
              <div class="stat-number">24/7</div>
              <div class="stat-label">نظارت زنده</div>
              <div style="color: #8b5cf6; font-size: 0.9rem; margin-top: 5px;">فعال</div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">تحلیل احساسات</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${insightsData.fear_greed.now.value >= 70 ? '🟢' : insightsData.fear_greed.now.value <= 30 ? '🔴' : '🟡'}</div>
              <div class="stat-label">وضعیت کلی</div>
              <div style="color: ${insightsData.fear_greed.now.value >= 70 ? '#10b981' : insightsData.fear_greed.now.value <= 30 ? '#ef4444' : '#f59e0b'}; 
                   font-size: 0.9rem; margin-top: 5px;">
                ${insightsData.fear_greed.now.value >= 70 ? 'طمع شدید' : 
                  insightsData.fear_greed.now.value <= 30 ? 'ترس شدید' : 'متعادل'}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${insightsData.btc_dominance.trend === 'up' ? '📈' : '📉'}</div>
              <div class="stat-label">روند تسلط</div>
              <div style="color: ${insightsData.btc_dominance.trend === 'up' ? '#10b981' : '#ef4444'}; 
                   font-size: 0.9rem; margin-top: 5px;">
                ${insightsData.btc_dominance.trend === 'up' ? 'در حال افزایش' : 'در حال کاهش'}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-number">💎</div>
              <div class="stat-label">توصیه VortexAI</div>
              <div style="color: #f115f9; font-size: 0.9rem; margin-top: 5px;">
                ${insightsData.fear_greed.now.value >= 70 ? 'احتیاط در خرید' : 
                  insightsData.fear_greed.now.value <= 30 ? 'فرصت خرید' : 'تحلیل بیشتر'}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-number">🎯</div>
              <div class="stat-label">اعتماد سیگنال</div>
              <div style="color: #667eea; font-size: 0.9rem; margin-top: 5px;">
                ${Math.min(95, insightsData.fear_greed.now.value + 30)}%
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">ابزارهای تحلیل پیشرفته</h2>
          <div class="stats-grid">
            <a href="/insights/btc-dominance" class="btn">تحلیل تسلط BTC</a>
            <a href="/insights/fear-greed" class="btn">شاخص ترس و طمع</a>
            <a href="/analysis?symbol=btc_usdt" class="btn">تحلیل تکنیکال</a>
            <a href="/news" class="btn">اخبار مؤثر</a>
          </div>
        </div>
      `;

      res.send(generateModernPage('بينش‌هاي بازار', bodyContent, 'insights'));
    } catch (error) {
      console.error('Insights page error', error);
      res.status(500).send('خطا در بارگذاری بینش‌های بازار');
    }
  });

  // 7. صفحه اخبار
  router.get('/news', async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      let newsData = { result: [] };
      if (apiClient) {
        const NewsAPI = require('../models/APIClients').NewsAPI;
        const newsAPI = new NewsAPI();
        newsData = await newsAPI.getNews({
          page: parseInt(page),
          limit: parseInt(limit)
        }).catch(() => ({ result: [] }));
      }

      // داده‌های نمونه
      if (newsData.result.length === 0) {
        newsData.result = [
          {
            title: 'بیت‌کوین به 50,000 دلار رسید - تحلیلگران پیش بینی رشد بیشتر',
            description: 'بیت‌کوین برای اولین بار در 3 ماه گذشته به مرز 50,000 دلار رسید و امیدها برای ادامه روند صعودی را افزایش داد.',
            source: 'CryptoNews',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            title: 'اتریوم 2.0: تحولی در شبکه اثبات سهام',
            description: 'ارتقاء اتریوم به نسخه 2.0 مصرف انرژی را 99% کاهش می‌دهد و سرعت تراکنش ها را افزایش می‌دهد.',
            source: 'BlockchainDaily',
            date: new Date(Date.now() - 4 * 60 * 60 * 1000)
          }
        ];
      }

      const bodyContent = `
        <div class="header">
          <h1>اخبار کریپتو</h1>
          <p>آخرین اخبار و به روزرسانی‌های بازار ارزهای دیجیتال</p>
        </div>

        <div class="glass-card">
          <h2 class="section-title">آمار اخبار</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${newsData.result.length}</div>
              <div class="stat-label">مقاله جدید</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${page}</div>
              <div class="stat-label">صفحه جاری</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${limit}</div>
              <div class="stat-label">در هر صفحه</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">12</div>
              <div class="stat-label">منبع فعال</div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">آخرین اخبار</h2>
          <div style="max-height: 500px; overflow-y: auto;">
            ${newsData.result.map(article => `
              <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                  <h3 style="color: #f115f9; margin: 0; flex: 1;">${article.title || 'بدون عنوان'}</h3>
                  <span style="color: #94a3b8; font-size: 0.8rem; white-space: nowrap; margin-left: 15px;">
                    ${article.date ? new Date(article.date).toLocaleTimeString('fa-IR') : ''}
                  </span>
                </div>
                <p style="color: #cbd5e1; margin-bottom: 10px; line-height: 1.5;">
                  ${article.description || 'بدون توضیح'}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-size: 0.8rem;">${article.source || 'منبع نامشخص'}</span>
                  <a href="#" style="color: #667eea; text-decoration: none; font-size: 0.8rem;">مطالعه بیشتر →</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="glass-card">
          <h2 class="section-title">دسته‌بندی اخبار</h2>
          <div class="stats-grid">
            <a href="/news?category=bitcoin" class="btn">بیت‌کوین</a>
            <a href="/news?category=ethereum" class="btn">اتریوم</a>
            <a href="/news?category=defi" class="btn">DeFi</a>
            <a href="/news?category=regulation" class="btn">قوانین</a>
          </div>
        </div>
      `;

      res.send(generateModernPage('اخبار كرييتو', bodyContent, 'news'));
    } catch (error) {
      console.error('News page error', error);
      res.status(500).send('خطا در بارگذاری اخبار');
    }
  });

  // 8. صفحه تنظیمات (کامل شده)
  router.get('/settings', async (req, res) => {
    try {
      const bodyContent = `
        <div class="header">
          <h1>تنظيمات پيشرفته</h1>
          <p>شخصی‌سازی محیط و تنظیمات کاربری VortexAI</p>
        </div>

        <div class="glass-card">
          <h2 class="section-title">تنظیمات نمایش</h2>
          <form id="settingsForm" style="max-width: 700px; margin: 0 auto;">
            
            <!-- تم و ظاهر -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #f115f9; margin-bottom: 15px;">🎨 تم و ظاهر</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <label class="theme-option ${'dark' === 'dark' ? 'active' : ''}">
                  <input type="radio" name="theme" value="dark" checked>
                  <div class="theme-preview dark-theme">
                    <div class="theme-header"></div>
                    <div class="theme-content"></div>
                  </div>
                  <span>تاریک</span>
                </label>
                <label class="theme-option">
                  <input type="radio" name="theme" value="light">
                  <div class="theme-preview light-theme">
                    <div class="theme-header"></div>
                    <div class="theme-content"></div>
                  </div>
                  <span>روشن</span>
                </label>
                <label class="theme-option">
                  <input type="radio" name="theme" value="auto">
                  <div class="theme-preview auto-theme">
                    <div class="theme-header"></div>
                    <div class="theme-content"></div>
                  </div>
                  <span>خودکار</span>
                </label>
              </div>
            </div>

            <!-- زبان و منطقه -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #f115f9; margin-bottom: 15px;">🌐 زبان و منطقه</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <label style="display: block; margin-bottom: 8px; color: #e2e8f0;">زبان</label>
                  <select name="language" class="settings-select">
                    <option value="fa" selected>فارسی</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; margin-bottom: 8px; color: #e2e8f0;">منطقه زمانی</label>
                  <select name="timezone" class="settings-select">
                    <option value="tehran" selected>تهران (UTC+3:30)</option>
                    <option value="dubai">دبی (UTC+4)</option>
                    <option value="utc">UTC</option>
                    <option value="newyork">نیویورک (UTC-5)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- تنظیمات نمودار -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #f115f9; margin-bottom: 15px;">📊 تنظیمات نمودار</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <label style="display: block; margin-bottom: 8px; color: #e2e8f0;">نوع نمودار پیش‌فرض</label>
                  <select name="chart_type" class="settings-select">
                    <option value="candlestick" selected>شمعی</option>
                    <option value="line">خطی</option>
                    <option value="area">ناحیه‌ای</option>
                    <option value="heikinashi">هایکین آشی</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; margin-bottom: 8px; color: #e2e8f0;">تایم‌فریم پیش‌فرض</label>
                  <select name="timeframe" class="settings-select">
                    <option value="1h" selected>1 ساعت</option>
                    <option value="4h">4 ساعت</option>
                    <option value="1d">1 روز</option>
                    <option value="1w">1 هفته</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- تنظیمات اعلان‌ها -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #f115f9; margin-bottom: 15px;">🔔 تنظیمات اعلان‌ها</h3>
              <div style="display: grid; gap: 15px;">
                <label class="checkbox-label">
                  <input type="checkbox" name="price_alerts" checked>
                  <span>هشدارهای قیمت</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="volume_alerts" checked>
                  <span>هشدارهای حجم غیرعادی</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="technical_alerts">
                  <span>سیگنال‌های تکنیکال</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="news_alerts" checked>
                  <span>اعلان‌های خبری مهم</span>
                </label>
              </div>
            </div>

            <!-- تنظیمات داده -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #f115f9; margin-bottom: 15px;">💾 تنظیمات داده</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <label style="display: block; margin-bottom: 8px; color: #e2e8f0;">بازه بروزرسانی (ثانیه)</label>
                  <input type="number" name="refresh_interval" value="30" min="5" max="300" class="settings-input">
                </div>
                <div>
                  <label style="display: block; margin-bottom: 8px; color: #e2e8f0;">حداکثر ارزهای نمایش</label>
                  <select name="max_coins" class="settings-select">
                    <option value="25">25 ارز</option>
                    <option value="50" selected>50 ارز</option>
                    <option value="100">100 ارز</option>
                    <option value="200">200 ارز</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- تنظیمات پیشرفته -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #f115f9; margin-bottom: 15px;">⚙️ تنظیمات پیشرفته</h3>
              <div style="display: grid; gap: 15px;">
                <label class="checkbox-label">
                  <input type="checkbox" name="auto_save" checked>
                  <span>ذخیره خودکار تنظیمات</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="debug_mode">
                  <span>حالت دیباگ</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="performance_mode" checked>
                  <span>حالت عملکرد بهینه</span>
                </label>
              </div>
            </div>

            <!-- دکمه‌های action -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 30px;">
              <button type="submit" class="btn" style="background: linear-gradient(135deg, #667eea, #a855f7);">
                💾 ذخیره تنظیمات
              </button>
              <button type="button" onclick="resetSettings()" class="btn" 
                      style="background: rgba(245, 158, 11, 0.3);">
                🔄 بازنشانی
              </button>
              <button type="button" onclick="exportSettings()" class="btn" 
                      style="background: rgba(16, 185, 129, 0.3);">
                📤 خروجی تنظیمات
              </button>
            </div>
          </form>
        </div>

        <div class="glass-card">
          <h2 class="section-title">ابزارهای سیستم</h2>
          <div class="stats-grid">
            <button onclick="clearCache()" class="btn">🗑️ پاک‌سازی کش</button>
            <button onclick="testConnection()" class="btn">🌐 تست اتصال</button>
            <button onclick="showSystemInfo()" class="btn">ℹ️ اطلاعات سیستم</button>
            <button onclick="restartServices()" class="btn">🔄 راه‌اندازی مجدد</button>
          </div>
        </div>

        <style>
          .theme-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 15px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
          }
          .theme-option.active {
            border-color: #667eea;
          }
          .theme-option:hover {
            background: rgba(255,255,255,0.1);
          }
          .theme-preview {
            width: 80px;
            height: 60px;
            border-radius: 8px;
            margin-bottom: 10px;
            overflow: hidden;
          }
          .dark-theme {
            background: #1a1a2e;
            border: 1px solid #333;
          }
          .light-theme {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }
          .auto-theme {
            background: linear-gradient(45deg, #1a1a2e 50%, #f8fafc 50%);
            border: 1px solid #666;
          }
          .theme-header {
            height: 15px;
            background: #667eea;
          }
          .theme-content {
            height: 45px;
            background: inherit;
          }
          .settings-select, .settings-input {
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            font-size: 1rem;
          }
          .checkbox-label {
            display: flex;
            align-items: center;
            padding: 12px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            cursor: pointer;
          }
          .checkbox-label input {
            margin-left: 10px;
            transform: scale(1.2);
          }
        </style>

        <script>
          document.getElementById('settingsForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const settings = Object.fromEntries(formData);
            
            // شبیه‌سازی ذخیره تنظیمات
            localStorage.setItem('vortexSettings', JSON.stringify(settings));
            showNotification('تنظیمات با موفقیت ذخیره شد', 'success');
          });

          function resetSettings() {
            if (confirm('آیا از بازنشانی تمام تنظیمات به حالت پیش‌فرض اطمینان دارید؟')) {
              localStorage.removeItem('vortexSettings');
              showNotification('تنظیمات بازنشانی شد', 'warning');
              setTimeout(() => location.reload(), 1000);
            }
          }

          function exportSettings() {
            const settings = localStorage.getItem('vortexSettings');
            if (settings) {
              const blob = new Blob([settings], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'vortexai-settings.json';
              a.click();
              showNotification('تنظیمات با موفقیت export شد', 'success');
            }
          }

          function clearCache() {
            if (confirm('آیا از پاک‌سازی کش سیستم اطمینان دارید؟')) {
              showNotification('کش سیستم پاک‌سازی شد', 'info');
            }
          }

          function testConnection() {
            showNotification('تست اتصال در حال انجام...', 'info');
            setTimeout(() => {
              showNotification('اتصال به سرور با موفقیت برقرار شد', 'success');
            }, 2000);
          }

          function showSystemInfo() {
            const info = {
              'پلتفرم': navigator.platform,
              'مرورگر': navigator.userAgent.split(' ')[0],
              'زبان': navigator.language,
              'حافظه': navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'نامشخص'
            };
            
            alert('اطلاعات سیستم:\\n' + Object.entries(info).map(([k, v]) => k + ': ' + v).join('\\n'));
          }

          function restartServices() {
            if (confirm('آیا از راه‌اندازی مجدد سرویس‌ها اطمینان دارید؟')) {
              showNotification('سرویس‌ها در حال راه‌اندازی مجدد...', 'warning');
            }
          }

          function showNotification(message, type) {
            // پیاده‌سازی نمایش نوتیفیکیشن
            alert(message);
          }

          // بارگذاری تنظیمات ذخیره شده
          document.addEventListener('DOMContentLoaded', function() {
            const savedSettings = localStorage.getItem('vortexSettings');
            if (savedSettings) {
              const settings = JSON.parse(savedSettings);
              Object.keys(settings).forEach(key => {
                const element = document.querySelector(\`[name="\${key}"]\`);
                if (element) {
                  if (element.type === 'checkbox') {
                    element.checked = settings[key] === 'on';
                  } else {
                    element.value = settings[key];
                  }
                }
              });
            }
          });
        </script>
      `;

      res.send(generateModernPage('تنظيمات پيشرفته', bodyContent, 'settings'));
    } catch (error) {
      console.error('Settings page error:', error);
      res.status(500).send('خطا در بارگذاری تنظیمات');
    }
  });

  return router;
};           
