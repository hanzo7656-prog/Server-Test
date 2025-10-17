const express = require('express');
const path = require('path');

// تلاش برای لود constants از مسیرهای مختلف
let constants;

try {
  constants = require('../config/constants');
} catch (error) {
  try {
    constants = require('./config/constants');
  } catch (error2) {
    try {
      constants = require('./constants');
    } catch (error3) {
      console.log('⚠️ Using fallback constants configuration');
      constants = {
        COINSTATS_API_KEY: process.env.COINSTATS_API_KEY || "uNb+sOjnjCQmV30dYrChxgh55hRHElmiZLnKJX+5U6g=",
        API_URLS: {
          base: "https://openapiv1.coinstats.app",
          exchange: "https://openapiv1.coinstats.app/coins/price/exchange",
          tickers: "https://openapiv1.coinstats.app/tickers/exchanges",
          avgPrice: "https://openapiv1.coinstats.app/coins/price/avg",
          markets: "https://openapiv1.coinstats.app/markets",
          currencies: "https://openapiv1.coinstats.app/currencies",
          newsSources: "https://openapiv1.coinstats.app/news/sources",
          news: "https://openapiv1.coinstats.app/news",
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

// کلاینت اصلی CoinStats
class AdvancedCoinStatsAPIClient {
  constructor() {
    this.base_url = constants.API_URLS.base;
    this.api_key = constants.COINSTATS_API_KEY;
    this.request_count = 0;
    this.last_request_time = Date.now();
    this.ratelimitDelay = 1000;
    console.log('🔧 API Client initialized:', {
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
    await this._rateLimit();
    
    try {
      const url = `${this.base_url}/coins?limit=${limit}&currency=USD`;
      console.log(`🌐 Fetching coins from: ${url}`);

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
        console.log('🚫 Rate limit exceeded! Increasing delay...');
        this.ratelimitDelay = 2000;
        return { coins: [], error: 'Rate limit exceeded' };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ HTTP error! status: ${response.status}, body:`, errorText);
        return { coins: [], error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();
      console.log('📦 Raw API response structure:', Object.keys(data));
      
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
      
      console.log(`✅ Received ${coins.length} coins from API`);
      return { coins };
      
    } catch (error) {
      console.error('💥 API getCoins error:', error.message);
      return { coins: [], error: error.message };
    }
  }

  async getTopGainers(limit = 10) {
    await this._rateLimit();
    
    try {
      const allCoins = await this.getCoins(50);
      const gainers = (allCoins.coins || [])
        .filter(coin => coin.priceChange24h > 0)
        .sort((a, b) => b.priceChange24h - a.priceChange24h)
        .slice(0, limit);

      console.log(`📈 Found ${gainers.length} top gainers`);
      return gainers;
    } catch (error) {
      console.error('❌ Top gainers error:', error.message);
      return [];
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
      'RLC': 'iexec-rlc', 'ALPHA': 'alpha-finance', 'MIR': 'mirror-protocol',
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
      console.log(`🔍 Symbol not found in map: ${cleanSymbol}, using lowercase`);
      return cleanSymbol.toLowerCase();
    }

    return coinId;
  }

  async getMultipleCoinsHistorical(coinIds, period = '24h') {
    const cacheKey = `${coinIds.sort().join(",")}.${period}`;
    const cached = this.requestCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      console.log(`💾 Using cached historical data for ${coinIds.length} coins`);
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
        console.log(`🔄 Fetching batch ${i + 1}/${batches.length}: ${batch.join(',')}`);
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
      return result;
    } catch (error) {
      console.error('❌ Error in getMultipleCoinsHistorical:', error);
      return { data: [], source: 'fallback', error: error.message };
    }
  }

  async fetchBatchHistorical(coinIds, period) {
    const coinIdsString = coinIds.join(",");
    const url = `${this.base_url}/coins/charts?period=${period}&coinIds=${coinIdsString}`;
    console.log(`📊 Fetching historical from: ${url}`);

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
        throw new Error('No valid historical data received');
      }

      console.log(`✅ Received valid historical data for ${validData.length} coins`);
      return { data: validData, source: 'real_api' };
    } catch (error) {
      console.error(`❌ Historical API error for ${coinIds.join(',')}:`, error.message);
      throw error;
    }
  }

  calculatePriceChangesFromChart(coinData, currentPrice) {
    console.log("📍 CalculatePriceChangesFromChart - Input:", {
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

    console.log("📈 Chart Info:", {
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

    console.log("🕒 Periods Debug:");
    const changes = {};

    for (const [periodName, seconds] of Object.entries(periods)) {
      const targetTime = latestTime - seconds;
      if (targetTime < 0) {
        console.log(`⏩ Target time for ${periodName} is negative, skipping`);
        continue;
      }

      console.log(`📐 Calculating ${periodName}: targetTime = ${targetTime} (${new Date(targetTime * 1000)})`);
      const historicalPoint = this.findClosestHistoricalPoint(chart, targetTime);

      if (historicalPoint &&
          Array.isArray(historicalPoint) &&
          historicalPoint.length >= 2 &&
          historicalPoint[1] > 0) {
        const historicalPrice = historicalPoint[1];
        const change = ((latestPrice - historicalPrice) / historicalPrice) * 100;
        changes[periodName] = parseFloat(change.toFixed(2));
        console.log(`📊 ${periodName}: ${changes[periodName]}% (from ${historicalPrice} to ${latestPrice})`);
      } else {
        console.log(`❌ No valid historical point found for ${periodName}`);
        changes[periodName] = 0.0;
      }
    }

    const result = {
      changes: changes,
      source: Object.keys(changes).length > 0 ? 'real' : 'no_data'
    };

    console.log("✅ Final result:", result);
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
      return await response.json();
    } catch (error) {
      console.error("❌ Exchange API error:", error);
      throw error;
    }
  }

  async getTickers(exchange) {
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
      return await response.json();
    } catch (error) {
      console.error("❌ Tickers API error:", error);
      throw error;
    }
  }

  async getAveragePrice(coinId, timestamp) {
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
      return await response.json();
    } catch (error) {
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
    try {
      const url = `${constants.API_URLS.markets}`;
      console.log(`🌍 Fetching market cap data from: ${url}`);

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
      console.log('✅ Market cap data received');
      return data;
    } catch (error) {
      console.error('❌ Market cap API error:', error.message);
      throw error;
    }
  }

  async getCurrencies() {
    try {
      const url = `${constants.API_URLS.currencies}`;
      console.log(`💰 Fetching currencies data from: ${url}`);

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
      return data;
    } catch (error) {
      console.error("❌ Currencies API error:", error.message);
      throw error;
    }
  }

  async getGlobalData() {
    try {
      const url = `${this.base_url}/global`;
      console.log(`🌐 Fetching global data from: ${url}`);

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
      console.log('✅ Global data received');
      return data;
    } catch (error) {
      console.error('❌ Global data API error:', error.message);
      
      // Fallback: استفاده از داده‌های موجود
      try {
        const marketData = await this.getMarketCap();
        return {
          data: {
            market_cap_change_percentage_24h_usd: marketData.marketCapChange24h || 0,
            total_volume: marketData.volume || 0,
            active_cryptocurrencies: marketData.activeCryptocurrencies || 0,
            markets: marketData.totalExchanges || 0
          }
        };
      } catch (fallbackError) {
        console.error('❌ Global data fallback error:', fallbackError.message);
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
      return data;
    } catch (error) {
      console.error("❌ News sources API error:", error.message);
      throw error;
    }
  }

  async getNews(params = {}) {
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
      return data;
    } catch (error) {
      console.error('❌ News API error:', error.message);
      throw error;
    }
  }
}

// کلاس جدید برای Insights و تحلیل های پیشرفته
class InsightsAPI {
  constructor() {
    this.base_url = constants.API_URLS.base;
    this.api_key = constants.COINSTATS_API_KEY;
  }

  async getBTCDominance(type = 'all') {
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
      console.log('✅ BTC Dominance data received');
      return data;
    } catch (error) {
      console.error('❌ BTC Dominance API error:', error.message);
      throw error;
    }
  }

  async getFearGreedIndex() {
    try {
      const url = `${constants.API_URLS.fearGreed}`;
      console.log(`😊 Fetching Fear & Greed Index from: ${url}`);

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
      console.log("✅ Fear & Greed Index data received");
      return data;
    } catch (error) {
      console.error("❌ Fear & Greed API error:", error.message);
      throw error;
    }
  }

  async getFearGreedChart() {
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
      console.log('✅ Fear & Greed Chart data received');
      return data;
    } catch (error) {
      console.error('❌ Fear & Greed Chart API error:', error.message);
      throw error;
    }
  }

  async getRainbowChart(coin = 'bitcoin') {
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
      return data;
    } catch (error) {
      console.error('❌ Rainbow Chart API error:', error.message);
      throw error;
    }
  }
}

module.exports = {
  AdvancedCoinStatsAPIClient,
  HistoricalDataAPI,
  ExchangeAPI,
  MarketDataAPI,
  NewsAPI,
  InsightsAPI
};
