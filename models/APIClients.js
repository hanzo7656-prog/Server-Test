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

// if constants is a constant
{
    if constants is a constant {
    {
    }
    }
    }
}

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
                COINSTATS_API_KEY: process.env.COINSTATS_API_KEY || 'uNb+sQjnjCQmV30dYrChxgh55hRHElmizLinkJX+5U6g=',
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
    
