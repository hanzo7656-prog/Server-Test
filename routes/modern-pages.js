const express = require('express');
const router = express.Router();

// سیستم دیباگ پیشرفته
const debugSystem = {
  enabled: true,
  logs: [],
  performance: {},
  apiStats: {
    totalRequests: 0,
    failedRequests: 0,
    lastResponse: null
  },
  
  log: function(level, message, data = null) {
    if (!this.enabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level,
      message: message,
      data: data,
      memory: process.memoryUsage()
    };
    
    this.logs.push(logEntry);
    
    // نگه داشتن فقط 100 لاگ آخر
    if (this.logs.length > 100) {
      this.logs.shift();
    }
    
    console.log(`[${level.toUpperCase()}] ${message}`, data || '');
  },
  
  analyzeServer: function() {
    this.log('INFO', 'Starting comprehensive server analysis...');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      systemHealth: this.checkSystemHealth(),
      apiHealth: this.checkAPIHealth(),
      dataFlow: this.checkDataFlow(),
      performance: this.checkPerformance(),
      issues: this.detectIssues(),
      recommendations: this.generateRecommendations()
    };
    
    this.log('INFO', 'Server analysis completed', analysis);
    return analysis;
  },
  
  checkSystemHealth: function() {
    return {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      },
      uptime: Math.round(process.uptime()) + 's',
      nodeVersion: process.version,
      platform: process.platform
    };
  },
  
  checkAPIHealth: function() {
    return {
      totalRequests: this.apiStats.totalRequests,
      failedRequests: this.apiStats.failedRequests,
      successRate: this.apiStats.totalRequests > 0 ? 
        ((this.apiStats.totalRequests - this.apiStats.failedRequests) / this.apiStats.totalRequests * 100).toFixed(2) + '%' : '0%',
      lastResponse: this.apiStats.lastResponse
    };
  },
  
  checkDataFlow: function() {
    const recentLogs = this.logs.slice(-10);
    const dataFlowIssues = [];
    
    // بررسی مشکلات جریان داده
    recentLogs.forEach(log => {
      if (log.message.includes('priceChange24h') && log.data === 0) {
        dataFlowIssues.push('Zero price changes detected');
      }
      if (log.message.includes('error') || log.message.includes('failed')) {
        dataFlowIssues.push(`Error in: ${log.message}`);
      }
    });
    
    return {
      issues: dataFlowIssues.length > 0 ? dataFlowIssues : ['No data flow issues detected'],
      recentActivity: recentLogs.length
    };
  },
  
  checkPerformance: function() {
    const perfLogs = this.logs.filter(log => 
      log.level === 'PERF' || log.message.includes('ms') || log.message.includes('performance')
    );
    
    return {
      recentPerformanceIssues: perfLogs.slice(-5),
      averageResponseTime: 'Calculating...'
    };
  },
  
  detectIssues: function() {
    const issues = [];
    
    // بررسی لاگ‌های خطا
    const errorLogs = this.logs.filter(log => log.level === 'ERROR');
    if (errorLogs.length > 0) {
      issues.push(`Found ${errorLogs.length} errors in recent logs`);
    }
    
    // بررسی مشکلات قیمت
    const zeroPriceLogs = this.logs.filter(log => 
      log.message.includes('priceChange24h') && log.data === 0
    );
    if (zeroPriceLogs.length > 5) {
      issues.push('Multiple zero price changes detected - API field mapping issue');
    }
    
    // بررسی مشکلات حافظه
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    if (memoryUsage > 500) {
      issues.push(`High memory usage: ${memoryUsage.toFixed(2)}MB`);
    }
    
    return issues.length > 0 ? issues : ['No critical issues detected'];
  },
  
  generateRecommendations: function() {
    const recommendations = [];
    const issues = this.detectIssues();
    
    if (issues.some(issue => issue.includes('zero price'))) {
      recommendations.push('Check API field mapping for price change fields');
      recommendations.push('Verify CoinGecko/CoinStats API response structure');
      recommendations.push('Enable detailed API response logging');
    }
    
    if (issues.some(issue => issue.includes('memory'))) {
      recommendations.push('Consider implementing memory cleanup routines');
      recommendations.push('Reduce log retention period');
    }
    
    if (this.apiStats.failedRequests > this.apiStats.totalRequests * 0.1) {
      recommendations.push('Check API key validity and rate limits');
      recommendations.push('Implement retry mechanism for failed requests');
    }
    
    return recommendations.length > 0 ? recommendations : ['System running optimally'];
  }
};

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
  
  .debug-panel {
    background: rgba(255,0,0,0.1);
    border: 1px solid rgba(255,0,0,0.3);
    border-radius: 10px;
    padding: 15px;
    margin: 10px 0;
    font-family: monospace;
    font-size: 0.8rem;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .debug-info {
    background: rgba(0,255,0,0.1);
    border: 1px solid rgba(0,255,0,0.3);
    border-radius: 10px;
    padding: 10px;
    margin: 5px 0;
    font-size: 0.75rem;
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

    <div class="nav-container" style="display: none;">  
      <div class="nav-scroll" id="navScroll">
        <div class="nav-item ${currentPage == 'home' ? 'active' : ''}" data-page="/" data-external="false">  
          <div class="nav-icon animated-gradient">D</div>  
          <div class="nav-text">DASH</div>  
        </div>

        <div class="nav-item ${currentPage == 'scan' ? 'active' : ''}" data-page="/scan-page" data-external="false">  
          <div class="nav-icon animated-gradient">S</div>  
          <div class="nav-text">SCAN</div>  
        </div>

        <div class="nav-item ${currentPage == 'analyze' ? 'active' : ''}" data-page="/analysis-page" data-external="false">  
          <div class="nav-icon animated-gradient">A</div>  
          <div class="nav-text">ANALYZE</div>  
        </div>

        <div class="nav-item ${currentPage == 'ai' ? 'active' : ''}" data-page="https://ai-test-2nxq.onrender.com/" data-external="true">
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

        <div class="nav-item ${currentPage === 'debug' ? 'active' : ''}" data-page="/debug" data-external="false">
          <div class="nav-icon animated-gradient">🔧</div>
          <div class="nav-text">DEBUG</div>
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
      grid-template-rows: repeat(4, auto);
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
        
        if (container.style.display == 'block') {
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

      // کلیک خارج منو برای بستن
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
      debugSystem.log('INFO', 'Dashboard page requested');
      
      const bodyContent = `
        <div class="header">
          <h1>VortexAI Crypto Dashboard</h1>
          <p>برای تحلیل بازارهای کریپتو با داده‌های زنده و بینش هوشمند</p>
        </div>
        
        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center;">سیستم فعال شده</h2>
          <p style="text-align: center;">از ناوبری پایین صفحه استفاده کنید</p>
        </div>
        
        <div class="glass-card">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${debugSystem.apiStats.totalRequests}</div>
              <div class="stat-label">درخواست‌های API</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">9</div>
              <div class="stat-label">صفحات</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${Math.round(process.uptime() / 60)}</div>
              <div class="stat-label">دقیقه فعالیت</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${debugSystem.enabled ? 'فعال' : 'غیرفعال'}</div>
              <div class="stat-label">سیستم دیباگ</div>
            </div>
          </div>
        </div>
        
        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 20px;">وضعیت سیستم</h2>
          <div class="debug-info">
            <strong>حافظه استفاده شده:</strong> ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB<br>
            <strong>زمان فعالیت:</strong> ${Math.round(process.uptime())} ثانیه<br>
            <strong>لاگ‌های اخیر:</strong> ${debugSystem.logs.length}<br>
            <strong>مشکلات شناسایی شده:</strong> ${debugSystem.detectIssues().length}
          </div>
        </div>
      `;

      res.send(generateModernPage("داشبورد", bodyContent, 'home'));
    } catch (error) {
      debugSystem.log('ERROR', 'Dashboard error', error.message);
      res.status(500).send('خطا: ' + error.message);
    }
  });

  // صفحه اسکن
  router.get('/scan-page', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 200;
      const filter = req.query.filter || 'all';
      let coins = [];

      debugSystem.log('INFO', 'Scan page requested', { limit, filter });
      debugSystem.apiStats.totalRequests++;

      console.log('📞 Scan page requested - Checking API client...');
      console.log('📖 API Client status:', {
        exists: !!apiClient,
        hasGetCoins: !!apiClient?.getCoins,
        base_url: apiClient?.base_url,
        api_key: apiClient?.api_key ? '***' + apiClient.api_key.slice(-10) : 'none'
      });

      if (apiClient && typeof apiClient.getCoins == 'function') {
        try {
          console.log('🔄 Calling apiClient.getCoins...');
          const scanData = await apiClient.getCoins(limit);
          
          debugSystem.log('INFO', 'API getCoins response', {
            success: !!scanData,
            hasCoins: !!scanData.coins,
            coinsCount: scanData.coins?.length,
            hasError: !!scanData.error,
            error: scanData.error
          });

          debugSystem.apiStats.lastResponse = {
            timestamp: new Date().toISOString(),
            coinCount: scanData.coins?.length,
            hasError: !!scanData.error
          };

          coins = scanData.coins || [];

          // دیباگ پیشرفته برای ساختار داده‌ها
          console.log("🔍 Scan Data Debug Info:");
          console.log("📊 Total coins received:", coins.length);
          
          if (coins.length > 0) {
            console.log("🔬 First coin structure:", {
              symbol: coins[0].symbol,
              price: coins[0].price,
              // بررسی تمام فیلدهای ممکن برای تغییرات قیمت
              allKeys: Object.keys(coins[0])
            });

            // لاگ فیلدهای تغییرات برای 5 کوین اول
            coins.slice(0, 5).forEach((coin, idx) => {
              const changeFields = Object.keys(coin).filter(key => 
                key.toLowerCase().includes('change') || 
                key.toLowerCase().includes('percent')
              );
              
              console.log(`🔍 Coin ${idx + 1} (${coin.symbol}) change fields:`, changeFields);
              changeFields.forEach(field => {
                console.log(`   ${field}:`, coin[field]);
              });
            });
          }

        } catch (apiError) {
          debugSystem.log('ERROR', 'API Call Failed', {
            message: apiError.message,
            stack: apiError.stack
          });
          debugSystem.apiStats.failedRequests++;
          coins = [];
        }
      } else {
        debugSystem.log('ERROR', 'API Client not available or missing getCoins method');
        coins = [];
      }

      // اعمال فیلترها
      let filteredCoins = [...coins];
      switch (filter) {
        case 'gainers':
          filteredCoins = coins.filter(coin => {
            const change = coin.priceChange24h || coin.price_change_24h || coin.change || 0;
            return change > 0;
          }).sort((a, b) => {
            const changeA = a.priceChange24h || a.price_change_24h || a.change || 0;
            const changeB = b.priceChange24h || b.price_change_24h || b.change || 0;
            return changeB - changeA;
          });
          break;
        case 'losers':
          filteredCoins = coins.filter(coin => {
            const change = coin.priceChange24h || coin.price_change_24h || coin.change || 0;
            return change < 0;
          }).sort((a, b) => {
            const changeA = a.priceChange24h || a.price_change_24h || a.change || 0;
            const changeB = b.priceChange24h || b.price_change_24h || b.change || 0;
            return changeA - changeB;
          });
          break;
        case 'volume':
          filteredCoins = [...coins].sort((a, b) => {
            const volumeA = a.volume || a.total_volume || 0;
            const volumeB = b.volume || b.total_volume || 0;
            return volumeB - volumeA;
          });
          break;
        case 'marketcap':
          filteredCoins = [...coins].sort((a, b) => {
            const capA = a.marketCap || a.market_cap || 0;
            const capB = b.marketCap || b.market_cap || 0;
            return capB - capA;
          });
          break;
        default:
          filteredCoins = coins;
      }

      const bodyContent = `
        <div class="header">
          <h1>اسکن بازار کریپتو</h1>
          <p>تحلیل لحظه‌ای ${filteredCoins.length} ارز دیجیتال با داده‌های زنده از صرافی‌ها</p>
        </div>

        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">آمار و پارامترهای اسکن</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${coins.length}</div>
              <div class="stat-label">کل ارزهای دریافت شده</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${filteredCoins.length}</div>
              <div class="stat-label">ارزهای فیلتر شده</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${filter.toUpperCase()}</div>
              <div class="stat-label">فیلتر فعلی</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${coins.length > 0 ? '✅' : '❌'}</div>
              <div class="stat-label">وضعیت داده</div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">فیلترهای پیشرفته بازار</h2>
          <div class="stats-grid">
            <button class="btn ${filter === 'all' ? 'active' : ''}" onclick="applyFilter('all')"
              style="${filter === 'all' ? 'background: linear-gradient(135deg, #667eea, #a855f7)' : ''}">همه ارزها</button>
            <button class="btn ${filter === 'gainers' ? 'active' : ''}" onclick="applyFilter('gainers')"
              style="${filter === 'gainers' ? 'background: linear-gradient(135deg, #10b981, #059669)' : ''}">ارزهای بازدهی مثبت</button>
            <button class="btn ${filter === 'losers' ? 'active' : ''}" onclick="applyFilter('losers')"
              style="${filter === 'losers' ? 'background: linear-gradient(135deg, #ef4444, #dc2626)' : ''}">ارزهای بازدهی منفی</button>
            <button class="btn ${filter === 'volume' ? 'active' : ''}" onclick="applyFilter('volume')"
              style="${filter === 'volume' ? 'background: linear-gradient(135deg, #3b82f6, #1d4ed8)' : ''}">ارزهای پرحجم</button>
            <button class="btn ${filter === 'marketcap' ? 'active' : ''}" onclick="applyFilter('marketcap')"
              style="${filter === 'marketcap' ? 'background: linear-gradient(135deg, #8b5cf6, #7c3aed)' : ''}">ارزهای با مارکت‌کپ بالا</button>
          </div>
        </div>

        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">تنظیمات محدودیت</h2>
          <div class="stats-grid">
            <button class="btn" onclick="setLimit(50)">50 ارز</button>
            <button class="btn" onclick="setLimit(100)">100 ارز</button>
            <button class="btn" onclick="setLimit(200)">200 ارز</button>
            <button class="btn" onclick="setLimit(500)">500 ارز</button>
            <button class="btn" onclick="location.reload()" style="background: linear-gradient(135deg, #f59e0b, #d97706);">بارگذاری مجدد</button>
          </div>
        </div>

        ${filteredCoins.length > 0 ? `
        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">لیست ارزها (${filteredCoins.length} ارز)</h2>
          <div style="max-height: 800px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; background: rgba(0,0,0,0.2);">
            <table class="data-table">
              <thead style="position: sticky; top: 0; background: rgba(30,35,50,0.95); z-index: 10; backdrop-filter: blur(20px);">
                <tr>
                  <th>#</th>
                  <th>نماد</th>
                  <th>نام</th>
                  <th>قیمت (USDT)</th>
                  <th>تغییرات 24h</th>
                  <th>حجم معاملات</th>
                  <th>مارکت کپ</th>
                  <th>رتبه</th>
                </tr>
              </thead>
              <tbody>
                ${filteredCoins.map((coin, index) => {
                  // پیدا کردن فیلد تغییرات قیمت
                  const priceChange = coin.priceChange24h || coin.price_change_24h || coin.change24h || coin.change || coin.priceChange || 0;
                  const changeValue = typeof priceChange === 'number' ? priceChange : parseFloat(priceChange) || 0;
                  
                  // پیدا کردن فیلد حجم
                  const volumeValue = coin.volume || coin.total_volume || 0;
                  const volumeDisplay = volumeValue >= 1e9 ? (volumeValue / 1e9).toFixed(2) + 'B' :
                    volumeValue >= 1e6 ? (volumeValue / 1e6).toFixed(1) + 'M' :
                    volumeValue >= 1e3 ? (volumeValue / 1e3).toFixed(0) + 'K' : '0';
                  
                  // مارکت کپ
                  const marketCapValue = coin.marketCap || coin.market_cap || 0;
                  const marketCapDisplay = marketCapValue >= 1e9 ? (marketCapValue / 1e9).toFixed(2) + 'B' :
                    marketCapValue >= 1e6 ? (marketCapValue / 1e6).toFixed(1) + 'M' :
                    marketCapValue >= 1e3 ? (marketCapValue / 1e3).toFixed(0) + 'K' : '0';
                  
                  // رتبه
                  const rank = coin.rank || index + 1;
                  
                  // رنگ‌بندی تغییرات
                  const changeColor = changeValue > 5 ? '#10b981' :
                    changeValue > 0 ? '#22c55e' :
                    changeValue < -5 ? '#ef4444' :
                    changeValue < 0 ? '#f87171' : '#94a3b8';
                  
                  const changeIcon = changeValue > 0 ? '📈' : changeValue < 0 ? '📉' : '➡️';
                  
                  return `
                    <tr>
                      <td style="font-weight: bold; color: #f115f9;">${rank}</td>
                      <td><strong style="color: #e2e8f0;">${coin.symbol || 'N/A'}</strong></td>
                      <td style="color: #cbd5e1; font-size: 0.9rem;">${coin.name || 'Unknown'}</td>
                      <td style="font-weight: bold; color: #f8fafc;">$${coin.price ? parseFloat(coin.price).toFixed(4) : '0.0000'}</td>
                      <td style="color: ${changeColor}; font-weight: bold; font-size: 0.95rem;">
                        ${changeIcon} ${changeValue.toFixed(2)}%
                      </td>
                      <td style="color: #60a5fa;">${volumeDisplay}</td>
                      <td style="color: #c084fc; font-weight: bold;">${marketCapDisplay}</td>
                      <td style="color: #94a3b8; text-align: center;">#${rank}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; text-align: center; color: #94a3b8;">
            <p>نمایش <strong style="color: #f115f9;">${filteredCoins.length}</strong> ارز از <strong style="color: #10b981;">${coins.length}</strong> ارز دریافت شده | برای اسکرول از ماوس استفاده کنید</p>
            <p>آخرین بروزرسانی: ${new Date().toLocaleString('fa-IR')}</p>
          </div>
        </div>
        ` : `
        <div class="glass-card">
          <div style="text-align: center; padding: 60px; color: #94a3b8; background: rgba(255,255,255,0.03); border-radius: 15px;">
            <div style="font-size: 4rem; margin-bottom: 20px;">🔄</div>
            <h3 style="color: #f115f9; margin-bottom: 15px;">در حال بارگذاری داده‌ها</h3>
            <p>سیستم در حال دریافت اطلاعات از API بازار است</p>
            <div style="margin-top: 30px;">
              <button class="btn" onclick="location.reload()" style="margin: 5px;">بارگذاری مجدد</button>
              <button class="btn" onclick="window.location.href='/api/test-api'" style="margin: 5px; background: linear-gradient(135deg, #8b5cf6, #7c3aed);">تست API</button>
              <button class="btn" onclick="window.location.href='/api/health'" style="margin: 5px; background: linear-gradient(135deg, #10b981, #059669);">سلامت سیستم</button>
              <button class="btn" onclick="window.location.href='/debug'" style="margin: 5px; background: linear-gradient(135deg, #ef4444, #dc2626);">دیباگ سیستم</button>
            </div>
          </div>
        </div>
        `}

        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">اطلاعات دیباگ</h2>
          <div class="debug-panel">
            <strong>لاگ‌های اخیر:</strong><br>
            ${debugSystem.logs.slice(-5).map(log => 
              `[${new Date(log.timestamp).toLocaleTimeString('fa-IR')}] ${log.level}: ${log.message}`
            ).join('<br>')}
          </div>
        </div>

        <script>
          function applyFilter(filterType) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('filter', filterType);
            window.location.href = currentUrl.toString();
          }

          function setLimit(limitCount) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('limit', limitCount);
            window.location.href = currentUrl.toString();
          }

          function applyFilterWithScroll(filterType) {
            applyFilter(filterType);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }

          function refreshPage() {
            location.reload();
            window.scrollTo(0, 0);
          }

          // اتورفرش هر 30 ثانیه
          setTimeout(() => {
            if (${filteredCoins.length} === 0) {
              location.reload();
            }
          }, 30000);
        </script>
      `;

      res.send(generateModernPage(`اسکن بازار - ${filteredCoins.length} ارز`, bodyContent, 'scan'));
    } catch (error) {
      debugSystem.log('ERROR', 'Scan page error', error.message);
      res.status(500).send('خطا در بارگذاری صفحه اسکن');
    }
  });

  // صفحه دیباگ
  router.get('/debug', async (req, res) => {
    try {
      const analysis = debugSystem.analyzeServer();
      
      const bodyContent = `
        <div class="header">
          <h1>سیستم دیباگ پیشرفته</h1>
          <p>بررسی کامل وضعیت سرور و شناسایی مشکلات</p>
        </div>

        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">آنالیز فوری سرور</h2>
          <div style="text-align: center; margin-bottom: 20px;">
            <button class="btn" onclick="runQuickAnalysis()" style="background: linear-gradient(135deg, #ef4444, #dc2626);">اجرای آنالیز فوری (5 ثانیه)</button>
            <button class="btn" onclick="location.reload()">بروزرسانی صفحه</button>
          </div>
          
          <div id="analysisResult" style="display: none;">
            <!-- نتایج آنالیز اینجا نمایش داده می‌شود -->
          </div>
        </div>

        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">مشکلات شناسایی شده</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${analysis.issues.length}</div>
              <div class="stat-label">مشکل شناسایی شده</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analysis.apiHealth.failedRequests}</div>
              <div class="stat-label">خطای API</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</div>
              <div class="stat-label">مصرف حافظه</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analysis.apiHealth.successRate}</div>
              <div class="stat-label">موفقیت API</div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">لیست مشکلات</h2>
          <div style="background: rgba(255,0,0,0.1); border-radius: 10px; padding: 15px;">
            ${analysis.issues.map(issue => `
              <div style="color: #ef4444; margin: 10px 0; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px;">
                ⚠️ ${issue}
              </div>
            `).join('')}
            ${analysis.issues.length === 0 ? `
              <div style="color: #10b981; text-align: center; padding: 20px;">
                ✅ هیچ مشکل بحرانی شناسایی نشد
              </div>
            ` : ''}
          </div>
        </div>

        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">پیشنهادات سیستم</h2>
          <div style="background: rgba(0,255,0,0.1); border-radius: 10px; padding: 15px;">
            ${analysis.recommendations.map(rec => `
              <div style="color: #10b981; margin: 10px 0; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px;">
                💡 ${rec}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="glass-card">
          <h2 style="color: #f115f9; text-align: center; margin-bottom: 25px;">لاگ‌های اخیر سیستم</h2>
          <div class="debug-panel">
            ${debugSystem.logs.slice(-20).map(log => `
              <div style="color: ${log.level === 'ERROR' ? '#ef4444' : log.level === 'WARN' ? '#f59e0b' : '#10b981'}; margin: 5px 0;">
                [${new Date(log.timestamp).toLocaleString('fa-IR')}] ${log.level}: ${log.message}
                ${log.data ? `<br><small style="color: #94a3b8;">${JSON.stringify(log.data)}</small>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <script>
          function runQuickAnalysis() {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = 'در حال آنالیز...';
            button.disabled = true;

            // شبیه‌سازی آنالیز
            setTimeout(() => {
              location.reload();
            }, 5000);
          }

          // اتورفرش هر 10 ثانیه
          setInterval(() => {
            if (${analysis.issues.length} > 0) {
              location.reload();
            }
          }, 10000);
        </script>
      `;

      res.send(generateModernPage("دیباگ سیستم", bodyContent, 'debug'));
    } catch (error) {
      debugSystem.log('ERROR', 'Debug page error', error.message);
      res.status(500).send('خطا در بارگذاری صفحه دیباگ');
    }
  });
