const AppError = require('../../utils/appError');
const { 
  handleValidationErrorDB, 
  handleDuplicateFieldsDB 
} = require('./schemaValidationErrors');

const handleCastErrorDB = err => new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleJWTError = () => new AppError('Invalid token.', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const handle = (err, req, res, withStack) => {
  if (req.originalUrl.startsWith('/api')) {
    if(err.statusCode === 422){
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errors: err.errors,
        stack: withStack ? err.stack : ''
      });
    }
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: withStack ? err.stack : ''
    });
  }

  return res.status(err.statusCode).json({
    status: err.status,
    message: 'Something went wrong! Please try again later.'
  });
};

module.exports = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError')         error = handleCastErrorDB(error);
  if (err.code === 11000)               error = handleDuplicateFieldsDB(error);
  if (err.name === 'ValidationError')   error = handleValidationErrorDB(error);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development') {
    handle(error, req, res, true);
  } else {
    handle(error, req, res, false);
  }

  return next(error)
};

