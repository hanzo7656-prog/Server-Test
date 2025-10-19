const { generateModernPage } = require('../page-generator');
const DataProcessor = require('../../models/DataProcessor');

module.exports = (dependencies) => {
    const { apiClient } = dependencies;
    
    return async (req, res) => {
        const content = `
        <div class="content-card">
            <div class="card-header">
                <div class="card-icon">📰</div>
                <h3>اخبار کریپتو</h3>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0;">
                <button class="btn" onclick="loadNews('latest')">آخرین اخبار</button>
                <button class="btn" onclick="loadNews('trending')">ترندینگ</button>
                <button class="btn" onclick="loadNews('handpicked')">منتخب سردبیر</button>
                <button class="btn" onclick="loadNews('bullish')">اخبار صعودی</button>
                <button class="btn" onclick="loadNews('bearish')">اخبار نزولی</button>
                <button class="btn" onclick="loadNewsSources()">منابع خبری</button>
            </div>

            <div id="newsResult">
                <div class="status-indicator">دسته‌بندی مورد نظر را انتخاب کنید</div>
            </div>
        </div>

        <script>
        async function loadNews(type = 'latest') {
            setLoading('newsResult', true);
            
            try {
                let endpoint = '/api/news';
                const typeMap = {
                    'latest': '/api/news/latest',
                    'trending': '/api/news/trending',
                    'handpicked': '/api/news/handpicked',
                    'bullish': '/api/news/bullish',
                    'bearish': '/api/news/bearish'
                };
                
                if (typeMap[type]) {
                    endpoint = typeMap[type];
                }

                const response = await fetch(endpoint + '?limit=20');
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                
                if (data.success && data.data) {
                    displayNews(data.data, type);
                } else {
                    throw new Error(data.error || 'خطا در دریافت اخبار');
                }
            } catch (error) {
                handleApiError(error, 'newsResult');
            } finally {
                setLoading('newsResult', false);
            }
        }

        async function loadNewsSources() {
            setLoading('newsResult', true);
            
            try {
                const response = await fetch('/api/news/sources');
                if (!response.ok) throw new Error('خطای شبکه: ' + response.status);

                const data = await response.json();
                
                if (data.success && data.data) {
                    displayNewsSources(data.data);
                } else {
                    throw new Error(data.error || 'خطا در دریافت منابع خبری');
                }
            } catch (error) {
                handleApiError(error, 'newsResult');
            } finally {
                setLoading('newsResult', false);
            }
        }

        function displayNews(newsItems, type) {
            if (!newsItems || newsItems.length === 0) {
                document.getElementById('newsResult').innerHTML = 
                    '<div class="status-indicator warning">هیچ خبری یافت نشد</div>';
                return;
            }

            const typeNames = {
                'latest': 'آخرین اخبار',
                'trending': 'خبرهای ترندینگ',
                'handpicked': 'منتخب سردبیر',
                'bullish': 'اخبار صعودی',
                'bearish': 'اخبار نزولی'
            };

            let html = \`
                <div class="status-indicator">\${typeNames[type] || 'اخبار'} - \${newsItems.length} مورد</div>
                <div class="news-grid">
            \`;

            newsItems.forEach(news => {
                const hasImage = news.image || news.imgUrl;
                const title = news.title || 'بدون عنوان';
                const description = news.description || 'بدون توضیحات';
                const source = news.source || 'منبع نامشخص';
                const date = news.date || news.feedDate || news.publishedAt;
                
                html += \`
                    <div class="news-item">
                        <div class="news-image">
                            \${hasImage ? 
                                \`<img src="\${news.image || news.imgUrl}" alt="\${title}" onerror="this.style.display='none'" />\` : 
                                \`<div class="no-image">📰</div>\`
                            }
                        </div>
                        <div class="news-content">
                            <h4>\${title}</h4>
                            <p>\${description.length > 150 ? description.substring(0, 150) + '...' : description}</p>
                            <div class="news-meta">
                                <span>\${source}</span>
                                <span>\${formatRelativeTime(date)}</span>
                            </div>
                            \${news.url || news.link ? 
                                \`<a href="\${news.url || news.link}" target="_blank" class="news-link">مشاهده کامل خبر →</a>\` : 
                                ''
                            }
                            \${news.relatedCoins && news.relatedCoins.length > 0 ? 
                                \`<div style="margin-top: 8px; font-size: 0.7rem; opacity: 0.7;">
                                    ارزهای مرتبط: \${news.relatedCoins.join(', ')}
                                </div>\` : 
                                ''
                            }
                        </div>
                    </div>
                \`;
            });

            html += '</div>';
            document.getElementById('newsResult').innerHTML = html;
        }

        function displayNewsSources(sources) {
            if (!sources || sources.length === 0) {
                document.getElementById('newsResult').innerHTML = 
                    '<div class="status-indicator warning">هیچ منبع خبری یافت نشد</div>';
                return;
            }

            let html = \`
                <div class="status-indicator">منابع خبری - \${sources.length} منبع</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
            \`;

            sources.forEach(source => {
                html += \`
                    <div class="content-card" style="text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">📡</div>
                        <strong>\${source.name || 'منبع نامشخص'}</strong>
                        \${source.url ? \`
                            <div style="margin-top: 8px;">
                                <a href="\${source.url}" target="_blank" style="color: #667eea; font-size: 0.8rem;">مشاهده سایت</a>
                            </div>
                        \` : ''}
                        \${source.description ? \`
                            <div style="margin-top: 8px; font-size: 0.7rem; opacity: 0.7;">
                                \${source.description}
                            </div>
                        \` : ''}
                    </div>
                \`;
            });

            html += '</div>';
            document.getElementById('newsResult').innerHTML = html;
        }

        // بارگذاری خودکار آخرین اخبار
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                loadNews('latest');
            }, 500);
        });
        </script>`;

        res.send(generateModernPage("اخبار کریپتو", content, 'news'));
    };
};
