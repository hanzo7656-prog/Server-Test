const express = require('express');
const router = express.Router();

// ==================== 🎨 سیستم ناوبری شیشه‌ای با متن ====================

function generateGlassNavigation(currentPage = 'home') {
    const navItems = [
        { id: 'home', label: 'DASH', page: '/' },
        { id: 'scan', label: 'SCAN', page: '/scan' },
        { id: 'ai', label: 'AI', page: '/ai-dashboard' },
        { id: 'settings', label: 'SET', page: '/settings' },
        { id: 'analysis', label: 'TECH', page: '/analysis' },
        { id: 'market', label: 'MKT', page: '/market' },
        { id: 'api', label: 'DATA', page: '/api-data' },
        { id: 'health', label: 'HLTH', page: '/health' },
        { id: 'news', label: 'NEWS', page: '/crypto-news' },
        { id: 'timeframes', label: 'TIME', page: '/timeframes' },
        { id: 'currencies', label: 'CURR', page: '/currencies' },
        { id: 'insights', label: 'INSI', page: '/insights' }
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
            
            <!-- نوار ناوبری اصلی -->
            <div class="nav-container">
                <div class="nav-scroll" id="navScroll">
                    ${navItems.map(item => `
                        <div class="nav-item ${item.id === currentPage ? 'active' : ''}" 
                             onclick="navigateTo('${item.page}')">
                            <div class="nav-text">${item.label}</div>
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
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 
                    0 15px 35px rgba(102, 126, 234, 0.5),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
                transition: all 0.4s ease;
                position: relative;
                overflow: hidden;
            }

            .nav-floater:hover {
                transform: scale(1.1);
                box-shadow: 
                    0 20px 45px rgba(102, 126, 234, 0.7),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
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
                0%, 100% { 
                    transform: scale(1);
                    opacity: 0.7;
                }
                50% { 
                    transform: scale(1.3);
                    opacity: 1;
                }
            }

            /* نوار ناوبری اصلی */
            .nav-container {
                display: none;
                background: rgba(30, 35, 50, 0.85);
                backdrop-filter: blur(30px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 25px;
                padding: 20px;
                margin-bottom: 15px;
                box-shadow: 
                    0 20px 40px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
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
                align-items: center;
                justify-content: center;
                padding: 16px 8px;
                border-radius: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 70px;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid transparent;
                position: relative;
                overflow: hidden;
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
                box-shadow: 
                    0 8px 25px rgba(102, 126, 234, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }

            .nav-item.active::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                animation: shine 3s infinite;
            }

            /* متن شیشه‌ای */
            .nav-text {
                font-size: 0.85rem;
                font-weight: 700;
                color: #f1f5f9;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 1px;
                text-shadow: 
                    0 1px 2px rgba(0, 0, 0, 0.5),
                    0 0 20px rgba(255, 255, 255, 0.3);
                background: linear-gradient(135deg, #f1f5f9, #cbd5e1);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                position: relative;
                transition: all 0.3s ease;
            }

            .nav-item:hover .nav-text {
                background: linear-gradient(135deg, #ffffff, #e2e8f0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 
                    0 1px 3px rgba(0, 0, 0, 0.6),
                    0 0 30px rgba(255, 255, 255, 0.5);
            }

            .nav-item.active .nav-text {
                background: linear-gradient(135deg, #667eea, #a855f7);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 
                    0 1px 2px rgba(0, 0, 0, 0.3),
                    0 0 25px rgba(102, 126, 234, 0.4);
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

            @keyframes shine {
                0% { left: -100%; }
                20% { left: 100%; }
                100% { left: 100%; }
            }

            /* ریسپانسیو */
            @media (max-width: 400px) {
                .nav-scroll {
                    width: 280px;
                    grid-template-columns: repeat(4, 1fr);
                }
                
                .nav-item {
                    min-width: 60px;
                    padding: 14px 6px;
                }
                
                .nav-text {
                    font-size: 0.75rem;
                    letter-spacing: 0.5px;
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
            background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
            min-height: 100vh;
            color: #e2e8f0;
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
            padding: 30px 20px;
            background: rgba(30, 35, 50, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .header h1 {
            font-size: 2.4rem;
            background: linear-gradient(135deg, #667eea, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 12px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }

        .header p {
            color: #94a3b8;
            font-size: 1.2rem;
            font-weight: 400;
        }

        /* شبکه ۲×۲ برای کارت‌ها */
        .grid-2x2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
            margin-bottom: 30px;
        }

        /* کارت‌های شیشه‌ای مربعی */
        .square-card {
            aspect-ratio: 1;
            background: rgba(30, 35, 50, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 22px;
            padding: 25px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }

        .square-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            background: rgba(40, 45, 60, 0.8);
            border: 1px solid rgba(102, 126, 234, 0.3);
        }

        .card-icon {
            font-size: 2.8rem;
            margin-bottom: 16px;
            opacity: 0.9;
        }

        .card-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: #94a3b8;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .card-value {
            font-size: 2.2rem;
            font-weight: bold;
            color: #f1f5f9;
            line-height: 1.2;
            margin-bottom: 6px;
        }

        .card-subtitle {
            font-size: 0.85rem;
            color: #64748b;
            font-weight: 500;
        }

        /* کارت آمار سریع */
        .stats-section {
            background: rgba(30, 35, 50, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .section-title {
            color: #f1f5f9;
            margin-bottom: 25px;
            text-align: center;
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: -0.5px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
        }

        .stat-card {
            background: rgba(40, 45, 60, 0.6);
            border-radius: 18px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
            background: rgba(45, 50, 70, 0.7);
        }

        .stat-number {
            font-size: 2.2rem;
            font-weight: bold;
            color: #f1f5f9;
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
                <h1>Advanced Cryptocurrency Analysis</h1>
                <p>Platform</p>
            </div>

            <!-- سیستم وضعیت در ۲×۲ -->
            <div class="grid-2x2">
                <div class="square-card">
                    <div class="card-icon">💾</div>
                    <div class="card-title">STORAGE</div>
                    <div class="card-value">${Object.keys(gistData.prices || {}).length}</div>
                    <div class="card-subtitle">trading pairs</div>
                </div>
                
                <div class="square-card">
                    <div class="card-icon">🚀</div>
                    <div class="card-title">AI ENGINE</div>
                    <div class="card-value">Ready</div>
                    <div class="card-subtitle">systems online</div>
                </div>
                
                <div class="square-card">
                    <div class="card-icon">📡</div>
                    <div class="card-title">WEBSOCKET</div>
                    <div class="card-value">${wsStatus.connected ? 'Live' : 'Off'}</div>
                    <div class="card-subtitle">${wsStatus.active_coins} coins</div>
                </div>
                
                <div class="square-card">
                    <div class="card-icon">⚡</div>
                    <div class="card-title">PERFORMANCE</div>
                    <div class="card-value">97%</div>
                    <div class="card-subtitle">accuracy rate</div>
                </div>
            </div>

            <!-- آمار سریع -->
            <div class="stats-section">
                <h2 class="section-title">Quick Stats</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">17</div>
                        <div class="stat-label">TODAY SCANS</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">97%</div>
                        <div class="stat-label">SYSTEM ACCURACY</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">230</div>
                        <div class="stat-label">SAVED SCANS</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">24/7</div>
                        <div class="stat-label">LIVE MONITORING</div>
                    </div>
                </div>
            </div>

            <div class="last-update">
                Last system update: ${new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </div>
        `;
        
        res.send(generateModernPage('VortexAI Dashboard', bodyContent, 'home'));
    });

    return router;
};
