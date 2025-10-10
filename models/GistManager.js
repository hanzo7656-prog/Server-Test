const { Octokit } = require('@octokit/rest');
const constants = require('./config/constants');

class GistManager {
    constructor() {
        this.octokit = new Octokit({ auth: constants.GITHUB_TOKEN });
        this.gistId = constants.GIST_ID;
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
            setInterval(() => this.saveToGist(), 300000); // هر 5 دقیقه ذخیره کن
            console.log("✅ Gist Manager initialized");
        } catch (error) {
            console.error("❌ Gist Manager init error:", error);
        }
    }

    async loadFromGist() {
        try {
            const response = await this.octokit.gists.get({ gist_id: this.gistId });
            const content = response.data.files['prices.json'].content;
            this.priceHistory = JSON.parse(content);
            console.log("✅ Data loaded from Gist");
        } catch (error) {
            console.warn("⚠️ Could not load from Gist, starting fresh");
            this.priceHistory = {
                prices: {},
                last_updated: new Date().toISOString()
            };
        }
    }

    async saveToGist() {
        try {
            this.priceHistory.last_updated = new Date().toISOString();
            const content = JSON.stringify(this.priceHistory, null, 2);

            if (this.gistId) {
                await this.octokit.gists.update({
                    gist_id: this.gistId,
                    files: { 'prices.json': { content: content } }
                });
                console.log("✅ Data saved to Gist");
            } else {
                const response = await this.octokit.gists.create({
                    description: 'VortexAI Crypto Price Data',
                    files: { 'prices.json': { content: content } },
                    public: false
                });
                this.gistId = response.data.id;
                console.log("✅ New Gist created");
            }
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
                // ایجاد داده جدید
                existingData = {
                    symbol: symbol,
                    price: currentPrice,
                    timestamp: now,
                    history: {
                        '1h': [{ price: currentPrice, timestamp: now }],
                        '4h': [{ price: currentPrice, timestamp: now }],
                        '24h': [{ price: currentPrice, timestamp: now }],
                        '7d': [{ price: currentPrice, timestamp: now }],
                        '30d': [{ price: currentPrice, timestamp: now }],
                        '180d': [{ price: currentPrice, timestamp: now }]
                    },
                    changes: {
                        change_1h: 0,
                        change_4h: 0,
                        change_24h: 0,
                        change_7d: 0,
                        change_30d: 0,
                        change_180d: 0
                    },
                    stats: {
                        high_24h: currentPrice,
                        low_24h: currentPrice,
                        volume: 0
                    }
                };
                this.priceHistory.prices[symbol] = existingData;
            } else {
                // آپدیت داده موجود
                const previousPrice = existingData.price;

                // محاسبه تغییرات
                if (previousPrice && previousPrice > 0) {
                    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
                    existingData.changes.change_1h = priceChange;
                    existingData.changes.change_24h = priceChange;
                }

                // آپدیت قیمت
                existingData.price = currentPrice;
                existingData.timestamp = now;

                // آپدیت آمار
                if (currentPrice > existingData.stats.high_24h) {
                    existingData.stats.high_24h = currentPrice;
                }
                if (currentPrice < existingData.stats.low_24h) {
                    existingData.stats.low_24h = currentPrice;
                }
            }

            // اضافه کردن به تاریخچه
            this.addToHistory(symbol, '1h', { price: currentPrice, timestamp: now });
            this.addToHistory(symbol, '4h', { price: currentPrice, timestamp: now });
            this.addToHistory(symbol, '24h', { price: currentPrice, timestamp: now });

            return true;
        } catch (error) {
            console.error('❌ Error in addPrice', error);
            return false;
        }
    }

    addToHistory(symbol, timeframe, dataPoint) {
        const coinData = this.priceHistory.prices[symbol];
        if (!coinData || !coinData.history[timeframe]) return;

        // اضافه کردن نقطه داده جدید
        coinData.history[timeframe].push(dataPoint);

        // مرتب کردن بر اساس timestamp
        coinData.history[timeframe].sort((a, b) => a.timestamp - b.timestamp);

        // محدود کردن سایز تاریخچه
        const maxRecords = this.getMaxRecordsForTimeframe(timeframe);
        if (coinData.history[timeframe].length > maxRecords) {
            coinData.history[timeframe] = coinData.history[timeframe].slice(-maxRecords);
        }
    }

    getMaxRecordsForTimeframe(timeframe) {
        const limits = {
            '1h': 60,    // 60 دقیقه
            '4h': 48,    // 48 * 5 دقیقه
            '24h': 96,   // 96 * 15 دقیقه
            '7d': 168,   // 168 ساعت
            '30d': 180,  // 180 * 4 ساعت
            '180d': 180  // 180 روز
        };
        return limits[timeframe] || 100;
    }

    getPriceData(symbol, timeframe = null) {
        if (!this.priceHistory.prices || !this.priceHistory.prices[symbol]) {
            return null;
        }

        const data = this.priceHistory.prices[symbol];
        if (timeframe) {
            return {
                symbol: data.symbol,
                current_price: data.price,
                timestamp: data.timestamp,
                changes: data.changes,
                stats: data.stats,
                history: data.history[timeframe] || []
            };
        }
        return data;
    }

    getAllData() {
        return this.priceHistory;
    }

    getAvailableTimeframes() {
        return ['1h', '4h', '24h', '7d', '30d', '180d'];
    }

    getStatus() {
        return {
            active: !!this.gistId,
            total_coins: Object.keys(this.priceHistory.prices || {}).length,
            last_updated: this.priceHistory.last_updated,
            has_data: Object.keys(this.priceHistory.prices || {}).length > 0
        };
    }
}

module.exports = GistManager;
