const express = require('express');
const router = express.Router();

// سیستم دیباگ پیشرفته
const debugSystem = {
    enabled: true,
    logs: [],
    performance: {},
    apiStats: {
        totalRequests: 0,
        failedRequests: 0,
        lastResponse: null
    },
    
    log: function(level, message, data = null) {
        if (!this.enabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            data: data,
            memory: process.memoryUsage(),
            stack: level === 'ERROR' ? new Error().stack : null
        };
        
        this.logs.push(logEntry);
        
        if (this.logs.length > 100) {
            this.logs.shift();
        }
        
        console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    },
    
    analyzeServer: function() {
        this.log('INFO', 'Starting comprehensive server analysis...');
        
        const analysis = {
            timestamp: new Date().toISOString(),
            systemHealth: this.checkSystemHealth(),
            apiHealth: this.checkAPIHealth(),
            dataFlow: this.checkDataFlow(),
            performance: this.checkPerformance(),
            issues: this.detectIssues(),
            recommendations: this.generateRecommendations(),
            warnings: this.detectWarnings()
        };
        
        this.log('INFO', 'Server analysis completed', analysis);
        return analysis;
    },
    
    checkSystemHealth: function() {
        return {
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
                external: Math.round(process.memoryUsage().external / 1024 / 1024) + 'MB'
            },
            uptime: Math.round(process.uptime()) + 's',
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
        };
    },
    
    checkAPIHealth: function() {
        return {
            totalRequests: this.apiStats.totalRequests,
            failedRequests: this.apiStats.failedRequests,
            successRate: this.apiStats.totalRequests > 0 ? 
                ((this.apiStats.totalRequests - this.apiStats.failedRequests) / this.apiStats.totalRequests * 100).toFixed(2) + '%' : '0%',
            lastResponse: this.apiStats.lastResponse,
            averageResponseTime: this.calculateAverageResponseTime()
        };
    },
    
    calculateAverageResponseTime: function() {
        const recentRequests = this.logs.filter(log => 
            log.message.includes('ms') && log.data && log.data.duration
        );
        if (recentRequests.length === 0) return 'N/A';
        
        const totalTime = recentRequests.reduce((sum, log) => sum + (log.data.duration || 0), 0);
        return (totalTime / recentRequests.length).toFixed(2) + 'ms';
    },
    
    checkDataFlow: function() {
        const recentLogs = this.logs.slice(-20);
        const dataFlowIssues = [];
        const dataFlowWarnings = [];
        
        recentLogs.forEach(log => {
            if (log.message.includes('priceChange24h') && log.data === 0) {
                dataFlowWarnings.push('Zero price changes detected');
            }
            if (log.message.includes('error') || log.message.includes('failed')) {
                dataFlowIssues.push(`Error in: ${log.message}`);
            }
            if (log.message.includes('timeout') || log.message.includes('abort')) {
                dataFlowIssues.push(`Timeout in: ${log.message}`);
            }
        });
        
        return {
            issues: dataFlowIssues.length > 0 ? dataFlowIssues : ['No data flow issues detected'],
            warnings: dataFlowWarnings,
            recentActivity: recentLogs.length,
            apiCalls: recentLogs.filter(log => log.message.includes('API')).length
        };
    },
    
    checkPerformance: function() {
        const perfLogs = this.logs.filter(log => 
            log.level === 'PERF' || log.message.includes('ms') || log.message.includes('performance')
        );
        
        const slowRequests = perfLogs.filter(log => 
            log.data && log.data.duration && log.data.duration > 5000
        );
        
        return {
            recentPerformanceIssues: perfLogs.slice(-5),
            slowRequests: slowRequests.length,
            averageResponseTime: this.calculateAverageResponseTime(),
            memoryLeaks: this.checkMemoryLeaks()
        };
    },
    
    checkMemoryLeaks: function() {
        if (this.logs.length < 10) return 'Insufficient data';
        
        const recentMemory = this.logs.slice(-10).map(log => 
            parseInt(log.memory.heapUsed / 1024 / 1024)
        );
        
        const memoryIncrease = recentMemory[recentMemory.length - 1] - recentMemory[0];
        return memoryIncrease > 50 ? 'Potential memory leak detected' : 'Stable';
    },
    
    detectIssues: function() {
        const issues = [];
        
        const errorLogs = this.logs.filter(log => log.level === 'ERROR');
        if (errorLogs.length > 0) {
            issues.push(`Found ${errorLogs.length} errors in recent logs`);
        }
        
        const zeroPriceLogs = this.logs.filter(log => 
            log.message.includes('priceChange24h') && log.data === 0
        );
        if (zeroPriceLogs.length > 5) {
            issues.push('Multiple zero price changes detected - API field mapping issue');
        }
        
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        if (memoryUsage > 500) {
            issues.push(`High memory usage: ${memoryUsage.toFixed(2)}MB`);
        }
        
        const timeoutLogs = this.logs.filter(log => 
            log.message.includes('timeout') || log.message.includes('abort')
        );
        if (timeoutLogs.length > 3) {
            issues.push('Multiple timeout issues detected');
        }
        
        return issues.length > 0 ? issues : ['No critical issues detected'];
    },
    
    detectWarnings: function() {
        const warnings = [];
        
        const recentLogs = this.logs.slice(-15);
        const apiFailures = recentLogs.filter(log => 
            log.message.includes('API') && (log.level === 'ERROR' || log.message.includes('failed'))
        );
        
        if (apiFailures.length > 2) {
            warnings.push('Multiple API failures in recent requests');
        }
        
        const memoryTrend = this.checkMemoryTrend();
        if (memoryTrend === 'increasing') {
            warnings.push('Memory usage shows increasing trend');
        }
        
        return warnings;
    },
    
    checkMemoryTrend: function() {
        if (this.logs.length < 5) return 'stable';
        
        const memoryReadings = this.logs.slice(-5).map(log => 
            parseInt(log.memory.heapUsed / 1024 / 1024)
        );
        
        const trend = memoryReadings[memoryReadings.length - 1] - memoryReadings[0];
        return trend > 10 ? 'increasing' : trend < -10 ? 'decreasing' : 'stable';
    },
    
    generateRecommendations: function() {
        const recommendations = [];
        const issues = this.detectIssues();
        const warnings = this.detectWarnings();
        
        if (issues.some(issue => issue.includes('zero price'))) {
            recommendations.push('Check API field mapping for price change fields');
            recommendations.push('Verify CoinStats API response structure');
            recommendations.push('Enable detailed API response logging');
            recommendations.push('Implement fallback price change calculation');
        }
        
        if (issues.some(issue => issue.includes('memory'))) {
            recommendations.push('Consider implementing memory cleanup routines');
            recommendations.push('Reduce log retention period');
            recommendations.push('Monitor for memory leaks in long-running processes');
        }
        
        if (this.apiStats.failedRequests > this.apiStats.totalRequests * 0.1) {
            recommendations.push('Check API key validity and rate limits');
            recommendations.push('Implement retry mechanism for failed requests');
            recommendations.push('Add circuit breaker pattern for API calls');
        }
        
        if (warnings.some(warning => warning.includes('API failures'))) {
            recommendations.push('Review API endpoint reliability');
            recommendations.push('Consider adding backup data sources');
            recommendations.push('Implement exponential backoff for retries');
        }
        
        return recommendations.length > 0 ? recommendations : ['System running optimally'];
    },
    
    getDetailedReport: function() {
        return {
            timestamp: new Date().toISOString(),
            analysis: this.analyzeServer(),
            recentLogs: this.logs.slice(-10),
            systemInfo: this.checkSystemHealth(),
            performanceMetrics: this.checkPerformance()
        };
    }
};

// تابع تولید صفحه مدرن
function generateModernPage(title, bodyContent, currentPage = 'home') {
    const baseStyles = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
        min-height: 100vh;
        color: #e2e8f0;
        line-height: 1.6;
        padding-bottom: 120px;
        position: relative;
        overflow-x: hidden;
    }
    
    body::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
            radial-gradient(circle at 20% 80%, rgba(120,119,198,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,119,198,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120,219,255,0.05) 0%, transparent 50%);
        pointer-events: none;
        z-index: -1;
        animation: backgroundShift 20s ease-in-out infinite;
    }
    
    @keyframes backgroundShift {
        0%,100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.1) rotate(180deg); }
    }
    
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        animation: fadeInUp 0.8s ease-out;
    }
    
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .glass-card {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 25px;
        margin-bottom: 20px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    }
    
    .glass-card:hover {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    }
    
    header {
        text-align: center;
        margin-bottom: 30px;
        padding: 40px 20px;
        position: relative;
    }
    
    .header::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #a855f7, #f093fb);
        border-radius: 2px;
    }
    
    .header h1 {
        font-size: 2.5rem;
        background: linear-gradient(135deg, #667eea, #a855f7, #f093fb);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 15px;
        font-weight: 700;
        text-shadow: 0 4px 20px rgba(102,126,234,0.3);
    }
    
    .header p {
        color: #94a3b8;
        font-size: 1.1rem;
        max-width: 600px;
        margin: 0 auto;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
    }
    
    @media (max-width: 768px) {
        .stats-grid { grid-template-columns: 1fr; }
    }
    
    .stat-card {
        background: rgba(255,255,255,0.05);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        border: 1px solid rgba(255,255,255,0.05);
    }
    
    .stat-card:hover {
        transform: translateY(-5px);
        background: rgba(255,255,255,0.08);
        box-shadow: 0 8px 30px rgba(0,0,0,0.25);
    }
    
    .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: #f115f9;
        margin-bottom: 8px;
        text-shadow: 0 2px 10px rgba(241,21,249,0.3);
    }
    
    .stat-label {
        font-size: 0.8rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .btn {
        background: linear-gradient(135deg, #667eea, #a855f7);
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        text-align: center;
        transition: all 0.3s ease;
    }
    
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102,126,234,0.4);
    }
    
    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        background: rgba(255,255,255,0.05);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    
    .data-table th, .data-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .data-table th {
        color: #f115f9;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.8rem;
        background: rgba(255,255,255,0.05);
    }
    
    .data-table tr:hover {
        background: rgba(255,255,255,0.05);
    }
    
    .debug-panel {
        background: rgba(255,0,0,0.1);
        border: 1px solid rgba(255,0,0,0.3);
        border-radius: 10px;
        padding: 15px;
        margin: 10px 0;
        font-family: monospace;
        font-size: 0.8rem;
        max-height: 200px;
        overflow-y: auto;
    }
    
    .debug-info {
        background: rgba(0,255,0,0.1);
        border: 1px solid rgba(0,255,0,0.3);
        border-radius: 10px;
        padding: 10px;
        margin: 5px 0;
        font-size: 0.75rem;
    }

    .test-results {
        background: rgba(255,255,255,0.05);
        border-radius: 10px;
        padding: 15px;
        margin: 10px 0;
        max-height: 300px;
        overflow-y: auto;
    }

    .success-item {
        color: #10b981;
        padding: 5px;
        border-left: 3px solid #10b981;
        margin: 5px 0;
    }

    .error-item {
        color: #ef4444;
        padding: 5px;
        border-left: 3px solid #ef4444;
        margin: 5px 0;
    }

    .warning-item {
        color: #f59e0b;
        padding: 5px;
        border-left: 3px solid #f59e0b;
        margin: 5px 0;
    }
    `;

    return `<!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - VortexAI</title>
        <style>${baseStyles}</style>
    </head>
    <body>
        <div class="container">
            ${bodyContent}
        </div>
        ${generateClassNavigation(currentPage)}
    </body>
    </html>`;
}

// Generate navigation function
function generateClassNavigation(currentPage = 'home') {
    return `
    <!-- هوشمند ناوبری شیشه‌ای -->
    <div id="glassNav" class="glass-navigation">
        <!-- دکمه شناور مایع -->
        <div class="nav-floater">
            <div class="liquid-button">
                <div class="nav-dot"></div>
                <div class="nav-dot"></div>
                <div class="nav-dot"></div>
            </div>
        </div>

        <div class="nav-container" style="display: none;">  
            <div class="nav-scroll" id="navScroll">
                <div class="nav-item ${currentPage == 'home' ? 'active' : ''}" data-page="/" data-external="false">  
                    <div class="nav-icon animated-gradient">🏠</div>  
                    <div class="nav-text">DASH</div>  
                </div>

                <div class="nav-item ${currentPage == 'scan' ? 'active' : ''}" data-page="/scan-page" data-external="false">  
                    <div class="nav-icon animated-gradient">🔍</div>  
                    <div class="nav-text">SCAN</div>  
                </div>

                <div class="nav-item ${currentPage == 'analyze' ? 'active' : ''}" data-page="/analysis-page" data-external="false">  
                    <div class="nav-icon animated-gradient">📊</div>  
                    <div class="nav-text">ANALYZE</div>  
                </div>

                <div class="nav-item ${currentPage == 'ai' ? 'active' : ''}" data-page="https://ai-test-2nxq.onrender.com/" data-external="true">
                    <div class="nav-icon animated-gradient">🤖</div>
                    <div class="nav-text">AI</div>
                </div>

                <div class="nav-item ${currentPage === 'market' ? 'active' : ''}" data-page="/markets-page" data-external="false">
                    <div class="nav-icon animated-gradient">📈</div>
                    <div class="nav-text">MARKET</div>
                </div>

                <div class="nav-item ${currentPage === 'insights' ? 'active' : ''}" data-page="/insights-page" data-external="false">
                    <div class="nav-icon animated-gradient">💡</div>
                    <div class="nav-text">INSIGHTS</div>
                </div>

                <div class="nav-item ${currentPage === 'news' ? 'active' : ''}" data-page="/news-page" data-external="false">
                    <div class="nav-icon animated-gradient">📰</div>
                    <div class="nav-text">NEWS</div>
                </div>

                <div class="nav-item ${currentPage === 'health' ? 'active' : ''}" data-page="/health-page" data-external="false">
                    <div class="nav-icon animated-gradient">❤️</div>
                    <div class="nav-text">HEALTH</div>
                </div>

                <div class="nav-item ${currentPage === 'settings' ? 'active' : ''}" data-page="/settings" data-external="false">
                    <div class="nav-icon animated-gradient">⚙️</div>
                    <div class="nav-text">SETTINGS</div>
                </div>
            </div>
        </div>
    </div>

    <style>
        .glass-navigation {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .nav-floater {
            width: 65px;
            height: 65px;
            background: linear-gradient(135deg, rgba(102,126,234,0.9), rgba(118,75,162,0.9));
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 15px 35px rgba(102,126,234,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.4s ease;
            position: relative;
            overflow: hidden;
        }

        .nav-floater:hover {
            transform: scale(1.1);
            box-shadow: 0 20px 45px rgba(102,126,234,0.7), inset 0 1px 0 rgba(255,255,255,0.3);
        }

        .liquid-button {
            position: relative;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
        }

        .nav-dot {
            width: 5px;
            height: 5px;
            background: rgba(255,255,255,0.9);
            border-radius: 50%;
            animation: dotPulse 2s infinite ease-in-out;
            box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }

        .nav-dot:nth-child(1) { animation-delay: 0s; }
        .nav-dot:nth-child(2) { animation-delay: 0.3s; }
        .nav-dot:nth-child(3) { animation-delay: 0.6s; }

        @keyframes dotPulse {
            0%,100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.3); opacity: 1; }
        }

        .nav-container {
            background: rgba(30,35,50,0.95);
            backdrop-filter: blur(30px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 25px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
            max-width: 400px;
        }

        .nav-scroll {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, auto);
            gap: 12px;
            width: 100%;
            max-height: 250px;
            overflow-y: auto;
            scroll-behavior: smooth;
            scrollbar-width: none;
        }

        .nav-scroll::-webkit-scrollbar { display: none; }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px 8px;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: rgba(255,255,255,0.08);
            border: 1px solid transparent;
            position: relative;
            overflow: hidden;
            min-height: 70px;
        }

        .nav-item:hover {
            background: rgba(255,255,255,0.15);
            transform: translateY(-2px);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .nav-item.active {
            background: linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3));
            border: 1px solid rgba(102,126,234,0.4);
            box-shadow: 0 8px 25px rgba(102,126,234,0.3);
        }

        .animated-gradient {
            background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
            background-size: 200% 200%;
            animation: gradientShift 3s ease infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .nav-text {
            font-size: 0.7rem;
            font-weight: 700;
            color: #f115f9;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3);
            background: linear-gradient(135deg, #f115f9, #cbd5e1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .nav-item:hover .nav-text {
            background: linear-gradient(135deg, #ffffff, #e2e8f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-item.active .nav-text {
            background: linear-gradient(135deg, #667eea, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .glass-navigation.expanded .nav-container {
            display: block !important;
            animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 400px) {
            .nav-container { max-width: 320px; padding: 15px; }
            .nav-scroll { gap: 10px; }
            .nav-item { padding: 10px 6px; min-height: 60px; }
            .nav-text { font-size: 0.65rem; }
            .nav-floater { width: 60px; height: 60px; }
        }
    </style>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // کلیک روی دکمه شناور
            document.querySelector('.nav-floater').addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const container = document.querySelector('.nav-container');
                const nav = document.getElementById('glassNav');
                
                if (container.style.display == 'block') {
                    container.style.display = 'none';
                    nav.classList.remove('expanded');
                } else {
                    container.style.display = 'block';
                    nav.classList.add('expanded');
                }
            });

            // کلیک روی آیتم‌های navigation
            document.querySelector('.nav-container').addEventListener('click', function(e) {
                const navItem = e.target.closest('.nav-item');
                if (navItem) {
                    e.preventDefault();
                    e.stopPropagation();
                    const page = navItem.getAttribute('data-page');
                    const isExternal = navItem.getAttribute('data-external') === 'true';

                    // بستن منو
                    document.querySelector('.nav-container').style.display = 'none';
                    document.getElementById('glassNav').classList.remove('expanded');

                    // هدایت
                    if (isExternal) {
                        window.open(page, '_blank');
                    } else {
                        window.location.href = page;
                    }
                }
            });

            // کلیک خارج منو برای بستن
            document.addEventListener('click', function(e) {
                const nav = document.getElementById('glassNav');
                const container = document.querySelector('.nav-container');
                if (!nav.contains(e.target) && container.style.display === 'block') {
                    container.style.display = 'none';
                    nav.classList.remove('expanded');
                }
            });
        });
    </script>
    `;
}

// Routes
module.exports = (dependencies) => {
    const { gistManager, wsManager, apiClient } = dependencies;
    
    // Route اصلی - بدون دیباگ
    router.get("/", async (req, res) => {
        try {
            debugSystem.log('INFO', 'Dashboard page requested');
            
            const bodyContent = `
                <div class="header">
                    <h1>VortexAI Crypto Dashboard</h1>
                    <p>برای تحلیل بازارهای کریپتو با داده‌های زنده و بینش هوشمند</p>
                </div>
                
                <div class="glass-card">
                    <h2 style="color: #f115f9; text-align: center;">سیستم فعال شده</h2>
                    <p style="text-align: center;">از ناوبری پایین صفحه استفاده کنید</p>
                </div>
                
                <div class="glass-card">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${debugSystem.apiStats.totalRequests}</div>
                            <div class="stat-label">درخواست‌های API</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">9</div>
                            <div class="stat-label">صفحات فعال</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${Math.round(process.uptime() / 60)}</div>
                            <div class="stat-label">دقیقه فعالیت</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">34</div>
                            <div class="stat-label">اندپوینت‌ها</div>
                        </div>
                    </div>
                </div>
                
                <div class="glass-card">
                    <h2 style="color: #f115f9; text-align: center; margin-bottom: 20px;">دسترسی سریع</h2>
                    <div class="stats-grid">
                        <div class="stat-card" onclick="window.location.href='/scan-page'" style="cursor: pointer;">
                            <div class="stat-number">🔍</div>
                            <div class="stat-label">اسکن بازار</div>
                        </div>
                        <div class="stat-card" onclick="window.location.href='/markets-page'" style="cursor: pointer;">
                            <div class="stat-number">📈</div>
                            <div class="stat-label">بازار سرمایه</div>
                        </div>
                        <div class="stat-card" onclick="window.location.href='/insights-page'" style="cursor: pointer;">
                            <div class="stat-number">💡</div>
                            <div class="stat-label">بینش‌ها</div>
                        </div>
                        <div class="stat-card" onclick="window.location.href='/settings'" style="cursor: pointer;">
                            <div class="stat-number">⚙️</div>
                            <div class="stat-label">تنظیمات</div>
                        </div>
                    </div>
                </div>
            `;

            res.send(generateModernPage("داشبورد", bodyContent, 'home'));
        } catch (error) {
            debugSystem.log('ERROR', 'Dashboard error', error.message);
            res.status(500).send('خطا: ' + error.message);
        }
    });

    // ========== صفحه اسکن (Scan) - نمایش کامل 300 ارز ==========
    router.get("/scan-page", async (req, res) => {
        try {
            const scanData = await apiClient.getCoins(300);
            const coins = scanData.coins || [];
            
            const zeroChangeCoins = coins.filter(c => c.priceChange24h === 0);
            debugSystem.log('SCAN', `اسکن ${coins.length} ارز`, {
                totalCoins: coins.length,
                zeroChangeCount: zeroChangeCoins.length,
                sampleProblems: zeroChangeCoins.slice(0, 3).map(c => ({
                    symbol: c.symbol,
                    price: c.price,
                    changeField: c.priceChangeFieldUsed
                }))
            });

            let tableRows = '';
            coins.forEach(coin => {
                const changeValue = coin.priceChange24h || 0;
                const changeColor = changeValue > 0 ? '#10b981' : changeValue < 0 ? '#ef4444' : '#94a3b8';
                const changeIcon = changeValue > 0 ? '📈' : changeValue < 0 ? '📉' : '➡️';
                const displayChange = changeValue !== 0 ? `${changeValue.toFixed(2)}%` : '0%';
                
                tableRows += `
                    <tr onclick="window.location.href='/coins/${coin.id}/details'" style="cursor: pointer;">
                        <td><strong>${coin.symbol}</strong></td>
                        <td>${coin.name || 'N/A'}</td>
                        <td>${coin.price ? '$' + coin.price.toFixed(2) : 'N/A'}</td>
                        <td style="color: ${changeColor}">
                            ${changeIcon} ${displayChange}
                        </td>
                        <td>${coin.volume ? '$' + (coin.volume / 1000000).toFixed(2) + 'M' : 'N/A'}</td>
                    </tr>
                `;
            });

            const bodyContent = `
                <div class="header">
                    <h1>🔍 اسکن بازار کریپتو</h1>
                    <p>بررسی لحظه‌ای ${coins.length} ارز از 300 ارز برتر بازار - داده‌های زنده از CoinStats</p>
                </div>
                
                <div class="glass-card">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${coins.length}/300</div>
                            <div class="stat-label">ارزهای اسکن شده</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${coins.filter(c => (c.priceChange24h || 0) > 0).length}</div>
                            <div class="stat-label">صعودی</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${coins.filter(c => (c.priceChange24h || 0) < 0).length}</div>
                            <div class="stat-label">نزولی</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${coins.filter(c => (c.priceChange24h || 0) === 0).length}</div>
                            <div class="stat-label">بدون تغییر</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; margin-bottom: 20px;">📊 همه ${coins.length} ارز</h2>
                    <div style="margin-bottom: 15px; color: #94a3b8; font-size: 0.9rem;">
                        💡 برای مشاهده جزئیات هر ارز، روی آن کلیک کنید | 🔍 از Ctrl+F برای جستجو استفاده کنید
                    </div>
                    <div style="max-height: 600px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;">
                        <table class="data-table" style="margin: 0;">
                            <thead style="position: sticky; top: 0; background: rgba(30,35,50,0.95);">
                                <tr>
                                    <th>نماد</th>
                                    <th>نام</th>
                                    <th>قیمت (USD)</th>
                                    <th>تغییر 24h</th>
                                    <th>حجم معاملات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                    <div style="text-align: center; margin-top: 15px; color: #94a3b8; font-size: 0.8rem;">
                        نمایش ${coins.length} ارز از 300 ارز برتر بازار
                    </div>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; margin-bottom: 15px;">⚡ فیلترهای سریع</h2>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                        <button class="btn" onclick="filterTable('up')">📈 صعودی‌ها (${coins.filter(c => (c.priceChange24h || 0) > 0).length})</button>
                        <button class="btn" onclick="filterTable('down')">📉 نزولی‌ها (${coins.filter(c => (c.priceChange24h || 0) < 0).length})</button>
                        <button class="btn" onclick="filterTable('high-volume')">💎 حجم بالا</button>
                        <button class="btn" onclick="filterTable('all')">🔄 همه (${coins.length})</button>
                    </div>
                </div>

                <script>
                    function filterTable(type) {
                        const rows = document.querySelectorAll('.data-table tbody tr');
                        let visibleCount = 0;
                        
                        rows.forEach(row => {
                            const changeText = row.cells[3].textContent;
                            const volumeText = row.cells[4].textContent;
                            
                            let show = true;
                            switch(type) {
                                case 'up':
                                    show = changeText.includes('📈');
                                    break;
                                case 'down':
                                    show = changeText.includes('📉');
                                    break;
                                case 'high-volume':
                                    show = volumeText.includes('M') && parseFloat(volumeText) > 100;
                                    break;
                                case 'all':
                                    show = true;
                                    break;
                            }
                            
                            row.style.display = show ? '' : 'none';
                            if (show) visibleCount++;
                        });
                        
                        // آپدیت عنوان
                        const title = document.querySelector('.glass-card h2');
                        if (title) {
                            if (type === 'all') {
                                title.textContent = \`📊 همه \${visibleCount} ارز\`;
                            } else if (type === 'up') {
                                title.textContent = \`📈 \${visibleCount} ارز صعودی\`;
                            } else if (type === 'down') {
                                title.textContent = \`📉 \${visibleCount} ارز نزولی\`;
                            } else if (type === 'high-volume') {
                                title.textContent = \`💎 \${visibleCount} ارز با حجم بالا\`;
                            }
                        }
                    }

                    // جستجوی real-time
                    document.addEventListener('keydown', function(e) {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                            e.preventDefault();
                            const searchTerm = prompt('جستجوی ارز (نماد یا نام):');
                            if (searchTerm) {
                                const rows = document.querySelectorAll('.data-table tbody tr');
                                rows.forEach(row => {
                                    const symbol = row.cells[0].textContent.toLowerCase();
                                    const name = row.cells[1].textContent.toLowerCase();
                                    const search = searchTerm.toLowerCase();
                                    row.style.display = symbol.includes(search) || name.includes(search) ? '' : 'none';
                                });
                            }
                        }
                    });
                </script>
            `;

            res.send(generateModernPage("اسکن بازار", bodyContent, 'scan'));
        } catch (error) {
            debugSystem.log('ERROR', 'خطا در صفحه اسکن', error.message);
            const errorBody = `
                <div class="header">
                    <h1>❌ خطا در بارگذاری داده‌ها</h1>
                    <p>سیستم قادر به دریافت اطلاعات بازار نیست</p>
                </div>
                <div class="glass-card">
                    <div style="text-align: center; color: #ef4444;">
                        <h3>خطا: ${error.message}</h3>
                        <p>لطفاً اتصال اینترنت و تنظیمات API را بررسی کنید</p>
                        <a href="/settings" class="btn" style="background: #ef4444;">بررسی تنظیمات</a>
                    </div>
                </div>
            `;
            res.send(generateModernPage("خطا - اسکن بازار", errorBody, 'scan'));
        }
    });

    // ========== صفحه تحلیل (Analyze) ==========
    router.get("/analysis-page", async (req, res) => {
        try {
            const { symbol = 'bitcoin' } = req.query;
            
            const analysisData = await fetch(`${req.protocol}://${req.get('host')}/analysis?symbol=${symbol}&type=technical`).then(r => r.json());
            
            debugSystem.log('ANALYSIS', `تحلیل ${symbol}`, {
                success: analysisData.success,
                price: analysisData.current_price,
                indicators: analysisData.technical_indicators ? Object.keys(analysisData.technical_indicators).length : 0
            });

            const bodyContent = `
                <div class="header">
                    <h1>📊 تحلیل تکنیکال</h1>
                    <p>تحلیل پیشرفته با اندیکاتورهای حرفه‌ای - داده‌های زنده</p>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; margin-bottom: 15px;">جستجوی نماد</h2>
                    <form action="/analysis-page" method="GET" style="display: flex; gap: 10px;">
                        <input type="text" name="symbol" value="${symbol}" placeholder="bitcoin, ethereum, solana..." 
                               style="flex: 1; padding: 12px; border: 1px solid rgba(255,255,255,0.2); 
                                      background: rgba(255,255,255,0.1); border-radius: 10px; color: white;">
                        <button type="submit" class="btn">تحلیل</button>
                    </form>
                </div>

                ${analysisData.success ? `
                    <div class="glass-card">
                        <h2 style="color: #f115f9; margin-bottom: 20px;">📈 تحلیل ${symbol.toUpperCase()}</h2>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-number">$${analysisData.current_price?.toFixed(2) || 'N/A'}</div>
                                <div class="stat-label">قیمت فعلی</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${analysisData.data_points || 0}</div>
                                <div class="stat-label">نقاط داده</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${analysisData.technical_indicators ? Object.keys(analysisData.technical_indicators).length : 0}</div>
                                <div class="stat-label">اندیکاتورها</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${analysisData.support_resistance ? analysisData.support_resistance.levels?.length || 0 : 0}</div>
                                <div class="stat-label">سطح حمایت/مقاومت</div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card">
                        <h3 style="color: #f115f9; margin-bottom: 15px;">🎯 اندیکاتورهای تکنیکال</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            ${analysisData.technical_indicators ? Object.entries(analysisData.technical_indicators).map(([key, value]) => `
                                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; text-align: center;">
                                    <div style="font-size: 0.8rem; color: #94a3b8;">${key}</div>
                                    <div style="font-weight: bold; color: #f115f9; margin-top: 5px;">${typeof value === 'number' ? value.toFixed(4) : value}</div>
                                </div>
                            `).join('') : '<div>داده‌ای موجود نیست</div>'}
                        </div>
                    </div>

                    ${analysisData.support_resistance ? `
                        <div class="glass-card">
                            <h3 style="color: #f115f9; margin-bottom: 15px;">🛡️ سطوح حمایت و مقاومت</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <h4 style="color: #10b981;">حمایت</h4>
                                    ${analysisData.support_resistance.support && analysisData.support_resistance.support.length > 0 ? 
                                        analysisData.support_resistance.support.slice(0, 5).map(level => `
                                            <div style="background: rgba(16,185,129,0.1); padding: 10px; margin: 5px 0; border-radius: 8px; border-left: 3px solid #10b981;">
                                                $${level.toFixed(2)}
                                            </div>
                                        `).join('') : '<div>سطوح حمایت یافت نشد</div>'
                                    }
                                </div>
                                <div>
                                    <h4 style="color: #ef4444;">مقاومت</h4>
                                    ${analysisData.support_resistance.resistance && analysisData.support_resistance.resistance.length > 0 ? 
                                        analysisData.support_resistance.resistance.slice(0, 5).map(level => `
                                            <div style="background: rgba(239,68,68,0.1); padding: 10px; margin: 5px 0; border-radius: 8px; border-left: 3px solid #ef4444;">
                                                $${level.toFixed(2)}
                                            </div>
                                        `).join('') : '<div>سطوح مقاومت یافت نشد</div>'
                                    }
                                </div>
                            </div>
                        </div>
                    ` : ''}
                ` : `
                    <div class="glass-card">
                        <div style="text-align: center; color: #ef4444;">
                            <h3>❌ داده‌ای برای تحلیل یافت نشد</h3>
                            <p>نماد "${symbol}" پیدا نشد یا داده‌ای ندارد</p>
                        </div>
                    </div>
                `}

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">🚀 تحلیل ارزهای محبوب</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                        <a href="/analysis-page?symbol=bitcoin" class="btn">بیت‌کوین</a>
                        <a href="/analysis-page?symbol=ethereum" class="btn">اتریوم</a>
                        <a href="/analysis-page?symbol=solana" class="btn">سولانا</a>
                        <a href="/analysis-page?symbol=cardano" class="btn">کاردانو</a>
                        <a href="/analysis-page?symbol=polkadot" class="btn">پولکادات</a>
                    </div>
                </div>
            `;

            res.send(generateModernPage("تحلیل تکنیکال", bodyContent, 'analyze'));
        } catch (error) {
            debugSystem.log('ERROR', 'خطا در صفحه تحلیل', error.message);
            res.status(500).send(generateModernPage("خطا", `
                <div class="header">
                    <h1>❌ خطا در تحلیل</h1>
                    <p>${error.message}</p>
                </div>
            `, 'analyze'));
        }
    });

    // ========== صفحه بازار (Market) ==========
    router.get("/markets-page", async (req, res) => {
        try {
            const [marketData, currencies, tickers] = await Promise.all([
                fetch(`${req.protocol}://${req.get('host')}/markets/cap`).then(r => r.json()),
                fetch(`${req.protocol}://${req.get('host')}/currencies`).then(r => r.json()),
                fetch(`${req.protocol}://${req.get('host')}/exchange/tickers?exchange=binance`).then(r => r.json())
            ]);

            debugSystem.log('MARKET', 'داده‌های بازار', {
                marketCap: marketData.data?.marketCap,
                currencies: currencies.data?.length,
                tickers: tickers.data?.length
            });

            const bodyContent = `
                <div class="header">
                    <h1>📈 بازار سرمایه کریپتو</h1>
                    <p>بررسی جامع بازارهای ارز دیجیتال و صرافی‌ها</p>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; margin-bottom: 20px;">📊 نمای کلی بازار</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">$${(marketData.data?.marketCap / 1000000000).toFixed(1)}B</div>
                            <div class="stat-label">مارکت کپ کل</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">$${(marketData.data?.volume / 1000000000).toFixed(1)}B</div>
                            <div class="stat-label">حجم 24h</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${marketData.data?.activeCryptocurrencies || 0}</div>
                            <div class="stat-label">ارز فعال</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${currencies.data?.length || 0}</div>
                            <div class="stat-label">جفت ارز</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">💱 جفت ارزهای فعال</h3>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>جفت ارز</th>
                                    <th>نوع</th>
                                    <th>وضعیت</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${currencies.data ? currencies.data.slice(0, 50).map(currency => `
                                    <tr>
                                        <td><strong>${currency.symbol || 'N/A'}</strong></td>
                                        <td>${currency.type || 'N/A'}</td>
                                        <td><span style="color: #10b981;">● فعال</span></td>
                                    </tr>
                                `).join('') : '<tr><td colspan="3">داده‌ای موجود نیست</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">🏦 تیکرهای صرافی Binance</h3>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>نماد</th>
                                    <th>قیمت</th>
                                    <th>حجم</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tickers.data ? tickers.data.slice(0, 50).map(ticker => `
                                    <tr>
                                        <td><strong>${ticker.symbol || 'N/A'}</strong></td>
                                        <td>${ticker.price ? '$' + ticker.price.toFixed(4) : 'N/A'}</td>
                                        <td>${ticker.volume ? '$' + (ticker.volume / 1000).toFixed(1) + 'K' : 'N/A'}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="3">داده‌ای موجود نیست</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            res.send(generateModernPage("بازار سرمایه", bodyContent, 'market'));
        } catch (error) {
            debugSystem.log('ERROR', 'خطا در صفحه بازار', error.message);
            res.status(500).send(generateModernPage("خطا", `
                <div class="header">
                    <h1>❌ خطا در بازار</h1>
                    <p>${error.message}</p>
                </div>
            `, 'market'));
        }
    });

    // ========== صفحه بینش‌ها (Insights) ==========
    router.get("/insights-page", async (req, res) => {
        try {
            const [dashboard, btcDominance, fearGreed] = await Promise.all([
                fetch(`${req.protocol}://${req.get('host')}/insights/dashboard`).then(r => r.json()),
                fetch(`${req.protocol}://${req.get('host')}/insights/btc-dominance`).then(r => r.json()),
                fetch(`${req.protocol}://${req.get('host')}/insights/fear-greed`).then(r => r.json())
            ]);

            const fearGreedValue = fearGreed.data?.now?.value || 50;
            const fearGreedLabel = fearGreed.data?.now?.value_classification || 'Neutral';
            
            let fearGreedColor = '#94a3b8';
            let fearGreedEmoji = '➡️';
            if (fearGreedValue >= 70) { fearGreedColor = '#ef4444'; fearGreedEmoji = '😰'; }
            else if (fearGreedValue >= 55) { fearGreedColor = '#f59e0b'; fearGreedEmoji = '😐'; }
            else if (fearGreedValue >= 45) { fearGreedColor = '#10b981'; fearGreedEmoji = '😊'; }
            else { fearGreedColor = '#3b82f6'; fearGreedEmoji = '😨'; }

            debugSystem.log('INSIGHTS', 'داده‌های بینش', {
                fearGreed: fearGreedValue,
                btcDominance: btcDominance.data?.value,
                dashboard: dashboard.success
            });

            const bodyContent = `
                <div class="header">
                    <h1>💡 بینش‌های بازار</h1>
                    <p>تحلیل احساسات و روندهای کلان بازار کریپتو</p>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; margin-bottom: 20px;">📊 نمای کلی بینش‌ها</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number" style="color: ${fearGreedColor}">${fearGreedValue}</div>
                            <div class="stat-label">شاخص ترس و طمع</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${btcDominance.data?.value ? btcDominance.data.value.toFixed(1) + '%' : 'N/A'}</div>
                            <div class="stat-label">تسلط بیت‌کوین</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${fearGreedEmoji}</div>
                            <div class="stat-label">احساسات بازار</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${fearGreedLabel}</div>
                            <div class="stat-label">وضعیت فعلی</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">📈 شاخص ترس و طمع</h3>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 10px;">${fearGreedEmoji}</div>
                        <div style="font-size: 2rem; color: ${fearGreedColor}; margin-bottom: 10px;">${fearGreedValue}</div>
                        <div style="color: ${fearGreedColor}; font-size: 1.2rem; margin-bottom: 15px;">${fearGreedLabel}</div>
                        
                        <div style="background: rgba(255,255,255,0.1); height: 20px; border-radius: 10px; margin: 20px 0; position: relative;">
                            <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${fearGreedValue}%; 
                                      background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #3b82f6); border-radius: 10px;">
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; color: #94a3b8; font-size: 0.8rem;">
                            <span>ترس شدید</span>
                            <span>ترس</span>
                            <span>خنثی</span>
                            <span>طمع</span>
                            <span>طمع شدید</span>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">₿ تسلط بیت‌کوین</h3>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 10px;">${btcDominance.data?.value ? btcDominance.data.value.toFixed(1) + '%' : 'N/A'}</div>
                        <div style="color: #f59e0b; margin-bottom: 15px;">سهم بیت‌کوین از کل بازار</div>
                        
                        <div style="background: rgba(255,255,255,0.1); height: 20px; border-radius: 10px; margin: 20px 0; position: relative;">
                            <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${btcDominance.data?.value || 0}%; 
                                      background: linear-gradient(90deg, #f59e0b, #f97316); border-radius: 10px;">
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; color: #94a3b8; font-size: 0.8rem;">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">🔍 بینش‌های بیشتر</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                        <a href="/insights/fear-greed-chart" class="btn">نمودار ترس و طمع</a>
                        <a href="/insights/rainbow-chart" class="btn">نمودار رنگین کمان</a>
                        <a href="/api-data" class="btn">وضعیت API</a>
                    </div>
                </div>
            `;

            res.send(generateModernPage("بینش‌های بازار", bodyContent, 'insights'));
        } catch (error) {
            debugSystem.log('ERROR', 'خطا در صفحه بینش', error.message);
            res.status(500).send(generateModernPage("خطا", `
                <div class="header">
                    <h1>❌ خطا در بینش‌ها</h1>
                    <p>${error.message}</p>
                </div>
            `, 'insights'));
        }
    });

    // ========== صفحه اخبار (News) ==========
    router.get("/news-page", async (req, res) => {
        try {
            const [news, sources] = await Promise.all([
                fetch(`${req.protocol}://${req.get('host')}/news?limit=20`).then(r => r.json()),
                fetch(`${req.protocol}://${req.get('host')}/news/sources`).then(r => r.json())
            ]);

            debugSystem.log('NEWS', 'اخبار دریافت شد', {
                articles: news.data?.result?.length,
                sources: sources.data?.length
            });

            const bodyContent = `
                <div class="header">
                    <h1>📰 اخبار کریپتو</h1>
                    <p>آخرین اخبار و تحولات بازار ارزهای دیجیتال</p>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; margin-bottom: 20px;">📢 آخرین اخبار</h2>
                    <div style="display: grid; gap: 15px;">
                        ${news.data?.result ? news.data.result.slice(0, 10).map(article => `
                            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border-left: 3px solid #f115f9;">
                                <h3 style="color: white; margin-bottom: 8px;">${article.title || 'بدون عنوان'}</h3>
                                <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 10px;">${article.description || 'بدون توضیح'}</p>
                                <div style="display: flex; justify-content: space-between; color: #64748b; font-size: 0.8rem;">
                                    <span>${article.source || 'منبع نامشخص'}</span>
                                    <span>${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fa-IR') : 'تاریخ نامشخص'}</span>
                                </div>
                            </div>
                        `).join('') : '<div>اخبار یافت نشد</div>'}
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">📡 منابع خبری</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        ${sources.data ? sources.data.slice(0, 12).map(source => `
                            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; text-align: center;">
                                <div style="color: #f115f9; font-weight: bold;">${source.name || 'نامشخص'}</div>
                            </div>
                        `).join('') : '<div>منبع یافت نشد</div>'}
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">🎯 دسته‌بندی اخبار</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                        <a href="/news/type/trending" class="btn">🔥 ترندینگ</a>
                        <a href="/news/type/latest" class="btn">🆕 آخرین اخبار</a>
                        <a href="/news/type/bullish" class="btn">📈 صعودی</a>
                        <a href="/news/type/bearish" class="btn">📉 نزولی</a>
                        <a href="/news/type/handpicked" class="btn">⭐ منتخب</a>
                    </div>
                </div>
            `;

            res.send(generateModernPage("اخبار کریپتو", bodyContent, 'news'));
        } catch (error) {
            debugSystem.log('ERROR', 'خطا در صفحه اخبار', error.message);
            res.status(500).send(generateModernPage("خطا", `
                <div class="header">
                    <h1>❌ خطا در اخبار</h1>
                    <p>${error.message}</p>
                </div>
            `, 'news'));
        }
    });

    // ========== صفحه سلامت (Health) ==========
    router.get("/health-page", async (req, res) => {
        try {
            const [health, healthCombined] = await Promise.all([
                fetch(`${req.protocol}://${req.get('host')}/health`).then(r => r.json()),
                fetch(`${req.protocol}://${req.get('host')}/health-combined`).then(r => r.json())
            ]);

            const bodyContent = `
                <div class="header">
                    <h1>❤️ سلامت سیستم</h1>
                    <p>بررسی وضعیت کلی سرویس و کامپوننت‌های VortexAI</p>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; margin-bottom: 20px;">📊 وضعیت سیستم</h2>
                    <div class="stats-grid">
                        <div class="stat-card" style="border-left: 3px solid ${health.success ? '#10b981' : '#ef4444'}">
                            <div class="stat-number">${health.success ? '✅' : '❌'}</div>
                            <div class="stat-label">وضعیت کلی</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${health.components?.websocket?.active_coins || 0}</div>
                            <div class="stat-label">ارزهای فعال</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${Math.round(process.uptime() / 60)}</div>
                            <div class="stat-label">دقیقه فعالیت</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${health.stats?.memory_usage || 'N/A'}</div>
                            <div class="stat-label">مصرف حافظه</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">🔧 کامپوننت‌ها</h3>
                    <div style="display: grid; gap: 10px;">
                        <div style="display: flex; justify-content: between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                            <span>WebSocket Connection</span>
                            <span style="color: ${health.components?.websocket?.status === 'healthy' ? '#10b981' : '#ef4444'}">
                                ${health.components?.websocket?.status === 'healthy' ? '✅ متصل' : '❌ قطع'}
                            </span>
                        </div>
                        <div style="display: flex; justify-content: between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                            <span>Database</span>
                            <span style="color: ${health.components?.database?.status === 'healthy' ? '#10b981' : '#f59e0b'}">
                                ${health.components?.database?.status === 'healthy' ? '✅ فعال' : '⚠️ محدود'}
                            </span>
                        </div>
                        <div style="display: flex; justify-content: between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                            <span>API Service</span>
                            <span style="color: #10b981">✅ فعال</span>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">📈 آمار عملکرد</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; color: #f115f9;">${healthCombined.websocket_status?.active_coins || 0}</div>
                            <div style="color: #94a3b8; font-size: 0.8rem;">ارزهای فعال WebSocket</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; color: #f115f9;">${healthCombined.gist_status?.total_coins || 0}</div>
                            <div style="color: #94a3b8; font-size: 0.8rem;">ارزهای ذخیره شده</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; color: #f115f9;">${healthCombined.ai_status?.indicators_available || 0}</div>
                            <div style="color: #94a3b8; font-size: 0.8rem;">اندیکاتورهای AI</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; color: #f115f9;">${healthCombined.api_status?.requests_count || 0}</div>
                            <div style="color: #94a3b8; font-size: 0.8rem;">درخواست‌های API</div>
                        </div>
                    </div>
                </div>
            `;

            res.send(generateModernPage("سلامت سیستم", bodyContent, 'health'));
        } catch (error) {
            debugSystem.log('ERROR', 'خطا در صفحه سلامت', error.message);
            res.status(500).send(generateModernPage("خطا", `
                <div class="header">
                    <h1>❌ خطا در سلامت</h1>
                    <p>${error.message}</p>
                </div>
            `, 'health'));
        }
    });

    // ========== صفحه تنظیمات (Settings) ==========
    router.get("/settings", async (req, res) => {
        try {
            const [timeframes, apiData, testResults] = await Promise.all([
                fetch(`${req.protocol}://${req.get('host')}/timeframes-api`).then(r => r.json()),
                fetch(`${req.protocol}://${req.get('host')}/api-data`).then(r => r.json()),
                fetch(`${req.protocol}://${req.get('host')}/test-all-endpoints`).then(r => r.json())
            ]);

            // آنالیز سرور برای دیباگ
            const serverAnalysis = debugSystem.analyzeServer();

            const bodyContent = `
                <div class="header">
                    <h1>⚙️ تنظیمات سیستم</h1>
                    <p>مدیریت و مانیتورینگ کامل سرویس VortexAI</p>
                </div>

                <div class="glass-card">
                    <h2 style="color: #f115f9; margin-bottom: 20px;">🔧 سیستم دیباگ پیشرفته</h2>
                    
                    <h3 style="color: #f115f9; margin: 20px 0 10px 0;">📊 آنالیز سرور</h3>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                            <div>وضعیت سیستم: <strong style="color: #10b981">${serverAnalysis.systemHealth ? 'سالم' : 'مشکل'}</strong></div>
                            <div>مصرف حافظه: <strong>${serverAnalysis.systemHealth?.memory?.used || 'N/A'}</strong></div>
                            <div>مدت فعالیت: <strong>${serverAnalysis.systemHealth?.uptime || 'N/A'}</strong></div>
                            <div>نرخ موفقیت API: <strong>${serverAnalysis.apiHealth?.successRate || 'N/A'}</strong></div>
                        </div>
                    </div>

                    <h3 style="color: #f115f9; margin: 20px 0 10px 0;">⚠️ مشکلات شناسایی شده</h3>
                    <div style="background: rgba(239,68,68,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        ${serverAnalysis.issues.map(issue => `
                            <div style="color: #ef4444; margin: 5px 0;">❌ ${issue}</div>
                        `).join('')}
                    </div>

                    <h3 style="color: #f115f9; margin: 20px 0 10px 0;">💡 توصیه‌ها</h3>
                    <div style="background: rgba(59,130,246,0.1); padding: 15px; border-radius: 10px;">
                        ${serverAnalysis.recommendations.map(rec => `
                            <div style="color: #3b82f6; margin: 5px 0;">💡 ${rec}</div>
                        `).join('')}
                    </div>

                    ${serverAnalysis.warnings && serverAnalysis.warnings.length > 0 ? `
                        <h3 style="color: #f115f9; margin: 20px 0 10px 0;">⚠️ هشدارها</h3>
                        <div style="background: rgba(245,158,11,0.1); padding: 15px; border-radius: 10px;">
                            ${serverAnalysis.warnings.map(warning => `
                                <div style="color: #f59e0b; margin: 5px 0;">⚠️ ${warning}</div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">🕐 تایم‌فریم‌های available</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                        ${timeframes.timeframes ? Object.entries(timeframes.description).map(([tf, desc]) => `
                            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; text-align: center;">
                                <div style="color: #f115f9; font-weight: bold;">${tf}</div>
                                <div style="color: #94a3b8; font-size: 0.8rem;">${desc}</div>
                            </div>
                        `).join('') : '<div>داده‌ای موجود نیست</div>'}
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">🧪 تست کامل اندپوینت‌ها</h3>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                        <div style="color: #94a3b8; margin-bottom: 10px;">
                            تست ${testResults.summary?.total || 0} اندپوینت - 
                            موفق: ${testResults.summary?.success || 0} - 
                            شکست: ${testResults.summary?.failed || 0} - 
                            نرخ موفقیت: ${testResults.summary?.successRate || '0%'}
                        </div>
                        <a href="/test-all-endpoints" class="btn" target="_blank">مشاهده گزارش کامل تست</a>
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">📡 وضعیت API</h3>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                            <div>WebSocket: <strong style="color: ${apiData.api_status?.websocket?.connected ? '#10b981' : '#ef4444'}">
                                ${apiData.api_status?.websocket?.connected ? 'متصل' : 'قطع'}
                            </strong></div>
                            <div>ارزهای فعال: <strong>${apiData.api_status?.websocket?.active_coins || 0}</strong></div>
                            <div>دیتابیس: <strong>${apiData.api_status?.database?.total_coins || 0} ارز</strong></div>
                            <div>اندپوینت‌ها: <strong>${apiData.api_status?.endpoints_available?.length || 0}</strong></div>
                        </div>
                    </div>
                </div>
            `;

            res.send(generateModernPage("تنظیمات", bodyContent, 'settings'));
        } catch (error) {
            debugSystem.log('ERROR', 'خطا در صفحه تنظیمات', error.message);
            res.status(500).send(generateModernPage("خطا", `
                <div class="header">
                    <h1>❌ خطا در تنظیمات</h1>
                    <p>${error.message}</p>
                </div>
            `, 'settings'));
        }
    });

    // ========== صفحه جزییات کوین ==========
    router.get("/coins/:id/details", async (req, res) => {
        try {
            const { id } = req.params;
            const coinDetails = await apiClient.getCoinDetails(id);
            
            debugSystem.log('COIN_DETAILS', `جزییات ${id}`, {
                success: !!coinDetails,
                price: coinDetails.price,
                change24h: coinDetails.priceChange24h
            });

            const bodyContent = `
                <div class="header">
                    <h1>💰 ${coinDetails.name || id}</h1>
                    <p>جزییات کامل ارز و تحلیل‌های پیشرفته</p>
                </div>

                <div class="glass-card">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">$${coinDetails.price?.toFixed(2) || 'N/A'}</div>
                            <div class="stat-label">قیمت فعلی</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" style="color: ${(coinDetails.priceChange24h || 0) >= 0 ? '#10b981' : '#ef4444'}">
                                ${coinDetails.priceChange24h ? coinDetails.priceChange24h.toFixed(2) + '%' : 'N/A'}
                            </div>
                            <div class="stat-label">تغییر 24h</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">$${(coinDetails.volume / 1000000)?.toFixed(2) || 'N/A'}M</div>
                            <div class="stat-label">حجم معاملات</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${coinDetails.rank || 'N/A'}</div>
                            <div class="stat-label">رتبه بازار</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">📈 تحلیل این ارز</h3>
                    <div style="text-align: center;">
                        <a href="/analysis-page?symbol=${id}" class="btn">تحلیل تکنیکال پیشرفته</a>
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color: #f115f9; margin-bottom: 15px;">🔙 بازگشت</h3>
                    <div style="text-align: center;">
                        <a href="/scan-page" class="btn">بازگشت به اسکن</a>
                    </div>
                </div>
            `;

            res.send(generateModernPage(coinDetails.name || id, bodyContent, 'scan'));
        } catch (error) {
            debugSystem.log('ERROR', `خطا در جزییات ${req.params.id}`, error.message);
            res.status(500).send(generateModernPage("خطا", `
                <div class="header">
                    <h1>❌ خطا در دریافت جزییات</h1>
                    <p>${error.message}</p>
                    <a href="/scan-page" class="btn">بازگشت به اسکن</a>
                </div>
            `, 'scan'));
        }
    });

    return router;
};
