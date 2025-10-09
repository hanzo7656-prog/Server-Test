const constants = require('../config/constants');

// کلاینت اصلی CoinStats
class AdvancedCoinStatsAPIClient {
    constructor() {
        this.base_url = constants.API_URLS.base;
        this.api_key = constants.COINSTATS_API_KEY;
        this.request_count = 0;
        this.last_request_time = Date.now();
        this.ratelimitDelay = 1000;
    }

    async _rateLimit() {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.last_request_time;
        if (timeDiff < this.ratelimitDelay) {
            const waitTime = this.ratelimitDelay - timeDiff;
            console.log(`Rate limiting: waiting ${waitTime}ms`);
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
            const url = ${this.base_url}/coins?limit=${limit}&currency=USD;
            console.log(🔍 Fetching coins from: ${url});
            
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

            console.log(🌟 Response status: ${response.status} ${response.statusText});

            if (response.status === 429) {
                console.log('🔴 Rate limit exceeded! Increasing delay...');
                this.ratelimitDelay = 2000;
                return { coins: [], error: 'Rate limit exceeded' };
            }

            if (!response.ok) {
                console.log(✗ HTTP error! status: ${response.status});
                return { coins: [], error: HTTP ${response.status} };
            }

            const data = await response.json();
            const coinsCount = data.result?.length  data.coins?.length  0;
            console.log(🌟 Received ${coinsCount} coins from API);
            
            return { coins: data.result  data.coins  data || [] };
        } catch (error) {
            console.error("✗ API getCoins error:", error.message);
            return { coins: [], error: error.message };
        }
    }
}

// API داده‌های تاریخی
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
            'RLC': 'lexec-rlc', 'ALPHA': 'alpha-finance', 'MIR': 'mirror-protocol',
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
            console.log(△ Symbol not found in map: ${cleanSymbol}, using lowercase);
            return cleanSymbol.toLowerCase();
        }
        return coinId;
    }

    async getMultipleCoinsHistorical(coinIds, period = '24h') {
        const cacheKey = ${coinIds.sort().join(',')}.${period};
        const cached = this.requestCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            console.log(● Using cached historical data for ${coinIds.length} coins);
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
                console.log(📊 Fetching batch ${i + 1}/${batches.length}: ${batch.join(',')});
                
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

console.log(📄 Total historical records received: ${allResults.length});
            return result;
        } catch (error) {
            console.error('📄 Error in getMultipleCoinsHistorical:', error);
            return { data: [], source: 'fallback', error: error.message };
        }
    }

    async fetchBatchHistorical(coinIds, period) {
        const coinIdsString = coinIds.join(",");
        const url = ${this.base_url}/coins/charts?period=${period}&coinIds=${coinIdsString};
        
        console.log(🔍 Fetching historical from: ${url});

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
                throw new Error('Rate limit exceeded');
            }

            if (!response.ok) {
                throw new Error(HTTP ${response.status}: ${response.statusText});
            }

            const data = await response.json();
            const validData = data.filter(item => 
                item && item.coinId && item.chart && Array.isArray(item.chart) && item.chart.length > 0
            );

            if (validData.length === 0) {
                throw new Error('No valid historical data received');
            }

            console.log(☑ Received valid historical data for ${validData.length} coins);
            return { data: validData, source: 'real_api' };
        } catch (error) {
            console.error(✗ Historical API error for ${coinIds.join(',')}:, error.message);
            throw error;
        }
    }

    calculatePriceChangesFromChart(coinData, currentPrice) {
        console.log("CalculatePriceChangesFromChart - Input:", {
            hasCoinData: !!coinData,
            coinData: coinData,
            currentPrice: currentPrice
        });

        if (!coinData) {
            console.log("No coinData provided");
            return { changes: {}, source: 'no_data' };
        }

        if (!coinData.chart) {
            console.log("No chart in coinData");
            return { changes: {}, source: 'no_data' };
        }

        const chart = coinData.chart;
        if (!Array.isArray(chart)) {
            console.log("Chart is not an array");
            return { changes: {}, source: 'no_data' };
        }

        if (chart.length === 0) {
            console.log("✗ Chart array is empty");
            return { changes: {}, source: 'no_data' };
        }

        console.log("🔍 Chart Info:", {
            chartLength: chart.length,
            firstPoint: chart[0],
            lastPoint: chart[chart.length - 1],
            samplePoints: chart.slice(0, 3)
        });

        const latestDataPoint = chart[chart.length - 1];
        if (!latestDataPoint || !Array.isArray(latestDataPoint)) {
            console.log("✗ Latest data point is invalid");
            return { changes: {}, source: 'no_data' };
        }

        if (latestDataPoint.length < 2) {
            console.log("✗ Latest data point doesn't have enough data");
            return { changes: {}, source: 'no_data' };
        }

        const latestTime = latestDataPoint[0];
        const latestPrice = latestDataPoint[1];

        if (!latestTime || typeof latestTime !== 'number') {
            console.log("✗ Invalid latestTime:", latestTime);
            return { changes: {}, source: 'no_data' };
        }

        if (!latestPrice || latestPrice <= 0) {
            console.log("✗ Invalid latestPrice:", latestPrice);
            return { changes: {}, source: 'no_data' };
        }

console.log("✓ Valid chart data - Latest time:", new Date(latestTime * 1000), "Latest price:", latestPrice);

        const periods = {
            '1h': 1 * 60 * 60,
            '4h': 4 * 60 * 60,
            '24h': 24 * 60 * 60,
            '7d': 7 * 24 * 60 * 60,
            '30d': 30 * 24 * 60 * 60,
            '180d': 180 * 24 * 60 * 60
        };

        console.log("📍 Periods Debug:");
        for (const [periodName, seconds] of Object.entries(periods)) {
            const targetTime = latestTime - seconds;
            const historicalPoint = this.findClosestHistoricalPoint(chart, targetTime);
            console.log(${periodName}, {
                targetTime: new Date(targetTime * 1000),
                foundPoint: historicalPoint ? {
                    time: new Date(historicalPoint[0] * 1000),
                    price: historicalPoint[1]
                } : 'NOT FOUND',
                timeDiff: historicalPoint ? Math.abs(historicalPoint[0] - targetTime) / (24 * 60 * 60) + ' days' : 'N/A'
            });
        }

        const changes = {};
        for (const [periodName, seconds] of Object.entries(periods)) {
            const targetTime = latestTime - seconds;

            if (targetTime < 0) {
                console.log(Target time for ${periodName} is negative, skipping);
                continue;
            }

            console.log(Calculating ${periodName}: targetTime = ${targetTime} (${new Date(targetTime * 1000)}));
            const historicalPoint = this.findClosestHistoricalPoint(chart, targetTime);

            if (historicalPoint &&
                Array.isArray(historicalPoint) &&
                historicalPoint.length >= 2 &&
                historicalPoint[1] > 0) {
                
                const historicalPrice = historicalPoint[1];
                const change = ((latestPrice - historicalPrice) / historicalPrice) * 100;
                changes[periodName] = parseFloat(change.toFixed(2));
                console.log(✓ ${periodName}: ${changes[periodName]}% (from ${historicalPrice} to ${latestPrice}));
            } else {
                console.log(✗ No valid historical point found for ${periodName});
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
            console.log("✗ findClosestHistoricalPoint: Empty chart");
            return null;
        }

        let closestPoint = null;
        let minDiff = Infinity;

        console.log(Finding closest point to time: ${targetTime} (${new Date(targetTime * 1000)}));

        for (const point of chart) {
            if (!point  !Array.isArray(point)  point.length < 2) {
                continue;
            }

            const timeDiff = Math.abs(point[0] - targetTime);
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

// API جدید برای تبادل و قیمت‌های متوسط
class ExchangeAPI {
    constructor() {
        this.api_key = constants.COINSTATS_API_KEY;
    }

    async getExchangePrice(exchange, from, to, timestamp) {
        try {
            const url = ${constants.API_URLS.exchange}?exchange=${exchange}&from=${from}&to=${to}&timestamp=${timestamp};
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });

if (!response.ok) throw new Error(HTTP ${response.status});
            return await response.json();
        } catch (error) {
            console.error('Exchange API error:', error);
            throw error;
        }
    }

    async getTickers(exchange) {
        try {
            const url = ${constants.API_URLS.tickers}?exchange=${exchange};
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(HTTP ${response.status});
            return await response.json();
        } catch (error) {
            console.error('Tickers API error:', error);
            throw error;
        }
    }

    async getAveragePrice(coinId, timestamp) {
        try {
            const url = ${constants.API_URLS.avgPrice}?coinId=${coinId}&timestamp=${timestamp};
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(HTTP ${response.status});
            return await response.json();
        } catch (error) {
            console.error('Average Price API error:', error);
            throw error;
        }
    }
}

module.exports = {
    AdvancedCoinStatsAPIClient,
    HistoricalDataAPI,
    ExchangeAPI
};
