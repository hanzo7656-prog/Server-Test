const { DEFAULTS, TRADING_PAIRS, TIMEFRAMES } = require('../config/api-endpoints');

/**
* Validate cryptocurrency symbol
*/
function isValidSymbol(symbol) {
    if (!symbol || typeof symbol !== 'string') return false;

    // Basic symbol validation
    const symbolRegex = /^[a-zA-Z0-9_-]+$/;
    if (!symbolRegex.test(symbol)) return false;

    // Check if it's a known trading pair (optional)
    const normalizedSymbol = symbol.toLowerCase().replace('/', '_');
    return TRADING_PAIRS.includes(normalizedSymbol) || symbol.length <= 20;
}

/**
* Validate limit parameter
*/
function isValidLimit(limit) {
    const num = Number(limit);
    return !isNaN(num) && num >= 1 && num <= DEFAULTS.MAX_LIMIT;
}

/**
* Validate timeframe parameter
*/
function isValidTimeframe(timeframe) {
    return TIMEFRAMES.includes(timeframe);
}

/**
* Validate API response structure
*/
function isValidResponse(data) {
    if (!data || typeof data !== 'object') return false;

    // Check for common API response structures
    if (data.success !== undefined) return data.success === true;
    if (data.status !== undefined) return data.status === 'success' || data.status === 'ok';
    if (data.error !== undefined) return false;

    // If no success/status field, assume valid if data exists
    return Object.keys(data).length > 0;
}

/**
* Safely get nested object value
*/
function getSafeValue(obj, path, defaultValue = 'N/A') {
    if (!obj || typeof obj !== 'object') return defaultValue;

    return path.split('.').reduce((acc, part) => {
        if (acc && acc[part] !== undefined && acc[part] !== null) {
            return acc[part];
        }
        return defaultValue;
    }, obj);
}

/**
* Validate coin data structure
*/
function isValidCoinData(coin) {
    if (!coin || typeof coin !== 'object') return false;

    const requiredFields = ['id', 'symbol', 'name'];
    return requiredFields.every(field => 
        coin[field] !== undefined && coin[field] !== null
    );
}

/**
* Validate news data structure
*/
function isValidNewsData(news) {
    if (!news || typeof news !== 'object') return false;
    return news.title !== undefined && news.source !== undefined;
}

/**
* Validate health data structure
*/
function isValidHealthData(health) {
    if (!health || typeof health !== 'object') return false;
    return health.status !== undefined && health.timestamp !== undefined;
}

/**
* Sanitize user input
*/
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .trim()
        .substring(0, 100); // Limit length
}

/**
* Validate currency code
*/
function isValidCurrency(currency) {
    if (!currency || typeof currency !== 'string') return false;
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'IRR'];
    return validCurrencies.includes(currency.toUpperCase());
}

module.exports = {
    isValidSymbol,
    isValidLimit,
    isValidTimeframe,
    isValidResponse,
    getSafeValue,
    isValidCoinData,
    isValidNewsData,
    isValidHealthData,
    sanitizeInput,
    isValidCurrency
};
