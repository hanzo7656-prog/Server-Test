const express = require('express');
const router = express.Router();

// ==================== 🎨 سیستم ناوبری شیشه‌ای ====================

function generateGlassNavigation(currentPage = 'home') {
    const navItems = [
        { id: 'home', icon: '🏠', label: 'Home', page: '/' },
        { id: 'scan', icon: '🔍', label: 'Scan', page: '/scan' },
        { id: 'ai', icon: '🤖', label: 'AI', page: '/ai-dashboard' },
        { id: 'settings', icon: '⚙️', label: 'Settings', page: '/settings' },
        { id: 'analysis', icon: '📊', label: 'Analysis', page: '/analysis' },
        { id: 'market', icon: '📈', label: 'Market', page: '/market' },
        { id: 'api', icon: '🔌', label: 'API Data', page: '/api-data' },
        { id: 'health', icon: '❤️', label: 'Health', page: '/health' },
        { id: 'news', icon: '📰', label: 'News', page: '/crypto-news' },
        { id: 'timeframes', icon: '⏰', label: 'Timeframes', page: '/timeframes' },
        { id: 'currencies', icon: '💰', label: 'Currencies', page: '/currencies' },
        { id: 'insights', icon: '🌈', label: 'Insights', page: '/insights' }
    ];

    return `
        <!-- ناوبری شیشه‌ای شناور -->
        <div id="glassNav" class="glass-navigation">
            <!-- دکمه شناور اولیه -->
            <div class="nav-floater" onclick="toggleGlassNav()">
                <div class="nav-icon">🍔</div>
            </div>
            
            <!-- نوار ناوبری اصلی -->
            <div class="nav-container">
                <div class="nav-scroll" id="navScroll">
                    ${navItems.map(item => `
                        <div class="nav-item ${item.id === currentPage ? 'active' : ''}" 
                             onclick="navigateTo('${item.page}')">
                            <div class="nav-icon-square">${item.icon}</div>
                            <span class="nav-label">${item.label}</span>
                        </div>
                    `).join('')}
                </div>
                
                <!-- نشانگر اسکرول -->
                <div class="scroll-indicator">
                    <div class="scroll-dot active"></div>
                    <div class="scroll-dot"></div>
                    <div class="scroll-dot"></div>
                </div>
            </div>
        </div>

        <style>
            /* 🎨 استایل ناوبری شیشه‌ای */
            .glass-navigation {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            /* دکمه شناور اولیه */
            .nav-floater {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.25);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
                transition: all 0.3s ease;
            }

            .nav-floater:hover {
                transform: scale(1.1);
                background: rgba(255, 255, 255, 0.35);
            }

            /* نوار ناوبری اصلی */
            .nav-container {
                display: none;
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(25px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 25px;
                padding: 15px;
                margin-bottom: 10px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            }

            .glass-navigation.expanded .nav-container {
                display: block;
                animation: slideUp 0.4s ease;
            }

            .glass-navigation.expanded .nav-floater {
                transform: scale(0.9);
                opacity: 0.7;
            }

            /* اسکرول ناوبری */
            .nav-scroll {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
                width: 320px;
                overflow-x: auto;
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
                padding: 12px 8px;
                border-radius: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 70px;
            }

            .nav-item:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }

            .nav-item.active {
                background: rgba(102, 126, 234, 0.3);
                border: 1px solid rgba(102, 126, 234, 0.5);
            }

            /* آیکون مربعی */
            .nav-icon-square {
                width: 45px;
                height: 45px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.4rem;
                margin-bottom: 6px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }

            .nav-label {
                font-size: 0.7rem;
                font-weight: 600;
                color: white;
                text-align: center;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }

            /* نشانگر اسکرول */
            .scroll-indicator {
                display: flex;
                justify-content: center;
                gap: 6px;
                margin-top: 12px;
            }

            .scroll-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transition: all 0.3s ease;
            }

            .scroll-dot.active {
                background: rgba(255, 255, 255, 0.9);
                transform: scale(1.2);
            }

            /* انیمیشن‌ها */
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* ریسپانسیو */
            @media (max-width: 400px) {
                .nav-scroll {
                    width: 280px;
                    grid-template-columns: repeat(4, 1fr);
                }
                
                .nav-item {
                    min-width: 60px;
                    padding: 10px 6px;
                }
                
                .nav-icon-square {
                    width: 40px;
                    height: 40px;
                    font-size: 1.2rem;
                }
            }
        </style>

        <script>
            let currentScrollPage = 0;
            const scrollPages = 3; // 12 آیتم / 4 در هر صفحه = 3 صفحه

            function toggleGlassNav() {
                const nav = document.getElementById('glassNav');
                nav.classList.toggle('expanded');
                
                if (nav.classList.contains('expanded')) {
                    updateScrollIndicator();
                }
            }

            function navigateTo(page) {
                window.location.href = page;
            }

            function updateScrollIndicator() {
                const dots = document.querySelectorAll('.scroll-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentScrollPage);
                });
            }

            // هندل اسکرول برای موبایل
            document.addEventListener('DOMContentLoaded', function() {
                const navScroll = document.getElementById('navScroll');
                if (navScroll) {
                    navScroll.addEventListener('scroll', function() {
                        const scrollPos = this.scrollLeft;
                        const pageWidth = this.scrollWidth / scrollPages;
                        currentScrollPage = Math.round(scrollPos / pageWidth);
                        updateScrollIndicator();
                    });
                }
            });

            // سوایپ برای موبایل
            let touchStartX = 0;
            document.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            });

            document.addEventListener('touchend', e => {
                const touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                
                if (Math.abs(diff) > 50) { // حداقل سوایپ 50px
                    const navScroll = document.getElementById('navScroll');
                    if (navScroll) {
                        const scrollAmount = navScroll.clientWidth;
                        if (diff > 0) {
                            // سوایپ به راست
                            navScroll.scrollLeft += scrollAmount;
                        } else {
                            // سوایپ به چپ
                            navScroll.scrollLeft -= scrollAmount;
                        }
                    }
                }
            });
        </script>
    `;
}

// ==================== 📱 تابع تولید صفحه مدرن ====================

function generateModernPage(title, bodyContent, currentPage = 'home') {
    const baseStyles = `
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
            padding-bottom: 120px; /* فضا برای ناوبری */
        }

        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 30px 20px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header h1 {
            font-size: 2.2rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        /* کارت‌های شیشه‌ای */
        .glass-card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
            transition: all 0.3s ease;
        }

        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(31, 38, 135, 0.2);
        }
    `;

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title} - VortexAI Pro</title>
            <style>${baseStyles}</style>
        </head>
        <body>
            <div class="container">
                ${bodyContent}
            </div>
            
            ${generateGlassNavigation(currentPage)}
        </body>
        </html>
    `;
}

// ==================== 🏠 صفحه اصلی مدرن ====================

module.exports = ({ gistManager, wsManager, apiClient }) => {
    
    router.get("/", (req, res) => {
        const wsStatus = wsManager.getConnectionStatus();
        const gistData = gistManager.getAllData();
        
        const bodyContent = `
            <div class="header">
                <h1>🚀 VortexAI Pro</h1>
                <p>Advanced Cryptocurrency Scanner with AI Analysis</p>
            </div>

            <div class="glass-card">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">📊 System Status</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">${wsStatus.connected ? '🟢' : '🔴'}</div>
                        <div style="font-weight: bold; color: #2c3e50;">WebSocket</div>
                        <div style="color: #7f8c8d; font-size: 0.9rem;">${wsStatus.active_coins} coins</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">💾</div>
                        <div style="font-weight: bold; color: #2c3e50;">Storage</div>
                        <div style="color: #7f8c8d; font-size: 0.9rem;">${Object.keys(gistData.prices || {}).length} pairs</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">🤖</div>
                        <div style="font-weight: bold; color: #2c3e50;">AI Engine</div>
                        <div style="color: #7f8c8d; font-size: 0.9rem;">Ready</div>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">📈 Quick Stats</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div style="text-align: center; padding: 15px; background: rgba(102, 126, 234, 0.1); border-radius: 12px;">
                        <div style="font-size: 1.8rem; font-weight: bold; color: #667eea;">17</div>
                        <div style="color: #7f8c8d; font-size: 0.8rem;">Today Scans</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); border-radius: 12px;">
                        <div style="font-size: 1.8rem; font-weight: bold; color: #27ae60;">97%</div>
                        <div style="color: #7f8c8d; font-size: 0.8rem;">Accuracy</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); border-radius: 12px;">
                        <div style="font-size: 1.8rem; font-weight: bold; color: #3498db;">230</div>
                        <div style="color: #7f8c8d; font-size: 0.8rem;">Saved Scans</div>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px; color: rgba(255, 255, 255, 0.8);">
                <small>Last scan: ${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</small>
            </div>
        `;
        
        res.send(generateModernPage('VortexAI Pro Dashboard', bodyContent, 'home'));
    });

    return router;
};
