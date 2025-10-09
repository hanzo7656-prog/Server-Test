// models/GistManager.js
const { Octokit } = require('@octokit/rest');
const { GITHUB_TOKEN, GIST_ID } = require('../config/api-keys');

class GistManager {
    constructor() {
        this.octokit = new Octokit({ auth: GITHUB_TOKEN });
        this.gistId = GIST_ID;
        this.priceHistory = {
            prices: {},
            last_updated: new Date().toISOString()
        };
        this.init();
    }

    async init() {
        try {
            if (this.gistId) {
                await this.loadFromGist();
            }
            setInterval(() => this.saveToGist(), 300000); // 5 minutes
            console.log("✅ Gist Manager initialized");
        } catch (error) {
            console.error("❌ Gist Manager init error:", error);
        }
    }

    async loadFromGist() {
        try {
            const response = await this.octokit.rest.gists.get({ gist_id: this.gistId });
            const content = response.data.files['prices.json'].content;
            this.priceHistory = JSON.parse(content);
            console.log("✅ Data loaded from Gist");
        } catch (error) {
            console.warn("⚠️ Could not load from Gist, starting fresh");
            this.priceHistory = { prices: {}, last_updated: new Date().toISOString() };
        }
    }

    async saveToGist() {
        try {
            this.priceHistory.last_updated = new Date().toISOString();
            const content = JSON.stringify(this.priceHistory, null, 2);

            if (this.gistId) {
                await this.octokit.rest.gists.update({
                    gist_id: this.gistId,
                    files: { 'prices.json': { content: content } }
                });
            } else {
                const response = await this.octokit.rest.gists.create({
                    description: 'VortexAI Crypto Price Data',
                    files: { 'prices.json': { content: content } },
                    public: false
                });
                this.gistId = response.data.id;
            }
            console.log("✅ Data saved to Gist");
        } catch (error) {
            console.error("❌ Gist save error", error);
        }
    }

    addPrice(symbol, currentPrice) {
        try {
            if (!this.priceHistory.prices) {
                this.priceHistory.prices = {};
            }
            
            const now = Date.now();
            let existingData = this.priceHistory.prices[symbol];
            
            if (!existingData) {
                existingData = {
                    price: currentPrice,
                    timestamp: now,
                    history: {
                        '1h': [], '4h': [], '24h': [], '7d': [], '30d': [], '180d': []
                    }
                };
                this.priceHistory.prices[symbol] = existingData;
            }

            // فقط قیمت و timestamp آپدیت میشه
            existingData.price = currentPrice;
            existingData.timestamp = now;

            return true;
        } catch (error) {
            console.error('Error in addPrice', error);
            return false;
        }
    }

    getPriceData(symbol, timeframe = null) {
        if (timeframe) {
            const data = this.priceHistory.prices && this.priceHistory.prices[symbol];
            return data ? {
                current_price: data.price,
                timestamp: data.timestamp,
                history: data.history && data.history[timeframe] || []
            } : null;
        }
        return (this.priceHistory.prices && this.priceHistory.prices[symbol]) || null;
    }

    getAllData() {
        return this.priceHistory;
    }

    getAvailableTimeframes() {
        return ["1h", "4h", "24h", "7d", "30d", "180d"];
    }
}

module.exports = GistManager;
