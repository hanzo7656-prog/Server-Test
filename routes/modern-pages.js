const express = require('express');
const router = express.Router();

// ==================== 🎨 سیستم ناوبری شیشه‌ای ====================

function generateGlassNavigation(currentPage = 'home') {
    const navItems = [
        { id: 'home', icon: '📊', label: 'Dashboard', page: '/' },
        { id: 'scan', icon: '🔬', label: 'Scanner', page: '/scan' },
        { id: 'ai', icon: '🧠', label: 'AI Analysis', page: '/ai-dashboard' },
        { id: 'analysis', icon: '📈', label: 'Technical', page: '/analysis' },
        { id: 'market', icon: '💹', label: 'Market', page: '/market' },
        { id: 'api', icon: '🔗', label: 'API Data', page: '/api-data' },
        { id: 'health', icon: '❤️', label: 'Health', page: '/health' },
        { id: 'news', icon: '📰', label: 'News', page: '/crypto-news' },
        { id: 'timeframes', icon: '⏱️', label: 'Timeframes', page: '/timeframes' },
        { id: 'currencies', icon: '💎', label: 'Currencies', page: '/currencies' },
        { id: 'insights', icon: '🔮', label: 'Insights', page: '/insights' },
        { id: 'settings', icon: '⚙️', label: 'Settings', page: '/settings' }
    ];

    return `
        <!-- ناوبری شیشه‌ای شناور -->
        <div id="glassNav" class="glass-navigation">
            <!-- دکمه شناور مایع -->
            <div class="nav-floater" onclick="toggleGlassNav()">
                <div class="liquid-button">
                    <div class="liquid-drop"></div>
                    <div class="liquid-drop"></div>
                    <div class="liquid-drop"></div>
                </div>
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

            /* دکمه شناور مایع */
            .nav-floater {
                width: 65px;
                height: 65px;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
                backdrop-filter: blur(25px);
                border: 1px solid rgba(255, 255, 255, 0.4);
                border-radius: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
                transition: all 0.4s ease;
                position: relative;
                overflow: hidden;
            }

            .nav-floater:hover {
                transform: scale(1.1);
                box-shadow: 0 20px 45px rgba(102, 126, 234, 0.6);
            }

            .nav-floater::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                transition: 0.5s;
            }

            .nav-floater:hover::before {
                left: 100%;
            }

            /* انیمیشن مایع */
            .liquid-button {
                position: relative;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .liquid-drop {
                width: 6px;
                height: 6px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 50%;
                margin: 0 2px;
                animation: liquidBounce 1.5s infinite ease-in-out;
            }

            .liquid-drop:nth-child(1) { animation-delay: 0s; }
            .liquid-drop:nth-child(2) { animation-delay: 0.2s; }
            .liquid-drop:nth-child(3) { animation-delay: 0.4s; }

            @keyframes liquidBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }

            /* نوار ناوبری اصلی */
            .nav-container {
                display: none;
                background: rgba(255, 255, 255, 0.12);
                backdrop-filter: blur(30px);
                border: 1px solid rgba(255, 255, 255, 0.25);
                border-radius: 25px;
                padding: 18px;
                margin-bottom: 15px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            }

            .glass-navigation.expanded .nav-container {
                display: block;
                animation: slideUp 0.4s ease;
            }

            .glass-navigation.expanded .nav-floater {
                transform: scale(0.9) rotate(180deg);
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
            }

            /* اسکرول ناوبری */
            .nav-scroll {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 14px;
                width: 340px;
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
                padding: 14px 10px;
                border-radius: 18px;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 75px;
                background: rgba(255, 255, 255, 0.1);
            }

            .nav-item:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-3px);
            }

            .nav-item.active {
                background: rgba(102, 126, 234, 0.25);
                border: 1px solid rgba(102, 126, 234, 0.4);
            }

            /* آیکون مربعی */
            .nav-icon-square {
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                margin-bottom: 8px;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }

            .nav-item:hover .nav-icon-square {
                transform: scale(1.1);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .nav-label {
                font-size: 0.75rem;
                font-weight: 600;
                color: white;
                text-align: center;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            /* انیمیشن‌ها */
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            /* ریسپانسیو */
            @media (max-width: 400px) {
                .nav-scroll {
                    width: 300px;
                    grid-template-columns: repeat(4, 1fr);
                }
                
                .nav-item {
                    min-width: 65px;
                    padding: 12px 8px;
                }
                
                .nav-icon-square {
                    width: 42px;
                    height: 42px;
                    font-size: 1.3rem;
                }
                
                .nav-floater {
                    width: 60px;
                    height: 60px;
                }
            }
        </style>

        <script>
            function toggleGlassNav() {
                const nav = document.getElementById('glassNav');
                nav.classList.toggle('expanded');
            }

            function navigateTo(page) {
                window.location.href = page;
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
            color: #2c3e50;
            line-height: 1.6;
            padding-bottom: 120px;
        }

        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 25px 20px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
            font-size: 2.2rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
            font-weight: 700;
        }

        .header p {
            color: #7f8c8d;
            font-size: 1.1rem;
        }

        /* شبکه ۲×۲ برای کارت‌ها */
        .grid-2x2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 25px;
        }

        /* کارت‌های شیشه‌ای مربعی */
        .square-card {
            aspect-ratio: 1;
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 20px;
            padding: 22px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
        }

        .square-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
            background: rgba(255, 255, 255, 0.95);
        }

        .card-icon {
            font-size: 2.6rem;
            margin-bottom: 14px;
            opacity: 0.9;
        }

        .card-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: #5d6d7e;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .card-value {
            font-size: 1.9rem;
            font-weight: bold;
            color: #2c3e50;
            line-height: 1.2;
        }

        .card-subtitle {
            font-size: 0.85rem;
            color: #7f8c8d;
            margin-top: 6px;
        }

        /* کارت آمار سریع */
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 10px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.92);
            border-radius: 16px;
            padding: 22px;
            text-align: center;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
        }

        .stat-number {
            font-size: 1.9rem;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 6px;
        }

        .stat-label {
            font-size: 0.8rem;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }

        .section-title {
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
            font-size: 1.4rem;
            font-weight: 600;
        }
    `;

    return `
        <!DOCTYPE html>
        <html lang="en">
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
                <h1>VortexAI Scanner</h1>
                <p>Advanced Cryptocurrency Analysis Platform</p>
            </div>

            <!-- سیستم وضعیت در ۲×۲ -->
            <div class="grid-2x2">
                <div class="square-card">
                    <div class="card-icon">💾</div>
                    <div class="card-title">Storage</div>
                    <div class="card-value">${Object.keys(gistData.prices || {}).length}</div>
                    <div class="card-subtitle">trading pairs</div>
                </div>
                
                <div class="square-card">
                    <div class="card-icon">🚀</div>
                    <div class="card-title">AI Engine</div>
                    <div class="card-value">Ready</div>
                    <div class="card-subtitle">systems online</div>
                </div>
                
                <div class="square-card">
                    <div class="card-icon">📡</div>
                    <div class="card-title">WebSocket</div>
                    <div class="card-value">${wsStatus.connected ? 'Live' : 'Off'}</div>
                    <div class="card-subtitle">${wsStatus.active_coins} coins</div>
                </div>
                
                <div class="square-card">
                    <div class="card-icon">⚡</div>
                    <div class="card-title">Performance</div>
                    <div class="card-value">97%</div>
                    <div class="card-subtitle">accuracy rate</div>
                </div>
            </div>

            <!-- آمار سریع -->
            <div style="background: rgba(255, 255, 255, 0.92); border-radius: 20px; padding: 25px; margin-bottom: 20px;">
                <h2 class="section-title">Quick Stats</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">17</div>
                        <div class="stat-label">Today Scans</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">97%</div>
                        <div class="stat-label">System Accuracy</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">230</div>
                        <div class="stat-label">Saved Scans</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">24/7</div>
                        <div class="stat-label">Live Monitoring</div>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 25px; color: rgba(255, 255, 255, 0.9);">
                <small>Last system update: ${new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</small>
            </div>
        `;
        
        res.send(generateModernPage('VortexAI Dashboard', bodyContent, 'home'));
    });

    return router;
};
