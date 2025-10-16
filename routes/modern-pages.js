// routes/modern-pages-simple.js
const express = require('express');
const router = express.Router();

function generateClassNavigation() {
    return '<div>Navigation</div>';
}

function generateModernPage(title, content) {
    return `
    <html>
        <body>
            <h1>${title}</h1>
            ${content}
            ${generateClassNavigation()}
        </body>
    </html>
    `;
}

router.get('/', (req, res) => {
    res.send(generateModernPage('Home', '<p>Welcome</p>'));
});

router.get('/scan', (req, res) => {
    res.send(generateModernPage('Scan', '<p>Scan Page</p>'));
});

module.exports = () => router;
