// 🔧 DEBUG - این رو در LINE 1 فایل APIClients.js قرار بده
console.log('🚀 DEBUG MODE: Tracking ALL API calls to CoinStats');

const originalFetch = global.fetch;
global.fetch = function(url, options = {}) {
    // فقط API callهای مربوط به CoinStats رو لاگ کن
    if (url && url.includes('coinstats')) {
        console.log('🐛 [COINSTATS API DEBUG] ======================');
        console.log('🔗 URL:', url);
        console.log('📦 Method:', options.method || 'GET');
        
        const apiKey = options.headers?.['X-API-KEY'] || options.headers?.['x-api-key'];
        console.log('🔑 API Key Status:', apiKey ? '✅ PRESENT' : '❌ MISSING');
        console.log('🔑 API Key Preview:', apiKey ? apiKey.substring(0, 20) + '...' : 'NOT FOUND');
        console.log('🔑 API Key Length:', apiKey?.length || 0);
        
        console.log('📋 All Headers:', JSON.stringify(options.headers, null, 2));
        console.log('🐛 [END DEBUG] ================================');
    }
    
    return originalFetch(url, options);
};

const express = require('express');
const path = require('path');

// APIClient ھیبرا کبینشرفت ھمستتم ديب//
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
        console.log(`🔍 [DEBUG] API Request: ${method} ${url}`, params);
        
        // درخواست آخر 50 نگه داشتن فقط //
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
        console.log(`✅ [DEBUG] API Response: ${duration}ms`, response);
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
        console.log(`❌ [DEBUG] API Error: ${error.message}`);

        // نگه داشتن فقط 20 خطای آخر
        if (this.errors.length > 20) {
            this.errors.shift();
        }
    },

    analyzeFieldMapping: function(coinData) {
        if (!coinData || coinData.length == 0) {
            console.log('❌ [DEBUG] No coin data for field analysis');
            return {};
        }

        const sampleCoin = coinData[0];
        const fieldAnalysis = {
            priceFields: [],
            changeFields: [],
            volumeFields: [],
            marketCapFields: [],
            allFields: Object.keys(sampleCoin)
        };

        console.log('🔍 [DEBUG] Field Analysis - Sample coin keys:', fieldAnalysis.allFields);

        // تحلیل فیلدهای قیمت //
        fieldAnalysis.priceFields = Object.keys(sampleCoin).filter(key =>
            key.toLowerCase().includes('price') &&
            !key.toLowerCase().includes('change')
        );

        // تحليل فیلدهای تغییرات //
        fieldAnalysis.changeFields = Object.keys(sampleCoin).filter(key =>
            (key.toLowerCase().includes('change') || key.toLowerCase().includes('percent')) &&
            (key.toLowerCase().includes('24h') || key.toLowerCase().includes('24_hour') || key.toLowerCase().includes('price'))
        );

        // تحليل فیلدهای حجم //
        fieldAnalysis.volumeFields = Object.keys(sampleCoin).filter(key =>
            key.toLowerCase().includes('volume')
        );

        // تحليل فیلدهای مارکت کی //
        fieldAnalysis.marketCapFields = Object.keys(sampleCoin).filter(key =>
            key.toLowerCase().includes('market') && key.toLowerCase().includes('cap')
        );

        this.fieldMapping = fieldAnalysis;
        console.log('🔍 [DEBUG] Field Analysis Result:', fieldAnalysis);
        return fieldAnalysis;
    },

    findBestPriceChangeField: function(coin) {
        console.log('🔍 [DEBUG] Finding price change field for:', coin.symbol);
        
        const possibleFields = [
            'priceChange24h', 'price_change_24h', 'change24h',
            'priceChangePercentage24h', 'percent_change_24h',
            'changePercentage24h', 'priceChange', 'change_24h',
            'price_change_percentage_24h', 'price_change_percentage_24h_in_currency',
            'priceChange1d', 'priceChange1h', 'priceChange1w' // فیلدهای جدید
        ];

        console.log('🔍 [DEBUG] Checking fields:', possibleFields);

        for (const field of possibleFields) {
            if (coin[field] != undefined && coin[field] != null) {
                const value = parseFloat(coin[field]);
                if (!isNaN(value) && value != 0) {
                    console.log(`✅ [DEBUG] Found field: ${field} = ${value}`);
                    return { field, value };
                }
            }
        }

        // جستجوي پیشرفته در تمام فیلدها
        console.log('🔍 [DEBUG] Advanced search in all fields...');
        for (const [key, value] of Object.entries(coin)) {
            const lowerKey = key.toLowerCase();
            if ((lowerKey.includes('24h') || lowerKey.includes('24_hour') || lowerKey.includes('1d')) &&
                (lowerKey.includes('change') || lowerKey.includes('percent')) &&
                !lowerKey.includes('1h') && !lowerKey.includes('1_hour')) {
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue != 0) {
                    console.log(`✅ [DEBUG] Found advanced field: ${key} = ${numValue}`);
                    return { field: key, value: numValue };
                }
            }
        }

        console.log('❌ [DEBUG] No price change field found');
        return { field: 'not_found', value: 0 };
    },

    getPerformanceStats: function() {
        const recentRequests = this.requests.filter(req => req.completed);
        const avgDuration = recentRequests.length > 0 ?
            recentRequests.reduce((sum, req) => sum + (req.duration || 0), 0) / recentRequests.length : 0;
        
        const stats = {
            totalRequests: this.requests.length,
            completedRequests: recentRequests.length,
            errorCount: this.errors.length,
            averageDuration: avgDuration.toFixed(2) + 'ms',
            successRate: recentRequests.length > 0 ?
                ((recentRequests.length - this.errors.length) / recentRequests.length * 100).toFixed(2) + '%' :
                '0%'
        };
        
        console.log('📊 [DEBUG] Performance Stats:', stats);
        return stats;
    }
};

try {
    constants = require('../config/constants');
} catch (error) {
    try {
        constants = require('./config/constants');
    } catch (error2) {
        try {
            constants = require('./constants');
        } catch (error3) {
            console.log('△ Using fallback constants configuration');
            constants = {
                COINSTATS_API_KEY: "40QRC4gdyzWIGwsvGkqWtcDOf0bk+FV217KmLxQ/Wmw=",
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

// CoinStats API_klum اصلي //
class AdvancedCoinStatsAPIClient {
    constructor() {
        this.base_url = constants.API_URLS.base;
        this.api_key = constants.COINSTATS_API_KEY;
        this.request_count = 0;
        this.last_request_time = Date.now();
        this.ratelimitDelay = 1000;

        console.log("🚀 [APICLIENT] Constructor - Initialized", {
            base_url: this.base_url,
            api_key: this.api_key ? '***' + this.api_key.slice(-10) : 'none',
            constants_source: 'config/constants'
        });
    }

    async _rateLimit() {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.last_request_time;
        
        console.log(`⏰ [RATELIMIT] Time since last request: ${timeDiff}ms, Delay: ${this.ratelimitDelay}ms`);

        if (timeDiff < this.ratelimitDelay) {
            const waitTime = this.ratelimitDelay - timeDiff;
            console.log(`⏰ [RATELIMIT] Waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.last_request_time = Date.now();
        this.request_count++;
        
        console.log(`📊 [RATELIMIT] Request count: ${this.request_count}`);
        
        if (this.request_count % 10 == 0) {
            console.log(`📊 [RATELIMIT] Total API requests: ${this.request_count}`);
        }
    }

    async getCoins(limit = 100) {
        const startTime = Date.now();
        console.log('🔍 [GETCOINS] Starting getCoins with limit:', limit);
        
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/coins`, { limit });
        await this._rateLimit();

        try {
            const url = `${this.base_url}/coins?limit=${limit}&currency=USD`;
            console.log('🔍 [GETCOINS] Fetching from URL:', url);
            console.log('🔍 [GETCOINS] API Key exists:', !!this.api_key);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            console.log('🔍 [GETCOINS] Making fetch request...');
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

            console.log('🔍 [GETCOINS] Response status:', response.status, response.statusText);
            console.log('🔍 [GETCOINS] Response ok:', response.ok);
            console.log('🔍 [GETCOINS] Response headers:', Object.fromEntries(response.headers));

            if (response.status == 429) {
                console.log('❌ [GETCOINS] Rate limit exceeded!');
                this.ratelimitDelay = 2000;
                apiDebugSystem.logError(request, new Error('Rate limit exceeded'));
                return { coins: [], error: 'Rate limit exceeded' };
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.log('❌ [GETCOINS] HTTP error! status:', response.status, 'body:', errorText);
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                apiDebugSystem.logError(request, error);
                return { coins: [], error: `HTTP ${response.status}: ${response.statusText}` };
            }

            console.log('🔍 [GETCOINS] Parsing response as JSON...');
            const data = await response.json();
            
            console.log('🔍 [GETCOINS] Raw API response keys:', Object.keys(data));
            console.log('🔍 [GETCOINS] Data analysis:', {
                hasResult: !!data.result,
                resultIsArray: Array.isArray(data.result),
                resultLength: data.result?.length,
                hasCoins: !!data.coins,
                coinsIsArray: Array.isArray(data.coins),
                coinsLength: data.coins?.length,
                hasData: !!data.data,
                dataIsArray: Array.isArray(data.data),
                dataLength: data.data?.length,
                isArray: Array.isArray(data),
                meta: data.meta
            });

            if (data.result && Array.isArray(data.result)) {
                console.log('✅ [GETCOINS] Using data.result array');
                console.log('🔍 [GETCOINS] First coin sample:', data.result[0] ? {
                    id: data.result[0].id,
                    symbol: data.result[0].symbol,
                    price: data.result[0].price,
                    availableFields: Object.keys(data.result[0])
                } : 'No coins in result');
            } else if (data.coins && Array.isArray(data.coins)) {
                console.log('✅ [GETCOINS] Using data.coins array');
            } else if (data.data && Array.isArray(data.data)) {
                console.log('✅ [GETCOINS] Using data.data array');
            } else if (Array.isArray(data)) {
                console.log('✅ [GETCOINS] Using direct array');
            } else {
                console.log('❌ [GETCOINS] No array found in response!');
            }

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

            console.log('🔍 [GETCOINS] Final coins array length:', coins.length);
            
            // تحلیل فیلدها
            const fieldAnalysis = apiDebugSystem.analyzeFieldMapping(coins);
            console.log('🔍 [GETCOINS] Field analysis:', fieldAnalysis);

            if (coins.length > 0) {
                console.log('🔍 [GETCOINS] First coin raw structure:', coins[0]);
                console.log('🔍 [GETCOINS] All keys of first coin:', Object.keys(coins[0]));

                // نمایش فیلدهای تغییرات برای 3 کوین اول
                coins.slice(0, 3).forEach((coin, idx) => {
                    const bestChangeField = apiDebugSystem.findBestPriceChangeField(coin);
                    console.log(`🔍 [GETCOINS] Coin ${idx + 1} (${coin.symbol}): Best change field = ${bestChangeField.field}, value = ${bestChangeField.value}`);
                });
            }

            // نرمالیز کردن ساختار داده‌ها
            console.log('🔍 [GETCOINS] Normalizing coins...');
            const normalizedCoins = coins.map(coin => {
                // پیدا کردن بهترین فیلد تغییرات قیمت
                const bestChangeField = apiDebugSystem.findBestPriceChangeField(coin);
                console.log(`🔍 [GETCOINS] Normalizing ${coin.symbol}:`, {
                    bestField: bestChangeField.field,
                    bestValue: bestChangeField.value,
                    availableFields: Object.keys(coin)
                });

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

            console.log(`✅ [GETCOINS] Received ${normalizedCoins.length} coins from API (normalized)`);
            console.log('✅ [GETCOINS] Sample normalized coin:', normalizedCoins[0]);

            const duration = Date.now() - startTime;
            apiDebugSystem.logResponse(request, { coinCount: normalizedCoins.length }, duration);
            
            return { coins: normalizedCoins, fieldAnalysis };

        } catch (error) {
            const duration = Date.now() - startTime;
            console.log('❌ [GETCOINS] Error in getCoins:', error.message);
            console.log('❌ [GETCOINS] Error stack:', error.stack);
            apiDebugSystem.logError(request, error);
            return { coins: [], error: error.message };
        }
    }

    async getTopGainers(limit = 10) {
        console.log('🔍 [TOPGAINERS] Starting getTopGainers with limit:', limit);
        const request = apiDebugSystem.logRequest('GET', 'getTopGainers', { limit });
        await this._rateLimit();

        try {
            const allCoins = await this.getCoins(50);
            console.log('🔍 [TOPGAINERS] All coins received:', allCoins.coins?.length);

            const gainers = (allCoins.coins || [])
                .filter(coin => coin.priceChange24h > 0)
                .sort((a, b) => b.priceChange24h - a.priceChange24h)
                .slice(0, limit);

            console.log(`✅ [TOPGAINERS] Found ${gainers.length} top gainers`);
            apiDebugSystem.logResponse(request, { gainersCount: gainers.length }, 0);
            return gainers;

        } catch (error) {
            console.log('❌ [TOPGAINERS] Error:', error.message);
            apiDebugSystem.logError(request, error);
            return [];
        }
    }
  
    async getCoinDetails(coinId) {
        console.log('🔍 [COINDETAILS] Starting getCoinDetails for:', coinId);
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/coins/${coinId}`, { coinId });
        await this._rateLimit();

        try {
            const url = `${this.base_url}/coins/${coinId}`;
            console.log('🔍 [COINDETAILS] Fetching from URL:', url);

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

            console.log('🔍 [COINDETAILS] Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ [COINDETAILS] Coin details received for ${coinId}`);
            apiDebugSystem.logResponse(request, data, 0);
            return data;

        } catch (error) {
            console.log(`❌ [COINDETAILS] Error for ${coinId}:`, error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }
}

// API    های داده تاریخی
class HistoricalDataAPI {
    constructor() {
        this.base_url = constants.API_URLS.base;
        this.api_key = constants.COINSTATS_API_KEY;
        this.requestCache = new Map();
        this.cacheTimeout = constants.CACHE_CONFIG.timeout;

        console.log("🚀 [HISTORICAL] HistoricalDataAPI Initialized", {
            base_url: this.base_url,
            cache_timeout: this.cacheTimeout
        });
    }

    symbolToCoinId(symbol) {
        console.log('🔍 [SYMBOLCONVERT] Converting symbol:', symbol);
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

        if (!symbol) {
            console.log('⚠️ [SYMBOLCONVERT] No symbol provided, using bitcoin');
            return 'bitcoin';
        }

        let cleanSymbol = symbol;
        if (typeof symbol === 'string') {
            cleanSymbol = symbol.replace(/[_.\-]usdt/gi, "").toUpperCase();
        }

        const coinId = symbolMap[cleanSymbol];
        if (!coinId) {
            console.log(`⚠️ [SYMBOLCONVERT] Symbol not found in map: ${cleanSymbol}, using lowercase`);
            return cleanSymbol.toLowerCase();
        }

        console.log(`✅ [SYMBOLCONVERT] ${symbol} -> ${coinId}`);
        return coinId;
    }

    async getMultipleCoinsHistorical(coinIds, period = '24h') {
        console.log('🔍 [HISTORICAL] getMultipleCoinsHistorical:', { coinIds, period });
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/coins/charts`, { coinIds, period });
        const cacheKey = `${coinIds.sort().join(".")}.${period}`;
        const cached = this.requestCache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            console.log(`✅ [HISTORICAL] Using cached data for ${coinIds.length} coins`);
            apiDebugSystem.logResponse(request, { cached: true, coinCount: coinIds.length }, 0);
            return cached.data;
        }

        try {
            const batchSize = constants.CACHE_CONFIG.batchSize;
            const batches = [];
            for (let i = 0; i < coinIds.length; i += batchSize) {
                batches.push(coinIds.slice(i, i + batchSize));
            }

            console.log(`🔍 [HISTORICAL] Processing ${batches.length} batches`);

            const allResults = [];
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                console.log(`🔍 [HISTORICAL] Fetching batch ${i + 1}/${batches.length}: ${batch.join(",")}`);
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

            console.log(`✅ [HISTORICAL] Total records received: ${allResults.length}`);
            apiDebugSystem.logResponse(request, { recordsCount: allResults.length }, 0);
            return result;

        } catch (error) {
            console.log('❌ [HISTORICAL] Error:', error.message);
            apiDebugSystem.logError(request, error);
            return { data: [], source: 'fallback', error: error.message };
        }
    }

    async fetchBatchHistorical(coinIds, period) {
        const coinIdsString = coinIds.join(",");
        const url = `${this.base_url}/coins/charts?period=${period}&coinIds=${coinIdsString}`;
        console.log(`🔍 [HISTORICAL] Fetching from: ${url}`);

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

            if (response.status == 429) {
                throw new Error("Rate limit exceeded");
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const validData = data.filter(item => 
                item && item.coinId && item.chart && Array.isArray(item.chart) && item.chart.length > 0
            );

            if (validData.length == 0) {
                throw new Error("No valid historical data received");
            }

            console.log(`✅ [HISTORICAL] Received valid data for ${validData.length} coins`);
            return { data: validData, source: 'real_api' };

        } catch (error) {
            console.log(`❌ [HISTORICAL] Error for ${coinIds.join(",")}:`, error.message);
            throw error;
        }
    }
    
    calculatePriceChangesFromChart(coinData, currentPrice) {
        console.log("🔍 [PRICECHANGE] CalculatePriceChangesFromChart - Input:", {
            hasCoinData: !!coinData,
            coinId: coinData?.coinId,
            chartLength: coinData?.chart?.length,
            currentPrice: currentPrice
        });

        if (!coinData) {
            console.log("❌ [PRICECHANGE] No coinData provided");
            return { changes: {}, source: 'no_data' };
        }

        if (!coinData.chart) {
            console.log("❌ [PRICECHANGE] No chart in coinData");
            return { changes: {}, source: 'no_data' };
        }

        const chart = coinData.chart;
        if (!Array.isArray(chart)) {
            console.log("❌ [PRICECHANGE] Chart is not an array");
            return { changes: {}, source: 'no_data' };
        }

        if (chart.length == 0) {
            console.log("❌ [PRICECHANGE] Chart array is empty");
            return { changes: {}, source: 'no_data' };
        }

        console.log("✅ [PRICECHANGE] Chart Info:", {
            chartLength: chart.length,
            firstPoint: chart[0],
            lastPoint: chart[chart.length - 1]
        });

        const latestDataPoint = chart[chart.length - 1];
        if (!latestDataPoint || !Array.isArray(latestDataPoint)) {
            console.log("❌ [PRICECHANGE] Latest data point is invalid");
            return { changes: {}, source: 'no_data' };
        }

        if (latestDataPoint.length < 2) {
            console.log("❌ [PRICECHANGE] Latest data point doesn't have enough data");
            return { changes: {}, source: 'no_data' };
        }

        const latestTime = latestDataPoint[0];
        const latestPrice = latestDataPoint[1];

        if (!latestTime || typeof latestTime !== 'number') {
            console.log("❌ [PRICECHANGE] Invalid latestTime:", latestTime);
            return { changes: {}, source: 'no_data' };
        }

        if (!latestPrice || latestPrice <= 0) {
            console.log("❌ [PRICECHANGE] Invalid latestPrice:", latestPrice);
            return { changes: {}, source: 'no_data' };
        }

        console.log("✅ [PRICECHANGE] Valid chart data - Latest time:", new Date(latestTime * 1000), "Latest price:", latestPrice);

        const periods = {
            '1h': 1 * 60 * 60,
            '4h': 4 * 60 * 60,
            '24h': 24 * 60 * 60,
            '7d': 7 * 24 * 60 * 60,
            '30d': 30 * 24 * 60 * 60,
            '180d': 180 * 24 * 60 * 60
        };

        console.log("📊 [PRICECHANGE] Periods Debug:");
        const changes = {};

        for (const [periodName, seconds] of Object.entries(periods)) {
            const targetTime = latestTime - seconds;
            if (targetTime < 0) {
                console.log(`⚠️ [PRICECHANGE] Target time for ${periodName} is negative, skipping`);
                continue;
            }

            console.log(`🔍 [PRICECHANGE] Calculating ${periodName}: targetTime = ${targetTime} (${new Date(targetTime * 1000)})`);
            const historicalPoint = this.findClosestHistoricalPoint(chart, targetTime);

            if (historicalPoint &&
                Array.isArray(historicalPoint) &&
                historicalPoint.length >= 2 &&
                historicalPoint[1] > 0) {
                const historicalPrice = historicalPoint[1];
                const change = ((latestPrice - historicalPrice) / historicalPrice) * 100;
                changes[periodName] = parseFloat(change.toFixed(2));
                console.log(`✅ [PRICECHANGE] ${periodName}: ${changes[periodName]}% (from ${historicalPrice} to ${latestPrice})`);
            } else {
                console.log(`❌ [PRICECHANGE] No valid historical point found for ${periodName}`);
                changes[periodName] = 0.0;
            }
        }

        const result = {
            changes: changes,
            source: Object.keys(changes).length > 0 ? 'real' : 'no_data'
        };

        console.log("✅ [PRICECHANGE] Final result:", result);
        return result;
    }

    findClosestHistoricalPoint(chart, targetTime) {
        if (!chart || chart.length == 0) {
            console.log("❌ [FINDPOINT] Empty chart");
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

        console.log("✅ [FINDPOINT] Closest point found:", closestPoint ? {
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
        console.log("🚀 [EXCHANGE] ExchangeAPI Initialized");
    }

    async getExchangePrice(exchange, from, to, timestamp) {
        console.log('🔍 [EXCHANGE] getExchangePrice:', { exchange, from, to, timestamp });
        const request = apiDebugSystem.logRequest('GET', constants.API_URLS.exchange, { exchange, from, to, timestamp });

        try {
            const url = `${constants.API_URLS.exchange}?exchange=${exchange}&from=${from}&to=${to}&timestamp=${timestamp}`;
            console.log(`🔍 [EXCHANGE] Fetching from: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            
            console.log(`✅ [EXCHANGE] Price data received`);
            apiDebugSystem.logResponse(request, data, 0);
            return data;

        } catch (error) {
            console.log("❌ [EXCHANGE] Error:", error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }

    async getTickers(exchange) {
        console.log('🔍 [EXCHANGE] getTickers for exchange:', exchange);
        const request = apiDebugSystem.logRequest('GET', constants.API_URLS.tickers, { exchange });

        try {
            const url = `${constants.API_URLS.tickers}?exchange=${exchange}`;
            console.log(`🔍 [EXCHANGE] Fetching from: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            
            console.log(`✅ [EXCHANGE] Tickers received: ${data.length}`);
            apiDebugSystem.logResponse(request, { tickersCount: data.length }, 0);
            return data;

        } catch (error) {
            console.log("❌ [EXCHANGE] Tickers error:", error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }

    async getAveragePrice(coinId, timestamp) {
        console.log('🔍 [EXCHANGE] getAveragePrice:', { coinId, timestamp });
        const request = apiDebugSystem.logRequest('GET', constants.API_URLS.avgPrice, { coinId, timestamp });

        try {
            const url = `${constants.API_URLS.avgPrice}?coinId=${coinId}&timestamp=${timestamp}`;
            console.log(`🔍 [EXCHANGE] Fetching from: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            
            console.log(`✅ [EXCHANGE] Average price received`);
            apiDebugSystem.logResponse(request, data, 0);
            return data;

        } catch (error) {
            console.log("❌ [EXCHANGE] Average price error:", error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }
}

// Market Data API
class MarketDataAPI {
    constructor() {
        this.base_url = constants.API_URLS.base;
        this.api_key = constants.COINSTATS_API_KEY;
        console.log("🚀 [MARKETDATA] MarketDataAPI Initialized");
    }

    async getMarketCap() {
        console.log('🔍 [MARKETDATA] getMarketCap');
        const request = apiDebugSystem.logRequest('GET', constants.API_URLS.markets, {});

        try {
            const url = `${constants.API_URLS.markets}`;
            console.log(`🔍 [MARKETDATA] Fetching from: ${url}`);

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
            console.log(`✅ [MARKETDATA] Market cap data received`);
            apiDebugSystem.logResponse(request, data, 0);
            return data;

        } catch (error) {
            console.log('❌ [MARKETDATA] Market cap API error', error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }

    async getCurrencies() {
        console.log('🔍 [MARKETDATA] getCurrencies');
        const request = apiDebugSystem.logRequest('GET', constants.API_URLS.currencies, {});

        try {
            const url = `${constants.API_URLS.currencies}`;
            console.log(`🔍 [MARKETDATA] Fetching from: ${url}`);

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
            console.log(`✅ [MARKETDATA] Currencies data received: ${data.length || 'unknown'} items`);
            apiDebugSystem.logResponse(request, { currenciesCount: data.length }, 0);
            return data;

        } catch (error) {
            console.log("❌ [MARKETDATA] Currencies API error:", error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }

    async getGlobalData() {
        console.log('🔍 [MARKETDATA] getGlobalData');
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/global`, {});

        try {
            const url = `${this.base_url}/global`;
            console.log(`🔍 [MARKETDATA] Fetching from: ${url}`);

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
            console.log(`✅ [MARKETDATA] Global data received`);
            apiDebugSystem.logResponse(request, data, 0);
            return data;

        } catch (error) {
            console.log('❌ [MARKETDATA] Global data API error', error.message);
            apiDebugSystem.logError(request, error);

            // Fallback
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
                console.log('⚠️ [MARKETDATA] Using fallback data');
                apiDebugSystem.logResponse(request, { fallback: true, data: fallbackData }, 0);
                return fallbackData;
            } catch (fallbackError) {
                apiDebugSystem.logError(request, fallbackError);
                console.log('❌ [MARKETDATA] Fallback error', fallbackError.message);
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
        console.log("🚀 [NEWS] NewsAPI Initialized");
    }

    async getNewsSources() {
        console.log('🔍 [NEWS] getNewsSources');
        const request = apiDebugSystem.logRequest('GET', constants.API_URLS.newsSources, {});

        try {
            const url = `${constants.API_URLS.newsSources}`;
            console.log(`🔍 [NEWS] Fetching from: ${url}`);

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
            console.log(`✅ [NEWS] News sources received: ${data.length || 'unknown'} sources`);
            apiDebugSystem.logResponse(request, { sourcesCount: data.length }, 0);
            return data;

        } catch (error) {
            console.log("❌ [NEWS] News sources API error", error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }

    async getNews(params = {}) {
        console.log('🔍 [NEWS] getNews:', params);
        const request = apiDebugSystem.logRequest('GET', constants.API_URLS.news, params);

        try {
            const { page = 1, limit = 20, from, to } = params;
            let url = `${constants.API_URLS.news}?page=${page}&limit=${limit}`;
            if (from) url += `&from=${from}`;
            if (to) url += `&to=${to}`;

            console.log(`🔍 [NEWS] Fetching from: ${url}`);

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
            console.log(`✅ [NEWS] News received: ${data.result?.length || 0} articles`);
            apiDebugSystem.logResponse(request, { articlesCount: data.result?.length || 0 }, 0);
            return data;

        } catch (error) {
            console.log('❌ [NEWS] News API error', error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }

    async getNewsByType(type = 'trending', params = {}) {
        console.log('🔍 [NEWS] getNewsByType:', { type, params });
        const request = apiDebugSystem.logRequest('GET', `${constants.API_URLS.newsByType}/${type}`, { type, ...params });

        try {
            const { page = 1, limit = 20 } = params;
            let url = `${constants.API_URLS.newsByType}/${type}?page=${page}&limit=${limit}`;

            console.log(`🔍 [NEWS] Fetching ${type} news from: ${url}`);

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
            console.log(`✅ [NEWS] ${type} news received: ${data.length || 0} articles`);
            apiDebugSystem.logResponse(request, { articlesCount: data.length, type: type }, 0);
            return data;

        } catch (error) {
            console.log(`❌ [NEWS] ${type} news API error`, error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }

    async getNewsDetail(newsId) {
        console.log('🔍 [NEWS] getNewsDetail:', newsId);
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/news/${newsId}`, { newsId });

        try {
            const url = `${this.base_url}/news/${newsId}`;
            console.log(`🔍 [NEWS] Fetching news detail from: ${url}`);

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
            console.log(`✅ [NEWS] News detail received for ID: ${newsId}`);
            apiDebugSystem.logResponse(request, data, 0);
            return data;

        } catch (error) {
            console.log(`❌ [NEWS] News detail API error:`, error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }
}

class InsightsAPI {
    constructor() {
        this.base_url = constants.API_URLS.base;
        this.api_key = constants.COINSTATS_API_KEY;
        console.log("🚀 [INSIGHTS] InsightsAPI Initialized");
    }

    async getBTCDominance(type = 'all') {
        console.log('🔍 [INSIGHTS] getBTCDominance:', type);
        const request = apiDebugSystem.logRequest('GET', constants.API_URLS.btcDominance, { type });

        try {
            const url = `${constants.API_URLS.btcDominance}?type=${type}`;
            console.log(`🔍 [INSIGHTS] Fetching BTC Dominance from: ${url}`);

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
            console.log(`✅ [INSIGHTS] BTC Dominance data received`);
            apiDebugSystem.logResponse(request, data, 0);
            return data;

        } catch (error) {
            console.log('❌ [INSIGHTS] BTC Dominance API error', error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }

    async getFearGreedIndex() {
        console.log('🔍 [INSIGHTS] getFearGreedIndex');
        const request = apiDebugSystem.logRequest('GET', constants.API_URLS.fearGreed, {});

        try {
            const url = `${constants.API_URLS.fearGreed}`;
            console.log(`🔍 [INSIGHTS] Fetching Fear & Greed Index from: ${url}`);

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
            console.log(`✅ [INSIGHTS] Fear & Greed Index data received`);
            apiDebugSystem.logResponse(request, data, 0);
            return data;

        } catch (error) {
            console.log('❌ [INSIGHTS] Fear & Greed API error', error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }

    async getFearGreedChart() {
        console.log('🔍 [INSIGHTS] getFearGreedChart');
        const request = apiDebugSystem.logRequest('GET', constants.API_URLS.fearGreedChart, {});

        try {
            const url = `${constants.API_URLS.fearGreedChart}`;
            console.log(`🔍 [INSIGHTS] Fetching Fear & Greed Chart from: ${url}`);

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
            console.log(`✅ [INSIGHTS] Fear & Greed Chart data received`);
            apiDebugSystem.logResponse(request, data, 0);
            return data;

        } catch (error) {
            console.log('❌ [INSIGHTS] Fear & Greed Chart API error:', error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }

    async getRainbowChart(coin = 'bitcoin') {
        console.log('🔍 [INSIGHTS] getRainbowChart:', coin);
        const request = apiDebugSystem.logRequest('GET', constants.API_URLS.rainbowChart, { coin });

        try {
            const url = `${constants.API_URLS.rainbowChart}/${coin}`;
            console.log(`🔍 [INSIGHTS] Fetching Rainbow Chart for ${coin} from: ${url}`);

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
            console.log(`✅ [INSIGHTS] Rainbow Chart data received for ${coin}`);
            apiDebugSystem.logResponse(request, data, 0);
            return data;

        } catch (error) {
            console.log(`❌ [INSIGHTS] Rainbow Chart API error`, error.message);
            apiDebugSystem.logError(request, error);
            throw error;
        }
    }
}

// WebSocket Manager (ساده‌شده)
class WebSocketManager {
    constructor(gistManager) {
        this.gistManager = gistManager;
        this.ws = null;
        this.realtimeData = {};
        this.connected = false;
        console.log("🚀 [WEBSOCKET] WebSocketManager Initialized");
    }

    connect() {
        console.log('🔌 [WEBSOCKET] Connecting to WebSocket...');
        // پیاده‌سازی اتصال WebSocket اینجا میاد
        this.connected = true;
    }

    getConnectionStatus() {
        const status = {
            connected: this.connected,
            active_coins: Object.keys(this.realtimeData).length,
            total_subscribed: Object.keys(this.realtimeData).length
        };
        console.log('📊 [WEBSOCKET] Connection status:', status);
        return status;
    }

    getRealtimeData() {
        console.log('📊 [WEBSOCKET] Getting realtime data, coins count:', Object.keys(this.realtimeData).length);
        return this.realtimeData;
    }
}
// API Routes برای دبیاگ و مانیتورینگ
function createApiDebugRouter(wsManager = null, gistManager = null) {
    const apiDebugRouter = express.Router();

    console.log("🚀 [DEBUGROUTER] Creating API Debug Router");

    // API:آمار عملکرد //
    apiDebugRouter.get('/api-stats', (req, res) => {
        console.log('📊 [DEBUGROUTER] /api-stats requested');
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

    // تحليل فيلدها
    apiDebugRouter.get('/field-analysis', (req, res) => {
        console.log('🔍 [DEBUGROUTER] /field-analysis requested');
        res.json({
            fieldMapping: apiDebugSystem.fieldMapping,
            suggestions: apiDebugSystem.fieldMapping.changeFields &&
            apiDebugSystem.fieldMapping.changeFields.length == 0 ?
            ['No price change fields found! Check API response structure'] :
            ['Field mapping looks good']
        });
    });

    // زيست آمار
    apiDebugRouter.post('/reset-stats', (req, res) => {
        console.log('🔄 [DEBUGROUTER] /reset-stats requested');
        apiDebugSystem.requests = [];
        apiDebugSystem.errors = [];
        res.json({ success: true, message: 'API statistics reset' });
    });

    // CoinStats API4.1  تست اتصال //
    apiDebugRouter.get('/test-coinstats-connection', async (req, res) => {
        console.log('🔍 [DEBUGROUTER] /test-coinstats-connection requested');
        try {
            const testResults = [];
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

            console.log(`✅ [DEBUGROUTER] Test completed: ${testResults.filter(r => r.status === 'success').length}/${testResults.length} successful`);
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
            console.log('❌ [DEBUGROUTER] Test error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // تست كامل عملکردAPI
    apiDebugRouter.get('/test-internal-apis', async (req, res) => {
        console.log('🔍 [DEBUGROUTER] /test-internal-apis requested');
        const startTime = Date.now();
        try {
            const testResults = [];

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
                    console.log(`✅ [DEBUGROUTER] ${apiTest.name}: SUCCESS (${duration}ms)`);

                } catch (error) {
                    const duration = Date.now() - apiStartTime;
                    testResults.push({
                        name: apiTest.name,
                        status: 'error',
                        error: error.message,
                        duration: duration + 'ms'
                    });
                    console.log(`❌ [DEBUGROUTER] ${apiTest.name}: ERROR - ${error.message}`);
                }
            }

            const totalDuration = Date.now() - startTime;
            console.log(`📊 [DEBUGROUTER] Internal API test completed: ${testResults.filter(r => r.status === 'success').length}/${testResults.length} successful`);

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
            console.log('❌ [DEBUGROUTER] Internal API test error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Websocket Status - واقعی
    apiDebugRouter.get('/websocket-status', (req, res) => {
        console.log('🔌 [DEBUGROUTER] /websocket-status requested');
        try {
            if (!wsManager) {
                console.log('❌ [DEBUGROUTER] WebSocket Manager not available');
                return res.json({
                    success: false,
                    error: 'WebSocket Manager not available'
                });
            }

            const status = wsManager.getConnectionStatus();
            const realtimeData = wsManager.getRealtimeData();

            console.log('📊 [DEBUGROUTER] WebSocket status:', status);
            res.json({
                success: true,
                websocket: {
                    provider: 'LBank',
                    status: status.connected ? 'connected' : 'disconnected',
                    activeConnections: 1,
                    active_coins: status.active_coins,
                    total_subscribed: status.total_subscribed,
                    subscribedPairs: Array.from(status.coins || []),
                    lastUpdate: new Date().toISOString(),
                    sampleData: Object.keys(realtimeData).slice(0, 3).map(symbol => ({
                        symbol,
                        price: realtimeData[symbol]?.price,
                        last_updated: realtimeData[symbol]?.last_updated
                    }))
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.log('❌ [DEBUGROUTER] WebSocket status error:', error.message);
            res.json({
                success: false,
                error: error.message,
                websocket: {
                    provider: 'LBank',
                    status: 'unknown',
                    error: error.message
                }
            });
        }
    });

    // Gist Status - واقعى
    apiDebugRouter.get('/gist-status', (req, res) => {
        console.log('💾 [DEBUGROUTER] /gist-status requested');
        try {
            if (!gistManager) {
                console.log('❌ [DEBUGROUTER] Gist Manager not available');
                return res.json({
                    success: false,
                    error: 'Gist Manager not available'
                });
            }

            const status = gistManager.getStatus();
            const allData = gistManager.getAllData();

            console.log('📊 [DEBUGROUTER] Gist status:', status);
            res.json({
                success: true,
                gist: {
                    active: status.active,
                    total_coins: status.total_coins,
                    last_updated: status.last_updated,
                    has_data: status.has_data,
                    sample_coins: Object.keys(allData.prices || {}).slice(0, 5),
                    timeframes_available: gistManager.getAvailableTimeframes()
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.log('❌ [DEBUGROUTER] Gist status error:', error.message);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    // System Health -  کامل و واقعی
    apiDebugRouter.get('/system-health', async (req, res) => {
        console.log('❤️ [DEBUGROUTER] /system-health requested');
        const startTime = Date.now();
        try {
            const [coinStatsTest, internalAPIsTest] = await Promise.all([
                fetch(`${req.protocol}://${req.get('host')}/api/test-coinstats-connection`).then(r => r.json()).catch(e => ({ success: false, error: e.message })),
                fetch(`${req.protocol}://${req.get('host')}/api/test-internal-apis`).then(r => r.json()).catch(e => ({ success: false, error: e.message }))
            ]);

            // Gistو WebSocket را قطعی از واقعی // داده های
            const wsStatus = wsManager ? {
                success: true,
                websocket: {
                    status: wsManager.connected ? 'connected' : 'disconnected',
                    active_coins: wsManager.getConnectionStatus().active_coins,
                    total_subscribed: wsManager.getConnectionStatus().total_subscribed
                }
            } : { success: false, error: 'WebSocket not available' };

            const gistStatus = gistManager ? {
                success: true,
                gist: gistManager.getStatus()
            } : { success: false, error: 'Gist Manager not available' };

            const totalDuration = Date.now() - startTime;
            const overallStatus =
                coinStatsTest.success &&
                internalAPIsTest.success &&
                wsStatus.success &&
                gistStatus.success ? 'healthy' : 'degraded';

            console.log(`📊 [DEBUGROUTER] System health: ${overallStatus} (${totalDuration}ms)`);

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
                        status: wsStatus.success ? 'healthy' : 'unhealthy',
                        activeCoins: wsStatus.websocket?.active_coins || 0,
                        provider: 'LBank'
                    },
                    gistDatabase: {
                        status: gistStatus.success ? 'healthy' : 'unhealthy',
                        totalCoins: gistStatus.gist?.total_coins || 0,
                        hasData: gistStatus.gist?.has_data || false
                    }
                },
                recommendations: overallStatus === 'healthy' ?
                    ['All systems operational'] :
                    [
                        coinStatsTest.success ? null : 'بررسی اتصال CoinStats API',
                        internalAPIsTest.success ? null : 'بررسی internal API endpoints',
                        wsStatus.success ? null : 'وبرس WebSocket connection',
                        gistStatus.success ? null : 'وبرس Gist database'
                    ].filter(Boolean)
            });

        } catch (error) {
            console.log('❌ [DEBUGROUTER] System health error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message,
                checkType: 'complete_system_health_check',
                timestamp: new Date().toISOString()
            });
        }
    });

    return apiDebugRouter;
}

// Export برای backward compatibility
const apiDebugRouter = createApiDebugRouter();

module.exports = {
    AdvancedCoinStatsAPIClient,
    HistoricalDataAPI,
    ExchangeAPI,
    MarketDataAPI,
    NewsAPI,
    InsightsAPI,
    apiDebugSystem,
    apiDebugRouter,
    createApiDebugRouter
};
