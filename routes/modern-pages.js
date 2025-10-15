const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const router = express.Router();

    router.get('/', (req, res) => {
        const navigationHTML = `
            <!-- ناوبری اصلی -->
            <div id="glassNav" class="glass-navigation">
                <div class="nav-floater" id="navButton">
                    <div class="liquid-button">
                        <div class="nav-dot"></div>
                        <div class="nav-dot"></div>
                        <div class="nav-dot"></div>
                    </div>
                </div>

                <div class="nav-container" id="navMenu" style="display: none;">
                    <div class="nav-scroll">
                        <div class="nav-item">🏠 خانه</div>
                        <div class="nav-item">🔍 اسکن</div>
                        <div class="nav-item">📊 تحلیل</div>
                    </div>
                </div>
            </div>

            <style>
                .glass-navigation { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; }
                .nav-floater { 
                    width: 65px; height: 65px; background: linear-gradient(135deg, #667eea, #764ba2); 
                    border-radius: 25px; display: flex; align-items: center; justify-content: center; 
                    cursor: pointer; box-shadow: 0 15px 35px rgba(102, 126, 234, 0.5); 
                }
                .nav-container { 
                    background: rgba(30, 35, 50, 0.95); backdrop-filter: blur(30px); border-radius: 25px; 
                    padding: 20px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.15); 
                }
                .nav-item { padding: 12px; background: rgba(255,255,255,0.1); border-radius: 16px; margin: 5px; color: white; text-align: center; }
                .liquid-button { display: flex; gap: 3px; }
                .nav-dot { width: 5px; height: 5px; background: white; border-radius: 50%; }
            </style>

            <script>
                // روش ۱: مستقیم روی المنت
                console.log('🚀 JavaScript اجرا شد!');
                
                const navButton = document.getElementById('navButton');
                const navMenu = document.getElementById('navMenu');
                
                console.log('دکمه:', navButton);
                console.log('منو:', navMenu);
                
                if (navButton) {
                    // روش ۲: event listener
                    navButton.addEventListener('click', function() {
                        console.log('✅ کلیک ثبت شد!');
                        if (navMenu.style.display === 'none') {
                            navMenu.style.display = 'block';
                            console.log('منو باز شد');
                        } else {
                            navMenu.style.display = 'none';
                            console.log('منو بسته شد');
                        }
                    });
                    
                    // روش ۳: onclick مستقیم
                    navButton.onclick = function() {
                        console.log('onclick کار کرد!');
                    };
                    
                    console.log('🎯 همه eventها اضافه شدند');
                }
            </script>
        `;

        res.send(`
            <html>
            <body style="background: #0f0f1a; color: white; height: 200vh; margin: 0; padding: 20px;">
                <h1>تست نهایی ناوبری</h1>
                <p>پایین صفحه دکمه رو ببین و کلیک کن</p>
                <p>اگر منو باز شد، مشکل حل شده</p>
                ${navigationHTML}
            </body>
            </html>
        `);
    });

    return router;
};
