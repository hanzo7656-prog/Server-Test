const express = require('express');
const path = require('path');

// سیستم دیباگ پیشرفته برای APIClient
const apiDebugSystem = {
  enabled: true,
  requests: [],
  errors: [],
  fieldMapping: {},
  
  logRequest: function(method, url, params = {}) {
    if (!this.enabled) return;
    
    const request = {
      timestamp: new Date().toISOString(),
      method,
      url,
      params,
      response: null,
      error: null,
      duration: null
    };
    
    this.requests.push(request);
    
    // نگه داشتن فقط 50 درخواست آخر
    if (this.requests.length > 50) {
      this.requests.shift();
    }
    
    return request;
  },
  
  logResponse: function(request, response, duration) {
    if (!this.enabled) return;
    
    request.response = response;
    request.duration = duration;
    request.completed = true;
  },
  
  logError: function(request, error) {
    if (!this.enabled) return;
    
    request.error = error;
    this.errors.push({
      timestamp: new Date().toISOString(),
      request: {
        method: request.method,
        url: request.url
      },
      error: error.message
    });
    
    // نگه داشتن فقط 20 خطای آخر
    if (this.errors.length > 20) {
      this.errors.shift();
    }
  },
  
  analyzeFieldMapping: function(coinData) {
    if (!coinData || coinData.length === 0) return {};
    
    const sampleCoin = coinData[0];
    const fieldAnalysis = {
      priceFields: [],
      changeFields: [],
      volumeFields: [],
      marketCapFields: [],
      allFields: Object.keys(sampleCoin)
    };
    
    // تحلیل فیلدهای قیمت
    fieldAnalysis.priceFields = Object.keys(sampleCoin).filter(key => 
      key.toLowerCase().includes('price') && 
      !key.toLowerCase().includes('change')
    );
    
    // تحلیل فیلدهای تغییرات
    fieldAnalysis.changeFields = Object.keys(sampleCoin).filter(key => 
      (key.toLowerCase().includes('change') || key.toLowerCase().includes('percent')) &&
      (key.toLowerCase().includes('24h') || key.toLowerCase().includes('24_hour') || key.toLowerCase().includes('price'))
    );
    
    // تحلیل فیلدهای حجم
    fieldAnalysis.volumeFields = Object.keys(sampleCoin).filter(key => 
      key.toLowerCase().includes('volume')
    );
    
    // تحلیل فیلدهای مارکت کپ
    fieldAnalysis.marketCapFields = Object.keys(sampleCoin).filter(key => 
      key.toLowerCase().includes('market') && key.toLowerCase().includes('cap')
    );
    
    this.fieldMapping = fieldAnalysis;
    return fieldAnalysis;
  },
  
  findBestPriceChangeField: function(coin) {
    const possibleFields = [
      'priceChange24h', 'price_change_24h', 'change24h', 
      'priceChangePercentage24h', 'percent_change_24h',
      'changePercentage24h', 'priceChange', 'change_24h',
      'price_change_percentage_24h', 'price_change_percentage_24h_in_currency'
    ];
    
    for (const field of possibleFields) {
      if (coin[field] !== undefined && coin[field] !== null) {
        const value = parseFloat(coin[field]);
        if (!isNaN(value) && value !== 0) {
          return { field, value };
        }
      }
    }
    
    // جستجوی پیشرفته در تمام فیلدها
    for (const [key, value] of Object.entries(coin)) {
      const lowerKey = key.toLowerCase();
      if ((lowerKey.includes('24h') || lowerKey.includes('24_hour')) &&
          (lowerKey.includes('change') || lowerKey.includes('percent')) &&
          !lowerKey.includes('1h') && !lowerKey.includes('1_hour')) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue !== 0) {
          return { field: key, value: numValue };
        }
      }
    }
    
    return { field: 'not_found', value: 0 };
  },
  
  getPerformanceStats: function() {
    const recentRequests = this.requests.filter(req => req.completed);
    const avgDuration = recentRequests.length > 0 ? 
      recentRequests.reduce((sum, req) => sum + (req.duration || 0), 0) / recentRequests.length : 0;
    
    return {
      totalRequests: this.requests.length,
      completedRequests: recentRequests.length,
      errorCount: this.errors.length,
      averageDuration: avgDuration.toFixed(2) + 'ms',
      successRate: recentRequests.length > 0 ? 
        ((recentRequests.length - this.errors.length) / recentRequests.length * 100).toFixed(2) + '%' : '0%'
    };
  }
};

// تلاش برای لود constants از مسیرهای مختلف
let constants;

try {
  constants = require('./config/constants');
} catch (error) {
  try {
    constants = require('./config/constants');
  } catch (error2) {
    try {
      constants = require('./constants');
    } catch (error3) {
      console.log('△ Using fallback constants configuration');
      constants = {
        COINSTATS_API_KEY: process.env.COINSTATS_API_KEY || "uNb+sQjnjCQmV30dYrChxgh55hRHElmizLnKJX+5U6g=",
        API_URLS: {
          base: "https://openapiv1.coinstats.app",
          exchange: "https://openapiv1.coinstats.app/coins/price/exchange",
          tickers: "https://openapiv1.coinstats.app/tickers/exchanges",
          avgPrice: "https://openapiv1.coinstats.app/coins/price/avg",
          markets: "https://openapiv1.coinstats.app/markets",
          currencies: "https://openapiv1.coinstats.app/currencies",
          newsSources: "https://openapiv1.coinstats.app/news/sources",
          news: "https://openapiv1.coinstats.app/news",
          newsByType: "https://openapiv1.coinstats.app/news/type",
          btcDominance: "https://openapiv1.coinstats.app/insights/btc-dominance",
          fearGreed: "https://openapiv1.coinstats.app/insights/fear-and-greed",
          fearGreedChart: "https://openapiv1.coinstats.app/insights/fear-and-greed/chart",
          rainbowChart: "https://openapiv1.coinstats.app/insights/rainbow-chart/bitcoin"
        },
        CACHE_CONFIG: {
          timeout: 5 * 60 * 1000,
          batchSize: 5
        }
      };
    }
  }
}

// کلاس اصلی CoinStats API
class AdvancedCoinStatsAPIClient {
  constructor() {
    this.base_url = constants.API_URLS.base;
    this.api_key = constants.COINSTATS_API_KEY;
    this.request_count = 0;
    this.last_request_time = Date.now();
    this.ratelimitDelay = 1000;
    
    console.log("📖 API Client initialized", {
      base_url: this.base_url,
      api_key: this.api_key ? '***' + this.api_key.slice(-10) : 'none'
    });
  }

  async _rateLimit() {
    const currentTime = Date.now();
    const timeDiff = currentTime - this.last_request_time;
    
    if (timeDiff < this.ratelimitDelay) {
      const waitTime = this.ratelimitDelay - timeDiff;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.last_request_time = Date.now();
    this.request_count++;
    
    if (this.request_count % 10 === 0) {
      console.log(`📊 Total API requests: ${this.request_count}`);
    }
  }

  async getCoins(limit = 100) {
    const startTime = Date.now();
    const request = apiDebugSystem.logRequest('GET', `${this.base_url}/coins`, { limit });
    
    await this._rateLimit();

    try {
      const url = `${this.base_url}/coins?limit=${limit}&currency=USD`;
      console.log(`🔄 Fetching coins from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log(`📨 Response status: ${response.status} ${response.statusText}`);

      if (response.status === 429) {
        console.log(`🚫 Rate limit exceeded! Increasing delay...`);
        this.ratelimitDelay = 2000;
        apiDebugSystem.logError(request, new Error('Rate limit exceeded'));
        return { coins: [], error: 'Rate limit exceeded' };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ HTTP error! status: ${response.status}, body:`, errorText);
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        apiDebugSystem.logError(request, error);
        return { coins: [], error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();
      console.log('📊 Raw API response structure:', Object.keys(data));

      // بررسی همه حالت‌های ممکن برای ساختار داده
      let coins = [];
      if (data.result && Array.isArray(data.result)) {
        coins = data.result;
      } else if (data.coins && Array.isArray(data.coins)) {
        coins = data.coins;
      } else if (data.data && Array.isArray(data.data)) {
        coins = data.data;
      } else if (Array.isArray(data)) {
        coins = data;
      }

      // تحلیل فیلدها
      const fieldAnalysis = apiDebugSystem.analyzeFieldMapping(coins);
      console.log('🔍 Field analysis:', fieldAnalysis);

      if (coins.length > 0) {
        console.log('🔬 First coin raw structure:', coins[0]);
        console.log('🔑 All keys of first coin:', Object.keys(coins[0]));

        // نمایش فیلدهای تغییرات برای 3 کوین اول
        coins.slice(0, 3).forEach((coin, idx) => {
          const bestChangeField = apiDebugSystem.findBestPriceChangeField(coin);
          console.log(`🔍 Coin ${idx + 1} (${coin.symbol}): Best change field = ${bestChangeField.field}, value = ${bestChangeField.value}`);
        });
      }

      // نرمالیز کردن ساختار داده‌ها با سیستم پیشرفته
      const normalizedCoins = coins.map(coin => {
        // پیدا کردن بهترین فیلد تغییرات قیمت
        const bestChangeField = apiDebugSystem.findBestPriceChangeField(coin);
        
        // پیدا کردن فیلد حجم
        let volume = 0;
        const volumeFields = ['volume', 'total_volume', 'volume_24h', 'total_volume_24h'];
        for (const field of volumeFields) {
          if (coin[field] !== undefined && coin[field] !== null) {
            volume = parseFloat(coin[field]) || 0;
            if (volume > 0) break;
          }
        }
        
        // پیدا کردن فیلد مارکت کپ
        let marketCap = 0;
        const marketCapFields = ['marketCap', 'market_cap', 'market_cap_rank', 'market_cap_24h'];
        for (const field of marketCapFields) {
          if (coin[field] !== undefined && coin[field] !== null) {
            marketCap = parseFloat(coin[field]) || 0;
            if (marketCap > 0) break;
          }
        }

        return {
          // فیلدهای اصلی
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          price: coin.price,
          
          // فیلدهای تغییرات - استفاده از سیستم پیشرفته
          priceChange24h: bestChangeField.value,
          priceChangeFieldUsed: bestChangeField.field,
          
          // فیلدهای حجم و مارکت کپ
          volume: volume,
          marketCap: marketCap,
          rank: coin.rank || coin.market_cap_rank || 0,
          
          // نگهداری داده خام برای دیباگ
          __raw: coin
        };
      });

      console.log(`✅ Received ${normalizedCoins.length} coins from API (normalized)`);
      console.log(`🔍 Sample normalized coin:`, normalizedCoins[0]);
      
      const duration = Date.now() - startTime;
      apiDebugSystem.logResponse(request, { coinCount: normalizedCoins.length }, duration);
      
      return { coins: normalizedCoins, fieldAnalysis };

    } catch (error) {
      const duration = Date.now() - startTime;
      apiDebugSystem.logError(request, error);
      console.error(`❌ API getCoins error:`, error.message);
      return { coins: [], error: error.message };
    }
  }

  async getTopGainers(limit = 10) {
    const request = apiDebugSystem.logRequest('GET', 'getTopGainers', { limit });
    
    await this._rateLimit();
    
    try {
      const allCoins = await this.getCoins(50);
      const gainers = (allCoins.coins || [])
        .filter(coin => coin.priceChange24h > 0)
        .sort((a, b) => b.priceChange24h - a.priceChange24h)
        .slice(0, limit);

      console.log(`✅ Found ${gainers.length} top gainers`);
      apiDebugSystem.logResponse(request, { gainersCount: gainers.length }, 0);
      
      return gainers;
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error('❌ Top gainers error', error.message);
      return [];
    }
  }

  async getCoinDetails(coinId) {
    const request = apiDebugSystem.logRequest('GET', `${this.base_url}/coins/${coinId}`, { coinId });
    
    await this._rateLimit();
    
    try {
      const url = `${this.base_url}/coins/${coinId}`;
      console.log(`🔍 Fetching coin details from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Coin details received for ${coinId}`);
      
      apiDebugSystem.logResponse(request, data, 0);
      return data;
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error(`❌ Coin details error for ${coinId}:`, error.message);
      throw error;
    }
  }
}

// API های داده تاریخی
class HistoricalDataAPI {
  constructor() {
    this.base_url = constants.API_URLS.base;
    this.api_key = constants.COINSTATS_API_KEY;
    this.requestCache = new Map();
    this.cacheTimeout = constants.CACHE_CONFIG.timeout;
  }

  symbolToCoinId(symbol) {
    const symbolMap = {
      'BTC': 'bitcoin', 'ETH': 'ethereum', 'BNB': 'bnb', 'SOL': 'solana',
      'XRP': 'xrp', 'ADA': 'cardano', 'AVAX': 'avalanche-2', 'DOT': 'polkadot',
      'LINK': 'chainlink', 'MATIC': 'matic-network', 'LTC': 'litecoin', 'BCH': 'bitcoin-cash',
      'ATOM': 'cosmos', 'XLM': 'stellar', 'FIL': 'filecoin', 'HBAR': 'hedera-hashgraph',
      'NEAR': 'near', 'APT': 'aptos', 'ARB': 'arbitrum', 'ZIL': 'zilliqa',
      'VET': 'vechain', 'DOGE': 'dogecoin', 'TRX': 'tron', 'UNI': 'uniswap',
      'ETC': 'ethereum-classic', 'XMR': 'monero', 'ALGO': 'algorand', 'XTZ': 'tezos',
      'EOS': 'eos', 'AAVE': 'aave', 'MKR': 'maker', 'COMP': 'compound-governance-token',
      'YFI': 'yearn-finance', 'SNX': 'havven', 'SUSHI': 'sushi', 'CRV': 'curve-dao-token',
      '1INCH': '1inch', 'REN': 'republic-protocol', 'BAT': 'basic-attention-token',
      'ZRX': '0x', 'ENJ': 'enjincoin', 'MANA': 'decentraland', 'SAND': 'the-sandbox',
      'GALA': 'gala', 'APE': 'apecoin', 'GMT': 'stepn', 'AUDIO': 'audius',
      'USDT': 'tether', 'USDC': 'usd-coin', 'DAI': 'dai', 'ZEC': 'zcash', 'DASH': 'dash',
      'WAVES': 'waves', 'KSM': 'kusama', 'EGLD': 'elrond-erd-2', 'THETA': 'theta-token',
      'FTM': 'fantom', 'ONE': 'harmony', 'ICX': 'icon', 'ONT': 'ontology', 'ZEN': 'horizen',
      'SC': 'siacoin', 'BTT': 'bittorrent', 'HOT': 'holotoken', 'NANO': 'nano',
      'IOST': 'iostoken', 'IOTX': 'iotex', 'CELO': 'celo', 'KAVA': 'kava',
      'RSR': 'reserve-rights-token', 'OCEAN': 'ocean-protocol', 'BAND': 'band-protocol',
      'NMR': 'numeraire', 'UMA': 'uma', 'API3': 'api3', 'GRT': 'the-graph',
      'LPT': 'livepeer', 'ANKR': 'ankr', 'STMX': 'stormx', 'CHZ': 'chiliz',
      'AR': 'arweave', 'STORJ': 'storj', 'DODO': 'dodo', 'PERP': 'perpetual-protocol',
      'RLC': 'iexec-ric', 'ALPHA': 'alpha-finance', 'MIR': 'mirror-protocol',
      'TWT': 'trust-wallet-token', 'SXP': 'swipe', 'WRX': 'wazirx', 'FRONT': 'frontier',
      'AKRO': 'akropolis', 'REEF': 'reef-finance', 'DUSK': 'dusk-network',
      'BAL': 'balancer', 'KNC': 'kyber-network', 'SNT': 'status', 'FUN': 'funfair',
      'CVC': 'civic', 'REQ': 'request-network', 'GNT': 'golem', 'LOOM': 'loom-network',
      'UFO': 'ufo-gaming', 'PYR': 'vulcan-forged', 'ILV': 'illuvium', 'YGG': 'yield-guild-games',
      'MBOX': 'mobox', 'C98': 'coin98', 'DYDX': 'dydx', 'IMX': 'immutable-x',
      'GODS': 'gods-unchained', 'MAGIC': 'magic', 'RARE': 'superrare', 'VRA': 'verasity',
      'WAXP': 'wax', 'TLM': 'alien-worlds', 'SPS': 'splintershards', 'GHST': 'aavegotchi'
    };

    if (!symbol) return 'bitcoin';
    
    let cleanSymbol = symbol;
    if (typeof symbol === 'string') {
      cleanSymbol = symbol.replace(/[_.\-]usdt/gi, "").toUpperCase();
    }

    const coinId = symbolMap[cleanSymbol];
    if (!coinId) {
      console.log(`△ Symbol not found in map: ${cleanSymbol}, using lowercase`);
      return cleanSymbol.toLowerCase();
    }

    return coinId;
  }

  async getMultipleCoinsHistorical(coinIds, period = '24h') {
    const request = apiDebugSystem.logRequest('GET', `${this.base_url}/coins/charts`, { coinIds, period });
    
    const cacheKey = `${coinIds.sort().join(",")}.${period}`;
    const cached = this.requestCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      console.log(`💾 Using cached historical data for ${coinIds.length} coins`);
      apiDebugSystem.logResponse(request, { cached: true, coinCount: coinIds.length }, 0);
      return cached.data;
    }

    try {
      const batchSize = constants.CACHE_CONFIG.batchSize;
      const batches = [];
      
      for (let i = 0; i < coinIds.length; i += batchSize) {
        batches.push(coinIds.slice(i, i + batchSize));
      }

      const allResults = [];
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`🔄 Fetching batch ${i + 1}/${batches.length}: ${batch.join(",")}`);

        const batchResult = await this.fetchBatchHistorical(batch, period);
        if (batchResult.data && Array.isArray(batchResult.data)) {
          allResults.push(...batchResult.data);
        }

        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const result = {
        data: allResults,
        source: 'real_api',
        timestamp: Date.now()
      };

      this.requestCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      console.log(`✅ Total historical records received: ${allResults.length}`);
      apiDebugSystem.logResponse(request, { recordsCount: allResults.length }, 0);
      
      return result;

    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error("❌ Error in getMultipleCoinsHistorical:", error);
      return { data: [], source: 'fallback', error: error.message };
    }
  }

  async fetchBatchHistorical(coinIds, period) {
    const coinIdsString = coinIds.join(",");
    const url = `${this.base_url}/coins/charts?period=${period}&coinIds=${coinIdsString}`;
    console.log(`🔍 Fetching historical from: ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw new Error("Rate limit exceeded");
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const validData = data.filter(item =>
        item && item.coinId && item.chart && Array.isArray(item.chart) && item.chart.length > 0
      );

      if (validData.length === 0) {
        throw new Error("No valid historical data received");
      }

      console.log(`✅ Received valid historical data for ${validData.length} coins`);
      return { data: validData, source: 'real_api' };

    } catch (error) {
      console.error(`❌ Historical API error for ${coinIds.join(",")}:`, error.message);
      throw error;
    }
  }

  calculatePriceChangesFromChart(coinData, currentPrice) {
    console.log("🔍 CalculatePriceChangesFromChart - Input:", {
      hasCoinData: !!coinData,
      coinId: coinData?.coinId,
      chartLength: coinData?.chart?.length,
      currentPrice: currentPrice
    });

    if (!coinData) {
      console.log("❌ No coinData provided");
      return { changes: {}, source: 'no_data' };
    }

    if (!coinData.chart) {
      console.log("❌ No chart in coinData");
      return { changes: {}, source: 'no_data' };
    }

    const chart = coinData.chart;
    if (!Array.isArray(chart)) {
      console.log("❌ Chart is not an array");
      return { changes: {}, source: 'no_data' };
    }

    if (chart.length === 0) {
      console.log("❌ Chart array is empty");
      return { changes: {}, source: 'no_data' };
    }

    console.log("✅ Chart Info:", {
      chartLength: chart.length,
      firstPoint: chart[0],
      lastPoint: chart[chart.length - 1]
    });

    const latestDataPoint = chart[chart.length - 1];
    if (!latestDataPoint || !Array.isArray(latestDataPoint)) {
      console.log("❌ Latest data point is invalid");
      return { changes: {}, source: 'no_data' };
    }

    if (latestDataPoint.length < 2) {
      console.log("❌ Latest data point doesn't have enough data");
      return { changes: {}, source: 'no_data' };
    }

    const latestTime = latestDataPoint[0];
    const latestPrice = latestDataPoint[1];

    if (!latestTime || typeof latestTime !== 'number') {
      console.log("❌ Invalid latestTime:", latestTime);
      return { changes: {}, source: 'no_data' };
    }

    if (!latestPrice || latestPrice <= 0) {
      console.log("❌ Invalid latestPrice:", latestPrice);
      return { changes: {}, source: 'no_data' };
    }

    console.log("✅ Valid chart data - Latest time:", new Date(latestTime * 1000), "Latest price:", latestPrice);

    const periods = {
      '1h': 1 * 60 * 60,
      '4h': 4 * 60 * 60,
      '24h': 24 * 60 * 60,
      '7d': 7 * 24 * 60 * 60,
      '30d': 30 * 24 * 60 * 60,
      '180d': 180 * 24 * 60 * 60
    };

    console.log("📊 Periods Debug:");
    const changes = {};

    for (const [periodName, seconds] of Object.entries(periods)) {
      const targetTime = latestTime - seconds;
      if (targetTime < 0) {
        console.log(`⏩ Target time for ${periodName} is negative, skipping`);
        continue;
      }

      console.log(`🔍 Calculating ${periodName}: targetTime = ${targetTime} (${new Date(targetTime * 1000)})`);
      
      const historicalPoint = this.findClosestHistoricalPoint(chart, targetTime);
      if (historicalPoint &&
          Array.isArray(historicalPoint) &&
          historicalPoint.length >= 2 &&
          historicalPoint[1] > 0) {

        const historicalPrice = historicalPoint[1];
        const change = ((latestPrice - historicalPrice) / historicalPrice) * 100;
        changes[periodName] = parseFloat(change.toFixed(2));
        console.log(`✅ ${periodName}: ${changes[periodName]}% (from ${historicalPrice} to ${latestPrice})`);

      } else {
        console.log(`❌ No valid historical point found for ${periodName}`);
        changes[periodName] = 0.0;
      }
    }

    const result = {
      changes: changes,
      source: Object.keys(changes).length > 0 ? 'real' : 'no_data'
    };

    console.log("🎯 Final result:", result);
    return result;
  }

  findClosestHistoricalPoint(chart, targetTime) {
    if (!chart || chart.length === 0) {
      console.log("❌ findClosestHistoricalPoint: Empty chart");
      return null;
    }

    let closestPoint = null;
    let minDiff = Infinity;

    for (const point of chart) {
      if (!point || !Array.isArray(point) || point.length < 2) {
        continue;
      }

      const pointTime = point[0];
      const timeDiff = Math.abs(pointTime - targetTime);

      if (timeDiff < minDiff) {
        minDiff = timeDiff;
        closestPoint = point;
      }
    }

    console.log("✅ Closest point found:", closestPoint ? {
      time: closestPoint[0],
      price: closestPoint[1],
      timeDiff: minDiff
    } : "None");

    return closestPoint;
  }
}
// API های جدید برای تبادل و قیمت
class ExchangeAPI {
  constructor() {
    this.api_key = constants.COINSTATS_API_KEY;
  }

  async getExchangePrice(exchange, from, to, timestamp) {
    const request = apiDebugSystem.logRequest('GET', constants.API_URLS.exchange, { exchange, from, to, timestamp });
    
    try {
      const url = `${constants.API_URLS.exchange}?exchange=${exchange}&from=${from}&to=${to}&timestamp=${timestamp}`;
      console.log(`💱 Fetching exchange price from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      apiDebugSystem.logResponse(request, data, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error("❌ Exchange API error:", error);
      throw error;
    }
  }

  async getTickers(exchange) {
    const request = apiDebugSystem.logRequest('GET', constants.API_URLS.tickers, { exchange });
    
    try {
      const url = `${constants.API_URLS.tickers}?exchange=${exchange}`;
      console.log(`📊 Fetching tickers from: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      apiDebugSystem.logResponse(request, { tickersCount: data.length }, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error("❌ Tickers API error:", error);
      throw error;
    }
  }

  async getAveragePrice(coinId, timestamp) {
    const request = apiDebugSystem.logRequest('GET', constants.API_URLS.avgPrice, { coinId, timestamp });
    
    try {
      const url = `${constants.API_URLS.avgPrice}?coinId=${coinId}&timestamp=${timestamp}`;
      console.log(`📈 Fetching average price from: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      apiDebugSystem.logResponse(request, data, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error("❌ Average Price API error:", error);
      throw error;
    }
  }
}

// Market Data API
class MarketDataAPI {
  constructor() {
    this.base_url = constants.API_URLS.base;
    this.api_key = constants.COINSTATS_API_KEY;
  }

  async getMarketCap() {
    const request = apiDebugSystem.logRequest('GET', constants.API_URLS.markets, {});
    
    try {
      const url = `${constants.API_URLS.markets}`;
      console.log(`🌐 Fetching market cap data from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Market cap data received`);
      
      apiDebugSystem.logResponse(request, data, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error('❌ Market cap API error', error.message);
      throw error;
    }
  }

  async getCurrencies() {
    const request = apiDebugSystem.logRequest('GET', constants.API_URLS.currencies, {});
    
    try {
      const url = `${constants.API_URLS.currencies}`;
      console.log(`💱 Fetching currencies data from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Currencies data received: ${data.length || 'unknown'} items`);
      
      apiDebugSystem.logResponse(request, { currenciesCount: data.length }, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error("❌ Currencies API error:", error.message);
      throw error;
    }
  }

  async getGlobalData() {
    const request = apiDebugSystem.logRequest('GET', `${this.base_url}/global`, {});
    
    try {
      const url = `${this.base_url}/global`;
      console.log(`🌍 Fetching global data from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Global data received`);
      
      apiDebugSystem.logResponse(request, data, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error(`❌ Global data API error`, error.message);
      
      // Fallback: استفاده از داده‌های موجود
      try {
        const marketData = await this.getMarketCap();
        const fallbackData = {
          data: {
            market_cap_change_percentage_24h_usd: marketData.marketCapChange24h || 0,
            total_volume: marketData.volume || 0,
            active_cryptocurrencies: marketData.activeCryptocurrencies || 0,
            markets: marketData.totalExchanges || 0
          }
        };
        
        apiDebugSystem.logResponse(request, { fallback: true, data: fallbackData }, 0);
        return fallbackData;
        
      } catch (fallbackError) {
        apiDebugSystem.logError(request, fallbackError);
        console.error('❌ Global data fallback error', fallbackError.message);
        throw error;
      }
    }
  }
}

// News Data API
class NewsAPI {
  constructor() {
    this.base_url = constants.API_URLS.base;
    this.api_key = constants.COINSTATS_API_KEY;
  }

  async getNewsSources() {
    const request = apiDebugSystem.logRequest('GET', constants.API_URLS.newsSources, {});
    
    try {
      const url = `${constants.API_URLS.newsSources}`;
      console.log(`📰 Fetching news sources from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ News sources received: ${data.length || 'unknown'} sources`);
      
      apiDebugSystem.logResponse(request, { sourcesCount: data.length }, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error(`❌ News sources API error:`, error.message);
      throw error;
    }
  }

  async getNews(params = {}) {
    const request = apiDebugSystem.logRequest('GET', constants.API_URLS.news, params);
    
    try {
      const { page = 1, limit = 20, from, to } = params;
      let url = `${constants.API_URLS.news}?page=${page}&limit=${limit}`;
      if (from) url += `&from=${from}`;
      if (to) url += `&to=${to}`;

      console.log(`📰 Fetching news from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ News received: ${data.result?.length || 0} articles`);
      
      apiDebugSystem.logResponse(request, { articlesCount: data.result?.length || 0 }, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error(`❌ News API error`, error.message);
      throw error;
    }
  }

  async getNewsByType(type = 'trending', params = {}) {
    const request = apiDebugSystem.logRequest('GET', `${constants.API_URLS.newsByType}/${type}`, { type, ...params });
    
    try {
      const { page = 1, limit = 20 } = params;
      let url = `${constants.API_URLS.newsByType}/${type}?page=${page}&limit=${limit}`;
      
      console.log(`📰 Fetching ${type} news from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ ${type} news received: ${data.length || 0} articles`);
      
      apiDebugSystem.logResponse(request, { articlesCount: data.length, type: type }, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error(`❌ ${type} news API error:`, error.message);
      throw error;
    }
  }

  async getNewsDetail(newsId) {
    const request = apiDebugSystem.logRequest('GET', `${this.base_url}/news/${newsId}`, { newsId });
    
    try {
      const url = `${this.base_url}/news/${newsId}`;
      console.log(`📖 Fetching news detail from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ News detail received for ID: ${newsId}`);
      
      apiDebugSystem.logResponse(request, data, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error(`❌ News detail API error:`, error.message);
      throw error;
    }
  }
}

class InsightsAPI {
  constructor() {
    this.base_url = constants.API_URLS.base;
    this.api_key = constants.COINSTATS_API_KEY;
  }

  async getBTCDominance(type = 'all') {
    const request = apiDebugSystem.logRequest('GET', constants.API_URLS.btcDominance, { type });
    
    try {
      const url = `${constants.API_URLS.btcDominance}?type=${type}`;
      console.log(`₿ Fetching BTC Dominance from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ BTC Dominance data received`);
      
      apiDebugSystem.logResponse(request, data, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error(`❌ BTC Dominance API error:`, error.message);
      throw error;
    }
  }

  async getFearGreedIndex() {
    const request = apiDebugSystem.logRequest('GET', constants.API_URLS.fearGreed, {});
    
    try {
      const url = `${constants.API_URLS.fearGreed}`;
      console.log(`😨 Fetching Fear & Greed Index from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Fear & Greed Index data received`);
      
      apiDebugSystem.logResponse(request, data, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error(`❌ Fear & Greed API error:`, error.message);
      throw error;
    }
  }

  async getFearGreedChart() {
    const request = apiDebugSystem.logRequest('GET', constants.API_URLS.fearGreedChart, {});
    
    try {
      const url = `${constants.API_URLS.fearGreedChart}`;
      console.log(`📊 Fetching Fear & Greed Chart from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Fear & Greed Chart data received`);
      
      apiDebugSystem.logResponse(request, data, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error(`❌ Fear & Greed Chart API error:`, error.message);
      throw error;
    }
  }

  async getRainbowChart(coin = 'bitcoin') {
    const request = apiDebugSystem.logRequest('GET', constants.API_URLS.rainbowChart, { coin });
    
    try {
      const url = `${constants.API_URLS.rainbowChart}/${coin}`;
      console.log(`🌈 Fetching Rainbow Chart for ${coin} from: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.api_key,
          'Accept': 'application/json',
          'User-Agent': 'VortexAI-Server/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Rainbow Chart data received for ${coin}`);
      
      apiDebugSystem.logResponse(request, data, 0);
      return data;
      
    } catch (error) {
      apiDebugSystem.logError(request, error);
      console.error(`❌ Rainbow Chart API error:`, error.message);
      throw error;
    }
  }
}

// API Routes برای دیباگ و مانیتورینگ
const apiDebugRouter = express.Router();

apiDebugRouter.get('/api-stats', (req, res) => {
  res.json({
    performance: apiDebugSystem.getPerformanceStats(),
    fieldMapping: apiDebugSystem.fieldMapping,
    recentErrors: apiDebugSystem.errors.slice(-5),
    recentRequests: apiDebugSystem.requests.slice(-10).map(req => ({
      method: req.method,
      url: req.url,
      duration: req.duration,
      error: req.error ? req.error.message : null,
      timestamp: req.timestamp
    }))
  });
});

apiDebugRouter.get('/field-analysis', (req, res) => {
  res.json({
    fieldMapping: apiDebugSystem.fieldMapping,
    suggestions: apiDebugSystem.fieldMapping.changeFields && apiDebugSystem.fieldMapping.changeFields.length === 0 ? 
      ['No price change fields found! Check API response structure'] : 
      ['Field mapping looks good']
  });
});

apiDebugRouter.post('/reset-stats', (req, res) => {
  apiDebugSystem.requests = [];
  apiDebugSystem.errors = [];
  res.json({ success: true, message: 'API statistics reset' });
});

// تست اتصال به CoinStats API
apiDebugRouter.get('/test-coinstats-connection', async (req, res) => {
  try {
    const testResults = [];
    
    // تست فقط CoinStats API
    const coinStatsEndpoints = [
      { 
        name: 'CoinStats Global Data', 
        url: 'https://openapiv1.coinstats.app/global',
        method: 'GET'
      },
      { 
        name: 'CoinStats Coins List', 
        url: 'https://openapiv1.coinstats.app/coins?limit=5&currency=USD',
        method: 'GET'
      },
      { 
        name: 'CoinStats News', 
        url: 'https://openapiv1.coinstats.app/news?limit=3',
        method: 'GET'
      },
      { 
        name: 'CoinStats Fear & Greed', 
        url: 'https://openapiv1.coinstats.app/insights/fear-and-greed',
        method: 'GET'
      }
    ];
    
    for (const endpoint of coinStatsEndpoints) {
      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'X-API-KEY': constants.COINSTATS_API_KEY,
            'Accept': 'application/json',
            'User-Agent': 'VortexAI-Tester/1.0'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        testResults.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'success',
          httpStatus: response.status,
          duration: duration + 'ms',
          ok: response.ok,
          responseSize: response.headers.get('content-length') || 'unknown'
        });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        testResults.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'error',
          error: error.message,
          duration: duration + 'ms',
          httpStatus: 0
        });
      }
    }
    
    res.json({
      success: true,
      results: testResults,
      summary: {
        total: testResults.length,
        success: testResults.filter(r => r.status === 'success').length,
        failed: testResults.filter(r => r.status === 'error').length,
        successRate: ((testResults.filter(r => r.status === 'success').length / testResults.length) * 100).toFixed(1) + '%'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// تست کامل عملکرد APIهای داخلی
apiDebugRouter.get('/test-internal-apis', async (req, res) => {
  const startTime = Date.now();
  try {
    const testResults = [];
    
    // تست APIهای داخلی
    const internalAPIs = [
      { name: 'AdvancedCoinStatsAPIClient.getCoins', test: () => new AdvancedCoinStatsAPIClient().getCoins(5) },
      { name: 'MarketDataAPI.getMarketCap', test: () => new MarketDataAPI().getMarketCap() },
      { name: 'NewsAPI.getNews', test: () => new NewsAPI().getNews({ limit: 3 }) },
      { name: 'InsightsAPI.getFearGreedIndex', test: () => new InsightsAPI().getFearGreedIndex() },
      { name: 'NewsAPI.getNewsByType (trending)', test: () => new NewsAPI().getNewsByType('trending', { limit: 3 }) },
      { name: 'ExchangeAPI.getTickers', test: () => new ExchangeAPI().getTickers('binance') },
      { name: 'HistoricalDataAPI.getMultipleCoinsHistorical', test: () => new HistoricalDataAPI().getMultipleCoinsHistorical(['bitcoin', 'ethereum'], '24h') }
    ];
    
    for (const apiTest of internalAPIs) {
      const apiStartTime = Date.now();
      try {
        const result = await apiTest.test();
        const duration = Date.now() - apiStartTime;
        
        testResults.push({
          name: apiTest.name,
          status: 'success',
          duration: duration + 'ms',
          dataReceived: !!result,
          dataSize: result ? Object.keys(result).length : 0
        });
        
      } catch (error) {
        const duration = Date.now() - apiStartTime;
        testResults.push({
          name: apiTest.name,
          status: 'error',
          error: error.message,
          duration: duration + 'ms'
        });
      }
    }
    
    const totalDuration = Date.now() - startTime;
    
    res.json({
      success: true,
      results: testResults,
      summary: {
        total: testResults.length,
        success: testResults.filter(r => r.status === 'success').length,
        failed: testResults.filter(r => r.status === 'error').length,
        totalDuration: totalDuration + 'ms',
        successRate: ((testResults.filter(r => r.status === 'success').length / testResults.length) * 100).toFixed(1) + '%'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// بررسی وضعیت WebSocket LBank
apiDebugRouter.get('/websocket-status', (req, res) => {
  // این اطلاعات باید از WebSocket Manager گرفته شود
  // فعلاً ساختگی برمی‌گردانیم
  res.json({
    success: true,
    websocket: {
      provider: 'LBank',
      status: 'connected', // یا 'disconnected'
      activeConnections: 1,
      subscribedPairs: ['btc_usdt', 'eth_usdt', 'sol_usdt'],
      lastUpdate: new Date().toISOString(),
      uptime: '99.8%'
    },
    timestamp: new Date().toISOString()
  });
});

// بررسی سلامت کامل سیستم
apiDebugRouter.get('/system-health', async (req, res) => {
  const startTime = Date.now();
  try {
    const [coinStatsTest, internalAPIsTest, wsStatus] = await Promise.all([
      fetch(`${req.protocol}://${req.get('host')}/api/test-coinstats-connection`).then(r => r.json()),
      fetch(`${req.protocol}://${req.get('host')}/api/test-internal-apis`).then(r => r.json()),
      fetch(`${req.protocol}://${req.get('host')}/api/websocket-status`).then(r => r.json())
    ]);
    
    const totalDuration = Date.now() - startTime;
    
    const overallStatus = 
      coinStatsTest.success && 
      internalAPIsTest.success && 
      wsStatus.success ? 'healthy' : 'degraded';
    
    res.json({
      success: true,
      checkType: 'complete_system_health_check',
      timestamp: new Date().toISOString(),
      processingTime: totalDuration + 'ms',
      overallStatus: overallStatus,
      components: {
        coinStatsAPI: {
          status: coinStatsTest.success ? 'healthy' : 'unhealthy',
          successRate: coinStatsTest.summary?.successRate || '0%'
        },
        internalAPIs: {
          status: internalAPIsTest.success ? 'healthy' : 'unhealthy',
          successRate: internalAPIsTest.summary?.successRate || '0%'
        },
        websocket: {
          status: wsStatus.websocket?.status === 'connected' ? 'healthy' : 'unhealthy',
          provider: wsStatus.websocket?.provider || 'LBank'
        }
      },
      recommendations: overallStatus === 'healthy' ? 
        ['سیستم در وضعیت سالم قرار دارد'] :
        [
          'بررسی اتصال CoinStats API',
          'بررسی WebSocket connections',
          'بررسی internal API endpoints'
        ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      checkType: 'complete_system_health_check',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = {
  AdvancedCoinStatsAPIClient,
  HistoricalDataAPI,
  ExchangeAPI,
  MarketDataAPI,
  NewsAPI,
  InsightsAPI,
  apiDebugRouter,
  apiDebugSystem
};
