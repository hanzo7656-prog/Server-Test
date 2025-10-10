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
                },
                // اضافه کردن فیلدهای تغییرات
                changes: {
                    change_1h: 0,
                    change_4h: 0, 
                    change_24h: 0,
                    change_7d: 0,
                    change_30d: 0,
                    change_180d: 0
                }
            };
            this.priceHistory.prices[symbol] = existingData;
        }

        // 🆕 محاسبه تغییرات قیمت
        const previousPrice = existingData.price;
        if (previousPrice && previousPrice > 0) {
            const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
            
            // آپدیت تغییرات (اینجا باید منطق بهتری برای timeframeها داشته باشی)
            existingData.changes.change_1h = priceChange;
            existingData.changes.change_24h = priceChange;
            // TODO: محاسبه تغییرات واقعی بر اساس timeframe
        }

        // آپدیت قیمت و timestamp
        existingData.price = currentPrice;
        existingData.timestamp = now;

        // 🆕 اضافه کردن به تاریخچه (مثال ساده)
        this.addToHistory(symbol, '1h', { price: currentPrice, timestamp: now });

        return true;
    } catch (error) {
        console.error('Error in addPrice', error);
        return false;
    }
}

// 🆕 تابع جدید برای اضافه کردن به تاریخچه
addToHistory(symbol, timeframe, dataPoint) {
    const coinData = this.priceHistory.prices[symbol];
    if (!coinData || !coinData.history[timeframe]) return;

    coinData.history[timeframe].push(dataPoint);
    
    // محدود کردن سایز تاریخچه
    const maxRecords = constants.TIMEFRAMES[timeframe]?.maxRecords || 100;
    if (coinData.history[timeframe].length > maxRecords) {
        coinData.history[timeframe] = coinData.history[timeframe].slice(-maxRecords);
    }
}
