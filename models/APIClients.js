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
