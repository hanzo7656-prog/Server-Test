const express = require('express');
const constants = require('./config/constants');

const router = express.Router();

// تابع تولید صفحه Vortex (موجود)
function generateVortexPage(title, bodyContent, customStyles = "") {
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #333;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 40px 20px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .header h1 {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
      margin-bottom: 40px;
    }
    .status-card {
      background: rgba(255, 255, 255, 0.95);
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: all 0.3s ease;
      border-left: 5px solid #3498db;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .status-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    .status-card.good {
      border-left-color: #27ae60;
      background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(255, 255, 255, 0.95));
    }
    .status-card.warning {
      border-left-color: #f39c12;
      background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(255, 255, 255, 0.95));
    }
    .status-card.danger {
      border-left-color: #e74c3c;
      background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(255, 255, 255, 0.95));
    }
    .card-icon { font-size: 3rem; margin-bottom: 15px; }
    .metric { font-size: 2.5rem; font-weight: bold; color: #2c3e50; margin: 10px 0; }
    .metric-label { color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .back-button {
      display: inline-flex; align-items: center; gap: 8px; padding: 12px 25px;
      background: linear-gradient(135deg, #3498db, #2980b9); color: white;
      text-decoration: none; border-radius: 25px; margin: 10px; transition: all 0.3s ease;
      font-weight: bold; box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
      backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .back-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
    }
    ${customStyles}
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - VortexAI Pro</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">${bodyContent}</div>
</body>
</html>`;
}

// تابع کارت وضعیت (موجود)
function generateStatusCard(icon, metric, label, details, cardClass = "") {
  return `
    <div class="status-card ${cardClass}">
      <div class="card-icon">${icon}</div>
      <div class="metric">${metric}</div>
      <div class="metric-label">${label}</div>
      <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">${details}</div>
    </div>
  `;
}

// --- Routes ---
module.exports = ({ gistManager, wsManager, apiClient }) => {

  // ==================== صفحه اصلی ====================
  router.get("/", (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();

    const wsCard = generateStatusCard(
      '📡',
      wsStatus.connected ? 'Connected' : 'Disconnected',
      'WebSocket Status',
      `<strong>Active Coins:</strong> ${wsStatus.active_coins}<br>
      <strong>Subscribed:</strong> ${wsStatus.total_subscribed}<br>
      <strong>Provider:</strong> LBank`,
      wsStatus.connected ? 'good' : 'danger'
    );

    const gistCard = generateStatusCard(
      '💾',
      Object.keys(gistData.prices || {}).length,
      'Historical Storage',
      `<strong>Gist:</strong> ${process.env.GITHUB_TOKEN ? 'Active' : 'Inactive'}<br>
      <strong>Layers:</strong> 6 Timeframes<br>
      <strong>Last Updated:</strong> ${new Date(gistData.last_updated).toLocaleDateString()}`,
      process.env.GITHUB_TOKEN ? 'good' : 'warning'
    );

    const aiCard = generateStatusCard(
      '🤖',
      '55+',
      'AI Indicators & Patterns',
      `<strong>VortexAI:</strong> Ready<br>
      <strong>Analysis:</strong> Advanced<br>
      <strong>Patterns:</strong> 25+ Detected`,
      'good'
    );

    const newApisCard = generateStatusCard(
      '🚀',
      '8+',
      'New APIs',
      `<strong>Market Data:</strong> Active<br>
      <strong>News:</strong> Live Feed<br>
      <strong>Analysis:</strong> Enhanced`,
      'good'
    );

    const timeframeGrid = `
      <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 15px; margin-bottom: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
        <h2 style="text-align: center; color: #2c3e50; margin-bottom: 25px;">⏰ Multi-Timeframe Data Layers</h2>
        <div class="timeframe-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
          ${['1H/1-min/60', '4H/5-min/48', '24H/15-min/96', '7D/1-hour/168', '30D/4-hour/180', '180D/1-day/180']
            .map(tf => {
              const [name, interval, records] = tf.split('/');
              return `
                <div class="timeframe-card" style="background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 12px; text-align: center; transition: all 0.3s ease;">
                  <strong>${name}</strong><br><small>${interval} intervals</small><br>
                  <span style="color: #27ae60; font-weight: bold;">${records} records</span>
                </div>
              `;
            }).join('')}
        </div>
      </div>
    `;

    const navGrid = `
      <h2 style="text-align: center; color: white; margin: 40px 0 25px 0;">🧭 Quick Navigation</h2>
      <div class="links-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 40px 0;">
        ${[
          { href: '/health', text: 'System Health Dashboard', class: 'health' },
          { href: '/scan', text: 'Market Scanner', class: 'scan' },
          { href: '/analysis?symbol=btc_usdt', text: 'Technical Analysis', class: 'analysis' },
          { href: '/timeframes-api', text: 'Timeframes API', class: 'timeframes' },
          { href: '/api-data', text: 'API Data', class: 'api' },
          { href: '/health-api', text: 'Health API', class: 'health' },
          { href: '/market-cap', text: 'Market Cap Data', class: 'new-api' },
          { href: '/currencies', text: 'Currencies List', class: 'new-api' },
          { href: '/crypto-news', text: 'Crypto News', class: 'new-api' },
          { href: '/advanced-tech', text: 'Advanced Analysis', class: 'new-api' }
        ].map(link => `
          <a href="${link.href}" class="nav-link" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 25px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 15px; text-align: center; transition: all 0.3s ease; font-weight: bold; font-size: 1.1rem; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
            ${link.text}
          </a>
        `).join('')}
      </div>
    `;

    const footer = `
      <div class="footer" style="text-align: center; margin-top: 50px; padding: 30px; background: rgba(255, 255, 255, 0.9); border-radius: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
        <div style="margin-bottom: 20px;">
          ${['Real-time WebSocket', '6-Layer Historical Data', 'VortexAI Analysis', '55+ Indicators', 'Live News Feed', 'Market Analytics']
            .map(badge => `
              <span class="feature-badge" style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem; margin: 5px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                ${badge}
              </span>
            `).join('')}
        </div>
        <p><strong>🕒 Server Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>🚀 Version:</strong> 6.0 - Enhanced API System</p>
        <p><strong>🌐 Environment:</strong> Production Ready</p>
        <p><strong>📊 Active Pairs:</strong> ${constants.ALL_TRADING_PAIRS.length} Trading Pairs</p>
      </div>
    `;

    const bodyContent = `
      <div class="header">
        <h1>🚀 VortexAI Pro</h1>
        <p>Advanced Cryptocurrency Market Scanner with 55+ Technical Indicators & Real-time AI Analysis</p>
      </div>
      <div class="status-grid">${wsCard}${gistCard}${aiCard}${newApisCard}</div>
      ${timeframeGrid}
      ${navGrid}
      ${footer}
    `;

    res.send(generateVortexPage('VortexAI Pro Dashboard', bodyContent));
  });

  // ==================== صفحات جدید برای APIهای جدید ====================

  // صفحه Market Cap
  router.get('/market-cap', (req, res) => {
    const marketCapStyles = `
      .data-card {
        background: rgba(255, 255, 255, 0.95);
        padding: 30px;
        border-radius: 15px;
        margin: 20px 0;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .metric-large {
        font-size: 3rem;
        font-weight: bold;
        color: #2c3e50;
        text-align: center;
        margin: 20px 0;
      }
      .metric-change {
        font-size: 1.2rem;
        font-weight: bold;
        padding: 8px 16px;
        border-radius: 20px;
        display: inline-block;
      }
      .positive { background: #27ae60; color: white; }
      .negative { background: #e74c3c; color: white; }
    `;

    const bodyContent = `
      <div class="header">
        <h1>📊 Global Market Cap</h1>
        <p>Real-time cryptocurrency market capitalization and dominance data</p>
      </div>

      <div class="data-card">
        <h2 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">Market Overview</h2>
        <div id="marketData" style="text-align: center; padding: 40px; color: #7f8c8d;">
          Loading market data...
        </div>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="/" class="back-button">🏠 Dashboard</a>
        <a href="/api/markets/cap" target="_blank" class="back-button" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">🔗 API Endpoint</a>
        <a href="/currencies" class="back-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">💱 Currencies</a>
      </div>

      <script>
        async function loadMarketData() {
          try {
            const response = await fetch('/api/markets/cap');
            const data = await response.json();
            
            if (data.success) {
              const market = data.data;
              document.getElementById('marketData').innerHTML = \`
                <div class="metric-large">$\${(market.marketCap / 1000000000000).toFixed(2)}T</div>
                <p>Total Market Capitalization</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px;">
                  <div>
                    <h3>24h Volume</h3>
                    <p style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">
                      $\${(market.volume / 1000000000).toFixed(1)}B
                    </p>
                    <span class="metric-change \${market.volumeChange >= 0 ? 'positive' : 'negative'}">
                      \${market.volumeChange >= 0 ? '+' : ''}\${market.volumeChange}%
                    </span>
                  </div>
                  
                  <div>
                    <h3>Bitcoin Dominance</h3>
                    <p style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">
                      \${market.btcDominance}%
                    </p>
                    <span class="metric-change \${market.btcDominanceChange >= 0 ? 'positive' : 'negative'}">
                      \${market.btcDominanceChange >= 0 ? '+' : ''}\${market.btcDominanceChange}%
                    </span>
                  </div>
                  
                  <div>
                    <h3>Market Change</h3>
                    <p style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">
                      \${market.marketCapChange}%
                    </p>
                    <span class="metric-change \${market.marketCapChange >= 0 ? 'positive' : 'negative'}">
                      \${market.marketCapChange >= 0 ? '+' : ''}\${market.marketCapChange}%
                    </span>
                  </div>
                </div>
              \`;
            }
          } catch (error) {
            document.getElementById('marketData').innerHTML = \`
              <div style="color: #e74c3c; text-align: center;">
                Error loading market data. Please try again.
              </div>
            \`;
          }
        }

        loadMarketData();
      </script>
    `;

    res.send(generateVortexPage('Market Cap', bodyContent, marketCapStyles));
  });

  // صفحه Currencies
  router.get('/currencies', (req, res) => {
    const currenciesStyles = `
      .currencies-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
        margin: 25px 0;
      }
      .currency-item {
        background: rgba(255, 255, 255, 0.9);
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .currency-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }
      .currency-symbol {
        font-size: 1.8rem;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 8px;
      }
    `;

    const bodyContent = `
      <div class="header">
        <h1>💱 Global Currencies</h1>
        <p>List of supported fiat currencies and exchange rates</p>
      </div>

      <div class="data-card">
        <h2 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">Available Currencies</h2>
        <div id="currenciesData" style="text-align: center; padding: 20px; color: #7f8c8d;">
          Loading currencies data...
        </div>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="/" class="back-button">🏠 Dashboard</a>
        <a href="/api/currencies" target="_blank" class="back-button" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">🔗 API Endpoint</a>
        <a href="/market-cap" class="back-button" style="background: linear-gradient(135deg, #3498db, #2980b9);">📊 Market Cap</a>
      </div>

      <script>
        async function loadCurrenciesData() {
          try {
            const response = await fetch('/api/currencies');
            const data = await response.json();
            
            if (data.success && data.data && data.data.length > 0) {
              const currenciesHTML = data.data.map(currency => \`
                <div class="currency-item">
                  <div class="currency-symbol">\${currency.symbol || currency.code || 'N/A'}</div>
                  <div style="font-size: 0.9rem; color: #7f8c8d;">\${currency.name || 'Currency'}</div>
                </div>
              \`).join('');

              document.getElementById('currenciesData').innerHTML = \`
                <p style="margin-bottom: 20px; color: #2c3e50;"><strong>\${data.count} currencies found</strong></p>
                <div class="currencies-grid">\${currenciesHTML}</div>
              \`;
            } else {
              document.getElementById('currenciesData').innerHTML = \`
                <div style="color: #f39c12; text-align: center;">
                  No currencies data available. Showing sample data.
                </div>
                <div class="currencies-grid" style="margin-top: 20px;">
                  \${['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'].map(curr => \`
                    <div class="currency-item">
                      <div class="currency-symbol">\${curr}</div>
                      <div style="font-size: 0.9rem; color: #7f8c8d;">\${getCurrencyName(curr)}</div>
                    </div>
                  \`).join('')}
                </div>
              \`;
            }
          } catch (error) {
            document.getElementById('currenciesData').innerHTML = \`
              <div style="color: #e74c3c; text-align: center;">
                Error loading currencies data. Please try again.
              </div>
            \`;
          }
        }

        function getCurrencyName(symbol) {
          const names = {
            'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound',
            'JPY': 'Japanese Yen', 'CAD': 'Canadian Dollar', 'AUD': 'Australian Dollar',
            'CHF': 'Swiss Franc', 'CNY': 'Chinese Yuan'
          };
          return names[symbol] || 'Currency';
        }

        loadCurrenciesData();
      </script>
    `;

    res.send(generateVortexPage('Currencies', bodyContent, currenciesStyles));
  });

  // صفحه Crypto News
  router.get('/crypto-news', (req, res) => {
    const newsStyles = `
      .news-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 25px;
        margin: 25px 0;
      }
      .news-card {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .news-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      }
      .news-image {
        width: 100%;
        height: 200px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 3rem;
      }
      .news-content {
        padding: 25px;
      }
      .news-title {
        font-size: 1.2rem;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 10px;
        line-height: 1.4;
      }
      .news-source {
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 10px;
      }
      .news-date {
        color: #95a5a6;
        font-size: 0.8rem;
      }
      .pagination {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin: 30px 0;
      }
      .page-btn {
        padding: 10px 20px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .page-btn.active {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
      }
    `;

    const bodyContent = `
      <div class="header">
        <h1>📰 Cryptocurrency News</h1>
        <p>Latest cryptocurrency news and market insights from trusted sources</p>
      </div>

      <div class="data-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
          <h2 style="color: #2c3e50; margin: 0;">Latest News</h2>
          <div>
            <button onclick="loadNews(1)" class="page-btn active">Latest</button>
            <button onclick="loadNewsSources()" class="page-btn">News Sources</button>
          </div>
        </div>

        <div id="newsContainer">
          <div style="text-align: center; padding: 60px 20px; color: #7f8c8d;">
            <div style="font-size: 3rem; margin-bottom: 20px;">📰</div>
            Loading latest cryptocurrency news...
          </div>
        </div>

        <div class="pagination" id="pagination" style="display: none;">
          <button onclick="changePage(-1)" class="page-btn">← Previous</button>
          <span style="padding: 10px 20px; color: #2c3e50;">Page <span id="currentPage">1</span></span>
          <button onclick="changePage(1)" class="page-btn">Next →</button>
        </div>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="/" class="back-button">🏠 Dashboard</a>
        <a href="/api/news" target="_blank" class="back-button" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">🔗 API Endpoint</a>
        <a href="/api/news/sources" target="_blank" class="back-button" style="background: linear-gradient(135deg, #f39c12, #e67e22);">📋 News Sources</a>
      </div>

      <script>
        let currentPage = 1;
        const itemsPerPage = 6;

        async function loadNews(page = 1) {
          currentPage = page;
          document.getElementById('newsContainer').innerHTML = \`
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
              Loading news page \${page}...
            </div>
          \`;

          try {
            const response = await fetch(\`/api/news?page=\${page}&limit=\${itemsPerPage}\`);
            const data = await response.json();
            
            if (data.success && data.data && data.data.result) {
              displayNews(data.data.result, data.pagination);
            } else {
              showSampleNews();
            }
          } catch (error) {
            showSampleNews();
          }
        }

        function displayNews(newsItems, pagination) {
          if (!newsItems || newsItems.length === 0) {
            document.getElementById('newsContainer').innerHTML = \`
              <div style="text-align: center; padding: 60px 20px; color: #f39c12;">
                <div style="font-size: 3rem; margin-bottom: 20px;">📰</div>
                No news articles found at the moment.
              </div>
            \`;
            document.getElementById('pagination').style.display = 'none';
            return;
          }

          const newsHTML = newsItems.map(item => \`
            <div class="news-card">
              <div class="news-image">
                \${item.imgUrl ? \`<img src="\${item.imgUrl}" alt="\${item.title}" style="width: 100%; height: 100%; object-fit: cover;">\` : '📰'}
              </div>
              <div class="news-content">
                <div class="news-title">\${item.title || 'No title available'}</div>
                <div class="news-source">Source: \${item.source || 'Unknown'}</div>
                <div class="news-date">
                  \${item.feedDate ? new Date(item.feedDate).toLocaleDateString() : 'Date unknown'}
                </div>
                \${item.link ? \`<a href="\${item.link}" target="_blank" style="display: inline-block; margin-top: 15px; padding: 8px 16px; background: #3498db; color: white; text-decoration: none; border-radius: 8px; font-size: 0.9rem;">Read More</a>\` : ''}
              </div>
            </div>
          \`).join('');

          document.getElementById('newsContainer').innerHTML = \`
            <div class="news-grid">\${newsHTML}</div>
          \`;

          // Update pagination
          document.getElementById('currentPage').textContent = pagination.page;
          document.getElementById('pagination').style.display = 'flex';
        }

        async function loadNewsSources() {
          try {
            const response = await fetch('/api/news/sources');
            const data = await response.json();
            
            if (data.success && data.data) {
              const sourcesHTML = data.data.map(source => \`
                <div class="news-card">
                  <div class="news-content">
                    <div class="news-title">\${source.name || 'Unknown Source'}</div>
                    <div class="news-source">\${source.domain || 'No domain'}</div>
                    \${source.url ? \`<a href="\${source.url}" target="_blank" style="display: inline-block; margin-top: 15px; padding: 8px 16px; background: #27ae60; color: white; text-decoration: none; border-radius: 8px; font-size: 0.9rem;">Visit Source</a>\` : ''}
                  </div>
                </div>
              \`).join('');

              document.getElementById('newsContainer').innerHTML = \`
                <h3 style="color: #2c3e50; margin-bottom: 20px;">News Sources (\${data.count || data.data.length})</h3>
                <div class="news-grid">\${sourcesHTML}</div>
              \`;
              document.getElementById('pagination').style.display = 'none';
            }
          } catch (error) {
            document.getElementById('newsContainer').innerHTML = \`
              <div style="text-align: center; padding: 60px 20px; color: #e74c3c;">
                Error loading news sources.
              </div>
            \`;
          }
        }

        function changePage(direction) {
          const newPage = currentPage + direction;
          if (newPage >= 1) {
            loadNews(newPage);
          }
        }

        function showSampleNews() {
          const sampleNews = [
            {
              title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
              source: "CryptoNews",
              feedDate: Date.now() - 2 * 60 * 60 * 1000,
              imgUrl: null
            },
            {
              title: "Ethereum 2.0 Upgrade Shows Promising Results for Scalability",
              source: "BlockchainDaily",
              feedDate: Date.now() - 4 * 60 * 60 * 1000,
              imgUrl: null
            },
            {
              title: "DeFi Protocols See Record TVL as Yield Farming Intensifies",
              source: "DeFiPulse",
              feedDate: Date.now() - 6 * 60 * 60 * 1000,
              imgUrl: null
            }
          ];

          document.getElementById('newsContainer').innerHTML = \`
            <div style="color: #f39c12; text-align: center; margin-bottom: 20px;">
              Using sample news data. Real news feed will be available when connected to news API.
            </div>
            <div class="news-grid">
              \${sampleNews.map(item => \`
                <div class="news-card">
                  <div class="news-image">📰</div>
                  <div class="news-content">
                    <div class="news-title">\${item.title}</div>
                    <div class="news-source">Source: \${item.source}</div>
                    <div class="news-date">
                      \${new Date(item.feedDate).toLocaleDateString()}
                    </div>
                    <div style="margin-top: 15px; padding: 8px 16px; background: #95a5a6; color: white; border-radius: 8px; font-size: 0.9rem; display: inline-block;">
                      Sample Data
                    </div>
                  </div>
                </div>
              \`).join('')}
            </div>
          \`;
          document.getElementById('pagination').style.display = 'none';
        }

        // Load initial news
        loadNews(1);
      </script>
    `;

    res.send(generateVortexPage('Crypto News', bodyContent, newsStyles));
  });

  // صفحه Advanced Technical Analysis
  router.get('/advanced-tech', (req, res) => {
    const advancedStyles = `
      .indicators-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin: 25px 0;
      }
      .indicator-item {
        background: rgba(255, 255, 255, 0.9);
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .indicator-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }
      .indicator-value {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 10px 0;
      }
      .bullish { color: #27ae60; }
      .bearish { color: #e74c3c; }
      .neutral { color: #f39c12; }
      .pattern-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin: 25px 0;
      }
      .pattern-item {
        background: rgba(255, 255, 255, 0.9);
        padding: 15px;
        border-radius: 10px;
        text-align: center;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .pattern-detected {
        background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(255, 255, 255, 0.9));
        border-left: 4px solid #27ae60;
      }
      .pattern-not-detected {
        background: rgba(255, 255, 255, 0.8);
        border-left: 4px solid #bdc3c7;
      }
    `;

    const bodyContent = `
      <div class="header">
        <h1>🔬 Advanced Technical Analysis</h1>
        <p>55+ Technical Indicators & Pattern Recognition with AI-Powered Insights</p>
      </div>

      <div class="data-card">
        <div style="text-align: center; margin-bottom: 30px;">
          <select id="symbolSelect" onchange="loadAdvancedAnalysis()" style="padding: 12px 20px; border: 2px solid #e1e8ed; border-radius: 10px; font-size: 16px; background: white; margin-right: 15px;">
            <option value="btc_usdt">BTC/USDT</option>
            <option value="eth_usdt">ETH/USDT</option>
            <option value="sol_usdt">SOL/USDT</option>
            <option value="ada_usdt">ADA/USDT</option>
            <option value="doge_usdt">DOGE/USDT</option>
          </select>
          <select id="timeframeSelect" onchange="loadAdvancedAnalysis()" style="padding: 12px 20px; border: 2px solid #e1e8ed; border-radius: 10px; font-size: 16px; background: white;">
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
          </select>
        </div>

        <div id="analysisResults">
          <div style="text-align: center; padding: 60px 20px; color: #7f8c8d;">
            <div style="font-size: 3rem; margin-bottom: 20px;">🔍</div>
            Select a symbol and timeframe to load advanced technical analysis...
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="/" class="back-button">🏠 Dashboard</a>
        <a href="/analysis?symbol=btc_usdt" class="back-button" style="background: linear-gradient(135deg, #3498db, #2980b9);">📈 Basic Analysis</a>
        <a href="/api/coin/btc_usdt/technical" target="_blank" class="back-button" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">🔗 API Endpoint</a>
      </div>

      <script>
        async function loadAdvancedAnalysis() {
          const symbol = document.getElementById('symbolSelect').value;
          const timeframe = document.getElementById('timeframeSelect').value;

          document.getElementById('analysisResults').innerHTML = \`
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
              Loading advanced analysis for \${symbol.toUpperCase()}...
            </div>
          \`;

          try {
            const response = await fetch(\`/api/coin/\${symbol}/technical\`);
            const data = await response.json();
            
            if (data.success) {
              displayAdvancedAnalysis(data, symbol);
            } else {
              showSampleAnalysis(symbol);
            }
          } catch (error) {
            showSampleAnalysis(symbol);
          }
        }

        function displayAdvancedAnalysis(data, symbol) {
          const indicators = data.technical_indicators;
          
          // اندیکاتورهای کلیدی
          const keyIndicatorsHTML = \`
            <h3 style="color: #2c3e50; margin-bottom: 20px;">Key Technical Indicators</h3>
            <div class="indicators-grid">
              <div class="indicator-item">
                <div>RSI</div>
                <div class="indicator-value \${getRSIColor(indicators.rsi)}">\${indicators.rsi?.toFixed(2) || 'N/A'}</div>
                <div style="font-size: 0.8rem; color: #7f8c8d;">Momentum</div>
              </div>
              <div class="indicator-item">
                <div>MACD</div>
                <div class="indicator-value \${indicators.macd > 0 ? 'bullish' : 'bearish'}">\${indicators.macd?.toFixed(4) || 'N/A'}</div>
                <div style="font-size: 0.8rem; color: #7f8c8d;">Trend</div>
              </div>
              <div class="indicator-item">
                <div>Stochastic K</div>
                <div class="indicator-value \${getStochasticColor(indicators.stochastic_k)}">\${indicators.stochastic_k?.toFixed(2) || 'N/A'}</div>
                <div style="font-size: 0.8rem; color: #7f8c8d;">Momentum</div>
              </div>
              <div class="indicator-item">
                <div>Ichimoku</div>
                <div class="indicator-value \${indicators.ichimoku_conversion > indicators.ichimoku_base ? 'bullish' : 'bearish'}">\${indicators.ichimoku_conversion > indicators.ichimoku_base ? 'Bull' : 'Bear'}</div>
                <div style="font-size: 0.8rem; color: #7f8c8d;">Cloud</div>
              </div>
            </div>
          \`;

          // الگوهای تشخیص داده شده
          const detectedPatterns = Object.entries(indicators)
            .filter(([key, value]) => key.startsWith('pattern_') && value === true)
            .map(([key]) => key.replace('pattern_', '').replace(/_/g, ' '));

          const patternsHTML = \`
            <h3 style="color: #2c3e50; margin: 40px 0 20px 0;">Detected Patterns (\${detectedPatterns.length})</h3>
            <div class="pattern-grid">
              \${detectedPatterns.length > 0 ? 
                detectedPatterns.map(pattern => \`
                  <div class="pattern-item pattern-detected">
                    <div style="font-weight: bold; color: #27ae60; margin-bottom: 8px;">✅</div>
                    <div style="font-size: 0.9rem; text-transform: capitalize;">\${pattern}</div>
                  </div>
                \`).join('') :
                '<div style="text-align: center; color: #7f8c8d; padding: 20px;">No significant patterns detected</div>'
              }
            </div>
          \`;

          // اطلاعات کلی
          const summaryHTML = \`
            <div style="background: rgba(255, 255, 255, 0.9); padding: 25px; border-radius: 12px; margin: 30px 0; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
              <h3 style="color: #2c3e50; margin-bottom: 15px;">Analysis Summary</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                  <strong>Current Price:</strong><br>
                  <span style="font-size: 1.2rem; font-weight: bold; color: #2c3e50;">$\${data.current_price?.toFixed(2) || 'N/A'}</span>
                </div>
                <div>
                  <strong>Data Points:</strong><br>
                  <span style="font-size: 1.2rem; font-weight: bold; color: #2c3e50;">\${data.data_points || 0}</span>
                </div>
                <div>
                  <strong>AI Sentiment:</strong><br>
                  <span style="font-size: 1.2rem; font-weight: bold; color: \${getSentimentColor(data.vortexai_analysis?.market_sentiment)}">\${data.vortexai_analysis?.market_sentiment || 'NEUTRAL'}</span>
                </div>
                <div>
                  <strong>Processing Time:</strong><br>
                  <span style="font-size: 1.2rem; font-weight: bold; color: #2c3e50;">\${data.processing_time || 'N/A'}</span>
                </div>
              </div>
            </div>
          \`;

          document.getElementById('analysisResults').innerHTML = \`
            \${summaryHTML}
            \${keyIndicatorsHTML}
            \${patternsHTML}
            <div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 0.9rem;">
              Analyzing with 55+ technical indicators and pattern recognition algorithms
            </div>
          \`;
        }

        function getRSIColor(rsi) {
          if (!rsi) return 'neutral';
          if (rsi > 70) return 'bearish';
          if (rsi < 30) return 'bullish';
          return 'neutral';
        }

        function getStochasticColor(k) {
          if (!k) return 'neutral';
          if (k > 80) return 'bearish';
          if (k < 20) return 'bullish';
          return 'neutral';
        }

        function getSentimentColor(sentiment) {
          const colors = {
            'BULLISH': '#27ae60',
            'BEARISH': '#e74c3c', 
            'NEUTRAL': '#f39c12'
          };
          return colors[sentiment] || '#95a5a6';
        }

        function showSampleAnalysis(symbol) {
          document.getElementById('analysisResults').innerHTML = \`
            <div style="color: #f39c12; text-align: center; margin-bottom: 20px;">
              Using sample analysis data for demonstration.
            </div>
            <div style="background: rgba(255, 255, 255, 0.9); padding: 25px; border-radius: 12px; margin: 30px 0; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
              <h3 style="color: #2c3e50; margin-bottom: 15px;">Sample Analysis for \${symbol.toUpperCase()}</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div class="indicator-item">
                  <div>RSI</div>
                  <div class="indicator-value bullish">62.5</div>
                </div>
                <div class="indicator-item">
                  <div>MACD</div>
                  <div class="indicator-value bullish">0.015</div>
                </div>
                <div class="indicator-item">
                  <div>Volume</div>
                  <div class="indicator-value neutral">1.2B</div>
                </div>
                <div class="indicator-item">
                  <div>Trend</div>
                  <div class="indicator-value bullish">Up</div>
                </div>
              </div>
              <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>Sample Patterns Detected:</strong> Hammer, Double Bottom, Ascending Triangle
              </div>
            </div>
          \`;
        }

        // Load analysis for default symbol
        setTimeout(() => loadAdvancedAnalysis(), 1000);
      </script>
    `;

    res.send(generateVortexPage('Advanced Analysis', bodyContent, advancedStyles));
  });

  // بقیه routes موجود (health, scan, analysis, etc.) بدون تغییر می‌مونن
  // ... [کدهای موجود قبلی]

  return router;
};
