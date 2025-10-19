const express = require('express');
const router = express.Router();

const { generateModernPage } = require('./page-generator');

// Import page modules
const homePage = require('./pages/home-page');
const scanPage = require('./pages/scan-page');
const analysisPage = require('./pages/analysis-page');
const marketsPage = require('./pages/markets-page');
const insightsPage = require('./pages/insights-page');
const newsPage = require('./pages/news-page');
const healthPage = require('./pages/health-page');
const settingsPage = require('./pages/settings-page');

module.exports = (dependencies) => {
    const { gistManager, wsManager, apiClient } = dependencies;

    // Register all pages
    router.get("/", homePage(dependencies));
    router.get("/scan-page", scanPage(dependencies));
    router.get("/analysis-page", analysisPage(dependencies));
    router.get("/markets-page", marketsPage(dependencies));
    router.get("/insights-page", insightsPage(dependencies));
    router.get("/news-page", newsPage(dependencies));
    router.get("/health-page", healthPage(dependencies));
    router.get("/settings", settingsPage(dependencies));

    return router;
};
