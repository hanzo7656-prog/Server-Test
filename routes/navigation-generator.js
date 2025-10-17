const express = require('express');
const router = express.Router();

function generateNavigationHTML(currentPage = 'home') {
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
                <div class="nav-item ${currentPage === 'home' ? 'active' : ''}" data-page="/" data-external="false">
                    <div class="nav-icon animated-gradient">D</div>
                    <div class="nav-text">DASH</div>
                </div>
                <div class="nav-item ${currentPage === 'scan' ? 'active' : ''}" data-page="/scan-page" data-external="false">
                    <div class="nav-icon animated-gradient">S</div>
                    <div class="nav-text">SCAN</div>
                </div>
                <div class="nav-item ${currentPage === 'analyze' ? 'active' : ''}" data-page="/analysis-page" data-external="false">
                    <div class="nav-icon animated-gradient">A</div>
                    <div class="nav-text">ANALYZE</div>
                </div>
                <div class="nav-item ${currentPage === 'ai' ? 'active' : ''}" data-page="https://ai-test-2nxq.onrender.com/" data-external="true">
                    <div class="nav-icon animated-gradient">AI</div>
                    <div class="nav-text">AI</div>
                </div>
                <div class="nav-item ${currentPage === 'market' ? 'active' : ''}" data-page="/markets-page" data-external="false">
                    <div class="nav-icon animated-gradient">M</div>
                    <div class="nav-text">MARKET</div>
                </div>
                <div class="nav-item ${currentPage === 'insights' ? 'active' : ''}" data-page="/insights-page" data-external="false">
                    <div class="nav-icon animated-gradient">I</div>
                    <div class="nav-text">INSIGHTS</div>
                </div>
                <div class="nav-item ${currentPage === 'news' ? 'active' : ''}" data-page="/news-page" data-external="false">
                    <div class="nav-icon animated-gradient">N</div>
                    <div class="nav-text">NEWS</div>
                </div>
                <div class="nav-item ${currentPage === 'health' ? 'active' : ''}" data-page="/health-page" data-external="false">
                    <div class="nav-icon animated-gradient">H</div>
                    <div class="nav-text">HEALTH</div>
                </div>
                <div class="nav-item ${currentPage === 'settings' ? 'active' : ''}" data-page="/settings" data-external="false">
                    <div class="nav-icon animated-gradient">G</div>
                    <div class="nav-text">SETTINGS</div>
                </div>
            </div>
        </div>
    </div>

    <style>
    /* تمام استایل‌های navigation اینجا */
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

    /* بقیه استایل‌ها رو اینجا کپی کن... */
    </style>

    <script>
    // مدیریت navigation
    document.addEventListener('DOMContentLoaded', function() {
        // کلیک روی دکمه شناور
        document.querySelector('.nav-floater').addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const container = document.querySelector('.nav-container');
            const nav = document.getElementById('glassNav');
            
            if (container.style.display === 'block') {
                container.style.display = 'none';
                nav.classList.remove('expanded');
            } else {
                container.style.display = 'block';
                nav.classList.add('expanded');
            }
        });

        // کلیک روی آیتم‌های navigation
        document.querySelector('.nav-container').addEventListener('click', function(e) {
            const navItem = e.target.closest('.nav-item');
            
            if (navItem) {
                e.preventDefault();
                e.stopPropagation();
                
                const page = navItem.getAttribute('data-page');
                const isExternal = navItem.getAttribute('data-external') === 'true';
                
                // بستن منو
                document.querySelector('.nav-container').style.display = 'none';
                document.getElementById('glassNav').classList.remove('expanded');
                
                // هدایت
                if (isExternal) {
                    window.open(page, '_blank');
                } else {
                    window.location.href = page;
                }
            }
        });

        // بستن منو با کلیک خارج
        document.addEventListener('click', function(e) {
            const nav = document.getElementById('glassNav');
            const container = document.querySelector('.nav-container');
            
            if (!nav.contains(e.target) && container.style.display === 'block') {
                container.style.display = 'none';
                nav.classList.remove('expanded');
            }
        });
    });
    </script>
    `;
}

module.exports = { generateNavigationHTML };
