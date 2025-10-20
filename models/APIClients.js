const express = require('express');
const path = require('path');
const WebSocketManager = require('../models/WebSocketManager');
const GistManager = require('../models/GistManager');
const constants = require('../config/constants');

// سیستم دیباگ و مانیتورینگ پیشرفته
const apiDebugSystem = {
    enabled: true,
    requests: [],
    errors: [],
    endpointStatus: new Map(),
    healthChecks: [],
    fieldMapping: {},

    logRequest: function(method, url, params = {}) {
        if (!this.enabled) return;
        const request = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            method,
            url,
            params,
            response: null,
            error: null,
            duration: null,
            status: 'pending'
        };
        this.requests.push(request);
        if (this.requests.length > 100) this.requests.shift();
        return request;
    },

    logResponse: function(request, response, duration) {
        if (!this.enabled) return;
        request.response = response;
        request.duration = duration;
        request.status = 'completed';
        request.completedAt = new Date().toISOString();
        this.updateEndpointStatus(request.url, 'healthy', duration);
    },

    logError: function(request, error, stackTrace = null) {
        if (!this.enabled) return;
        request.error = { message: error.message, stack: stackTrace || error.stack, type: error.constructor.name };
        request.status = 'error';
        request.completedAt = new Date().toISOString();
        this.updateEndpointStatus(request.url, 'error', null, error.message);

        const errorRecord = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            request: { method: request.method, url: request.url, params: request.params },
            error: { message: error.message, stack: stackTrace || error.stack, type: error.constructor.name, endpoint: request.url }
        };
        this.errors.push(errorRecord);
        if (this.errors.length > 50) this.errors.shift();
    },

    updateEndpointStatus: function(endpoint, status, responseTime = null, error = null) {
        const now = new Date().toISOString();
        const endpointStatus = this.endpointStatus.get(endpoint) || {
            endpoint, status: 'unknown', lastChecked: now, responseTimes: [], errorCount: 0, successCount: 0, lastError: null
        };
        endpointStatus.lastChecked = now;
        endpointStatus.status = status;
        if (responseTime) {
            endpointStatus.responseTimes.push(responseTime);
            if (endpointStatus.responseTimes.length > 100) endpointStatus.responseTimes.shift();
        }
        if (status === 'healthy') endpointStatus.successCount++;
        else if (status === 'error') { endpointStatus.errorCount++; endpointStatus.lastError = error; }
        this.endpointStatus.set(endpoint, endpointStatus);
    },

    checkEndpointHealth: function(endpoint) {
        const status = this.endpointStatus.get(endpoint);
        if (!status) return { status: 'unknown', message: 'Never checked' };
        const avgResponseTime = status.responseTimes.length > 0 ? status.responseTimes.reduce((a, b) => a + b, 0) / status.responseTimes.length : 0;
        const errorRate = status.successCount + status.errorCount > 0 ? (status.errorCount / (status.successCount + status.errorCount)) * 100 : 0;
        return {
            endpoint, status: status.status, lastChecked: status.lastChecked,
            averageResponseTime: avgResponseTime.toFixed(2) + 'ms', errorRate: errorRate.toFixed(2) + '%',
            totalRequests: status.successCount + status.errorCount, successCount: status.successCount,
            errorCount: status.errorCount, lastError: status.lastError
        };
    },

    checkAllEndpointsHealth: function() {
        const healthReport = {};
        let healthyCount = 0, errorCount = 0, unknownCount = 0;
        for (const [endpoint] of this.endpointStatus) {
            const health = this.checkEndpointHealth(endpoint);
            healthReport[endpoint] = health;
            if (health.status === "healthy") healthyCount++;
            else if (health.status === 'error') errorCount++;
            else unknownCount++;
        }
        return {
            timestamp: new Date().toISOString(),
            summary: { 
                totalEndpoints: this.endpointStatus.size, 
                healthy: healthyCount, 
                errors: errorCount, 
                unknown: unknownCount,
                healthPercentage: ((healthyCount / this.endpointStatus.size) * 100).toFixed(2) + '%'
            },
            details: healthReport
        };
    },

    async testEndpointConnection(endpointUrl, timeout = 10000) {
        const startTime = Date.now();
        const request = this.logRequest('HEALTH_CHECK', endpointUrl, { timeout });
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const response = await fetch(endpointUrl, {
                method: 'GET', 
                headers: { 
                    'X-API-KEY': constants.COINSTATS_API_KEY, 
                    'Accept': 'application/json' 
                }, 
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const duration = Date.now() - startTime;
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const data = await response.json();
            this.logResponse(request, { status: response.status, dataSize: JSON.stringify(data).length }, duration);
            return { 
                success: true, 
                endpoint: endpointUrl, 
                statusCode: response.status, 
                responseTime: duration + 'ms', 
                dataReceived: !!data, 
                timestamp: new Date().toISOString() 
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logError(request, error, error.stack);
            return { 
                success: false, 
                endpoint: endpointUrl, 
                error: error.message, 
                responseTime: duration + 'ms', 
                timestamp: new Date().toISOString(), 
                stackTrace: error.stack 
            };
        }
    },

    async testAllCriticalConnections() {
        const criticalEndpoints = [
            `${constants.API_URLS.base}/coins?limit=1`,
            `${constants.API_URLS.base}/markets`,
            `${constants.API_URLS.base}/news?limit=1`,
            `${constants.API_URLS.base}/insights/fear-and-greed`,
            `${constants.API_URLS.base}/tickers/exchanges`,
            `${constants.API_URLS.base}/coins/price/avg?coinId=bitcoin`,
            `${constants.API_URLS.base}/insights/btc-dominance`,
            `${constants.API_URLS.base}/news/sources`
        ];

        const results = [];
        for (const endpoint of criticalEndpoints) {
            const result = await this.testEndpointConnection(endpoint);
            results.push(result);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return { 
            timestamp: new Date().toISOString(), 
            results: results, 
            summary: {
                total: results.length, 
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                successRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(2) + '%'
            }
        };
    },

    analyzeErrors: function() {
        const errorAnalysis = { byEndpoint: {}, byType: {}, recentPatterns: [], mostCommonErrors: [] };
        this.errors.forEach(error => {
            const endpoint = error.error.endpoint;
            if (!errorAnalysis.byEndpoint[endpoint]) errorAnalysis.byEndpoint[endpoint] = { count: 0, lastError: error.timestamp, errors: [] };
            errorAnalysis.byEndpoint[endpoint].count++;
            errorAnalysis.byEndpoint[endpoint].lastError = error.timestamp;
            errorAnalysis.byEndpoint[endpoint].errors.push(error);
        });

        this.errors.forEach(error => {
            const errorType = error.error.type || 'Unknown';
            if (!errorAnalysis.byType[errorType]) errorAnalysis.byType[errorType] = 0;
            errorAnalysis.byType[errorType]++;
        });

        errorAnalysis.mostCommonErrors = Object.entries(errorAnalysis.byType)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));

        return errorAnalysis;
    },

    getPerformanceStats: function() {
        const recentRequests = this.requests.filter(req => req.status === 'completed' || req.status === 'error');
        const successfulRequests = recentRequests.filter(req => req.status === 'completed');
        const avgDuration = successfulRequests.length > 0 ? 
            successfulRequests.reduce((sum, req) => sum + (req.duration || 0), 0) / successfulRequests.length : 0;

        const endpointStats = {};
        for (const [endpoint] of this.endpointStatus) {
            endpointStats[endpoint] = this.checkEndpointHealth(endpoint);
        }

        return {
            totalRequests: this.requests.length,
            completedRequests: recentRequests.length,
            successfulRequests: successfulRequests.length,
            errorCount: this.errors.length,
            averageDuration: avgDuration.toFixed(2) + 'ms',
            successRate: recentRequests.length > 0 ?
                ((successfulRequests.length / recentRequests.length) * 100).toFixed(2) + '%' : '0%',
            endpointCount: this.endpointStatus.size,
            uptime: process.uptime().toFixed(2) + 's',
            memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
        };
    },

    resetStats: function() { 
        this.requests = []; 
        this.errors = []; 
        this.endpointStatus.clear(); 
        console.log('✅ API statistics reset'); 
    }
};

// Compatibility Layer
const compatibilityLayer = {
    normalizeCoinData: function(coinData, isRaw = false) {
        if (isRaw) return coinData;
        return {
            id: coinData.id,
            symbol: coinData.symbol,
            name: coinData.name,
            price: coinData.price,
            priceChange24h: coinData.priceChange24h || coinData.priceChange1d || 0,
            priceChangeFieldUsed: 'priceChange24h',
            volume: coinData.volume || coinData.total_volume || 0,
            marketCap: coinData.marketCap || coinData.market_cap || 0,
            rank: coinData.rank || coinData.market_cap_rank || 0,
            __raw: coinData
        };
    },

    findBestPriceChangeField: function(coin) {
        const possibleFields = ['priceChange24h', 'price_change_24h', 'change24h', 'priceChangePercentage24h', 'percent_change_24h'];
        for (const field of possibleFields) {
            if (coin[field] != undefined && coin[field] != null) {
                const value = parseFloat(coin[field]);
                if (!isNaN(value) && value != 0) return { field, value };
            }
        }
        return { field: 'not_found', value: 0 };
    },

    analyzeFieldMapping: function(coinData) {
        if (!coinData || coinData.length === 0) return {};
        const sampleCoin = coinData[0];
        const fieldAnalysis = {
            priceFields: Object.keys(sampleCoin).filter(key => 
                key.toLowerCase().includes('price') && key.toLowerCase().includes('change')),
            changeFields: Object.keys(sampleCoin).filter(key =>
                (key.toLowerCase().includes('change') || key.toLowerCase().includes('percent')) &&
                (key.toLowerCase().includes('24h') || key.toLowerCase().includes('24_hour') || key.toLowerCase().includes('price'))),
            volumeFields: Object.keys(sampleCoin).filter(key => key.toLowerCase().includes('volume')),
            marketCapFields: Object.keys(sampleCoin).filter(key =>
                key.toLowerCase().includes('market') && key.toLowerCase().includes('cap')),
            allFields: Object.keys(sampleCoin)
        };
        apiDebugSystem.fieldMapping = fieldAnalysis;
        return fieldAnalysis;
    }
};

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
            await new Promise(resolve => setTimeout(resolve, this.ratelimitDelay - timeDiff));
        }
        this.last_request_time = Date.now();
        this.request_count++;
    }

    async _makeRequest(endpoint, params = {}, isRaw = false) {
        const startTime = Date.now();
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}${endpoint}`, params);
        await this._rateLimit();
        
        try {
            const url = new URL(`${this.base_url}${endpoint}`);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    'X-API-KEY': this.api_key, 
                    'Accept': 'application/json', 
                    'User-Agent': 'VortexAI-Server/1.0' 
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const data = await response.json();
            const duration = Date.now() - startTime;
            apiDebugSystem.logResponse(request, { dataSize: JSON.stringify(data).length }, duration);

            if (isRaw) return { success: true, data, raw: true };
            return { success: true, data: this._normalizeData(endpoint, data) };
        } catch (error) {
            const duration = Date.now() - startTime;
            apiDebugSystem.logError(request, error, error.stack);
            return { success: false, error: error.message };
        }
    }

    _normalizeData(endpoint, data) {
        switch(endpoint) {
            case '/coins':
                if (Array.isArray(data)) {
                    compatibilityLayer.analyzeFieldMapping(data);
                    return data.map(coin => compatibilityLayer.normalizeCoinData(coin));
                }
                return data;
            case '/news':
                if (data.result && Array.isArray(data.result)) return data.result;
                return data;
            default:
                return data;
        }
    }

    // ===================== MARKET DATA ================================
    async getCoins(limit = 100, currency = 'USD', raw = false) {
        return this._makeRequest('/coins', { limit, currency }, raw);
    }

    async getCoinDetails(coinId, currency = 'USD', raw = false) {
        return this._makeRequest(`/coins/${coinId}`, { currency }, raw);
    }

    async getMarketCap(raw = false) {
        return this._makeRequest('/markets', {}, raw);
    }

    async getCurrencies(raw = false) {
        return this._makeRequest('/currencies', {}, raw);
    }

    async getTickerExchanges(raw = false) {
        return this._makeRequest('/tickers/exchanges', {}, raw);
    }

    async getTickerMarkets(raw = false) {
        return this._makeRequest('/tickers/markets', {}, raw);
    }

    async getCoinAvgPrice(coinId, timestamp = null, raw = false) {
        const params = { coinId };
        if (timestamp) params.timestamp = timestamp;
        return this._makeRequest('/coins/price/avg', params, raw);
    }

    async getCoinExchangePrice(exchange, from, to, timestamp = null, raw = false) {
        const params = { exchange, from, to };
        if (timestamp) params.timestamp = timestamp;
        return this._makeRequest('/coins/price/exchange', params, raw);
    }

    // ========================= CHARTS =========================
    async getCoinCharts(coinId, period = '24h', raw = false) {
        return this._makeRequest(`/coins/${coinId}/charts`, { period }, raw);
    }

    async getCoinsCharts(coinIds, period = '24h', raw = false) {
        return this._makeRequest('/coins/charts', { coinIds: coinIds.join(','), period }, raw);
    }

    // ========================= NEWS =========================
    // تابع getNews را اینطور اصلاح کنید:
    async getNews(params = {}, raw = false) {
    // پارامترهای معتبر برای API جدید
        const validParams = {};
    
        if (params.limit) validParams.limit = params.limit;
        if (params.page) validParams.page = params.page;
        if (params.from) validParams.from = params.from;
        if (params.to) validParams.to = params.to;
    
        return this._makeRequest('/news', validParams, raw);
    }

    async getNewsByType(type = 'trending', params = {}, raw = false) {
        const validTypes = ['handpicked', 'trending', 'latest', 'bullish', 'bearish'];
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid news type: ${type}. Valid types: ${validTypes.join(', ')}`);
        }
        return this._makeRequest(`/news/type/${type}`, params, raw);
    }

    async getNewsDetail(newsId, raw = false) {
        return this._makeRequest(`/news/${newsId}`, {}, raw);
    }

    async getNewsSources(raw = false) {
        return this._makeRequest('/news/sources', {}, raw);
    }

    // ========================= INSIGHTS =========================
    async getFearGreedIndex(raw = false) {
        try {
            console.log('🎯 REAL: Making request to CoinStats Fear Greed API...');
        
            const url = 'https://openapiv1.coinstats.app/insights/fear-and-greed';
            const options = {
                method: 'GET',
                headers: {
                    'X-API-KEY': '40QRC4gdyzWIGwsvGkqWtcDOf0bk+FV217KmLxQ/Wmw=',
                    'accept': 'application/json'
                }
            };

            console.log('🔗 REAL: Fetching from:', url);
            const response = await fetch(url, options);
            console.log('📡 REAL: Response status:', response.status);
            console.log('📡 REAL: Response headers:', Object.fromEntries(response.headers.entries()));
        
            const rawResponse = await response.text();
            console.log('📄 REAL: Raw response text:', rawResponse);

            // اگر response خالیه یا error میده
            if (!rawResponse || rawResponse.trim() === '') {
                console.log('❌ REAL: Empty response from CoinStats');
                return {
                    success: false,
                    error: 'Empty response from CoinStats API'
                };
            }

            const data = JSON.parse(rawResponse);
            console.log('📊 REAL: Parsed JSON data:', JSON.stringify(data, null, 2));

        // بررسی همه فیلدهای ممکن
            console.log('🔍 REAL: Checking all data fields:');
            Object.keys(data).forEach(key => {
                console.log(`   ${key}:`, data[key]);
            });

            return {
                success: false,
                error: 'CoinStats API returned data but no fear greed value found',
                rawData: data
            };

        } catch (error) {
            console.error('💥 REAL: Fear Greed API error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getFearGreedChart(raw = false) {
        try {
            const result = await this._makeRequest('/insights/fear-and-greed/chart', {}, raw);
            console.log('📊 Raw Fear Greed Chart API response:', result);
         
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'No data received from Fear Greed Chart API'
                };
            }
        } catch (error) {
            console.error('❌ Fear Greed Chart API error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getBTCDominance(type = 'all', raw = false) {
        return this._makeRequest('/insights/btc-dominance', { type }, raw);
    }

    async getRainbowChart(coin = 'bitcoin', raw = false) {
        return this._makeRequest(`/insights/rainbow-chart/${coin}`, {}, raw);
    }

    // ===================== COMPATIBILITY ======================
    async getTopGainers(limit = 10) {
        const result = await this.getCoins(50);
        if (!result.success) return [];
        const gainers = (result.data || [])
            .filter(coin => coin.priceChange24h > 0)
            .sort((a, b) => b.priceChange24h - a.priceChange24h)
            .slice(0, limit);
        return gainers;
    }

    async getGlobalData(raw = false) {
        return this.getMarketCap(raw);
    }
}

// سیستم سلامت پیشرفته
class AdvancedHealthMonitor {
    constructor(wsManager, gistManager) {
        this.wsManager = wsManager;
        this.gistManager = gistManager;
        this.healthChecks = [];
        this.lastFullCheck = null;
    }

    async performFullHealthCheck() {
        const checkStart = Date.now();
        const healthReport = {
            timestamp: new Date().toISOString(),
            overallStatus: 'healthy',
            components: {},
            recommendations: []
        };

        const apiHealth = await apiDebugSystem.testAllCriticalConnections();
        healthReport.components.apiConnectivity = apiHealth;

        if (this.wsManager) {
            const wsStatus = this.wsManager.getConnectionStatus();
            healthReport.components.websocket = {
                status: wsStatus.connected ? 'healthy' : 'unhealthy',
                connected: wsStatus.connected,
                activeCoins: wsStatus.active_coins,
                totalSubscribed: wsStatus.total_subscribed,
                provider: 'LBank'
            };
        }

        if (this.gistManager) {
            const gistStatus = this.gistManager.getStatus();
            healthReport.components.gistDatabase = {
                status: gistStatus.active ? 'healthy' : 'unhealthy',
                active: gistStatus.active,
                totalCoins: gistStatus.total_coins,
                lastUpdated: gistStatus.last_updated,
                hasData: gistStatus.has_data
            };
        }

        healthReport.components.server = {
            status: 'healthy',
            uptime: process.uptime() + 's',
            memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            nodeVersion: process.version,
            platform: process.platform
        };

        const endpointHealth = apiDebugSystem.checkAllEndpointsHealth();
        healthReport.components.endpoints = endpointHealth;

        const failedComponents = [];
        if (apiHealth.summary.successRate < 80) failedComponents.push('API Connectivity');
        if (healthReport.components.websocket && !healthReport.components.websocket.connected) failedComponents.push('WebSocket');
        if (healthReport.components.gistDatabase && !healthReport.components.gistDatabase.active) failedComponents.push('Gist Database');
        if (endpointHealth.summary.healthPercentage < 80) failedComponents.push('Internal Endpoints');

        if (failedComponents.length > 0) {
            healthReport.overallStatus = 'degraded';
            healthReport.failedComponents = failedComponents;
            healthReport.recommendations = failedComponents.map(comp => `بررسی و تعمیر ${comp}`);
        }

        healthReport.checkDuration = (Date.now() - checkStart) + 'ms';
        this.lastFullCheck = healthReport;
        this.healthChecks.push(healthReport);
        if (this.healthChecks.length > 50) this.healthChecks.shift();
        return healthReport;
    }

    getHealthHistory() { return this.healthChecks; }
    getLastHealthCheck() { return this.lastFullCheck; }
}

// Router برای دیباگ و مانیتورینگ
function createApiDebugRouter(wsManager = null, gistManager = null) {
    const apiDebugRouter = express.Router();
    const healthMonitor = new AdvancedHealthMonitor(wsManager, gistManager);

    apiDebugRouter.get('/api-stats', (req, res) => {
        try {
            res.json({
                success: true,
                performance: apiDebugSystem.getPerformanceStats(),
                errorAnalysis: apiDebugSystem.analyzeErrors(),
                recentErrors: apiDebugSystem.errors.slice(-10),
                recentRequests: apiDebugSystem.requests.slice(-20).map(req => ({
                    id: req.id, method: req.method, url: req.url, duration: req.duration,
                    status: req.status, timestamp: req.timestamp, error: req.error ? req.error.message : null
                }))
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    apiDebugRouter.get('/endpoints-health', (req, res) => {
        try {
            res.json({ success: true, ...apiDebugSystem.checkAllEndpointsHealth() });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    apiDebugRouter.post('/test-endpoint', express.json(), async (req, res) => {
        try {
            const { endpointUrl, timeout = 10000 } = req.body;
            if (!endpointUrl) return res.status(400).json({ success: false, error: 'Endpoint URL is required' });
            const result = await apiDebugSystem.testEndpointConnection(endpointUrl, timeout);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    apiDebugRouter.get('/full-health-check', async (req, res) => {
        try {
            const healthReport = await healthMonitor.performFullHealthCheck();
            res.json({ success: true, ...healthReport });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    apiDebugRouter.get('/health-history', (req, res) => {
        try {
            const history = healthMonitor.getHealthHistory();
            res.json({
                success: true, 
                history: history, 
                totalChecks: history.length,
                lastCheck: healthMonitor.getLastHealthCheck()?.timestamp
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    apiDebugRouter.get('/error-analysis', (req, res) => {
        try {
            res.json({ success: true, ...apiDebugSystem.analyzeErrors() });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    apiDebugRouter.get('/websocket-status', (req, res) => {
        try {
            if (!wsManager) return res.json({ success: false, error: 'WebSocket Manager not available' });
            const status = wsManager.getConnectionStatus();
            const realtimeData = wsManager.getRealtimeData();
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
                    sampleData: Object.keys(realtimeData).slice(0, 5).map(symbol => ({
                        symbol, 
                        price: realtimeData[symbol]?.price, 
                        last_updated: realtimeData[symbol]?.last_updated
                    }))
                }, 
                timestamp: new Date().toISOString()
            });
        } catch (error) {
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

    apiDebugRouter.get('/gist-status', (req, res) => {
        try {
            if (!gistManager) return res.json({ success: false, error: 'Gist Manager not available' });
            const status = gistManager.getStatus();
            const allData = gistManager.getAllData();
            res.json({
                success: true,
                gist: {
                    active: status.active, 
                    total_coins: status.total_coins, 
                    last_updated: status.last_updated,
                    has_data: status.has_data, 
                    sample_coins: Object.keys(allData.prices || {}).slice(0, 10), 
                    timeframes_available: gistManager.getAvailableTimeframes() 
                }, 
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.json({ success: false, error: error.message });
        }
    });

    apiDebugRouter.get('/test-all-connections', async (req, res) => {
        try {
            const results = await apiDebugSystem.testAllCriticalConnections();
            res.json({ success: true, ...results });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    apiDebugRouter.get('/field-analysis', (req, res) => {
        try {
            res.json({ 
                success: true, 
                fieldMapping: apiDebugSystem.fieldMapping, 
                suggestions: apiDebugSystem.fieldMapping.changeFields && apiDebugSystem.fieldMapping.changeFields.length === 0 ? 
                    ["No price change fields found! Check API response structure"] : 
                    ["Field mapping looks good"]
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    apiDebugRouter.post('/reset-stats', (req, res) => {
        try {
            apiDebugSystem.resetStats();
            res.json({ 
                success: true, 
                message: 'API statistics reset successfully', 
                timestamp: new Date().toISOString() 
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    apiDebugRouter.get('/test-coinstats-connection', async (req, res) => {
        try {
            const testResults = [];
            const coinStatsEndpoints = [
                { name: 'CoinStats Coins List', url: 'https://openapiv1.coinstats.app/coins?limit=5&currency=USD', method: 'GET' },
                { name: 'CoinStats Market Cap', url: 'https://openapiv1.coinstats.app/markets', method: 'GET' },
                { name: 'CoinStats News', url: 'https://openapiv1.coinstats.app/news?limit=3', method: 'GET' },
                { name: 'CoinStats Fear & Greed', url: 'https://openapiv1.coinstats.app/insights/fear-and-greed', method: 'GET' },
                { name: 'CoinStats Ticker Exchanges', url: 'https://openapiv1.coinstats.app/tickers/exchanges', method: 'GET' },
                { name: 'CoinStats BTC Dominance', url: 'https://openapiv1.coinstats.app/insights/btc-dominance', method: 'GET' },
                { name: 'CoinStats News Sources', url: 'https://openapiv1.coinstats.app/news/sources', method: 'GET' },
                { name: 'CoinStats Avg Price', url: 'https://openapiv1.coinstats.app/coins/price/avg?coinId=bitcoin', method: 'GET' }
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
            res.status(500).json({ success: false, error: error.message });
        }
    });

    apiDebugRouter.get('/test-internal-apis', async (req, res) => {
        const startTime = Date.now();
        try {
            const testResults = [];
            const apiClient = new AdvancedCoinStatsAPIClient();
            const internalAPIs = [
                { name: 'getCoins', test: () => apiClient.getCoins(5) },
                { name: 'getMarketCap', test: () => apiClient.getMarketCap() },
                { name: 'getNews', test: () => apiClient.getNews({ limit: 3 }) },
                { name: 'getFearGreedIndex', test: () => apiClient.getFearGreedIndex() },
                { name: 'getTickerExchanges', test: () => apiClient.getTickerExchanges() },
                { name: 'getBTCDominance', test: () => apiClient.getBTCDominance() },
                { name: 'getNewsSources', test: () => apiClient.getNewsSources() },
                { name: 'getCoinAvgPrice', test: () => apiClient.getCoinAvgPrice('bitcoin') },
                { name: 'getRainbowChart', test: () => apiClient.getRainbowChart() },
                { name: 'getFearGreedChart', test: () => apiClient.getFearGreedChart() },
                { name: 'getNewsByType (handpicked)', test: () => apiClient.getNewsByType('handpicked', { limit: 3 }) },
                { name: 'getNewsByType (latest)', test: () => apiClient.getNewsByType('latest', { limit: 3 }) },
                { name: 'getNewsByType (bullish)', test: () => apiClient.getNewsByType('bullish', { limit: 3 }) },
                { name: 'getNewsByType (bearish)', test: () => apiClient.getNewsByType('bearish', { limit: 3 }) }
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
                        dataReceived: !!result.data, 
                        success: result.success 
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
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return apiDebugRouter;
}

// کلاس تحلیل تکنیکال برای front-end
class TechnicalAnalysisAPI {
    constructor() {
        const TechnicalAnalysisEngine = require('./TechnicalAnalysis');
        this.engine = new TechnicalAnalysisEngine();
    }

    // تحلیل پیشرفته برای front-end
    async getTechnicalAnalysis(symbol, timeframe = '24h') {
        try {
            const apiClient = new AdvancedCoinStatsAPIClient();
            const chartData = await apiClient.getCoinCharts(symbol, timeframe, false);
            if (!chartData.success) {
                throw new Error('Failed to fetch chart data');
            }

            const priceData = this.prepareChartDataForAnalysis(chartData.data);
            const indicators = this.engine.calculateAllIndicators(priceData);

            return {
                success: true,
                data: {
                    symbol,
                    timeframe,
                    indicators,
                    analysis: this.generateAnalysisReport(indicators),
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    prepareChartDataForAnalysis(chartData) {
        // پیاده‌سازی مشابه تابع preparePriceDataForAnalysis
        if (!chartData || !chartData.chart) return [];
        return chartData.chart.map((point, index) => ({
            timestamp: point[0],
            open: point[1] * 0.99,
            high: point[1] * 1.02,
            low: point[1] * 0.98,
            price: point[1],
            volume: point[2] || 1000
        }));
    }

    generateAnalysisReport(indicators) {
        // تولید گزارش تحلیلی پیشرفته
        return {
            overall_sentiment: this.calculateSentiment(indicators),
            key_levels: this.calculateKeyLevels(indicators),
            risk_assessment: this.assessRisk(indicators),
            trading_recommendations: this.generateRecommendations(indicators)
        };
    }

    calculateSentiment(indicators) {
        // محاسبه احساسات بازار بر اساس اندیکاتورها
        let score = 0;
        if (indicators.rsi < 30) score += 2;
        if (indicators.rsi > 70) score -= 2;
        if (indicators.macd > indicators.macd_signal) score += 1;
        if (indicators.moving_avg_20 > indicators.moving_avg_50) score += 1;
        if (score > 1) return 'BULLISH';
        if (score < -1) return 'BEARISH';
        return 'NEUTRAL';
    }

    calculateKeyLevels(indicators) {
        return {
            support: indicators.bollinger_lower,
            resistance: indicators.bollinger_upper,
            pivot: indicators.pivot_point,
            fibonacci: {
                level_236: indicators.fibonacci_236,
                level_382: indicators.fibonacci_382,
                level_618: indicators.fibonacci_618
            }
        };
    }

    assessRisk(indicators) {
        const volatility = Math.abs(indicators.bollinger_upper - indicators.bollinger_lower) / indicators.bollinger_middle;
        if (volatility > 0.1) return 'HIGH';
        if (volatility > 0.05) return 'MEDIUM';
        return 'LOW';
    }

    generateRecommendations(indicators) {
        const recommendations = [];
        if (indicators.rsi < 30) recommendations.push("سیگنال خرید بر اساس RSI");
        if (indicators.rsi > 70) recommendations.push("سیگنال فروش بر اساس RSI");
        if (indicators.macd_hist > 0) recommendations.push("تغییر روند مثبت در MACD");
        return recommendations;
    }
}

// Export برای backward compatibility
const apiDebugRouter = createApiDebugRouter();

module.exports = {
    AdvancedCoinStatsAPIClient,
    apiDebugSystem,
    apiDebugRouter,
    createApiDebugRouter,
    TechnicalAnalysisAPI,
    AdvancedHealthMonitor,
    compatibilityLayer
};
