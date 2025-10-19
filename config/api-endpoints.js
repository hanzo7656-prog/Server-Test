require('dotenv').config();

module.exports = {
    // API Configuration
    COINSTATS_API: {
        BASE_URL: "https://openapiv1.coinstats.app",
        API_KEY: "40QRC4gdyzWIGwsvGkqWtcDOf0bk+FV217KmLxQ/Wmw=",
        ENDPOINTS: {
            COINS: "/coins",
            COIN_DETAIL: "/coins/{id}",
            COIN_CHARTS: "/coins/{id}/charts",
            COINS_CHARTS: "/coins/charts",
            MARKETS: "/markets",
            CURRENCIES: "/currencies",
            NEWS: "/news",
            NEWS_SOURCES: "/news/sources",
            NEWS_DETAIL: "/news/{id}",
            NEWS_BY_TYPE: "/news/type/{type}",
            FEAR_GREED: "/insights/fear-and-greed",
            FEAR_GREED_CHART: "/insights/fear-and-greed/chart",
            BTC_DOMINANCE: "/insights/btc-dominance",
            RAINBOW_CHART: "/insights/rainbow-chart/{coin}",
            TICKER_EXCHANGES: "/tickers/exchanges",
            TICKER_MARKETS: "/tickers/markets",
            AVG_PRICE: "/coins/price/avg",
            EXCHANGE_PRICE: "/coins/price/exchange"
        }
    },

    // Internal API Endpoints
    INTERNAL_API: {
        BASE_PATH: "/api",
        ENDPOINTS: {
            // Scan endpoints
            SCAN: "/scan",
            SCAN_ADVANCED: "/scan/advanced",
            SCAN_BASIC: "/scan/basic",
            SCAN_AI_SIGNAL: "/scan/ai-signal",
            
            // Analysis endpoints
            TECHNICAL_ANALYSIS: "/analysis/technical",
            COIN_HISTORY: "/coin/{symbol}/history/{timeframe}",
            COIN_DETAILS: "/coins/{id}/details",
            AVG_PRICE: "/analysis/average-price",
            MULTI_CHART: "/analysis/multi-chart",
            
            // News endpoints
            NEWS: "/news",
            NEWS_TRENDING: "/news/trending",
            NEWS_HANDPICKED: "/news/handpicked",
            NEWS_LATEST: "/news/latest",
            NEWS_BULLISH: "/news/bullish",
            NEWS_BEARISH: "/news/bearish",
            NEWS_SOURCES: "/news/sources",
            NEWS_DETAIL: "/news/detail/{id}",
            
            // Insights endpoints
            BTC_DOMINANCE: "/insights/btc-dominance",
            FEAR_GREED: "/insights/fear-greed",
            FEAR_GREED_CHART: "/insights/fear-greed-chart",
            RAINBOW_CHART: "/insights/rainbow-chart",
            GLOBAL_DATA: "/insights/global-data",
            CURRENCIES: "/insights/currencies",
            DASHBOARD: "/insights/dashboard",
            
            // Market endpoints
            MARKETS_SUMMARY: "/markets/summary",
            MARKETS_EXCHANGES: "/markets/exchanges",
            MARKETS_TICKERS: "/markets/tickers",
            MARKETS_EXCHANGE_PRICE: "/markets/exchange-price",
            MARKETS_EXCHANGE_TICKERS: "/markets/exchange-tickers",
            MARKETS_CAP: "/markets/cap",
            
            // Health endpoints
            HEALTH: "/health",
            HEALTH_COMBINED: "/health/combined",
            HEALTH_API_STATUS: "/health/api-status",
            
            // System endpoints
            SYSTEM_STATS: "/system/stats",
            WEBSOCKET_STATUS: "/websocket/status",
            
            // Settings endpoints
            SETTINGS_TIMEFRAMES: "/settings/timeframes",
            SETTINGS_TEST_ENDPOINTS: "/settings/test-endpoints",
            SETTINGS_DEBUG: "/settings/debug",
            
            // Dashboard endpoints
            DASHBOARD_NEWS: "/dashboard/news",
            DASHBOARD_TOP_GAINERS: "/dashboard/top-gainers"
        }
    },

    // WebSocket Configuration
    WEBSOCKET: {
        PROVIDER: "LBank",
        URL: "wss://www.lbkex.net/ws/V2/",
        RECONNECT_INTERVAL: 5000,
        MAX_RECONNECT_ATTEMPTS: 10
    },

    // Server Configuration
    SERVER: {
        URL: "https://server-test-ovta.onrender.com",
        PORT: process.env.PORT || 3000,
        ENVIRONMENT: process.env.NODE_ENV || 'development'
    },

    // Trading Pairs (first 20 for example)
    TRADING_PAIRS: [
        "btc_usdt", "eth_usdt", "xrp_usdt", "ada_usdt", "dot_usdt", 
        "doge_usdt", "sol_usdt", "matic_usdt", "avax_usdt", "link_usdt",
        "bch_usdt", "ltc_usdt", "etc_usdt", "trx_usdt", "atom_usdt",
        "bnb_usdt", "xlm_usdt", "eos_usdt", "xtz_usdt", "algo_usdt"
    ],

    // Timeframes
    TIMEFRAMES: ["1h", "4h", "24h", "7d", "30d", "180d"],

    // Default Values
    DEFAULTS: {
        LIMIT: 100,
        MAX_LIMIT: 300,
        CURRENCY: 'USD',
        TIMEFRAME: '24h'
    }
};
