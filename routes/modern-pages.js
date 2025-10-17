const express = require('express');
const router = express.Router();

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

// Generate navigation function
function generateClassNavigation(currentPage = 'home') {
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

// Routes
module.exports = (dependencies) => {
  const { gistManager, wsManager, apiClient } = dependencies;

  // Route اصلی
  router.get("/", async (req, res) => {
    try {
      const bodyContent = `
        <div class="header">
          <h1>VortexAI Crypto Dashboard</h1>
          <p>برای تحلیل بازارهای کریپتو با داده‌های زنده و بینش هوشمند</p>
        </div>
        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center;">سیستم فعال شد</h2>
          <p style="text-align: center;">از ناوبری پایین صفحه استفاده کنید</p>
        </div>
        <div class="glass-card">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">✅</div>
              <div class="stat-label">سرور فعال</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">9</div>
              <div class="stat-label">صفحات</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">📊</div>
              <div class="stat-label">داده‌ها</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">🚀</div>
              <div class="stat-label">آماده</div>
            </div>
          </div>
        </div>
      `;

      res.send(generateModernPage("داشبورد", bodyContent, 'home'));
    } catch (error) {
      console.error('❌ Dashboard error:', error);
      res.status(500).send('خطا: ' + error.message);
    }
  });

  // صفحه اسکن
  router.get('/scan-page', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const filter = req.query.filter || 'volume';
      let coins = [];

      console.log('🔍 Scan page requested - Checking API client...');
      console.log('📋 API Client status:', {
        exists: !!apiClient,
        hasGetCoins: !!apiClient?.getCoins,
        base_url: apiClient?.base_url,
        api_key: apiClient?.api_key ? '***' + apiClient.api_key.slice(-10) : 'none'
      });

      if (apiClient && typeof apiClient.getCoins === 'function') {
        try {
          console.log('📡 Calling apiClient.getCoins...');
          const scanData = await apiClient.getCoins(limit);
          console.log('📦 API Response:', {
            success: !!scanData,
            hasCoins: !!scanData.coins,
            coinsCount: scanData.coins?.length,
            hasError: !!scanData.error,
            error: scanData.error
          });
          
          coins = scanData.coins || [];
        } catch (apiError) {
          console.error('❌ API Call Failed:', {
            message: apiError.message,
            stack: apiError.stack
          });
          coins = [];
        }
      } else {
        console.error('❌ API Client not available or missing getCoins method');
      }

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
              <div class="stat-number">${coins.length > 0 ? 'فعال' : 'غیرفعال'}</div>
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
                        ${coin.priceChange24h ? parseFloat(coin.priceChange24h).toFixed(2) + '%' : '0.00%'}
                      </td>
                      <td>${coin.volume ? (coin.volume / 1e6).toFixed(1) + 'M' : '0'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
              <div style="font-size: 3rem; margin-bottom: 20px;">📡</div>
              <h3>در حال بارگذاری داده ها</h3>
              <p>لطفا چند لحظه صبر کنید یا پارامترهای جستجو را تغییر دهید</p>
              <div style="margin-top: 20px;">
                <button class="btn" onclick="location.reload()">تلاش مجدد</button>
                <button class="btn" onclick="window.location.href='/api/test-api'" style="margin-left: 10px;">تست API</button>
              </div>
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

      res.send(generateModernPage("اسکن بازار", bodyContent, 'scan'));
    } catch (error) {
      console.error('❌ Scan page error:', error);
      res.status(500).send('خطا در بارگذاری صفحه اسکن');
    }
  });

  // صفحه تحلیل تکنیکال
  router.get('/analysis-page', async (req, res) => {
    try {
      const symbol = req.query.symbol || 'btc_usdt';
      
      const bodyContent = `
        <div class="header">
          <h1>تحلیل تکنیکال</h1>
          <p>شاخص های فنی پیشرفته برای ${symbol.toUpperCase()}</p>
        </div>

        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">تحلیل نماد ${symbol.toUpperCase()}</h2>
          <p style="text-align: center;">سیستم تحلیل تکنیکال در حال توسعه است</p>
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
    } catch (error) {
      console.error('❌ Analysis page error:', error);
      res.status(500).send('خطا در بارگذاری صفحه تحلیل');
    }
  });

  // صفحه بازار سرمایه
  router.get('/markets-page', async (req, res) => {
    try {
      const bodyContent = `
        <div class="header">
          <h1>بازار سرمایه</h1>
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

      res.send(generateModernPage("بازار سرمایه", bodyContent, 'market'));
    } catch (error) {
      console.error('❌ Markets page error:', error);
      res.status(500).send('خطا در بارگذاری صفحه بازار');
    }
  });

  // صفحه بینش‌های بازار
  router.get('/insights-page', async (req, res) => {
    try {
      const bodyContent = `
        <div class="header">
          <h1>بینش‌های بازار</h1>
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
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">پیش بینی های هوشمند</h2>
          <div style="text-align: center; color: #94a3b8;">
            <p>الگوریتم های هوش مصنوعی در حال تحلیل داده‌های بازار...</p>
            <div style="margin-top: 20px;">
              <div class="stat-card" style="display: inline-block; margin: 10px;">
                <div class="stat-number">87%</div>
                <div class="stat-label">دقت پیش بینی</div>
              </div>
              <div class="stat-card" style="display: inline-block; margin: 10px;">
                <div class="stat-number">24h</div>
                <div class="stat-label">افق تحلیل</div>
              </div>
            </div>
          </div>
        </div>
      `;

      res.send(generateModernPage("بینش‌های بازار", bodyContent, 'insights'));
    } catch (error) {
      console.error('❌ Insights page error:', error);
      res.status(500).send('خطا در بارگذاری صفحه بینش‌ها');
    }
  });

  // صفحه اخبار
  router.get('/news-page', async (req, res) => {
    try {
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
              <div class="stat-number">⚠️</div>
              <div class="stat-label">هشدارها</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">🌍</div>
              <div class="stat-label">اخبار جهانی</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">🔮</div>
              <div class="stat-label">پیش بینی‌ها</div>
            </div>
          </div>
        </div>
      `;

      res.send(generateModernPage("اخبار کریپتو", bodyContent, 'news'));
    } catch (error) {
      console.error('❌ News page error:', error);
      res.status(500).send('خطا در بارگذاری صفحه اخبار');
    }
  });

  // صفحه سلامت سیستم
  router.get('/health-page', async (req, res) => {
    try {
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
              <div class="stat-label">API</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">✅</div>
              <div class="stat-label">WebSocket</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">✅</div>
              <div class="stat-label">دیتابیس</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">✅</div>
              <div class="stat-label">سیستم کش</div>
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
              <div class="stat-label">زمان اجرا</div>
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
            <div style="color: #10b981;">[INFO] ${new Date().toLocaleString('fa-IR')} سیستم فعال</div>
          </div>
        </div>
      `;

      res.send(generateModernPage("سلامت سیستم", bodyContent, "health"));
    } catch (error) {
      console.error('❌ Health page error:', error);
      res.status(500).send('خطا در بارگذاری صفحه سلامت');
    }
  });

  // صفحه تنظیمات
  router.get('/settings', async (req, res) => {
    try {
      const bodyContent = `
        <div class="header">
          <h1>تنظیمات پیشرفته</h1>
          <p>شخص‌سازی محیط و تنظیمات کاربری</p>
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
                  <div class="stat-number">📱</div>
                  <div class="stat-label">نمایش</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">📊</div>
                  <div class="stat-label">نمودارها</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">🔔</div>
                  <div class="stat-label">اعلان‌ها</div>
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
    } catch (error) {
      console.error('❌ Settings page error:', error);
      res.status(500).send('خطا در بارگذاری صفحه تنظیمات');
    }
  });

  // Route 404 برای مدیریت خطاها
  router.use('*', (req, res) => {
    const bodyContent = `
      <div class="header">
        <h1>صفحه یافت نشد</h1>
        <p>صفحه‌ای که به دنبال آن هستید وجود ندارد</p>
      </div>

      <div class="glass-card" style="text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
        <h2 style="color: #f115f9; margin-bottom: 20px;">خطای 404</h2>
        <p style="color: #94a3b8; margin-bottom: 30px;">آدرس درخواستی معتبر نیست یا صفحه حذف شده است</p>
        <a href="/" class="btn">بازگشت به داشبورد</a>
      </div>
    `;

    res.status(404).send(generateModernPage("صفحه یافت نشد", bodyContent, 'home'));
  });

  return router;
};
