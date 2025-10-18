const express = require('express');
const router = express.Router();

function generateNavigationHTML(currentPage = 'home') {
    return `
    <!-- FAB ناوبری هوشمند -->
    <div id="smartFab" class="smart-fab">
        <!-- دکمه FAB اصلی -->
        <div class="fab-main" id="fabMain">
            <div class="fab-burger">
                <span class="burger-line line1"></span>
                <span class="burger-line line2"></span>
                <span class="burger-line line3"></span>
            </div>
        </div>

        <!-- موج انیمیشن -->
        <div class="ripple-effect" id="rippleEffect"></div>

        <!-- منوی هوشمند -->
        <div class="smart-menu" id="smartMenu">
            <div class="menu-grid">
                <!-- ردیف اول -->
                <div class="menu-item ${currentPage === 'home' ? 'active' : ''}" data-page="/" data-tooltip="داشبورد اصلی">
                    <div class="item-icon">🏠</div>
                    <div class="item-label">داشبورد</div>
                    <div class="item-pulse"></div>
                </div>

                <div class="menu-item ${currentPage === 'scan' ? 'active' : ''}" data-page="/scan-page" data-tooltip="اسکن 300 ارز برتر">
                    <div class="item-icon">🔍</div>
                    <div class="item-label">اسکن</div>
                    <div class="item-badge">300+</div>
                </div>

                <div class="menu-item ${currentPage === 'analyze' ? 'active' : ''}" data-page="/analysis-page" data-tooltip="تحلیل تکنیکال پیشرفته">
                    <div class="item-icon">📊</div>
                    <div class="item-label">تحلیل</div>
                    <div class="item-badge">40+</div>
                </div>

                <!-- ردیف دوم -->
                <div class="menu-item ${currentPage === 'ai' ? 'active' : ''}" data-page="https://ai-test-2nxq.onrender.com/" data-external="true" data-tooltip="هوش مصنوعی VortexAI">
                    <div class="item-icon">🤖</div>
                    <div class="item-label">AI</div>
                    <div class="item-glow"></div>
                </div>

                <div class="menu-item ${currentPage === 'market' ? 'active' : ''}" data-page="/markets-page" data-tooltip="داده‌های زنده بازار">
                    <div class="item-icon">📈</div>
                    <div class="item-label">بازار</div>
                </div>

                <div class="menu-item ${currentPage === 'insights' ? 'active' : ''}" data-page="/insights-page" data-tooltip="تحلیل احساسات بازار">
                    <div class="item-icon">💡</div>
                    <div class="item-label">بینش‌ها</div>
                </div>

                <!-- ردیف سوم -->
                <div class="menu-item ${currentPage === 'news' ? 'active' : ''}" data-page="/news-page" data-tooltip="اخبار و تحولات">
                    <div class="item-icon">📰</div>
                    <div class="item-label">اخبار</div>
                </div>

                <div class="menu-item ${currentPage === 'health' ? 'active' : ''}" data-page="/health-page" data-tooltip="سلامت و مانیتورینگ">
                    <div class="item-icon">❤️</div>
                    <div class="item-label">سلامت</div>
                </div>

                <div class="menu-item ${currentPage === 'settings' ? 'active' : ''}" data-page="/settings" data-tooltip="تنظیمات و دیباگ">
                    <div class="item-icon">⚙️</div>
                    <div class="item-label">تنظیمات</div>
                </div>
            </div>
        </div>

        <!-- Tooltip -->
        <div class="smart-tooltip" id="smartTooltip"></div>
    </div>

    <style>
    /* FAB هوشمند */
    .smart-fab {
        position: fixed;
        bottom: 25px;
        right: 25px;
        z-index: 10000;
    }

    /* دکمه اصلی */
    .fab-main {
        width: 65px;
        height: 65px;
        background: linear-gradient(135deg, #667eea, #f115f9, #764ba2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 
            0 8px 25px rgba(102, 126, 234, 0.4),
            0 4px 15px rgba(241, 21, 249, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        z-index: 10002;
    }

    .fab-main:hover {
        transform: scale(1.1);
        box-shadow: 
            0 12px 35px rgba(102, 126, 234, 0.6),
            0 6px 20px rgba(241, 21, 249, 0.4);
    }

    .smart-fab.active .fab-main {
        transform: rotate(90deg) scale(1.1);
    }

    /* آیکون همبرگری */
    .fab-burger {
        width: 25px;
        height: 18px;
        position: relative;
    }

    .burger-line {
        position: absolute;
        height: 2px;
        background: white;
        border-radius: 1px;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        left: 0;
    }

    .line1 { top: 0; width: 25px; }
    .line2 { top: 8px; width: 20px; }
    .line3 { top: 16px; width: 15px; }

    .smart-fab.active .line1 {
        transform: rotate(45deg) translate(6px, 6px);
        width: 25px;
    }

    .smart-fab.active .line2 {
        opacity: 0;
        transform: translateX(-10px);
    }

    .smart-fab.active .line3 {
        transform: rotate(-45deg) translate(6px, -6px);
        width: 25px;
    }

    /* موج انیمیشن */
    .ripple-effect {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 70px;
        height: 70px;
        background: rgba(102, 126, 234, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
        transition: all 0.6s ease;
        z-index: 10001;
    }

    .smart-fab.active .ripple-effect {
        transform: translate(-50%, -50%) scale(4);
        opacity: 1;
    }

    /* منوی هوشمند */
    .smart-menu {
        position: absolute;
        bottom: 80px;
        right: 0;
        background: rgba(15, 15, 26, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 20px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.9);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 10003;
        box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.4),
            0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .smart-fab.active .smart-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
    }

    /* گرید منو */
    .menu-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
    }

    /* آیتم‌های منو */
    .menu-item {
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        overflow: hidden;
    }

    .menu-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(241, 21, 249, 0.2));
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .menu-item:hover {
        transform: translateY(-5px) scale(1.05);
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(102, 126, 234, 0.4);
        box-shadow: 
            0 10px 25px rgba(102, 126, 234, 0.3),
            0 5px 15px rgba(241, 21, 249, 0.2);
    }

    .menu-item:hover::before {
        opacity: 1;
    }

    .menu-item.active {
        background: rgba(102, 126, 234, 0.15);
        border-color: rgba(102, 126, 234, 0.6);
    }

    .item-icon {
        font-size: 20px;
        margin-bottom: 5px;
        transition: all 0.3s ease;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }

    .menu-item:hover .item-icon {
        transform: scale(1.2);
    }

    .item-label {
        font-size: 10px;
        font-weight: 600;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }

    /* بج و پالس */
    .item-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #f115f9;
        color: white;
        font-size: 8px;
        padding: 2px 5px;
        border-radius: 10px;
        font-weight: bold;
    }

    .item-pulse {
        position: absolute;
        top: -2px;
        left: -2px;
        width: 10px;
        height: 10px;
        background: #10b981;
        border-radius: 50%;
        animation: pulse 2s infinite;
    }

    .item-glow {
        position: absolute;
        top: -2px;
        left: -2px;
        width: 10px;
        height: 10px;
        background: #f59e0b;
        border-radius: 50%;
        animation: glow 1.5s infinite alternate;
    }

    /* Tooltip */
    .smart-tooltip {
        position: absolute;
        bottom: 100px;
        right: 100px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 10004;
        pointer-events: none;
    }

    .smart-tooltip.show {
        opacity: 1;
        visibility: visible;
    }

    /* انیمیشن‌ها */
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
    }

    @keyframes glow {
        from { box-shadow: 0 0 5px #f59e0b; }
        to { box-shadow: 0 0 15px #f59e0b, 0 0 20px #f59e0b; }
    }

    /* ریسپانسیو */
    @media (max-width: 768px) {
        .smart-fab {
            bottom: 20px;
            right: 20px;
        }
        
        .fab-main {
            width: 60px;
            height: 60px;
        }
        
        .menu-grid {
            gap: 10px;
        }
        
        .menu-item {
            width: 70px;
            height: 70px;
        }
        
        .item-icon {
            font-size: 18px;
        }
        
        .item-label {
            font-size: 9px;
        }
    }

    @media (max-width: 480px) {
        .smart-menu {
            right: -20px;
        }
        
        .menu-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }
        
        .menu-item {
            width: 65px;
            height: 65px;
        }
    }
    </style>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const smartFab = document.getElementById('smartFab');
        const fabMain = document.getElementById('fabMain');
        const smartMenu = document.getElementById('smartMenu');
        const rippleEffect = document.getElementById('rippleEffect');
        const smartTooltip = document.getElementById('smartTooltip');

        let menuTimeout;

        // کلیک روی FAB
        fabMain.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = smartFab.classList.contains('active');
            
            if (isActive) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // باز کردن منو
        function openMenu() {
            smartFab.classList.add('active');
            clearTimeout(menuTimeout);
        }

        // بستن منو
        function closeMenu() {
            smartFab.classList.remove('active');
        }

        // هاور روی آیتم‌ها
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                const tooltipText = this.getAttribute('data-tooltip');
                smartTooltip.textContent = tooltipText;
                smartTooltip.classList.add('show');
            });

            item.addEventListener('mouseleave', function() {
                smartTooltip.classList.remove('show');
            });

            // کلیک روی آیتم
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const page = this.getAttribute('data-page');
                const isExternal = this.getAttribute('data-external') === 'true';
                
                // انیمیشن کلیک
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // بستن منو
                setTimeout(() => {
                    closeMenu();
                    
                    // هدایت
                    if (isExternal) {
                        window.open(page, '_blank');
                    } else {
                        window.location.href = page;
                    }
                }, 300);
            });
        });

        // بستن منو با کلیک خارج
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#smartFab')) {
                closeMenu();
            }
        });

        // بستن منو با اسکرول
        let scrollTimer;
        window.addEventListener('scroll', function() {
            closeMenu();
            
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                // پس از توقف اسکرول
            }, 100);
        });

        // بستن منو با کلید ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });

        // تشخیص حرکت موس به سمت منو
        smartMenu.addEventListener('mouseenter', function() {
            clearTimeout(menuTimeout);
        });

        smartMenu.addEventListener('mouseleave', function() {
            menuTimeout = setTimeout(closeMenu, 1000);
        });

        // لود اولیه - پالس روی داشبورد
        setTimeout(() => {
            const homeItem = document.querySelector('.menu-item[data-page="/"]');
            if (homeItem) {
                homeItem.querySelector('.item-pulse').style.animation = 'pulse 2s infinite';
            }
        }, 1000);
    });
    </script>
    `;
}

module.exports = { generateNavigationHTML };
