const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return ${timestamp} - ${level.toUpperCase()} - ${message};
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'vortexai_combined.log' }),
        new winston.transports.Console()
    ]
});

module.exports = logger;
