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
