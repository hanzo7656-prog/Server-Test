// models/HealthFilter.js
const { HEALTH_FILTER } = require('../config/constants');

/**
 * فیلتر سلامت برای سنجش کیفیت کوین‌ها
 */
function coinStatsHealthCheck(coin) {
    const health = {
        is_healthy: false,
        tier: 'unknown',
        reasons: [],
        score: 0,
        warnings: [],
        passed_checks: 0,
        total_checks: 0
    };

    // افزایش شمارنده چک‌ها
    health.total_checks = 6;

    // ۱. فیلترهای سخت‌گیرانه (حذف از نمایش)
    if (!coin.volume || coin.volume < HEALTH_FILTER.MIN_VOLUME) {
        health.reasons.push('VOLUME_TOO_LOW');
        return health;
    }
    health.passed_checks++;

    if (!coin.marketCap || coin.marketCap < HEALTH_FILTER.MIN_MARKET_CAP) {
        health.reasons.push('MARKET_CAP_TOO_LOW');
        return health;
    }
    health.passed_checks++;

    if (coin.priceChange24h === null || coin.priceChange24h === undefined) {
        health.reasons.push('NO_TRADING_ACTIVITY');
        return health;
    }
    health.passed_checks++;

    // ۲. امتیازدهی برای سطوح مختلف
    let score = 0;

    // حجم (۰-۳۵ امتیاز)
    if (coin.volume > 100000000) score += 35;      // > $100M
    else if (coin.volume > 10000000) score += 25;  // > $10M  
    else if (coin.volume > 1000000) score += 20;   // > $1M
    else if (coin.volume > 100000) score += 15;    // > $100K
    health.passed_checks++;

    // مارکت‌کپ (۰-۳۰ امتیاز)
    if (coin.marketCap > 10000000000) score += 30;   // > $10B
    else if (coin.marketCap > 1000000000) score += 25;  // > $1B
    else if (coin.marketCap > 100000000) score += 20;   // > $100M
    else if (coin.marketCap > 10000000) score += 15;    // > $10M
    else if (coin.marketCap > 1000000) score += 10;     // > $1M
    health.passed_checks++;

    // رتبه (۰-۲۰ امتیاز)
    if (coin.rank <= 10) score += 20;
    else if (coin.rank <= 50) score += 18;
    else if (coin.rank <= 100) score += 15;
    else if (coin.rank <= 200) score += 12;
    else if (coin.rank <= 300) score += 10;
    else if (coin.rank <= 500) score += 8;
    health.passed_checks++;

    // فعالیت قیمت (۰-۱۵ امتیاز)
    if (Math.abs(coin.priceChange24h) > 10) score += 15;
    else if (Math.abs(coin.priceChange24h) > 5) score += 12;
    else if (Math.abs(coin.priceChange24h) > 2) score += 10;
    else if (Math.abs(coin.priceChange24h) > 0) score += 8;
    health.passed_checks++;

    health.score = score;
    health.is_healthy = score >= HEALTH_FILTER.MIN_HEALTH_SCORE;

    // تعیین سطح
    if (score >= 80) health.tier = 'premium';
    else if (score >= 65) health.tier = 'excellent';
    else if (score >= 50) health.tier = 'good';
    else if (score >= 40) health.tier = 'basic';
    else health.tier = 'risky';

    // هشدارها
    if (coin.rank > 500) health.warnings.push('LOW_RANK');
    if (coin.volume < 1000000) health.warnings.push('LOW_VOLUME');
    if (Math.abs(coin.priceChange24h) > 20) health.warnings.push('HIGH_VOLATILITY');
    if (!coin.priceChange1h && !coin.priceChange24h && !coin.priceChange7d) {
        health.warnings.push('INACTIVE_MARKET');
    }

    return health;
}

/**
 * فیلتر گروهی کوین‌ها
 */
function filterCoinsByHealth(coins) {
    const results = {
        healthy: [],
        unhealthy: [],
        stats: {
            total: coins.length,
            healthy_count: 0,
            unhealthy_count: 0,
            average_score: 0,
            tier_distribution: {
                premium: 0,
                excellent: 0,
                good: 0,
                basic: 0,
                risky: 0
            }
        }
    };

    coins.forEach(coin => {
        const health = coinStatsHealthCheck(coin);
        const coinWithHealth = { ...coin, health_status: health };

        if (health.is_healthy) {
            results.healthy.push(coinWithHealth);
            results.stats.healthy_count++;
            results.stats.tier_distribution[health.tier]++;
        } else {
            results.unhealthy.push(coinWithHealth);
            results.stats.unhealthy_count++;
        }

        results.stats.average_score += health.score;
    });

// محاسبه میانگین
    if (coins.length > 0) {
        results.stats.average_score = parseFloat((results.stats.average_score / coins.length).toFixed(2));
    }

    // مرتب‌سازی کوین‌های سالم بر اساس امتیاز
    results.healthy.sort((a, b) => b.health_status.score - a.health_status.score);

    return results;
}

/**
 * تولید گزارش سلامت
 */
function generateHealthReport(coins) {
    const filtered = filterCoinsByHealth(coins);
    
    return {
        summary: {
            total_coins: filtered.stats.total,
            healthy_coins: filtered.stats.healthy_count,
            health_ratio: parseFloat((filtered.stats.healthy_count / filtered.stats.total * 100).toFixed(1)),
            average_health_score: filtered.stats.average_score,
            quality_rating: getQualityRating(filtered.stats.health_ratio)
        },
        tier_breakdown: filtered.stats.tier_distribution,
        top_healthy: filtered.healthy.slice(0, 5).map(coin => ({
            symbol: coin.symbol,
            score: coin.health_status.score,
            tier: coin.health_status.tier,
            reasons: coin.health_status.reasons
        })),
        common_rejections: getCommonRejectionReasons(filtered.unhealthy),
        timestamp: new Date().toISOString()
    };
}

/**
 * دریافت رتبه کیفیت
 */
function getQualityRating(healthRatio) {
    if (healthRatio >= 80) return 'EXCELLENT';
    if (healthRatio >= 60) return 'GOOD';
    if (healthRatio >= 40) return 'FAIR';
    if (healthRatio >= 20) return 'POOR';
    return 'VERY_POOR';
}

/**
 * دریافت دلایل رایج رد شدن
 */
function getCommonRejectionReasons(unhealthyCoins) {
    const reasons = {};
    
    unhealthyCoins.forEach(coin => {
        coin.health_status.reasons.forEach(reason => {
            reasons[reason] = (reasons[reason] || 0) + 1;
        });
    });

    return Object.entries(reasons)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([reason, count]) => ({ reason, count }));
}

module.exports = {
    coinStatsHealthCheck,
    filterCoinsByHealth,
    generateHealthReport
};
