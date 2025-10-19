const { generateNavigationHTML } = require('./navigation-generator');

/**
* Generate complete HTML page with consistent styling and navigation
*/
function generateModernPage(title, content, currentPage = 'home') {
    return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - VortexAI</title>
    <style>
        /* Reset and Base Styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Tahoma, sans-serif;
            background: linear-gradient(135deg, #0f0f1a, #1a1a2e);
            color: white;
            min-height: 100vh;
            padding-bottom: 120px; /* Space for navigation */
            line-height: 1.6;
        }

        /* Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .title {
            font-size: 2.5rem;
            background: linear-gradient(135deg, #667eea, #f115f9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        /* Content Grid */
        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        /* Cards */
        .content-card {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            transition: all 0.3s ease;
        }

        .content-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(102,126,234,0.3);
        }

        /* Card Header */
        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .card-icon {
            font-size: 20px;
            margin-left: 10px;
        }

        /* Status Indicators */
        .status-indicator {
            display: inline-block;
            padding: 8px 15px;
            background: rgba(16,185,129,0.2);
            border: 1px solid rgba(16,185,129,0.4);
            border-radius: 20px;
            color: #10b981;
            font-size: 0.8rem;
            margin: 5px 0;
        }

        .status-indicator.error {
            background: rgba(239,68,68,0.2);
            border-color: rgba(239,68,68,0.4);
            color: #ef4444;
        }

        .status-indicator.warning {
            background: rgba(245,158,11,0.2);
            border-color: rgba(245,158,11,0.4);
            color: #f59e0b;
        }

        /* Buttons */
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none;
            border-radius: 8px;
            color: white;
            text-decoration: none;
            margin: 5px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102,126,234,0.4);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        /* Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 0.8rem;
        }

        .data-table th, .data-table td {
            padding: 8px 10px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            text-align: right;
        }

        .data-table th {
            color: #667eea;
            font-weight: 600;
        }

        /* Tabs */
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            flex-wrap: wrap;
        }

        .tab {
            padding: 10px 20px;
            background: none;
            border: none;
            color: rgba(255,255,255,0.6);
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.3s ease;
        }

        .tab.active {
            color: #667eea;
            border-bottom-color: #667eea;
            background: rgba(102,126,234,0.1);
        }

        .tab-content { display: none; }
        .tab-content.active { display: block; }

        /* Code Blocks */
        .code-block {
            background: rgba(0,0,0,0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
            font-size: 0.8rem;
            max-height: 400px;
            overflow-y: auto;
            white-space: pre-wrap;
            border: 1px solid rgba(255,255,255,0.1);
        }

        /* Log Entries */
        .log-entry {
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 6px;
            border-right: 3px solid #667eea;
            background: rgba(255,255,255,0.05);
            font-family: monospace;
            font-size: 0.8rem;
        }

        .log-entry.error {
            border-right-color: #ef4444;
            background: rgba(239,68,68,0.1);
        }

        .log-entry.success {
            border-right-color: #10b981;
            background: rgba(16,185,129,0.1);
        }

        .log-entry.warning {
            border-right-color: #f59e0b;
            background: rgba(245,158,11,0.1);
        }

        /* Metrics Grid */
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin: 15px 0;
        }

        .metric-card {
            background: rgba(255,255,255,0.03);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.05);
        }

        .metric-value {
            font-size: 1.4rem;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea, #f115f9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 5px;
        }

        .metric-label {
            font-size: 0.7rem;
            color: rgba(255,255,255,0.6);
        }

        /* News Grid */
        .news-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }

        .news-item {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s ease;
        }

        .news-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 20px rgba(102,126,234,0.2);
        }

        .news-image {
            height: 160px;
            background: rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .news-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        .news-item:hover .news-image img {
            transform: scale(1.05);
        }

        .no-image {
            font-size: 2rem;
            opacity: 0.5;
        }

        .news-content {
            padding: 15px;
        }

        .news-content h4 {
            margin-bottom: 8px;
            font-size: 1rem;
            line-height: 1.4;
        }

        .news-content p {
            font-size: 0.8rem;
            opacity: 0.8;
            margin-bottom: 10px;
            line-height: 1.5;
        }

        .news-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.7rem;
            opacity: 0.6;
            margin-bottom: 10px;
        }

        .news-link {
            color: #667eea;
            text-decoration: none;
            font-size: 0.8rem;
            display: inline-block;
            margin-top: 5px;
        }

        .news-link:hover {
            text-decoration: underline;
        }

        /* Market Lists */
        .market-list, .gainers-list {
            margin-top: 15px;
        }

        .market-item, .gainer-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: rgba(255,255,255,0.03);
            border-radius: 8px;
            margin-bottom: 8px;
            border: 1px solid rgba(255,255,255,0.05);
            transition: all 0.2s ease;
        }

        .market-item:hover, .gainer-item:hover {
            background: rgba(255,255,255,0.06);
            border-color: rgba(102,126,234,0.3);
        }

        .coin-info, .gainer-info {
            flex: 1;
        }

        .coin-symbol, .gainer-symbol {
            font-size: 0.7rem;
            opacity: 0.6;
            display: block;
            margin-top: 2px;
        }

        .coin-change, .gainer-change {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
            min-width: 60px;
            text-align: center;
        }

        .positive {
            background: rgba(16,185,129,0.2);
            color: #10b981;
        }

        .negative {
            background: rgba(239,68,68,0.2);
            color: #ef4444;
        }

        .gainer-rank {
            margin-left: 10px;
            font-size: 1rem;
            min-width: 30px;
        }

        .gainer-item {
            background: rgba(16,185,129,0.1);
            border-color: rgba(16,185,129,0.2);
        }

        /* Forms and Inputs */
        .input-field {
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.1);
            color: white;
            margin: 5px;
            font-family: Tahoma, sans-serif;
            font-size: 0.9rem;
            width: 200px;
            transition: all 0.3s ease;
        }

        .input-field:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 2px rgba(102,126,234,0.2);
        }

        .input-field::placeholder {
            color: rgba(255,255,255,0.5);
        }

        /* Loading States */
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }

        .loading::after {
            content: '...';
            animation: loading 1.5s infinite;
        }

        @keyframes loading {
            0%, 33% { content: '.'; }
            34%, 66% { content: '..'; }
            67%, 100% { content: '...'; }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .content-grid { grid-template-columns: 1fr; }
            .title { font-size: 2rem; }
            .tabs { flex-direction: column; }
            .tab { text-align: right; }
            .news-grid { grid-template-columns: 1fr; }
            .metric-grid { grid-template-columns: repeat(2, 1fr); }
            .input-field { width: 100%; margin: 5px 0; }
            .container { padding: 15px; }
        }

        @media (max-width: 480px) {
            .title { font-size: 1.7rem; }
            .content-card { padding: 15px; }
            .metric-grid { grid-template-columns: 1fr; }
            .market-item, .gainer-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            .coin-change, .gainer-change { align-self: flex-end; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">VortexAI</h1>
            <p>${title}</p>
        </div>
        ${content}
    </div>

    ${generateNavigationHTML(currentPage)}

    <script>
        // Tab Management
        function openTab(evt, tabName) {
            const tabcontent = document.getElementsByClassName('tab-content');
            for (let i = 0; i < tabcontent.length; i++) {
                tabcontent[i].classList.remove("active");
            }

            const tablinks = document.getElementsByClassName('tab');
            for (let i = 0; i < tablinks.length; i++) {
                tablinks[i].classList.remove("active");
            }

            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
        }

        // Utility Functions
        function formatNumber(num) {
            if (!num || isNaN(num)) return 'N/A';
            if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
            if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
            if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
            if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
            return num.toString();
        }

        function formatPrice(price) {
            if (!price || isNaN(price)) return 'N/A';
            if (price < 1) return '$' + price.toFixed(4);
            if (price < 10) return '$' + price.toFixed(3);
            if (price < 1000) return '$' + price.toFixed(2);
            return '$' + price.toFixed(0);
        }

        function formatDate(dateString) {
            if (!dateString) return 'تاریخ نامشخص';
            try {
                return new Date(dateString).toLocaleDateString('fa-IR');
            } catch {
                return 'تاریخ نامشخص';
            }
        }

        function getFearGreedStatus(value) {
            const numValue = Number(value);
            if (isNaN(numValue)) return 'نامشخص';
            if (numValue >= 80) return 'طمع شدید';
            if (numValue >= 60) return 'طمع';
            if (numValue >= 40) return 'خنثی';
            if (numValue >= 20) return 'ترس';
            return 'ترس شدید';
        }

        function getDominanceStatus(value) {
            const numValue = Number(value);
            if (isNaN(numValue)) return 'نامشخص';
            if (numValue >= 60) return 'قوی بیتکوین';
            if (numValue >= 45) return 'متوازن';
            return 'ضعیف بیتکوین';
        }

        // Safe value extraction
        function getSafeValue(obj, path, defaultValue = 'N/A') {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
        }

        // Error handling
        function handleApiError(error, elementId) {
            console.error('API Error', error);
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = \`
                    <div class="status-indicator error">
                        خطا در ارتباط: \${error.message || 'خطای ناشناخته'}
                    </div>
                \`;
            }
        }

        // Loading states
        function setLoading(elementId, isLoading = true) {
            const element = document.getElementById(elementId);
            if (element) {
                if (isLoading) {
                    element.classList.add('loading');
                } else {
                    element.classList.remove('loading');
                }
            }
        }

        // Auto-activate first tab on load
        document.addEventListener('DOMContentLoaded', function() {
            const firstTab = document.querySelector('.tab');
            if (firstTab) firstTab.click();

            // Add any page-specific initialization here
            if (typeof initPage === 'function') {
                initPage();
            }
        });
    </script>
</body>
</html>`;
}

module.exports = { generateModernPage };
