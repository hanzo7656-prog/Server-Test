// فایل جدید: utils/helpers.js
class Helpers {
    static formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toString();
    }

    static getCoinIcon(symbol) {
        const iconMap = {
            'BTC': '₿', 'ETH': 'Ξ', 'BNB': '⎈', 'SOL': '◎', 
            'XRP': '✕', 'ADA': 'A', 'DOT': '●', 'DOGE': 'Ð',
            'MATIC': '⬡', 'LTC': 'Ł', 'BCH': 'Ƀ', 'LINK': '🔗',
            'AVAX': '🅰', 'XLM': '✶', 'ATOM': '⚛', 'UNI': '🦄',
            'AAVE': '👻', 'SUSHI': '🍣', 'CAKE': '🍰', 'COMP': '🏦'
        };
        return iconMap[symbol] || '₿';
    }

    static getTimeframeIntervals(timeframe) {
        const intervals = {
            '1h': '1-minute intervals',
            '4h': '5-minute intervals', 
            '24h': '15-minute intervals',
            '7d': '1-hour intervals',
            '30d': '4-hour intervals',
            '180d': '1-day intervals'
        };
        return intervals[timeframe] || 'Unknown';
    }

    static getChangeColor(change) {
        return change >= 0 ? '#27ae60' : '#e74c3c';
    }

    static getSentimentColor(sentiment) {
        const colors = {
            'bullish': '#27ae60',
            'very bullish': '#2ecc71', 
            'bearish': '#e74c3c',
            'very bearish': '#c0392b',
            'neutral': '#f39c12'
        };
        return colors[sentiment] || '#95a5a6';
    }
}

module.exports = Helpers;
