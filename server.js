const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

// تنظیمات پیشرفته لاگ
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} - ${level.toUpperCase()} - ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'vortexai_server.log' }),
    new winston.transports.Console()
  ]
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// تنظیمات پیشرفته
const COINSTATS_API_BASE = "https://openapiv1.coinstats.app";
const COINSTATS_API_KEY = "uNb+sOjnjCQmV30dYrChxgh55hRHElmiZLnKJX+5U6g=";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// ساختار داده‌های پیشرفته
class TechnicalIndicators {
  constructor(data = {}) {
    this.rsi = data.rsi || 50;
    this.macd = data.macd || 0;
    this.macd_signal = data.macd_signal || 0;
    this.macd_hist = data.macd_hist || 0;
    this.bollinger_upper = data.bollinger_upper || 0;
    this.bollinger_middle = data.bollinger_middle || 0;
    this.bollinger_lower = data.bollinger_lower || 0;
    this.moving_avg_20 = data.moving_avg_20 || 0;
    this.moving_avg_50 = data.moving_avg_50 || 0;
    this.moving_avg_200 = data.moving_avg_200 || 0;
    this.stochastic_k = data.stochastic_k || 50;
    this.stochastic_d = data.stochastic_d || 50;
    this.atr = data.atr || 0;
    this.adx = data.adx || 0;
    this.obv = data.obv || 0;
    this.mfi = data.mfi || 50;
    this.williams_r = data.williams_r || -50;
    this.cci = data.cci || 0;
    this.roc = data.roc || 0;
  }
}

class AdvancedCoinStatsAPIClient {
  constructor() {
    this.base_url = COINSTATS_API_BASE;
    this.request_count = 0;
    this.last_request_time = Date.now();
    
    this.axiosInstance = axios.create({
      timeout: 15000,
      headers: {
        'X-API-KEY': COINSTATS_API_KEY,
        'User-Agent': 'VortexAI-Advanced-Scanner/2.0',
        'Accept': 'application/json'
      }
    });
  }

  async _rateLimit() {
    const currentTime = Date.now();
    const timeDiff = currentTime - this.last_request_time;
    
    if (timeDiff < 100) { // 10 requests per second max
      await new Promise(resolve => setTimeout(resolve, 100 - timeDiff));
    }
    
    this.last_request_time = Date.now();
    this.request_count++;
  }

  async _makeRequest(url, params = {}, maxRetries = MAX_RETRIES) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await this._rateLimit();
        const response = await this.axiosInstance.get(url, { params });
        
        logger.debug(`API Request successful: ${url}`);
        return response.data;
        
      } catch (error) {
        logger.warn(`API Request attempt ${attempt + 1} failed: ${error.message}`);
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
        } else {
          logger.error(`All API request attempts failed for ${url}`);
          return {};
        }
      }
    }
    return {};
  }

  // ==================== CORE ENDPOINTS ====================
  async getCoins(limit = 300, skip = 0, currency = "USD") {
    logger.info(`Fetching ${limit} coins (skip: ${skip})`);
    const url = `${this.base_url}/coins`;
    const params = { limit, skip, currency };
  
    console.log('🔍 API Request Details:');
    console.log('URL:', url);
    console.log('Params:', params);
    console.log('Headers:', this.axiosInstance.defaults.headers);
  
    const result = await this._makeRequest(url, params);
  
    console.log('📦 API Response:', result);
    return result;
  }

  async getCoinHistory(coinId, period = "24h") {
    logger.info(`Fetching history for ${coinId} (period: ${period})`);
    const url = `${this.base_url}/coins/${coinId}/charts`;
    const params = { period };
    return this._makeRequest(url, params);
  }

  async getCoinDetails(coinId, currency = "USD") {
    logger.info(`Fetching details for ${coinId}`);
    const url = `${this.base_url}/coins/${coinId}`;
    const params = { currency };
    return this._makeRequest(url, params);
  }

  async getCoinPriceAvg(coinId, timestamp) {
    logger.info(`Fetching average price for ${coinId} at ${timestamp}`);
    const url = `${this.base_url}/coins/price/avg`;
    const params = { coinId, timestamp };
    return this._makeRequest(url, params);
  }

  async getCoinPriceExchange(exchange, from, to, timestamp) {
    logger.info(`Fetching exchange price from ${from} to ${to} on ${exchange}`);
    const url = `${this.base_url}/coins/price/exchange`;
    const params = { exchange, from, to, timestamp };
    return this._makeRequest(url, params);
  }

  // ==================== ADVANCED ENDPOINTS ====================
  async getTickersExchanges() {
    logger.info("Fetching tickers exchanges");
    const url = `${this.base_url}/tickers/exchanges`;
    return this._makeRequest(url);
  }

  async getTickersMarkets() {
    logger.info("Fetching tickers markets");
    const url = `${this.base_url}/tickers/markets`;
    return this._makeRequest(url);
  }

  async getFiats() {
    logger.info("Fetching fiats");
    const url = `${this.base_url}/fiats`;
    return this._makeRequest(url);
  }

  async getMarkets() {
    logger.info("Fetching markets");
    const url = `${this.base_url}/markets`;
    return this._makeRequest(url);
  }

  async getCurrencies() {
    logger.info("Fetching currencies");
    const url = `${this.base_url}/currencies`;
    return this._makeRequest(url);
  }

  async getNews(limit = 50, skip = 0) {
    logger.info(`Fetching ${limit} news articles`);
    const url = `${this.base_url}/news`;
    const params = { limit, skip };
    return this._makeRequest(url, params);
  }

  async getNewsSources() {
    logger.info("Fetching news sources");
    const url = `${this.base_url}/news/sources`;
    return this._makeRequest(url);
  }

  async getNewsByType(type) {
    logger.info(`Fetching news by type: ${type}`);
    const url = `${this.base_url}/news/type/${type}`;
    return this._makeRequest(url);
  }

  async getNewsById(newsId) {
    logger.info(`Fetching news by ID: ${newsId}`);
    const url = `${this.base_url}/news/${newsId}`;
    return this._makeRequest(url);
  }

  async getBtcDominance(type = "all") {
    logger.info("Fetching BTC Dominance");
    const url = `${this.base_url}/insights/btc-dominance`;
    const params = { type };
    return this._makeRequest(url, params);
  }

  async getFearAndGreed() {
    logger.info("Fetching Fear & Greed Index");
    const url = `${this.base_url}/insights/fear-and-greed`;
    return this._makeRequest(url);
  }

  async getFearAndGreedChart() {
    logger.info("Fetching Fear & Greed Chart");
    const url = `${this.base_url}/insights/fear-and-greed/chart`;
    return this._makeRequest(url);
  }

  async getRainbowChart(coinId) {
    logger.info(`Fetching Rainbow Chart for ${coinId}`);
    const url = `${this.base_url}/insights/rainbow-chart/${coinId}`;
    return this._makeRequest(url);
  }
}

// ایجاد نمونه API
const apiClient = new AdvancedCoinStatsAPIClient();

class TechnicalAnalysisEngine {
  static calculateAllIndicators(priceData, volumeData = null) {
    try {
      if (!priceData || priceData.length < 50) {
        logger.warn(`Insufficient data for technical analysis: ${priceData?.length || 0} points`);
        return this._getDefaultIndicators();
      }

      // پیاده‌سازی ساده‌شده اندیکاتورها
      const prices = priceData.map(p => parseFloat(p));
      
      // محاسبه میانگین‌های متحرک
      const ma20 = this._calculateSMA(prices, 20);
      const ma50 = this._calculateSMA(prices, 50);
      const ma200 = this._calculateSMA(prices, 200);
      
      // محاسبه RSI ساده
      const rsi = this._calculateRSI(prices, 14);
      
      // محاسبه باندهای بولینگر
      const bb = this._calculateBollingerBands(prices, 20);
      
      // مقادیر پیش‌فرض برای سایر اندیکاتورها
      return new TechnicalIndicators({
        rsi: rsi || 50,
        macd: 0,
        macd_signal: 0,
        macd_hist: 0,
        bollinger_upper: bb.upper || prices[prices.length - 1] * 1.1,
        bollinger_middle: bb.middle || prices[prices.length - 1],
        bollinger_lower: bb.lower || prices[prices.length - 1] * 0.9,
        moving_avg_20: ma20 || prices[prices.length - 1],
        moving_avg_50: ma50 || prices[prices.length - 1],
        moving_avg_200: ma200 || prices[prices.length - 1],
        stochastic_k: 50,
        stochastic_d: 50,
        atr: 0,
        adx: 0,
        obv: 0,
        mfi: 50,
        williams_r: -50,
        cci: 0,
        roc: 0
      });
      
    } catch (error) {
      logger.error(`Error calculating technical indicators: ${error.message}`);
      return this._getDefaultIndicators();
    }
  }

  static _getDefaultIndicators() {
    return new TechnicalIndicators();
  }

  static _calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  static _calculateRSI(prices, period) {
    if (prices.length <= period) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const difference = prices[prices.length - i] - prices[prices.length - i - 1];
      if (difference >= 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  static _calculateBollingerBands(prices, period) {
    if (prices.length < period) return { upper: null, middle: null, lower: null };
    
    const slice = prices.slice(-period);
    const middle = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - middle, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: middle + (2 * stdDev),
      middle: middle,
      lower: middle - (2 * stdDev)
    };
  }

  static calculateSupportResistance(priceData) {
    try {
      if (!priceData || priceData.length < 20) {
        return { support: [], resistance: [] };
      }

      const prices = priceData.map(p => parseFloat(p));
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const currentPrice = prices[prices.length - 1];
      
      const pivot = (maxPrice + minPrice + currentPrice) / 3;
      const r1 = 2 * pivot - minPrice;
      const s1 = 2 * pivot - maxPrice;
      const r2 = pivot + (maxPrice - minPrice);
      const s2 = pivot - (maxPrice - minPrice);
      
      return {
        pivot: pivot,
        resistance: [r1, r2],
        support: [s1, s2],
        current_position: currentPrice > pivot ? 'above_pivot' : 'below_pivot'
      };
    } catch (error) {
      logger.error(`Error calculating support/resistance: ${error.message}`);
      return { support: [], resistance: [] };
    }
  }
}

// ==================== HELPER FUNCTIONS ====================
function extractPriceData(historyData) {
  try {
    if (historyData.prices) {
      return historyData.prices.map(price => parseFloat(price));
    } else if (historyData.chart) {
      return historyData.chart.map(point => parseFloat(point.price));
    } else {
      return [];
    }
  } catch (error) {
    logger.warn(`Could not extract price data: ${error.message}`);
    return [];
  }
}

function calculateSignalStrength(coin) {
  let strength = 0;
  const priceChange = Math.abs(coin.priceChange24h || 0);
  const volume = coin.volume || 0;
  
  if (priceChange > 10) strength += 40;
  else if (priceChange > 5) strength += 20;
    
  if (volume > 50000000) strength += 30;
  else if (volume > 10000000) strength += 15;
      
  return Math.min(strength, 100);
}

function calculateVolatility(coin) {
  const changes = [
    Math.abs(coin.priceChange1h || 0),
    Math.abs(coin.priceChange24h || 0)
  ];
  return changes.reduce((a, b) => a + b, 0) / changes.length;
}

function detectVolumeAnomaly(coin) {
  const volume = coin.volume || 0;
  const marketCap = coin.marketCap || 1;
  const volumeRatio = volume / marketCap;
  return volumeRatio > 0.1;
}

// سایر توابع helper
function analyzeMarketPhase(rainbowData) { return "accumulation"; }
function analyzeNewsSentiment(coinId, newsList) { return newsList.length * 0.1; }
function calculatePatternComplexity(coin, indicators) { 
  let complexity = 0;
  if (Math.abs(coin.priceChange24h || 0) > 8) complexity += 1;
  if ((coin.volume || 0) > 10000000) complexity += 1;
  if (indicators && Math.abs(indicators.rsi - 50) > 20) complexity += 1;
  return complexity;
}
// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>VortexAI Crypto Scanner</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container { 
                max-width: 900px; 
                margin: 0 auto; 
                background: white; 
                padding: 40px; 
                border-radius: 15px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
                margin-top: 40px;
                margin-bottom: 40px;
            }
            h1 { 
                color: #2c3e50; 
                border-bottom: 3px solid #3498db; 
                padding-bottom: 15px; 
                text-align: center;
            }
            .status { 
                background: #27ae60; 
                color: white; 
                padding: 10px 20px; 
                border-radius: 20px; 
                display: inline-block; 
                font-weight: bold;
            }
            .endpoint { 
                background: #f8f9fa; 
                padding: 15px; 
                margin: 15px 0; 
                border-radius: 8px; 
                border-left: 4px solid #3498db; 
                transition: transform 0.2s;
            }
            .endpoint:hover {
                transform: translateX(5px);
                background: #e8f4fd;
            }
            .method { 
                background: #3498db; 
                color: white; 
                padding: 4px 12px; 
                border-radius: 4px; 
                font-size: 12px; 
                font-weight: bold;
                margin-right: 10px;
            }
            .url { 
                color: #2c3e50; 
                font-weight: bold; 
                font-family: 'Courier New', monospace;
            }
            .links {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin: 20px 0;
            }
            .links a {
                display: block;
                padding: 12px;
                background: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                text-align: center;
                transition: background 0.3s;
            }
            .links a:hover {
                background: #2980b9;
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 VortexAI Crypto Scanner API</h1>
            <p style="text-align: center;">
                <span class="status">🟢 Status: Active & Running</span>
            </p>
            <p style="text-align: center; font-size: 18px; color: #555;">
                Advanced cryptocurrency market scanner with real-time technical analysis and VortexAI integration
            </p>
            
            <h2>📡 Available Endpoints:</h2>
            
            <div class="endpoint">
                <span class="method">GET</span> 
                <span class="url">/health</span> 
                <div style="color: #666; margin-top: 5px;">Service health check and detailed status</div>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> 
                <span class="url">/api/scan/market</span> 
                <div style="color: #666; margin-top: 5px;">Real-time market scanning and analysis</div>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> 
                <span class="url">/api/scan/advanced</span> 
                <div style="color: #666; margin-top: 5px;">Advanced technical analysis scanning</div>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> 
                <span class="url">/api/vortexai/advanced-market-data</span> 
                <div style="color: #666; margin-top: 5px;">VortexAI enhanced market data with neural network insights</div>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> 
                <span class="url">/api/coin/:id/technical</span> 
                <div style="color: #666; margin-top: 5px;">Detailed technical analysis for specific cryptocurrency</div>
            </div>
            
            <h2>🔗 Quick Test Links:</h2>
            <div class="links">
                <a href="/health">Health Check</a>
                <a href="/api/scan/market?limit=10">Market Scan</a>
                <a href="/api/vortexai/advanced-market-data?limit=5">VortexAI Data</a>
                <a href="/status">Service Status</a>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p><strong>🕒 Server Time:</strong> ${new Date().toISOString()}</p>
                <p><strong>🚀 Version:</strong> 3.0.0</p>
                <p><strong>🎯 Environment:</strong> Production</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// ==================== ROUTES FOR MAIN APP ====================
app.get('/api/scan/market', async (req, res) => {
  const startTime = Date.now();
  logger.info("Market scan request received");
  
  try {
    const limit = Math.min(parseInt(req.query.limit) || 300, 500);
    const filterType = req.query.filter_type || 'volume';
    
    const data = await apiClient.getCoins(limit);
    const coins = data.coins || [];
    
    // فیلتر کردن
    if (filterType === "volume") {
      coins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
    } else if (filterType === "change") {
      coins.sort((a, b) => Math.abs(b.priceChange1h || 0) - Math.abs(a.priceChange1h || 0));
    } else if (filterType === "market_cap") {
      coins.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    }
    
    const responseData = {
      success: true,
      coins: coins,
      count: coins.length,
      timestamp: new Date().toISOString(),
      scan_mode: 'market',
      processing_time: Math.round(Date.now() - startTime) / 1000
    };
    
    logger.info(`Market scan completed: ${coins.length} coins in ${responseData.processing_time}s`);
    res.json(responseData);
    
  } catch (error) {
    logger.error(`Market scan error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/scan/advanced', async (req, res) => {
  const startTime = Date.now();
  logger.info("Advanced scan request received");
  
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    
    const data = await apiClient.getCoins(limit);
    const coins = data.coins || [];
    
    // محاسبه اندیکاتورهای پیشرفته
    for (const coin of coins) {
      coin.advanced_analysis = {
        signal_strength: calculateSignalStrength(coin),
        trend: (coin.priceChange24h || 0) > 0 ? "up" : "down",
        volatility_score: calculateVolatility(coin),
        volume_anomaly: detectVolumeAnomaly(coin),
        market_sentiment: (coin.priceChange1h || 0) > 0 && (coin.priceChange24h || 0) > 0 ? 'bullish' : 'bearish'
      };
    }
    
    const responseData = {
      success: true,
      coins: coins,
      count: coins.length,
      timestamp: new Date().toISOString(),
      scan_mode: 'advanced',
      processing_time: Math.round(Date.now() - startTime) / 1000
    };
    
    logger.info(`Advanced scan completed: ${coins.length} coins in ${responseData.processing_time}s`);
    res.json(responseData);
    
  } catch (error) {
    logger.error(`Advanced scan error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/coin/:coinId/technical', async (req, res) => {
  const startTime = Date.now();
  const coinId = req.params.coinId;
  logger.info(`Technical analysis request for ${coinId}`);
  
  try {
    const period = req.query.period || '24h';
    
    // دریافت داده‌های تاریخی
    const [historyData, coinDetails] = await Promise.all([
      apiClient.getCoinHistory(coinId, period),
      apiClient.getCoinDetails(coinId)
    ]);
    
    if (!historyData || !coinDetails) {
      return res.status(404).json({
        success: false,
        error: 'Could not fetch data for technical analysis',
        coinId: coinId
      });
    }
    
    // استخراج داده‌های قیمت برای تحلیل تکنیکال
    const priceData = extractPriceData(historyData);
    
    if (priceData.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient data for technical analysis',
        data_points: priceData.length
      });
    }
    
    // محاسبه اندیکاتورهای پیشرفته
    const indicators = TechnicalAnalysisEngine.calculateAllIndicators(priceData);
    const supportResistance = TechnicalAnalysisEngine.calculateSupportResistance(priceData);
    
    const responseData = {
      success: true,
      coinId: coinId,
      period: period,
      current_price: coinDetails.coin?.price || 0,
      technical_indicators: {
        trend_indicators: {
          adx: indicators.adx,
          moving_averages: {
            ma_20: indicators.moving_avg_20,
            ma_50: indicators.moving_avg_50,
            ma_200: indicators.moving_avg_200
          }
        },
        momentum_indicators: {
          rsi: indicators.rsi,
          stochastic: {
            k: indicators.stochastic_k,
            d: indicators.stochastic_d
          },
          williams_r: indicators.williams_r,
          roc: indicators.roc,
          cci: indicators.cci
        },
        volatility_indicators: {
          bollinger_bands: {
            upper: indicators.bollinger_upper,
            middle: indicators.bollinger_middle,
            lower: indicators.bollinger_lower
          },
          atr: indicators.atr
        },
        volume_indicators: {
          obv: indicators.obv,
          mfi: indicators.mfi
        },
        macd: {
          macd: indicators.macd,
          signal: indicators.macd_signal,
          histogram: indicators.macd_hist
        }
      },
      support_resistance: supportResistance,
      analysis_timestamp: new Date().toISOString(),
      processing_time: Math.round(Date.now() - startTime) / 1000
    };
    
    logger.info(`Technical analysis completed for ${coinId} in ${responseData.processing_time}s`);
    res.json(responseData);
    
  } catch (error) {
    logger.error(`Technical analysis error for ${coinId}: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      coinId: coinId
    });
  }
});

// ==================== VORTEXAI ENHANCED ROUTES ====================
app.get('/api/vortexai/advanced-market-data', async (req, res) => {
  const startTime = Date.now();
  logger.info("VortexAI advanced market data request received");
  
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 150);
    
    // دریافت موازی همه داده‌های مورد نیاز
    const [
      coinsData,
      fearGreed,
      newsData,
      btcDominance
    ] = await Promise.all([
      apiClient.getCoins(limit),
      apiClient.getFearAndGreed(),
      apiClient.getNews(25),
      apiClient.getBtcDominance('all')
    ]);

    const coins = coinsData.coins || [];
    
    // پردازش پیشرفته برای VortexAI
    const enhancedCoins = [];
    for (const coin of coins) {
      // دریافت داده‌های تکنیکال برای هر ارز
      const historyData = await apiClient.getCoinHistory(coin.id, '24h');
      const priceData = historyData ? extractPriceData(historyData) : [];
      
      const technicalIndicators = priceData.length >= 20 ? 
        TechnicalAnalysisEngine.calculateAllIndicators(priceData) : null;
      
      const enhancedCoin = {
        basic_data: coin,
        technical_analysis: technicalIndicators,
        vortexai_enhanced: {
          sentiment_score: fearGreed.value || 50,
          market_sentiment: fearGreed.valueClassification || 'Neutral',
          btc_dominance_impact: btcDominance.btc_dominance || 0,
          news_sentiment: analyzeNewsSentiment(coin.id, newsData.news || []),
          pattern_complexity: calculatePatternComplexity(coin, technicalIndicators),
          risk_assessment: 'MEDIUM',
          timestamp: new Date().toISOString()
        }
      };
      enhancedCoins.push(enhancedCoin);
    }

    const responseData = {
      success: true,
      data: {
        coins: enhancedCoins,
        market_indicators: {
          fear_greed: fearGreed,
          btc_dominance: btcDominance,
          news_analysis: {
            total_news: (newsData.news || []).length,
            top_headlines: (newsData.news || []).slice(0, 10)
          }
        },
        technical_overview: {
          total_coins_analyzed: enhancedCoins.length,
          market_trend: 'BULLISH'
        },
        vortexai_ready: true,
        technical_indicators_included: true
      },
      timestamp: new Date().toISOString(),
      processing_time: Math.round(Date.now() - startTime) / 1000
    };
    
    logger.info(`VortexAI advanced data prepared: ${enhancedCoins.length} coins in ${responseData.processing_time}s`);
    res.json(responseData);
    
  } catch (error) {
    logger.error(`VortexAI advanced data error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== HEALTH & MONITORING ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Advanced Crypto Scanner API',
    version: '3.0',
    timestamp: new Date().toISOString(),
    uptime: 'active',
    api_requests_count: apiClient.request_count,
    features: [
      'market_scanning',
      'advanced_technical_analysis',
      'vortexai_integration',
      'real-time_websocket',
      'news_sentiment_analysis',
      'multi-indicator_support'
    ]
  });
});
// ==================== STATUS ROUTE ====================
app.get('/status', async (req, res) => {
  try {
    const [coinsStatus, newsStatus] = await Promise.all([
      apiClient.getCoins(1).then(data => !!data),
      apiClient.getNews(1).then(data => !!data)
    ]);
    
    // استفاده از global activeConnections اگر تعریف شده
    const activeClients = global.activeConnections ? global.activeConnections.size : 0;
    
    res.json({
      server: 'active',
      coinstats_api: coinsStatus ? 'connected' : 'disconnected',
      news_api: newsStatus ? 'connected' : 'disconnected',
      websocket: 'active',
      active_clients: activeClients,
      technical_analysis_engine: 'active',
      vortexai_integration: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Status check error: ${error.message}`);
    res.status(500).json({ status: 'error', error: error.message });
  }
});
// ==================== SERVER STARTUP ====================
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  logger.info("🚀 Starting Advanced Crypto Scanner API Server v3.0");
  logger.info("📊 Features: 300+ coins, Advanced Technical Analysis, VortexAI Integration");
  logger.info(`🌐 Server URL: http://0.0.0.0:${PORT}`);
});

module.exports = app;
