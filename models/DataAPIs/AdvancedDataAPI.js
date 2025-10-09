// models/DataAPIs/AdvancedDataAPI.js
const { COINSTATS_API_KEY } = require('../../config/api-keys');
const { CACHE_TIMEOUT, REQUEST_TIMEOUT } = require('../../config/constants');

class AdvancedDataAPI {
    constructor() {
        this.base_url = "https://openapiv1.coinstats.app";
        this.api_key = COINSTATS_API_KEY;
        this.requestCache = new Map();
        this.cacheTimeout = CACHE_TIMEOUT;
        this.requestCount = 0;
    }

    /**
     * دریافت قیمت متوسط تاریخی یک کوین
     */
    async getHistoricalAvgPrice(coinId, timestamp) {
        try {
            const url = ${this.base_url}/coins/price/avg?coinId=${coinId}&timestamp=${timestamp};
            return await this._makeRequest(url);
        } catch (error) {
            console.error(❌ Historical price error for ${coinId}:, error.message);
            return null;
        }
    }

    /**
     * دریافت قیمت تبادل در صرافی خاص
     */
    async getExchangePrice(exchange, fromCoin, toCoin, timestamp) {
        try {
            const url = ${this.base_url}/coins/price/exchange?exchange=${exchange}&from=${fromCoin}&to=${toCoin}&timestamp=${timestamp};
            return await this._makeRequest(url);
        } catch (error) {
            console.error(❌ Exchange price error for ${exchange}:, error.message);
            return null;
        }
    }

    /**
     * دریافت لیست صرافی‌ها و تیکرها
     */
    async getExchangesTickers() {
        try {
            const url = ${this.base_url}/tickers/exchanges;
            return await this._makeRequest(url);
        } catch (error) {
            console.error('❌ Exchanges tickers error:', error.message);
            return null;
        }
    }

    /**
     * تحلیل مقایسه‌ای چند کوین
     */
    async getMultipleCoinsHistorical(coinIds, period = '24h') {
        try {
            // استفاده از endpoint موجود با منطق پیشرفته‌تر
            const coinIdsString = coinIds.join(",");
            const url = ${this.base_url}/coins/charts?period=${period}&coinIds=${coinIdsString};
            return await this._makeRequest(url);
        } catch (error) {
            console.error('❌ Multiple coins historical error:', error.message);
            return { data: [], source: 'error', error: error.message };
        }
    }

    /**
     * تابع اصلی درخواست با کش و مدیریت خطا
     */
    async _makeRequest(url) {
        const cacheKey = url;
        const cached = this.requestCache.get(cacheKey);
        
        // بررسی کش
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            console.log(💾 Using cached data for: ${url.split('?')[0]});
            return cached.data;
        }

        // مدیریت Rate Limit
        this.requestCount++;
        if (this.requestCount % 10 === 0) {
            console.log(📊 Total API requests: ${this.requestCount});
        }

        try {
            console.log(🌐 Fetching: ${url});
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.api_key,
                    'Accept': 'application/json',
                    'User-Agent': 'VortexAI-Server/2.0'
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
            
            // ذخیره در کش
            this.requestCache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;

} catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    /**
     * پاک کردن کش
     */
    clearCache() {
        this.requestCache.clear();
        console.log('🧹 API cache cleared');
    }

    /**
     * دریافت وضعیت API
     */
    getAPIStatus() {
        return {
            requestCount: this.requestCount,
            cacheSize: this.requestCache.size,
            cacheHitRate: this._calculateCacheHitRate(),
            isActive: true
        };
    }

    /**
     * محاسبه نرخ کش
     */
    _calculateCacheHitRate() {
        // منطق پیچیده‌تر برای محاسبه نرخ کش
        return this.requestCount > 0 ? Math.min((this.requestCount / (this.requestCount + this.requestCache.size)) * 100, 100) : 0;
    }
}

module.exports = AdvancedDataAPI;
