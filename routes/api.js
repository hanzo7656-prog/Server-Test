const express = require('express');
const TechnicalAnalysisEngine = require('../models/TechnicalAnalysis');
const { HistoricalDataAPI, MarketDataAPI, NewsAPI, InsightsAPI } = require('../models/APIClients');
const constants = require('../config/constants');

const router = express.Router();

module.exports = ({ gistManager, wsManager, apiClient, exchangeAPI }) => {
  
  // ========== ENDPOINT های جدید برای Frontend ==========
  
  // اندپوینت /scan برای Frontend
  router.get("/scan", async (req, res) => {
    const startTime = Date.now();
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 300);
      const filterType = req.query.filter || 'volume';
      
      const [apiData, realtimeData] = await Promise.all([
        apiClient.getCoins(limit),
        Promise.resolve(wsManager.getRealtimeData())
      ]);

      let coins = apiData.coins || [];

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

      const enhancedCoins = coins.map((coin) => {
        const symbol = `${coin.symbol.toLowerCase()}_usdt`;
        const realtime = realtimeData[symbol];
        
        return {
          ...coin,
          realtime_price: realtime?.price,
          realtime_volume: realtime?.volume,
          realtime_change: realtime?.change,
          VortexAI_analysis: {
            signal_strength: TechnicalAnalysisEngine.calculateSignalStrength(coin),
            trend: (coin.priceChange24h || 0) > 0 ? "up" : "down",
            volatility_score: TechnicalAnalysisEngine.calculateVolatility(coin),
            volume_anomaly: TechnicalAnalysisEngine.detectVolumeAnomaly(coin)
          }
        };
      });

      let filteredCoins = [...enhancedCoins];
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
        filter_applied: filterType,
        processing_time: responseTime + 'ms',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in /scan endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // اندپوینت /analysis برای Frontend
  router.get("/analysis", async (req, res) => {
    const startTime = Date.now();
    const symbol = req.query.symbol;
    
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

      const indicators = TechnicalAnalysisEngine.calculateAllIndicators(priceData);
      const supportResistance = TechnicalAnalysisEngine.calculateSupportResistance(priceData);

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
      console.error(`Analysis error for ${symbol}:`, error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // اندپوینت /timeframes-api برای Frontend
  router.get("/timeframes-api", (req, res) => {
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

  // اندپوینت /api-data برای Frontend
  router.get("/api-data", (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();
    
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
          "/timeframes-api",
          "/api-data",
          "/health-api",
          "/currencies"
        ]
      },
      timestamp: new Date().toISOString()
    });
  });

  // اندپوینت /health-api برای Frontend
  router.get("/health-api", (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();
    
    res.json({
      status: 'OK',
      service: 'VortexAI Crypto Scanner',
      version: '5.0.0',
      timestamp: new Date().toISOString(),
      components: {
        websocket: wsStatus.connected ? 'healthy' : 'unhealthy',
        database: process.env.GITHUB_TOKEN ? 'healthy' : 'degraded',
        api: 'healthy'
      },
      stats: {
        active_connections: wsStatus.active_coins,
        stored_coins: Object.keys(gistData.prices || {}).length,
        uptime: process.uptime()
      }
    });
  });

  // اندپوینت /currencies برای Frontend (مستقیم)
  router.get("/currencies", async (req, res) => {
    try {
      const marketAPI = new MarketDataAPI();
      const data = await marketAPI.getCurrencies();
      
      res.json({
        success: true,
        data: data,
        count: data.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in /currencies endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========== ENDPOINT های اصلی موجود ==========
  
  // اندپوینت اصلی اسکن
  router.get("/scan/vortexai", async (req, res) => {
    const startTime = Date.now();
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 300);
      const filterType = req.query.filter || 'volume';
      console.log(`Starting scan with limit: ${limit}, filter: ${filterType}`);

      const [apiData, realtimeData] = await Promise.all([
        apiClient.getCoins(limit),
        Promise.resolve(wsManager.getRealtimeData())
      ]);

      let coins = apiData.coins || [];
      console.log(`API coins: ${coins.length}, Realtime: ${Object.keys(realtimeData || {}).length}`);

      if (coins.length === 0) {
        console.log("No API coins, using realtime data fallback");
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

      const historicalAPI = new HistoricalDataAPI();
      const allCoinIds = coins.map(coin => {
        try {
          const coinId = historicalAPI.symbolToCoinId(coin.symbol);
          return coinId;
        } catch (error) {
          console.log(`Error converting symbol ${coin.symbol}`, error);
          return 'bitcoin';
        }
      });

      console.log(`Fetching historical for ${allCoinIds.length} coins...`);
      const historicalResponse = await historicalAPI.getMultipleCoinsHistorical(allCoinIds, '1y');
      const allHistoricalData = historicalResponse.data || [];
      console.log(`Historical data received: ${allHistoricalData.length} records`);

      const historicalMap = {};
      allHistoricalData.forEach(coinData => {
        if (coinData && coinData.coinId) {
          historicalMap[coinData.coinId] = coinData;
        }
      });

      const gistData = gistManager.getAllData();
      const enhancedCoins = coins.map((coin) => {
        const coinId = historicalAPI.symbolToCoinId(coin.symbol);
        const historicalData = historicalMap[coinId];
        const symbol = `${coin.symbol.toLowerCase()}_usdt`;
        const realtime = realtimeData[symbol];
        const gistHistorical = gistManager.getPriceData(symbol);
        const currentPrice = realtime?.price || coin.price;
        let historicalChanges = {};
        let dataSource = 'no_historical';

        if (historicalData) {
          const changeResult = historicalAPI.calculatePriceChangesFromChart(historicalData, currentPrice);
          historicalChanges = changeResult.changes;
          dataSource = changeResult.source;
        }

        return {
          ...coin,
          change_1h: historicalChanges['1h'],
          change_4h: historicalChanges['4h'],
          change_24h: historicalChanges['24h'],
          change_7d: historicalChanges['7d'],
          change_30d: historicalChanges['30d'],
          change_180d: historicalChanges['180d'],
          historical_timestamp: gistHistorical?.timestamp,
          realtime_price: realtime?.price,
          realtime_volume: realtime?.volume,
          realtime_change: realtime?.change,
          data_source: dataSource,
          VortexAI_analysis: {
            signal_strength: TechnicalAnalysisEngine.calculateSignalStrength(coin),
            trend: (historicalChanges['24h'] ?? coin.priceChange24h ?? 0) > 0 ? "up" : "down",
            volatility_score: TechnicalAnalysisEngine.calculateVolatility(coin),
            volume_anomaly: TechnicalAnalysisEngine.detectVolumeAnomaly(coin),
            market_sentiment: (historicalChanges['1h'] ?? coin.priceChange1h ?? 0) > 0 &&
              (historicalChanges['24h'] ?? coin.priceChange24h ?? 0) > 0 ? 'bullish' : 'bearish'
          }
        };
      });

      let filteredCoins = [...enhancedCoins];
      switch (filterType) {
        case 'volume':
          filteredCoins.sort((a, b) => (b.volume || 0) - (a.volume || 0));
          break;
        case 'momentum_1h':
          filteredCoins.sort((a, b) => Math.abs(b.change_1h || 0) - Math.abs(a.change_1h || 0));
          break;
        case 'momentum_4h':
          filteredCoins.sort((a, b) => Math.abs(b.change_4h || 0) - Math.abs(a.change_4h || 0));
          break;
        case 'ai_signal':
          filteredCoins.sort((a, b) => (b.VortexAI_analysis?.signal_strength || 0) -
            (a.VortexAI_analysis?.signal_strength || 0));
          break;
      }

      const responseTime = Date.now() - startTime;
      res.json({
        success: true,
        coins: filteredCoins.slice(0, limit),
        total_coins: filteredCoins.length,
        scan_mode: 'vortexai_enhanced_with_historical',
        filter_applied: filterType,
        data_sources: {
          api: coins.length,
          realtime: Object.keys(realtimeData || {}).length,
          historical_api: Object.keys(historicalMap || {}).length,
          gist: Object.keys((gistData || {}).prices || {}).length
        },
        processing_time: responseTime + 'ms',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in scan endpoint.', error);
      res.status(500).json({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV == 'development' ? error.stack : undefined
      });
    }
  });
// API قیمت ارز جدید
router.get("/exchange/price", async (req, res) => {
  try {
    const { exchange = 'Binance', from = 'BTC', to = 'ETH', timestamp = Math.floor(Date.now() / 1000) } = req.query;
    const data = await exchangeAPI.getExchangePrice(exchange, from, to, timestamp);
    res.json({
      success: true,
      exchange,
      from,
      to,
      timestamp,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API تیکر صرافی جدید
router.get("/tickers/:exchange", async (req, res) => {
  try {
    const { exchange } = req.params;
    const data = await exchangeAPI.getTickers(exchange);
    res.json({
      success: true,
      exchange,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API قیمت متوسط جدید
router.get("/price/avg", async (req, res) => {
  try {
    const { coinId = 'bitcoin', timestamp = Math.floor(Date.now() / 1000) } = req.query;
    const data = await exchangeAPI.getAveragePrice(coinId, timestamp);
    res.json({
      success: true,
      coinId,
      timestamp,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// دریافت داده‌های تاریخی بر اساس timeframe
router.get('/coin/:symbol/history/:timeframe', async (req, res) => {
  const { symbol, timeframe } = req.params;
  const validTimeframes = gistManager.getAvailableTimeframes();

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
    console.error(`History API error for ${symbol}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// تحلیل تکنیکال پیشرفته برای یک ارز
router.get('/coin/:symbol/technical', async (req, res) => {
  const startTime = Date.now();
  const symbol = req.params.symbol;
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

    const indicators = TechnicalAnalysisEngine.calculateAllIndicators(priceData);
    const supportResistance = TechnicalAnalysisEngine.calculateSupportResistance(priceData);
    const aiAnalysis = TechnicalAnalysisEngine.analyzeWithAI(
      { [symbol]: realtimeData }, { prices: { [symbol]: historicalData } }
    );

    res.json({
      success: true,
      symbol: symbol,
      current_price: realtimeData?.price || historicalData?.current_price,
      technical_indicators: indicators,
      support_resistance: supportResistance,
      vortexai_analysis: aiAnalysis,
      data_points: priceData.length,
      processing_time: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Technical analysis error for ${symbol}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// available data timeframes
router.get('/timeframes', (req, res) => {
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
    }
  });
});

// سلامت سیستم ترکیبی
router.get('/health-combined', (req, res) => {
  const wsStatus = wsManager.getConnectionStatus();
  const gistData = gistManager.getAllData();
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
    },
    features: [
      'realtime_websocket_data',
      '6_layer_historical_data',
      'vortexai_analysis',
      '55+ technical_indicators',
      'multi_source_data',
      'advanced_filtering',
      'market_predictions',
      'multi_timeframe_support',
      'news_feed',
      'market_analytics'
    ]
  });
});

// اضافه کردن این endpoint برای تشخیص دقیق مشکل
router.get("/debug/api-status", async (req, res) => {
  try {
    const testCoinIds = ['bitcoin', 'ethereum', 'solana'];
    const historicalAPI = new HistoricalDataAPI();
    console.log("\n== API STATUS DEBUG ==");
    const apiResult = await apiClient.getCoins(10);
    const historicalResult = await historicalAPI.getMultipleCoinsHistorical(testCoinIds, '24h');
    res.json({
      success: true,
      main_api: {
        status: apiResult.coins.length > 0 ? 'working' : 'failing',
        coins_received: apiResult.coins.length,
        error: apiResult.error
      },
      historical_api: {
        status: historicalResult.data.length > 0 ? 'working' : 'failing',
        coins_received: historicalResult.data.length,
        source: historicalResult.source,
        error: historicalResult.error,
        sample: historicalResult.data.length > 0 ? {
          coinId: historicalResult.data[0].coinId,
          data_points: historicalResult.data[0].chart?.length,
          latest_point: historicalResult.data[0].chart ?
            new Date(historicalResult.data[0].chart[historicalResult.data[0].chart.length - 1][0] * 1000).toISOString() : null
        } : null
      },
      environment: {
        node_version: process.version,
        platform: process.platform,
        uptime: process.uptime()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API جدید: دریافت Market Cap
router.get("/markets/cap", async (req, res) => {
  try {
    const marketAPI = new MarketDataAPI();
    const data = await marketAPI.getMarketCap();
    
    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in market cap endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

  
// API جدید: دریافت Currencies (نسخه اصلی)
router.get("/currencies/original", async (req, res) => {
  try {
    const marketAPI = new MarketDataAPI();
    const data = await marketAPI.getCurrencies();
    
    res.json({
      success: true,
      data: data,
      count: data.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in currencies endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// BTC Dominance API
router.get("/insights/btc-dominance", async (req, res) => {
    try {
        const insightsAPI = new InsightsAPI();
        const { type = 'all' } = req.query;
        
        const data = await insightsAPI.getBTCDominance(type);
        
        res.json({
            success: true,
            data: data,
            type: type,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in BTC Dominance endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Fear & Greed Index API
router.get("/insights/fear-greed", async (req, res) => {
    try {
        const insightsAPI = new InsightsAPI();
        
        const data = await insightsAPI.getFearGreedIndex();
        
        res.json({
            success: true,
            data: data,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in Fear & Greed endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Fear & Greed Chart API
router.get("/insights/fear-greed/chart", async (req, res) => {
    try {
        const insightsAPI = new InsightsAPI();
        
        const data = await insightsAPI.getFearGreedChart();
        
        res.json({
            success: true,
            data: data,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in Fear & Greed Chart endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Rainbow Chart API
router.get("/insights/rainbow-chart/:coin?", async (req, res) => {
    try {
        const insightsAPI = new InsightsAPI();
        const { coin = 'bitcoin' } = req.params;
        
        const data = await insightsAPI.getRainbowChart(coin);
        
        res.json({
            success: true,
            coin: coin,
            data: data,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in Rainbow Chart endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Combined Insights Dashboard
router.get("/insights/dashboard", async (req, res) => {
    try {
        const insightsAPI = new InsightsAPI();
        
        const [btcDominance, fearGreed, rainbowChart] = await Promise.all([
            insightsAPI.getBTCDominance(),
            insightsAPI.getFearGreedIndex(),
            insightsAPI.getRainbowChart('bitcoin')
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
        console.error('Error in Insights Dashboard endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
  
// API جدید: دریافت News Sources
router.get("/news/sources", async (req, res) => {
  try {
    const newsAPI = new NewsAPI();
    const data = await newsAPI.getNewsSources();
    
    res.json({
      success: true,
      data: data,
      count: data.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in news sources endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

  // API جدید: دریافت News
  router.get("/news", async (req, res) => {
    try {
      const { page = 1, limit = 20, from, to } = req.query;
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
      console.error('Error in news endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========== اندپوینت‌های جدید برای هوش مصنوعی ==========

  // ۱. تحلیل تک کوین (عمیق)
  router.get("/ai/single/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { timeframe = "24h", limit = 200 } = req.query;

      // دریافت داده‌های تاریخی
      const historicalData = gistManager.getPriceData(symbol, timeframe);
      const realtimeData = wsManager.getRealtimeData()[symbol];
      
      if (!historicalData && !realtimeData) {
        return res.status(404).json({
          success: false,
          error: 'No data available for this symbol'
        });
      }

      // داده‌های خام برای AI
      const rawData = {
        symbol,
        timeframe,
        prices: historicalData?.history?.map(item => ({
          timestamp: item.timestamp,
          open: item.open || item.price * 0.99,
          high: item.high || item.price * 1.02,
          low: item.low || item.price * 0.98,
          close: item.price,
          volume: item.volume || 1000
        })) || [],
        current_price: realtimeData?.price,
        volume_24h: realtimeData?.volume
      };

      // محدود کردن داده‌ها
      rawData.prices = rawData.prices.slice(-parseInt(limit));

      res.json({
        success: true,
        analysis_type: "single_deep",
        symbol,
        timeframe,
        data_points: rawData.prices.length,
        raw_data: rawData,
        available_analysis: ["trend", "patterns", "momentum", "volume_analysis"],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI Single analysis error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ۲. تحلیل چند کوین (مقایسه‌ای)
  router.get("/ai/multi", async (req, res) => {
    try {
      const { symbols = "btc,eth,sol", timeframe = "24h", limit = 100 } = req.query;
      const symbolList = symbols.split(',').map(s => s.trim() + '_usdt');

      const multiAnalysis = {};
      
      for (const symbol of symbolList) {
        const historicalData = gistManager.getPriceData(symbol, timeframe);
        const realtimeData = wsManager.getRealtimeData()[symbol];
        
        if (historicalData || realtimeData) {
          multiAnalysis[symbol] = {
            current_price: realtimeData?.price,
            price_change_24h: realtimeData?.change || 0,
            volume: realtimeData?.volume || 0,
            data_points: historicalData?.history?.length || 0,
            last_updated: historicalData?.timestamp
          };
        }
      }

      res.json({
        success: true,
        analysis_type: "multi_comparison",
        symbols: symbolList,
        timeframe,
        data: multiAnalysis,
        comparison_metrics: ["price_change", "volume", "volatility", "momentum"],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI Multi analysis error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ۳. تحلیل تاپ مارکت‌کپ
  router.get("/ai/top", async (req, res) => {
    try {
      const { limit = 20, timeframe = "4h", sort = "volume" } = req.query;
      
      // دریافت داده‌های کوین‌ها از API اصلی
      const apiResult = await apiClient.getCoins(parseInt(limit));
      const coins = apiResult.coins || [];

      const topAnalysis = coins.map(coin => {
        const symbol = coin.symbol.toLowerCase() + '_usdt';
        const realtimeData = wsManager.getRealtimeData()[symbol];
        
        return {
          symbol: coin.symbol,
          name: coin.name,
          price: coin.price,
          price_change_24h: coin.priceChange24h || 0,
          volume: coin.volume || 0,
          market_cap: coin.marketCap || 0,
          realtime_price: realtimeData?.price,
          realtime_change: realtimeData?.change,
          signal_strength: TechnicalAnalysisEngine.calculateSignalStrength(coin),
          volume_anomaly: TechnicalAnalysisEngine.detectVolumeAnomaly(coin)
        };
      });

      // مرتب‌سازی بر اساس معیار انتخاب شده
      if (sort === "volume") {
        topAnalysis.sort((a, b) => (b.volume || 0) - (a.volume || 0));
      } else if (sort === "market_cap") {
        topAnalysis.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
      } else if (sort === "signal") {
        topAnalysis.sort((a, b) => (b.signal_strength || 0) - (a.signal_strength || 0));
      }

      res.json({
        success: true,
        analysis_type: "top_market_scan",
        limit: parseInt(limit),
        sort_by: sort,
        timeframe,
        data: topAnalysis,
        total_scanned: topAnalysis.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI Top analysis error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ۴. تحلیل کل بازار
  router.get("/ai/market-overview", async (req, res) => {
    try {
      const { timeframe = "24h" } = req.query;

      // دریافت داده‌های کلی بازار
      const marketAPI = new MarketDataAPI();
      const marketData = await marketAPI.getMarketCap();
      
      // دریافت تاپ کوین‌ها
      const apiResult = await apiClient.getCoins(10);
      const topCoins = apiResult.coins || [];

      const marketOverview = {
        total_market_cap: marketData.marketCap || 0,
        total_volume_24h: marketData.volume || 0,
        btc_dominance: marketData.btcDominance || 0,
        market_sentiment: calculateMarketSentiment(topCoins),
        top_performers: topCoins.slice(0, 5).map(coin => ({
          symbol: coin.symbol,
          price_change_24h: coin.priceChange24h || 0,
          volume: coin.volume || 0
        })),
        worst_performers: [...topCoins]
          .sort((a, b) => (a.priceChange24h || 0) - (b.priceChange24h || 0))
          .slice(0, 5)
          .map(coin => ({
            symbol: coin.symbol,
            price_change_24h: coin.priceChange24h || 0
          })),
        sector_analysis: {
          defi: analyzeSector(topCoins, ['UNI', 'AAVE', 'COMP']),
          layer1: analyzeSector(topCoins, ['ETH', 'SOL', 'ADA', 'DOT']),
          meme: analyzeSector(topCoins, ['DOGE', 'SHIB', 'PEPE'])
        }
      };

      res.json({
        success: true,
        analysis_type: "market_overview",
        timeframe,
        data: marketOverview,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI Market overview error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Health Checks اصلی
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'VortexAI Crypto Scanner'
    });
  });

  // بررسی سلامت کامل با وضعیت سرویس ها
  router.get('/health/ready', (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    const gistData = gistManager.getAllData();
    const healthStatus = {
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      services: {
        websocket: {
          connected: wsStatus.connected,
          activeCoins: wsStatus.active_coins,
          status: wsStatus.connected ? 'Healthy' : 'Unhealthy'
        },
        database: {
          storedCoins: Object.keys(gistData.prices || {}).length,
          status: process.env.GITHUB_TOKEN ? 'Healthy' : 'Degraded'
        },
        api: {
          requestCount: apiClient.request_count,
          status: 'Healthy'
        }
      }
    };
    const allHealthy = wsStatus.connected && process.env.GITHUB_TOKEN;
    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  });

  // بررسی سلامت سرویس‌های حیاتی برای کویرتنیز
  router.get("/health/live", (req, res) => {
    const wsStatus = wsManager.getConnectionStatus();
    // اگر WebSocket قطع باشد، سرور زنده نیست
    if (!wsStatus.connected) {
      return res.status(503).json({
        status: 'Unhealthy',
        message: 'WebSocket connection lost',
        timestamp: new Date().toISOString()
      });
    }
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  });

  // فیلترهای سلامت پیشرفته
  router.get("/health/filters", async (req, res) => {
    try {
      const wsStatus = wsManager.getConnectionStatus();
      const gistData = gistManager.getAllData();
      const healthFilters = {
        websocket_quality: wsStatus.connected ? 'excellent' : 'poor',
        data_freshness: calculateDataFreshness(gistData),
        api_performance: calculateAPIPerformance(),
        storage_health: calculateStorageHealth(gistData),
        overall_score: calculateOverallHealth(wsStatus, gistData)
      };
      res.json({
        success: true,
        health_filters: healthFilters,
        recommendations: generateHealthRecommendations(healthFilters),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========== متدهای کمکی ==========

  // متدهای کمکی برای فیلترهای سلامت
  function calculateDataFreshness(gistData) {
    const lastUpdated = new Date(gistData.last_updated);
    const now = new Date();
    const diffMinutes = (now - lastUpdated) / (1000 * 60);
    if (diffMinutes < 5) return 'excellent';
    if (diffMinutes < 15) return 'good';
    if (diffMinutes < 30) return 'fair';
    return 'poor';
  }

  function calculateAPIPerformance() {
    const successRate = (apiClient.request_count - (apiClient.error_count || 0)) / apiClient.request_count;
    return successRate > 0.95 ? 'excellent' :
      successRate > 0.85 ? 'good' :
      successRate > 0.70 ? 'fair' : 'poor';
  }

  function calculateStorageHealth(gistData) {
    const storedCoins = Object.keys(gistData.prices || {}).length;
    const expectedCoins = constants.ALL_TRADING_PAIRS.length;
    const coverage = storedCoins / expectedCoins;
    return coverage > 0.9 ? 'excellent' :
      coverage > 0.7 ? 'good' :
      coverage > 0.5 ? 'fair' : 'poor';
  }

  function calculateOverallHealth(wsStatus, gistData) {
    const scores = {
      websocket: wsStatus.connected ? 100 : 0,
      data_freshness: calculateDataFreshnessScore(gistData),
      api_performance: calculateAPIPerformanceScore(),
      storage: calculateStorageScore(gistData)
    };
    const totalScore = (scores.websocket + scores.data_freshness + scores.api_performance + scores.storage) / 4;
    return {
      score: Math.round(totalScore),
      breakdown: scores,
      status: totalScore > 80 ? 'healthy' : totalScore > 60 ? 'degraded' : 'unhealthy'
    };
  }

  function calculateDataFreshnessScore(gistData) {
    const freshness = calculateDataFreshness(gistData);
    const scores = { 'excellent': 100, 'good': 80, 'fair': 60, 'poor': 30 };
    return scores[freshness] || 0;
  }

  function calculateAPIPerformanceScore() {
    const performance = calculateAPIPerformance();
    const scores = { 'excellent': 100, 'good': 80, 'fair': 60, 'poor': 30 };
    return scores[performance] || 0;
  }

  function calculateStorageScore(gistData) {
    const storage = calculateStorageHealth(gistData);
    const scores = { 'excellent': 100, 'good': 80, 'fair': 60, 'poor': 30 };
    return scores[storage] || 0;
  }

  function generateHealthRecommendations(healthFilters) {
    const recommendations = [];
    if (healthFilters.websocket_quality == 'poor') {
      recommendations.push("WebSocket connection lost - Check network connectivity");
    }
    if (healthFilters.data_freshness == 'poor') {
      recommendations.push("Data is stale - Check Gist synchronization");
    }
    if (healthFilters.api_performance == 'poor') {
      recommendations.push("API performance degraded - Check rate limits");
    }
    if (healthFilters.storage_health == 'poor') {
      recommendations.push("Storage coverage low - Check historical data collection");
    }
    return recommendations.length > 0 ? recommendations : ["All systems operating normally"];
  }

  // متدهای کمکی برای تحلیل بازار
  function calculateMarketSentiment(coins) {
    const changes = coins.map(coin => coin.priceChange24h || 0);
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    
    if (avgChange > 3) return "STRONGLY_BULLISH";
    if (avgChange > 1) return "BULLISH";
    if (avgChange > -1) return "NEUTRAL";
    if (avgChange > -3) return "BEARISH";
    return "STRONGLY_BEARISH";
  }

  function analyzeSector(coins, sectorSymbols) {
    const sectorCoins = coins.filter(coin => 
      sectorSymbols.includes(coin.symbol.toUpperCase())
    );
    const avgChange = sectorCoins.length > 0 
      ? sectorCoins.reduce((sum, coin) => sum + (coin.priceChange24h || 0), 0) / sectorCoins.length
      : 0;
    
    return {
      average_change: avgChange,
      top_performer: sectorCoins.sort((a, b) => (b.priceChange24h || 0) - (a.priceChange24h || 0))[0]?.symbol,
      performance: avgChange > 2 ? "outperforming" : avgChange < -2 ? "underperforming" : "neutral"
    };
  }

  return router;
};
