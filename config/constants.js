// config/constants.js
module.exports = {
    // سرور
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // API
    API_RATE_LIMIT_DELAY: 1000,
    CACHE_TIMEOUT: 5 * 60 * 1000, // 5 دقیقه
    REQUEST_TIMEOUT: 15000,
    
    // صرافی‌ها
    EXCHANGES: ['Binance', 'Coinbase', 'Kraken', 'OKX', 'KuCoin', 'Gate.io', 'MEXC', 'Bybit'],
    
    // کوین‌های اصلی برای تحلیل
    MAJOR_COINS: ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOT', 'AVAX', 'MATIC'],
    
    // بازه‌های زمانی تحلیل
    TIMEFRAMES: {
        '1h': 3600,
        '4h': 14400,
        '24h': 86400, 
        '7d': 604800,
        '30d': 2592000,
        '90d': 7776000,
        '1y': 31536000
    },
    
    // تنظیمات فیلتر سلامت
    HEALTH_FILTER: {
        MIN_VOLUME: 100000, // 100K دلار
        MIN_MARKET_CAP: 1000000, // 1M دلار
        MIN_HEALTH_SCORE: 40
    },
    
    // تنظیمات WebSocket
    WS_RECONNECT_DELAY: 5000,
    WS_HEARTBEAT_INTERVAL: 30000
};
