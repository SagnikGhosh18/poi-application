const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error({
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    // Default error
    let error = {
        message: 'Internal server error',
        status: 500
    };

    // PostgreSQL errors
    if (err.code === '23505') { // Unique constraint violation
        error.message = 'Resource already exists';
        error.status = 409;
    } else if (err.code === '23503') { // Foreign key constraint violation
        error.message = 'Referenced resource not found';
        error.status = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.status = 401;
    } else if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.status = 401;
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        error.message = err.message;
        error.status = 400;
    }

    res.status(error.status).json({
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;