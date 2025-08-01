/**
 * Logger utility for the Asteroids game
 * Provides different log levels and centralized logging functionality
 */

const LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

class Logger {
    constructor(level = LogLevel.INFO) {
        this.level = level;
        this.logs = [];
        this.maxLogs = 1000;
    }

    /**
     * Set the logging level
     * @param {number} level - The logging level from LogLevel enum
     */
    setLevel(level) {
        this.level = level;
    }

    /**
     * Log an error message
     * @param {string} message - The error message
     * @param {Error} error - Optional error object
     */
    error(message, error = null) {
        if (this.level >= LogLevel.ERROR) {
            const logEntry = this._createLogEntry('ERROR', message, error);
            console.error(`[ERROR] ${message}`, error || '');
            this._addToHistory(logEntry);
        }
    }

    /**
     * Log a warning message
     * @param {string} message - The warning message
     * @param {*} data - Optional additional data
     */
    warn(message, data = null) {
        if (this.level >= LogLevel.WARN) {
            const logEntry = this._createLogEntry('WARN', message, data);
            console.warn(`[WARN] ${message}`, data || '');
            this._addToHistory(logEntry);
        }
    }

    /**
     * Log an info message
     * @param {string} message - The info message
     * @param {*} data - Optional additional data
     */
    info(message, data = null) {
        if (this.level >= LogLevel.INFO) {
            const logEntry = this._createLogEntry('INFO', message, data);
            console.info(`[INFO] ${message}`, data || '');
            this._addToHistory(logEntry);
        }
    }

    /**
     * Log a debug message
     * @param {string} message - The debug message
     * @param {*} data - Optional additional data
     */
    debug(message, data = null) {
        if (this.level >= LogLevel.DEBUG) {
            const logEntry = this._createLogEntry('DEBUG', message, data);
            console.debug(`[DEBUG] ${message}`, data || '');
            this._addToHistory(logEntry);
        }
    }

    /**
     * Create a log entry object
     * @private
     */
    _createLogEntry(level, message, data) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            data
        };
    }

    /**
     * Add log entry to history
     * @private
     */
    _addToHistory(logEntry) {
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    /**
     * Get all logs
     * @returns {Array} Array of log entries
     */
    getLogs() {
        return [...this.logs];
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
    }
}

// Create and export a singleton instance
const logger = new Logger(LogLevel.INFO);

// Export both the class and singleton instance
export { Logger, LogLevel, logger };