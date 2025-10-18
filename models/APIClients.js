const express = require('express');
const path = require('path');
const WebSocketManager = require('./websocket-manager');
const GistManager = require('./gist-manager');
const constants = require('./config/constants');

// سیستم دیباگ و مانیتورینگ پیشرفته
const apiDebugSystem = {
    enabled: true,
    requests: [],
    errors: [],
    endpointStatus: new Map(),
    healthChecks: [],
    fieldMapping: {},
    
    // لاگ درخواست‌ها
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
        
        if (this.requests.length > 100) {
            this.requests.shift();
        }
        
        return request;
    },
    
    // لاگ پاسخ‌ها
    logResponse: function(request, response, duration) {
        if (!this.enabled) return;
        
        request.response = response;
        request.duration = duration;
        request.status = 'completed';
        request.completedAt = new Date().toISOString();
        
        this.updateEndpointStatus(request.url, 'healthy', duration);
    },
    
    // لاگ خطاها
    logError: function(request, error, stackTrace = null) {
        if (!this.enabled) return;
        
        request.error = {
            message: error.message,
            stack: stackTrace || error.stack,
            type: error.constructor.name
        };
        request.status = 'error';
        request.completedAt = new Date().toISOString();
        
        this.updateEndpointStatus(request.url, 'error', null, error.message);
        
        const errorRecord = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            request: {
                method: request.method,
                url: request.url,
                params: request.params
            },
            error: {
                message: error.message,
                stack: stackTrace || error.stack,
                type: error.constructor.name,
                endpoint: request.url
            }
        };
        
        this.errors.push(errorRecord);
        
        if (this.errors.length > 50) {
            this.errors.shift();
        }
    },
    
    // آپدیت وضعیت endpoint
    updateEndpointStatus: function(endpoint, status, responseTime = null, error = null) {
        const now = new Date().toISOString();
        const endpointStatus = this.endpointStatus.get(endpoint) || {
            endpoint,
            status: 'unknown',
            lastChecked: now,
            responseTimes: [],
            errorCount: 0,
            successCount: 0,
            lastError: null
        };
        
        endpointStatus.lastChecked = now;
        endpointStatus.status = status;
        
        if (responseTime) {
            endpointStatus.responseTimes.push(responseTime);
            if (endpointStatus.responseTimes.length > 100) {
                endpointStatus.responseTimes.shift();
            }
        }
        
        if (status === 'healthy') {
            endpointStatus.successCount++;
        } else if (status === 'error') {
            endpointStatus.errorCount++;
            endpointStatus.lastError = error;
        }
        
        this.endpointStatus.set(endpoint, endpointStatus);
    },
    
    // بررسی سلامت endpoint
    checkEndpointHealth: function(endpoint) {
        const status = this.endpointStatus.get(endpoint);
        if (!status) return { status: 'unknown', message: 'Never checked' };
        
        const avgResponseTime = status.responseTimes.length > 0 
            ? status.responseTimes.reduce((a, b) => a + b, 0) / status.responseTimes.length 
            : 0;
            
        const errorRate = status.successCount + status.errorCount > 0 
            ? (status.errorCount / (status.successCount + status.errorCount)) * 100 
            : 0;
            
        return {
            endpoint,
            status: status.status,
            lastChecked: status.lastChecked,
            averageResponseTime: avgResponseTime.toFixed(2) + 'ms',
            errorRate: errorRate.toFixed(2) + '%',
            totalRequests: status.successCount + status.errorCount,
            successCount: status.successCount,
            errorCount: status.errorCount,
            lastError: status.lastError
        };
    }
};
    // بررسی سلامت تمام endpointها
    checkAllEndpointsHealth: function() {
        const healthReport = {};
        let healthyCount = 0;
        let errorCount = 0;
        let unknownCount = 0;
        
        for (const [endpoint] of this.endpointStatus) {
            const health = this.checkEndpointHealth(endpoint);
            healthReport[endpoint] = health;
            
            if (health.status === 'healthy') healthyCount++;
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
    
    // تست اتصال به endpoint خاص
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
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
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
    
    // تست اتصال به تمام endpointهای حیاتی
    async testAllCriticalConnections() {
        const criticalEndpoints = [
            `${constants.API_URLS.base}/coins?limit=1`,
            `${constants.API_URLS.base}/markets`,
            `${constants.API_URLS.base}/news?limit=1`,
            `${constants.API_URLS.base}/insights/fear-and-greed`,
            `${constants.API_URLS.base}/tickers/exchanges`
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
    
    // تحلیل خطاها و پیدا کردن الگو
    analyzeErrors: function() {
        const errorAnalysis = {
            byEndpoint: {},
            byType: {},
            recentPatterns: [],
            mostCommonErrors: []
        };
        
        this.errors.forEach(error => {
            const endpoint = error.error.endpoint;
            
            if (!errorAnalysis.byEndpoint[endpoint]) {
                errorAnalysis.byEndpoint[endpoint] = {
                    count: 0,
                    lastError: error.timestamp,
                    errors: []
                };
            }
            
            errorAnalysis.byEndpoint[endpoint].count++;
            errorAnalysis.byEndpoint[endpoint].lastError = error.timestamp;
            errorAnalysis.byEndpoint[endpoint].errors.push(error);
        });
        
        this.errors.forEach(error => {
            const errorType = error.error.type || 'Unknown';
            
            if (!errorAnalysis.byType[errorType]) {
                errorAnalysis.byType[errorType] = 0;
            }
            
            errorAnalysis.byType[errorType]++;
        });
        
        errorAnalysis.mostCommonErrors = Object.entries(errorAnalysis.byType)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));
        
        return errorAnalysis;
    },
    
    // آمار عملکرد
    getPerformanceStats: function() {
        const recentRequests = this.requests.filter(req => req.status === 'completed' || req.status === 'error');
        const successfulRequests = recentRequests.filter(req => req.status === 'completed');
        
        const avgDuration = successfulRequests.length > 0 
            ? successfulRequests.reduce((sum, req) => sum + (req.duration || 0), 0) / successfulRequests.length 
            : 0;
        
        const endpointStats = {};
        for (const [endpoint, status] of this.endpointStatus) {
            endpointStats[endpoint] = this.checkEndpointHealth(endpoint);
        }
        
        return {
            totalRequests: this.requests.length,
            completedRequests: recentRequests.length,
            successfulRequests: successfulRequests.length,
            errorCount: this.errors.length,
            averageDuration: avgDuration.toFixed(2) + 'ms',
            successRate: recentRequests.length > 0 
                ? ((successfulRequests.length / recentRequests.length) * 100).toFixed(2) + '%'
                : '0%',
            endpointCount: this.endpointStatus.size,
            uptime: process.uptime().toFixed(2) + 's',
            memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
        };
    },
    
    // ریست آمار
    resetStats: function() {
        this.requests = [];
        this.errors = [];
        this.endpointStatus.clear();
        console.log('✅ API statistics reset');
    }
};
// کلاینت اصلی API با endpointهای سالم
class AdvancedCoinStatsAPIClient {
    constructor() {
        this.base_url = constants.API_URLS.base;
        this.api_key = constants.COINSTATS_API_KEY;
        this.request_count = 0;
        this.last_request_time = Date.now();
        this.ratelimitDelay = 1000;
        
        console.log("✅ API Client initialized with healthy endpoints");
    }
    
    async _rateLimit() {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.last_request_time;
        
        if (timeDiff < this.ratelimitDelay) {
            const waitTime = this.ratelimitDelay - timeDiff;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.last_request_time = Date.now();
        this.request_count++;
    }
    
    // اندپوینت‌های اصلی سالم
    async getCoins(limit = 100, currency = 'USD') {
        const startTime = Date.now();
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/coins`, { limit, currency });
        
        await this._rateLimit();
        
        try {
            const url = `${this.base_url}/coins?limit=${limit}&currency=${currency}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
            const data = await response.json();
            const duration = Date.now() - startTime;
            
            apiDebugSystem.logResponse(request, { coinCount: data.length }, duration);
            return { success: true, data };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            apiDebugSystem.logError(request, error, error.stack);
            return { success: false, error: error.message };
        }
    }
    
    async getMarketCap() {
        const startTime = Date.now();
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/markets`, {});
        
        await this._rateLimit();
        
        try {
            const url = `${this.base_url}/markets`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
            const data = await response.json();
            const duration = Date.now() - startTime;
            
            apiDebugSystem.logResponse(request, data, duration);
            return { success: true, data };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            apiDebugSystem.logError(request, error, error.stack);
            return { success: false, error: error.message };
        }
    }
    
    async getCurrencies() {
        const startTime = Date.now();
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/currencies`, {});
        
        await this._rateLimit();
        
        try {
            const url = `${this.base_url}/currencies`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
            const data = await response.json();
            const duration = Date.now() - startTime;
            
            apiDebugSystem.logResponse(request, { currenciesCount: data.length }, duration);
            return { success: true, data };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            apiDebugSystem.logError(request, error, error.stack);
            return { success: false, error: error.message };
        }
    }
    
    async getNews(page = 1, limit = 20) {
        const startTime = Date.now();
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/news`, { page, limit });
        
        await this._rateLimit();
        
        try {
            const url = `${this.base_url}/news?page=${page}&limit=${limit}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
            const data = await response.json();
            const duration = Date.now() - startTime;
            
            apiDebugSystem.logResponse(request, { articlesCount: data.result?.length || 0 }, duration);
            return { success: true, data };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            apiDebugSystem.logError(request, error, error.stack);
            return { success: false, error: error.message };
        }
    }
    
    async getNewsByType(type = 'trending', page = 1, limit = 20) {
        const startTime = Date.now();
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/news/type/${type}`, { type, page, limit });
        
        await this._rateLimit();
        
        try {
            const url = `${this.base_url}/news/type/${type}?page=${page}&limit=${limit}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
            const data = await response.json();
            const duration = Date.now() - startTime;
            
            apiDebugSystem.logResponse(request, { articlesCount: data.length || 0, type }, duration);
            return { success: true, data };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            apiDebugSystem.logError(request, error, error.stack);
            return { success: false, error: error.message };
        }
    }
    
    async getFearGreedIndex() {
        const startTime = Date.now();
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/insights/fear-and-greed`, {});
        
        await this._rateLimit();
        
        try {
            const url = `${this.base_url}/insights/fear-and-greed`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
            const data = await response.json();
            const duration = Date.now() - startTime;
            
            apiDebugSystem.logResponse(request, data, duration);
            return { success: true, data };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            apiDebugSystem.logError(request, error, error.stack);
            return { success: false, error: error.message };
        }
    }
    
    async getTickerExchanges() {
        const startTime = Date.now();
        const request = apiDebugSystem.logRequest('GET', `${this.base_url}/tickers/exchanges`, {});
        
        await this._rateLimit();
        
        try {
            const url = `${this.base_url}/tickers/exchanges`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
            const data = await response.json();
            const duration = Date.now() - startTime;
            
            apiDebugSystem.logResponse(request, { exchangesCount: data.length || 0 }, duration);
            return { success: true, data };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            apiDebugSystem.logError(request, error, error.stack);
            return { success: false, error: error.message };
        }
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
        
        // 1. بررسی اتصال APIهای حیاتی
        const apiHealth = await apiDebugSystem.testAllCriticalConnections();
        healthReport.components.apiConnectivity = apiHealth;
        
        // 2. بررسی وضعیت WebSocket
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
        
        // 3. بررسی وضعیت Gist
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
        
        // 4. بررسی سلامت سرور
        healthReport.components.server = {
            status: 'healthy',
            uptime: process.uptime() + 's',
            memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            nodeVersion: process.version,
            platform: process.platform
        };
        
        // 5. بررسی endpointهای داخلی
        const endpointHealth = apiDebugSystem.checkAllEndpointsHealth();
        healthReport.components.endpoints = endpointHealth;
        
        // محاسبه وضعیت کلی
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
        
        if (this.healthChecks.length > 50) {
            this.healthChecks.shift();
        }
        
        return healthReport;
    }
    
    getHealthHistory() {
        return this.healthChecks;
    }
    
    getLastHealthCheck() {
        return this.lastFullCheck;
    }
}

// ایجاد Router برای دیباگ و مانیتورینگ
function createApiDebugRouter(wsManager = null, gistManager = null) {
    const apiDebugRouter = express.Router();
    const healthMonitor = new AdvancedHealthMonitor(wsManager, gistManager);
    
    // آمار عملکرد API
    apiDebugRouter.get('/api-stats', (req, res) => {
        try {
            const performanceStats = apiDebugSystem.getPerformanceStats();
            const errorAnalysis = apiDebugSystem.analyzeErrors();
            
            res.json({
                success: true,
                performance: performanceStats,
                errorAnalysis: errorAnalysis,
                recentErrors: apiDebugSystem.errors.slice(-10),
                recentRequests: apiDebugSystem.requests.slice(-20).map(req => ({
                    id: req.id,
                    method: req.method,
                    url: req.url,
                    duration: req.duration,
                    status: req.status,
                    timestamp: req.timestamp,
                    error: req.error ? req.error.message : null
                }))
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // سلامت endpointها
    apiDebugRouter.get('/endpoints-health', (req, res) => {
        try {
            const health = apiDebugSystem.checkAllEndpointsHealth();
            res.json({
                success: true,
                ...health
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // تست اتصال به endpoint خاص
    apiDebugRouter.post('/test-endpoint', express.json(), async (req, res) => {
        try {
            const { endpointUrl, timeout = 10000 } = req.body;
            
            if (!endpointUrl) {
                return res.status(400).json({
                    success: false,
                    error: 'Endpoint URL is required'
                });
            }
            
            const result = await apiDebugSystem.testEndpointConnection(endpointUrl, timeout);
            res.json(result);
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // تست سلامت کامل سیستم
    apiDebugRouter.get('/full-health-check', async (req, res) => {
        try {
            const healthReport = await healthMonitor.performFullHealthCheck();
            res.json({
                success: true,
                ...healthReport
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // تاریخچه سلامت
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
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // تحلیل خطاها
    apiDebugRouter.get('/error-analysis', (req, res) => {
        try {
            const analysis = apiDebugSystem.analyzeErrors();
            res.json({
                success: true,
                ...analysis
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // وضعیت WebSocket
    apiDebugRouter.get('/websocket-status', (req, res) => {
        try {
            if (!wsManager) {
                return res.json({
                    success: false,
                    error: 'WebSocket Manager not available'
                });
            }

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

    // وضعیت Gist
    apiDebugRouter.get('/gist-status', (req, res) => {
        try {
            if (!gistManager) {
                return res.json({
                    success: false,
                    error: 'Gist Manager not available'
                });
            }

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
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    // تست تمام اتصالات حیاتی
    apiDebugRouter.get('/test-all-connections', async (req, res) => {
        try {
            const results = await apiDebugSystem.testAllCriticalConnections();
            res.json({
                success: true,
                ...results
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // تحلیل فیلدها
    apiDebugRouter.get('/field-analysis', (req, res) => {
        try {
            res.json({
                success: true,
                fieldMapping: apiDebugSystem.fieldMapping,
                suggestions: apiDebugSystem.fieldMapping.changeFields &&
                apiDebugSystem.fieldMapping.changeFields.length == 0 ?
                    ['No price change fields found! Check API response structure'] :
                    ['Field mapping looks good']
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ریست آمار
    apiDebugRouter.post('/reset-stats', (req, res) => {
        try {
            apiDebugSystem.resetStats();
            res.json({
                success: true,
                message: 'API statistics reset successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // تست کوین‌استتس
    apiDebugRouter.get('/test-coinstats-connection', async (req, res) => {
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
                },
                {
                    name: 'CoinStats Ticker Exchanges',
                    url: 'https://openapiv1.coinstats.app/tickers/exchanges',
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

    // تست APIهای داخلی
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
                { name: 'getNewsByType (trending)', test: () => apiClient.getNewsByType('trending', 1, 3) }
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
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    return apiDebugRouter;
}

// Export برای backward compatibility
const apiDebugRouter = createApiDebugRouter();

module.exports = {
    AdvancedCoinStatsAPIClient,
    apiDebugSystem,
    apiDebugRouter,
    createApiDebugRouter,
    AdvancedHealthMonitor
};
