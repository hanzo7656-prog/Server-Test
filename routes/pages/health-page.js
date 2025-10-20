const { generateModernPage } = require('../page-generator');

module.exports = (dependencies) => {
    const { apiClient, wsManager } = dependencies;
    
    return async (req, res) => {
        try {
            const content = `
            <div class="content-grid">
                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">❤️</div>
                        <h3>سلامت سیستم</h3>
                    </div>
                    <button class="btn" onclick="checkSystemHealth()">بررسی سلامت</button>
                    <div id="healthResult">
                        <div class="status-indicator">آماده بررسی</div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">📊</div>
                        <h3>آمار لحظه‌ای</h3>
                    </div>
                    <div id="liveStats">
                        <div class="status-indicator">...در حال دریافت</div>
                    </div>
                    <button class="btn" onclick="loadLiveStats()">بروزرسانی</button>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">🔧</div>
                        <h3>کامپوننت‌ها</h3>
                    </div>
                    <div id="componentsStatus">
                        <div class="status-indicator">...در حال بررسی</div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <div class="card-icon">⚡</div>
                        <h3>عملکرد</h3>
                    </div>
                    <div id="performanceStats">
                        <div class="status-indicator">...در حال دریافت</div>
                    </div>
                </div>
            </div>

            <script>
            // توابع کمکی
            function formatRelativeTime(timestamp) {
                if (!timestamp) return 'نامشخص';
                try {
                    const now = new Date();
                    const time = new Date(timestamp);
                    const diffMs = now - time;
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    
                    if (diffMins < 1) return 'همین الان';
                    if (diffMins < 60) return diffMins + ' دقیقه پیش';
                    if (diffHours < 24) return diffHours + ' ساعت پیش';
                    return time.toLocaleString('fa-IR');
                } catch (e) {
                    return 'نامشخص';
                }
            }

            function formatUptime(seconds) {
                if (!seconds || isNaN(seconds)) return 'N/A';
                const days = Math.floor(seconds / 86400);
                const hours = Math.floor((seconds % 86400) / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                if (days > 0) return days + ' روز و ' + hours + ' ساعت';
                if (hours > 0) return hours + ' ساعت ' + minutes + ' دقیقه';
                return minutes + ' دقیقه';
            }

            function setLoading(elementId, isLoading) {
                const element = document.getElementById(elementId);
                if (isLoading) {
                    element.innerHTML = '<div class="status-indicator">🔄 در حال بارگذاری...</div>';
                }
            }

            function handleApiError(error, elementId) {
                console.error('API Error:', error);
                const element = document.getElementById(elementId);
                element.innerHTML = \`
                    <div class="status-indicator error">
                        ❌ خطا در ارتباط: \${error.message}
                        <div style="font-size: 0.7rem; margin-top: 5px; opacity: 0.7;">
                            لطفا اتصال اینترنت را بررسی کرده و مجدد تلاش کنید
                        </div>
                    </div>
                \`;
            }

            // توابع اصلی
            async function checkSystemHealth() {
                setLoading('healthResult', true);
                
                try {
                    console.log('🔍 Starting health check...');
                    const response = await fetch('/api/health/combined');
                    console.log('🔍 Health check response:', { status: response.status, ok: response.ok });
                    
                    if (!response.ok) {
                        throw new Error('خطای شبکه: ' + response.status);
                    }

                    const data = await response.json();
                    console.log('📊 Health data received');
                    
                    if (data.success && data.data) {
                        displayHealthStatus(data.data);
                    } else {
                        throw new Error(data.error || 'خطا در بررسی سلامت سیستم');
                    }
                } catch (error) {
                    console.error('❌ Health check error:', error);
                    handleApiError(error, 'healthResult');
                } finally {
                    setLoading('healthResult', false);
                }
            }

            async function loadLiveStats() {
                setLoading('liveStats', true);
                
                try {
                    console.log('🔍 Loading live stats...');
                    const response = await fetch('/api/system/stats');
                    console.log('🔍 Live stats response:', { status: response.status, ok: response.ok });
                    
                    if (!response.ok) {
                        throw new Error('خطای شبکه: ' + response.status);
                    }

                    const data = await response.json();
                    console.log('📊 Live stats data received');
                    
                    if (data.success && data.data) {
                        displayLiveStats(data.data);
                    } else {
                        throw new Error(data.error || 'خطا در دریافت آمار لحظه‌ای');
                    }
                } catch (error) {
                    console.error('❌ Live stats error:', error);
                    handleApiError(error, 'liveStats');
                } finally {
                    setLoading('liveStats', false);
                }
            }

            function displayHealthStatus(healthData) {
                console.log('📊 Displaying health status:', healthData);
                
                const status = healthData.status || 'unknown';
                const statusColor = status === 'healthy' ? '#10b981' : 
                                  status === 'degraded' ? '#f59e0b' : '#ef4444';
                const statusText = status === 'healthy' ? 'سالم' : 
                                 status === 'degraded' ? 'تضعیف شده' : 'مشکل دار';

                let html = \`
                    <div class="status-indicator" style="border-color: \${statusColor}; color: \${statusColor};">
                        \${status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '❌'} وضعیت سیستم: \${statusText}
                    </div>
                    
                    <div style="margin-top: 15px;">
                        <strong>جزئیات:</strong>
                        <div style="margin-top: 10px;">
                \`;

                // کامپوننت‌ها
                if (healthData.components) {
                    html += \`
                        <div class="metric-grid">
                            <div class="metric-card">
                                <div class="metric-value">\${healthData.components.websocket?.connected ? '✅' : '❌'}</div>
                                <div class="metric-label">WebSocket</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">\${healthData.components.database?.status === 'healthy' ? '✅' : '❌'}</div>
                                <div class="metric-label">دیتابیس</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">\${healthData.components.api?.status === 'healthy' ? '✅' : '❌'}</div>
                                <div class="metric-label">API</div>
                            </div>
                        </div>
                    \`;
                }

                html += \`
                        </div>
                    </div>
                    
                    \${healthData.timestamp ? \`
                        <div style="font-size: 0.7rem; opacity: 0.6; margin-top: 10px;">
                            آخرین بررسی: \${formatRelativeTime(healthData.timestamp)}
                        </div>
                    \` : ''}
                \`;

                document.getElementById('healthResult').innerHTML = html;
                updateComponentsStatus(healthData.components);
                updatePerformanceStats(healthData.performance);
            }

            function displayLiveStats(statsData) {
                console.log('📊 Displaying live stats:', statsData);
                
                const performance = statsData.performance || statsData;
                const systemInfo = statsData.system_info || {};
                
                const html = \`
                    <div class="metric-grid">
                        <div class="metric-card">
                            <div class="metric-value">\${systemInfo.uptime ? formatUptime(systemInfo.uptime) : 'N/A'}</div>
                            <div class="metric-label">زمان فعالیت</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">\${performance.totalRequests || 0}</div>
                            <div class="metric-label">درخواست‌ها</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">\${performance.successRate ? (typeof performance.successRate === 'number' ? performance.successRate.toFixed(1) + '%' : performance.successRate) : '0%'}</div>
                            <div class="metric-label">میزان موفقیت</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">\${systemInfo.memory_usage || 'N/A'}</div>
                            <div class="metric-label">مصرف حافظه</div>
                        </div>
                    </div>
                    \${performance.averageDuration ? \`
                        <div style="margin-top: 10px; font-size: 0.8rem;">
                            <strong>میانگین زمان پاسخ:</strong> \${performance.averageDuration}
                        </div>
                    \` : ''}
                \`;

                document.getElementById('liveStats').innerHTML = html;
            }

            function updateComponentsStatus(components) {
                if (!components) {
                    document.getElementById('componentsStatus').innerHTML = 
                        '<div class="status-indicator warning">داده‌ای برای کامپوننت‌ها موجود نیست</div>';
                    return;
                }

                let html = \`
                    <div style="display: grid; gap: 10px;">
                \`;

                // WebSocket Status
                const wsStatus = components.websocket;
                html += \`
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <span>🔗 WebSocket</span>
                        <span class="status-indicator \${wsStatus?.connected ? '' : 'error'}">
                            \${wsStatus?.connected ? 'متصل (' + (wsStatus.active_coins || wsStatus.activeCoins || 0) + ' ارز)' : 'قطع'}
                        </span>
                    </div>
                \`;

                // Database Status
                const dbStatus = components.database;
                html += \`
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <span>💾 دیتابیس</span>
                        <span class="status-indicator \${dbStatus?.status === 'healthy' ? '' : 'error'}">
                            \${dbStatus?.status === 'healthy' ? 'متصل (' + (dbStatus.stored_coins || dbStatus.storedCoins || 0) + ' ارز)' : dbStatus?.status || 'نامشخص'}
                        </span>
                    </div>
                \`;

                // API Status
                const apiStatus = components.api;
                html += \`
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <span>🌐 API</span>
                        <span class="status-indicator \${apiStatus?.status === 'healthy' ? '' : 'warning'}">
                            \${apiStatus?.status === 'healthy' ? 'سالم (' + (apiStatus.success_rate || apiStatus.successRate || '0%') + ')' : apiStatus?.status || 'نامشخص'}
                        </span>
                    </div>
                \`;

                html += '</div>';
                document.getElementById('componentsStatus').innerHTML = html;
            }

            function updatePerformanceStats(performance) {
                if (!performance) {
                    document.getElementById('performanceStats').innerHTML = 
                        '<div class="status-indicator warning">داده‌ای برای عملکرد موجود نیست</div>';
                    return;
                }

                const html = \`
                    <div class="metric-grid">
                        <div class="metric-card">
                            <div class="metric-value">\${performance.successfulRequests || performance.success_count || 0}</div>
                            <div class="metric-label">درخواست‌های موفق</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">\${performance.errorCount || performance.error_count || 0}</div>
                            <div class="metric-label">خطاها</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">\${performance.endpointCount || performance.endpoint_count || 0}</div>
                            <div class="metric-label">تعداد endpointها</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">\${performance.completedRequests || performance.completed_requests || 0}</div>
                            <div class="metric-label">درخواست‌های کامل</div>
                        </div>
                    </div>
                \`;

                document.getElementById('performanceStats').innerHTML = html;
            }

            // بارگذاری خودکار
            document.addEventListener('DOMContentLoaded', function() {
                console.log('🚀 Health page loaded - starting auto checks');
                setTimeout(() => {
                    checkSystemHealth();
                    loadLiveStats();
                }, 1000);
                
                // بروزرسانی هر 30 ثانیه
                setInterval(() => {
                    loadLiveStats();
                }, 30000);
            });
            </script>`;

            res.send(generateModernPage("سلامت سیستم", content, 'health'));
        } catch (error) {
            console.error('❌ Error in health page route:', error);
            res.status(500).send('خطا در بارگذاری صفحه سلامت سیستم');
        }
    };
};
