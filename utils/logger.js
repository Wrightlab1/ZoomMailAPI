/**
 * Import the Winston module for logging.
 */
const winston = require("winston");

/**
 * Import the path module for file paths.
 */
const path = require('path');

/**
 * Define logger configuration.
 * This creates a logger instance with specified log levels, formats, and transports.
 * It logs messages to the console and two separate log files.
 */
const logger = winston.createLogger({
    // Set the logging level to the environment variable LOG_LEVEL or 'info' by default.
    level: process.env.LOG_LEVEL || 'info',
    // Define the format of the log messages.
    format: winston.format.combine(
        // Add a timestamp to each log message.
        winston.format.timestamp(),
        // Print the log level, timestamp, and message in the specified format.
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    // Define the transports (destinations) for log messages.
    transports: [
        // Log to the console.
        new winston.transports.Console(),
        // Log info messages to a file.
        new winston.transports.File({
            name: 'info-file',
            filename: path.join(__dirname, '..', 'logs', 'filelog-info.log'),
            level: 'info',
            // Handle exceptions and format them in a human-readable way.
            handleExceptions: true,
            humanReadableUnhandledException: true
        }),
        // Log error messages to a file.
        new winston.transports.File({
            name: 'error-file',
            filename: path.join(__dirname, '..', 'logs', 'filelog-error.log'),
            level: 'error',
            // Handle exceptions and format them in a human-readable way.
            handleExceptions: true,
            humanReadableUnhandledException: true
        })
    ],
    // Continue logging even if an error occurs.
    exitOnError: false
});

/**
 * Log uncaught exceptions to error file.
 * This logs uncaught exceptions to the console and error file.
 */
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    logger.error('Uncaught Exception:', err);
});

/**
 * Log unhandled rejections to error file.
 * This logs unhandled promise rejections to the console and error file.
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Log unhandled promise as a custom error if it's detected.
    if (reason && reason instanceof Error && reason.promise && reason.promise instanceof Promise) {
        logger.error('Unhandled Rejection: Unhandled Promise Error');
    } else {
        logger.error('Unhandled Rejection:', reason);
    }
});

/**
 * Debug statement to check if file transport is being initialized.
 * This logs a message to the console indicating that the file transport is initialized.
 */
console.log('File transport initialized:', logger.transports.file);

/**
 * Function to log information messages.
 * If the message is an object, it is stringified before logging.
 * This logs messages at the info level.
 * @param {string|Object} message - The message to log.
 */
function logInfo(message) {
    if (typeof message === 'object') {
        message = JSON.stringify(message);
    }
    logger.info(message);
}

/**
 * Function to log debug data.
 * If the data is an object, it is stringified before logging.
 * This logs data at the debug level.
 * @param {string|Object} data - The data to log.
 */
function logDebug(data) {
    if (typeof data === 'object') {
        data = JSON.stringify(data);
    }
    logger.debug(data);
}

/**
 * Function to log error messages.
 * If the error is an object, it is stringified before logging.
 * This logs error messages at the error level.
 * @param {string|Object} error - The error message to log.
 */
function logError(error) {
    if (typeof error === 'object') {
        error = JSON.stringify(error);
    }
    logger.error(error);
}

/**
 * Export the logger and logging functions for use in other modules.
 */
module.exports = { logger, logError, logDebug, logInfo };