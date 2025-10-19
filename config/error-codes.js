/**
 * کدهای خطای سیستم VortexAI
 */

const ERROR_CODES = {
    // خطاهای شبکه و اتصال
    NETWORK: {
        TIMEOUT: 'NETWORK_TIMEOUT',
        OFFLINE: 'NETWORK_OFFLINE',
        CONNECTION_REFUSED: 'NETWORK_CONNECTION_REFUSED',
        DNS_FAILURE: 'NETWORK_DNS_FAILURE',
        SSL_ERROR: 'NETWORK_SSL_ERROR'
    },

    // خطاهای HTTP
    HTTP: {
        BAD_REQUEST: 'HTTP_400',
        UNAUTHORIZED: 'HTTP_401',
        FORBIDDEN: 'HTTP_403',
        NOT_FOUND: 'HTTP_404',
        METHOD_NOT_ALLOWED: 'HTTP_405',
        RATE_LIMITED: 'HTTP_429',
        INTERNAL_SERVER_ERROR: 'HTTP_500',
        BAD_GATEWAY: 'HTTP_502',
        SERVICE_UNAVAILABLE: 'HTTP_503',
        GATEWAY_TIMEOUT: 'HTTP_504'
    },

    // خطاهای API
    API: {
        INVALID_RESPONSE: 'API_INVALID_RESPONSE',
        MISSING_DATA: 'API_MISSING_DATA',
        INVALID_FORMAT: 'API_INVALID_FORMAT',
        QUOTA_EXCEEDED: 'API_QUOTA_EXCEEDED',
        KEY_INVALID: 'API_KEY_INVALID',
        KEY_EXPIRED: 'API_KEY_EXPIRED'
    },

    // خطاهای اعتبارسنجی
    VALIDATION: {
        INVALID_SYMBOL: 'VALIDATION_INVALID_SYMBOL',
        INVALID_LIMIT: 'VALIDATION_INVALID_LIMIT',
        INVALID_TIMEFRAME: 'VALIDATION_INVALID_TIMEFRAME',
        INVALID_CURRENCY: 'VALIDATION_INVALID_CURRENCY',
        MISSING_REQUIRED_FIELD: 'VALIDATION_MISSING_REQUIRED_FIELD',
        DATA_TYPE_MISMATCH: 'VALIDATION_DATA_TYPE_MISMATCH'
    },

    // خطاهای پردازش داده
    PROCESSING: {
        DATA_PARSING_ERROR: 'PROCESSING_DATA_PARSING_ERROR',
        DATA_TRANSFORMATION_ERROR: 'PROCESSING_DATA_TRANSFORMATION_ERROR',
        CALCULATION_ERROR: 'PROCESSING_CALCULATION_ERROR',
        FORMATTING_ERROR: 'PROCESSING_FORMATTING_ERROR'
    },

    // خطاهای پایگاه داده
    DATABASE: {
        CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
        QUERY_FAILED: 'DATABASE_QUERY_FAILED',
        TIMEOUT: 'DATABASE_TIMEOUT',
        CONSTRAINT_VIOLATION: 'DATABASE_CONSTRAINT_VIOLATION'
    },

    // خطاهای WebSocket
    WEBSOCKET: {
        CONNECTION_FAILED: 'WEBSOCKET_CONNECTION_FAILED',
        DISCONNECTED: 'WEBSOCKET_DISCONNECTED',
        MESSAGE_SEND_FAILED: 'WEBSOCKET_MESSAGE_SEND_FAILED',
        INVALID_MESSAGE: 'WEBSOCKET_INVALID_MESSAGE'
    },

    // خطاهای سیستم
    SYSTEM: {
        OUT_OF_MEMORY: 'SYSTEM_OUT_OF_MEMORY',
        CPU_OVERLOAD: 'SYSTEM_CPU_OVERLOAD',
        DISK_FULL: 'SYSTEM_DISK_FULL',
        SERVICE_UNAVAILABLE: 'SYSTEM_SERVICE_UNAVAILABLE'
    },

    // خطاهای احراز هویت
    AUTH: {
        TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
        TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
        PERMISSION_DENIED: 'AUTH_PERMISSION_DENIED',
        SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED'
    },

    // خطاهای عمومی
    GENERAL: {
        UNKNOWN_ERROR: 'GENERAL_UNKNOWN_ERROR',
        NOT_IMPLEMENTED: 'GENERAL_NOT_IMPLEMENTED',
        MAINTENANCE_MODE: 'GENERAL_MAINTENANCE_MODE',
        CONFIGURATION_ERROR: 'GENERAL_CONFIGURATION_ERROR'
    }
};

/**
 * پیام‌های خطای کاربرپسند
 */
const ERROR_MESSAGES = {
    // فارسی
    fa: {
        [ERROR_CODES.NETWORK.TIMEOUT]: 'زمان درخواست به پایان رسید. لطفاً دوباره تلاش کنید.',
        [ERROR_CODES.NETWORK.OFFLINE]: 'اتصال اینترنت برقرار نیست.',
        [ERROR_CODES.NETWORK.CONNECTION_REFUSED]: 'اتصال به سرور برقرار نشد.',
        
        [ERROR_CODES.HTTP.BAD_REQUEST]: 'درخواست نامعتبر است.',
        [ERROR_CODES.HTTP.UNAUTHORIZED]: 'دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.',
        [ERROR_CODES.HTTP.FORBIDDEN]: 'شما مجوز دسترسی به این منبع را ندارید.',
        [ERROR_CODES.HTTP.NOT_FOUND]: 'منبع درخواستی یافت نشد.',
        [ERROR_CODES.HTTP.RATE_LIMITED]: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.',
        [ERROR_CODES.HTTP.INTERNAL_SERVER_ERROR]: 'خطای داخلی سرور. لطفاً بعداً تلاش کنید.',
        
        [ERROR_CODES.API.INVALID_RESPONSE]: 'پاسخ دریافتی از سرور نامعتبر است.',
        [ERROR_CODES.API.QUOTA_EXCEEDED]: 'محدودیت استفاده از API به پایان رسیده است.',
        [ERROR_CODES.API.KEY_INVALID]: 'کلید API نامعتبر است.',
        
        [ERROR_CODES.VALIDATION.INVALID_SYMBOL]: 'نماد ارز وارد شده نامعتبر است.',
        [ERROR_CODES.VALIDATION.INVALID_LIMIT]: 'تعداد درخواستی باید بین ۱ تا ۳۰۰ باشد.',
        [ERROR_CODES.VALIDATION.INVALID_TIMEFRAME]: 'بازه زمانی انتخاب شده نامعتبر است.',
        
        [ERROR_CODES.WEBSOCKET.CONNECTION_FAILED]: 'اتصال WebSocket برقرار نشد.',
        [ERROR_CODES.WEBSOCKET.DISCONNECTED]: 'اتصال WebSocket قطع شد.',
        
        [ERROR_CODES.SYSTEM.OUT_OF_MEMORY]: 'حافظه سیستم پر شده است.',
        [ERROR_CODES.SYSTEM.CPU_OVERLOAD]: 'سیستم در حال حاضر تحت بار سنگین است.',
        
        [ERROR_CODES.GENERAL.UNKNOWN_ERROR]: 'خطای ناشناخته‌ای رخ داده است.',
        [ERROR_CODES.GENERAL.MAINTENANCE_MODE]: 'سیستم در حال حاضر در حال نگهداری است.'
    },

    // انگلیسی
    en: {
        [ERROR_CODES.NETWORK.TIMEOUT]: 'Request timeout. Please try again.',
        [ERROR_CODES.NETWORK.OFFLINE]: 'No internet connection.',
        [ERROR_CODES.NETWORK.CONNECTION_REFUSED]: 'Connection to server failed.',
        
        [ERROR_CODES.HTTP.BAD_REQUEST]: 'Invalid request.',
        [ERROR_CODES.HTTP.UNAUTHORIZED]: 'Unauthorized access. Please login again.',
        [ERROR_CODES.HTTP.FORBIDDEN]: 'You do not have permission to access this resource.',
        [ERROR_CODES.HTTP.NOT_FOUND]: 'Requested resource not found.',
        [ERROR_CODES.HTTP.RATE_LIMITED]: 'Too many requests. Please wait a moment.',
        [ERROR_CODES.HTTP.INTERNAL_SERVER_ERROR]: 'Internal server error. Please try again later.',
        
        [ERROR_CODES.API.INVALID_RESPONSE]: 'Invalid response from server.',
        [ERROR_CODES.API.QUOTA_EXCEEDED]: 'API quota exceeded.',
        [ERROR_CODES.API.KEY_INVALID]: 'Invalid API key.',
        
        [ERROR_CODES.VALIDATION.INVALID_SYMBOL]: 'Invalid cryptocurrency symbol.',
        [ERROR_CODES.VALIDATION.INVALID_LIMIT]: 'Limit must be between 1 and 300.',
        [ERROR_CODES.VALIDATION.INVALID_TIMEFRAME]: 'Invalid timeframe selected.',
        
        [ERROR_CODES.WEBSOCKET.CONNECTION_FAILED]: 'WebSocket connection failed.',
        [ERROR_CODES.WEBSOCKET.DISCONNECTED]: 'WebSocket connection disconnected.',
        
        [ERROR_CODES.SYSTEM.OUT_OF_MEMORY]: 'System out of memory.',
        [ERROR_CODES.SYSTEM.CPU_OVERLOAD]: 'System is currently under heavy load.',
        
        [ERROR_CODES.GENERAL.UNKNOWN_ERROR]: 'An unknown error occurred.',
        [ERROR_CODES.GENERAL.MAINTENANCE_MODE]: 'System is currently under maintenance.'
    }
};

/**
 * کلاس مدیریت خطاها
 */
class ErrorHandler {
    constructor(language = 'fa') {
        this.language = language;
        this.errorLog = [];
    }

    /**
     * ایجاد خطای استاندارد
     */
    createError(code, details = null, originalError = null) {
        const message = ERROR_MESSAGES[this.language][code] || 
                       ERROR_MESSAGES.en[code] || 
                       'Unknown error';

        const error = {
            code,
            message,
            details,
            timestamp: new Date().toISOString(),
            originalError: originalError ? this.sanitizeError(originalError) : null
        };

        // ذخیره در لاگ
        this.errorLog.push(error);
        
        // حفظ اندازه لاگ
        if (this.errorLog.length > 1000) {
            this.errorLog = this.errorLog.slice(-500);
        }

        return error;
    }

    /**
     * پاکسازی خطا برای نمایش امن
     */
    sanitizeError(error) {
        if (typeof error === 'string') {
            return { message: error.substring(0, 500) };
        }

        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message.substring(0, 500),
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }

        return {
            message: 'Unknown error object',
            original: JSON.stringify(error).substring(0, 500)
        };
    }

    /**
     * بررسی آیا خطا قابل بازیابی است
     */
    isRecoverable(errorCode) {
        const nonRecoverable = [
            ERROR_CODES.NETWORK.OFFLINE,
            ERROR_CODES.HTTP.FORBIDDEN,
            ERROR_CODES.HTTP.NOT_FOUND,
            ERROR_CODES.API.KEY_INVALID,
            ERROR_CODES.AUTH.PERMISSION_DENIED,
            ERROR_CODES.SYSTEM.OUT_OF_MEMORY,
            ERROR_CODES.SYSTEM.DISK_FULL
        ];

        return !nonRecoverable.includes(errorCode);
    }

    /**
     * دریافت پیام خطا بر اساس کد
     */
    getErrorMessage(errorCode) {
        return ERROR_MESSAGES[this.language][errorCode] || 
               ERROR_MESSAGES.en[errorCode] || 
               ERROR_MESSAGES.en[ERROR_CODES.GENERAL.UNKNOWN_ERROR];
    }

    /**
     * لاگ کردن خطا
     */
    logError(error, context = {}) {
        const errorEntry = {
            ...this.createError(
                error.code || ERROR_CODES.GENERAL.UNKNOWN_ERROR,
                error.details,
                error.originalError
            ),
            context,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
            url: typeof window !== 'undefined' ? window.location.href : 'Server'
        };

        console.error('VortexAI Error:', errorEntry);

        // در محیط production می‌توان به سرویس لاگینگ ارسال کرد
        if (process.env.NODE_ENV === 'production') {
            this.sendToLoggingService(errorEntry);
        }

        return errorEntry;
    }

    /**
     * ارسال به سرویس لاگینگ
     */
    async sendToLoggingService(errorEntry) {
        try {
            // اینجا می‌توان به سرویس‌هایی مثل Sentry, LogRocket, etc. متصل شد
            if (typeof window !== 'undefined' && window._sentry) {
                window._sentry.captureException(new Error(errorEntry.message), {
                    extra: errorEntry
                });
            }
        } catch (loggingError) {
            console.warn('Failed to send error to logging service:', loggingError);
        }
    }

    /**
     * دریافت خلاصه خطاها
     */
    getErrorSummary() {
        const summary = {};
        
        this.errorLog.forEach(error => {
            summary[error.code] = (summary[error.code] || 0) + 1;
        });

        return {
            totalErrors: this.errorLog.length,
            summary,
            lastError: this.errorLog[this.errorLog.length - 1] || null
        };
    }

    /**
     * پاک کردن لاگ خطاها
     */
    clearErrorLog() {
        this.errorLog = [];
    }
}

// ایجاد instance جهانی
const errorHandler = new ErrorHandler('fa');

module.exports = {
    ERROR_CODES,
    ERROR_MESSAGES,
    ErrorHandler,
    errorHandler
};
