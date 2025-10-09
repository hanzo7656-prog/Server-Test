// routes/pages/advanced-analysis.js
const express = require('express');
const router = express.Router();

/**
 * صفحه تحلیل پیشرفته کوین
 */
router.get('/:coinId', async (req, res) => {
    const { coinId } = req.params;
    
    try {
        const apiResponse = await fetch(http://localhost:${process.env.PORT || 3000}/api/advanced/coin/${coinId});
        const advancedData = await apiResponse.json();
        
        res.send(
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Advanced Analysis - ${coinId} - VortexAI</title>
            <style>
                .analysis-sections {
                    display: grid;
                    gap: 25px;
                    margin-top: 25px;
                }

                .analysis-section {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 25px;
                }

                .confidence-meter {
                    width: 100%;
                    height: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    overflow: hidden;
                    margin: 15px 0;
                }

                .confidence-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #00b894, #fdcb6e, #ff6b6b);
                    transition: width 0.5s ease;
                }
            </style>
        </head>
        <body>
            <div class="glass-container">
                <div class="glass-header">
                    <div class="glass-icon">🔬</div>
                    <h2 class="glass-title">Advanced Analysis: ${coinId}</h2>
                    <div class="glass-badge">MULTI-API</div>
                </div>

                ${advancedData.success ? 
                <div class="analysis-sections">
                    <!-- بخش اطمینان -->
                    <div class="analysis-section">
                        <h3>🎯 Confidence Analysis</h3>
                        <div class="confidence-meter">
                            <div class="confidence-fill" style="width: ${advancedData.analysis.vortexai_enhanced.confidence_score}%"></div>
                        </div>
                        <div class="market-stats">
                            <div class="stat-item">
                                <div class="stat-label">Confidence Score</div>
                                <div class="stat-value">${advancedData.analysis.vortexai_enhanced.confidence_score}%</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Risk Level</div>
                                <div class="stat-value">${advancedData.analysis.vortexai_enhanced.risk_level}</div>
                            </div>
                        </div>
                    </div>

                    <!-- بخش تاریخی -->
                    <div class="analysis-section">
                        <h3>📅 Historical Performance</h3>
                        <!-- داده‌های تاریخی -->
                    </div>

                    <!-- بخش صرافی -->
                    <div class="analysis-section">
                        <h3>🏪 Exchange Analysis</h3>
                        <!-- داده‌های صرافی -->
                    </div>
                </div>
                 : '<div class="error-message">Error loading advanced analysis</div>'}
            </div>
        </body>
        </html>
        );
    } catch (error) {
        res.status(500).send('Error loading advanced analysis page');
    }
});

module.exports = router;
