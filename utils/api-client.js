const { COINSTATS_API, INTERNAL_API, SERVER } = require('../config/api-endpoints');
const { isValidResponse, sanitizeInput } = require('./validators');

class APIClient {
    constructor() {
        this.baseURL = SERVER.URL;
        this.coinstatsAPI = COINSTATS_API.BASE_URL;
        this.apiKey = COINSTATS_API.API_KEY;
        this.timeout = 10000; // 10 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    /**
     * درخواست عمومی به API
     */
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            data = null,
            headers = {},
            retry = this.retryAttempts,
            timeout = this.timeout
        } = options;

        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'VortexAI-Crypto-Scanner/1.0.0',
                ...headers
            },
            timeout
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        // اضافه کردن API Key برای CoinStats
        if (endpoint.includes(COINSTATS_API.BASE_URL)) {
            config.headers['X-API-KEY'] = this.apiKey;
        }

        let lastError;

        for (let attempt = 1; attempt <= retry; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                config.signal = controller.signal;

                const response = await fetch(endpoint, config);
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseData = await response.json();

                if (!isValidResponse(responseData)) {
                    throw new Error('Invalid API response structure');
                }

                return {
                    success: true,
                    data: responseData.data || responseData,
                    status: response.status,
                    headers: response.headers
                };

            } catch (error) {
                lastError = error;

                if (attempt < retry) {
                    console.warn(`API request failed (attempt ${attempt}/${retry}), retrying...`, error.message);
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        console.error('All API request attempts failed:', lastError);
        return {
            success: false,
            error: this.normalizeError(lastError),
            status: 0
        };
    }

    /**
     * درخواست به CoinStats API
     */
    async coinstatsRequest(path, options = {}) {
        const endpoint = `${this.coinstatsAPI}${path}`;
        return this.request(endpoint, {
            headers: {
                'X-API-KEY': this.apiKey
            },
            ...options
        });
    }

    /**
     * درخواست به API داخلی
     */
    async internalRequest(path, options = {}) {
        const endpoint = `${this.baseURL}${INTERNAL_API.BASE_PATH}${path}`;
        return this.request(endpoint, options);
    }

    /**
     * دریافت لیست ارزها
     */
    async getCoins(limit = 100, skip = 0, currency = 'USD') {
        const params = new URLSearchParams({
            limit: Math.min(limit, 1000).toString(),
            skip: skip.toString(),
            currency: sanitizeInput(currency)
        });

        return this.coinstatsRequest(`${COINSTATS_API.ENDPOINTS.COINS}?${params}`);
    }

    /**
     * دریافت اطلاعات یک ارز خاص
     */
    async getCoinDetails(coinId) {
        if (!coinId) {
            return { success: false, error: 'Coin ID is required' };
        }

        const path = COINSTATS_API.ENDPOINTS.COIN_DETAIL.replace('{id}', sanitizeInput(coinId));
        return this.coinstatsRequest(path);
    }

    /**
     * دریافت چارت قیمت
     */
    async getCoinCharts(coinId, period = '24h') {
        const path = COINSTATS_API.ENDPOINTS.COIN_CHARTS
            .replace('{id}', sanitizeInput(coinId));
        
        const params = new URLSearchParams({ period: sanitizeInput(period) });
        return this.coinstatsRequest(`${path}?${params}`);
    }

    /**
     * دریافت اخبار
     */
    async getNews(limit = 20, page = 1) {
        const params = new URLSearchParams({
            limit: Math.min(limit, 100).toString(),
            page: page.toString()
        });

        return this.coinstatsRequest(`${COINSTATS_API.ENDPOINTS.NEWS}?${params}`);
    }

    /**
     * دریافت داده‌های بازار
     */
    async getMarkets() {
        return this.coinstatsRequest(COINSTATS_API.ENDPOINTS.MARKETS);
    }

    /**
     * دریافت شاخص ترس و طمع
     */
    async getFearGreedIndex() {
        return this.coinstatsRequest(COINSTATS_API.ENDPOINTS.FEAR_GREED);
    }

    /**
     * دریافت تسلط بیت‌کوین
     */
    async getBTCDominance() {
        return this.coinstatsRequest(COINSTATS_API.ENDPOINTS.BTC_DOMINANCE);
    }

    /**
     * دریافت داده‌های جهانی
     */
    async getGlobalData() {
        return this.coinstatsRequest(COINSTATS_API.ENDPOINTS.GLOBAL);
    }

    /**
     * اسکن بازار
     */
    async scanMarket(limit = 50, filter = 'volume', scanType = 'basic') {
        return this.internalRequest(INTERNAL_API.ENDPOINTS.SCAN, {
            method: 'POST',
            data: {
                limit: Math.min(limit, 300),
                filter: sanitizeInput(filter),
                type: sanitizeInput(scanType),
                timestamp: Date.now()
            }
        });
    }

    /**
     * تحلیل تکنیکال
     */
    async technicalAnalysis(symbol, timeframe = '24h') {
        const path = INTERNAL_API.ENDPOINTS.TECHNICAL_ANALYSIS;
        const params = new URLSearchParams({
            symbol: sanitizeInput(symbol),
            timeframe: sanitizeInput(timeframe)
        });

        return this.internalRequest(`${path}?${params}`);
    }

    /**
     * دریافت سلامت سیستم
     */
    async getSystemHealth() {
        return this.internalRequest(INTERNAL_API.ENDPOINTS.HEALTH);
    }

    /**
     * دریافت آمار سیستم
     */
    async getSystemStats() {
        return this.internalRequest(INTERNAL_API.ENDPOINTS.SYSTEM_STATS);
    }

    /**
     * درخواست دسته‌ای
     */
    async batchRequests(requests) {
        const results = await Promise.allSettled(
            requests.map(req => this.request(req.endpoint, req.options))
        );

        return results.map((result, index) => ({
            request: requests[index],
            success: result.status === 'fulfilled',
            data: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason : null
        }));
    }

    /**
     * ایجاد تاخیر
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * نرمالایز کردن خطاها
     */
    normalizeError(error) {
        if (error.name === 'AbortError') {
            return {
                code: 'TIMEOUT',
                message: 'Request timeout',
                details: 'The request took too long to complete'
            };
        }

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return {
                code: 'NETWORK_ERROR',
                message: 'Network connection failed',
                details: 'Check your internet connection and try again'
            };
        }

        if (error.message.includes('HTTP error')) {
            const status = parseInt(error.message.match(/\d+/)?.[0]) || 500;
            return {
                code: `HTTP_${status}`,
                message: `HTTP Error ${status}`,
                details: error.message
            };
        }

        return {
            code: 'UNKNOWN_ERROR',
            message: error.message || 'Unknown error occurred',
            details: error.stack || 'No additional details available'
        };
    }

    /**
     * بررسی وضعیت اتصال
     */
    async checkConnection() {
        try {
            const startTime = Date.now();
            const response = await this.internalRequest(INTERNAL_API.ENDPOINTS.HEALTH, {
                timeout: 5000
            });
            const endTime = Date.now();

            return {
                connected: response.success,
                responseTime: endTime - startTime,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                connected: false,
                responseTime: 0,
                error: this.normalizeError(error),
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * دریافت کش (اگر وجود داشته باشد)
     */
    async getCachedData(key, maxAge = 60000) { // 1 minute default
        try {
            const cached = localStorage.getItem(`vortex_cache_${key}`);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            
            if (Date.now() - timestamp > maxAge) {
                localStorage.removeItem(`vortex_cache_${key}`);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    }

    /**
     * ذخیره در کش
     */
    async setCachedData(key, data) {
        try {
            const cacheItem = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(`vortex_cache_${key}`, JSON.stringify(cacheItem));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * پاک کردن کش
     */
    async clearCache(pattern = 'vortex_cache_') {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(pattern))
                .forEach(key => localStorage.removeItem(key));
            return true;
        } catch {
            return false;
        }
    }
}

// ایجاد instance جهانی
const apiClient = new APIClient();

module.exports = {
    APIClient,
    apiClient
};
