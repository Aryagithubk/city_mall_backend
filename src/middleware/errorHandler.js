const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;