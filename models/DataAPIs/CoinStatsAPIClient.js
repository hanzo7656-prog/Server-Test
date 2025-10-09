// models/DataAPIs/CoinStatsAPIClient.js
const { COINSTATS_API_KEY } = require('../../config/api-keys');

class AdvancedCoinStatsAPIClient {
    constructor() {
        this.base_url = "https://openapiv1.coinstats.app";
        this.api_key = COINSTATS_API_KEY;
        this.request_count = 0;
        this.last_request_time = Date.now();
        this.ratelimitDelay = 1000;
    }

    async _rateLimit() {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.last_request_time;

        if (timeDiff < this.ratelimitDelay) {
            const waitTime = this.ratelimitDelay - timeDiff;
            console.log(⏳ Rate limiting: waiting ${waitTime}ms);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.last_request_time = Date.now();
        this.request_count++;

        if (this.request_count % 10 === 0) {
            console.log(📊 Total API requests: ${this.request_count});
        }
    }

    async getCoins(limit = 100) {
        await this._rateLimit();

        try {
            const url = ${this.base_url}/coins?limit=${limit}&currency=USD;
            console.log(🌐 Fetching coins from: ${url});

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

            console.log(📡 Response status: ${response.status} ${response.statusText});

            if (response.status === 429) {
                console.log('🔴 Rate limit exceeded! Increasing delay...');
                this.ratelimitDelay = 2000;
                return { coins: [], error: 'Rate limit exceeded' };
            }

            if (!response.ok) {
                console.log(❌ HTTP error! status: ${response.status});
                return { coins: [], error: HTTP ${response.status} };
            }

            const data = await response.json();
            const coinsCount = data.result?.length  data.coins?.length  0;
            
            console.log(✅ Received ${coinsCount} coins from API);
            return { coins: data.result  data.coins  data || [] };

        } catch (error) {
            console.error("❌ API getCoins error:", error.message);
            return { coins: [], error: error.message };
        }
    }
}

module.exports = AdvancedCoinStatsAPIClient;
