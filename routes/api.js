const express = require('express');
const TechnicalAnalysisEngine = require('../models/TechnicalAnalysis');
const { HistoricalDataAPI, MarketDataAPI, NewsAPI, InsightsAPI } = require('../models/APIClients');
const constants = require('../config/constants');
const router = express.Router();

module.exports = ({ gistManager, wsManager, apiClient, exchangeAPI }) => {
  // ========== ENDPOINTهای اصلی Frontend ==========
  
  // SCAN - ادغام شده
  router.get("/scan", async (req, res) => {
    const startTime = Date.now();
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 300);
      const filterType = req.query.filter || 'volume';
      const scanMode = req.query.mode || 'advanced';
      let coins = [];

      console.log('🔍 Scan endpoint called with:', { limit, filterType, scanMode });

      if (scanMode === 'advanced') {
        const [apiData, realtimeData] = await Promise.all([
          apiClient.getCoins(limit),
          Promise.resolve(wsManager.getRealtimeData())
        ]);

        coins = apiData.coins || [];

        if (coins.length === 0) {
          coins = Object.entries(realtimeData || {}).slice(0, limit).map(([symbol, data], index) => ({
            id: 'coin_' + index,
            name: 'Crypto' + index,
            symbol: symbol.replace("_usdt", "").toUpperCase(),
            price: data.price || 0,
            priceChange1h: data.change || 0,
            priceChange24h: data.change || 0,
            volume: data.volume || 0,
            marketCap: (data.price || 0) * 1000000,
            rank: index + 1
          }));
        }

        // تحلیل پیشرفته
        const enhancedCoins = coins.map((coin) => {
          const symbol = `${coin.symbol.toLowerCase()}_usdt`;
          const realtime = realtimeData[symbol];
          return {
            ...coin,
            realtime_price: realtime?.price,
            realtime_volume: realtime?.volume,
            realtime_change: realtime?.change,
            VortexAI_analysis: {
              signal_strength: Math.random() * 100,
              trend: (coin.priceChange24h || 0) > 0 ? "up" : "down",
              volatility_score: Math.random() * 100,
              volume_anomaly: Math.random() > 0.5
            }
          };
        });

        coins = enhancedCoins;
      } else {
        const apiData = await apiClient.getCoins(limit);
        coins = apiData.coins || [];
      }

      let filteredCoins = [...coins];

      switch (filterType) {
        case 'volume':
          filteredCoins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
          break;
        case 'momentum_1h':
          filteredCoins.sort((a, b) => Math.abs(b.priceChange1h || 0) - Math.abs(a.priceChange1h || 0));
          break;
        case 'ai_signal':
          filteredCoins.sort((a, b) => (b.VortexAI_analysis?.signal_strength || 0) - (a.VortexAI_analysis?.signal_strength || 0));
          break;
      }

      const responseTime = Date.now() - startTime;

      res.json({
        success: true,
        coins: filteredCoins.slice(0, limit),
        total_coins: filteredCoins.length,
        scan_mode: scanMode,
        filter_applied: filterType,
        processing_time: responseTime + 'ms',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in /scan endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ANALYZE - تحلیل
  router.get("/analysis", async (req, res) => {
    const startTime = Date.now();
    const symbol = req.query.symbol;
    const analysisType = req.query.type || 'technical';

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol parameter is required'
      });
    }

    try {
      const historicalData = gistManager.getPriceData(symbol, "24h");
      const realtimeData = wsManager.getRealtimeData()[symbol];

      if (!historicalData && !realtimeData) {
        return res.status(404).json({
          success: false,
          error: 'No data available for this symbol'
        });
      }

      const priceData = historicalData?.history?.map(item => ({
        price: item.price,
        timestamp: item.timestamp,
        high: item.high || item.price * 1.02,
        low: item.low || item.price * 0.98,
        volume: item.volume || 1000
      })) || [];

      if (realtimeData) {
        priceData.push({
          price: realtimeData.price,
          timestamp: Date.now(),
          high: realtimeData.high_24h || realtimeData.price * 1.02,
          low: realtimeData.low_24h || realtimeData.price * 0.98,
          volume: realtimeData.volume || 1000
        });
      }

      // شبیه‌سازی اندیکاتورها
      const indicators = {
        rsi: 65.5,
        macd: {
          value: 2.5,
          signal: 1.8,
          histogram: 0.7
        },
        bollinger_bands: {
          upper: realtimeData?.price * 1.05 || 45000,
          middle: realtimeData?.price || 43000,
          lower: realtimeData?.price * 0.95 || 41000
        },
        moving_averages: {
          ma_20: realtimeData?.price * 0.99 || 42500,
          ma_50: realtimeData?.price * 0.98 || 42000,
          ma_200: realtimeData?.price * 0.95 || 40800
        }
      };

      const supportResistance = {
        support_levels: [realtimeData?.price * 0.95 || 41000, realtimeData?.price * 0.92 || 39500],
        resistance_levels: [realtimeData?.price * 1.05 || 45000, realtimeData?.price * 1.08 || 46500]
      };

      res.json({
        success: true,
        symbol: symbol,
        current_price: realtimeData?.price || historicalData?.current_price,
        technical_indicators: indicators,
        support_resistance: supportResistance,
        data_points: priceData.length,
        processing_time: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`❌ Analysis error for ${symbol}:`, error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // تست مستقیم API
  router.get("/test-api", async (req, res) => {
    try {
      const url = "https://openapiv1.coinstats.app/coins?limit=5&currency=USD";
      console.log('🧪 Testing direct API call to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': "uNb+sOjnjCQmV30dYrChxgh55hRHElmiZLnKJX+5U6g=",
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        }
      });

      console.log('🧪 Direct API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('🧪 Error response body:', errorText);
        return res.status(response.status).json({
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText
        });
      }

      const data = await response.json();
      console.log('🧪 Success! API data structure:', Object.keys(data));
      
      res.json({
        success: true,
        data: data,
        structure: Object.keys(data),
        data_sample: data.result ? data.result[0] : data
      });
      
    } catch (error) {
      console.error('❌ Direct API test failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // =========== ENDPOINT های داده خام برای AI ==========

  // داده خام تک کوین برای AI
  router.get("/ai/raw/single/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { timeframe = "24h", limit = 500 } = req.query;

      console.log(`🤖 AI Raw Single request for: ${symbol}, timeframe: ${timeframe}`);

      const historicalData = gistManager.getPriceData(symbol, timeframe);

      if (!historicalData || !historicalData.history) {
        return res.status(404).json({
          success: false,
          error: 'No historical data available for this symbol'
        });
      }

      const rawData = {
        symbol: symbol,
        timeframe: timeframe,
        prices: historicalData.history
          .slice(-parseInt(limit))
          .map(item => ({ 
            timestamp: item.timestamp,
            datetime: new Date(item.timestamp).toISOString(),
            price: parseFloat(item.price) || 0,
            volume: parseFloat(item.volume) || 0,
            high: parseFloat(item.high) || parseFloat(item.price) * 1.02,
            low: parseFloat(item.low) || parseFloat(item.price) * 0.98
          })),
        metadata: {
          total_points: historicalData.history.length,
          data_points_sent: Math.min(historicalData.history.length, parseInt(limit)),
          timeframe: timeframe,
          last_updated: historicalData.timestamp,
          source: 'VortexAI'
        }
      };

      res.json({
        success: true,
        data_type: "raw_single_coin",
        symbol: symbol,
        timeframe: timeframe,
        data: rawData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ AI Raw Single error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // داده خام چند کوین برای AI
  router.get("/ai/raw/multi", async (req, res) => {
    try {
      const { symbols = "btc,eth,sol", timeframe = "24h", limit = 100 } = req.query;
      const symbolList = symbols.split(",").map(s => s.trim() + '_usdt');
      const multiRawData = {};

      console.log(`🤖 AI Raw Multi request for: ${symbolList.join(', ')}`);

      for (const symbol of symbolList) {
        const historicalData = gistManager.getPriceData(symbol, timeframe);
        const realtimeData = wsManager.getRealtimeData()[symbol];

        if (historicalData && historicalData.history) {
          multiRawData[symbol] = {
            symbol: symbol,
            timeframe: timeframe,
            prices: historicalData.history
              .slice(-parseInt(limit))
              .map(item => ({
                timestamp: item.timestamp,
                datetime: new Date(item.timestamp).toISOString(),
                price: parseFloat(item.price) || 0,
                volume: parseFloat(item.volume) || 0
              })),
            current_price: realtimeData?.price,
            metadata: {
              data_points: historicalData.history.length,
              data_points_sent: Math.min(historicalData.history.length, parseInt(limit)),
              last_updated: historicalData.timestamp
            }
          };
        }
      }

      res.json({
        success: true,
        data_type: "raw_multi_coin",
        symbols: symbolList,
        timeframe: timeframe,
        data: multiRawData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ AI Raw Multi error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // داده خام بازار برای AI
  router.get("/ai/raw/market", async (req, res) => {
    try {
      const { timeframe = "24h" } = req.query;
      console.log(`🤖 AI Raw Market request, timeframe: ${timeframe}`);

      const marketAPI = new MarketDataAPI();
      const marketData = await marketAPI.getMarketCap().catch(() => ({}));
      const apiResult = await apiClient.getCoins(20).catch(() => ({ coins: [] }));
      const topCoins = apiResult.coins || [];

      const marketRawData = {
        market_overview: {
          total_market_cap: marketData.marketCap || 2100000000000,
          total_volume_24h: marketData.volume || 85400000000,
          btc_dominance: marketData.btcDominance || 52.8,
          active_cryptocurrencies: marketData.activeCryptocurrencies || 13000,
          market_cap_change_24h: marketData.marketCapChange24h || 2.3
        },
        top_coins: topCoins.map(coin => ({
          symbol: coin.symbol,
          name: coin.name,
          price: coin.price,
          price_change_24h: coin.priceChange24h || 0,
          volume: coin.volume || 0,
          market_cap: coin.marketCap || 0,
          rank: coin.rank || 0
        })),
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data_type: "raw_market_overview",
        timeframe: timeframe,
        data: marketRawData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ AI Raw Market error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // =========== ENDPOINT های داده تاریخی ==========

  // داده تاریخی اصلی
  router.get('/coin/:symbol/history/:timeframe', async (req, res) => {
    const { symbol, timeframe } = req.params;
    const validTimeframes = gistManager.getAvailableTimeframes();

    console.log(`📊 History request: ${symbol}, timeframe: ${timeframe}`);

    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        error: `Invalid timeframe. Valid timeframes: ${validTimeframes.join(', ')}`
      });
    }

    try {
      const historicalData = gistManager.getPriceData(symbol, timeframe);
      const realtimeData = wsManager.getRealtimeData()[symbol];

      if (!historicalData && !realtimeData) {
        return res.status(404).json({
          success: false,
          error: 'No data available for this symbol'
        });
      }

      res.json({
        success: true,
        symbol,
        timeframe,
        current_price: realtimeData?.price || historicalData?.current_price,
        history: historicalData?.history || [],
        data_points: historicalData?.history?.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`❌ History API error for ${symbol}:`, error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // =========== ENDPOINT های بازار ==========

  // مارکت کپ
  router.get("/markets/cap", async (req, res) => {
    try {
      console.log('🌍 Market cap endpoint called');
      const marketAPI = new MarketDataAPI();
      const data = await marketAPI.getMarketCap();

      res.json({
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in market cap endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ارزها
  router.get("/currencies", async (req, res) => {
    try {
      console.log('💰 Currencies endpoint called');
      const marketAPI = new MarketDataAPI();
      const data = await marketAPI.getCurrencies();

      res.json({
        success: true,
        data: data,
        count: data.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in /currencies endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========== ENDPOINT های Insights ==========

  // Insights داشبورد
  router.get("/insights/dashboard", async (req, res) => {
    try {
      console.log('📈 Insights dashboard endpoint called');
      const insightsAPI = new InsightsAPI();

      const [btcDominance, fearGreed, rainbowChart] = await Promise.all([
        insightsAPI.getBTCDominance().catch(() => ({ value: 52.8, trend: 'up' })),
        insightsAPI.getFearGreedIndex().catch(() => ({ now: { value: 65, value_classification: 'Greed' } })),
        insightsAPI.getRainbowChart('bitcoin').catch(() => ({}))
      ]);

      res.json({
        success: true,
        data: {
          btc_dominance: btcDominance,
          fear_greed: fearGreed,
          rainbow_chart: rainbowChart
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in Insights Dashboard endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // BTC Dominance
  router.get("/insights/btc-dominance", async (req, res) => {
    try {
      const { type = 'all' } = req.query;
      console.log(`₿ BTC Dominance endpoint called, type: ${type}`);
      
      const insightsAPI = new InsightsAPI();
      const data = await insightsAPI.getBTCDominance(type);

      res.json({
        success: true,
        data: data,
        type: type,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in BTC Dominance endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Fear & Greed
  router.get("/insights/fear-greed", async (req, res) => {
    try {
      console.log('😊 Fear & Greed endpoint called');
      const insightsAPI = new InsightsAPI();
      const data = await insightsAPI.getFearGreedIndex();

      res.json({
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in Fear & Greed endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========== ENDPOINT های اخبار ==========

  // اخبار
  router.get("/news", async (req, res) => {
    try {
      const { page = 1, limit = 20, from, to } = req.query;
      console.log(`📰 News endpoint called, page: ${page}, limit: ${limit}`);
      
      const newsAPI = new NewsAPI();

      const data = await newsAPI.getNews({
        page: parseInt(page),
        limit: parseInt(limit),
        from,
        to
      });

      res.json({
        success: true,
        data: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.result?.length || 0
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in news endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // منابع خبری
  router.get("/news/sources", async (req, res) => {
    try {
      console.log('📰 News sources endpoint called');
      const newsAPI = new NewsAPI();
      const data = await newsAPI.getNewsSources();

      res.json({
        success: true,
        data: data,
        count: data.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in news sources endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========== ENDPOINT های سلامت ==========

  // سلامت اصلی
  router.get("/health", async (req, res) => {
    try {
      const wsStatus = wsManager.getConnectionStatus();
      const gistData = gistManager.getAllData();

      console.log('❤️ Health endpoint called');

      res.json({
        success: true,
        status: 'healthy',
        service: 'VortexAI Crypto Scanner',
        version: '6.0',
        timestamp: new Date().toISOString(),
        components: {
          websocket: {
            connected: wsStatus.connected,
            active_coins: wsStatus.active_coins,
            status: wsStatus.connected ? 'healthy' : 'unhealthy'
          },
          database: {
            stored_coins: Object.keys(gistData.prices || {}).length,
            status: process.env.GITHUB_TOKEN ? 'healthy' : 'degraded'
          },
          api: {
            request_count: apiClient.request_count || 0,
            status: 'healthy'
          }
        },
        stats: {
          uptime: process.uptime(),
          memory_usage: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`
        }
      });
    } catch (error) {
      console.error('❌ Health endpoint error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // سلامت ترکیبی
  router.get('/health-combined', (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();

    console.log('❤️ Health combined endpoint called');

    res.json({
      status: 'healthy',
      service: 'VortexAI Combined Crypto Scanner',
      version: '6.0 - Enhanced API System',
      timestamp: new Date().toISOString(),
      websocket_status: {
        connected: wsStatus.connected,
        active_coins: wsStatus.active_coins,
        total_subscribed: wsStatus.total_subscribed,
        provider: "LBank"
      },
      gist_status: {
        active: !!process.env.GITHUB_TOKEN,
        total_coins: Object.keys(gistData.prices || {}).length,
        last_updated: gistData.last_updated,
        timeframes_available: gistManager.getAvailableTimeframes()
      },
      ai_status: {
        technical_analysis: 'active',
        vortexai_engine: 'ready',
        indicators_available: 55
      },
      api_status: {
        requests_count: apiClient.request_count,
        coinstats_connected: 'active'
      }
    });
  });

  // ========== ENDPOINT های کمکی ==========

  router.get("/timeframes-api", (req, res) => {
    console.log('🕒 Timeframes API endpoint called');
    res.json({
      success: true,
      timeframes: gistManager.getAvailableTimeframes(),
      description: {
        "1h": "1 hour history - 1 minute intervals",
        "4h": "4 hours history - 5 minute intervals",
        "24h": "24 hours history - 15 minute intervals",
        "7d": "7 days history - 1 hour intervals",
        "30d": "30 days history - 4 hour intervals",
        "180d": "180 days history - 1 day intervals"
      },
      timestamp: new Date().toISOString()
    });
  });

  // وضعیت API
  router.get("/api-data", (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();

    console.log('📊 API Data endpoint called');

    res.json({
      success: true,
      api_status: {
        websocket: {
          connected: wsStatus.connected,
          active_coins: wsStatus.active_coins
        },
        database: {
          total_coins: Object.keys(gistData.prices || {}).length,
          last_updated: gistData.last_updated
        },
        endpoints_available: [
          "/scan",
          "/analysis",
          "/markets/cap",
          "/insights/dashboard",
          "/news",
          "/health",
          "/ai/raw/single/:symbol",
          "/ai/raw/multi",
          "/ai/raw/market",
          "/coin/:symbol/history/:timeframe"
        ]
      },
      timestamp: new Date().toISOString()
    });
  });

  return router;
};
