const { DEFAULTS } = require('../config/api-endpoints');

/**
* Format large numbers to readable format
*/
function formatNumber(num) {
    if (!num || isNaN(num)) return 'N/A';

    const absNum = Math.abs(num);

    if (absNum >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (absNum >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (absNum >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (absNum >= 1e3) return (num / 1e3).toFixed(2) + 'K';

    return num.toString();
}

/**
* Format price based on value
*/
function formatPrice(price) {
    if (!price || isNaN(price)) return 'N/A';

    const absPrice = Math.abs(price);

    if (absPrice < 0.000001) return '$' + price.toFixed(8);
    if (absPrice < 0.001) return '$' + price.toFixed(6);
    if (absPrice < 0.01) return '$' + price.toFixed(4);
    if (absPrice < 1) return '$' + price.toFixed(3);
    if (absPrice < 10) return '$' + price.toFixed(2);
    if (absPrice < 1000) return '$' + price.toFixed(2);

    return '$' + Math.round(price).toLocaleString();
}

/**
* Format percentage changes
*/
function formatPercentage(percent) {
    if (!percent || isNaN(percent)) return 'N/A';

    const symbol = percent >= 0 ? '+' : '';
    return symbol + percent.toFixed(2) + '%';
}

/**
* Format date to Persian locale
*/
function formatDate(dateString) {
    if (!dateString) return 'تاریخ نامشخص';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'تاریخ نامشخص';
    }
}

/**
* Format relative time
*/
function formatRelativeTime(timestamp) {
    if (!timestamp) return 'زمان نامشخص';

    try {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'همین الان';
        if (diffMins < 60) return `${diffMins} دقیقه قبل`;
        if (diffHours < 24) return `${diffHours} ساعت قبل`;
        if (diffDays < 7) return `${diffDays} روز قبل`;

        return formatDate(timestamp);
    } catch {
        return 'زمان نامشخص';
    }
}

/**
* Get Fear & Greed status with emoji
*/
function getFearGreedStatus(value) {
    const numValue = Number(value);
    if (isNaN(numValue)) return { status: 'نامشخص', emoji: '❓', color: 'gray' };
    if (numValue >= 80) return { status: 'طمع شدید', emoji: '😊', color: 'green' };
    if (numValue >= 60) return { status: 'طمع', emoji: '😊', color: 'lightgreen' };
    if (numValue >= 40) return { status: 'خنثی', emoji: '😐', color: 'yellow' };
    if (numValue >= 20) return { status: 'ترس', emoji: '😟', color: 'orange' };
    return { status: 'ترس شدید', emoji: '😨', color: 'red' };
}

/**
* Get BTC Dominance status
*/
function getDominanceStatus(value) {
    const numValue = Number(value);
    if (isNaN(numValue)) return 'نامشخص';
    if (numValue >= 60) return 'قوی بیتکوین';
    if (numValue >= 45) return 'متوازن';
    return 'ضعیف بیتکوین';
}

/**
* Format memory usage
*/
function formatMemory(bytes) {
    if (!bytes || isNaN(bytes)) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return mb.toFixed(2) + ' MB';
}

/**
* Format uptime
*/
function formatUptime(seconds) {
    if (!seconds || isNaN(seconds)) return 'N/A';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days} روز و ${hours} ساعت`;
    if (hours > 0) return `${hours} ساعت ${minutes} دقیقه`;
    return `${minutes} دقیقه`;
}

module.exports = {
    formatNumber,
    formatPrice,
    formatPercentage,
    formatDate,
    formatRelativeTime,
    getFearGreedStatus,
    getDominanceStatus,
    formatMemory,
    formatUptime
};
