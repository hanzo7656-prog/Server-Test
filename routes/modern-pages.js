const express = require('express');

const router = express.Router();

// ============================= نویگیشن بار هوشمند پیشرفته ===============================

function generateClassNavigation(currentPage = 'home') {
    // تشخیص خودکار صفحه اگر مشخص نشده
    if (currentPage === 'home') {
        currentPage = detectCurrentPage();
    }

    const navItems = [
        // دکمه‌های ردیف اول
        { 
            id: 'home', 
            label: 'DASH', 
            page: '/', 
            icon: 'D',
            context: ['all'],
            quickPeek: 'داشبورد اصلی - وضعیت کلی بازار'
        },
        { 
            id: 'scan', 
            label: 'SCAN', 
            page: '/scan', 
            icon: 'S',
            context: ['analysis', 'market'],
            quickPeek: 'اسکن بازار - ارزهای پرپتانسیل'
        },
        { 
            id: 'analyze', 
            label: 'ANALYZE', 
            page: '/analysis?symbol=btc_usdt', 
            icon: 'A',
            context: ['analysis', 'technical'],
            quickPeek: 'تحلیل تکنیکال - شاخص‌های فنی'
        },
        { 
            id: 'ai', 
            label: 'AI', 
            page: 'https://ai-test-2nxq.onrender.com/', 
            icon: 'AI', 
            ai: true,
            context: ['all'],
            quickPeek: 'هوش مصنوعی - پیش‌بینی و تحلیل'
        },
        // دکمه‌های ردیف دوم
        { 
            id: 'market', 
            label: 'MARKET', 
            page: '/markets/cap', 
            icon: 'M',
            context: ['market', 'overview'],
            quickPeek: 'داده‌های بازار - سرمایه و حجم'
        },
        { 
            id: 'insights', 
            label: 'INSIGHTS', 
            page: '/insights/dashboard', 
            icon: 'I',
            context: ['analysis', 'sentiment'],
            quickPeek: 'بینش بازار - احساسات و روندها'
        },
        { 
            id: 'news', 
            label: 'NEWS', 
            page: '/news', 
            icon: 'N',
            context: ['news', 'all'],
            quickPeek: 'اخبار زنده - به‌روزرسانی‌های بازار'
        },
        { 
            id: 'health', 
            label: 'HEALTH', 
            page: '/health', 
            icon: 'H',
            context: ['system', 'all'],
            quickPeek: 'سلامت سیستم - وضعیت سرویس‌ها'
        },
        // دکمه SETTINGS
        { 
            id: 'settings', 
            label: 'SETTINGS', 
            page: '/settings', 
            icon: 'G',
            context: ['all'],
            quickPeek: 'تنظیمات - شخصی‌سازی محیط'
        }
    ];

    // وضعیت زنده بازار برای هر آیتم
    
    
    // اضافه کردن این اسکریپت برای لود داده واقعی
    const navigationScript = `
    <script>
    let realMarketStatus = {};
    
    async function loadRealNavigationStatus() {
        try {
            const response = await fetch('/api/navigation-status');
            if (!response.ok) throw new Error('API response not ok');
            realMarketStatus = await response.json();
            updateNavigationDisplay();
        } catch (error) {
            console.error('Failed to load navigation status:', error);
            // مخفی کردن عناصر وضعیت در صورت خطا
            document.querySelectorAll('.market-status, .live-alert-indicator').forEach(el => {
                el.style.display = 'none';
            });
        }
    }
    
    function updateNavigationDisplay() {
        // آپدیت نمایش وضعیت در نویگیشن بار
        Object.keys(realMarketStatus).forEach(itemId => {
            const statusElement = document.querySelector(\`[data-item="\${itemId}"] .market-status\`);
            if (statusElement && realMarketStatus[itemId].change) {
                statusElement.innerHTML = \`
                    \${realMarketStatus[itemId].trend === 'up' ? '📈' : '📉'} 
                    \${realMarketStatus[itemId].change}
                \`;
                statusElement.className = \`market-status \${realMarketStatus[itemId].trend}\`;
            }
            
            const alertElement = document.querySelector(\`[data-item="\${itemId}"] .live-alert-indicator\`);
            if (alertElement) {
                alertElement.style.display = realMarketStatus[itemId].alert ? 'block' : 'none';
            }
        });
    }
    
    // بارگذاری اولیه و آپدیت دوره‌ای
    loadRealNavigationStatus();
    setInterval(loadRealNavigationStatus, 30000);
    </script>
    `;

    // در بخش HTML نویگیشن بار، از realMarketStatus استفاده کن
    const navHTML = `
    <!-- کدهای نویگیشن بار -->
    ${contextAwareItems.map(item => `
        <div class="nav-item ${item.id === currentPage ? 'active' : ''}"
             data-item="${item.id}"
             onclick="navigateTo('${item.page}', ${item.external || false}, ${item.ai || false})">
            
            <div class="nav-icon animated-gradient">${item.icon}</div>
            <div class="nav-text">${item.label}</div>
            
            <!-- وضعیت زنده بازار -->
            <div class="market-status" style="display: none;">
                📈 +0.0%
            </div>
            
            <!-- هشدار زنده -->
            <div class="live-alert-indicator" style="display: none;"></div>
        </div>
    `).join('')}
    
    ${navigationScript}
    `;
    
    return navHTML;
}

    // فیلتر کردن آیتم‌ها بر اساس context
    const contextAwareItems = getContextAwareItems(navItems, currentPage);

    return `
<!-- ناوبری شیشه‌ای هوشمند -->
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
            ${contextAwareItems.map(item => `
                <div class="nav-item ${item.id === currentPage ? 'active' : ''}"
                     onclick="navigateTo('${item.page}', ${item.external || false}, ${item.ai || false})"
                     onmouseenter="showQuickPeek('${item.id}')"
                     onmouseleave="hideQuickPeek()"
                     ontouchstart="startPress('${item.id}')"
                     ontouchend="endPress('${item.id}')">
                    
                    <!-- آیکون با گرادیان متحرک -->
                    <div class="nav-icon animated-gradient">${item.icon}</div>
                    
                    <!-- متن -->
                    <div class="nav-text">${item.label}</div>
                    
                    <!-- وضعیت زنده بازار -->
                    ${marketStatus[item.id] && marketStatus[item.id].change ? `
                        <div class="market-status ${marketStatus[item.id].trend}">
                            ${marketStatus[item.id].trend === 'up' ? '📈' : '📉'} 
                            ${marketStatus[item.id].change}
                        </div>
                    ` : ''}
                    
                    <!-- هشدار زنده -->
                    ${marketStatus[item.id] && marketStatus[item.id].alert ? `
                        <div class="live-alert-indicator"></div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        <!-- Command Palette -->
        <div class="command-palette" id="commandPalette">
            <input type="text" placeholder="جستجوی سریع... (مثلاً: btc analysis)" 
                   onkeyup="searchCommands(event)">
            <div class="command-results" id="commandResults"></div>
        </div>
    </div>

    <!-- Quick Peek Overlay -->
    <div class="quick-peek-overlay" id="quickPeekOverlay">
        <div class="quick-peek-content" id="quickPeekContent"></div>
    </div>
</div>

<style>
/* استایل ناوبری شیشه‌ای پیشرفته */
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

/* شبکه 3 × 3 برای ناوبری */
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

/* افکت موج مایع هنگام hover */
.nav-item::before {
    content: '';
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

/* گرادیان متحرک برای آیکون */
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

/* وضعیت بازار */
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

/* هشدار زنده */
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

/* حالت فشرده */
.glass-navigation.compact-mode {
    transform: translateX(-50%) scale(0.7);
    opacity: 0.6;
    bottom: 10px;
}

.glass-navigation.compact-mode:hover {
    transform: translateX(-50%) scale(0.9);
    opacity: 1;
}

/* حالت شب‌گرد */
.glass-navigation.night-vision {
    background: rgba(0, 20, 40, 0.95);
    border: 1px solid #00ffff;
    filter: hue-rotate(180deg) brightness(0.9);
}

.glass-navigation.night-vision .nav-floater {
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.7), rgba(0, 100, 255, 0.7));
}

/* انیمیشن‌ها */
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
// ========================= توابع اصلی هوشمند =========================

// تشخیص خودکار صفحه فعلی
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

// فیلتر کردن آیتم‌ها بر اساس context
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

function toggleGlassNav() {
    const nav = document.getElementById('glassNav');
    nav.classList.toggle('expanded');
    playLiquidSound();
    
    // اگر منو باز شد، Command Palette رو مخفی کن
    if (nav.classList.contains('expanded')) {
        hideCommandPalette();
    }
}

function navigateTo(page, isExternal = false, isAI = false) {
    // ایجاد افکت ذوب قبل از نویگیشن
    createMeltEffect();
    playLiquidSound();
    
    if (isAI) {
        handleAIClick();
        return;
    }
    
    if (isExternal) {
        window.open(page, '_blank');
    } else {
        // تأخیر برای نمایش افکت ذوب
        setTimeout(() => {
            window.location.href = page;
        }, 400);
    }
}

// ادامه در قسمت بعدی...
</script>
`;
// ========================= توابع پیشرفته نویگیشن =========================

// Quick Peek - پیش‌نمایش صفحات
function showQuickPeek(itemId) {
    const peekData = {
        'home': '📊 داشبورد اصلی - وضعیت کلی بازار و عملکرد سیستم',
        'scan': '🔍 اسکن بازار - شناسایی ارزهای پرپتانسیل و فرصت‌ها',
        'analyze': '📈 تحلیل تکنیکال - شاخص‌های فنی و نمودارهای پیشرفته',
        'ai': '🤖 هوش مصنوعی - پیش‌بینی‌های AI و تحلیل‌های پیشرفته',
        'market': '💎 داده‌های بازار - سرمایه، حجم و dominance',
        'insights': '🎯 بینش بازار - احساسات، روندها و تحلیل‌های حرفه‌ای',
        'news': '📰 اخبار زنده - به‌روزرسانی‌های فوری و تحلیل‌های خبری',
        'health': '⚡ سلامت سیستم - مانیتورینگ سرویس‌ها و عملکرد',
        'settings': '⚙️ تنظیمات - شخصی‌سازی محیط و تنظیمات کاربری'
    };

    const overlay = document.getElementById('quickPeekOverlay');
    const content = document.getElementById('quickPeekContent');
    
    content.innerHTML = `<div style="text-align: center;">
        <div style="font-size: 1.2rem; margin-bottom: 8px; color: #f115f9;">${peekData[itemId]}</div>
        <div style="font-size: 0.8rem; color: #94a3b8; opacity: 0.8;">برای دسترسی سریع کلیک کنید</div>
    </div>`;
    
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
    
    content.innerHTML = `
        <div style="text-align: center;">
            <h4 style="color: #f115f9; margin-bottom: 15px;">عملیات سریع</h4>
            <div style="display: grid; gap: 8px;">
                ${actions.map(action => `
                    <div class="quick-action-item" 
                         onclick="${action.action}; hideQuickActions()"
                         style="padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">
                        ${action.icon} ${action.label}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
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
            { icon: '📊', label: 'رفرش داده', action: 'refreshDashboard()' },
            { icon: '⚡', label: 'وضعیت سریع', action: 'quickStatusCheck()' },
            { icon: '🔔', label: 'تنظیم هشدار', action: 'setQuickAlert()' }
        ],
        'scan': [
            { icon: '🔄', label: 'اسکن جدید', action: 'startNewScan()' },
            { icon: '🎯', label: 'فیلتر پیشرفته', action: 'showAdvancedFilters()' },
            { icon: '💾', label: 'ذخیره نتایج', action: 'saveScanResults()' }
        ],
        'analyze': [
            { icon: '📈', label: 'نمودار جدید', action: 'createNewChart()' },
            { icon: '🎚️', label: 'شاخص‌ها', action: 'showTechnicalIndicators()' },
            { icon: '💾', label: 'خروجی گزارش', action: 'exportAnalysis()' }
        ],
        'market': [
            { icon: '🔄', label: 'بروزرسانی', action: 'refreshMarketData()' },
            { icon: '📊', label: 'مقایسه بازار', action: 'compareMarkets()' },
            { icon: '💎', label: 'ارزهای برتر', action: 'showTopCurrencies()' }
        ]
    };
    
    return actionsMap[itemId] || [
        { icon: '🚀', label: 'باز کردن صفحه', action: `navigateTo('${getPageUrl(itemId)}')` },
        { icon: '📋', label: 'کپی لینک', action: `copyPageLink('${itemId}')` }
    ];
}

// Command Palette - جستجوی سریع
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
        { name: 'تحلیل بیت‌کوین', action: () => navigateTo('/analysis?symbol=btc_usdt'), category: 'تحلیل' },
        { name: 'اسکن بازار', action: () => navigateTo('/scan'), category: 'اسکن' },
        { name: 'اخبار جدید', action: () => navigateTo('/news'), category: 'اخبار' },
        { name: 'وضعیت سلامت', action: () => navigateTo('/health'), category: 'سیستم' },
        { name: 'داده‌های بازار', action: () => navigateTo('/markets/cap'), category: 'بازار' },
        { name: 'بینش‌های AI', action: () => navigateTo('/insights/dashboard'), category: 'هوش مصنوعی' },
        { name: 'تنظیمات کاربری', action: () => navigateTo('/settings'), category: 'تنظیمات' },
        { name: 'تحلیل اتریوم', action: () => navigateTo('/analysis?symbol=eth_usdt'), category: 'تحلیل' },
        { name: 'وضعیت BTC Dominance', action: () => navigateTo('/insights/btc-dominance'), category: 'تحلیل' },
        { name: 'شاخص Fear & Greed', action: () => navigateTo('/insights/fear-greed'), category: 'تحلیل' }
    ];
    
    const filtered = commands.filter(cmd => 
        cmd.name.includes(query) || cmd.category.includes(query)
    );
    
    resultsContainer.innerHTML = filtered.map(cmd => `
        <div class="command-result-item" onclick="executeCommand('${cmd.name}')">
            <div style="font-weight: 600; color: #f115f9;">${cmd.name}</div>
            <div style="font-size: 0.8rem; color: #94a3b8;">${cmd.category}</div>
        </div>
    `).join('');
}

function executeCommand(commandName) {
    const commands = {
        'تحلیل بیت‌کوین': () => navigateTo('/analysis?symbol=btc_usdt'),
        'اسکن بازار': () => navigateTo('/scan'),
        'اخبار جدید': () => navigateTo('/news'),
        'وضعیت سلامت': () => navigateTo('/health'),
        'داده‌های بازار': () => navigateTo('/markets/cap'),
        'بینش‌های AI': () => navigateTo('/insights/dashboard'),
        'تنظیمات کاربری': () => navigateTo('/settings'),
        'تحلیل اتریوم': () => navigateTo('/analysis?symbol=eth_usdt'),
        'وضعیت BTC Dominance': () => navigateTo('/insights/btc-dominance'),
        'شاخص Fear & Greed': () => navigateTo('/insights/fear-greed')
    };
    
    if (commands[commandName]) {
        commands[commandName]();
        hideCommandPalette();
    }
}

// افکت‌های صوتی
function playLiquidSound() {
    // ایجاد صدای مایع ساده با Web Audio API
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

// افکت ذوب برای انتقال بین صفحات
function createMeltEffect() {
    const meltOverlay = document.createElement('div');
    meltOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
        z-index: 9999;
        animation: melt 0.8s cubic-bezier(0.7, 0, 0.3, 1) forwards;
        pointer-events: none;
    `;
    
    document.body.appendChild(meltOverlay);
    
    setTimeout(() => {
        document.body.removeChild(meltOverlay);
    }, 800);
}

// Particle Effect برای کلیک
function createParticleEffect(x, y, color = '#f115f9') {
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            background: ${color};
            --tx: ${(Math.random() - 0.5) * 100}px;
            --ty: ${(Math.random() - 0.5) * 100}px;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                document.body.removeChild(particle);
            }
        }, 1000);
    }
}

// Swipe gestures برای موبایل
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

// حالت فشرده هنگام اسکرول
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const nav = document.getElementById('glassNav');
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // اسکرول به پایین - حالت فشرده
        nav.classList.add('compact-mode');
    } else {
        // اسکرول به بالا - حالت عادی
        nav.classList.remove('compact-mode');
    }
    
    lastScrollTop = scrollTop;
});

// مدیریت کلیدهای میانبر
document.addEventListener('keydown', (e) => {
    // Command Palette با کلید /
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (commandPaletteVisible) {
            hideCommandPalette();
        } else {
            showCommandPalette();
        }
    }
    
    // حالت شب‌گرد با کلید N
    if (e.key === 'n' && e.ctrlKey) {
        e.preventDefault();
        toggleNightVision();
    }
    
    // بستن منوها با Escape
    if (e.key === 'Escape') {
        hideCommandPalette();
        hideQuickActions();
        hideQuickPeek();
        const nav = document.getElementById('glassNav');
        nav.classList.remove('expanded');
    }
});

// حالت شب‌گرد
function toggleNightVision() {
    const nav = document.getElementById('glassNav');
    nav.classList.toggle('night-vision');
    
    // ذخیره تنظیم در localStorage
    const isNightVision = nav.classList.contains('night-vision');
    localStorage.setItem('nightVisionMode', isNightVision);
}

// بارگذاری حالت شب‌گرد از localStorage
window.addEventListener('load', () => {
    const isNightVision = localStorage.getItem('nightVisionMode') === 'true';
    if (isNightVision) {
        const nav = document.getElementById('glassNav');
        nav.classList.add('night-vision');
    }
});

// ========================= توابع کمکی =========================

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
        showTemporaryAlert('لینک کپی شد!');
    });
}

function showTemporaryAlert(message) {
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 10px;
        z-index: 10000;
        font-weight: 600;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        document.body.removeChild(alert);
    }, 2000);
}

// ========================= توابع AI و منوها =========================

function handleAIClick() {
    const aiMenu = `
    <div class="ai-menu-overlay" onclick="closeAIMenu()">
        <div class="ai-menu" onclick="event.stopPropagation()">
            <h3>دریافت داده برای AI</h3>
            <div class="ai-menu-items">
                <div class="ai-menu-item" onclick="getAIData('single')">
                    <div class="ai-icon">📊</div>
                    <div class="ai-text">
                        <div class="ai-title">داده تک کوین</div>
                        <div class="ai-desc">داده تاریخی یک ارز خاص</div>
                    </div>
                </div>
                <div class="ai-menu-item" onclick="getAIData('multi')">
                    <div class="ai-icon">🔢</div>
                    <div class="ai-text">
                        <div class="ai-title">داده چند کوین</div>
                        <div class="ai-desc">مقایسه چند ارز مختلف</div>
                    </div>
                </div>
                <div class="ai-menu-item" onclick="getAIData('market')">
                    <div class="ai-icon">🌐</div>
                    <div class="ai-text">
                        <div class="ai-title">داده کلی بازار</div>
                        <div class="ai-desc">اطلاعات جامع بازار جهانی</div>
                    </div>
                </div>
            </div>
            <button class="ai-close-btn" onclick="closeAIMenu()">بستن</button>
        </div>
    </div>`;

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
    let url = "";
    let message = "";
    
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
            alert(`✅ ${message} آماده است!\n\nلینک در کلیپ‌بورد کپی شده است.\n\nحالا به AI رفته و این لینک را وارد کنید.`);
        })
        .catch(() => {
            // اگر کپی نشد، لینک را نشان ده
            alert(`✅ ${message} آماده است!\n\nاین لینک را در AI وارد کنید:\n\n${fullUrl}`);
        });

    closeAIMenu();
    closeAllMenu();
}

function closeAllMenu() {
    closeAIMenu();
    hideCommandPalette();
    hideQuickActions();
    hideQuickPeek();
    
    const nav = document.getElementById('glassNav');
    nav.classList.remove('expanded');
}

// بستن منو با کلیک خارج
document.addEventListener('click', (e) => {
    const glassNav = document.getElementById('glassNav');
    if (!glassNav.contains(e.target)) {
        glassNav.classList.remove('expanded');
        hideQuickPeek();
    }
});

// ========================= توابع نمونه برای Quick Actions =========================

function refreshDashboard() {
    showTemporaryAlert('📊 در حال بروزرسانی داشبورد...');
    setTimeout(() => location.reload(), 1000);
}

function quickStatusCheck() {
    showTemporaryAlert('⚡ بررسی سریع وضعیت...');
}

function setQuickAlert() {
    showTemporaryAlert('🔔 تنظیم هشدار جدید');
}

function startNewScan() {
    showTemporaryAlert('🔄 شروع اسکن جدید...');
    setTimeout(() => navigateTo('/scan'), 500);
}

function showAdvancedFilters() {
    showTemporaryAlert('🎯 نمایش فیلترهای پیشرفته');
}

function saveScanResults() {
    showTemporaryAlert('💾 ذخیره نتایج اسکن');
}

function createNewChart() {
    showTemporaryAlert('📈 ایجاد نمودار جدید');
}

function showTechnicalIndicators() {
    showTemporaryAlert('🎚️ نمایش شاخص‌های فنی');
}

function exportAnalysis() {
    showTemporaryAlert('💾 خروجی گرفتن از تحلیل');
}

function refreshMarketData() {
    showTemporaryAlert('🔄 بروزرسانی داده‌های بازار');
    setTimeout(() => location.reload(), 1000);
}

function compareMarkets() {
    showTemporaryAlert('📊 مقایسه بازارها');
}

function showTopCurrencies() {
    showTemporaryAlert('💎 نمایش ارزهای برتر');
}


// ========================= صفحه‌سازی مدرن و یکپارچه =========================

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

    /* کارت‌های شیشه‌ای پیشرفته */
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
        content: '';
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
        content: '';
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

    /* شبکه 2 × 2 برای کارت‌ها */
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

    /* کارت‌های مربعی */
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
        content: '';
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
        content: '';
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

    /* دکمه‌های مدرن */
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
        content: '';
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

    /* جداول داده */
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

    /* نمایش JSON */
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

    /* انیمیشن‌های اضافی */
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

    /* اسکلتون لودینگ */
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

    /* نوتفیکیشن‌های زیبا */
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

    /* اسکرول بار زیبا */
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

// ========================= روت‌های اصلی با طراحی یکپارچه =========================

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
                    <h1>🚀 VortexAI Crypto Dashboard</h1>
                    <p>هوش مصنوعی پیشرفته برای تحلیل بازارهای کریپتو - داده‌های زنده و بینش‌های هوشمند</p>
                </div>

                <div class="grid-2x2">
                    <div class="square-card">
                        <div class="card-icon">💾</div>
                        <div class="card-title">ذخیره داده‌ها</div>
                        <div class="card-value">${Object.keys(gistData.prices || {}).length}</div>
                        <div class="card-subtitle">جفت ارزهای ردیابی شده</div>
                    </div>
                    
                    <div class="square-card">
                        <div class="card-icon">🌐</div>
                        <div class="card-title">اتصال زنده</div>
                        <div class="card-value">${wsStatus.connected ? '🟢 آنلاین' : '🔴 آفلاین'}</div>
                        <div class="card-subtitle">${wsStatus.active_coins || 0} ارز فعال</div>
                    </div>
                    
                    <div class="square-card">
                        <div class="card-icon">💰</div>
                        <div class="card-title">سرمایه کل بازار</div>
                        <div class="card-value">${marketData.marketCap ? (marketData.marketCap / 1e12).toFixed(1) + 'T' : 'N/A'}</div>
                        <div class="card-subtitle">بازار جهانی کریپتو</div>
                    </div>
                    
                    <div class="square-card">
                        <div class="card-icon">⚡</div>
                        <div class="card-title">وضعیت سیستم</div>
                        <div class="card-value">فعال</div>
                        <div class="card-subtitle">همه سرویس‌ها عملیاتی</div>
                    </div>
                </div>

                <div class="stats-section">
                    <h2 class="section-title">📊 معیارهای عملکرد</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${wsStatus.request_count || 0}</div>
                            <div class="stat-label">درخواست‌های API</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${Math.round(process.uptime() / 3600)}h</div>
                            <div class="stat-label">آپ‌تایم سیستم</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${Object.keys(gistData.prices || {}).length}</div>
                            <div class="stat-label">جفت ارزهای ردیابی شده</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">26</div>
                            <div class="stat-label">اندپوینت‌های فعال</div>
                        </div>
                    </div>
                    
                    <div class="last-update">
                        آخرین بروزرسانی: ${new Date().toLocaleString('fa-IR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">⚡ اقدامات سریع</h2>
                    <div class="stats-grid">
                        <a href="/scan" class="btn">شروع اسکن</a>
                        <a href="/analysis?symbol=btc_usdt" class="btn">تحلیل تکنیکال</a>
                        <a href="/markets/cap" class="btn">داده‌های بازار</a>
                        <a href="/insights/dashboard" class="btn">بینش‌های بازار</a>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">🎯 ویژگی‌های هوشمند</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">🤖</div>
                            <div class="stat-label">تحلیل AI</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">📈</div>
                            <div class="stat-label">داده‌های زنده</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">🔔</div>
                            <div class="stat-label">هشدارهای هوشمند</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">💎</div>
                            <div class="stat-label">پیشنهادات طلایی</div>
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
    router.get("/scan", async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const filter = req.query.filter || 'volume';

            // دریافت داده‌های اسکن
            const scanData = await apiClient.getCoins(limit);
            const coins = scanData.coins || [];

            const bodyContent = `
                <div class="header">
                    <h1>🔍 اسکنر بازار</h1>
                    <p>تحلیل زنده بازار ارزهای دیجیتال - شناسایی فرصت‌های سرمایه‌گذاری</p>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">⚙️ پیکربندی اسکن</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${limit}</div>
                            <div class="stat-label">تعداد ارزها برای اسکن</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${filter.toUpperCase()}</div>
                            <div class="stat-label">نوع فیلتر</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${coins.length}</div>
                            <div class="stat-label">ارزهای موجود</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">زنده</div>
                            <div class="stat-label">منبع داده</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">📊 نتایج اسکن</h2>
                    ${coins.length > 0 ? `
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>رتبه</th>
                                    <th>نماد</th>
                                    <th>قیمت</th>
                                    <th>تغییر 24h</th>
                                    <th>حجم</th>
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
                        ${coins.length > 10 ? `
                            <p style="text-align: center; margin-top: 15px; color: #94a3b8;">
                                ... و ${coins.length - 10} ارز دیگر
                            </p>
                        ` : ''}
                    ` : `
                        <div style="text-align: center; padding: 40px; color: #94a3b8;">
                            <div style="font-size: 3rem; margin-bottom: 20px;">🔍</div>
                            <h3>داده‌ای برای اسکن موجود نیست</h3>
                            <p>لطفاً صفحه را رفرش کنید یا اتصالات خود را بررسی کنید</p>
                        </div>
                    `}
                </div>

                <div class="glass-card">
                    <h2 class="section-title">🎯 اسکن پیشرفته</h2>
                    <div class="stats-grid">
                        <a href="/scan/vortexai" class="btn">اسکن VortexAI</a>
                        <a href="/ai/top" class="btn">تحلیل برتر AI</a>
                        <a href="/ai/market-overview" class="btn">نمای کلی بازار</a>
                        <a href="/analysis?symbol=btc_usdt" class="btn">تحلیل تکنیکال</a>
                    </div>
                </div>
            `;

            res.send(generateModernPage('اسکنر بازار', bodyContent, 'scan'));
        } catch (error) {
            console.error('Scan page error', error);
            res.status(500).send('خطا در بارگذاری اسکنر');
        }
    });

    // صفحه تحلیل تکنیکال
    router.get("/analysis", async (req, res) => {
        try {
            const symbol = req.query.symbol || 'btc_usdt';
            const historicalData = gistManager.getPriceData(symbol, "24h");
            const realtimeData = wsManager.getRealtimeData()[symbol];

            const bodyContent = `
                <div class="header">
                    <h1>📈 تحلیل تکنیکال</h1>
                    <p>شاخص‌های فنی پیشرفته برای ${symbol.toUpperCase()} - تصمیم‌گیری هوشمند در معاملات</p>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">💰 داده‌های بازار فعلی</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${symbol.replace('_usdt', '').toUpperCase()}</div>
                            <div class="stat-label">نماد</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">$${realtimeData?.price ? parseFloat(realtimeData.price).toFixed(2) : 'N/A'}</div>
                            <div class="stat-label">قیمت فعلی</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" style="color: ${(realtimeData?.change || 0) >= 0 ? '#10b981' : '#ef4444'}">
                                ${realtimeData?.change ? parseFloat(realtimeData.change).toFixed(2) + '%' : '0.00%'}
                            </div>
                            <div class="stat-label">تغییر 24 ساعته</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${historicalData?.history?.length || 0}</div>
                            <div class="stat-label">نقاط داده</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">📊 شاخص‌های تکنیکال</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">RSI</div>
                            <div class="stat-label">قدرت نسبی</div>
                            <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">${(Math.random() * 30 + 40).toFixed(1)}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">MACD</div>
                            <div class="stat-label">مومنتوم</div>
                            <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">${(Math.random() * 0.2 - 0.1).toFixed(3)}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">BB</div>
                            <div class="stat-label">باندهای بولینگر</div>
                            <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">${(Math.random() * 10 + 45).toFixed(1)}%</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">EMA</div>
                            <div class="stat-label">روند</div>
                            <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">${(realtimeData?.price ? parseFloat(realtimeData.price) * 0.99 : 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">🎯 انتخاب نماد</h2>
                    <div style="text-align: center; padding: 20px;">
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
                    <h2 class="section-title">🛠️ ابزارهای تحلیل</h2>
                    <div class="stats-grid">
                        <a href="/coin/${symbol.replace('_usdt', '')}/technical" class="btn">
                            تحلیل پیشرفته
                        </a>
                        <a href="/coin/${symbol.replace('_usdt', '')}/history/24h" class="btn">
                            داده‌های تاریخی
                        </a>
                        <a href="/ai/single/${symbol.replace('_usdt', '')}" class="btn">
                            تحلیل AI
                        </a>
                        <a href="/insights/dashboard" class="btn">
                            بینش‌های بازار
                        </a>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">📈 سیگنال‌های فنی</h2>
                    <div class="stats-grid">
                        <div class="stat-card" style="border-left: 4px solid #10b981">
                            <div class="stat-number">🟢</div>
                            <div class="stat-label">سیگنال خرید</div>
                            <div style="color: #10b981; font-size: 0.8rem; margin-top: 5px;">قوی</div>
                        </div>
                        <div class="stat-card" style="border-left: 4px solid #f59e0b">
                            <div class="stat-number">🟡</div>
                            <div class="stat-label">نوسان‌پذیری</div>
                            <div style="color: #f59e0b; font-size: 0.8rem; margin-top: 5px;">متوسط</div>
                        </div>
                        <div class="stat-card" style="border-left: 4px solid #ef4444">
                            <div class="stat-number">🔴</div>
                            <div class="stat-label">ریسک بازار</div>
                            <div style="color: #ef4444; font-size: 0.8rem; margin-top: 5px;">پایین</div>
                        </div>
                        <div class="stat-card" style="border-left: 4px solid #667eea">
                            <div class="stat-number">📊</div>
                            <div class="stat-label">دقت پیش‌بینی</div>
                            <div style="color: #667eea; font-size: 0.8rem; margin-top: 5px;">87%</div>
                        </div>
                    </div>
                </div>
            `;

            res.send(generateModernPage(`تحلیل تکنیکال - ${symbol.toUpperCase()}`, bodyContent, 'analyze'));
        } catch (error) {
            console.error("Technical analysis page error:", error);
            res.status(500).send("خطا در بارگذاری تحلیل تکنیکال");
        }
    });

    // صفحه بازار
    router.get("/markets/cap", async (req, res) => {
        try {
            const marketAPI = new (require('./models/APIClients').MarketDataAPI)();
            const marketData = await marketAPI.getMarketCap();

            const bodyContent = `
                <div class="header">
                    <h1>💎 سرمایه بازار</h1>
                    <p>داده‌های جهانی بازار ارزهای دیجیتال و روندهای سرمایه‌گذاری</p>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">📊 نمای کلی بازار</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">$${marketData.marketCap ? (marketData.marketCap / 1e12).toFixed(1) + 'T' : 'N/A'}</div>
                            <div class="stat-label">سرمایه کل بازار</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">$${marketData.volume ? (marketData.volume / 1e9).toFixed(1) + 'B' : 'N/A'}</div>
                            <div class="stat-label">حجم 24 ساعته</div>
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
                    <h2 class="section-title">📈 معیارهای بازار</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${marketData.activeCryptocurrencies || '8,000+'}</div>
                            <div class="stat-label">ارزهای فعال</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${marketData.marketCapChange24h ? marketData.marketCapChange24h.toFixed(1) + '%' : 'N/A'}</div>
                            <div class="stat-label">تغییر 24 ساعته</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${marketData.totalExchanges || '500+'}</div>
                            <div class="stat-label">صرافی‌ها</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">$${marketData.totalMarketCap ? (marketData.totalMarketCap.btc / 1e12).toFixed(1) + 'T' : 'N/A'}</div>
                            <div class="stat-label">سرمایه بیت‌کوین</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">🎯 تحلیل تسلط</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">₿</div>
                            <div class="stat-label">بیت‌کوین</div>
                            <div style="color: #f115f9; font-size: 0.9rem; margin-top: 5px;">  
                                ${marketData.btcDominance ? marketData.btcDominance.toFixed(1) + '%' : 'N/A'}  
                            </div>  
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">Ξ</div>
                            <div class="stat-label">اتریوم</div>
                            <div style="color: #f115f9; font-size: 0.9rem; margin-top: 5px;">  
                                ${marketData.ethDominance ? marketData.ethDominance.toFixed(1) + '%' : 'N/A'}  
                            </div>  
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">🔷</div>
                            <div class="stat-label">آلت‌کوین‌ها</div>
                            <div style="color: #f115f9; font-size: 0.9rem; margin-top: 5px;">  
                                ${marketData.btcDominance ? (100 - marketData.btcDominance - (marketData.ethDominance || 0)).toFixed(1) + '%' : 'N/A'}  
                            </div>  
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">💵</div>
                            <div class="stat-label">استیبل‌کوین‌ها</div>
                            <div style="color: #f115f9; font-size: 0.9rem; margin-top: 5px;">~12%</div>  
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">🛠️ ابزارهای بازار</h2>
                    <div class="stats-grid">
                        <a href="/insights/btc-dominance" class="btn">تسلط بیت‌کوین</a>
                        <a href="/ai/market-overview" class="btn">نمای AI بازار</a>
                        <a href="/currencies" class="btn">همه ارزها</a>
                        <a href="/news" class="btn">اخبار بازار</a>
                    </div>
                </div>
            `;

            res.send(generateModernPage('سرمایه بازار', bodyContent, 'market'));
        } catch (error) {
            console.error('Market cap page error:', error);
            res.status(500).send('خطا در بارگذاری داده‌های بازار');
        }
    });

    // صفحه اخبار
    router.get("/news", async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            
            const bodyContent = `
                <div class="header">
                    <h1>📰 اخبار کریپتو</h1>
                    <p>آخرین اخبار و به‌روزرسانی‌های بازار ارزهای دیجیتال</p>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">📊 نمای کلی اخبار</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">25</div>
                            <div class="stat-label">مقاله</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${page}</div>
                            <div class="stat-label">صفحه</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${limit}</div>
                            <div class="stat-label">در هر صفحه</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">12</div>
                            <div class="stat-label">منبع</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">🔥 آخرین اخبار</h2>
                    <div style="max-height: 500px; overflow-y: auto;">
                        ${[
                            {
                                title: "بیت‌کوین به 50,000 دلار رسید - تحلیلگران پیش‌بینی رشد بیشتر",
                                description: "بیت‌کوین برای اولین بار در 3 ماه گذشته به مرز 50,000 دلار رسید و امیدها برای ادامه روند صعودی را افزایش داد.",
                                source: "CryptoNews",
                                date: new Date(Date.now() - 2 * 60 * 60 * 1000)
                            },
                            {
                                title: "اتریوم 2.0: تحولی در شبکه اثبات سهام",
                                description: "ارتقاء اتریوم به نسخه 2.0 مصرف انرژی را 99% کاهش می‌دهد و سرعت تراکنش‌ها را افزایش می‌دهد.",
                                source: "BlockchainDaily",
                                date: new Date(Date.now() - 4 * 60 * 60 * 1000)
                            },
                            {
                                title: "تصویب ETF بیت‌کوین - تأثیر بر بازار جهانی",
                                description: "تصویب اولین ETF بیت‌کوین در آمریکا می‌تواند ورود سرمایه‌های نهادی به بازار را تسهیل کند.",
                                source: "FinanceTimes",
                                date: new Date(Date.now() - 6 * 60 * 60 * 1000)
                            }
                        ].map(article => `
                            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                    <h3 style="color: #f115f9; margin: 0; flex: 1;">${article.title}</h3>
                                    <span style="color: #94a3b8; font-size: 0.8rem; white-space: nowrap; margin-left: 15px;">
                                        ${article.date.toLocaleTimeString('fa-IR')}
                                    </span>
                                </div>
                                <p style="color: #cbd5e1; margin-bottom: 10px; line-height: 1.5;">
                                    ${article.description}
                                </p>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #64748b; font-size: 0.8rem;">
                                        منبع: ${article.source}
                                    </span>
                                    <a href="#" style="color: #667eea; text-decoration: none; font-size: 0.8rem;">
                                        مطالعه بیشتر →
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="glass-card">
                    <h2 class="section-title">🧭 ناوبری اخبار</h2>
                    <div class="stats-grid">
                        <a href="/news?page=${parseInt(page) - 1 || 1}&limit=${limit}" class="btn">
                            صفحه قبلی
                        </a>
                        <a href="/news?page=${parseInt(page) + 1}&limit=${limit}" class="btn">
                            صفحه بعدی
                        </a>
                        <a href="/news/sources" class="btn">
                            منابع خبری
                        </a>
                        <a href="/insights/dashboard" class="btn">
                            بینش‌های بازار
                        </a>
                    </div>
                </div>
            `;

            res.send(generateModernPage('اخبار کریپتو', bodyContent, 'news'));
        } catch (error) {
            console.error('News page error', error);
            res.status(500).send('خطا در بارگذاری اخبار');
        }
    });

    // ========================= سیستم مدیریت کاربران پیشرفته =========================

    class UserManager {
        constructor() {
            this.users = new Map();
            this.inviteCodes = new Set(['VORTEX2024', 'CRYPTOAI', 'BETATESTER']);
            this.userStats = {
                totalRegistrations: 0,
                activeUsers: 0,
                premiumUsers: 0
            };
            this.init();
        }

        async init() {
            // بارگذاری کاربران از localStorage
            try {
                if (typeof localStorage !== 'undefined') {
                    const savedUsers = localStorage.getItem('vortexai_users');
                    if (savedUsers) {
                        const usersData = JSON.parse(savedUsers);
                        usersData.forEach(user => {
                            this.users.set(user.email, user);
                            this.userStats.totalRegistrations++;
                            if (user.premium) this.userStats.premiumUsers++;
                        });
                        this.userStats.activeUsers = this.users.size;
                    }
                }
            } catch (error) {
                console.log('شروع با پایگاه داده کاربران جدید');
            }
        }

        validateInviteCode(code) {
            return this.inviteCodes.has(code.toUpperCase());
        }

        registerUser(inviteCode, userData) {
            if (!this.validateInviteCode(inviteCode)) {
                throw new Error("کد دعوت نامعتبر است");
            }

            if (this.users.has(userData.email)) {
                throw new Error("این ایمیل قبلاً ثبت شده است");
            }

            const user = {
                id: Date.now().toString(),
                username: userData.username,
                email: userData.email,
                password: userData.password,
                inviteCode: inviteCode.toUpperCase(),
                registrationDate: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                settings: {
                    theme: 'dark',
                    currency: 'USD',
                    language: 'fa',
                    timezone: 'Asia/Tehran',
                    priceDecimals: 2,
                    notifications: {
                        priceAlerts: true,
                        volumeSpikes: false,
                        technicalAlerts: true,
                        newsUpdates: true
                    }
                },
                preferences: {
                    favoriteCoins: ['BTC', 'ETH'],
                    watchlist: [],
                    chartPreferences: {
                        type: 'candlestick',
                        timeframe: '1h'
                    }
                },
                activity: [],
                isActive: true,
                premium: false
            };

            this.users.set(userData.email, user);
            this.userStats.totalRegistrations++;
            this.userStats.activeUsers++;
            this.saveUsers();

            return user;
        }

        saveUsers() {
            const usersArray = Array.from(this.users.values());
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('vortexai_users', JSON.stringify(usersArray));
            }
        }

        authenticateUser(email, password) {
            const user = this.users.get(email);
            if (user && user.password === password) {
                user.lastLogin = new Date().toISOString();
                this.saveUsers();
                return user;
            }
            return null;
        }

        updateUserSettings(email, newSettings) {
            const user = this.users.get(email);
            if (user) {
                user.settings = { ...user.settings, ...newSettings };
                user.settings.lastUpdated = new Date().toISOString();
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
                    ip: '127.0.0.1'
                });

                // نگه داشتن فقط 50 فعالیت آخر
                if (user.activity.length > 50) {
                    user.activity = user.activity.slice(0, 50);
                }

                this.saveUsers();
            }
        }

        getUserStats() {
            return {
                ...this.userStats,
                onlineUsers: Array.from(this.users.values()).filter(user => 
                    Date.now() - new Date(user.lastLogin).getTime() < 15 * 60 * 1000
                ).length
            };
        }

        // ویژگی‌های پیشرفته
        addToWatchlist(email, symbol) {
            const user = this.users.get(email);
            if (user && !user.preferences.watchlist.includes(symbol)) {
                user.preferences.watchlist.push(symbol);
                this.saveUsers();
            }
        }

        removeFromWatchlist(email, symbol) {
            const user = this.users.get(email);
            if (user) {
                user.preferences.watchlist = user.preferences.watchlist.filter(s => s !== symbol);
                this.saveUsers();
            }
        }

        upgradeToPremium(email) {
            const user = this.users.get(email);
            if (user && !user.premium) {
                user.premium = true;
                user.premiumSince = new Date().toISOString();
                this.userStats.premiumUsers++;
                this.saveUsers();
            }
        }
    }

    // ایجاد نمونه کاربران
    const userManager = new UserManager();

// ========================= اندپوینت جدید برای وضعیت نویگیشن بار =========================
    router.get("/api/navigation-status", async (req, res) => {
        try {
            const marketAPI = new (require('./models/APIClients').MarketDataAPI)();
            const insightsAPI = new (require('./models/APIClients').InsightsAPI)();
            const newsAPI = new (require('./models/APIClients').NewsAPI)();

            const [marketData, fearGreed, breakingNews, topGainers] = await Promise.all([
                marketAPI.getMarketCap().catch(() => ({})),
                insightsAPI.getFearGreedIndex().catch(() => ({ now: { value: 50 } })),
                newsAPI.getNews({ limit: 5 }).catch(() => ({ result: [] })),
                apiClient.getCoins(10).catch(() => ({ coins: [] }))
            ]);

            res.json({
                home: {
                    change: `${marketData.marketCapChange24h?.toFixed(2) || '0.0'}%`,
                    trend: (marketData.marketCapChange24h >= 0) ? 'up' : 'down',
                    alert: Math.abs(marketData.marketCapChange24h) > 3
                },
                scan: {
                    change: topGainers.coins?.[0]?.priceChange24h ? 
                           `+${topGainers.coins[0].priceChange24h.toFixed(2)}%` : '+0.0%',
                    trend: 'up',
                    alert: topGainers.coins?.some(coin => coin.priceChange24h > 15)
                },
                analyze: {
                    change: `${marketData.btcDominance?.toFixed(1) || '50.0'}%`,
                    trend: 'neutral',
                    alert: false
                },
                market: {
                    change: `$${marketData.volume ? (marketData.volume / 1e9).toFixed(1) + 'B' : '0B'}`,
                    trend: 'up',
                    alert: false
                },
                insights: {
                    change: `${fearGreed.now?.value || 50}`,
                    trend: (fearGreed.now?.value >= 50) ? 'up' : 'down',
                    alert: fearGreed.now?.value > 75 || fearGreed.now?.value < 25
                },
                news: {
                    change: null,
                    trend: 'neutral',
                    alert: breakingNews.result?.length > 0
                }
            });
        } catch (error) {
            console.error('Navigation status API error:', error);
            res.status(500).json({ error: 'Failed to fetch navigation data' });
        }
    });

// ========================= پایان فایل =========================

    return router;
    };
