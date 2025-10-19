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

        <!-- موج پس‌زمینه -->
        <div class="background-wave" id="backgroundWave"></div>

        <!-- منوی هوشمند -->
        <div class="smart-menu" id="smartMenu">
            <div class="menu-grid">
                <!-- ردیف اول -->
                <div class="menu-item ${currentPage === 'home' ? 'active' : ''}" data-page="/" data-tooltip="داشبورد اصلی">
                    <div class="item-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2"/>
                            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <div class="item-label">داشبورد</div>
                    <div class="item-pulse"></div>
                </div>

                <div class="menu-item ${currentPage === 'scan' ? 'active' : ''}" data-page="/scan-page" data-tooltip="اسکن 300 ارز برتر">
                    <div class="item-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <div class="item-label">اسکن</div>
                    <div class="item-badge">300+</div>
                </div>

                <div class="menu-item ${currentPage === 'analyze' ? 'active' : ''}" data-page="/analysis-page" data-tooltip="تحلیل تکنیکال پیشرفته">
                    <div class="item-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3V21H21" stroke="currentColor" stroke-width="2"/>
                            <path d="M7 16L10 11L13 14L17 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="item-label">تحلیل</div>
                    <div class="item-badge">40+</div>
                </div>

                <!-- ردیف دوم -->
                <div class="menu-item ${currentPage === 'ai' ? 'active' : ''}" data-page="https://ai-test-2nxq.onrender.com/" data-external="true" data-tooltip="هوش مصنوعی VortexAI">
                    <div class="item-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M12 3C13.1819 3 14.3522 3.23279 15.4442 3.68508C16.5361 4.13738 17.5282 4.80031 18.364 5.63604C19.1997 6.47177 19.8626 7.46392 20.3149 8.55585C20.7672 9.64778 21 10.8181 21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <div class="item-label">AI</div>
                    <div class="item-glow"></div>
                </div>

                <div class="menu-item ${currentPage === 'market' ? 'active' : ''}" data-page="/markets-page" data-tooltip="داده‌های زنده بازار">
                    <div class="item-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3V21H21M7 16L10 8L13 12L17 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="item-label">بازار</div>
                </div>

                <div class="menu-item ${currentPage === 'insights' ? 'active' : ''}" data-page="/insights-page" data-tooltip="تحلیل احساسات بازار">
                    <div class="item-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9.663 17H4.007M9.663 17C10.4852 15.6765 11.9659 14.8571 13.663 14.8571C15.3601 14.8571 16.8408 15.6765 17.663 17M9.663 17C9.77381 17.348 9.77381 17.652 9.663 18M17.663 17H20.336M17.663 17C17.5522 17.348 17.5522 17.652 17.663 18M9.663 18C10.4852 19.3235 11.9659 20.1429 13.663 20.1429C15.3601 20.1429 16.8408 19.3235 17.663 18M9.663 18H4.007M17.663 18H20.336M13.663 7C14.7676 7 15.663 6.10457 15.663 5C15.663 3.89543 14.7676 3 13.663 3C12.5584 3 11.663 3.89543 11.663 5C11.663 6.10457 12.5584 7 13.663 7ZM13.663 14.8571C14.7676 14.8571 15.663 13.9617 15.663 12.8571C15.663 11.7526 14.7676 10.8571 13.663 10.8571C12.5584 10.8571 11.663 11.7526 11.663 12.8571C11.663 13.9617 12.5584 14.8571 13.663 14.8571Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <div class="item-label">بینش‌ها</div>
                </div>

                <!-- ردیف سوم -->
                <div class="menu-item ${currentPage === 'news' ? 'active' : ''}" data-page="/news-page" data-tooltip="اخبار و تحولات">
                    <div class="item-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H15L21 10V18C21 19.1046 20.1046 20 19 20Z" stroke="currentColor" stroke-width="2"/>
                            <path d="M17 4V10H21" stroke="currentColor" stroke-width="2"/>
                            <path d="M7 16H15" stroke="currentColor" stroke-width="2"/>
                            <path d="M7 12H17" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <div class="item-label">اخبار</div>
                </div>

                <div class="menu-item ${currentPage === 'health' ? 'active' : ''}" data-page="/health-page" data-tooltip="سلامت و مانیتورینگ">
                    <div class="item-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <div class="item-label">سلامت</div>
                </div>

                <div class="menu-item ${currentPage === 'settings' ? 'active' : ''}" data-page="/settings" data-tooltip="تنظیمات و دیباگ">
                    <div class="item-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2"/>
                            <path d="M19.4 15C19.2662 15.3036 19.1876 15.6304 19.1685 15.9642C19.1494 16.298 19.1902 16.6327 19.2885 16.95L21.5 17.5C21.675 18.269 21.5725 19.0718 21.2095 19.7739C20.8465 20.476 20.2448 21.033 19.5 21.35L17.5 20.5C17.153 20.689 16.7773 20.8199 16.3875 20.8875C15.9977 20.9551 15.5993 20.9584 15.2085 20.8975L14.5 22.65C13.839 22.883 13.1305 22.9369 12.4435 22.8065C11.7565 22.6761 11.1144 22.3659 10.5835 21.9065C10.0526 21.447 9.65205 20.8547 9.4225 20.19C9.19295 19.5253 9.14255 18.8129 9.2765 18.125L9.5 17C9.33249 16.581 9.25154 16.1343 9.262 15.685C9.27246 15.2357 9.37409 14.7935 9.5605 14.385L8 13C7.636 13.303 7.2235 13.5395 6.7815 13.6985C6.3395 13.8575 5.875 13.9365 5.407 13.932L4 15.5C3.3675 15.175 2.8355 14.6825 2.462 14.0765C2.0885 13.4705 1.8875 12.7735 1.881 12.0625C1.8745 11.3515 2.063 10.651 2.425 10.0385C2.787 9.426 3.309 8.9245 3.934 8.5885L5.5 9C5.5 8.07174 5.86875 7.1815 6.52513 6.52513C7.1815 5.86875 8.07174 5.5 9 5.5L10.0615 4C10.7475 3.8655 11.4595 3.9155 12.124 4.1445C12.7885 4.3735 13.3805 4.7735 13.8395 5.304C14.2985 5.8345 14.6085 6.476 14.739 7.1625C14.8695 7.849 14.8155 8.557 14.5825 9.218L13.5 10.5C13.915 10.6675 14.2945 10.9155 14.6155 11.2295C14.9365 11.5435 15.1925 11.9175 15.3685 12.3295C15.5445 12.7415 15.637 13.183 15.6405 13.6295C15.644 14.076 15.5585 14.5185 15.3895 14.933L16.5 16C16.803 15.636 17.0395 15.2235 17.1985 14.7815C17.3575 14.3395 17.4365 13.875 17.4325 13.407L19 12C19.3245 12.6325 19.817 13.1645 20.423 13.538C21.029 13.9115 21.726 14.1125 22.437 14.119C23.148 14.1255 23.8485 13.937 24.461 13.575C25.0735 13.213 25.575 12.691 25.9105 12.066L24.5 10.5C24.5 11.4283 24.1313 12.3185 23.4749 12.9749C22.8185 13.6313 21.9283 14 21 14L19.9385 15.5C19.804 16.186 19.854 16.8975 20.083 17.562C20.312 18.2265 20.712 18.8185 21.2425 19.2775C21.773 19.7365 22.415 20.0465 23.1015 20.177C23.788 20.3075 24.496 20.2535 25.157 20.0205L26.5 19C26.825 18.3675 27.0125 17.667 27.0465 16.951C27.0805 16.235 26.9605 15.5205 26.695 14.8575C26.4295 14.1945 26.0255 13.5995 25.513 13.1155C25.0005 12.6315 24.3925 12.2705 23.7325 12.058L22.5 13C22.081 12.8325 21.6343 12.7515 21.185 12.762C20.7357 12.7725 20.2935 12.8741 19.885 13.0605L19.4 15Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
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

    /* موج پس‌زمینه */
    .background-wave {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(circle at center, rgba(19, 188, 255, 0.2) 0%, transparent 70%);
        opacity: 0;
        pointer-events: none;
        z-index: 9998;
        transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .smart-fab.active .background-wave {
        opacity: 1;
        transform: scale(1.2);
    }

    /* دکمه اصلی - لیکویید گلس */
    .fab-main {
        width: 65px;
        height: 65px;
        background: linear-gradient(135deg, 
            rgba(19, 188, 255, 0.9) 0%, 
            rgba(19, 188, 255, 0.7) 50%, 
            rgba(19, 188, 255, 0.4) 100%);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(19, 188, 255, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 
            0 8px 32px rgba(19, 188, 255, 0.3),
            0 4px 16px rgba(19, 188, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        z-index: 10002;
    }

    .fab-main::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(135deg, 
            rgba(19, 188, 255, 0.6), 
            rgba(19, 188, 255, 0.2));
        border-radius: 50%;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .fab-main:hover {
        transform: scale(1.1);
        box-shadow: 
            0 12px 40px rgba(19, 188, 255, 0.4),
            0 6px 20px rgba(19, 188, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }

    .fab-main:hover::before {
        opacity: 1;
    }

    .smart-fab.active .fab-main {
        transform: rotate(90deg) scale(1.1);
        background: linear-gradient(135deg, 
            rgba(19, 188, 255, 0.8) 0%, 
            rgba(19, 188, 255, 0.6) 50%, 
            rgba(19, 188, 255, 0.3) 100%);
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
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
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

    /* منوی هوشمند */
    .smart-menu {
        position: absolute;
        bottom: 80px;
        right: 0;
        background: rgba(15, 15, 26, 0.85);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        border: 1px solid rgba(19, 188, 255, 0.2);
        border-radius: 20px;
        padding: 20px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.9);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 10003;
        box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.4),
            0 8px 25px rgba(19, 188, 255, 0.2);
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
        background: linear-gradient(135deg, rgba(19, 188, 255, 0.15), rgba(19, 188, 255, 0.05));
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .menu-item:hover {
        transform: translateY(-5px) scale(1.05);
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(19, 188, 255, 0.4);
        box-shadow: 
            0 10px 25px rgba(19, 188, 255, 0.2),
            0 5px 15px rgba(19, 188, 255, 0.1);
    }

    .menu-item:hover::before {
        opacity: 1;
    }

    .menu-item.active {
        background: rgba(19, 188, 255, 0.1);
        border-color: rgba(19, 188, 255, 0.5);
    }

    .item-icon {
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 5px;
        transition: all 0.3s ease;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }

    .menu-item:hover .item-icon {
        transform: scale(1.2);
        color: #13BCFF;
    }

    .item-label {
        font-size: 10px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }

    /* بج و پالس */
    .item-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #13BCFF;
        color: white;
        font-size: 8px;
        padding: 2px 5px;
        border-radius: 10px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .item-pulse {
        position: absolute;
        top: -2px;
        left: -2px;
        width: 8px;
        height: 8px;
        background: #13BCFF;
        border-radius: 50%;
        animation: pulse 2s infinite;
        box-shadow: 0 0 10px #13BCFF;
    }

    .item-glow {
        position: absolute;
        top: -2px;
        left: -2px;
        width: 8px;
        height: 8px;
        background: #13BCFF;
        border-radius: 50%;
        animation: glow 1.5s infinite alternate;
        box-shadow: 0 0 15px #13BCFF;
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
        backdrop-filter: blur(10px);
    }

    .smart-tooltip.show {
        opacity: 1;
        visibility: visible;
    }

    /* انیمیشن‌ها */
    @keyframes pulse {
        0%, 100% { 
            opacity: 1; 
            transform: scale(1);
            box-shadow: 0 0 10px #13BCFF;
        }
        50% { 
            opacity: 0.7; 
            transform: scale(1.2);
            box-shadow: 0 0 20px #13BCFF;
        }
    }

    @keyframes glow {
        from { 
            box-shadow: 0 0 5px #13BCFF, 0 0 10px #13BCFF;
        }
        to { 
            box-shadow: 0 0 15px #13BCFF, 0 0 30px #13BCFF;
        }
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
        
        .item-icon svg {
            width: 18px;
            height: 18px;
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
        const backgroundWave = document.getElementById('backgroundWave');
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
            
            // ایجاد موج
            createRipple();
        }

        // بستن منو
        function closeMenu() {
            smartFab.classList.remove('active');
        }

        // ایجاد موج
        function createRipple() {
            backgroundWave.style.animation = 'none';
            void backgroundWave.offsetWidth; // Trigger reflow
            backgroundWave.style.animation = 'waveExpand 0.8s ease-out';
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

    // انیمیشن موج
    const waveStyle = document.createElement('style');
    waveStyle.textContent = \`
        @keyframes waveExpand {
            0% {
                opacity: 0;
                transform: scale(0.5);
            }
            50% {
                opacity: 0.3;
                transform: scale(1.2);
            }
            100% {
                opacity: 0;
                transform: scale(2);
            }
        }
    \`;
    document.head.appendChild(waveStyle);
    </script>
    `;
}

module.exports = { generateNavigationHTML };
